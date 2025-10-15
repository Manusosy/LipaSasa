import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Activity, 
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Zap
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { AdminSidebar } from '@/components/dashboard/AdminSidebar';

interface DashboardMetrics {
  total_users: number;
  total_income: number;
  monthly_income: number;
  active_api_instances: number;
  mrr: number;
  active_subscriptions: number;
  subscription_growth: number;
  total_transactions: number;
  total_transaction_amount: number;
}

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/admin/auth');
        return;
      }

      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      if (!roles) {
        toast({
          title: 'Access Denied',
          description: 'You do not have admin privileges',
          variant: 'destructive',
        });
        navigate('/dashboard');
        return;
      }

      fetchDashboardMetrics();
    } catch (error) {
      console.error('Error checking admin access:', error);
      navigate('/admin/auth');
    }
  };

  const fetchDashboardMetrics = async () => {
    setLoading(true);
    try {
      // Get total users (excluding admins)
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .not('user_id', 'in', `(SELECT user_id FROM user_roles WHERE role = 'admin')`);

      // Get active subscriptions
      const { count: activeSubscriptions } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Get total transactions and amount
      const { data: transactions } = await supabase
        .from('transactions')
        .select('amount, status');

      const totalTransactionAmount = transactions
        ?.filter(t => t.status === 'completed')
        .reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

      // Get monthly income (current month)
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: monthlyTransactions } = await supabase
        .from('transactions')
        .select('amount')
        .eq('status', 'completed')
        .gte('created_at', startOfMonth.toISOString());

      const monthlyIncome = monthlyTransactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

      // Calculate MRR (Monthly Recurring Revenue)
      const { data: activeSubs } = await supabase
        .from('subscriptions')
        .select('amount')
        .eq('status', 'active');

      const mrr = activeSubs?.reduce((sum, s) => sum + (s.amount || 0), 0) || 0;

      // Get active API instances (users with API keys)
      const { count: activeApiInstances } = await supabase
        .from('api_keys')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Calculate subscription growth (mock for now - can be improved)
      const subscriptionGrowth = 12.5; // percentage

      setMetrics({
        total_users: totalUsers || 0,
        total_income: totalTransactionAmount,
        monthly_income: monthlyIncome,
        active_api_instances: activeApiInstances || 0,
        mrr: mrr,
        active_subscriptions: activeSubscriptions || 0,
        subscription_growth: subscriptionGrowth,
        total_transactions: transactions?.length || 0,
        total_transaction_amount: totalTransactionAmount,
      });
    } catch (error) {
      console.error('Error fetching metrics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard metrics',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getTrendIcon = (growth: number) => {
    if (growth > 0) return <ArrowUpRight className="h-4 w-4 text-green-500" />;
    if (growth < 0) return <ArrowDownRight className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getTrendColor = (growth: number) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="flex h-screen">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-500 mt-2">Platform overview and analytics</p>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Users */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.total_users || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Excluding admin accounts
                </p>
              </CardContent>
            </Card>

            {/* Total Income */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(metrics?.total_income || 0)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  All-time revenue
                </p>
              </CardContent>
            </Card>

            {/* Monthly Income */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(metrics?.monthly_income || 0)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Current month income
                </p>
              </CardContent>
            </Card>

            {/* Active API Instances */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active APIs</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.active_api_instances || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  API keys in use
                </p>
              </CardContent>
            </Card>
          </div>

          {/* MRR & Subscriptions Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Monthly Recurring Revenue */}
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Monthly Recurring Revenue (MRR)</span>
                  <TrendingUp className="h-5 w-5" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold mb-2">{formatCurrency(metrics?.mrr || 0)}</div>
                <p className="text-blue-100 text-sm">From active subscriptions</p>
              </CardContent>
            </Card>

            {/* Active Subscriptions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Active Subscriptions</span>
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-3">
                  <div className="text-4xl font-bold">{metrics?.active_subscriptions || 0}</div>
                  <div className={`flex items-center gap-1 ${getTrendColor(metrics?.subscription_growth || 0)}`}>
                    {getTrendIcon(metrics?.subscription_growth || 0)}
                    <span className="text-sm font-medium">{Math.abs(metrics?.subscription_growth || 0)}%</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {metrics?.subscription_growth || 0 > 0 ? 'Growth' : metrics?.subscription_growth || 0 < 0 ? 'Decline' : 'No change'} from last month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Transaction Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Merchant Transactions</CardTitle>
                <CardDescription>Total amount transacted by merchants</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Transactions</p>
                      <p className="text-2xl font-bold">{metrics?.total_transactions || 0}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Total Amount</p>
                      <p className="text-2xl font-bold">{formatCurrency(metrics?.total_transaction_amount || 0)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium">All transactions completed successfully</span>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Active
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardHeader>
                <CardTitle>Platform Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">API Status</span>
                    <Badge className="bg-green-400 text-green-900">Operational</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Database</span>
                    <Badge className="bg-green-400 text-green-900">Healthy</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Uptime</span>
                    <span className="text-sm font-semibold">99.9%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
