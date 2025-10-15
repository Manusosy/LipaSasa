import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Users, 
  Bell, 
  CreditCard, 
  Settings, 
  LogOut,
  TrendingUp,
  Shield,
  FileText,
  Activity,
  DollarSign,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AdminSidebarProps {
  className?: string;
}

export const AdminSidebar = ({ className = '' }: AdminSidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: 'Signed Out',
        description: 'You have been signed out successfully',
      });
      navigate('/admin/auth');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: 'Error',
        description: 'Failed to sign out',
        variant: 'destructive',
      });
    }
  };

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      path: '/admin',
      exact: true,
    },
    {
      icon: Users,
      label: 'Users',
      path: '/admin/users',
    },
    {
      icon: DollarSign,
      label: 'Pricing',
      path: '/admin/pricing',
    },
    {
      icon: CreditCard,
      label: 'Subscriptions',
      path: '/admin/subscriptions',
    },
    {
      icon: TrendingUp,
      label: 'Analytics',
      path: '/admin/analytics',
    },
    {
      icon: Activity,
      label: 'Transactions',
      path: '/admin/transactions',
    },
    {
      icon: Bell,
      label: 'Notifications',
      path: '/admin/notifications',
    },
    {
      icon: FileText,
      label: 'Reports',
      path: '/admin/reports',
    },
    {
      icon: Settings,
      label: 'Settings',
      path: '/admin/settings',
    },
  ];

  const isActive = (path: string, exact: boolean = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className={`flex flex-col h-screen bg-[#0A2647] text-white transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'} ${className}`}>
      {/* Logo/Brand */}
      <div className="p-6 border-b border-white/10 relative">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
          <img 
            src="/favicon.ico" 
            alt="LipaSasa Logo" 
            className={`${collapsed ? 'h-10 w-10' : 'h-10 w-10'} rounded-lg`}
          />
          {!collapsed && (
            <div>
              <h1 className="text-xl font-bold">LipaSasa</h1>
              <p className="text-xs text-white/60">Admin Portal</p>
            </div>
          )}
        </div>
        
        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-8 bg-[#0A2647] border-2 border-white/20 rounded-full p-1 hover:bg-white/10 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4 text-white" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-white" />
          )}
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path, item.exact);
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`
                    flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-lg transition-all
                    ${active 
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' 
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                    }
                  `}
                  title={collapsed ? item.label : ''}
                >
                  <Icon className="h-5 w-5" />
                  {!collapsed && <span className="font-medium">{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Info & Sign Out */}
      <div className="p-4 border-t border-white/10">
        {!collapsed && (
          <div className="mb-3 px-2">
            <p className="text-xs text-white/50 mb-1">Signed in as</p>
            <p className="text-sm font-medium truncate">Administrator</p>
          </div>
        )}
        <Button
          onClick={handleSignOut}
          variant="ghost"
          className={`w-full ${collapsed ? 'justify-center' : 'justify-start'} text-white/70 hover:text-white hover:bg-white/5`}
          title={collapsed ? 'Sign Out' : ''}
        >
          <LogOut className={`h-4 w-4 ${collapsed ? '' : 'mr-3'}`} />
          {!collapsed && 'Sign Out'}
        </Button>
      </div>
    </div>
  );
};

