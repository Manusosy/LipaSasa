import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowDownUp, 
  Search, 
  Download, 
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { cn } from '@/lib/utils';
import { requireMerchant } from '@/lib/auth-utils';
import { useToast } from '@/hooks/use-toast';

interface Transaction {
  id: string;
  invoice_id: string;
  mpesa_receipt_number: string;
  transaction_ref: string;
  amount: number;
  phone_number: string;
  status: string;
  result_desc: string;
  created_at: string;
}

const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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

      fetchTransactions();
    };

    checkAccess();
  }, [navigate]);

  // Filter transactions based on search
  useEffect(() => {
    if (searchQuery) {
      const filtered = transactions.filter(
        (txn) =>
          txn.mpesa_receipt_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          txn.transaction_ref?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          txn.phone_number?.includes(searchQuery)
      );
      setFilteredTransactions(filtered);
    } else {
      setFilteredTransactions(transactions);
    }
  }, [searchQuery, transactions]);

  const fetchTransactions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
      setFilteredTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load transactions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'paid':
        return <CheckCircle2 className="w-5 h-5 text-success" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-destructive" />;
      default:
        return <Clock className="w-5 h-5 text-warning" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
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
    total: transactions.length,
    successful: transactions.filter((txn) => txn.status === 'completed' || txn.status === 'paid').length,
    pending: transactions.filter((txn) => txn.status === 'pending').length,
    failed: transactions.filter((txn) => txn.status === 'failed').length,
    totalAmount: transactions
      .filter((txn) => txn.status === 'completed' || txn.status === 'paid')
      .reduce((sum, txn) => sum + Number(txn.amount), 0),
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
                <h1 className="text-lg lg:text-xl font-bold text-foreground">Transactions</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  All M-PESA payment transactions
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 lg:p-6 max-w-7xl mx-auto">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <Card className="border border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stats.total}</div>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Successful
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">{stats.successful}</div>
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
                  Failed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{stats.failed}</div>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Amount
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  KSh {stats.totalAmount.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <Card className="border border-border mb-6">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by receipt number, transaction ref, or phone..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Transactions List */}
          <Card className="border border-border">
            <CardHeader>
              <CardTitle>All Transactions</CardTitle>
              <CardDescription>
                {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''} found
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
                          <div className="h-4 bg-muted rounded w-1/3"></div>
                          <div className="h-3 bg-muted rounded w-1/4"></div>
                        </div>
                      </div>
                      <div className="h-6 bg-muted rounded w-20"></div>
                    </div>
                  ))}
                </div>
              ) : filteredTransactions.length > 0 ? (
                <div className="space-y-3">
                  {filteredTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors gap-4"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          {getStatusIcon(transaction.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-foreground text-sm">
                              {transaction.mpesa_receipt_number || transaction.transaction_ref || 'N/A'}
                            </p>
                            <Badge className={cn('text-xs', getStatusColor(transaction.status))}>
                              {transaction.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {transaction.phone_number}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {transaction.result_desc || 'No description'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right w-full sm:w-auto">
                        <p className="text-lg font-bold text-foreground">
                          KSh {Number(transaction.amount).toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                          <Calendar className="w-3 h-3" />
                          {formatDate(transaction.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <ArrowDownUp className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="font-medium text-lg mb-2">No transactions found</p>
                  <p className="text-sm">
                    {searchQuery
                      ? 'Try adjusting your search query'
                      : 'Transactions will appear here once payments are made'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Transactions;
