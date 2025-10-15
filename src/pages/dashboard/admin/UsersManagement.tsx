import React, { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/dashboard/AdminSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Search, MoreVertical, Ban, Trash2, UserCheck, UserX, CreditCard } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface User {
  user_id: string;
  business_name: string;
  owner_name: string;
  email: string;
  phone: string;
  selected_plan: string;
  created_at: string;
  status?: 'active' | 'suspended' | 'banned';
}

interface PricingTier {
  id: string;
  tier_name: string;
  display_name: string;
}

const UsersManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    action: 'ban' | 'suspend' | 'delete' | 'activate' | 'change_plan' | null;
  }>({ open: false, action: null });
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAccess();
    fetchPricingTiers();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/admin/auth');
        return;
      }

      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      if (!roles) {
        navigate('/dashboard');
        return;
      }

      fetchUsers();
    } catch (error) {
      console.error('Error checking admin access:', error);
      navigate('/admin/auth');
    }
  };

  const fetchPricingTiers = async () => {
    try {
      const { data, error } = await supabase
        .from('pricing_tiers')
        .select('id, tier_name, display_name')
        .eq('is_active', true)
        .order('price_monthly', { ascending: true });

      if (error) throw error;

      setPricingTiers(data || []);
    } catch (error) {
      console.error('Error fetching pricing tiers:', error);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      console.log('Fetching users...');
      
      // First, get admin user IDs
      const { data: adminRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');

      if (rolesError) {
        console.error('Error fetching admin roles:', rolesError);
        throw rolesError;
      }

      const adminUserIds = adminRoles?.map(r => r.user_id) || [];
      console.log('Admin user IDs:', adminUserIds);

      // Get all profiles
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching profiles:', error);
        throw error;
      }

      console.log('Raw profiles data:', data);

      // Filter out admins and map the data
      const merchantUsers = (data || [])
        .filter(user => !adminUserIds.includes(user.user_id))
        .map(user => ({
          user_id: user.user_id,
          business_name: user.business_name,
          owner_name: user.owner_name,
          email: user.email,
          phone: user.phone,
          selected_plan: user.selected_plan || 'free',
          created_at: user.created_at,
          status: user.status || 'active',
        }));

      console.log('Merchant users (filtered):', merchantUsers);
      setUsers(merchantUsers);
      
      toast({
        title: 'Users Loaded',
        description: `Found ${merchantUsers.length} merchant user(s)`,
      });
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!selectedUser || !actionDialog.action) return;

    try {
      switch (actionDialog.action) {
        case 'ban':
          const { error: banError } = await supabase
            .from('profiles')
            .update({ status: 'banned' })
            .eq('user_id', selectedUser.user_id);
          
          if (banError) throw banError;
          
          // Sign out the user by revoking their session
          await supabase.auth.admin.signOut(selectedUser.user_id);
          
          toast({
            title: 'User Banned',
            description: `${selectedUser.owner_name} has been banned and signed out`,
          });
          break;

        case 'suspend':
          const { error: suspendError } = await supabase
            .from('profiles')
            .update({ status: 'suspended' })
            .eq('user_id', selectedUser.user_id);
          
          if (suspendError) throw suspendError;
          
          // Sign out the user
          await supabase.auth.admin.signOut(selectedUser.user_id);
          
          toast({
            title: 'User Suspended',
            description: `${selectedUser.owner_name} has been suspended and signed out`,
          });
          break;

        case 'activate':
          const { error: activateError } = await supabase
            .from('profiles')
            .update({ status: 'active' })
            .eq('user_id', selectedUser.user_id);
          
          if (activateError) throw activateError;
          
          toast({
            title: 'User Activated',
            description: `${selectedUser.owner_name} is now active`,
          });
          break;

        case 'change_plan':
          if (!selectedPlan) {
            toast({
              title: 'Error',
              description: 'Please select a plan',
              variant: 'destructive',
            });
            return;
          }

          const { error: planError, data: updatedProfile } = await supabase
            .from('profiles')
            .update({ selected_plan: selectedPlan })
            .eq('user_id', selectedUser.user_id)
            .select()
            .single();
          
          if (planError) {
            console.error('Error updating plan:', planError);
            throw planError;
          }

          console.log('Plan updated:', updatedProfile);

          const tierInfo = pricingTiers.find(t => t.tier_name === selectedPlan);
          
          // Update the local state immediately
          setUsers(prevUsers => 
            prevUsers.map(u => 
              u.user_id === selectedUser.user_id 
                ? { ...u, selected_plan: selectedPlan }
                : u
            )
          );
          
          toast({
            title: 'Plan Changed Successfully',
            description: `${selectedUser.owner_name}'s plan updated to ${tierInfo?.display_name || selectedPlan}`,
          });
          break;

        case 'delete':
          // Soft delete by setting status to deleted and removing sensitive data
          const { error: deleteError } = await supabase
            .from('profiles')
            .update({ 
              status: 'banned',
              business_name: 'Deleted User',
              owner_name: 'Deleted User',
              phone: null
            })
            .eq('user_id', selectedUser.user_id);
          
          if (deleteError) throw deleteError;
          
          // Sign out the user
          await supabase.auth.admin.signOut(selectedUser.user_id);
          
          toast({
            title: 'User Deleted',
            description: `${selectedUser.owner_name} has been removed`,
          });
          break;
      }

      // Only refresh users list if action changes the list (delete, ban, suspend, activate)
      // For plan changes, we already updated the state directly
      if (actionDialog.action !== 'change_plan') {
        fetchUsers();
      }
      
      setActionDialog({ open: false, action: null });
      setSelectedUser(null);
      setSelectedPlan('');
    } catch (error: any) {
      console.error('Error performing action:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to perform action',
        variant: 'destructive',
      });
    }
  };

  const filteredUsers = users.filter(user =>
    user.owner_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.business_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
      case 'suspended':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Suspended</Badge>;
      case 'banned':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Banned</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
            <p className="text-gray-500 mt-2">Manage all registered merchants and users</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>
                Total: {users.length} users (excluding admins)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search */}
              <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, email, or business..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button onClick={fetchUsers} variant="outline">
                  Refresh
                </Button>
              </div>

              {/* Users Table */}
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-muted-foreground">Loading users...</p>
                </div>
              ) : (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Business</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                            No users found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUsers.map((user) => (
                          <TableRow key={user.user_id}>
                            <TableCell className="font-medium">{user.owner_name || 'N/A'}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.business_name || 'N/A'}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {user.selected_plan || 'starter'}
                              </Badge>
                            </TableCell>
                            <TableCell>{getStatusBadge(user.status)}</TableCell>
                            <TableCell>
                              {new Date(user.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  
                                  {user.status === 'active' ? (
                                    <>
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setSelectedUser(user);
                                          setActionDialog({ open: true, action: 'suspend' });
                                        }}
                                      >
                                        <UserX className="h-4 w-4 mr-2" />
                                        Suspend
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setSelectedUser(user);
                                          setActionDialog({ open: true, action: 'ban' });
                                        }}
                                        className="text-red-600"
                                      >
                                        <Ban className="h-4 w-4 mr-2" />
                                        Ban
                                      </DropdownMenuItem>
                                    </>
                                  ) : (
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedUser(user);
                                        setActionDialog({ open: true, action: 'activate' });
                                      }}
                                      className="text-green-600"
                                    >
                                      <UserCheck className="h-4 w-4 mr-2" />
                                      Activate
                                    </DropdownMenuItem>
                                  )}
                                  
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setSelectedPlan(user.selected_plan || 'free');
                                      setActionDialog({ open: true, action: 'change_plan' });
                                    }}
                                  >
                                    <CreditCard className="h-4 w-4 mr-2" />
                                    Change Plan
                                  </DropdownMenuItem>
                                  
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setActionDialog({ open: true, action: 'delete' });
                                    }}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete User
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={actionDialog.open} onOpenChange={(open) => {
        setActionDialog({ open, action: null });
        setSelectedPlan('');
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionDialog.action === 'delete' && 'Delete User'}
              {actionDialog.action === 'ban' && 'Ban User'}
              {actionDialog.action === 'suspend' && 'Suspend User'}
              {actionDialog.action === 'activate' && 'Activate User'}
              {actionDialog.action === 'change_plan' && 'Change User Plan'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionDialog.action === 'delete' && 
                `Are you sure you want to delete ${selectedUser?.owner_name}? This will permanently remove their account and data.`}
              {actionDialog.action === 'ban' && 
                `Are you sure you want to ban ${selectedUser?.owner_name}? They will be immediately signed out and cannot access the platform.`}
              {actionDialog.action === 'suspend' && 
                `Are you sure you want to suspend ${selectedUser?.owner_name}? They will be signed out and their access will be temporarily restricted.`}
              {actionDialog.action === 'activate' && 
                `Are you sure you want to activate ${selectedUser?.owner_name}? They will regain full access to the platform.`}
              {actionDialog.action === 'change_plan' && 
                `Select a new subscription plan for ${selectedUser?.owner_name}. This will immediately update their account limits.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {actionDialog.action === 'change_plan' && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="plan">New Plan</Label>
                <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                  <SelectTrigger id="plan">
                    <SelectValue placeholder="Select a plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {pricingTiers.map((tier) => (
                      <SelectItem key={tier.id} value={tier.tier_name}>
                        {tier.display_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="text-sm text-muted-foreground">
                Current plan: <span className="font-medium capitalize">{selectedUser?.selected_plan || 'free'}</span>
              </div>
            </div>
          )}
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAction}>
              {actionDialog.action === 'change_plan' ? 'Update Plan' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UsersManagement;

