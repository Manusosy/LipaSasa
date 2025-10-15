import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  XCircle, 
  Info, 
  ExternalLink,
  Eye,
  EyeOff,
  Loader2,
  Shield
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MpesaCredentials {
  shortcode: string;
  consumer_key: string;
  consumer_secret: string;
  passkey: string;
  nominated_phone: string;
  environment: 'sandbox' | 'production';
  is_active: boolean;
}

export const MpesaDarajaSetup = () => {
  const [credentials, setCredentials] = useState<MpesaCredentials>({
    shortcode: '',
    consumer_key: '',
    consumer_secret: '',
    passkey: '',
    nominated_phone: '',
    environment: 'sandbox',
    is_active: false,
  });
  const [existingCreds, setExistingCreds] = useState<any>(null);
  const [showSecrets, setShowSecrets] = useState({
    consumer_key: false,
    consumer_secret: false,
    passkey: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCredentials();
  }, []);

  const fetchCredentials = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('mpesa_credentials')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (data) {
        setExistingCreds(data);
        setCredentials({
          shortcode: data.shortcode || '',
          consumer_key: data.consumer_key || '',
          consumer_secret: data.consumer_secret || '',
          passkey: data.passkey || '',
          nominated_phone: data.nominated_phone || '',
          environment: data.environment || 'sandbox',
          is_active: data.is_active || false,
        });
      }
    } catch (error: any) {
      console.error('Error fetching M-Pesa credentials:', error);
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    if (!credentials.consumer_key || !credentials.consumer_secret) {
      toast({
        title: 'Missing Credentials',
        description: 'Please enter Consumer Key and Consumer Secret to test the connection.',
        variant: 'destructive',
      });
      return;
    }

    setTesting(true);
    try {
      // Test OAuth token generation
      const auth = btoa(`${credentials.consumer_key}:${credentials.consumer_secret}`);
      const apiUrl = credentials.environment === 'sandbox'
        ? 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
        : 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: 'Connection Successful! ✅',
          description: `Successfully connected to M-Pesa ${credentials.environment} API. Token received.`,
        });
      } else {
        const errorData = await response.text();
        toast({
          title: 'Connection Failed',
          description: 'Invalid credentials. Please check your Consumer Key and Secret.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Connection Error',
        description: error.message || 'Failed to connect to M-Pesa API',
        variant: 'destructive',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    // Validation
    if (!credentials.shortcode || !credentials.consumer_key || !credentials.consumer_secret || !credentials.passkey) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all required fields (Shortcode, Consumer Key, Consumer Secret, and Passkey).',
        variant: 'destructive',
      });
      return;
    }

    // Validate shortcode is numeric
    if (!/^\d+$/.test(credentials.shortcode)) {
      toast({
        title: 'Invalid Shortcode',
        description: 'Shortcode must contain only numbers.',
        variant: 'destructive',
      });
      return;
    }

    // Validate nominated phone if provided
    if (credentials.nominated_phone && !/^254\d{9}$/.test(credentials.nominated_phone)) {
      toast({
        title: 'Invalid Phone Number',
        description: 'Nominated phone must be in format 254XXXXXXXXX',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Deactivate any existing credentials first
      if (existingCreds) {
        await supabase
          .from('mpesa_credentials')
          .update({ is_active: false })
          .eq('user_id', user.id);
      }

      // Insert new credentials
      const { error } = await supabase
        .from('mpesa_credentials')
        .insert({
          user_id: user.id,
          shortcode: credentials.shortcode,
          consumer_key: credentials.consumer_key,
          consumer_secret: credentials.consumer_secret,
          passkey: credentials.passkey,
          nominated_phone: credentials.nominated_phone || null,
          environment: credentials.environment,
          is_active: true,
        });

      if (error) throw error;

      toast({
        title: 'M-Pesa Credentials Saved ✅',
        description: 'Your Daraja API credentials have been securely saved. You can now accept M-Pesa payments via STK Push.',
      });

      fetchCredentials();
    } catch (error: any) {
      console.error('Error saving M-Pesa credentials:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save credentials. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async () => {
    if (!existingCreds) return;

    try {
      const { error } = await supabase
        .from('mpesa_credentials')
        .update({ is_active: !credentials.is_active })
        .eq('id', existingCreds.id);

      if (error) throw error;

      setCredentials({ ...credentials, is_active: !credentials.is_active });
      toast({
        title: credentials.is_active ? 'M-Pesa Disabled' : 'M-Pesa Enabled',
        description: credentials.is_active 
          ? 'STK Push payments are now disabled' 
          : 'STK Push payments are now enabled',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              M-Pesa Daraja API Credentials
              {existingCreds && (
                <Badge variant={credentials.is_active ? 'default' : 'secondary'}>
                  {credentials.is_active ? 'Active' : 'Inactive'}
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="mt-2">
              Configure your Safaricom Daraja API credentials to enable STK Push payments directly to your Till or Paybill.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Info Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <p className="font-medium mb-2">How to get your Daraja API credentials:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Visit <a href="https://developer.safaricom.co.ke" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">Safaricom Developer Portal <ExternalLink className="h-3 w-3" /></a></li>
              <li>Create an app and select "Lipa Na M-Pesa Online"</li>
              <li>Copy your Consumer Key, Consumer Secret, and Passkey</li>
              <li>Use your Till or Paybill number as the Shortcode</li>
            </ol>
          </AlertDescription>
        </Alert>

        {/* Environment Selection */}
        <div className="space-y-2">
          <Label>Environment</Label>
          <div className="flex gap-4">
            <Button
              type="button"
              variant={credentials.environment === 'sandbox' ? 'default' : 'outline'}
              onClick={() => setCredentials({ ...credentials, environment: 'sandbox' })}
            >
              Sandbox (Test)
            </Button>
            <Button
              type="button"
              variant={credentials.environment === 'production' ? 'default' : 'outline'}
              onClick={() => setCredentials({ ...credentials, environment: 'production' })}
            >
              Production (Live)
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Use Sandbox for testing, switch to Production when ready to accept real payments
          </p>
        </div>

        {/* Shortcode */}
        <div className="space-y-2">
          <Label htmlFor="shortcode">
            Business Shortcode <span className="text-destructive">*</span>
          </Label>
          <Input
            id="shortcode"
            placeholder="Enter your Till or Paybill number (e.g., 174379)"
            value={credentials.shortcode}
            onChange={(e) => setCredentials({ ...credentials, shortcode: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">Your M-Pesa Till or Paybill number</p>
        </div>

        {/* Consumer Key */}
        <div className="space-y-2">
          <Label htmlFor="consumer_key">
            Consumer Key <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Input
              id="consumer_key"
              type={showSecrets.consumer_key ? 'text' : 'password'}
              placeholder="Enter your Daraja API Consumer Key"
              value={credentials.consumer_key}
              onChange={(e) => setCredentials({ ...credentials, consumer_key: e.target.value })}
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3"
              onClick={() => setShowSecrets({ ...showSecrets, consumer_key: !showSecrets.consumer_key })}
            >
              {showSecrets.consumer_key ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Consumer Secret */}
        <div className="space-y-2">
          <Label htmlFor="consumer_secret">
            Consumer Secret <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Input
              id="consumer_secret"
              type={showSecrets.consumer_secret ? 'text' : 'password'}
              placeholder="Enter your Daraja API Consumer Secret"
              value={credentials.consumer_secret}
              onChange={(e) => setCredentials({ ...credentials, consumer_secret: e.target.value })}
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3"
              onClick={() => setShowSecrets({ ...showSecrets, consumer_secret: !showSecrets.consumer_secret })}
            >
              {showSecrets.consumer_secret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Passkey */}
        <div className="space-y-2">
          <Label htmlFor="passkey">
            Passkey <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Input
              id="passkey"
              type={showSecrets.passkey ? 'text' : 'password'}
              placeholder="Enter your Lipa Na M-Pesa Online Passkey"
              value={credentials.passkey}
              onChange={(e) => setCredentials({ ...credentials, passkey: e.target.value })}
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3"
              onClick={() => setShowSecrets({ ...showSecrets, passkey: !showSecrets.passkey })}
            >
              {showSecrets.passkey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Nominated Phone */}
        <div className="space-y-2">
          <Label htmlFor="nominated_phone">Nominated Phone Number (Optional)</Label>
          <Input
            id="nominated_phone"
            placeholder="254712345678"
            value={credentials.nominated_phone}
            onChange={(e) => setCredentials({ ...credentials, nominated_phone: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            The phone number to receive B2C transaction notifications (format: 254XXXXXXXXX)
          </p>
        </div>

        {/* Active Toggle (only if credentials exist) */}
        {existingCreds && (
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Enable STK Push Payments</p>
              <p className="text-sm text-muted-foreground">
                Allow customers to pay via M-Pesa STK Push
              </p>
            </div>
            <Switch
              checked={credentials.is_active}
              onCheckedChange={toggleActive}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button onClick={handleSave} disabled={saving} className="flex-1">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Save Credentials
              </>
            )}
          </Button>
          <Button onClick={testConnection} disabled={testing} variant="outline">
            {testing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              'Test Connection'
            )}
          </Button>
        </div>

        {/* Security Note */}
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <strong>Security:</strong> Your credentials are encrypted and stored securely. We never share your API keys with third parties.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

