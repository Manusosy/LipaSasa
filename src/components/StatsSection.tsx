import React from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, Users, CreditCard, Clock } from 'lucide-react';
import { TrustedCompanies } from './TrustedCompanies';

export const StatsSection: React.FC = () => {
  const stats = [
    {
      icon: TrendingUp,
      value: 'KSh 2.4M+',
      label: 'Payments Processed',
      description: 'Total volume processed monthly',
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      icon: Users,
      value: '1,200+',
      label: 'Active Businesses',
      description: 'SMEs trusting LipaSasa',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      icon: CreditCard,
      value: '99.8%',
      label: 'Success Rate',
      description: 'Payment completion rate',
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      icon: Clock,
      value: '< 2 min',
      label: 'Average Settlement',
      description: 'Funds reach your account',
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
  ];

  return (
    <section className="py-16 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Trusted by Kenyan Businesses
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Join thousands of SMEs, freelancers, and entrepreneurs who have simplified their payment collection with LipaSasa
          </p>
          <div className="flex justify-center">
            <TrustedCompanies />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="gradient-card shadow-medium hover:shadow-large transition-smooth p-6 text-center">
              <div className={`${stat.bgColor} ${stat.color} rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4`}>
                <stat.icon className="h-8 w-8" />
              </div>
              <div className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                {stat.value}
              </div>
              <div className="text-lg font-semibold text-foreground mb-1">
                {stat.label}
              </div>
              <div className="text-sm text-muted-foreground">
                {stat.description}
              </div>
            </Card>
          ))}
        </div>


      </div>
    </section>
  );
};