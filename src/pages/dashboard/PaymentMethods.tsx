import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CreditCard, 
  Smartphone,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { requireMerchant } from '@/lib/auth-utils';
import { z } from 'zod';
import { MpesaDarajaSetup } from '@/components/dashboard/MpesaDarajaSetup';

interface PaymentMethods {
  mpesa_paybill: string | null;
  mpesa_till: string | null;
  airtel_money: string | null;
  enable_cards: boolean;
  bank_name: string | null;
  bank_account_number: string | null;
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

// Payment provider logos from the carousel
const paymentProviders = [
  {
    name: 'M-Pesa',
    logo: '/lovable-uploads/57976727-1964-4bfb-8a24-8203e4dabe4a.png',
    alt: 'M-Pesa mobile money payment system logo'
  },
  {
    name: 'Airtel Money',
    logo: '/lovable-uploads/2d04d732-18aa-40b1-ad81-3c1f3310fb0a.png',
    alt: 'Airtel Money mobile payment service logo'
  },
  {
    name: 'Visa & Mastercard',
    logo: '/lovable-uploads/9f22c927-5c7d-4a77-a269-90809c6e582a.png',
    alt: 'Visa and Mastercard payment cards logo'
  }
];

const PaymentMethods = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethods>({
    mpesa_paybill: null,
    mpesa_till: null,
    airtel_money: null,
    enable_cards: false,
    bank_name: null,
    bank_account_number: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate('/auth');
        return;
      }

      const hasAccess = await requireMerchant(navigate);
      if (!hasAccess) {
        return;
      }

      fetchPaymentMethods();
    };

