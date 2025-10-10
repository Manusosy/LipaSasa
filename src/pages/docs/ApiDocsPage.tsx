import React, { useState } from 'react';
import { SEOHead } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Code, 
  Book, 
  Zap, 
  Shield, 
  Key, 
  FileText, 
  Link as LinkIcon,
  CreditCard,
  Webhook,
  AlertCircle,
  TrendingUp,
  Lock
} from 'lucide-react';
import { ApiEndpoint } from '@/components/docs/ApiEndpoint';
import { ParameterTable, Parameter } from '@/components/docs/ParameterTable';
import { TabbedCodeExamples, CodeExample } from '@/components/docs/TabbedCodeExamples';
import { CodeBlock } from '@/components/docs/CodeBlock';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export const ApiDocsPage = () => {
  const [activeSection, setActiveSection] = useState('introduction');

  const sections = [
    { id: 'introduction', name: 'Introduction', icon: Book },
    { id: 'authentication', name: 'Authentication', icon: Key },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'invoices', name: 'Invoices', icon: FileText },
    { id: 'payment-links', name: 'Payment Links', icon: LinkIcon },
    { id: 'transactions', name: 'Transactions', icon: CreditCard },
    { id: 'webhooks', name: 'Webhooks', icon: Webhook },
    { id: 'errors', name: 'Error Handling', icon: AlertCircle },
    { id: 'rate-limits', name: 'Rate Limits', icon: TrendingUp },
  ];

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen">
      <SEOHead 
        title="API Documentation - LipaSasa Payment Gateway"
        description="Complete API reference for integrating LipaSasa payment gateway. Secure M-Pesa payments, invoicing, and webhooks with comprehensive examples."
        keywords="LipaSasa API, payment gateway API, M-Pesa integration, REST API, webhook integration, API security"
        canonicalUrl="https://lipasasa.online/docs"
      />

      {/* Hero */}
      <section className="relative py-16 bg-gradient-to-br from-primary/10 via-background to-secondary/10 border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              API Documentation
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Build powerful payment experiences with LipaSasa's secure and reliable API
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button onClick={() => scrollToSection('authentication')} size="lg">
                Get API Keys
              </Button>
              <Button variant="outline" size="lg" onClick={() => scrollToSection('invoices')}>
                View Examples
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24">
              <ScrollArea className="h-[calc(100vh-8rem)]">
                <nav className="space-y-1">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full flex items-center gap-3 px-4 py-2 text-sm rounded-lg transition-colors ${
                        activeSection === section.id
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      }`}
                    >
                      <section.icon className="h-4 w-4" />
                      {section.name}
                    </button>
                  ))}
                </nav>
              </ScrollArea>
            </div>
          </aside>

          {/* Documentation Content */}
          <main className="flex-1 max-w-4xl">
            {/* Introduction */}
            <section id="introduction" className="mb-16 scroll-mt-24">
              <h2 className="text-3xl font-bold mb-6">Introduction</h2>
              
              <p className="text-lg text-muted-foreground mb-6">
                Welcome to the LipaSasa API documentation. Our API allows you to programmatically create invoices, 
                generate payment links, and manage transactions with M-Pesa integration.
              </p>

              <Alert className="mb-6">
                <Shield className="h-4 w-4" />
                <AlertTitle>Secure by Default</AlertTitle>
                <AlertDescription>
                  All API requests are encrypted using TLS 1.3. We never store sensitive payment data on our servers.
                </AlertDescription>
              </Alert>

              <div className="grid md:grid-cols-4 gap-4 mb-8">
                {[
                  { icon: Code, title: 'RESTful API', desc: 'Standard HTTP methods' },
                  { icon: Shield, title: 'Secure', desc: 'Enterprise-grade security' },
                  { icon: Zap, title: 'Fast', desc: 'Low latency responses' },
                  { icon: Book, title: 'Well Documented', desc: 'Clear examples' }
                ].map((item, i) => (
                  <div key={i} className="p-4 border border-border rounded-lg text-center">
                    <item.icon className="h-8 w-8 text-primary mx-auto mb-2" />
                    <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Base URL</h3>
                <CodeBlock 
                  code="https://api.lipasasa.online/v1" 
                  language="text"
                />
                <p className="text-sm text-muted-foreground mt-4">
                  All API requests must be made over HTTPS. Requests made over plain HTTP will fail.
                </p>
              </div>
            </section>

            {/* Authentication */}
            <section id="authentication" className="mb-16 scroll-mt-24">
              <h2 className="text-3xl font-bold mb-6">Authentication</h2>
              
              <p className="text-muted-foreground mb-6">
                LipaSasa uses API keys to authenticate requests. You can obtain your API keys from your dashboard 
                after subscribing to a paid plan.
              </p>

              <Alert variant="destructive" className="mb-6">
                <Lock className="h-4 w-4" />
                <AlertTitle>Keep Your API Keys Secret</AlertTitle>
                <AlertDescription>
                  Never share your API keys or commit them to version control. Treat them like passwords.
                </AlertDescription>
              </Alert>

              <h3 className="text-xl font-semibold mb-4">Getting Your API Keys</h3>
              <ol className="list-decimal list-inside space-y-2 mb-6 text-muted-foreground">
                <li>Sign up for a LipaSasa account</li>
                <li>Subscribe to a Pro or Enterprise plan</li>
                <li>Navigate to Dashboard → API Integrations</li>
                <li>Copy your API Key and API Secret</li>
              </ol>

              <h3 className="text-xl font-semibold mb-4">Using API Keys</h3>
              <p className="text-muted-foreground mb-4">
                Include your API key in the <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">Authorization</code> header 
                of every request:
              </p>

              <TabbedCodeExamples 
                examples={[
                  {
                    language: 'curl',
                    label: 'cURL',
                    code: `curl https://api.lipasasa.online/v1/invoices \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`
                  },
                  {
                    language: 'javascript',
                    label: 'JavaScript',
                    code: `const response = await fetch('https://api.lipasasa.online/v1/invoices', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();`
                  },
                  {
                    language: 'python',
                    label: 'Python',
                    code: `import requests

headers = {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
}

response = requests.get('https://api.lipasasa.online/v1/invoices', headers=headers)
data = response.json()`
                  }
                ]}
              />
            </section>

            {/* Security */}
            <section id="security" className="mb-16 scroll-mt-24">
              <h2 className="text-3xl font-bold mb-6">Security Best Practices</h2>
              
              <div className="space-y-6">
                <div className="border border-border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    API Key Security
                  </h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Store API keys in environment variables, never in code</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Rotate keys regularly (at least every 90 days)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Use different keys for development and production</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Revoke compromised keys immediately from your dashboard</span>
                    </li>
                  </ul>
                </div>

                <div className="border border-border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Lock className="h-5 w-5 text-primary" />
                    Webhook Signature Verification
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Always verify webhook signatures to ensure requests are from LipaSasa:
                  </p>
                  <CodeBlock 
                    language="javascript"
                    code={`const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  const computedSignature = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(computedSignature)
  );
}

// In your webhook handler
const isValid = verifyWebhookSignature(
  req.body,
  req.headers['x-lipasasa-signature'],
  process.env.WEBHOOK_SECRET
);

if (!isValid) {
  return res.status(401).send('Invalid signature');
}`}
                  />
                </div>

                <div className="border border-border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-3">HTTPS Only</h3>
                  <p className="text-muted-foreground">
                    All API requests must be made over HTTPS. We automatically reject any requests made over HTTP 
                    to protect your data in transit.
                  </p>
                </div>

                <div className="border border-border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-3">IP Whitelisting</h3>
                  <p className="text-muted-foreground">
                    For enhanced security, you can whitelist specific IP addresses that are allowed to use your API keys. 
                    Configure this in your dashboard under API Settings.
                  </p>
                </div>
              </div>
            </section>

            {/* Create Invoice Endpoint */}
            <section id="invoices" className="mb-16 scroll-mt-24">
              <h2 className="text-3xl font-bold mb-6">Invoices</h2>
              
              <p className="text-muted-foreground mb-8">
                Create and manage invoices programmatically. Each invoice generates a unique payment link that you can share with customers.
              </p>

              <h3 className="text-2xl font-semibold mb-4">Create an Invoice</h3>
              
              <ApiEndpoint 
                method="POST"
                path="/v1/invoices"
                description="Creates a new invoice and generates a unique payment link."
              />

              <ParameterTable 
                parameters={[
                  {
                    name: 'customer_name',
                    type: 'string',
                    required: true,
                    description: 'Full name of the customer'
                  },
                  {
                    name: 'customer_email',
                    type: 'string',
                    required: false,
                    description: 'Customer email address for notifications'
                  },
                  {
                    name: 'amount',
                    type: 'number',
                    required: true,
                    description: 'Invoice amount in KES (minimum 10)'
                  },
                  {
                    name: 'description',
                    type: 'string',
                    required: true,
                    description: 'Brief description of what the invoice is for'
                  },
                  {
                    name: 'currency',
                    type: 'string',
                    required: false,
                    description: 'Currency code',
                    default: 'KES'
                  },
                  {
                    name: 'expires_at',
                    type: 'string (ISO 8601)',
                    required: false,
                    description: 'Invoice expiration date',
                    default: '30 days from creation'
                  }
                ]}
              />

              <TabbedCodeExamples 
                title="Example Request"
                examples={[
                  {
                    language: 'curl',
                    label: 'cURL',
                    code: `curl -X POST https://api.lipasasa.online/v1/invoices \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "amount": 5000,
    "description": "Website Development Services",
    "currency": "KES"
  }'`
                  },
                  {
                    language: 'javascript',
                    label: 'JavaScript',
                    code: `const response = await fetch('https://api.lipasasa.online/v1/invoices', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    customer_name: 'John Doe',
    customer_email: 'john@example.com',
    amount: 5000,
    description: 'Website Development Services',
    currency: 'KES'
  })
});

const invoice = await response.json();
console.log('Payment link:', invoice.payment_link);`
                  },
                  {
                    language: 'python',
                    label: 'Python',
                    code: `import requests

headers = {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
}

data = {
    'customer_name': 'John Doe',
    'customer_email': 'john@example.com',
    'amount': 5000,
    'description': 'Website Development Services',
    'currency': 'KES'
}

response = requests.post(
    'https://api.lipasasa.online/v1/invoices',
    headers=headers,
    json=data
)

invoice = response.json()
print(f"Payment link: {invoice['payment_link']}")`
                  }
                ]}
              />

              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-4">Success Response (201 Created)</h4>
                <CodeBlock 
                  language="json"
                  code={`{
  "id": "inv_1a2b3c4d5e6f",
  "invoice_number": "INV-2025-001",
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "amount": 5000,
  "currency": "KES",
  "description": "Website Development Services",
  "status": "pending",
  "payment_link": "https://lipasasa.online/pay/inv_1a2b3c4d5e6f",
  "created_at": "2025-10-10T12:00:00Z",
  "expires_at": "2025-11-09T12:00:00Z"
}`}
                />
              </div>
            </section>

            {/* Get Invoice */}
            <div className="mb-16">
              <h3 className="text-2xl font-semibold mb-4">Retrieve an Invoice</h3>
              
              <ApiEndpoint 
                method="GET"
                path="/v1/invoices/:id"
                description="Retrieves the details of an existing invoice by ID."
              />

              <ParameterTable 
                title="Path Parameters"
                parameters={[
                  {
                    name: 'id',
                    type: 'string',
                    required: true,
                    description: 'The invoice ID'
                  }
                ]}
              />

              <TabbedCodeExamples 
                examples={[
                  {
                    language: 'curl',
                    label: 'cURL',
                    code: `curl https://api.lipasasa.online/v1/invoices/inv_1a2b3c4d5e6f \\
  -H "Authorization: Bearer YOUR_API_KEY"`
                  },
                  {
                    language: 'javascript',
                    label: 'JavaScript',
                    code: `const response = await fetch('https://api.lipasasa.online/v1/invoices/inv_1a2b3c4d5e6f', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
});

const invoice = await response.json();`
                  }
                ]}
              />
            </div>

            {/* Webhooks */}
            <section id="webhooks" className="mb-16 scroll-mt-24">
              <h2 className="text-3xl font-bold mb-6">Webhooks</h2>
              
              <p className="text-muted-foreground mb-6">
                Webhooks allow you to receive real-time notifications when events occur in your LipaSasa account, 
                such as successful payments or invoice status changes.
              </p>

              <Alert className="mb-6">
                <Shield className="h-4 w-4" />
                <AlertTitle>Always Verify Signatures</AlertTitle>
                <AlertDescription>
                  Verify the webhook signature to ensure the request is from LipaSasa before processing.
                </AlertDescription>
              </Alert>

              <h3 className="text-xl font-semibold mb-4">Webhook Events</h3>
              <div className="space-y-3 mb-8">
                {[
                  { event: 'invoice.paid', description: 'Triggered when an invoice is successfully paid' },
                  { event: 'invoice.failed', description: 'Triggered when a payment attempt fails' },
                  { event: 'invoice.expired', description: 'Triggered when an invoice expires' },
                  { event: 'transaction.completed', description: 'Triggered when a transaction completes' },
                ].map((item) => (
                  <div key={item.event} className="border border-border rounded-lg p-4">
                    <code className="text-primary font-mono">{item.event}</code>
                    <p className="text-sm text-muted-foreground mt-2">{item.description}</p>
                  </div>
                ))}
              </div>

              <h3 className="text-xl font-semibold mb-4">Webhook Payload Example</h3>
              <CodeBlock 
                language="json"
                code={`{
  "event": "invoice.paid",
  "timestamp": "2025-10-10T12:30:00Z",
  "data": {
    "invoice_id": "inv_1a2b3c4d5e6f",
    "invoice_number": "INV-2025-001",
    "amount": 5000,
    "currency": "KES",
    "customer_name": "John Doe",
    "mpesa_receipt": "QK12XYZ789",
    "phone_number": "254712345678",
    "paid_at": "2025-10-10T12:29:45Z"
  }
}`}
              />
            </section>

            {/* Error Handling */}
            <section id="errors" className="mb-16 scroll-mt-24">
              <h2 className="text-3xl font-bold mb-6">Error Handling</h2>
              
              <p className="text-muted-foreground mb-6">
                LipaSasa uses conventional HTTP response codes to indicate the success or failure of an API request.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  { code: '200', status: 'OK', description: 'The request was successful' },
                  { code: '201', status: 'Created', description: 'Resource created successfully' },
                  { code: '400', status: 'Bad Request', description: 'Invalid request parameters' },
                  { code: '401', status: 'Unauthorized', description: 'Invalid or missing API key' },
                  { code: '403', status: 'Forbidden', description: 'API key doesn\'t have permission' },
                  { code: '404', status: 'Not Found', description: 'Resource not found' },
                  { code: '429', status: 'Too Many Requests', description: 'Rate limit exceeded' },
                  { code: '500', status: 'Server Error', description: 'Something went wrong on our end' },
                ].map((error) => (
                  <div key={error.code} className="flex items-start gap-4 p-4 border border-border rounded-lg">
                    <code className="text-lg font-mono font-bold text-primary">{error.code}</code>
                    <div>
                      <div className="font-semibold">{error.status}</div>
                      <div className="text-sm text-muted-foreground">{error.description}</div>
                    </div>
                  </div>
                ))}
              </div>

              <h3 className="text-xl font-semibold mb-4">Error Response Format</h3>
              <CodeBlock 
                language="json"
                code={`{
  "error": {
    "code": "invalid_request",
    "message": "Amount must be at least 10 KES",
    "param": "amount",
    "type": "validation_error"
  }
}`}
              />
            </section>

            {/* Rate Limits */}
            <section id="rate-limits" className="mb-16 scroll-mt-24">
              <h2 className="text-3xl font-bold mb-6">Rate Limits</h2>
              
              <p className="text-muted-foreground mb-6">
                To ensure fair usage and system stability, the LipaSasa API enforces rate limits based on your subscription plan.
              </p>

              <div className="grid md:grid-cols-3 gap-4 mb-8">
                {[
                  { plan: 'Starter', limit: '60 requests/minute', burst: '100 requests/hour' },
                  { plan: 'Professional', limit: '300 requests/minute', burst: '600 requests/hour' },
                  { plan: 'Enterprise', limit: '1000 requests/minute', burst: 'Custom' },
                ].map((item) => (
                  <div key={item.plan} className="border border-border rounded-lg p-6">
                    <h3 className="font-semibold text-lg mb-2">{item.plan}</h3>
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Rate Limit:</span>
                        <div className="font-mono text-primary">{item.limit}</div>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Burst Limit:</span>
                        <div className="font-mono text-primary">{item.burst}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <h3 className="text-xl font-semibold mb-4">Rate Limit Headers</h3>
              <p className="text-muted-foreground mb-4">
                Every API response includes headers with your current rate limit status:
              </p>
              <CodeBlock 
                language="text"
                code={`X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1696944000`}
              />
            </section>
          </main>
        </div>
      </div>
    </div>
  );
};

