import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, Building2 } from 'lucide-react';

interface BusinessInfoStepProps {
  data: {
    businessName: string;
    ownerName: string;
    email: string;
    phone: string;
    country: string;
    industry: string;
  };
  onUpdate: (data: any) => void;
  onNext: () => void;
}

const industries = [
  'Retail & E-commerce',
  'Food & Beverage',
  'Professional Services',
  'Health & Wellness',
  'Education & Training',
  'Technology & Software',
  'Transportation & Logistics',
  'Real Estate',
  'Entertainment & Events',
  'Agriculture',
  'Manufacturing',
  'Other'
];

export const BusinessInfoStep: React.FC<BusinessInfoStepProps> = ({
  data,
  onUpdate,
  onNext
}) => {
  const handleInputChange = (field: string, value: string) => {
    onUpdate({ ...data, [field]: value });
  };

  const isFormValid = () => {
    return data.businessName && data.ownerName && data.email && data.phone && data.industry;
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Tell us about your business</h2>
        <p className="text-muted-foreground mt-2">
          We need some basic information to set up your LipaSasa account
        </p>
      </div>

      <div className="grid gap-6 max-w-2xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="businessName">Business Name *</Label>
            <Input
              id="businessName"
              placeholder="e.g., Mama Njeri's Shop"
              value={data.businessName}
              onChange={(e) => handleInputChange('businessName', e.target.value)}
              className="transition-smooth focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ownerName">Your Full Name *</Label>
            <Input
              id="ownerName"
              placeholder="e.g., Grace Njeri"
              value={data.ownerName}
              onChange={(e) => handleInputChange('ownerName', e.target.value)}
              className="transition-smooth focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              placeholder="grace@example.com"
              value={data.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="transition-smooth focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+254716972103"
              value={data.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="transition-smooth focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Select value={data.country} onValueChange={(value) => handleInputChange('country', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Kenya">Kenya</SelectItem>
                <SelectItem value="Uganda">Uganda</SelectItem>
                <SelectItem value="Tanzania">Tanzania</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="industry">Industry *</Label>
            <Select value={data.industry} onValueChange={(value) => handleInputChange('industry', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select your industry" />
              </SelectTrigger>
              <SelectContent>
                {industries.map((industry) => (
                  <SelectItem key={industry} value={industry}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-8">
        <Button
          onClick={onNext}
          disabled={!isFormValid()}
          className="flex items-center gap-2"
          size="lg"
        >
          Continue
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};