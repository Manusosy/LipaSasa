import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, Zap, Globe } from 'lucide-react';
import heroImage from '@/assets/hero-fintech.jpg';
import { PaymentLogosCarousel } from './PaymentLogosCarousel';

interface HeroSectionProps {
  onGetStarted?: () => void;
  onLearnMore?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted, onLearnMore }) => {
  return (
    <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 gradient-hero opacity-5" />
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary-glow/10 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-success/10 rounded-full blur-3xl animate-float" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Shield className="h-4 w-4 text-primary mr-2" />
              <span className="text-sm font-medium text-primary">Trusted by 1000+ Kenyan Businesses</span>
            </div>

            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Accept{' '}
              <span className="gradient-hero bg-clip-text text-transparent">
                M-Pesa & Mobile Money
              </span>{' '}
              Payments Instantly
            </h1>

            <p className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Transform your business with professional invoices, payment links, and seamless mobile money integration. 
              Connect your existing Paybill, Till, or Airtel Money account in minutes.
            </p>

            {/* Key Benefits */}
            <div className="flex flex-wrap gap-6 mb-8 justify-center lg:justify-start">
              <div className="flex items-center text-muted-foreground">
                <Zap className="h-5 w-5 text-success mr-2" />
                <span className="font-medium">Setup in 5 minutes</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <Shield className="h-5 w-5 text-success mr-2" />
                <span className="font-medium">Bank-level security</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <Globe className="h-5 w-5 text-success mr-2" />
                <span className="font-medium">Kenya-first solution</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                variant="hero"
                size="xl"
                onClick={() => window.location.href = '/get-started'}
                className="group"
              >
                Start Free Trial
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                size="xl"
                onClick={onLearnMore}
                className="shadow-soft"
              >
                Watch Demo
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground mb-4">Integrated with leading payment providers</p>
              <PaymentLogosCarousel />
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="gradient-card rounded-2xl p-8 shadow-large animate-float">
              <img
                src={heroImage}
                alt="ChapaPay Payment Dashboard showing M-Pesa and mobile money integrations"
                className="w-full rounded-xl shadow-medium"
              />
            </div>
            
            {/* Floating Stats Cards */}
            <div className="absolute -top-4 -left-4 gradient-success rounded-lg p-4 shadow-medium animate-pulse-slow hidden lg:block">
              <div className="text-success-foreground">
                <p className="text-sm font-medium">Payments Processed</p>
                <p className="text-2xl font-bold">KSh 2.4M+</p>
              </div>
            </div>
            
            <div className="absolute -bottom-4 -right-4 gradient-primary  rounded-lg p-4 shadow-medium animate-float hidden lg:block">
              <div className="text-primary-foreground">
                <p className="text-sm font-medium">Success Rate</p>
                <p className="text-2xl font-bold">99.8%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};