import React from 'react';
import { HeroSection } from '@/components/HeroSection';
import { StatsSection } from '@/components/StatsSection';
import { FeaturesSection } from '@/components/FeaturesSection';
import { PricingSection } from '@/components/PricingSection';
import { SEOHead } from '@/components/SEOHead';

const Index = () => {
  const handleNavigation = (section: string) => {
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleGetStarted = () => {
    window.location.href = '/get-started';
  };

  const handleLearnMore = () => {
    handleNavigation('features');
  };

  return (
    <>
      <SEOHead 
        title="M-Pesa & Mobile Money Payments for Kenyan Businesses"
        description="Accept M-Pesa, Airtel Money & mobile payments instantly. Professional invoicing, payment links & customer management for Kenyan SMEs. Start your free trial today."
        keywords="M-Pesa payments, Kenya payment gateway, mobile money, invoicing, payment links, SME payments, Airtel Money, business payments"
        canonicalUrl="https://lipasasa.online"
      />
      <HeroSection onGetStarted={handleGetStarted} onLearnMore={handleLearnMore} />
      <StatsSection />
      <FeaturesSection />
      <PricingSection />
    </>
  );
};

export default Index;