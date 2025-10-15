import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  CreditCard,
  Search,
  DollarSign,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Download,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { AdminSidebar } from '@/components/dashboard/AdminSidebar';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { requireAdmin } from '@/lib/auth-utils';

interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  phone_number: string | null;
  mpesa_receipt_number: string | null;
  transaction_ref: string | null;
  result_desc: string | null;
  created_at: string;
  profiles: {
    business_name: string;
    owner_name: string;
  };
}

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    failed: 0,
    totalAmount: 0,
  });

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate('/admin/auth');
        return;
      }

      const hasAccess = await requireAdmin(navigate);
      if (!hasAccess) return;

      fetchTransactions();
    };

    checkAccess();
  }, [navigate]);

  useEffect(() => {
    let filtered = transactions;

    if (searchQuery) {
      filtered = filtered.filter(
        (tx) =>
          tx.mpesa_receipt_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tx.transaction_ref?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tx.phone_number?.includes(searchQuery) ||
          tx.profiles?.business_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((tx) => tx.status === statusFilter);
    }

    setFilteredTransactions(filtered);
  }, [searchQuery, statusFilter, transactions]);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          profiles!transactions_user_id_fkey (
            business_name,
            owner_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(500); // Limit to latest 500 for performance

      if (error) throw error;

      setTransactions(data || []);
      setFilteredTransactions(data || []);

      // Calculate stats
      const completed = data?.filter((t) => t.status === 'completed').length || 0;
      const pending = data?.filter((t) => t.status === 'pending').length || 0;
      const failed = data?.filter((t) => t.status === 'failed').length || 0;
      const totalAmount =
        data?.filter((t) => t.status === 'completed').reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

      setStats({
        total: data?.length || 0,
        completed,
        pending,
        failed,
        totalAmount,
      });
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

  const getStatusBadge = (status: string) => {
    const config: Record<
      string,
      { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }
    > = {
      completed: { variant: 'default', icon: <CheckCircle2 className="w-3 h-3 mr-1" /> },
      pending: { variant: 'secondary', icon: <Clock className="w-3 h-3 mr-1" /> },
      failed: { variant: 'destructive', icon: <XCircle className="w-3 h-3 mr-1" /> },
    };

    const { variant, icon } = config[status] || config.pending;

    return (
      <Badge variant={variant}>
        {icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'KES',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const exportToCSV = () => {
    const headers = [
      'Date',
      'Merchant',
      'Amount',
      'Currency',
      'Status',
      'Payment Method',
      'Phone',
      'Receipt',
      'Transaction Ref',
    ];

    const rows = filteredTransactions.map((tx) => [
      formatDate(tx.created_at),
      tx.profiles?.business_name || 'N/A',
      tx.amount,
      tx.currency,
      tx.status,
      tx.payment_method,
      tx.phone_number || '',
      tx.mpesa_receipt_number || '',
      tx.transaction_ref || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Export Successful',
      description: `Exported ${filteredTransactions.length} transactions to CSV`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex w-full">
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <AdminSidebar
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
                <h1 className="text-lg lg:text-xl font-bold text-foreground">All Transactions</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Platform-wide payment transactions
                </p>
              </div>
            </div>
            <Button onClick={exportToCSV} size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 lg:p-6 max-w-7xl mx-auto">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">All transactions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completed}</div>
                <p className="text-xs text-muted-foreground">Successful payments</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pending}</div>
                <p className="text-xs text-muted-foreground">In progress</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Failed</CardTitle>
                <XCircle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.failed}</div>
                <p className="text-xs text-muted-foreground">Unsuccessful</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.totalAmount, 'KES')}</div>
                <p className="text-xs text-muted-foreground">Completed only</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base">Filter Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by receipt, phone, merchant, or ref..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  {['all', 'completed', 'pending', 'failed'].map((status) => (
                    <Button
                      key={status}
                      variant={statusFilter === status ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setStatusFilter(status)}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transactions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Transactions ({filteredTransactions.length})</CardTitle>
              <CardDescription>Latest 500 transactions across all merchants</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-12">
                  <CreditCard className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No transactions found</h3>
                  <p className="text-muted-foreground">
                    {searchQuery || statusFilter !== 'all'
                      ? 'Try adjusting your filters'
                      : 'No transactions have been processed yet'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Merchant</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Payment Method</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Receipt</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransactions.map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell className="text-sm">
                            {formatDate(tx.created_at)}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{tx.profiles?.business_name || 'N/A'}</div>
                            <div className="text-xs text-muted-foreground">
                              {tx.profiles?.owner_name}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(tx.amount, tx.currency || 'KES')}
                          </TableCell>
                          <TableCell className="capitalize">{tx.payment_method || 'N/A'}</TableCell>
                          <TableCell className="text-sm">{tx.phone_number || 'N/A'}</TableCell>
                          <TableCell className="text-sm font-mono">
                            {tx.mpesa_receipt_number || '-'}
                          </TableCell>
                          <TableCell>{getStatusBadge(tx.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminTransactions;

