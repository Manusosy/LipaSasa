import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Search, 
  Download, 
  ExternalLink,
  Filter,
  Calendar,
  DollarSign,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { CreateInvoiceDialog } from '@/components/dashboard/CreateInvoiceDialog';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { requireMerchant } from '@/lib/auth-utils';

interface Invoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_email: string;
  amount: number;
  status: string;
  created_at: string;
  payment_link: string;
  description: string;
}

const Invoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
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

      fetchInvoices();
    };

    checkAccess();
  }, [navigate]);

  // Filter invoices based on search and status
  useEffect(() => {
    let filtered = invoices;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (inv) =>
          inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
          inv.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          inv.customer_email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((inv) => inv.status === statusFilter);
    }

    setFilteredInvoices(filtered);
  }, [searchQuery, statusFilter, invoices]);

  const fetchInvoices = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvoices(data || []);
      setFilteredInvoices(data || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast({
        title: 'Error',
        description: 'Failed to load invoices',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const copyPaymentLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast({
      title: 'Success',
      description: 'Payment link copied to clipboard',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-success text-success-foreground';
      case 'pending':
        return 'bg-warning text-warning-foreground';
      case 'failed':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const stats = {
    total: invoices.length,
    paid: invoices.filter((inv) => inv.status === 'paid').length,
    pending: invoices.filter((inv) => inv.status === 'pending').length,
    totalAmount: invoices
      .filter((inv) => inv.status === 'paid')
      .reduce((sum, inv) => sum + Number(inv.amount), 0),
  };

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
                <h1 className="text-lg lg:text-xl font-bold text-foreground">Invoices</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Manage and track all your invoices
                </p>
              </div>
            </div>
            <CreateInvoiceDialog onInvoiceCreated={fetchInvoices} />
          </div>
        </header>

        {/* Content */}
        <div className="p-4 lg:p-6 max-w-7xl mx-auto">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="border border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Invoices
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stats.total}</div>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Paid
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">{stats.paid}</div>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pending
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">{stats.pending}</div>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Collected
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  KSh {stats.totalAmount.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters & Search */}
          <Card className="border border-border mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search by invoice #, customer name, or email..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={statusFilter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('all')}
                  >
                    All
                  </Button>
                  <Button
                    variant={statusFilter === 'paid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('paid')}
                  >
                    Paid
                  </Button>
                  <Button
                    variant={statusFilter === 'pending' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('pending')}
                  >
                    Pending
                  </Button>
                  <Button
                    variant={statusFilter === 'failed' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('failed')}
                  >
                    Failed
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoices List */}
          <Card className="border border-border">
            <CardHeader>
              <CardTitle>All Invoices</CardTitle>
              <CardDescription>
                {filteredInvoices.length} invoice{filteredInvoices.length !== 1 ? 's' : ''} found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 animate-pulse">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 rounded-lg bg-muted"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded w-1/4"></div>
                          <div className="h-3 bg-muted rounded w-1/3"></div>
                        </div>
                      </div>
                      <div className="h-6 bg-muted rounded w-20"></div>
                    </div>
                  ))}
                </div>
              ) : filteredInvoices.length > 0 ? (
                <div className="space-y-3">
                  {filteredInvoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors gap-4"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <FileText className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-foreground">
                              #{invoice.invoice_number}
                            </p>
                            <Badge className={cn('text-xs', getStatusColor(invoice.status))}>
                              {invoice.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-foreground font-medium">
                            {invoice.customer_name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {invoice.description || 'No description'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="text-right flex-1 sm:flex-initial">
                          <p className="text-lg font-bold text-foreground">
                            KSh {Number(invoice.amount).toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(invoice.created_at)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyPaymentLink(invoice.payment_link)}
                            title="Copy payment link"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="font-medium text-lg mb-2">No invoices found</p>
                  <p className="text-sm mb-4">
                    {searchQuery || statusFilter !== 'all'
                      ? 'Try adjusting your search or filters'
                      : 'Create your first invoice to get started'}
                  </p>
                  <CreateInvoiceDialog onInvoiceCreated={fetchInvoices} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Invoices;
