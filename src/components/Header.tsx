import React from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, Menu, X } from 'lucide-react';

interface HeaderProps {
  onNavClick?: (section: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavClick }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navigationItems = [
    { name: 'Features', id: 'features' },
    { name: 'Pricing', id: 'pricing' },
    { name: 'About', id: 'about' },
  ];

  const handleNavClick = (sectionId: string) => {
    onNavClick?.(sectionId);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 gradient-card shadow-medium backdrop-blur-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <img 
              src="/chapapay-logo.png" 
              alt="LipaSasa Logo"
              className="h-14 w-auto" 
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className="text-muted-foreground hover:text-foreground transition-smooth font-medium"
              >
                {item.name}
              </button>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => window.location.href = '/auth'}
              className="font-medium"
            >
              Sign In
            </Button>
            <Button
              variant="hero"
              size="lg"
              onClick={() => window.location.href = '/get-started'}
              className="font-semibold"
            >
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-border">
            <nav className="flex flex-col space-y-4">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className="text-left text-muted-foreground hover:text-foreground transition-smooth font-medium py-2"
                >
                  {item.name}
                </button>
              ))}
              <div className="flex flex-col space-y-3 pt-4 border-t border-border">
                <Button
                  variant="ghost"
                  onClick={() => window.location.href = '/auth'}
                  className="justify-start font-medium"
                >
                  Sign In
                </Button>
                <Button
                  variant="hero"
                  onClick={() => window.location.href = '/get-started'}
                  className="font-semibold"
                >
                  Get Started
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};