import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { CreditCard, Edit2, Check } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { z } from 'zod';
import { cn } from '@/lib/utils';

type PaymentMethodType = 'paybill' | 'till' | 'airtel' | 'bank';

interface PaymentMethodsDialogProps {
  onPaymentMethodsUpdated: () => void;
  method: PaymentMethodType;
}

interface PaymentMethods {
  mpesa_paybill: string;
  mpesa_till: string;
  airtel_money: string;
  enable_cards: boolean;
  bank_name: string;
  bank_account_number: string;
}

const paybillSchema = z.string().regex(/^\d+$/, { message: "Please enter numbers only" }).min(1, { message: "This field is required" });
const tillSchema = z.string().regex(/^\d+$/, { message: "Please enter numbers only" }).min(1, { message: "This field is required" });
const airtelSchema = z.string().regex(/^\d+$/, { message: "Please enter numbers only (e.g., 254701234567)" }).min(12, { message: "Please enter a valid phone number" }).max(12, { message: "Phone number must be 12 digits" });

const KENYA_BANKS = [
  'Equity Bank',
  'KCB',
  'NCBA',
  'Co-operative Bank',
  'ABSA',
  'Stanbic',
  'DTB',
  'Standard Chartered',
  'Barclays',
  'Family Bank',
  'I&M Bank',
];

const methodConfig = {
  paybill: {
    title: 'M-Pesa Paybill Setup',
    description: 'Configure your M-Pesa Paybill number to receive payments',
    field: 'mpesa_paybill' as const,
    label: 'M-Pesa Paybill Number',
    placeholder: 'e.g., 123456'
  },
  till: {
    title: 'M-Pesa Till Setup',
    description: 'Configure your M-Pesa Till number to receive payments',
    field: 'mpesa_till' as const,
    label: 'M-Pesa Till Number',
    placeholder: 'e.g., 123456'
  },
  airtel: {
    title: 'Airtel Money Setup',
    description: 'Configure your Airtel Money number to receive payments',
    field: 'airtel_money' as const,
    label: 'Airtel Money Number',
    placeholder: 'e.g., 254701234567'
  },
  bank: {
    title: 'Bank Account Setup',
    description: 'Configure your bank account for settlements',
    field: 'bank_account_number' as const,
    label: 'Bank Account',
    placeholder: ''
  }
};

