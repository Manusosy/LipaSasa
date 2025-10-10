import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  CreditCard,
  Users,
  Settings,
  BarChart3,
  HelpCircle,
  Home,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

const navigationItems = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Invoices',
    url: '/dashboard/invoices',
    icon: FileText,
  },
  {
    title: 'Payment Links',
    url: '/dashboard/payment-links',
    icon: FileText,
  },
  {
    title: 'Transactions',
    url: '/dashboard/transactions',
    icon: CreditCard,
  },
  // removed: M-PESA Setup now managed via Payment Methods
  {
    title: 'Payment Methods',
    url: '/dashboard/payment-methods',
    icon: Wallet,
  },
  {
    title: 'API & Integrations',
    url: '/dashboard/api',
    icon: BarChart3,
  },
  {
    title: 'Subscription',
    url: '/dashboard/subscription',
    icon: BarChart3,
  },
];

const accountItems = [
  {
    title: 'Settings',
    url: '/dashboard/settings',
    icon: Settings,
  },
];

interface DashboardSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileMenuOpen?: boolean;
  onMobileMenuClose?: () => void;
}

export function DashboardSidebar({ collapsed, onToggleCollapse, mobileMenuOpen = false, onMobileMenuClose }: DashboardSidebarProps) {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleNavClick = () => {
    if (onMobileMenuClose) {
      onMobileMenuClose();
    }
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 z-40 flex flex-col',
        collapsed ? 'w-20' : 'w-64',
        // Mobile: slide in/out
        'lg:translate-x-0',
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}
    >
      {/* Logo Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shrink-0">
              <img 
                src="/chapapay.png" 
                alt="LipaSasa" 
                className="h-8 w-8 object-contain"
              />
            </div>
            <div>
              <h2 className="font-bold text-base text-foreground">LipaSasa</h2>
              <p className="text-xs text-muted-foreground">Payment Platform</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center mx-auto">
            <img 
              src="/chapapay.png" 
              alt="LipaSasa" 
              className="h-8 w-8 object-contain"
            />
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        {/* Main Menu */}
        <div className="mb-6">
          {!collapsed && (
            <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Main Menu
            </h3>
          )}
          <nav className="space-y-1">
            {navigationItems.map((item) => (
              <NavLink
                key={item.title}
                to={item.url}
                end={item.url === '/dashboard'}
                onClick={handleNavClick}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                    'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                    isActive && 'bg-primary text-primary-foreground font-medium shadow-sm',
                    collapsed && 'justify-center'
                  )
                }
                title={collapsed ? item.title : undefined}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span className="text-sm">{item.title}</span>}
              </NavLink>
            ))}
          </nav>
        </div>

        <Separator className="my-4" />

        {/* Account Section */}
        <div>
          {!collapsed && (
            <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Account
            </h3>
          )}
          <nav className="space-y-1">
            {accountItems.map((item) => (
              <NavLink
                key={item.title}
                to={item.url}
                onClick={handleNavClick}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                    'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                    isActive && 'bg-primary text-primary-foreground font-medium shadow-sm',
                    collapsed && 'justify-center'
                  )
                }
                title={collapsed ? item.title : undefined}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span className="text-sm">{item.title}</span>}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="border-t border-sidebar-border p-3 space-y-2">
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'w-full border-sidebar-border hover:bg-sidebar-accent',
            collapsed ? 'px-0' : 'justify-start'
          )}
          onClick={handleGoHome}
          title={collapsed ? 'Back to Site' : undefined}
        >
          <Home className="h-4 w-4" />
          {!collapsed && <span className="ml-2">Back to Site</span>}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'w-full text-destructive hover:text-destructive hover:bg-destructive/10',
            collapsed ? 'px-0' : 'justify-start'
          )}
          onClick={handleSignOut}
          title={collapsed ? 'Sign Out' : undefined}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="ml-2">Sign Out</span>}
        </Button>
        {!collapsed && (
          <div className="text-xs text-muted-foreground pt-2 text-center">
            <p>© 2025 LipaSasa</p>
            <p className="text-[10px] opacity-60">v1.0.0</p>
          </div>
        )}
      </div>

      {/* Collapse Toggle - Desktop only */}
      <button
        onClick={onToggleCollapse}
        className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-primary text-primary-foreground rounded-full items-center justify-center shadow-md hover:shadow-lg transition-shadow"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </aside>
  );
}
