import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign, 
  CreditCard, 
  Building, 
  Shield, 
  Save, 
  Eye, 
  EyeOff, 
  AlertCircle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface MPesaCredentials {
  consumer_key: string;
  consumer_secret: string;
  shortcode: string;
  passkey: string;
  environment: 'sandbox' | 'production';
}

interface PayPalCredentials {
  client_id: string;
  client_secret: string;
  mode: 'sandbox' | 'live';
}

interface BankDetails {
  bank_name: string;
  account_number: string;
  account_name: string;
  branch: string;
  swift_code?: string;
}

export const FinancialSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);
  
  const [mpesaCredentials, setMpesaCredentials] = useState<MPesaCredentials>({
    consumer_key: '',
    consumer_secret: '',
    shortcode: '',
    passkey: '',
    environment: 'sandbox',
  });

  const [paypalCredentials, setPaypalCredentials] = useState<PayPalCredentials>({
    client_id: '',
    client_secret: '',
    mode: 'sandbox',
  });

  const [bankDetails, setBankDetails] = useState<BankDetails>({
    bank_name: '',
    account_number: '',
    account_name: '',
    branch: '',
    swift_code: '',
  });

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data: userRole, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (roleError || userRole?.role !== 'admin') {
        toast({
          title: 'Access Denied',
          description: 'You do not have permission to access this page.',
          variant: 'destructive',
        });
        navigate('/dashboard');
        return;
      }

      await loadSettings();
    } catch (error) {
      console.error('Admin access check failed:', error);
      navigate('/dashboard');
    }
  };

  const loadSettings = async () => {
    setLoading(true);
    try {
      // Load M-Pesa credentials
      const { data: mpesaData } = await supabase
        .from('admin_settings')
        .select('setting_value')
        .eq('setting_key', 'mpesa_subscription_credentials')
        .single();

      if (mpesaData?.setting_value) {
        setMpesaCredentials(mpesaData.setting_value);
      }

      // Load PayPal credentials
      const { data: paypalData } = await supabase
        .from('admin_settings')
        .select('setting_value')
        .eq('setting_key', 'paypal_credentials')
        .single();

      if (paypalData?.setting_value) {
        setPaypalCredentials(paypalData.setting_value);
      }

      // Load bank details
      const { data: bankData } = await supabase
        .from('admin_settings')
        .select('setting_value')
        .eq('setting_key', 'bank_details')
        .single();

      if (bankData?.setting_value) {
        setBankDetails(bankData.setting_value);
      }

    } catch (error) {
      console.error('Failed to load settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load financial settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveMPesaCredentials = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('admin_settings')
        .upsert({
          setting_key: 'mpesa_subscription_credentials',
          setting_value: mpesaCredentials,
          description: 'M-Pesa API credentials for subscription payments',
          is_encrypted: true,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'setting_key',
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'M-Pesa credentials saved securely',
      });
    } catch (error: any) {
      console.error('Failed to save M-Pesa credentials:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save M-Pesa credentials',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const savePayPalCredentials = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('admin_settings')
        .upsert({
          setting_key: 'paypal_credentials',
          setting_value: paypalCredentials,
          description: 'PayPal API credentials for subscription payments',
          is_encrypted: true,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'setting_key',
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'PayPal credentials saved securely',
      });
    } catch (error: any) {
      console.error('Failed to save PayPal credentials:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save PayPal credentials',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const saveBankDetails = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('admin_settings')
        .upsert({
          setting_key: 'bank_details',
          setting_value: bankDetails,
          description: 'Bank account details for settlements',
          is_encrypted: true,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'setting_key',
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Bank details saved securely',
      });
    } catch (error: any) {
      console.error('Failed to save bank details:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save bank details',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Financial Settings</h1>
        <p className="text-muted-foreground">
          Configure payment gateways and bank accounts for platform subscriptions and settlements
        </p>
      </div>

      <Alert className="mb-6">
        <Shield className="h-4 w-4" />
        <AlertTitle>Security Notice</AlertTitle>
        <AlertDescription>
          All credentials are encrypted at rest. Never share these credentials with anyone outside your organization.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="mpesa" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-[600px]">
          <TabsTrigger value="mpesa">M-Pesa</TabsTrigger>
          <TabsTrigger value="paypal">PayPal</TabsTrigger>
          <TabsTrigger value="bank">Bank Account</TabsTrigger>
        </TabsList>

        {/* M-Pesa Configuration */}
        <TabsContent value="mpesa">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                M-Pesa API Configuration
              </CardTitle>
              <CardDescription>
                Configure M-Pesa API credentials for subscription payments. Get these from Safaricom Daraja Portal.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mpesa-consumer-key">Consumer Key</Label>
                  <div className="relative">
                    <Input
                      id="mpesa-consumer-key"
                      type={showSecrets ? 'text' : 'password'}
                      value={mpesaCredentials.consumer_key}
                      onChange={(e) => setMpesaCredentials({ ...mpesaCredentials, consumer_key: e.target.value })}
                      placeholder="Enter consumer key"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mpesa-consumer-secret">Consumer Secret</Label>
                  <div className="relative">
                    <Input
                      id="mpesa-consumer-secret"
                      type={showSecrets ? 'text' : 'password'}
                      value={mpesaCredentials.consumer_secret}
                      onChange={(e) => setMpesaCredentials({ ...mpesaCredentials, consumer_secret: e.target.value })}
                      placeholder="Enter consumer secret"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mpesa-shortcode">Business Shortcode</Label>
                  <Input
                    id="mpesa-shortcode"
                    value={mpesaCredentials.shortcode}
                    onChange={(e) => setMpesaCredentials({ ...mpesaCredentials, shortcode: e.target.value })}
                    placeholder="Enter shortcode (Till/Paybill)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mpesa-passkey">Passkey</Label>
                  <Input
                    id="mpesa-passkey"
                    type={showSecrets ? 'text' : 'password'}
                    value={mpesaCredentials.passkey}
                    onChange={(e) => setMpesaCredentials({ ...mpesaCredentials, passkey: e.target.value })}
                    placeholder="Enter passkey"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mpesa-environment">Environment</Label>
                <select
                  id="mpesa-environment"
                  className="w-full border border-border rounded-md p-2"
                  value={mpesaCredentials.environment}
                  onChange={(e) => setMpesaCredentials({ ...mpesaCredentials, environment: e.target.value as 'sandbox' | 'production' })}
                >
                  <option value="sandbox">Sandbox (Testing)</option>
                  <option value="production">Production (Live)</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSecrets(!showSecrets)}
                >
                  {showSecrets ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                  {showSecrets ? 'Hide' : 'Show'} Secrets
                </Button>
              </div>

              <Button onClick={saveMPesaCredentials} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save M-Pesa Credentials'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PayPal Configuration */}
        <TabsContent value="paypal">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                PayPal API Configuration
              </CardTitle>
              <CardDescription>
                Configure PayPal REST API credentials for international payments. Get these from PayPal Developer Portal.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="paypal-client-id">Client ID</Label>
                  <Input
                    id="paypal-client-id"
                    type={showSecrets ? 'text' : 'password'}
                    value={paypalCredentials.client_id}
                    onChange={(e) => setPaypalCredentials({ ...paypalCredentials, client_id: e.target.value })}
                    placeholder="Enter PayPal client ID"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paypal-client-secret">Client Secret</Label>
                  <Input
                    id="paypal-client-secret"
                    type={showSecrets ? 'text' : 'password'}
                    value={paypalCredentials.client_secret}
                    onChange={(e) => setPaypalCredentials({ ...paypalCredentials, client_secret: e.target.value })}
                    placeholder="Enter PayPal client secret"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paypal-mode">Mode</Label>
                <select
                  id="paypal-mode"
                  className="w-full border border-border rounded-md p-2"
                  value={paypalCredentials.mode}
                  onChange={(e) => setPaypalCredentials({ ...paypalCredentials, mode: e.target.value as 'sandbox' | 'live' })}
                >
                  <option value="sandbox">Sandbox (Testing)</option>
                  <option value="live">Live (Production)</option>
                </select>
              </div>

              <Button onClick={savePayPalCredentials} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save PayPal Credentials'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bank Account */}
        <TabsContent value="bank">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Bank Account Details
              </CardTitle>
              <CardDescription>
                Configure bank account for settlements and withdrawals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bank-name">Bank Name</Label>
                  <Input
                    id="bank-name"
                    value={bankDetails.bank_name}
                    onChange={(e) => setBankDetails({ ...bankDetails, bank_name: e.target.value })}
                    placeholder="e.g., Equity Bank"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="account-number">Account Number</Label>
                  <Input
                    id="account-number"
                    value={bankDetails.account_number}
                    onChange={(e) => setBankDetails({ ...bankDetails, account_number: e.target.value })}
                    placeholder="Enter account number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="account-name">Account Name</Label>
                  <Input
                    id="account-name"
                    value={bankDetails.account_name}
                    onChange={(e) => setBankDetails({ ...bankDetails, account_name: e.target.value })}
                    placeholder="Enter account name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="branch">Branch</Label>
                  <Input
                    id="branch"
                    value={bankDetails.branch}
                    onChange={(e) => setBankDetails({ ...bankDetails, branch: e.target.value })}
                    placeholder="Enter branch name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="swift-code">SWIFT Code (Optional)</Label>
                  <Input
                    id="swift-code"
                    value={bankDetails.swift_code}
                    onChange={(e) => setBankDetails({ ...bankDetails, swift_code: e.target.value })}
                    placeholder="For international transfers"
                  />
                </div>
              </div>

              <Button onClick={saveBankDetails} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Bank Details'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