export const PaymentMethodsDialog: React.FC<PaymentMethodsDialogProps & { children?: React.ReactNode }> = ({ onPaymentMethodsUpdated, method, children }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethods>({
    mpesa_paybill: '',
    mpesa_till: '',
    airtel_money: '',
    enable_cards: false,
    bank_name: '',
    bank_account_number: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchPaymentMethods();
    }
  }, [open]);

  const fetchPaymentMethods = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching payment methods:', error);
        return;
      }

      if (data) {
        setPaymentMethods({
          mpesa_paybill: data.mpesa_paybill || '',
          mpesa_till: data.mpesa_till || '',
          airtel_money: data.airtel_money || '',
          enable_cards: data.enable_cards || false,
          bank_name: data.bank_name || '',
          bank_account_number: data.bank_account_number || '',
        });

        // Check if method is already configured
        if (method === 'bank') {
          setIsEditing(!data.bank_name || !data.bank_account_number);
        } else if (method !== 'cards') {
          const fieldValue = data[methodConfig[method].field];
          setIsEditing(!fieldValue);
        }
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const config = methodConfig[method];
      
      // Validate bank details
      if (method === 'bank') {
        if (!paymentMethods.bank_name) {
          setErrors({ bank: 'Please select a bank' });
          setLoading(false);
          return;
        }
        if (!paymentMethods.bank_account_number || paymentMethods.bank_account_number.trim().length < 5) {
          setErrors({ bank: 'Please enter a valid account number' });
          setLoading(false);
          return;
        }
      } else {
        // Validate input for non-bank methods
        const value = (paymentMethods as any)[config.field];
        let validationResult;
        
        if (method === 'paybill') {
          validationResult = paybillSchema.safeParse(value);
        } else if (method === 'till') {
          validationResult = tillSchema.safeParse(value);
        } else if (method === 'airtel') {
          validationResult = airtelSchema.safeParse(value);
        }
        
        if (validationResult && !validationResult.success) {
          setErrors({ [method]: validationResult.error.errors[0].message });
          setLoading(false);
          return;
        }
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Update the specific field(s) for this method
      const updateData: any = { user_id: user.id };
      
      if (method === 'bank') {
        updateData.bank_name = paymentMethods.bank_name || null;
        updateData.bank_account_number = paymentMethods.bank_account_number || null;
      } else {
        updateData[config.field] = (paymentMethods as any)[config.field] || null;
      }

      const { error } = await supabase
        .from('payment_methods')
        .upsert(updateData, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Upsert error:', error);
        throw error;
      }

      toast({
        title: "Payment Method Updated",
        description: `${config.title.replace(' Setup', '')} has been configured successfully.`,
      });

      setIsEditing(false);
      onPaymentMethodsUpdated();
    } catch (error) {
      console.error('Error updating payment method:', error);
      toast({
        title: "Error",
        description: "Failed to update payment method. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleClose = () => {
    setOpen(false);
    setIsEditing(true);
    setErrors({});
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm" className="w-full">
            <CreditCard className="w-4 h-4 mr-2" />
            Manage Payment Methods
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>{methodConfig[method].title}</DialogTitle>
              <DialogDescription>
                {methodConfig[method].description}
              </DialogDescription>
            </div>
            {!isEditing && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                className="h-8 w-8 p-0"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {method === 'bank' ? (
            <>
              <div>
                <Label htmlFor="bank_name">Bank Name</Label>
                <Select
                  value={paymentMethods.bank_name || ''}
                  onValueChange={(value) => {
                    setPaymentMethods(prev => ({ ...prev, bank_name: value }));
                    setErrors(prev => ({ ...prev, bank: '' }));
                  }}
                  disabled={!isEditing}
                >
                  <SelectTrigger className={cn("mt-1", errors.bank && 'border-destructive', !isEditing && 'bg-muted')}>
                    <SelectValue placeholder="Select your bank" />
                  </SelectTrigger>
                  <SelectContent>
                    {KENYA_BANKS.map((bank) => (
                      <SelectItem key={bank} value={bank}>
                        {bank}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="bank_account">Account Number</Label>
                <Input
                  id="bank_account"
                  placeholder="Enter your account number"
                  value={paymentMethods.bank_account_number || ''}
                  onChange={(e) => {
                    setPaymentMethods(prev => ({ ...prev, bank_account_number: e.target.value }));
                    setErrors(prev => ({ ...prev, bank: '' }));
                  }}
                  className={cn("mt-1", errors.bank && 'border-destructive', !isEditing && 'bg-muted')}
                  disabled={!isEditing}
                  readOnly={!isEditing}
                />
                {errors.bank && (
                  <p className="text-sm text-destructive mt-1">{errors.bank}</p>
                )}
              </div>
            </>
          ) : (
            <div>
              <Label htmlFor={method}>{methodConfig[method].label}</Label>
              <Input
                id={method}
                placeholder={methodConfig[method].placeholder}
                value={(paymentMethods as any)[methodConfig[method].field] || ''}
                onChange={(e) => {
                  setPaymentMethods(prev => ({ 
                    ...prev, 
                    [methodConfig[method].field]: e.target.value 
                  }));
                  setErrors(prev => ({ ...prev, [method]: '' }));
                }}
                className={cn("mt-1", errors[method] && 'border-destructive', !isEditing && 'bg-muted')}
                disabled={!isEditing}
                readOnly={!isEditing}
              />
              {errors[method] && (
                <p className="text-sm text-destructive mt-1">{errors[method]}</p>
              )}
            </div>
          )}
          
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              {isEditing ? 'Cancel' : 'Close'}
            </Button>
            {isEditing && (
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (
                  'Saving...'
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Save
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
