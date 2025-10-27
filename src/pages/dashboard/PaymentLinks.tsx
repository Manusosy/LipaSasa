import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Copy, ExternalLink } from 'lucide-react';
import { requireMerchant } from '@/lib/auth-utils';

interface PaymentLink {
  id: string;
  title: string;
  description: string | null;
  method_type: 'mpesa_paybill' | 'mpesa_till' | 'bank';
  method_value: string;
  min_amount: number;
  currency: string;
  link_slug: string;
  status: string;
  created_at: string;
}

const PaymentLinks: React.FC = () => {
  const [links, setLinks] = useState<PaymentLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const [createOpen, setCreateOpen] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [createdLinkUrl, setCreatedLinkUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [methodType, setMethodType] = useState<'mpesa_paybill' | 'mpesa_till' | 'bank'>('mpesa_paybill');
  const [methodValue, setMethodValue] = useState('');
  const [minAmount, setMinAmount] = useState<number>(1);
  const [currency, setCurrency] = useState('KSH');
  const [bankName, setBankName] = useState('');

  const [configuredMethods, setConfiguredMethods] = useState<{
    mpesa_paybill?: string;
    mpesa_till?: string;
    bank_name?: string;
    bank_account_number?: string;
  }>({});
  const [availableMethods, setAvailableMethods] = useState<Array<{value: string; label: string}>>([]);

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

      fetchLinks();
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
      
      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setConfiguredMethods(data);
        const methods = [];
        if (data.mpesa_paybill) methods.push({ value: 'mpesa_paybill', label: `M-Pesa Paybill (${data.mpesa_paybill})` });
        if (data.mpesa_till) methods.push({ value: 'mpesa_till', label: `M-Pesa Till (${data.mpesa_till})` });
        if (data.bank_name && data.bank_account_number) methods.push({ value: 'bank', label: `${data.bank_name} (${data.bank_account_number})` });
        setAvailableMethods(methods);
        
        if (methods.length > 0) {
          setMethodType(methods[0].value as any);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchLinks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from('payment_links')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setLinks(data || []);
    } catch (e) {
      console.error(e);
      toast({ title: 'Error', description: 'Failed to load payment links', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const copyLink = (slug: string) => {
    const url = `${window.location.origin}/pay/link/${slug}`;
    navigator.clipboard.writeText(url);
    toast({ title: 'Copied', description: 'Payment link copied to clipboard' });
  };

  const handleCreateClick = () => {
    if (availableMethods.length === 0) {
      toast({
        title: 'No Payment Methods',
        description: 'Please configure at least one payment method before creating a link.',
        variant: 'destructive',
      });
      return;
    }
    setCreateOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const slug = `pl_${Math.random().toString(36).slice(2, 10)}`;
      let value = '';
      
      if (methodType === 'mpesa_paybill') {
        value = configuredMethods.mpesa_paybill || '';
      } else if (methodType === 'mpesa_till') {
        value = configuredMethods.mpesa_till || '';
      } else if (methodType === 'bank') {
        value = `${configuredMethods.bank_name}:${configuredMethods.bank_account_number}`;
      }

      const { error } = await supabase.from('payment_links').insert({
        user_id: user.id,
        title,
        description: description || null,
        method_type: methodType,
        method_value: value,
        min_amount: Math.max(1, Number(minAmount) || 1),
        currency,
        link_slug: slug,
      });
      if (error) throw error;
      
      // Show success dialog with link
      const linkUrl = `${window.location.origin}/pay/link/${slug}`;
      setCreatedLinkUrl(linkUrl);
      setCreateOpen(false);
      setSuccessDialogOpen(true);
      
      setTitle(''); setDescription(''); setMinAmount(1);
      fetchLinks();
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Error', description: e.message || 'Failed to create link', variant: 'destructive' });
    }
  };

  // Removed full-screen loading spinner for better UX

  return (
    <div className="min-h-screen bg-background flex w-full">
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      <DashboardSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileMenuOpen={mobileMenuOpen}
        onMobileMenuClose={() => setMobileMenuOpen(false)}
      />

      <main
        className={cn('flex-1 transition-all duration-300 w-full', 'ml-0 lg:ml-20', !sidebarCollapsed && 'lg:ml-64')}
      >
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
          <div className="flex items-center justify-between h-16 px-4 lg:px-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setMobileMenuOpen(true)}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </Button>
              <div>
                <h1 className="text-lg lg:text-xl font-bold text-foreground">Payment Links</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">Create and manage shareable payment links</p>
              </div>
            </div>
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleCreateClick}>Create Link</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New Payment Link</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4">
                  {availableMethods.length === 0 ? (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        No payment methods configured. Please{' '}
                        <button
                          type="button"
                          onClick={() => navigate('/dashboard/payment-methods')}
                          className="font-medium underline"
                        >
                          configure a payment method
                        </button>{' '}
                        first.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <>
                      <div>
                        <Label htmlFor="title">Link Title</Label>
                        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Product Payment" required />
                      </div>
                      <div>
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description of the payment" />
                      </div>
                      <div>
                        <Label htmlFor="methodType">Payment Method</Label>
                        <select
                          id="methodType"
                          className="w-full border rounded h-10 px-3 bg-background"
                          value={methodType}
                          onChange={(e) => setMethodType(e.target.value as any)}
                        >
                          {availableMethods.map((method) => (
                            <option key={method.value} value={method.value}>
                              {method.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="minAmount">Minimum Amount</Label>
                          <Input id="minAmount" type="number" min={1} value={minAmount} onChange={(e) => setMinAmount(Number(e.target.value))} />
                        </div>
                        <div>
                          <Label htmlFor="currency">Currency</Label>
                          <select id="currency" className="w-full border rounded h-10 px-3 bg-background" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                            <option value="KSH">KSH</option>
                            <option value="UGX">UGX</option>
                            <option value="TZS">TZS</option>
                            <option value="RWF">RWF</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                        <Button type="submit">Create Link</Button>
                      </div>
                    </>
                  )}
                </form>
              </DialogContent>
            </Dialog>
            
            {/* Success Dialog */}
            <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-success">
                    <CheckCircle2 className="h-5 w-5" />
                    Payment Link Created!
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Your Payment Link</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          value={createdLinkUrl}
                          readOnly
                          className="text-sm font-mono"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            navigator.clipboard.writeText(createdLinkUrl);
                            toast({ title: 'Copied!', description: 'Link copied to clipboard' });
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        window.open(createdLinkUrl, '_blank');
                      }}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => setSuccessDialogOpen(false)}
                    >
                      Done
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <div className="p-4 lg:p-6 max-w-7xl mx-auto">
          <Card className="border border-border">
            <CardHeader>
              <CardTitle>All Payment Links</CardTitle>
              <CardDescription>{links.length} link{links.length !== 1 ? 's' : ''} found</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 animate-pulse">
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-1/3"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                      <div className="h-8 w-24 bg-muted rounded"></div>
                    </div>
                  ))}
                </div>
              ) : links.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="font-medium text-lg mb-2">No payment links yet</p>
                  <p className="text-sm mb-4">Create your first payment link to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {links.map((link) => (
                    <div key={link.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-foreground truncate">{link.title}</p>
                          <Badge className="text-xs">{link.method_type.replace('_', ' ')}</Badge>
                          <Badge variant="secondary" className="text-xs">{link.currency}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate max-w-xl">{link.description || 'No description'}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button variant="outline" size="sm" onClick={() => copyLink(link.link_slug)}>Copy Link</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default PaymentLinks;


