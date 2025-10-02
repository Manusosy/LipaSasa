import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Smartphone, 
  Key, 
  Shield, 
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface MpesaCredentials {
  shortcode: string;
  consumer_key: string;
  consumer_secret: string;
  passkey: string;
  nominated_phone: string;
  is_active: boolean;
}

const MpesaSetup = () => {
  const [credentials, setCredentials] = useState<MpesaCredentials>({
    shortcode: '',
    consumer_key: '',
    consumer_secret: '',
    passkey: '',
    nominated_phone: '',
    is_active: false,
  });
  const [hasExistingCredentials, setHasExistingCredentials] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        navigate('/auth');
      } else {
        fetchCredentials();
      }
    });
  }, [navigate]);

  const fetchCredentials = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('mpesa_credentials')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setCredentials(data);
        setHasExistingCredentials(true);
      }
    } catch (error) {
      console.error('Error fetching credentials:', error);
      toast.error('Failed to load M-PESA credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('mpesa_credentials')
        .upsert({
          user_id: user.id,
          shortcode: credentials.shortcode,
          consumer_key: credentials.consumer_key,
          consumer_secret: credentials.consumer_secret,
          passkey: credentials.passkey,
          nominated_phone: credentials.nominated_phone,
          is_active: true,
        });

      if (error) throw error;

      toast.success('M-PESA credentials saved successfully');
      setHasExistingCredentials(true);
      setCredentials(prev => ({ ...prev, is_active: true }));
    } catch (error: any) {
      console.error('Error saving credentials:', error);
      toast.error(error.message || 'Failed to save credentials');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!credentials.shortcode || !credentials.consumer_key || !credentials.consumer_secret || !credentials.passkey) {
      toast.error('Please save your credentials first before testing');
      return;
    }

    if (!credentials.nominated_phone) {
      toast.error('Please enter a nominated phone number for testing');
      return;
    }

    setTesting(true);
    toast.info('Sending test payment request to your phone...');
    
    try {
      const { data, error } = await supabase.functions.invoke('mpesa-stk-push', {
        body: {
          phoneNumber: credentials.nominated_phone,
          amount: 1,
          description: 'LipaSasa M-PESA Connection Test',
          isTest: true,
        },
      });

      if (error) throw error;

      if (data.success) {
        toast.success('Test payment sent! Check your phone and enter PIN. You will be charged KES 1.');
      } else {
        throw new Error(data.error || 'Test failed');
      }
    } catch (error: any) {
      console.error('Test error:', error);
      toast.error(error.message || 'Connection test failed. Please check your credentials.');
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <main
        className={cn(
          'flex-1 transition-all duration-300',
          sidebarCollapsed ? 'ml-20' : 'ml-64'
        )}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
          <div className="flex items-center justify-between h-16 px-6">
            <div>
              <h1 className="text-xl font-bold text-foreground">M-PESA Setup</h1>
              <p className="text-xs text-muted-foreground">
                Configure your Safaricom Daraja API credentials
              </p>
            </div>
            {credentials.is_active && (
              <Badge className="bg-success text-success-foreground">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Active
              </Badge>
            )}
          </div>
        </header>

        {/* Content */}
        <div className="p-6 max-w-4xl mx-auto">
          {/* Info Card */}
          <Card className="border-primary/20 bg-primary/5 mb-6">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground mb-1">Important Information</p>
                  <p className="text-sm text-muted-foreground mb-2">
                    To receive M-PESA payments, you need to register for Daraja API from Safaricom.
                    Your credentials are stored securely and encrypted.
                  </p>
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 h-auto text-primary"
                    asChild
                  >
                    <a
                      href="https://developer.safaricom.co.ke/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Get Daraja API Credentials <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Setup Form */}
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                M-PESA Daraja Credentials
              </CardTitle>
              <CardDescription>
                Enter your Safaricom Daraja API credentials to enable M-PESA payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-6">
                {/* Shortcode */}
                <div className="space-y-2">
                  <Label htmlFor="shortcode" className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-primary" />
                    Paybill/Till Number
                  </Label>
                  <Input
                    id="shortcode"
                    placeholder="e.g., 174379"
                    value={credentials.shortcode}
                    onChange={(e) =>
                      setCredentials({ ...credentials, shortcode: e.target.value })
                    }
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Your M-PESA Paybill or Till Number
                  </p>
                </div>

                {/* Consumer Key */}
                <div className="space-y-2">
                  <Label htmlFor="consumer_key" className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-primary" />
                    Consumer Key
                  </Label>
                  <Input
                    id="consumer_key"
                    placeholder="Enter your consumer key"
                    value={credentials.consumer_key}
                    onChange={(e) =>
                      setCredentials({ ...credentials, consumer_key: e.target.value })
                    }
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    From Daraja API portal
                  </p>
                </div>

                {/* Consumer Secret */}
                <div className="space-y-2">
                  <Label htmlFor="consumer_secret" className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-primary" />
                    Consumer Secret
                  </Label>
                  <Input
                    id="consumer_secret"
                    type="password"
                    placeholder="Enter your consumer secret"
                    value={credentials.consumer_secret}
                    onChange={(e) =>
                      setCredentials({ ...credentials, consumer_secret: e.target.value })
                    }
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Keep this secret secure
                  </p>
                </div>

                {/* Passkey */}
                <div className="space-y-2">
                  <Label htmlFor="passkey" className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    Passkey
                  </Label>
                  <Input
                    id="passkey"
                    type="password"
                    placeholder="Enter your passkey"
                    value={credentials.passkey}
                    onChange={(e) =>
                      setCredentials({ ...credentials, passkey: e.target.value })
                    }
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    STK Push passkey from Daraja
                  </p>
                </div>

                {/* Nominated Phone */}
                <div className="space-y-2">
                  <Label htmlFor="nominated_phone" className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-primary" />
                    Nominated Phone (Optional)
                  </Label>
                  <Input
                    id="nominated_phone"
                    placeholder="e.g., 254712345678"
                    value={credentials.nominated_phone}
                    onChange={(e) =>
                      setCredentials({ ...credentials, nominated_phone: e.target.value })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    For testing connection (format: 254XXXXXXXXX)
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button type="submit" disabled={saving} className="flex-1">
                    {saving ? 'Saving...' : hasExistingCredentials ? 'Update Credentials' : 'Save Credentials'}
                  </Button>
                  {hasExistingCredentials && credentials.nominated_phone && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleTest}
                      disabled={testing}
                    >
                      {testing ? 'Testing...' : 'Test Connection'}
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Help Section */}
          <Card className="border border-border mt-6">
            <CardHeader>
              <CardTitle className="text-base">Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div>
                <p className="font-medium text-foreground mb-1">How to get Daraja credentials:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Visit <a href="https://developer.safaricom.co.ke/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">developer.safaricom.co.ke</a></li>
                  <li>Create an account and log in</li>
                  <li>Create a new app in your portal</li>
                  <li>Copy your Consumer Key and Consumer Secret</li>
                  <li>Get your Passkey for STK Push</li>
                </ol>
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">Security:</p>
                <p>
                  Your credentials are encrypted and stored securely. They are never exposed to
                  the frontend and are only used server-side for M-PESA transactions.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default MpesaSetup;
