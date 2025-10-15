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
  Crown,
  Search,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Loader2,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { AdminSidebar } from '@/components/dashboard/AdminSidebar';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { requireAdmin } from '@/lib/auth-utils';

interface Subscription {
  id: string;
  user_id: string;
  plan_name: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  profiles: {
    business_name: string;
    owner_name: string;
  };
}

const AdminSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [filteredSubs, setFilteredSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Metrics
  const [metrics, setMetrics] = useState({
    totalActive: 0,
    totalRevenue: 0,
    monthlyRecurring: 0,
    totalMerchants: 0,
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

      fetchSubscriptions();
    };

    checkAccess();
  }, [navigate]);

  useEffect(() => {
    let filtered = subscriptions;

    if (searchQuery) {
      filtered = filtered.filter(
        (sub) =>
          sub.profiles?.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          sub.profiles?.owner_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          sub.plan_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((sub) => sub.status === statusFilter);
    }

    setFilteredSubs(filtered);
  }, [searchQuery, statusFilter, subscriptions]);

  const fetchSubscriptions = async () => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          profiles!subscriptions_user_id_fkey (
            business_name,
            owner_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSubscriptions(data || []);
      setFilteredSubs(data || []);

      // Calculate metrics
      const active = data?.filter((s) => s.status === 'active').length || 0;
      const revenue = data
        ?.filter((s) => s.status === 'active' || s.status === 'completed')
        .reduce((sum, s) => sum + (s.amount || 0), 0) || 0;
      
      // Monthly recurring from active subscriptions
      const monthlyRev = data
        ?.filter((s) => s.status === 'active')
        .reduce((sum, s) => sum + (s.amount || 0), 0) || 0;

      // Unique merchants with subscriptions
      const uniqueMerchants = new Set(data?.map((s) => s.user_id)).size;

      setMetrics({
        totalActive: active,
        totalRevenue: revenue,
        monthlyRecurring: monthlyRev,
        totalMerchants: uniqueMerchants,
      });
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load subscriptions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      pending: 'secondary',
      failed: 'destructive',
      cancelled: 'outline',
    };

    return (
      <Badge variant={variants[status] || 'secondary'}>
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading subscriptions...</p>
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
                <h1 className="text-lg lg:text-xl font-bold text-foreground">Subscriptions Management</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  View and manage all merchant subscriptions
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 lg:p-6 max-w-7xl mx-auto">
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                <Crown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalActive}</div>
                <p className="text-xs text-muted-foreground">Currently active plans</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(metrics.totalRevenue, 'KES')}
                </div>
                <p className="text-xs text-muted-foreground">All-time subscription revenue</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Recurring</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(metrics.monthlyRecurring, 'KES')}
                </div>
                <p className="text-xs text-muted-foreground">From active subscriptions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Subscribed Merchants</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalMerchants}</div>
                <p className="text-xs text-muted-foreground">Unique paying customers</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base">Filter Subscriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by merchant name, business, or plan..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  {['all', 'active', 'pending', 'failed', 'cancelled'].map((status) => (
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

          {/* Subscriptions Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Subscriptions ({filteredSubs.length})</CardTitle>
              <CardDescription>Complete list of all merchant subscriptions</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredSubs.length === 0 ? (
                <div className="text-center py-12">
                  <Crown className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No subscriptions found</h3>
                  <p className="text-muted-foreground">
                    {searchQuery || statusFilter !== 'all'
                      ? 'Try adjusting your filters'
                      : 'No merchants have subscribed yet'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Merchant</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Payment Method</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>End Date</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSubs.map((sub) => (
                        <TableRow key={sub.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{sub.profiles?.business_name || 'N/A'}</div>
                              <div className="text-xs text-muted-foreground">
                                {sub.profiles?.owner_name || ''}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {sub.plan_name}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(sub.amount, sub.currency)}
                          </TableCell>
                          <TableCell className="capitalize">{sub.payment_method}</TableCell>
                          <TableCell>{getStatusBadge(sub.status)}</TableCell>
                          <TableCell className="text-sm">{formatDate(sub.start_date)}</TableCell>
                          <TableCell className="text-sm">{formatDate(sub.end_date)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(sub.created_at)}
                          </TableCell>
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

export default AdminSubscriptions;

