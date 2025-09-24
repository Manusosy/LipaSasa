import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { CreditCard } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface PaymentMethodsDialogProps {
  onPaymentMethodsUpdated: () => void;
}

interface PaymentMethods {
  mpesa_paybill: string;
  mpesa_till: string;
  airtel_money: string;
  enable_cards: boolean;
}

export const PaymentMethodsDialog: React.FC<PaymentMethodsDialogProps> = ({ onPaymentMethodsUpdated }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethods>({
    mpesa_paybill: '',
    mpesa_till: '',
    airtel_money: '',
    enable_cards: false
  });
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
          enable_cards: data.enable_cards || false
        });
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('payment_methods')
        .upsert({
          user_id: user.id,
          mpesa_paybill: paymentMethods.mpesa_paybill || null,
          mpesa_till: paymentMethods.mpesa_till || null,
          airtel_money: paymentMethods.airtel_money || null,
          enable_cards: paymentMethods.enable_cards
        });

      if (error) throw error;

      toast({
        title: "Payment Methods Updated",
        description: "Your payment methods have been saved successfully.",
      });

      onPaymentMethodsUpdated();
      setOpen(false);
    } catch (error) {
      console.error('Error updating payment methods:', error);
      toast({
        title: "Error",
        description: "Failed to update payment methods. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <CreditCard className="w-4 h-4 mr-2" />
          Manage Payment Methods
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Payment Methods</DialogTitle>
          <DialogDescription>
            Configure your payment methods to receive money from customers
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="mpesaPaybill">M-Pesa Paybill Number</Label>
            <Input
              id="mpesaPaybill"
              placeholder="e.g., 123456"
              value={paymentMethods.mpesa_paybill}
              onChange={(e) => setPaymentMethods(prev => ({ ...prev, mpesa_paybill: e.target.value }))}
            />
          </div>
          
          <div>
            <Label htmlFor="mpesaTill">M-Pesa Till Number</Label>
            <Input
              id="mpesaTill"
              placeholder="e.g., 123456"
              value={paymentMethods.mpesa_till}
              onChange={(e) => setPaymentMethods(prev => ({ ...prev, mpesa_till: e.target.value }))}
            />
          </div>
          
          <div>
            <Label htmlFor="airtelMoney">Airtel Money Number</Label>
            <Input
              id="airtelMoney"
              placeholder="e.g., 254701234567"
              value={paymentMethods.airtel_money}
              onChange={(e) => setPaymentMethods(prev => ({ ...prev, airtel_money: e.target.value }))}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enableCards">Enable Card Payments</Label>
              <p className="text-sm text-muted-foreground">Allow customers to pay with credit/debit cards</p>
            </div>
            <Switch
              id="enableCards"
              checked={paymentMethods.enable_cards}
              onCheckedChange={(checked) => setPaymentMethods(prev => ({ ...prev, enable_cards: checked }))}
            />
          </div>
          
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};