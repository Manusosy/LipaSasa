import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface HealthStatus {
  service: string;
  status: 'operational' | 'degraded' | 'down';
  response_time_ms: number;
  last_checked: string;
  error?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const healthChecks: HealthStatus[] = [];

    // Check Supabase Database
    const dbStart = Date.now();
    try {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      const { error } = await supabaseClient
        .from('profiles')
        .select('id')
        .limit(1);

      const dbTime = Date.now() - dbStart;

      healthChecks.push({
        service: 'database',
        status: error ? 'down' : 'operational',
        response_time_ms: dbTime,
        last_checked: new Date().toISOString(),
        error: error?.message,
      });
    } catch (error: any) {
      healthChecks.push({
        service: 'database',
        status: 'down',
        response_time_ms: Date.now() - dbStart,
        last_checked: new Date().toISOString(),
        error: error.message,
      });
    }

    // Check M-Pesa API (sandbox)
    const mpesaStart = Date.now();
    try {
      // Get M-Pesa credentials
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      const { data: settingsData } = await supabaseClient
        .from('admin_settings')
        .select('setting_value')
        .eq('setting_key', 'mpesa_subscription_credentials')
        .single();

      if (settingsData?.setting_value) {
        const { consumer_key, consumer_secret } = settingsData.setting_value;
        const auth = btoa(`${consumer_key}:${consumer_secret}`);

        const response = await fetch(
          'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
          {
            headers: { 'Authorization': `Basic ${auth}` },
          }
        );

        const mpesaTime = Date.now() - mpesaStart;

        healthChecks.push({
          service: 'mpesa_api',
          status: response.ok ? 'operational' : 'degraded',
          response_time_ms: mpesaTime,
          last_checked: new Date().toISOString(),
          error: !response.ok ? 'Failed to authenticate' : undefined,
        });
      } else {
        healthChecks.push({
          service: 'mpesa_api',
          status: 'degraded',
          response_time_ms: Date.now() - mpesaStart,
          last_checked: new Date().toISOString(),
          error: 'M-Pesa credentials not configured',
        });
      }
    } catch (error: any) {
      healthChecks.push({
        service: 'mpesa_api',
        status: 'down',
        response_time_ms: Date.now() - mpesaStart,
        last_checked: new Date().toISOString(),
        error: error.message,
      });
    }

    // Check PayPal API
    const paypalStart = Date.now();
    try {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      const { data: settingsData } = await supabaseClient
        .from('admin_settings')
        .select('setting_value')
        .eq('setting_key', 'paypal_credentials')
        .single();

      if (settingsData?.setting_value) {
        const { client_id, client_secret, mode } = settingsData.setting_value;
        const paypalBaseUrl = mode === 'live' 
          ? 'https://api-m.paypal.com' 
          : 'https://api-m.sandbox.paypal.com';

        const auth = btoa(`${client_id}:${client_secret}`);
        const response = await fetch(`${paypalBaseUrl}/v1/oauth2/token`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: 'grant_type=client_credentials',
        });

        const paypalTime = Date.now() - paypalStart;

        healthChecks.push({
          service: 'paypal_api',
          status: response.ok ? 'operational' : 'degraded',
          response_time_ms: paypalTime,
          last_checked: new Date().toISOString(),
          error: !response.ok ? 'Failed to authenticate' : undefined,
        });
      } else {
        healthChecks.push({
          service: 'paypal_api',
          status: 'degraded',
          response_time_ms: Date.now() - paypalStart,
          last_checked: new Date().toISOString(),
          error: 'PayPal credentials not configured',
        });
      }
    } catch (error: any) {
      healthChecks.push({
        service: 'paypal_api',
        status: 'down',
        response_time_ms: Date.now() - paypalStart,
        last_checked: new Date().toISOString(),
        error: error.message,
      });
    }

    // Check Edge Functions
    healthChecks.push({
      service: 'edge_functions',
      status: 'operational',
      response_time_ms: 0,
      last_checked: new Date().toISOString(),
    });

    // Calculate overall status
    const hasDown = healthChecks.some(check => check.status === 'down');
    const hasDegraded = healthChecks.some(check => check.status === 'degraded');
    
    const overallStatus = hasDown ? 'down' : hasDegraded ? 'degraded' : 'operational';

    // Store health check results in database
    try {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      await supabaseClient
        .from('system_health_checks')
        .insert({
          overall_status: overallStatus,
          checks: healthChecks,
          checked_at: new Date().toISOString(),
        });
    } catch (error) {
      console.error('Failed to store health check:', error);
    }

    return new Response(
      JSON.stringify({
        overall_status: overallStatus,
        checks: healthChecks,
        timestamp: new Date().toISOString(),
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Health check error:', error);
    return new Response(
      JSON.stringify({
        overall_status: 'down',
        error: error.message || 'Health check failed',
        timestamp: new Date().toISOString(),
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

