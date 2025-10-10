import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  CreditCard, 
  Menu, 
  X, 
  LogOut, 
  LayoutDashboard, 
  ChevronDown,
  FileText,
  HelpCircle,
  BookOpen,
  Users,
  Briefcase,
  Newspaper,
  Phone,
  Info,
  Activity
} from 'lucide-react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onNavClick?: (section: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavClick }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const productLinks = [
    { 
      name: 'Pricing & Features', 
      href: '/#pricing',
      description: 'Plans, features, and transparent pricing',
      icon: FileText 
    },
    { 
      name: 'API Documentation', 
      href: '/docs',
      description: 'Integrate LipaSasa into your app',
      icon: BookOpen 
    },
    { 
      name: 'System Status', 
      href: '/status',
      description: 'Real-time platform status',
      icon: Activity 
    },
  ];

  const companyLinks = [
    { 
      name: 'About Us', 
      href: '/about',
      description: 'Learn about our mission',
      icon: Info 
    },
    { 
      name: 'Careers', 
      href: '/careers',
      description: 'Join our growing team',
      icon: Briefcase 
    },
    { 
      name: 'Blog', 
      href: '/blog',
      description: 'Latest news and insights',
      icon: Newspaper 
    },
    { 
      name: 'Press Kit', 
      href: '/press',
      description: 'Media resources',
      icon: Users 
    },
  ];

  const supportLinks = [
    { 
      name: 'Help Center', 
      href: '/help',
      description: 'Get answers to your questions',
      icon: HelpCircle 
    },
    { 
      name: 'Contact Us', 
      href: '/contact',
      description: 'We\'re here to help',
      icon: Phone 
    },
  ];

  const handleNavClick = (href: string) => {
    if (href.startsWith('/#')) {
      const sectionId = href.substring(2);
      onNavClick?.(sectionId);
    } else {
      navigate(href);
    }
    setIsMobileMenuOpen(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const handleDashboard = () => {
    navigate('/dashboard');
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 gradient-card shadow-medium backdrop-blur-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <img 
              src="/lipasasa-logo.png" 
              alt="LipaSasa Logo"
              className="h-10 w-auto" 
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-2">
            <NavigationMenu>
              <NavigationMenuList>
                {/* Product Dropdown */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-muted-foreground hover:text-foreground">
                    Product
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      {productLinks.map((item) => (
                        <li key={item.name}>
                          <NavigationMenuLink asChild>
                            <a
                              href={item.href}
                              onClick={(e) => {
                                e.preventDefault();
                                handleNavClick(item.href);
                              }}
                              className={cn(
                                "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                              )}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <item.icon className="h-4 w-4 text-primary" />
                                <div className="text-sm font-medium leading-none">{item.name}</div>
                              </div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                {item.description}
                              </p>
                            </a>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Company Dropdown */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-muted-foreground hover:text-foreground">
                    Company
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                      {companyLinks.map((item) => (
                        <li key={item.name}>
                          <NavigationMenuLink asChild>
                            <a
                              href={item.href}
                              onClick={(e) => {
                                e.preventDefault();
                                handleNavClick(item.href);
                              }}
                              className={cn(
                                "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                              )}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <item.icon className="h-4 w-4 text-primary" />
                                <div className="text-sm font-medium leading-none">{item.name}</div>
                              </div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                {item.description}
                              </p>
                            </a>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Support Dropdown */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-muted-foreground hover:text-foreground">
                    Support
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4">
                      {supportLinks.map((item) => (
                        <li key={item.name}>
                          <NavigationMenuLink asChild>
                            <a
                              href={item.href}
                              onClick={(e) => {
                                e.preventDefault();
                                handleNavClick(item.href);
                              }}
                              className={cn(
                                "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                              )}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <item.icon className="h-4 w-4 text-primary" />
                                <div className="text-sm font-medium leading-none">{item.name}</div>
                              </div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                {item.description}
                              </p>
                            </a>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center space-x-4">
            {user ? (
              <>
                <Button
                  variant="ghost"
                  onClick={handleDashboard}
                  className="font-medium"
                >
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
                <Button
                  variant="outline"
                  onClick={handleSignOut}
                  className="font-medium"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => navigate('/auth')}
                  className="font-medium"
                >
                  Sign In
                </Button>
                <Button
                  variant="hero"
                  size="lg"
                  onClick={() => navigate('/get-started')}
                  className="font-semibold"
                >
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
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
          <div className="lg:hidden mt-4 py-4 border-t border-border">
            <nav className="flex flex-col space-y-4">
              {/* Product Section */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase px-2">Product</p>
                {productLinks.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => handleNavClick(item.href)}
                    className="flex items-start gap-3 w-full text-left text-muted-foreground hover:text-foreground transition-smooth py-2 px-2 rounded-md hover:bg-accent"
                  >
                    <item.icon className="h-5 w-5 mt-0.5 text-primary" />
                    <div>
                      <div className="font-medium text-sm">{item.name}</div>
                      <div className="text-xs text-muted-foreground">{item.description}</div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Company Section */}
              <div className="space-y-2 pt-2 border-t border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase px-2">Company</p>
                {companyLinks.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => handleNavClick(item.href)}
                    className="flex items-start gap-3 w-full text-left text-muted-foreground hover:text-foreground transition-smooth py-2 px-2 rounded-md hover:bg-accent"
                  >
                    <item.icon className="h-5 w-5 mt-0.5 text-primary" />
                    <div>
                      <div className="font-medium text-sm">{item.name}</div>
                      <div className="text-xs text-muted-foreground">{item.description}</div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Support Section */}
              <div className="space-y-2 pt-2 border-t border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase px-2">Support</p>
                {supportLinks.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => handleNavClick(item.href)}
                    className="flex items-start gap-3 w-full text-left text-muted-foreground hover:text-foreground transition-smooth py-2 px-2 rounded-md hover:bg-accent"
                  >
                    <item.icon className="h-5 w-5 mt-0.5 text-primary" />
                    <div>
                      <div className="font-medium text-sm">{item.name}</div>
                      <div className="text-xs text-muted-foreground">{item.description}</div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex flex-col space-y-3 pt-4 border-t border-border">
                {user ? (
                  <>
                    <Button
                      variant="ghost"
                      onClick={handleDashboard}
                      className="justify-start font-medium"
                    >
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Dashboard
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleSignOut}
                      className="justify-start font-medium"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      onClick={() => navigate('/auth')}
                      className="justify-start font-medium"
                    >
                      Sign In
                    </Button>
                    <Button
                      variant="hero"
                      onClick={() => navigate('/get-started')}
                      className="font-semibold"
                    >
                      Get Started
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};