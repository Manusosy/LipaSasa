import React, { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/dashboard/AdminSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Bell, Send, Users, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface NotificationHistory {
  id: string;
  title: string;
  message: string;
  recipient_type: string;
  sent_at: string;
  recipients_count: number;
}

const NotificationsManagement = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [recipientType, setRecipientType] = useState<'all' | 'active' | 'inactive' | 'specific'>('all');
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState<NotificationHistory[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  
  const { toast } = useToast();
  const navigate = useNavigate();

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
        navigate('/dashboard');
        return;
      }

      fetchStats();
      fetchHistory();
    } catch (error) {
      console.error('Error checking admin access:', error);
      navigate('/admin/auth');
    }
  };

  const fetchStats = async () => {
    try {
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .not('user_id', 'in', `(SELECT user_id FROM user_roles WHERE role = 'admin')`);
      
      setTotalUsers(count || 0);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          notification_recipients (count)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const formatted = data?.map((notif: any) => ({
        id: notif.id,
        title: notif.title,
        message: notif.message,
        recipient_type: notif.recipient_type || 'all',
        sent_at: notif.created_at,
        recipients_count: notif.notification_recipients?.[0]?.count || 0,
      })) || [];

      setHistory(formatted);
    } catch (error) {
      console.error('Error fetching notification history:', error);
    }
  };

  const handleSendNotification = async () => {
    if (!title || !message) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    setSending(true);
    
    try {
      // Get recipients based on type
      let query = supabase
        .from('profiles')
        .select('user_id, email, owner_name')
        .not('user_id', 'in', `(SELECT user_id FROM user_roles WHERE role = 'admin')`);

      if (recipientType === 'active') {
        query = query.eq('status', 'active');
      } else if (recipientType === 'inactive') {
        query = query.in('status', ['suspended', 'banned']);
      }

      const { data: recipients, error } = await query;

      if (error) throw error;

      // Store notification in database
      const { data: notification, error: notifError } = await supabase
        .from('notifications')
        .insert({
          title,
          message,
          recipient_type: recipientType,
          status: 'sent',
        })
        .select()
        .single();

      if (notifError) throw notifError;

      // Store recipients in notification_recipients table
      if (notification && recipients && recipients.length > 0) {
        const recipientRecords = recipients.map((r: any) => ({
          notification_id: notification.id,
          user_id: r.user_id,
          status: 'queued', // Would be 'sent' after email delivery
        }));

        await supabase.from('notification_recipients').insert(recipientRecords);
      }

      // In production, this would also:
      // - Call Edge Function to send actual emails via Resend/SendGrid
      // - Send push notifications via service worker
      // - Update delivery status after sending
      
      console.log('Notification stored for', recipients?.length || 0, 'users');
      console.log('Note: Email delivery not implemented yet');

      toast({
        title: 'Notification Saved',
        description: `Notification recorded for ${recipients?.length || 0} users. Email sending not yet implemented.`,
      });

      // Reset form and refresh history
      setTitle('');
      setMessage('');
      fetchHistory();
      setRecipientType('all');
      
      fetchHistory();
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        title: 'Error',
        description: 'Failed to send notification',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  const getRecipientCount = () => {
    // Mock calculation - in production, query actual counts
    switch (recipientType) {
      case 'all':
        return totalUsers;
      case 'active':
        return Math.floor(totalUsers * 0.9); // Assume 90% active
      case 'inactive':
        return Math.floor(totalUsers * 0.1); // Assume 10% inactive
      case 'specific':
        return 1;
      default:
        return 0;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-500 mt-2">Send push notifications to merchants</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Send Notification Form */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Send Notification
                </CardTitle>
                <CardDescription>
                  Compose and send notifications to your users
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Recipient Type */}
                <div className="space-y-2">
                  <Label>Recipients</Label>
                  <Select value={recipientType} onValueChange={(value: any) => setRecipientType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="active">Active Users Only</SelectItem>
                      <SelectItem value="inactive">Inactive Users</SelectItem>
                      <SelectItem value="specific">Specific User</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    <Users className="h-3 w-3 inline mr-1" />
                    Will send to approximately {getRecipientCount()} users
                  </p>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Notification Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Platform Update, New Feature, Maintenance Notice"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Enter your notification message here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={6}
                    className="resize-none"
                  />
                  <p className="text-sm text-muted-foreground text-right">
                    {message.length} / 500 characters
                  </p>
                </div>

                {/* Send Button */}
                <Button
                  onClick={handleSendNotification}
                  disabled={sending || !title || !message}
                  className="w-full"
                  size="lg"
                >
                  {sending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Notification
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Notification Stats & History */}
            <div className="space-y-6">
              {/* Stats Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Users</span>
                    <span className="text-2xl font-bold">{totalUsers}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Sent Today</span>
                    <Badge variant="outline">0</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Delivery Rate</span>
                    <span className="text-sm font-semibold text-green-600">100%</span>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Notifications</CardTitle>
                </CardHeader>
                <CardContent>
                  {history.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No notifications sent yet
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {history.map((notification) => (
                        <div
                          key={notification.id}
                          className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-1">
                            <h4 className="font-medium text-sm">{notification.title}</h4>
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            {notification.message.substring(0, 50)}...
                          </p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{notification.recipients_count} recipients</span>
                            <span>{new Date(notification.sent_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsManagement;

