import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Smartphone,
  FileText,
  BarChart3,
  Shield,
  Zap,
  Globe,
  Users,
  CreditCard,
  MessageSquare,
  Settings,
  Download,
  Bell,
} from 'lucide-react';

export const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: Smartphone,
      title: 'Mobile Money Integration',
      description: 'Seamlessly connect your M-Pesa Paybill, Till, and Airtel Money accounts. Accept payments from any mobile wallet.',
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      icon: FileText,
      title: 'Professional Invoices',
      description: 'Create beautiful, branded invoices in seconds. Send via WhatsApp, SMS, or email with payment links included.',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      icon: BarChart3,
      title: 'Real-time Analytics',
      description: 'Track your payments, customer behavior, and revenue trends with detailed reports and insights.',
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      icon: Shield,
      title: 'Bank-level Security',
      description: 'Your data and payments are protected with enterprise-grade encryption and security measures.',
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
    {
      icon: MessageSquare,
      title: 'WhatsApp Integration',
      description: 'Send payment requests, invoices, and receipts directly via WhatsApp for instant customer engagement.',
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      icon: Users,
      title: 'Customer Management',
      description: 'Organize your customers, track payment history, and manage relationships from one dashboard.',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      icon: Download,
      title: 'Receipt Generation',
      description: 'Automatically generate professional PDF receipts for every payment. Perfect for accounting and compliance.',
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      icon: Settings,
      title: 'Easy Setup',
      description: 'Get started in minutes. No technical knowledge required. Our onboarding guides you every step.',
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
  ];

  const businessTypes = [
    {
      title: 'Small Retailers',
      description: 'Perfect for shops, boutiques, and small stores accepting mobile payments',
      icon: '🏪',
    },
    {
      title: 'Freelancers',
      description: 'Ideal for consultants, designers, and service providers',
      icon: '💼',
    },
    {
      title: 'Online Businesses',
      description: 'Great for e-commerce, digital services, and online marketplaces',
      icon: '🌐',
    },
    {
      title: 'Service Providers',
      description: 'Perfect for salons, repair services, and professional services',
      icon: '⚙️',
    },
  ];

  return (
    <section id="features" className="py-16 lg:py-24">
      <div className="container mx-auto px-4">
        {/* Features Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Zap className="h-4 w-4 text-primary mr-2" />
            <span className="text-sm font-medium text-primary">Powerful Features</span>
          </div>
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
            Everything You Need to{' '}
            <span className="gradient-hero bg-clip-text text-transparent">Accept Payments</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            LipaSasa combines the power of mobile money with professional invoicing and customer management tools.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="gradient-card shadow-medium hover:shadow-large transition-smooth p-6 group cursor-pointer"
            >
              <div className={`${feature.bgColor} ${feature.color} rounded-lg w-12 h-12 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>

        {/* Business Types */}
        <div className="gradient-card shadow-large rounded-2xl p-8 lg:p-12">
          <div className="text-center mb-12">
            <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
              Built for Every Type of Business
            </h3>
            <p className="text-lg text-muted-foreground">
              Whether you're just starting or scaling up, LipaSasa adapts to your business needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {businessTypes.map((type, index) => (
              <div key={index} className="text-center p-6 rounded-xl bg-background/50 shadow-soft hover:shadow-medium transition-smooth">
                <div className="text-4xl mb-4">{type.icon}</div>
                <h4 className="text-lg font-semibold text-foreground mb-2">{type.title}</h4>
                <p className="text-sm text-muted-foreground">{type.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button variant="hero" size="xl" className="group">
              Start Your Free Trial
              <CreditCard className="h-5 w-5 ml-2 group-hover:scale-110 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};