    checkAccess();
  }, [navigate]);

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
          mpesa_paybill: data.mpesa_paybill,
          mpesa_till: data.mpesa_till,
          airtel_money: data.airtel_money,
          enable_cards: data.enable_cards || false,
          bank_name: data.bank_name,
          bank_account_number: data.bank_account_number,
        });
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      toast({
        title: 'Error',
        description: 'Failed to load payment methods',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMethod = async (method: 'mpesa_paybill' | 'mpesa_till' | 'airtel_money' | 'enable_cards' | 'bank') => {
    setErrors({});
    setSaving(method);

    try {
      const value = paymentMethods[method as keyof PaymentMethods];
      
      // Validate input for non-card and non-bank methods
      if (method !== 'enable_cards' && method !== 'bank' && value) {
        let validationResult;
        
        if (method === 'mpesa_paybill') {
          validationResult = paybillSchema.safeParse(value);
        } else if (method === 'mpesa_till') {
          validationResult = tillSchema.safeParse(value);
        } else if (method === 'airtel_money') {
          validationResult = airtelSchema.safeParse(value);
        }
        
        if (validationResult && !validationResult.success) {
          setErrors({ [method]: validationResult.error.errors[0].message });
          setSaving(null);
          return;
        }
      }

      // Validate bank details
      if (method === 'bank') {
        if (!paymentMethods.bank_name) {
          setErrors({ bank: 'Please select a bank' });
          setSaving(null);
          return;
        }
        if (!paymentMethods.bank_account_number || paymentMethods.bank_account_number.trim().length < 5) {
          setErrors({ bank: 'Please enter a valid account number' });
          setSaving(null);
          return;
        }
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let updateData: any = { user_id: user.id };
      
      if (method === 'bank') {
        updateData.bank_name = paymentMethods.bank_name || null;
        updateData.bank_account_number = paymentMethods.bank_account_number || null;
      } else {
        updateData[method] = value || null;
      }

      const { error } = await supabase
        .from('payment_methods')
        .upsert(updateData);

      if (error) throw error;

      toast({
        title: "Payment Method Updated",
        description: `${method.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} has been configured successfully.`,
      });

      fetchPaymentMethods();
    } catch (error) {
      console.error('Error updating payment method:', error);
      toast({
        title: "Error",
        description: "Failed to update payment method. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading payment methods...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex w-full">
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <DashboardSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileMenuOpen={mobileMenuOpen}
        onMobileMenuClose={() => setMobileMenuOpen(false)}
      />

      <main
        className={cn(
          'flex-1 transition-all duration-300 w-full',
          'ml-0 lg:ml-20',
          !sidebarCollapsed && 'lg:ml-64'
        )}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
          <div className="flex items-center justify-between h-16 px-4 lg:px-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(true)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </Button>
              <div>
                <h1 className="text-lg lg:text-xl font-bold text-foreground">Payment Methods</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Configure how you receive payments
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 lg:p-6 max-w-7xl mx-auto">
          {/* Payment Provider Logos */}
          <Card className="border border-border mb-6">
            <CardHeader>
              <CardTitle className="text-base lg:text-lg">Supported Payment Methods</CardTitle>
              <CardDescription className="text-xs lg:text-sm">
                We support the following payment providers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 lg:gap-6 justify-center lg:justify-start">
                {paymentProviders.map((provider) => (
                  <div key={provider.name} className="flex items-center justify-center p-2 lg:p-3 bg-muted/30 rounded-lg">
                    <img
                      src={provider.logo}
                      alt={provider.alt}
                      className="h-8 lg:h-10 w-auto object-contain"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* M-PESA Paybill */}
          <Card className="border border-border mb-6">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <img
                      src={paymentProviders[0].logo}
                      alt="M-Pesa"
                      className="h-6 lg:h-8 w-auto object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base lg:text-lg">M-Pesa Paybill</CardTitle>
                    <CardDescription className="text-xs lg:text-sm">
                      Configure your M-Pesa Paybill number
                    </CardDescription>
                  </div>
                </div>
                <Badge variant={paymentMethods.mpesa_paybill ? "default" : "secondary"} className="shrink-0 text-xs">
                  {paymentMethods.mpesa_paybill ? (
                    <><CheckCircle2 className="w-3 h-3 mr-1" /> Active</>
                  ) : (
                    <><XCircle className="w-3 h-3 mr-1" /> Inactive</>
                  )}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="mpesa_paybill" className="text-sm">Paybill Number</Label>
                  <Input
                    id="mpesa_paybill"
                    placeholder="e.g., 123456"
                    value={paymentMethods.mpesa_paybill || ''}
                    onChange={(e) => {
                      setPaymentMethods(prev => ({ ...prev, mpesa_paybill: e.target.value }));
                      setErrors(prev => ({ ...prev, mpesa_paybill: '' }));
                    }}
                    className={cn("text-sm", errors.mpesa_paybill && 'border-destructive')}
                  />
                  {errors.mpesa_paybill && (
                    <p className="text-xs text-destructive mt-1">{errors.mpesa_paybill}</p>
                  )}
                </div>
                <Button 
                  onClick={() => handleSaveMethod('mpesa_paybill')}
                  disabled={saving === 'mpesa_paybill'}
                  className="w-full sm:w-auto"
                  size="sm"
                >
                  {saving === 'mpesa_paybill' ? 'Saving...' : 'Save Paybill'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* M-PESA Till */}
          <Card className="border border-border mb-6">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <img
                      src={paymentProviders[0].logo}
                      alt="M-Pesa"
                      className="h-6 lg:h-8 w-auto object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base lg:text-lg">M-Pesa Till</CardTitle>
                    <CardDescription className="text-xs lg:text-sm">
                      Configure your M-Pesa Till number
                    </CardDescription>
                  </div>
                </div>
                <Badge variant={paymentMethods.mpesa_till ? "default" : "secondary"} className="shrink-0 text-xs">
                  {paymentMethods.mpesa_till ? (
                    <><CheckCircle2 className="w-3 h-3 mr-1" /> Active</>
                  ) : (
                    <><XCircle className="w-3 h-3 mr-1" /> Inactive</>
                  )}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="mpesa_till" className="text-sm">Till Number</Label>
                  <Input
                    id="mpesa_till"
                    placeholder="e.g., 123456"
                    value={paymentMethods.mpesa_till || ''}
                    onChange={(e) => {
                      setPaymentMethods(prev => ({ ...prev, mpesa_till: e.target.value }));
                      setErrors(prev => ({ ...prev, mpesa_till: '' }));
                    }}
                    className={cn("text-sm", errors.mpesa_till && 'border-destructive')}
                  />
                  {errors.mpesa_till && (
                    <p className="text-xs text-destructive mt-1">{errors.mpesa_till}</p>
                  )}
                </div>
                <Button 
                  onClick={() => handleSaveMethod('mpesa_till')}
                  disabled={saving === 'mpesa_till'}
                  className="w-full sm:w-auto"
                  size="sm"
                >
                  {saving === 'mpesa_till' ? 'Saving...' : 'Save Till'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Airtel Money */}
          <Card className="border border-border mb-6">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <img
                      src={paymentProviders[1].logo}
                      alt="Airtel Money"
                      className="h-6 lg:h-8 w-auto object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base lg:text-lg">Airtel Money</CardTitle>
                    <CardDescription className="text-xs lg:text-sm">
                      Configure your Airtel Money number
                    </CardDescription>
                  </div>
                </div>
                <Badge variant={paymentMethods.airtel_money ? "default" : "secondary"} className="shrink-0 text-xs">
                  {paymentMethods.airtel_money ? (
                    <><CheckCircle2 className="w-3 h-3 mr-1" /> Active</>
                  ) : (
                    <><XCircle className="w-3 h-3 mr-1" /> Inactive</>
                  )}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="airtel_money" className="text-sm">Airtel Money Number</Label>
                  <Input
                    id="airtel_money"
                    placeholder="e.g., 254701234567"
                    value={paymentMethods.airtel_money || ''}
                    onChange={(e) => {
                      setPaymentMethods(prev => ({ ...prev, airtel_money: e.target.value }));
                      setErrors(prev => ({ ...prev, airtel_money: '' }));
                    }}
                    className={cn("text-sm", errors.airtel_money && 'border-destructive')}
                  />
                  {errors.airtel_money && (
                    <p className="text-xs text-destructive mt-1">{errors.airtel_money}</p>
                  )}
                </div>
                <Button 
                  onClick={() => handleSaveMethod('airtel_money')}
                  disabled={saving === 'airtel_money'}
                  className="w-full sm:w-auto"
                  size="sm"
                >
                  {saving === 'airtel_money' ? 'Saving...' : 'Save Airtel Money'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Bank Settlement */}
          <Card className="border border-border mb-6">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base lg:text-lg">Bank Account</CardTitle>
                    <CardDescription className="text-xs lg:text-sm">
                      Configure your bank account for settlements
                    </CardDescription>
                  </div>
                </div>
                <Badge variant={paymentMethods.bank_name && paymentMethods.bank_account_number ? "default" : "secondary"} className="shrink-0 text-xs">
                  {paymentMethods.bank_name && paymentMethods.bank_account_number ? (
                    <><CheckCircle2 className="w-3 h-3 mr-1" /> Active</>
                  ) : (
                    <><XCircle className="w-3 h-3 mr-1" /> Inactive</>
                  )}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="bank_name" className="text-sm">Bank Name</Label>
                  <Select
                    value={paymentMethods.bank_name || ''}
                    onValueChange={(value) => {
                      setPaymentMethods(prev => ({ ...prev, bank_name: value }));
                      setErrors(prev => ({ ...prev, bank: '' }));
                    }}
                  >
                    <SelectTrigger className={cn("text-sm", errors.bank && 'border-destructive')}>
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
                  <Label htmlFor="bank_account" className="text-sm">Account Number</Label>
                  <Input
                    id="bank_account"
                    placeholder="Enter your account number"
                    value={paymentMethods.bank_account_number || ''}
                    onChange={(e) => {
                      setPaymentMethods(prev => ({ ...prev, bank_account_number: e.target.value }));
                      setErrors(prev => ({ ...prev, bank: '' }));
                    }}
                    className={cn("text-sm", errors.bank && 'border-destructive')}
                  />
                  {errors.bank && (
                    <p className="text-xs text-destructive mt-1">{errors.bank}</p>
                  )}
                </div>
                <Button 
                  onClick={() => handleSaveMethod('bank')}
                  disabled={saving === 'bank'}
                  className="w-full sm:w-auto"
                  size="sm"
                >
                  {saving === 'bank' ? 'Saving...' : 'Save Bank Details'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* M-Pesa Daraja API Setup */}
          <div className="mb-6">
            <MpesaDarajaSetup />
          </div>

          {/* Card Payments */}
          <Card className="border border-border">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <img
                      src={paymentProviders[2].logo}
                      alt="Card Payments"
                      className="h-6 lg:h-8 w-auto object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base lg:text-lg">Card Payments</CardTitle>
                    <CardDescription className="text-xs lg:text-sm">
                      Enable or disable card payment processing
                    </CardDescription>
                  </div>
                </div>
                <Badge variant={paymentMethods.enable_cards ? "default" : "secondary"} className="shrink-0 text-xs">
                  {paymentMethods.enable_cards ? (
                    <><CheckCircle2 className="w-3 h-3 mr-1" /> Active</>
                  ) : (
                    <><XCircle className="w-3 h-3 mr-1" /> Inactive</>
                  )}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div>
                  <Label htmlFor="enableCards" className="text-sm font-medium">Enable Card Payments</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Allow customers to pay with credit/debit cards
                  </p>
                </div>
                <Switch
                  id="enableCards"
                  checked={paymentMethods.enable_cards}
                  onCheckedChange={(checked) => {
                    setPaymentMethods(prev => ({ ...prev, enable_cards: checked }));
                    handleSaveMethod('enable_cards');
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default PaymentMethods;
