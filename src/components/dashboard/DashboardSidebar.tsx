import React from 'react';
import { NavLink } from 'react-router-dom';
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
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

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
    title: 'Customers',
    url: '/dashboard/customers',
    icon: Users,
  },
  {
    title: 'Payment Methods',
    url: '/dashboard/payment-methods',
    icon: CreditCard,
  },
  {
    title: 'Reports',
    url: '/dashboard/reports',
    icon: BarChart3,
  },
];

const settingsItems = [
  {
    title: 'Settings',
    url: '/dashboard/settings',
    icon: Settings,
  },
  {
    title: 'Help & Support',
    url: '/dashboard/help',
    icon: HelpCircle,
  },
];

export function DashboardSidebar() {
  const { open } = useSidebar();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <img 
              src="/chapapay-logo.png" 
              alt="LipaSasa" 
              className="h-6 w-auto"
            />
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <h2 className="font-bold text-lg text-sidebar-foreground">LipaSasa</h2>
            <p className="text-xs text-muted-foreground">Payment Platform</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-3 py-2">
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      end={item.url === '/dashboard'}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all ${
                          isActive
                            ? 'bg-primary text-primary-foreground shadow-soft font-medium'
                            : 'hover:bg-sidebar-accent text-sidebar-foreground'
                        }`
                      }
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="my-4" />

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-3 py-2">
            Account
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all ${
                          isActive
                            ? 'bg-primary text-primary-foreground shadow-soft font-medium'
                            : 'hover:bg-sidebar-accent text-sidebar-foreground'
                        }`
                      }
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3 gap-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2"
          onClick={handleGoHome}
        >
          <Home className="h-4 w-4" />
          <span className="group-data-[collapsible=icon]:hidden">Back to Site</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          <span className="group-data-[collapsible=icon]:hidden">Sign Out</span>
        </Button>
        <div className="text-xs text-muted-foreground pt-2 group-data-[collapsible=icon]:hidden">
          <p>© 2025 LipaSasa</p>
          <p className="text-[10px] opacity-60">v1.0.0</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
