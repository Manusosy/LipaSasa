import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  DollarSign,
  FileText,
  TrendingUp,
  Crown,
  CreditCard,
  Loader2,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { AdminSidebar } from '@/components/dashboard/AdminSidebar';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { requireAdmin } from '@/lib/auth-utils';
import { Button } from '@/components/ui/button';

interface Analytics {
  totalUsers: number;
  totalInvoices: number;
  totalSubscriptions: number;
  totalTransactions: number;
  totalRevenue: number;
  activeSubscriptions: number;
  pendingInvoices: number;
  paidInvoices: number;
  recentGrowth: {
    users: number;
    invoices: number;
    revenue: number;
  };
}

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState<Analytics>({
    totalUsers: 0,
    totalInvoices: 0,
    totalSubscriptions: 0,
    totalTransactions: 0,
    totalRevenue: 0,
    activeSubscriptions: 0,
    pendingInvoices: 0,
    paidInvoices: 0,
    recentGrowth: {
      users: 0,
      invoices: 0,
      revenue: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

      fetchAnalytics();
    };

    checkAccess();
  }, [navigate]);

  const fetchAnalytics = async () => {
    try {
      // Fetch all metrics in parallel
      const [
        usersCount,
        invoicesData,
        subscriptionsData,
        transactionsData,
        revenueData,
      ] = await Promise.all([
        // Total users (exclude admins)
        supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .neq('role', 'admin'),

        // Invoices
        supabase.from('invoices').select('*', { count: 'exact' }),

        // Subscriptions
        supabase.from('subscriptions').select('*', { count: 'exact' }),

        // Transactions
        supabase.from('transactions').select('*', { count: 'exact' }),

        // Revenue from completed transactions
        supabase
          .from('transactions')
          .select('amount')
          .eq('status', 'completed'),
      ]);

      // Calculate totals
      const totalRevenue = revenueData.data?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
      const activeSubscriptions = subscriptionsData.data?.filter(
        (s: any) => s.status === 'active'
      ).length || 0;
      const pendingInvoices = invoicesData.data?.filter(
        (i: any) => i.status === 'pending'
      ).length || 0;
      const paidInvoices = invoicesData.data?.filter(
        (i: any) => i.status === 'paid'
      ).length || 0;

      // Calculate 30-day growth
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [recentUsers, recentInvoices, recentRevenue] = await Promise.all([
        supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', thirtyDaysAgo.toISOString())
          .neq('role', 'admin'),

        supabase
          .from('invoices')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', thirtyDaysAgo.toISOString()),

        supabase
          .from('transactions')
          .select('amount')
          .eq('status', 'completed')
          .gte('created_at', thirtyDaysAgo.toISOString()),
      ]);

      const recentRevenueAmount = recentRevenue.data?.reduce(
        (sum, t) => sum + (t.amount || 0),
        0
      ) || 0;

      setAnalytics({
        totalUsers: usersCount.count || 0,
        totalInvoices: invoicesData.count || 0,
        totalSubscriptions: subscriptionsData.count || 0,
        totalTransactions: transactionsData.count || 0,
        totalRevenue,
        activeSubscriptions,
        pendingInvoices,
        paidInvoices,
        recentGrowth: {
          users: recentUsers.count || 0,
          invoices: recentInvoices.count || 0,
          revenue: recentRevenueAmount,
        },
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load analytics',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'KES',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading analytics...</p>
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
                <h1 className="text-lg lg:text-xl font-bold text-foreground">Analytics Dashboard</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Platform-wide metrics and insights
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 lg:p-6 max-w-7xl mx-auto">
          {/* Main KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalUsers}</div>
                <p className="text-xs text-success">
                  +{analytics.recentGrowth.users} in last 30 days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(analytics.totalRevenue)}</div>
                <p className="text-xs text-success">
                  +{formatCurrency(analytics.recentGrowth.revenue)} this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalInvoices}</div>
                <p className="text-xs text-success">
                  +{analytics.recentGrowth.invoices} in last 30 days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalTransactions}</div>
                <p className="text-xs text-muted-foreground">All payment attempts</p>
              </CardContent>
            </Card>
          </div>

          {/* Secondary KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                <Crown className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.activeSubscriptions}</div>
                <p className="text-xs text-muted-foreground">
                  of {analytics.totalSubscriptions} total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Paid Invoices</CardTitle>
                <TrendingUp className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.paidInvoices}</div>
                <p className="text-xs text-muted-foreground">
                  {((analytics.paidInvoices / Math.max(analytics.totalInvoices, 1)) * 100).toFixed(
                    1
                  )}
                  % success rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
                <FileText className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.pendingInvoices}</div>
                <p className="text-xs text-muted-foreground">Awaiting payment</p>
              </CardContent>
            </Card>
          </div>

          {/* Breakdown Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Overview</CardTitle>
                <CardDescription>Key metrics summary</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Merchant Accounts</span>
                  <Badge variant="outline">{analytics.totalUsers}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Invoices Created</span>
                  <Badge variant="outline">{analytics.totalInvoices}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Subscriptions Sold</span>
                  <Badge variant="outline">{analytics.totalSubscriptions}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Payment Transactions</span>
                  <Badge variant="outline">{analytics.totalTransactions}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>30-Day Growth</CardTitle>
                <CardDescription>Recent platform activity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">New Users</span>
                    <span className="text-sm font-bold text-success">
                      +{analytics.recentGrowth.users}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-success h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          (analytics.recentGrowth.users / Math.max(analytics.totalUsers, 1)) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">New Invoices</span>
                    <span className="text-sm font-bold text-success">
                      +{analytics.recentGrowth.invoices}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-success h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          (analytics.recentGrowth.invoices / Math.max(analytics.totalInvoices, 1)) *
                            100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Revenue Generated</span>
                    <span className="text-sm font-bold text-success">
                      +{formatCurrency(analytics.recentGrowth.revenue)}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-success h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          (analytics.recentGrowth.revenue / Math.max(analytics.totalRevenue, 1)) *
                            100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminAnalytics;

