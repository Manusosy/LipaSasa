import React from 'react';
import { PricingSection } from '@/components/PricingSection';
import { SEOHead } from '@/components/SEOHead';

export const PricingPage = () => {
  return (
    <div className="min-h-screen">
      <SEOHead 
        title="Pricing - Transparent Plans for Every Business | LipaSasa"
        description="Choose the perfect LipaSasa plan for your business. From free starter to enterprise, accept M-Pesa and online payments with transparent pricing. No hidden fees."
        keywords="LipaSasa pricing, payment gateway pricing Kenya, M-Pesa integration cost, affordable payment solution"
        canonicalUrl="https://lipasasa.online/pricing"
      />
      <PricingSection />
    </div>
  );
};

