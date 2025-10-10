import React from 'react';
import { Code, Book, Zap, Shield } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';

export const ApiDocs = () => {
  return (
    <div className="min-h-screen">
      <SEOHead 
        title="API Documentation - Integrate LipaSasa Payment Gateway"
        description="Comprehensive API documentation for LipaSasa payment gateway. Integrate M-Pesa, Airtel Money, and card payments into your application with our RESTful API. Fast integration, secure transactions."
        keywords="LipaSasa API, payment gateway API, M-Pesa API Kenya, payment integration, REST API, webhook integration"
        canonicalUrl="https://lipasasa.online/docs"
      />
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              API Documentation
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Integrate LipaSasa seamlessly into your applications with our comprehensive API
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90">
                Get Started
              </button>
              <button className="px-6 py-3 border border-border rounded-lg font-medium hover:bg-slate-50">
                View Examples
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-16">
            {[
              { icon: Code, title: 'RESTful API', desc: 'Simple HTTP-based API' },
              { icon: Book, title: 'Documentation', desc: 'Comprehensive guides' },
              { icon: Zap, title: 'Fast Integration', desc: 'Get started in minutes' },
              { icon: Shield, title: 'Secure', desc: 'Enterprise-grade security' }
            ].map((item, i) => (
              <div key={i} className="text-center p-6 rounded-xl bg-slate-50">
                <item.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">Quick Start</h2>
            <div className="bg-slate-900 text-white p-6 rounded-lg mb-8">
              <pre className="text-sm">
{`curl -X POST https://api.lipasasa.online/v1/payments \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 1000,
    "currency": "KES",
    "phone": "+254716972103",
    "reference": "order-123"
  }'`}
              </pre>
            </div>
            
            <h3 className="text-xl font-semibold mb-4">Endpoints</h3>
            <div className="space-y-4">
              {[
                { method: 'POST', endpoint: '/v1/payments', desc: 'Create a payment' },
                { method: 'GET', endpoint: '/v1/payments/:id', desc: 'Get payment status' },
                { method: 'POST', endpoint: '/v1/webhooks', desc: 'Webhook notifications' }
              ].map((item, i) => (
                <div key={i} className="p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-4">
                    <span className="px-3 py-1 bg-primary text-white text-sm rounded">{item.method}</span>
                    <code className="text-sm bg-slate-100 px-2 py-1 rounded">{item.endpoint}</code>
                    <span className="text-muted-foreground">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};