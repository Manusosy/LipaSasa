import React, { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/dashboard/AdminSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, Settings as SettingsIcon, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface PaymentSettings {
  enabled: boolean;
  [key: string]: any;
}

const AdminSettings = () => {
  const [paypalSettings, setPaypalSettings] = useState<PaymentSettings>({
    enabled: false,
    client_id: '',
    client_secret: '',
    mode: 'sandbox',
  });
  
  const [stripeSettings, setStripeSettings] = useState<PaymentSettings>({
    enabled: false,
    publishable_key: '',
    secret_key: '',
    mode: 'test',
  });
  
  const [mpesaSettings, setMpesaSettings] = useState<PaymentSettings>({
    enabled: true,
    till_number: '',
    paybill_number: '',
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
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

      fetchSettings();
    } catch (error) {
      console.error('Error checking admin access:', error);
      navigate('/admin/auth');
    }
  };

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('admin_payment_settings')
        .select('*')
        .in('setting_key', ['paypal_settings', 'stripe_settings', 'mpesa_settings']);

      if (error) throw error;

      data?.forEach((setting) => {
        if (setting.setting_key === 'paypal_settings') {
          setPaypalSettings(setting.setting_value as PaymentSettings);
        } else if (setting.setting_key === 'stripe_settings') {
          setStripeSettings(setting.setting_value as PaymentSettings);
        } else if (setting.setting_key === 'mpesa_settings') {
          setMpesaSettings(setting.setting_value as PaymentSettings);
        }
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (settingKey: string, settingValue: PaymentSettings) => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('admin_payment_settings')
        .upsert({
          setting_key: settingKey,
          setting_value: settingValue,
          updated_by: user?.id,
        }, { onConflict: 'setting_key' });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Settings saved successfully',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading settings...</p>
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
            <p className="text-gray-500 mt-2">Configure payment gateways and system preferences</p>
          </div>

          <Tabs defaultValue="paypal" className="space-y-6">
            <TabsList>
              <TabsTrigger value="paypal">PayPal</TabsTrigger>
              <TabsTrigger value="stripe">Stripe</TabsTrigger>
              <TabsTrigger value="mpesa">M-Pesa</TabsTrigger>
            </TabsList>

            {/* PayPal Settings */}
            <TabsContent value="paypal">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        PayPal Configuration
                      </CardTitle>
                      <CardDescription className="mt-2">
                        Configure PayPal payment gateway for subscription payments
                      </CardDescription>
                    </div>
                    <Switch
                      checked={paypalSettings.enabled}
                      onCheckedChange={(checked) => setPaypalSettings({ ...paypalSettings, enabled: checked })}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="paypal_mode">Mode</Label>
                      <Select
                        value={paypalSettings.mode}
                        onValueChange={(value) => setPaypalSettings({ ...paypalSettings, mode: value })}
                      >
                        <SelectTrigger id="paypal_mode">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sandbox">Sandbox (Test)</SelectItem>
                          <SelectItem value="live">Live (Production)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="paypal_client_id">Client ID</Label>
                      <Input
                        id="paypal_client_id"
                        type="password"
                        placeholder="Enter PayPal Client ID"
                        value={paypalSettings.client_id}
                        onChange={(e) => setPaypalSettings({ ...paypalSettings, client_id: e.target.value })}
                        disabled={!paypalSettings.enabled}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="paypal_client_secret">Client Secret</Label>
                      <Input
                        id="paypal_client_secret"
                        type="password"
                        placeholder="Enter PayPal Client Secret"
                        value={paypalSettings.client_secret}
                        onChange={(e) => setPaypalSettings({ ...paypalSettings, client_secret: e.target.value })}
                        disabled={!paypalSettings.enabled}
                      />
                    </div>
                  </div>

                  <Button
                    onClick={() => saveSettings('paypal_settings', paypalSettings)}
                    disabled={saving || !paypalSettings.enabled}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Saving...' : 'Save PayPal Settings'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Stripe Settings */}
            <TabsContent value="stripe">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Stripe Configuration
                      </CardTitle>
                      <CardDescription className="mt-2">
                        Configure Stripe payment gateway for subscription payments
                      </CardDescription>
                    </div>
                    <Switch
                      checked={stripeSettings.enabled}
                      onCheckedChange={(checked) => setStripeSettings({ ...stripeSettings, enabled: checked })}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="stripe_mode">Mode</Label>
                      <Select
                        value={stripeSettings.mode}
                        onValueChange={(value) => setStripeSettings({ ...stripeSettings, mode: value })}
                      >
                        <SelectTrigger id="stripe_mode">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="test">Test Mode</SelectItem>
                          <SelectItem value="live">Live Mode</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="stripe_publishable_key">Publishable Key</Label>
                      <Input
                        id="stripe_publishable_key"
                        type="password"
                        placeholder="pk_test_..."
                        value={stripeSettings.publishable_key}
                        onChange={(e) => setStripeSettings({ ...stripeSettings, publishable_key: e.target.value })}
                        disabled={!stripeSettings.enabled}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="stripe_secret_key">Secret Key</Label>
                      <Input
                        id="stripe_secret_key"
                        type="password"
                        placeholder="sk_test_..."
                        value={stripeSettings.secret_key}
                        onChange={(e) => setStripeSettings({ ...stripeSettings, secret_key: e.target.value })}
                        disabled={!stripeSettings.enabled}
                      />
                    </div>
                  </div>

                  <Button
                    onClick={() => saveSettings('stripe_settings', stripeSettings)}
                    disabled={saving || !stripeSettings.enabled}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Stripe Settings'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* M-Pesa Settings */}
            <TabsContent value="mpesa">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        M-Pesa Configuration
                      </CardTitle>
                      <CardDescription className="mt-2">
                        Configure M-Pesa payment gateway for local payments
                      </CardDescription>
                    </div>
                    <Switch
                      checked={mpesaSettings.enabled}
                      onCheckedChange={(checked) => setMpesaSettings({ ...mpesaSettings, enabled: checked })}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="mpesa_till">Till Number</Label>
                      <Input
                        id="mpesa_till"
                        placeholder="Enter M-Pesa Till Number"
                        value={mpesaSettings.till_number}
                        onChange={(e) => setMpesaSettings({ ...mpesaSettings, till_number: e.target.value })}
                        disabled={!mpesaSettings.enabled}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mpesa_paybill">Paybill Number</Label>
                      <Input
                        id="mpesa_paybill"
                        placeholder="Enter M-Pesa Paybill Number"
                        value={mpesaSettings.paybill_number}
                        onChange={(e) => setMpesaSettings({ ...mpesaSettings, paybill_number: e.target.value })}
                        disabled={!mpesaSettings.enabled}
                      />
                    </div>
                  </div>

                  <Button
                    onClick={() => saveSettings('mpesa_settings', mpesaSettings)}
                    disabled={saving || !mpesaSettings.enabled}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Saving...' : 'Save M-Pesa Settings'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Payment Methods Summary */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Active Payment Methods</CardTitle>
              <CardDescription>Summary of enabled payment gateways for subscriptions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-4 rounded-lg border-2 ${paypalSettings.enabled ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">PayPal</span>
                    <span className={`text-sm ${paypalSettings.enabled ? 'text-green-600' : 'text-gray-400'}`}>
                      {paypalSettings.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  {paypalSettings.enabled && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Mode: {paypalSettings.mode === 'sandbox' ? 'Sandbox' : 'Live'}
                    </p>
                  )}
                </div>

                <div className={`p-4 rounded-lg border-2 ${stripeSettings.enabled ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Stripe</span>
                    <span className={`text-sm ${stripeSettings.enabled ? 'text-green-600' : 'text-gray-400'}`}>
                      {stripeSettings.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  {stripeSettings.enabled && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Mode: {stripeSettings.mode === 'test' ? 'Test' : 'Live'}
                    </p>
                  )}
                </div>

                <div className={`p-4 rounded-lg border-2 ${mpesaSettings.enabled ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">M-Pesa</span>
                    <span className={`text-sm ${mpesaSettings.enabled ? 'text-green-600' : 'text-gray-400'}`}>
                      {mpesaSettings.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  {mpesaSettings.enabled && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Local payments enabled
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;

