import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  FileText, 
  Activity,
  Calendar,
  Search,
  Bell,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { CreateInvoiceDialog } from '@/components/dashboard/CreateInvoiceDialog';
import { PaymentMethodsDialog } from '@/components/dashboard/PaymentMethodsDialog';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { NotificationBell } from '@/components/dashboard/NotificationBell';
import { User, Session } from '@supabase/supabase-js';
import { cn } from '@/lib/utils';
import { requireMerchant } from '@/lib/auth-utils';

interface UserProfile {
  business_name: string;
  owner_name: string;
  email: string;
  phone: string;
  country: string;
  industry: string;
  selected_plan: string;
}

interface PaymentMethods {
  mpesa_paybill: string;
  mpesa_till: string;
  airtel_money: string;
  enable_cards: boolean;
  bank_name: string;
  bank_account_number: string;
}

interface Invoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  amount: number;
  status: string;
  created_at: string;
  payment_link: string;
}

const SellerDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethods | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState({
    totalReceived: 0,
    pendingInvoices: 0,
    activeCustomers: 0,
    monthlyRevenue: 0
  });
  const [loading, setLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session?.user) {
          navigate('/auth');
          return;
        }

        // Check if user is a merchant (not admin)
        const hasAccess = await requireMerchant(navigate);
        if (!hasAccess) {
          return; // User will be redirected to admin dashboard
        }
      }
    );

    // Initial access check and data fetch
    const checkAccessAndFetch = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session?.user) {
        navigate('/auth');
        return;
      }

      // Check if user is a merchant (not admin)
      const hasAccess = await requireMerchant(navigate);
      if (!hasAccess) {
        return; // User will be redirected to admin dashboard
      }

      fetchUserData();
    };

    checkAccessAndFetch();

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileData) setProfile(profileData);

      const { data: paymentData } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (paymentData) setPaymentMethods(paymentData);

      const { data: invoicesData } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (invoicesData) setInvoices(invoicesData);

      const totalReceived = invoicesData?.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + Number(inv.amount), 0) || 0;
      const pendingInvoices = invoicesData?.filter(inv => inv.status === 'pending').length || 0;
      const activeCustomers = new Set(invoicesData?.map(inv => inv.customer_name)).size || 0;
      
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyRevenue = invoicesData?.filter(inv => {
        const invoiceDate = new Date(inv.created_at);
        return invoiceDate.getMonth() === currentMonth && 
               invoiceDate.getFullYear() === currentYear &&
               inv.status === 'paid';
      }).reduce((sum, inv) => sum + Number(inv.amount), 0) || 0;

      setStats({
        totalReceived,
        pendingInvoices,
        activeCustomers,
        monthlyRevenue
      });

    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return '1 day ago';
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  // Removed full-screen loading spinner for better UX

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile overlay */}
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
      
      <main className={cn(
        'flex-1 transition-all duration-300 w-full',
        'lg:ml-20 lg:',
        !sidebarCollapsed && 'lg:ml-64'
      )}>
        {/* Dashboard Header */}
        <header className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border">
          <div className="flex items-center justify-between h-16 px-4 md:px-6">
            <div className="flex items-center gap-3">
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(true)}
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </Button>
              <div>
                <h1 className="text-lg md:text-xl font-bold text-foreground">Dashboard</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Welcome back, {profile?.owner_name || profile?.business_name || 'User'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="pl-9 w-64 h-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <NotificationBell />
              <CreateInvoiceDialog onInvoiceCreated={fetchUserData} />
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
            <Card className="border border-border hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Received</CardTitle>
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-success" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  KSh {stats.totalReceived.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-success" />
                  All time earnings
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending Invoices</CardTitle>
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-warning" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stats.pendingInvoices}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Awaiting payment
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Customers</CardTitle>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stats.activeCustomers}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total customers
                </p>
              </CardContent>
            </Card>

            <Card className="border border-border hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">This Month</CardTitle>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  KSh {stats.monthlyRevenue.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Revenue this month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Analytics Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* Invoice Status Distribution */}
            <Card className="border border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Invoice Analytics</CardTitle>
                <CardDescription className="text-xs">Status distribution</CardDescription>
              </CardHeader>
              <CardContent>
                {invoices.length > 0 ? (
                  <div className="space-y-3">
                    {(() => {
                      const paidCount = invoices.filter(inv => inv.status === 'paid').length;
                      const pendingCount = invoices.filter(inv => inv.status === 'pending').length;
                      const failedCount = invoices.filter(inv => inv.status === 'failed').length;
                      const total = invoices.length;
                      
                      return (
                        <>
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-sm font-medium flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                                Paid
                              </span>
                              <span className="text-sm font-semibold">
                                {paidCount} ({((paidCount / total) * 100).toFixed(0)}%)
                              </span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div
                                className="bg-emerald-500 h-2 rounded-full transition-all"
                                style={{ width: `${(paidCount / total) * 100}%` }}
                              />
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-sm font-medium flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                                Pending
                              </span>
                              <span className="text-sm font-semibold">
                                {pendingCount} ({((pendingCount / total) * 100).toFixed(0)}%)
                              </span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div
                                className="bg-amber-500 h-2 rounded-full transition-all"
                                style={{ width: `${(pendingCount / total) * 100}%` }}
                              />
                            </div>
                          </div>
                          
                          {failedCount > 0 && (
                            <div>
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-sm font-medium flex items-center gap-2">
                                  <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                                  Failed
                                </span>
                                <span className="text-sm font-semibold">
                                  {failedCount} ({((failedCount / total) * 100).toFixed(0)}%)
                                </span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2">
                                <div
                                  className="bg-red-500 h-2 rounded-full transition-all"
                                  style={{ width: `${(failedCount / total) * 100}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <Activity className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-xs">No data yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Monthly Revenue Trend */}
            <Card className="border border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Revenue Trend</CardTitle>
                <CardDescription className="text-xs">Last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                {invoices.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-end justify-between gap-1 h-24">
                      {(() => {
                        const dailyRevenue: Record<number, number> = {};
                        const today = new Date();
                        
                        invoices
                          .filter(inv => inv.status === 'paid')
                          .forEach(inv => {
                            const invDate = new Date(inv.created_at);
                            const daysDiff = Math.floor((today.getTime() - invDate.getTime()) / (1000 * 60 * 60 * 24));
                            if (daysDiff < 7) {
                              dailyRevenue[daysDiff] = (dailyRevenue[daysDiff] || 0) + Number(inv.amount);
                            }
                          });
                        
                        const maxRevenue = Math.max(...Object.values(dailyRevenue), 1);
                        
                        return Array.from({ length: 7 }).map((_, index) => {
                          const dayRevenue = dailyRevenue[6 - index] || 0;
                          const height = maxRevenue > 0 ? (dayRevenue / maxRevenue * 100) : 0;
                          
                          return (
                            <div key={index} className="flex-1 flex flex-col items-center gap-1 h-full">
                              <div className="w-full h-full flex items-end">
                                <div 
                                  className="w-full bg-primary rounded-t transition-all"
                                  style={{ 
                                    height: `${height}%`,
                                    minHeight: dayRevenue > 0 ? '3px' : '0'
                                  }}
                                  title={`KES ${dayRevenue.toLocaleString()}`}
                                />
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      {Array.from({ length: 7 }).map((_, i) => {
                        const date = new Date();
                        date.setDate(date.getDate() - (6 - i));
                        return <span key={i}>{date.getDate()}</span>;
                      })}
                    </div>
                    <div className="pt-2 border-t">
                      <div className="text-center">
                        <p className="text-xl font-bold text-foreground">
                          KES {stats.monthlyRevenue.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">This month</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-xs">No revenue data</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Recent Activity */}
            <div className="lg:col-span-2">
              <Card className="border border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Activity className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Recent Activity</CardTitle>
                      <CardDescription className="text-xs">
                        Latest payments and invoices
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {invoices.length > 0 ? invoices.map((invoice) => (
                      <div
                        key={invoice.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <FileText className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground text-sm">
                              {invoice.customer_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Invoice #{invoice.invoice_number}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground text-sm">
                            KSh {Number(invoice.amount).toLocaleString()}
                          </p>
                          <div className="flex items-center gap-2 justify-end">
                            <Badge 
                              variant={invoice.status === 'paid' ? 'default' : 'secondary'}
                              className={cn(
                                "text-xs",
                                invoice.status === 'paid' && "bg-success text-success-foreground"
                              )}
                            >
                              {invoice.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(invoice.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="font-medium">No invoices yet</p>
                        <p className="text-xs mt-1">Create your first invoice to get started</p>
                      </div>
                    )}
                  </div>
                  {invoices.length > 0 && (
                    <Button variant="outline" className="w-full mt-4">
                      View All Activity
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions & Payment Methods */}
            <div className="space-y-4 md:space-y-6">
              <Card className="border border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Quick Actions</CardTitle>
                  <CardDescription className="text-xs">
                    Common business tasks
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <CreateInvoiceDialog onInvoiceCreated={fetchUserData} />
                  <Button className="w-full justify-start" variant="outline" size="sm">
                    <Users className="w-4 h-4 mr-2" />
                    Add Customer
                  </Button>
                  <Button className="w-full justify-start" variant="outline" size="sm">
                    <FileText className="w-4 h-4 mr-2" />
                    View Reports
                  </Button>
                  <Button className="w-full justify-start" variant="outline" size="sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    Payment History
                  </Button>
                </CardContent>
              </Card>

              <Card className="border border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Payment Methods</CardTitle>
                  <CardDescription className="text-xs">
                    Connected payment options
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <PaymentMethodsDialog method="paybill" onPaymentMethodsUpdated={fetchUserData}>
                    <button className="w-full flex items-center justify-between text-sm hover:bg-muted/50 p-2 rounded-lg transition-colors">
                      <span className="font-medium text-foreground">M-Pesa Paybill</span>
                      <Badge 
                        variant={paymentMethods?.mpesa_paybill ? "default" : "secondary"} 
                        className={cn(
                          "text-xs cursor-pointer",
                          paymentMethods?.mpesa_paybill && "bg-success text-success-foreground"
                        )}
                      >
                        {paymentMethods?.mpesa_paybill ? 'Active' : 'Setup'}
                      </Badge>
                    </button>
                  </PaymentMethodsDialog>

                  <PaymentMethodsDialog method="till" onPaymentMethodsUpdated={fetchUserData}>
                    <button className="w-full flex items-center justify-between text-sm hover:bg-muted/50 p-2 rounded-lg transition-colors">
                      <span className="font-medium text-foreground">M-Pesa Till</span>
                      <Badge 
                        variant={paymentMethods?.mpesa_till ? "default" : "secondary"}
                        className={cn(
                          "text-xs cursor-pointer",
                          paymentMethods?.mpesa_till && "bg-success text-success-foreground"
                        )}
                      >
                        {paymentMethods?.mpesa_till ? 'Active' : 'Setup'}
                      </Badge>
                    </button>
                  </PaymentMethodsDialog>

                  <PaymentMethodsDialog method="airtel" onPaymentMethodsUpdated={fetchUserData}>
                    <button className="w-full flex items-center justify-between text-sm hover:bg-muted/50 p-2 rounded-lg transition-colors">
                      <span className="font-medium text-foreground">Airtel Money</span>
                      <Badge 
                        variant={paymentMethods?.airtel_money ? "default" : "secondary"}
                        className={cn(
                          "text-xs cursor-pointer",
                          paymentMethods?.airtel_money && "bg-success text-success-foreground"
                        )}
                      >
                        {paymentMethods?.airtel_money ? 'Active' : 'Setup'}
                      </Badge>
                    </button>
                  </PaymentMethodsDialog>

                  <PaymentMethodsDialog method="bank" onPaymentMethodsUpdated={fetchUserData}>
                    <button className="w-full flex items-center justify-between text-sm hover:bg-muted/50 p-2 rounded-lg transition-colors">
                      <span className="font-medium text-foreground">Bank Account</span>
                      <Badge 
                        variant={paymentMethods?.bank_name && paymentMethods?.bank_account_number ? "default" : "secondary"}
                        className={cn(
                          "text-xs cursor-pointer",
                          paymentMethods?.bank_name && paymentMethods?.bank_account_number && "bg-success text-success-foreground"
                        )}
                      >
                        {paymentMethods?.bank_name && paymentMethods?.bank_account_number ? 'Active' : 'Setup'}
                      </Badge>
                    </button>
                  </PaymentMethodsDialog>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SellerDashboard;
