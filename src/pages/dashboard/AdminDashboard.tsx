import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Activity, 
  AlertTriangle,
  Settings,
  BarChart3,
  Shield,
  CreditCard,
  UserCheck
} from 'lucide-react';

const AdminDashboard = () => {
  // Mock data - replace with real data from backend
  const platformStats = {
    totalUsers: 1247,
    activeUsers: 892,
    totalTransactions: 15420,
    platformRevenue: 34250,
    monthlyGrowth: 12.5
  };

  const recentUsers = [
    { id: 1, name: 'Grace Njeri', business: 'Mama Njeri\'s Shop', status: 'active', joined: '2 days ago' },
    { id: 2, name: 'John Kamau', business: 'Tech Solutions', status: 'pending', joined: '3 days ago' },
    { id: 3, name: 'Mary Wanjiku', business: 'Fashion House', status: 'active', joined: '5 days ago' },
  ];

  const systemAlerts = [
    { id: 1, type: 'warning', message: 'M-Pesa API response time increased by 15%', time: '2 hours ago' },
    { id: 2, type: 'info', message: 'Scheduled maintenance on Sunday 2 AM', time: '4 hours ago' },
    { id: 3, type: 'error', message: '3 failed webhook deliveries', time: '1 day ago' },
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-background border-b shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Platform management & analytics</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Platform Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="shadow-soft border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {platformStats.totalUsers.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {platformStats.activeUsers} active
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-soft border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <UserCheck className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {platformStats.activeUsers}
              </div>
              <p className="text-xs text-muted-foreground">
                71.5% retention rate
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-soft border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transactions</CardTitle>
              <CreditCard className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">
                {platformStats.totalTransactions.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-soft border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                ${platformStats.platformRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Platform fees
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-soft border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Growth</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                +{platformStats.monthlyGrowth}%
              </div>
              <p className="text-xs text-muted-foreground">
                vs last month
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Users */}
          <div className="lg:col-span-2">
            <Card className="shadow-elegant border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Recent User Registrations
                </CardTitle>
                <CardDescription>
                  Latest businesses that joined the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.business}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant={user.status === 'active' ? 'default' : 'secondary'}
                          className="mb-1"
                        >
                          {user.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground">{user.joined}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View All Users
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* System Alerts & Quick Actions */}
          <div className="space-y-6">
            {/* System Alerts */}
            <Card className="shadow-elegant border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                  System Alerts
                </CardTitle>
                <CardDescription>
                  Platform health and notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {systemAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/30"
                  >
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      alert.type === 'error' ? 'bg-destructive' :
                      alert.type === 'warning' ? 'bg-warning' : 'bg-primary'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {alert.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {alert.time}
                      </p>
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full">
                  View System Logs
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-elegant border-0">
              <CardHeader>
                <CardTitle>Admin Actions</CardTitle>
                <CardDescription>
                  Platform management tools
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  Manage Users
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Payment Oversight
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics Report
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Shield className="w-4 h-4 mr-2" />
                  Security Logs
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Platform Settings
                </Button>
              </CardContent>
            </Card>

            {/* Payment Methods Overview */}
            <Card className="shadow-elegant border-0">
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>
                  Platform-wide usage statistics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">M-Pesa</span>
                  <span className="text-sm text-success font-medium">78%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Airtel Money</span>
                  <span className="text-sm text-primary font-medium">15%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Cards</span>
                  <span className="text-sm text-warning font-medium">7%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 mt-3">
                  <div className="bg-gradient-primary h-2 rounded-full" style={{width: '78%'}}></div>
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