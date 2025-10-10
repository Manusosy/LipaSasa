import React from 'react';
import { Calendar, Shield, FileText } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';

export const TermsOfService = () => {
  return (
    <div className="min-h-screen">
      <SEOHead 
        title="Terms of Service - LipaSasa Payment Gateway"
        description="Read LipaSasa's Terms of Service governing the use of our M-Pesa and mobile money payment processing platform. Learn about our service agreements and policies."
        keywords="LipaSasa terms, payment terms of service, merchant agreement Kenya, payment processing terms"
        canonicalUrl="https://lipasasa.online/terms"
      />
      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Terms of Service
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              These terms govern the use of LipaSasa services and platform
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Last updated: March 1, 2024
              </div>
              <div className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                Version 1.2
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto prose prose-lg">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using LipaSasa's services, you agree to be bound by these Terms of Service
              and all applicable laws and regulations. If you do not agree with any of these terms,
              you are prohibited from using or accessing this site.
            </p>

            <h2>2. Description of Service</h2>
            <p>
              LipaSasa provides payment processing services including but not limited to:
            </p>
            <ul>
              <li>M-Pesa payment processing</li>
              <li>Card payment processing</li>
              <li>Bank transfer processing</li>
              <li>Payment gateway services</li>
              <li>API access and integration tools</li>
            </ul>

            <h2>3. Account Registration</h2>
            <p>
              To use our services, you must register for an account and provide accurate, complete,
              and current information. You are responsible for maintaining the confidentiality of
              your account credentials and for all activities that occur under your account.
            </p>

            <h2>4. Payment Processing</h2>
            <p>
              LipaSasa acts as a payment processor and facilitator. We do not guarantee the
              completion of any transaction and are not responsible for disputes between
              merchants and customers.
            </p>

            <h2>5. Fees and Charges</h2>
            <p>
              Transaction fees and service charges are clearly outlined in your merchant agreement.
              Fees may be updated from time to time with appropriate notice. All fees are
              non-refundable unless otherwise specified.
            </p>

            <h2>6. Prohibited Activities</h2>
            <p>You agree not to use our services for:</p>
            <ul>
              <li>Illegal activities or transactions</li>
              <li>Money laundering or terrorist financing</li>
              <li>Processing of prohibited goods or services</li>
              <li>Fraudulent or unauthorized transactions</li>
              <li>Violation of payment network rules</li>
            </ul>

            <h2>7. Data Protection and Privacy</h2>
            <p>
              We are committed to protecting your privacy and personal data in accordance with
              applicable data protection laws. Please refer to our Privacy Policy for detailed
              information about how we collect, use, and protect your data.
            </p>

            <h2>8. Service Availability</h2>
            <p>
              While we strive to maintain high availability, we do not guarantee uninterrupted
              service. We may perform maintenance, updates, or modifications that may temporarily
              affect service availability.
            </p>

            <h2>9. Limitation of Liability</h2>
            <p>
              LipaSasa's liability is limited to the maximum extent permitted by law. We are not
              liable for indirect, incidental, or consequential damages arising from the use of
              our services.
            </p>

            <h2>10. Termination</h2>
            <p>
              We may terminate or suspend your account and access to our services at any time,
              with or without notice, for conduct that we believe violates these Terms of Service
              or is harmful to other users or our business.
            </p>

            <h2>11. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. We will notify users of
              significant changes via email or through our platform. Continued use of our services
              after changes constitutes acceptance of the new terms.
            </p>

            <h2>12. Governing Law</h2>
            <p>
              These terms are governed by the laws of Kenya. Any disputes arising from these terms
              or the use of our services shall be resolved in the courts of Kenya.
            </p>

            <h2>13. Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <ul>
              <li>Email: legal@lipasasa.online</li>
              <li>Phone: +254716972103</li>
              <li>Address: 123 Business Hub, Westlands, Nairobi, Kenya</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Contact for Questions */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Shield className="h-16 w-16 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-6">Questions About Our Terms?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Our legal team is available to clarify any questions you may have about these terms.
            </p>
            <button className="px-8 py-4 bg-primary text-white rounded-lg font-medium hover:bg-primary/90">
              Contact Legal Team
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};