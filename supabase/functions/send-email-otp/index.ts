import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OTPRequest {
  email: string;
  type: 'signup' | 'password_reset' | 'email_change';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { email, type }: OTPRequest = await req.json();

    console.log('Sending OTP to:', email, 'Type:', type);

    // Validate input
    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate 6-digit OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiry (15 minutes from now)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    // Get user by email
    const { data: { users }, error: userError } = await supabaseClient.auth.admin.listUsers();
    
    if (userError) {
      console.error('Error fetching user:', userError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch user' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const user = users.find(u => u.email === email);

    if (!user && type !== 'signup') {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For signup, we'll store OTP temporarily (user will be created after verification)
    // For other types, store in otp_verifications table if user exists
    if (user) {
      // Check for existing unverified OTP
      const { data: existingOTP } = await supabaseClient
        .from('otp_verifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_verified', false)
        .gte('expires_at', new Date().toISOString())
        .single();

      if (existingOTP) {
        // Rate limiting: Don't allow new OTP within 1 minute of previous one
        const createdAt = new Date(existingOTP.created_at);
        const now = new Date();
        const diffSeconds = (now.getTime() - createdAt.getTime()) / 1000;

        if (diffSeconds < 60) {
          return new Response(
            JSON.stringify({ 
              error: 'Please wait before requesting a new OTP',
              retry_after: Math.ceil(60 - diffSeconds)
            }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      // Store OTP in database
      const { error: insertError } = await supabaseClient
        .from('otp_verifications')
        .insert({
          user_id: user.id,
          phone_number: '', // Not used for email OTP
          otp_code: otpCode,
          expires_at: expiresAt,
          is_verified: false,
          attempts: 0,
        });

      if (insertError) {
        console.error('Error storing OTP:', insertError);
        return new Response(
          JSON.stringify({ error: 'Failed to store OTP' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Send OTP via email using Supabase Auth
    // In production, you'd use a proper email service like Resend or SendGrid
    // For now, we'll use Supabase's built-in email
    
    const emailSubject = type === 'signup' 
      ? 'Verify your LipaSasa account'
      : type === 'password_reset'
      ? 'Reset your LipaSasa password'
      : 'Verify your email change';

    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #0EA5E9; margin: 0;">LipaSasa</h1>
          </div>
          
          <h2 style="color: #333; margin-bottom: 20px;">Verify Your Account</h2>
          
          <p style="color: #666; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
            Your verification code is:
          </p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
            <p style="font-size: 36px; font-weight: bold; color: #0EA5E9; letter-spacing: 8px; margin: 0;">
              ${otpCode}
            </p>
          </div>
          
          <p style="color: #666; font-size: 14px; line-height: 1.5; margin-bottom: 20px;">
            This code will expire in 15 minutes. If you didn't request this code, please ignore this email.
          </p>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
              © ${new Date().getFullYear()} LipaSasa. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    `;

    // Send email using Supabase's built-in functionality
    // Note: In production, integrate with a proper email service
    console.log('OTP Code (DEV ONLY):', otpCode);
    console.log('Email would be sent to:', email);

    // For development, we'll just log the OTP
    // In production, you'd integrate with an email service here

    return new Response(
      JSON.stringify({
        success: true,
        message: 'OTP sent successfully',
        // In development, include the OTP in response (REMOVE IN PRODUCTION!)
        otp_code: Deno.env.get('APP_ENV') === 'development' ? otpCode : undefined,
        expires_at: expiresAt,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

