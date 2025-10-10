import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, Zap, Globe } from 'lucide-react';
import { PaymentLogosCarousel } from './PaymentLogosCarousel';
import { TrustedCompanies } from './TrustedCompanies';

interface HeroSectionProps {
  onGetStarted?: () => void;
  onLearnMore?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted, onLearnMore }) => {
  return (
    <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden bg-gradient-to-b from-white to-slate-50">
      {/* Background Elements */}
      <div className="absolute inset-0 hero-gradient opacity-90" />
      <div className="absolute top-0 right-0 w-full h-full hero-glow" />
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-white/80 to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Shield className="h-4 w-4 text-[#0033a1] mr-2" />
              <span className="text-sm font-medium text-[#0033a1]">Trusted by 1000+ Kenyan Businesses</span>
            </div>

            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Accept{' '}
              <span className="bg-gradient-to-r from-[#0033a1] to-[#00b4b0] bg-clip-text text-transparent">
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
            <div className="mt-12 pt-8 border-t border-border/50">
              <div className="flex flex-col items-start">
                <p className="text-sm text-muted-foreground mb-6 font-medium">Integrated with leading payment providers</p>
                <div className="w-full overflow-hidden -ml-4">
                  <PaymentLogosCarousel />
                </div>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative flex items-center justify-center">
            <div className="absolute w-[95%] h-[95%] bg-gradient-to-r from-[#0033a1]/5 to-[#00b4b0]/5 rounded-full blur-3xl animate-pulse-slow"></div>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-[#0033a1]/10 to-[#00b4b0]/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-700"></div>
              <img
                src="/payonline.png"
                alt="Online Payment Vector Illustration"
                style={{ animation: 'float 8s ease-in-out infinite' }}
                className="w-[90%] h-auto object-contain relative z-10 transform transition-all duration-700 hover:scale-102 mx-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};