import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, ChevronLeft, Smartphone, CreditCard, AlertCircle } from 'lucide-react';

interface PaymentSetupStepProps {
  data: {
    mpesaPaybill: string;
    mpesaTill: string;
    airtelMoney: string;
    enableCards: boolean;
  };
  onUpdate: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export const PaymentSetupStep: React.FC<PaymentSetupStepProps> = ({
  data,
  onUpdate,
  onNext,
  onBack
}) => {
  const handleInputChange = (field: string, value: string | boolean) => {
    onUpdate({ ...data, [field]: value });
  };

  const hasAtLeastOnePaymentMethod = () => {
    return data.mpesaPaybill || data.mpesaTill || data.airtelMoney || data.enableCards;
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Smartphone className="w-8 h-8 text-success" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Set up your payment methods</h2>
        <p className="text-muted-foreground mt-2">
          Connect your existing payment accounts to start receiving money
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* M-Pesa Section */}
        <Card className="border-2 border-success/20 bg-success/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-success">
              <Smartphone className="w-5 h-5" />
              M-Pesa Integration
            </CardTitle>
            <CardDescription>
              Use your existing M-Pesa Paybill or Till number to collect payments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mpesaPaybill">M-Pesa Paybill Number</Label>
                <Input
                  id="mpesaPaybill"
                  placeholder="e.g., 123456"
                  value={data.mpesaPaybill}
                  onChange={(e) => handleInputChange('mpesaPaybill', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mpesaTill">M-Pesa Till Number</Label>
                <Input
                  id="mpesaTill"
                  placeholder="e.g., 123456"
                  value={data.mpesaTill}
                  onChange={(e) => handleInputChange('mpesaTill', e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 bg-success/10 rounded-lg">
              <AlertCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
              <p className="text-sm text-success">
                You can add either a Paybill or Till number, or both. We'll verify these during setup.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Airtel Money Section */}
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Smartphone className="w-5 h-5" />
              Airtel Money
            </CardTitle>
            <CardDescription>
              Connect your Airtel Money account for additional payment options
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="airtelMoney">Airtel Money Number</Label>
              <Input
                id="airtelMoney"
                placeholder="e.g., +254716972103"
                value={data.airtelMoney}
                onChange={(e) => handleInputChange('airtelMoney', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Card Payments Section */}
        <Card className="border-2 border-warning/20 bg-warning/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <CreditCard className="w-5 h-5" />
              Card Payments
            </CardTitle>
            <CardDescription>
              Accept Visa, Mastercard, and other international cards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="enableCards"
                checked={data.enableCards}
                onCheckedChange={(checked) => handleInputChange('enableCards', checked)}
              />
              <Label htmlFor="enableCards" className="cursor-pointer">
                Enable card payments (we'll help you set this up later)
              </Label>
            </div>
          </CardContent>
        </Card>

        {!hasAtLeastOnePaymentMethod() && (
          <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
            <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
            <p className="text-sm text-destructive">
              Please configure at least one payment method to continue.
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center gap-2"
          size="lg"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={!hasAtLeastOnePaymentMethod()}
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