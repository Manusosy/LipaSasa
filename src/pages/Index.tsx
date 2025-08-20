import React from 'react';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { StatsSection } from '@/components/StatsSection';
import { FeaturesSection } from '@/components/FeaturesSection';

const Index = () => {
  const handleNavigation = (section: string) => {
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleGetStarted = () => {
    // In a real app, this would navigate to signup
    console.log('Get started clicked');
  };

  const handleLearnMore = () => {
    // In a real app, this would show a demo or navigate to features
    handleNavigation('features');
  };

  return (
    <div className="min-h-screen">
      <Header onNavClick={handleNavigation} />
      <main>
        <HeroSection onGetStarted={handleGetStarted} onLearnMore={handleLearnMore} />
        <StatsSection />
        <FeaturesSection />
      </main>
    </div>
  );
};

export default Index;
