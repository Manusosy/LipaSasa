import React from 'react';
import { HeroSection } from '@/components/HeroSection';
import { StatsSection } from '@/components/StatsSection';
import { FeaturesSection } from '@/components/FeaturesSection';
import { PricingSection } from '@/components/PricingSection';

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
      <HeroSection onGetStarted={handleGetStarted} onLearnMore={handleLearnMore} />
      <StatsSection />
      <FeaturesSection />
      <PricingSection />
    </>
  );
};

export default Index;