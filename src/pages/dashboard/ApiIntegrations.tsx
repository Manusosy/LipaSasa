import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Code, 
  Copy, 
  RefreshCw, 
  Eye, 
  EyeOff,
  CheckCircle2,
  Terminal,
  BookOpen,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { requireMerchant } from '@/lib/auth-utils';

const ApiIntegrations = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [apiSecret, setApiSecret] = useState<string>('');
  const [showSecret, setShowSecret] = useState(false);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate('/auth');
        return;
      }

      const hasAccess = await requireMerchant(navigate);
      if (!hasAccess) {
        return;
      }

      fetchApiKeys();
    };

    checkAccess();
  }, [navigate]);

  const fetchApiKeys = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setApiKey(data.api_key);
        setApiSecret(data.api_secret);
      } else {
        // Generate new keys if none exist
        await generateApiKeys();
      }
    } catch (error) {
      console.error('Error fetching API keys:', error);
      toast({
        title: 'Error',
        description: 'Failed to load API keys',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const generateApiKeys = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Generate random keys (in production, use a more secure method)
      const newApiKey = `lpsk_${generateRandomString(32)}`;
      const newApiSecret = `lpss_${generateRandomString(48)}`;

      const { error } = await supabase
        .from('api_keys')
        .insert({
          user_id: user.id,
          api_key: newApiKey,
          api_secret: newApiSecret,
          is_active: true,
        });

      if (error) throw error;

      setApiKey(newApiKey);
      setApiSecret(newApiSecret);
    } catch (error: any) {
      console.error('Error generating API keys:', error);
      throw error;
    }
  };

  const handleRegenerate = async () => {
    if (!confirm('Are you sure? This will invalidate your current API credentials.')) {
      return;
    }

    setRegenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Deactivate old keys
      await supabase
        .from('api_keys')
        .update({ is_active: false })
        .eq('user_id', user.id);

      // Generate new keys
      await generateApiKeys();

      toast({
        title: 'Success',
        description: 'New API credentials generated',
      });
    } catch (error: any) {
      console.error('Error regenerating keys:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to regenerate keys',
        variant: 'destructive',
      });
    } finally {
      setRegenerating(false);
    }
  };

  const generateRandomString = (length: number) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: `${label} copied to clipboard`,
    });
  };

  // Code examples
  const nodeExample = `const axios = require('axios');

const apiKey = '${apiKey}';
const apiSecret = '${apiSecret}';

// Create an invoice
async function createInvoice() {
  try {
    const response = await axios.post(
      'https://api.lipasasa.com/v1/invoices',
      {
        customer_name: 'John Doe',
        customer_phone: '254712345678',
        amount: 1000,
        description: 'Payment for services'
      },
      {
        headers: {
          'X-API-Key': apiKey,
          'X-API-Secret': apiSecret,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Invoice created:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

createInvoice();`;

  const pythonExample = `import requests

api_key = '${apiKey}'
api_secret = '${apiSecret}'

# Create an invoice
def create_invoice():
    url = 'https://api.lipasasa.com/v1/invoices'
    
    headers = {
        'X-API-Key': api_key,
        'X-API-Secret': api_secret,
        'Content-Type': 'application/json'
    }
    
    data = {
        'customer_name': 'John Doe',
        'customer_phone': '254712345678',
        'amount': 1000,
        'description': 'Payment for services'
    }
    
    try:
        response = requests.post(url, json=data, headers=headers)
        response.raise_for_status()
        print('Invoice created:', response.json())
        return response.json()
    except requests.exceptions.RequestException as e:
        print('Error:', e)

create_invoice()`;

  const phpExample = `<?php

$apiKey = '${apiKey}';
$apiSecret = '${apiSecret}';

// Create an invoice
function createInvoice($apiKey, $apiSecret) {
    $url = 'https://api.lipasasa.com/v1/invoices';
    
    $data = array(
        'customer_name' => 'John Doe',
        'customer_phone' => '254712345678',
        'amount' => 1000,
        'description' => 'Payment for services'
    );
    
    $options = array(
        'http' => array(
            'header'  => "X-API-Key: $apiKey\\r\\n" .
                        "X-API-Secret: $apiSecret\\r\\n" .
                        "Content-Type: application/json\\r\\n",
            'method'  => 'POST',
            'content' => json_encode($data)
        )
    );
    
    $context  = stream_context_create($options);
    $result = file_get_contents($url, false, $context);
    
    if ($result === FALSE) {
        echo 'Error creating invoice';
    } else {
        echo 'Invoice created: ' . $result;
    }
    
    return json_decode($result, true);
}

createInvoice($apiKey, $apiSecret);

?>`;

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
    <div className="min-h-screen bg-background flex w-full">
      {/* Mobile Overlay */}
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
                <h1 className="text-lg lg:text-xl font-bold text-foreground">API & Integrations</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Integrate LipaSasa into your applications
                </p>
              </div>
            </div>
            <Badge className="bg-success text-success-foreground hidden sm:flex">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Active
            </Badge>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 lg:p-6 max-w-6xl mx-auto">
          {/* API Credentials */}
          <Card className="border border-border mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-primary" />
                    API Credentials
                  </CardTitle>
                  <CardDescription>
                    Use these credentials to authenticate API requests
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRegenerate}
                  disabled={regenerating}
                >
                  <RefreshCw className={cn('w-4 h-4 mr-2', regenerating && 'animate-spin')} />
                  Regenerate
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* API Key */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">API Key</label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(apiKey, 'API Key')}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <div className="p-3 bg-muted rounded-lg font-mono text-sm break-all">
                  {apiKey}
                </div>
              </div>

              {/* API Secret */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">API Secret</label>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSecret(!showSecret)}
                    >
                      {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(apiSecret, 'API Secret')}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-3 bg-muted rounded-lg font-mono text-sm break-all">
                  {showSecret ? apiSecret : '••••••••••••••••••••••••••••••••••••'}
                </div>
              </div>

              <div className="text-xs text-muted-foreground bg-warning/10 p-3 rounded-lg border border-warning/20">
                <p className="font-medium text-warning mb-1">⚠️ Keep your credentials secure</p>
                <p>Never expose your API secret in client-side code or public repositories.</p>
              </div>
            </CardContent>
          </Card>

          {/* Code Examples */}
          <Card className="border border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5 text-primary" />
                Code Examples
              </CardTitle>
              <CardDescription>
                Sample code for creating invoices via API
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="node">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="node">Node.js</TabsTrigger>
                  <TabsTrigger value="python">Python</TabsTrigger>
                  <TabsTrigger value="php">PHP</TabsTrigger>
                </TabsList>

                <TabsContent value="node" className="space-y-3">
                  <div className="relative">
                    <pre className="p-4 bg-muted rounded-lg overflow-x-auto text-sm">
                      <code>{nodeExample}</code>
                    </pre>
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(nodeExample, 'Code')}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="python" className="space-y-3">
                  <div className="relative">
                    <pre className="p-4 bg-muted rounded-lg overflow-x-auto text-sm">
                      <code>{pythonExample}</code>
                    </pre>
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(pythonExample, 'Code')}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="php" className="space-y-3">
                  <div className="relative">
                    <pre className="p-4 bg-muted rounded-lg overflow-x-auto text-sm">
                      <code>{phpExample}</code>
                    </pre>
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(phpExample, 'Code')}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* API Documentation Link */}
          <Card className="border border-border mt-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">Full API Documentation</h3>
                  <p className="text-sm text-muted-foreground">
                    View complete API reference with all endpoints, parameters, and response formats
                  </p>
                </div>
                <Button variant="outline">
                  View Docs
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ApiIntegrations;
