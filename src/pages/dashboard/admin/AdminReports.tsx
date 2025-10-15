import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Download,
  Calendar,
  Loader2,
  FileSpreadsheet,
  FileBarChart,
  TrendingUp,
  Users,
  DollarSign,
  CreditCard,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { AdminSidebar } from '@/components/dashboard/AdminSidebar';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { requireAdmin } from '@/lib/auth-utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const AdminReports = () => {
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [generating, setGenerating] = useState<string | null>(null);

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

      setLoading(false);
    };

    checkAccess();
  }, [navigate]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getDateRange = (days: number) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    return { startDate: startDate.toISOString(), endDate: endDate.toISOString() };
  };

  const generateCSVReport = async (reportType: string) => {
    setGenerating(reportType);
    try {
      const { startDate, endDate } = getDateRange(parseInt(selectedPeriod));
      let csvContent = '';
      let filename = '';

      if (reportType === 'transactions') {
        const { data } = await supabase
          .from('transactions')
          .select(`
            *,
            profiles!transactions_user_id_fkey (business_name, owner_name)
          `)
          .gte('created_at', startDate)
          .lte('created_at', endDate)
          .order('created_at', { ascending: false });

        csvContent = [
          ['Date', 'Merchant', 'Amount', 'Currency', 'Status', 'Payment Method', 'Phone', 'Receipt'].join(','),
          ...(data || []).map((tx: any) => [
            new Date(tx.created_at).toLocaleString(),
            `"${tx.profiles?.business_name || 'N/A'}"`,
            tx.amount,
            tx.currency,
            tx.status,
            tx.payment_method || 'N/A',
            tx.phone_number || '',
            tx.mpesa_receipt_number || '',
          ].join(',')),
        ].join('\n');
        filename = `transactions-report-${selectedPeriod}days.csv`;
      } else if (reportType === 'revenue') {
        const { data } = await supabase
          .from('transactions')
          .select('*')
          .eq('status', 'completed')
          .gte('created_at', startDate)
          .lte('created_at', endDate);

        const revenueByDay: Record<string, number> = {};
        data?.forEach((tx: any) => {
          const date = new Date(tx.created_at).toISOString().split('T')[0];
          revenueByDay[date] = (revenueByDay[date] || 0) + tx.amount;
        });

        csvContent = [
          ['Date', 'Revenue (KES)'].join(','),
          ...Object.entries(revenueByDay).map(([date, revenue]) => 
            [date, revenue].join(',')
          ),
        ].join('\n');
        filename = `revenue-report-${selectedPeriod}days.csv`;
      } else if (reportType === 'subscriptions') {
        const { data } = await supabase
          .from('subscriptions')
          .select(`
            *,
            profiles!subscriptions_user_id_fkey (business_name, owner_name, email)
          `)
          .gte('created_at', startDate)
          .lte('created_at', endDate)
          .order('created_at', { ascending: false });

        csvContent = [
          ['Date', 'Merchant', 'Email', 'Plan', 'Amount', 'Status', 'Payment Method'].join(','),
          ...(data || []).map((sub: any) => [
            new Date(sub.created_at).toLocaleString(),
            `"${sub.profiles?.business_name || 'N/A'}"`,
            sub.profiles?.email || 'N/A',
            sub.plan_name,
            sub.amount,
            sub.status,
            sub.payment_method,
          ].join(',')),
        ].join('\n');
        filename = `subscriptions-report-${selectedPeriod}days.csv`;
      } else if (reportType === 'users') {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .neq('role', 'admin')
          .gte('created_at', startDate)
          .lte('created_at', endDate)
          .order('created_at', { ascending: false });

        csvContent = [
          ['Date', 'Business Name', 'Owner', 'Email', 'Phone', 'Country', 'Status', 'Plan'].join(','),
          ...(data || []).map((user: any) => [
            new Date(user.created_at).toLocaleString(),
            `"${user.business_name || 'N/A'}"`,
            `"${user.owner_name || 'N/A'}"`,
            user.email || '',
            user.phone_number || '',
            user.country || '',
            user.status || 'active',
            user.selected_plan || 'Free',
          ].join(',')),
        ].join('\n');
        filename = `users-report-${selectedPeriod}days.csv`;
      }

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      URL.revokeObjectURL(link.href);

      toast({
        title: 'Report Generated',
        description: `${filename} has been downloaded successfully`,
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate report',
        variant: 'destructive',
      });
    } finally {
      setGenerating(null);
    }
  };

  const generatePDFReport = async (reportType: string) => {
    setGenerating(reportType + '-pdf');
    try {
      const { startDate, endDate } = getDateRange(parseInt(selectedPeriod));
      
      // Fetch data based on report type
      let data: any;
      let title = '';
      
      if (reportType === 'summary') {
        const [usersData, transactionsData, revenueData, subscriptionsData] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }).neq('role', 'admin'),
          supabase.from('transactions').select('*', { count: 'exact' }).gte('created_at', startDate).lte('created_at', endDate),
          supabase.from('transactions').select('amount').eq('status', 'completed').gte('created_at', startDate).lte('created_at', endDate),
          supabase.from('subscriptions').select('*', { count: 'exact' }).eq('status', 'active'),
        ]);

        const totalRevenue = revenueData.data?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

        data = {
          totalUsers: usersData.count || 0,
          totalTransactions: transactionsData.count || 0,
          totalRevenue,
          activeSubscriptions: subscriptionsData.count || 0,
        };
        title = 'Platform Summary Report';
      }

      // Create simple HTML report (PDF generation would require a library like jsPDF)
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>${title}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
            }
            .header {
              display: flex;
              align-items: center;
              border-bottom: 3px solid #0A2647;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .logo {
              width: 60px;
              height: 60px;
              margin-right: 20px;
            }
            h1 {
              color: #0A2647;
              margin: 0;
            }
            .subtitle {
              color: #666;
              margin-top: 5px;
            }
            .metrics {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 20px;
              margin: 30px 0;
            }
            .metric {
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              padding: 20px;
              background: #f9fafb;
            }
            .metric-label {
              color: #666;
              font-size: 14px;
              margin-bottom: 5px;
            }
            .metric-value {
              color: #0A2647;
              font-size: 28px;
              font-weight: bold;
            }
            .footer {
              margin-top: 50px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              color: #666;
              font-size: 12px;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="/chapapay.png" alt="LipaSasa Logo" class="logo">
            <div>
              <h1>${title}</h1>
              <div class="subtitle">Period: Last ${selectedPeriod} days | Generated: ${new Date().toLocaleString()}</div>
            </div>
          </div>
          
          <div class="metrics">
            <div class="metric">
              <div class="metric-label">Total Users</div>
              <div class="metric-value">${data.totalUsers}</div>
            </div>
            <div class="metric">
              <div class="metric-label">Total Transactions</div>
              <div class="metric-value">${data.totalTransactions}</div>
            </div>
            <div class="metric">
              <div class="metric-label">Total Revenue</div>
              <div class="metric-value">${formatCurrency(data.totalRevenue)}</div>
            </div>
            <div class="metric">
              <div class="metric-label">Active Subscriptions</div>
              <div class="metric-value">${data.activeSubscriptions}</div>
            </div>
          </div>
          
          <div class="footer">
            <p>LipaSasa Payment Platform | This is a confidential report</p>
            <p>Generated from admin.lipasasa.com</p>
          </div>
        </body>
        </html>
      `;

      // Open in new window for printing
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => printWindow.print(), 250);
      }

      toast({
        title: 'Report Generated',
        description: 'Report opened in new window. Use Print to save as PDF',
      });
    } catch (error) {
      console.error('Error generating PDF report:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate PDF report',
        variant: 'destructive',
      });
    } finally {
      setGenerating(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
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
                <h1 className="text-lg lg:text-xl font-bold text-foreground flex items-center gap-2">
                  <FileBarChart className="h-5 w-5" />
                  Reports & Exports
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Generate and download platform reports
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6">
          {/* Period Selector */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Report Period
                  </CardTitle>
                  <CardDescription className="mt-1">Select the time range for reports</CardDescription>
                </div>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                    <SelectItem value="365">Last year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
          </Card>

          {/* PDF Reports */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                PDF Reports
              </CardTitle>
              <CardDescription>Formatted reports with LipaSasa branding (Print as PDF)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4 hover:border-primary transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">Platform Summary</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Overall platform metrics and KPIs
                      </p>
                    </div>
                    <Badge variant="secondary">PDF</Badge>
                  </div>
                  <Button
                    onClick={() => generatePDFReport('summary')}
                    disabled={generating === 'summary-pdf'}
                    className="w-full"
                  >
                    {generating === 'summary-pdf' ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <FileText className="h-4 w-4 mr-2" />
                    )}
                    Generate Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CSV Exports */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                CSV Exports
              </CardTitle>
              <CardDescription>Download detailed data for analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Transactions Report */}
                <div className="border rounded-lg p-4 hover:border-primary transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-blue-500" />
                      <div>
                        <h3 className="font-semibold">Transactions</h3>
                        <p className="text-xs text-muted-foreground mt-1">All payment transactions</p>
                      </div>
                    </div>
                    <Badge variant="outline">CSV</Badge>
                  </div>
                  <Button
                    onClick={() => generateCSVReport('transactions')}
                    disabled={generating === 'transactions'}
                    variant="outline"
                    className="w-full"
                  >
                    {generating === 'transactions' ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Download
                  </Button>
                </div>

                {/* Revenue Report */}
                <div className="border rounded-lg p-4 hover:border-primary transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-emerald-500" />
                      <div>
                        <h3 className="font-semibold">Revenue</h3>
                        <p className="text-xs text-muted-foreground mt-1">Daily revenue breakdown</p>
                      </div>
                    </div>
                    <Badge variant="outline">CSV</Badge>
                  </div>
                  <Button
                    onClick={() => generateCSVReport('revenue')}
                    disabled={generating === 'revenue'}
                    variant="outline"
                    className="w-full"
                  >
                    {generating === 'revenue' ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Download
                  </Button>
                </div>

                {/* Subscriptions Report */}
                <div className="border rounded-lg p-4 hover:border-primary transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-amber-500" />
                      <div>
                        <h3 className="font-semibold">Subscriptions</h3>
                        <p className="text-xs text-muted-foreground mt-1">Merchant subscriptions</p>
                      </div>
                    </div>
                    <Badge variant="outline">CSV</Badge>
                  </div>
                  <Button
                    onClick={() => generateCSVReport('subscriptions')}
                    disabled={generating === 'subscriptions'}
                    variant="outline"
                    className="w-full"
                  >
                    {generating === 'subscriptions' ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Download
                  </Button>
                </div>

                {/* Users Report */}
                <div className="border rounded-lg p-4 hover:border-primary transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-purple-500" />
                      <div>
                        <h3 className="font-semibold">Users</h3>
                        <p className="text-xs text-muted-foreground mt-1">Merchant accounts</p>
                      </div>
                    </div>
                    <Badge variant="outline">CSV</Badge>
                  </div>
                  <Button
                    onClick={() => generateCSVReport('users')}
                    disabled={generating === 'users'}
                    variant="outline"
                    className="w-full"
                  >
                    {generating === 'users' ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Help Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Report Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                <strong>PDF Reports:</strong> Formatted reports with LipaSasa branding. Open in new window and use your browser's print function to save as PDF.
              </p>
              <p>
                <strong>CSV Exports:</strong> Raw data downloads for analysis in Excel, Google Sheets, or other tools.
              </p>
              <p>
                <strong>Data Includes:</strong> All reports respect the selected time period and include only relevant data.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminReports;

