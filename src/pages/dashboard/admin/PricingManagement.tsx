import React, { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/dashboard/AdminSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DollarSign, Edit, Plus, Trash2, Check, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface PricingTier {
  id: string;
  tier_name: 'free' | 'professional' | 'enterprise';
  display_name: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  is_active: boolean;
  max_transactions: number | null;
  max_invoices: number | null;
  api_access: boolean;
  priority_support: boolean;
  custom_branding: boolean;
}

const PricingManagement = () => {
  const [tiers, setTiers] = useState<PricingTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null);
  const [newFeature, setNewFeature] = useState('');
  
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAccess();
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

      fetchPricingTiers();
    } catch (error) {
      console.error('Error checking admin access:', error);
      navigate('/admin/auth');
    }
  };

  const fetchPricingTiers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pricing_tiers')
        .select('*')
        .order('price_monthly', { ascending: true });

      if (error) throw error;

      setTiers(data || []);
    } catch (error) {
      console.error('Error fetching pricing tiers:', error);
      toast({
        title: 'Error',
        description: 'Failed to load pricing tiers',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (tier: PricingTier) => {
    setSelectedTier({ ...tier });
    setEditDialogOpen(true);
  };

  const handleSave = async () => {
    if (!selectedTier) return;

    try {
      const { error } = await supabase
        .from('pricing_tiers')
        .update({
          display_name: selectedTier.display_name,
          price_monthly: selectedTier.price_monthly,
          price_yearly: selectedTier.price_yearly,
          features: selectedTier.features,
          is_active: selectedTier.is_active,
          max_transactions: selectedTier.max_transactions,
          max_invoices: selectedTier.max_invoices,
          api_access: selectedTier.api_access,
          priority_support: selectedTier.priority_support,
          custom_branding: selectedTier.custom_branding,
        })
        .eq('id', selectedTier.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Pricing tier updated successfully',
      });

      fetchPricingTiers();
      setEditDialogOpen(false);
      setSelectedTier(null);
    } catch (error) {
      console.error('Error updating pricing tier:', error);
      toast({
        title: 'Error',
        description: 'Failed to update pricing tier',
        variant: 'destructive',
      });
    }
  };

  const addFeature = () => {
    if (!newFeature.trim() || !selectedTier) return;
    
    setSelectedTier({
      ...selectedTier,
      features: [...selectedTier.features, newFeature.trim()],
    });
    setNewFeature('');
  };

  const removeFeature = (index: number) => {
    if (!selectedTier) return;
    
    const updatedFeatures = [...selectedTier.features];
    updatedFeatures.splice(index, 1);
    setSelectedTier({
      ...selectedTier,
      features: updatedFeatures,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Pricing Management</h1>
            <p className="text-gray-500 mt-2">Configure subscription tiers and pricing</p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading pricing tiers...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {tiers.map((tier) => (
                <Card key={tier.id} className={!tier.is_active ? 'opacity-50' : ''}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="capitalize">{tier.display_name}</CardTitle>
                      {!tier.is_active && (
                        <Badge variant="outline" className="text-xs">Inactive</Badge>
                      )}
                    </div>
                    <CardDescription>
                      <div className="mt-4">
                        <div className="text-3xl font-bold text-gray-900">
                          {formatCurrency(tier.price_monthly)}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">per month</p>
                        {tier.price_yearly > 0 && (
                          <p className="text-sm text-green-600 mt-1">
                            {formatCurrency(tier.price_yearly)}/year (Save{' '}
                            {Math.round(((tier.price_monthly * 12 - tier.price_yearly) / (tier.price_monthly * 12)) * 100)}%)
                          </p>
                        )}
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Features List */}
                    <div className="space-y-2 mb-6">
                      {tier.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Additional Features */}
                    <div className="space-y-2 text-xs text-muted-foreground border-t pt-4">
                      {tier.max_transactions && (
                        <p>Max Transactions: {tier.max_transactions}/month</p>
                      )}
                      {tier.max_invoices && (
                        <p>Max Invoices: {tier.max_invoices}</p>
                      )}
                      {tier.api_access && <p className="text-green-600">✓ API Access</p>}
                      {tier.priority_support && <p className="text-green-600">✓ Priority Support</p>}
                      {tier.custom_branding && <p className="text-green-600">✓ Custom Branding</p>}
                    </div>

                    {/* Edit Button */}
                    <Button
                      onClick={() => handleEdit(tier)}
                      variant="outline"
                      className="w-full mt-6"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Tier
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit {selectedTier?.display_name}</DialogTitle>
            <DialogDescription>
              Update pricing, features, and settings for this tier
            </DialogDescription>
          </DialogHeader>

          {selectedTier && (
            <div className="space-y-6">
              {/* Display Name */}
              <div className="space-y-2">
                <Label htmlFor="display_name">Display Name</Label>
                <Input
                  id="display_name"
                  value={selectedTier.display_name}
                  onChange={(e) => setSelectedTier({ ...selectedTier, display_name: e.target.value })}
                />
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price_monthly">Monthly Price (KES)</Label>
                  <Input
                    id="price_monthly"
                    type="number"
                    value={selectedTier.price_monthly}
                    onChange={(e) => setSelectedTier({ ...selectedTier, price_monthly: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price_yearly">Yearly Price (KES)</Label>
                  <Input
                    id="price_yearly"
                    type="number"
                    value={selectedTier.price_yearly}
                    onChange={(e) => setSelectedTier({ ...selectedTier, price_yearly: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              {/* Limits */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max_transactions">Max Transactions/Month</Label>
                  <Input
                    id="max_transactions"
                    type="number"
                    placeholder="Unlimited"
                    value={selectedTier.max_transactions || ''}
                    onChange={(e) => setSelectedTier({ 
                      ...selectedTier, 
                      max_transactions: e.target.value ? parseInt(e.target.value) : null 
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_invoices">Max Invoices</Label>
                  <Input
                    id="max_invoices"
                    type="number"
                    placeholder="Unlimited"
                    value={selectedTier.max_invoices || ''}
                    onChange={(e) => setSelectedTier({ 
                      ...selectedTier, 
                      max_invoices: e.target.value ? parseInt(e.target.value) : null 
                    })}
                  />
                </div>
              </div>

              {/* Features */}
              <div className="space-y-2">
                <Label>Features</Label>
                <div className="space-y-2">
                  {selectedTier.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input value={feature} disabled className="flex-1" />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFeature(index)}
                      >
                        <X className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add new feature..."
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                    />
                    <Button size="sm" onClick={addFeature}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="is_active">Active</Label>
                  <Switch
                    id="is_active"
                    checked={selectedTier.is_active}
                    onCheckedChange={(checked) => setSelectedTier({ ...selectedTier, is_active: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="api_access">API Access</Label>
                  <Switch
                    id="api_access"
                    checked={selectedTier.api_access}
                    onCheckedChange={(checked) => setSelectedTier({ ...selectedTier, api_access: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="priority_support">Priority Support</Label>
                  <Switch
                    id="priority_support"
                    checked={selectedTier.priority_support}
                    onCheckedChange={(checked) => setSelectedTier({ ...selectedTier, priority_support: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="custom_branding">Custom Branding</Label>
                  <Switch
                    id="custom_branding"
                    checked={selectedTier.custom_branding}
                    onCheckedChange={(checked) => setSelectedTier({ ...selectedTier, custom_branding: checked })}
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PricingManagement;

