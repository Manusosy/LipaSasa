import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  FileText, 
  Plus,
  Activity,
  Calendar,
  CreditCard,
  LogOut
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { CreateInvoiceDialog } from '@/components/dashboard/CreateInvoiceDialog';
import { PaymentMethodsDialog } from '@/components/dashboard/PaymentMethodsDialog';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { User, Session } from '@supabase/supabase-js';

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
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session?.user) {
          navigate('/auth');
        }
      }
    );

    // Check for existing session and fetch data
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserData();
      } else {
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileData) setProfile(profileData);

      // Fetch payment methods
      const { data: paymentData } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (paymentData) setPaymentMethods(paymentData);

      // Fetch recent invoices
      const { data: invoicesData } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (invoicesData) setInvoices(invoicesData);

      // Calculate stats
      const totalReceived = invoicesData?.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + Number(inv.amount), 0) || 0;
      const pendingInvoices = invoicesData?.filter(inv => inv.status === 'pending').length || 0;
      const activeCustomers = new Set(invoicesData?.map(inv => inv.customer_name)).size || 0;
      
      // Calculate monthly revenue (current month)
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-subtle">
        <DashboardSidebar />
        
        <SidebarInset className="flex-1">
          {/* Header */}
          <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b shadow-soft">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger />
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  Welcome back, {profile?.owner_name || profile?.business_name || 'User'}!
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm">
                  <FileText className="w-4 h-4 mr-2" />
                  Reports
                </Button>
                <CreateInvoiceDialog onInvoiceCreated={fetchUserData} />
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </header>

          <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-soft border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Received</CardTitle>
              <DollarSign className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                KSh {stats.totalReceived.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                +12.5% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-soft border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
              <FileText className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{stats.pendingInvoices}</div>
              <p className="text-xs text-muted-foreground">
                KSh 24,800 pending
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-soft border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.activeCustomers}</div>
              <p className="text-xs text-muted-foreground">
                +3 new this month
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-soft border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                KSh {stats.monthlyRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                +8.2% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card className="shadow-elegant border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Latest payments and invoices from your customers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {invoices.length > 0 ? invoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <FileText className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {invoice.customer_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Invoice #{invoice.invoice_number}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">
                          KSh {Number(invoice.amount).toLocaleString()}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={invoice.status === 'paid' ? 'default' : 'secondary'}
                            className="text-xs"
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
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No invoices yet</p>
                      <p className="text-sm">Create your first invoice to get started</p>
                    </div>
                  )}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View All Activity
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card className="shadow-elegant border-0">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common tasks to manage your business
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <CreateInvoiceDialog onInvoiceCreated={fetchUserData} />
                <Button className="w-full justify-start" variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  Add Customer
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  View Reports
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  Payment History
                </Button>
              </CardContent>
            </Card>

            {/* Payment Methods Status */}
            <Card className="shadow-elegant border-0">
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>
                  Your connected payment options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">M-Pesa Paybill</span>
                  <Badge variant={paymentMethods?.mpesa_paybill ? "default" : "secondary"} 
                         className={paymentMethods?.mpesa_paybill ? "bg-success text-success-foreground" : ""}>
                    {paymentMethods?.mpesa_paybill ? 'Active' : 'Not Connected'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">M-Pesa Till</span>
                  <Badge variant={paymentMethods?.mpesa_till ? "default" : "secondary"}
                         className={paymentMethods?.mpesa_till ? "bg-success text-success-foreground" : ""}>
                    {paymentMethods?.mpesa_till ? 'Active' : 'Not Connected'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Airtel Money</span>
                  <Badge variant={paymentMethods?.airtel_money ? "default" : "secondary"}
                         className={paymentMethods?.airtel_money ? "bg-success text-success-foreground" : ""}>
                    {paymentMethods?.airtel_money ? 'Active' : 'Not Connected'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Card Payments</span>
                  <Badge variant={paymentMethods?.enable_cards ? "default" : "secondary"}
                         className={paymentMethods?.enable_cards ? "bg-success text-success-foreground" : ""}>
                    {paymentMethods?.enable_cards ? 'Active' : 'Setup Required'}
                  </Badge>
                </div>
                <PaymentMethodsDialog onPaymentMethodsUpdated={fetchUserData} />
              </CardContent>
            </Card>
          </div>
        </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default SellerDashboard;