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
  ArrowUp,
  ArrowDown,
  Activity,
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
  completedTransactions: number;
  failedTransactions: number;
  recentGrowth: {
    users: number;
    invoices: number;
    revenue: number;
    transactions: number;
  };
  paymentMethodDistribution: {
    mpesa: number;
    paypal: number;
    bank: number;
  };
  planDistribution: {
    starter: number;
    professional: number;
    enterprise: number;
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
    completedTransactions: 0,
    failedTransactions: 0,
    recentGrowth: {
      users: 0,
      invoices: 0,
      revenue: 0,
      transactions: 0,
    },
    paymentMethodDistribution: {
      mpesa: 0,
      paypal: 0,
      bank: 0,
    },
    planDistribution: {
      starter: 0,
      professional: 0,
      enterprise: 0,
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
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Fetch all data in parallel
      const [
        usersData,
        invoicesData,
        subscriptionsData,
        transactionsData,
        revenueData,
        recentUsersData,
        recentInvoicesData,
        recentTransactionsData,
        recentRevenueData,
      ] = await Promise.all([
        // Total users (exclude admins)
        supabase
          .from('profiles')
          .select('*', { count: 'exact' })
          .neq('role', 'admin'),

        // Invoices
        supabase.from('invoices').select('*', { count: 'exact' }),

        // Subscriptions
        supabase.from('subscriptions').select('*'),

        // Transactions
        supabase.from('transactions').select('*'),

        // Revenue from completed transactions
        supabase
          .from('transactions')
          .select('amount')
          .eq('status', 'completed'),

        // Recent users (30 days)
        supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', thirtyDaysAgo.toISOString())
          .neq('role', 'admin'),

        // Recent invoices (30 days)
        supabase
          .from('invoices')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', thirtyDaysAgo.toISOString()),

        // Recent transactions (30 days)
        supabase
          .from('transactions')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', thirtyDaysAgo.toISOString()),

        // Recent revenue (30 days)
        supabase
          .from('transactions')
          .select('amount')
          .eq('status', 'completed')
          .gte('created_at', thirtyDaysAgo.toISOString()),
      ]);

      // Calculate metrics
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
      const completedTransactions = transactionsData.data?.filter(
        (t: any) => t.status === 'completed'
      ).length || 0;
      const failedTransactions = transactionsData.data?.filter(
        (t: any) => t.status === 'failed'
      ).length || 0;

      // Payment method distribution
      const mpesaCount = transactionsData.data?.filter(
        (t: any) => t.payment_method === 'mpesa'
      ).length || 0;
      const paypalCount = transactionsData.data?.filter(
        (t: any) => t.payment_method === 'paypal'
      ).length || 0;
      const bankCount = transactionsData.data?.filter(
        (t: any) => t.payment_method === 'bank'
      ).length || 0;

      // Plan distribution
      const starterCount = subscriptionsData.data?.filter(
        (s: any) => s.plan_name?.toLowerCase().includes('starter')
      ).length || 0;
      const professionalCount = subscriptionsData.data?.filter(
        (s: any) => s.plan_name?.toLowerCase().includes('professional')
      ).length || 0;
      const enterpriseCount = subscriptionsData.data?.filter(
        (s: any) => s.plan_name?.toLowerCase().includes('enterprise')
      ).length || 0;

      const recentRevenueAmount = recentRevenueData.data?.reduce(
        (sum, t) => sum + (t.amount || 0),
        0
      ) || 0;

      setAnalytics({
        totalUsers: usersData.count || 0,
        totalInvoices: invoicesData.count || 0,
        totalSubscriptions: subscriptionsData.data?.length || 0,
        totalTransactions: transactionsData.data?.length || 0,
        totalRevenue,
        activeSubscriptions,
        pendingInvoices,
        paidInvoices,
        completedTransactions,
        failedTransactions,
        recentGrowth: {
          users: recentUsersData.count || 0,
          invoices: recentInvoicesData.count || 0,
          revenue: recentRevenueAmount,
          transactions: recentTransactionsData.count || 0,
        },
        paymentMethodDistribution: {
          mpesa: mpesaCount,
          paypal: paypalCount,
          bank: bankCount,
        },
        planDistribution: {
          starter: starterCount,
          professional: professionalCount,
          enterprise: enterpriseCount,
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
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculatePercentage = (value: number, total: number) => {
    if (total === 0) return 0;
    return ((value / total) * 100).toFixed(1);
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

  const totalPayments = analytics.paymentMethodDistribution.mpesa + 
    analytics.paymentMethodDistribution.paypal + 
    analytics.paymentMethodDistribution.bank;

  const totalPlans = analytics.planDistribution.starter + 
    analytics.planDistribution.professional + 
    analytics.planDistribution.enterprise;

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
                <h1 className="text-lg lg:text-xl font-bold text-foreground flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Analytics Dashboard
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Real-time platform metrics and insights
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 lg:p-6 max-w-[1600px] mx-auto space-y-6">
          {/* Main KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalUsers}</div>
                <p className="text-xs flex items-center gap-1 text-emerald-600 mt-1">
                  <ArrowUp className="h-3 w-3" />
                  +{analytics.recentGrowth.users} this month
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
                <p className="text-xs flex items-center gap-1 text-emerald-600 mt-1">
                  <ArrowUp className="h-3 w-3" />
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
                <p className="text-xs flex items-center gap-1 text-emerald-600 mt-1">
                  <ArrowUp className="h-3 w-3" />
                  +{analytics.recentGrowth.invoices} this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalTransactions}</div>
                <p className="text-xs flex items-center gap-1 text-emerald-600 mt-1">
                  <ArrowUp className="h-3 w-3" />
                  +{analytics.recentGrowth.transactions} this month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment Methods Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Payment Methods</CardTitle>
                <CardDescription>Distribution by payment type</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                        M-PESA
                      </span>
                      <span className="text-sm font-bold">
                        {analytics.paymentMethodDistribution.mpesa} ({calculatePercentage(analytics.paymentMethodDistribution.mpesa, totalPayments)}%)
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div
                        className="bg-emerald-500 h-2.5 rounded-full transition-all"
                        style={{
                          width: `${calculatePercentage(analytics.paymentMethodDistribution.mpesa, totalPayments)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        PayPal
                      </span>
                      <span className="text-sm font-bold">
                        {analytics.paymentMethodDistribution.paypal} ({calculatePercentage(analytics.paymentMethodDistribution.paypal, totalPayments)}%)
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div
                        className="bg-blue-500 h-2.5 rounded-full transition-all"
                        style={{
                          width: `${calculatePercentage(analytics.paymentMethodDistribution.paypal, totalPayments)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                        Bank Transfer
                      </span>
                      <span className="text-sm font-bold">
                        {analytics.paymentMethodDistribution.bank} ({calculatePercentage(analytics.paymentMethodDistribution.bank, totalPayments)}%)
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div
                        className="bg-amber-500 h-2.5 rounded-full transition-all"
                        style={{
                          width: `${calculatePercentage(analytics.paymentMethodDistribution.bank, totalPayments)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    Total Payments: <span className="font-semibold">{totalPayments}</span>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Subscription Plans Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Subscription Plans</CardTitle>
                <CardDescription>Active plan distribution</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                        Starter
                      </span>
                      <span className="text-sm font-bold">
                        {analytics.planDistribution.starter} ({calculatePercentage(analytics.planDistribution.starter, totalPlans)}%)
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div
                        className="bg-purple-500 h-2.5 rounded-full transition-all"
                        style={{
                          width: `${calculatePercentage(analytics.planDistribution.starter, totalPlans)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                        Professional
                      </span>
                      <span className="text-sm font-bold">
                        {analytics.planDistribution.professional} ({calculatePercentage(analytics.planDistribution.professional, totalPlans)}%)
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div
                        className="bg-indigo-500 h-2.5 rounded-full transition-all"
                        style={{
                          width: `${calculatePercentage(analytics.planDistribution.professional, totalPlans)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                        Enterprise
                      </span>
                      <span className="text-sm font-bold">
                        {analytics.planDistribution.enterprise} ({calculatePercentage(analytics.planDistribution.enterprise, totalPlans)}%)
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div
                        className="bg-rose-500 h-2.5 rounded-full transition-all"
                        style={{
                          width: `${calculatePercentage(analytics.planDistribution.enterprise, totalPlans)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    Total Subscriptions: <span className="font-semibold">{totalPlans}</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                <Crown className="h-4 w-4 text-amber-500" />
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
                <CardTitle className="text-sm font-medium">Invoice Success Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.totalInvoices > 0 
                    ? ((analytics.paidInvoices / analytics.totalInvoices) * 100).toFixed(1)
                    : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {analytics.paidInvoices} paid of {analytics.totalInvoices}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Transaction Success</CardTitle>
                <Activity className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.totalTransactions > 0
                    ? ((analytics.completedTransactions / analytics.totalTransactions) * 100).toFixed(1)
                    : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {analytics.completedTransactions} completed, {analytics.failedTransactions} failed
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminAnalytics;
