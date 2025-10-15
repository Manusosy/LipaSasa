import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PricingTier {
  id: string;
  tier_name: 'free' | 'professional' | 'enterprise';
  display_name: string;
  price_monthly: number;
  price_yearly: number;
  price_monthly_usd: number;
  price_yearly_usd: number;
  currency: string;
  billing_period: 'monthly' | 'annual' | 'both';
  features: string[];
  is_active: boolean;
  max_transactions: number | null;
  max_invoices: number | null;
  api_access: boolean;
  priority_support: boolean;
  custom_branding: boolean;
}

export interface ExchangeRate {
  from_currency: string;
  to_currency: string;
  rate: number;
  updated_at: string;
}

export const usePricing = () => {
  const [tiers, setTiers] = useState<PricingTier[]>([]);
  const [exchangeRate, setExchangeRate] = useState<number>(0.0078); // Default KSH to USD
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPricingData();
  }, []);

  const fetchPricingData = async () => {
    try {
      setLoading(true);
      
      // Fetch pricing tiers
      const { data: tiersData, error: tiersError } = await supabase
        .from('pricing_tiers')
        .select('*')
        .eq('is_active', true)
        .order('price_monthly', { ascending: true });

      if (tiersError) throw tiersError;

      // Fetch exchange rate
      const { data: rateData, error: rateError } = await supabase
        .from('currency_exchange_rates')
        .select('rate')
        .eq('from_currency', 'KSH')
        .eq('to_currency', 'USD')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (rateError && rateError.code !== 'PGRST116') {
        console.error('Exchange rate error:', rateError);
      } else if (rateData) {
        setExchangeRate(Number(rateData.rate));
      }

      setTiers(tiersData || []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching pricing:', err);
      setError(err.message || 'Failed to load pricing');
    } finally {
      setLoading(false);
    }
  };

  const convertToUSD = (kshAmount: number): number => {
    return Math.round(kshAmount * exchangeRate * 100) / 100;
  };

  const convertToKSH = (usdAmount: number): number => {
    return Math.round(usdAmount / exchangeRate);
  };

  const calculateAnnualPrice = (monthlyPrice: number, discountPercent: number = 17): number => {
    return Math.round((monthlyPrice * 12) * (1 - discountPercent / 100));
  };

  const getAnnualDiscount = (monthlyPrice: number, annualPrice: number): number => {
    const fullAnnual = monthlyPrice * 12;
    return Math.round(((fullAnnual - annualPrice) / fullAnnual) * 100);
  };

  const formatPrice = (amount: number, currency: 'KSH' | 'USD' = 'KSH'): string => {
    if (currency === 'KSH') {
      return `KSh ${amount.toLocaleString()}`;
    } else {
      return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  };

  const getPlanById = (tierName: string): PricingTier | undefined => {
    return tiers.find(t => t.tier_name === tierName);
  };

  const getPlanPrice = (
    tierName: string, 
    billingPeriod: 'monthly' | 'annual' = 'monthly',
    currency: 'KSH' | 'USD' = 'KSH'
  ): number => {
    const plan = getPlanById(tierName);
    if (!plan) return 0;

    if (currency === 'USD') {
      return billingPeriod === 'monthly' ? plan.price_monthly_usd : plan.price_yearly_usd;
    } else {
      return billingPeriod === 'monthly' ? plan.price_monthly : plan.price_yearly;
    }
  };

  return {
    tiers,
    exchangeRate,
    loading,
    error,
    convertToUSD,
    convertToKSH,
    calculateAnnualPrice,
    getAnnualDiscount,
    formatPrice,
    getPlanById,
    getPlanPrice,
    refreshPricing: fetchPricingData,
  };
};

