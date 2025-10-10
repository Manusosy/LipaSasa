import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Copy, Check } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { createInvoiceSchema } from '@/lib/validations';

interface CreateInvoiceDialogProps {
  onInvoiceCreated: () => void;
}

export const CreateInvoiceDialog: React.FC<CreateInvoiceDialogProps> = ({ onInvoiceCreated }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentLink, setPaymentLink] = useState('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    amount: '',
    description: ''
  });

  const generateInvoiceNumber = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `INV-${timestamp}-${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input with Zod
    const validation = createInvoiceSchema.safeParse({
      customer_name: formData.customerName,
      customer_email: formData.customerEmail,
      amount: parseFloat(formData.amount),
      description: formData.description,
      currency: 'KSH',
    });

    if (!validation.success) {
      toast({
        title: "Validation Error",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if user has configured any payment method
      const { data: paymentMethods } = await supabase
        .from('payment_methods')
        .select('mpesa_paybill, mpesa_till, airtel_money, enable_cards')
        .eq('user_id', user.id)
        .single();

      const hasPaymentMethod = paymentMethods && (
        paymentMethods.mpesa_paybill || 
        paymentMethods.mpesa_till || 
        paymentMethods.airtel_money || 
        paymentMethods.enable_cards
      );

      if (!hasPaymentMethod) {
        toast({
          title: "Payment Method Required",
          description: "Please set up at least one payment method before creating an invoice. Go to Payment Methods to configure.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const invoiceNumber = generateInvoiceNumber();

      // First create the invoice to get the ID
      const { data: invoice, error } = await supabase
        .from('invoices')
        .insert({
          user_id: user.id,
          invoice_number: invoiceNumber,
          customer_name: formData.customerName,
          customer_email: formData.customerEmail || null,
          amount: parseFloat(formData.amount),
          description: formData.description || null,
          currency: 'KSH',
          status: 'pending',
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
        })
        .select()
        .single();

      if (error) throw error;

      // Generate payment link with the invoice ID
      const link = `${window.location.origin}/pay/${invoice.id}`;

      // Update invoice with payment link
      const { error: updateError } = await supabase
        .from('invoices')
        .update({ payment_link: link })
        .eq('id', invoice.id);

      if (updateError) throw updateError;

      setPaymentLink(link);
      onInvoiceCreated();
      
      toast({
        title: "Invoice Created",
        description: "Your payment link is ready to share with your customer.",
      });

      // Reset form
      setFormData({
        customerName: '',
        customerEmail: '',
        amount: '',
        description: ''
      });
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast({
        title: "Error",
        description: "Failed to create invoice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(paymentLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied!",
        description: "Payment link copied to clipboard.",
      });
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setPaymentLink('');
    setCopied(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" />
          New Invoice
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Invoice</DialogTitle>
          <DialogDescription>
            Create a payment link to share with your customer
          </DialogDescription>
        </DialogHeader>
        
        {!paymentLink ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="customerName">Customer Name *</Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="customerEmail">Customer Email (Optional)</Label>
              <Input
                id="customerEmail"
                type="email"
                value={formData.customerEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="amount">Amount (KSh) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="1"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Invoice'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-sm font-medium text-success mb-2">Invoice Created Successfully!</div>
              <div className="p-3 bg-muted rounded-lg break-all text-sm">
                {paymentLink}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={copyToClipboard} className="flex-1">
                {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                {copied ? 'Copied!' : 'Copy Link'}
              </Button>
              <Button variant="outline" onClick={handleClose}>
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};