import React from 'react';
import { Calendar, Shield, Lock, Eye } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';

export const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen">
      <SEOHead 
        title="Privacy Policy - How LipaSasa Protects Your Data"
        description="Learn how LipaSasa collects, uses, and protects your personal information. GDPR compliant privacy policy for our payment processing platform. Your data security is our priority."
        keywords="LipaSasa privacy policy, data protection Kenya, GDPR compliance, payment data security, privacy rights"
        canonicalUrl="https://lipasasa.online/privacy"
      />
      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Privacy Policy
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              How we collect, use, and protect your personal information
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Last updated: March 1, 2024
              </div>
              <div className="flex items-center gap-1">
                <Shield className="h-4 w-4" />
                GDPR Compliant
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Principles */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-16">Our Privacy Principles</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-8 rounded-xl bg-slate-50">
                <Lock className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-4">Security First</h3>
                <p className="text-muted-foreground">
                  We use industry-leading security measures to protect your data
                </p>
              </div>
              <div className="text-center p-8 rounded-xl bg-slate-50">
                <Eye className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-4">Transparency</h3>
                <p className="text-muted-foreground">
                  We're clear about what data we collect and how we use it
                </p>
              </div>
              <div className="text-center p-8 rounded-xl bg-slate-50">
                <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-4">Your Control</h3>
                <p className="text-muted-foreground">
                  You have control over your personal data and privacy settings
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Policy Content */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto prose prose-lg">
            <h2>1. Information We Collect</h2>
            <p>
              We collect information that you provide directly to us, such as when you create an account,
              make a transaction, or contact us for support. This may include:
            </p>
            <ul>
              <li>Personal identification information (name, email, phone number)</li>
              <li>Business information (company name, registration details)</li>
              <li>Financial information (bank account details, transaction data)</li>
              <li>Technical information (IP address, device information, usage data)</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide and maintain our payment processing services</li>
              <li>Process transactions and send related communications</li>
              <li>Verify your identity and prevent fraud</li>
              <li>Improve our services and develop new features</li>
              <li>Comply with legal and regulatory requirements</li>
              <li>Send you service updates and marketing communications (with your consent)</li>
            </ul>

            <h2>3. Information Sharing and Disclosure</h2>
            <p>
              We do not sell, trade, or otherwise transfer your personal information to third parties
              without your consent, except in the following circumstances:
            </p>
            <ul>
              <li>To payment networks and financial institutions to process transactions</li>
              <li>To service providers who assist us in operating our business</li>
              <li>To comply with legal obligations or respond to legal requests</li>
              <li>To protect our rights, property, or safety, or that of our users</li>
            </ul>

            <h2>4. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal
              information against unauthorized access, alteration, disclosure, or destruction. These
              measures include:
            </p>
            <ul>
              <li>Encryption of sensitive data in transit and at rest</li>
              <li>Regular security assessments and audits</li>
              <li>Access controls and authentication procedures</li>
              <li>Employee training on data protection practices</li>
            </ul>

            <h2>5. Data Retention</h2>
            <p>
              We retain your personal information for as long as necessary to provide our services
              and comply with legal obligations. Transaction data may be retained for longer periods
              as required by financial regulations.
            </p>

            <h2>6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access your personal information</li>
              <li>Correct inaccurate or incomplete information</li>
              <li>Request deletion of your personal information</li>
              <li>Object to processing of your personal information</li>
              <li>Request data portability</li>
              <li>Withdraw consent (where applicable)</li>
            </ul>

            <h2>7. Cookies and Tracking</h2>
            <p>
              We use cookies and similar technologies to enhance your experience, analyze usage,
              and personalize content. You can control cookie preferences through your browser
              settings.
            </p>

            <h2>8. International Data Transfers</h2>
            <p>
              If we transfer your personal information outside of Kenya, we ensure appropriate
              safeguards are in place to protect your data in accordance with applicable laws.
            </p>

            <h2>9. Children's Privacy</h2>
            <p>
              Our services are not intended for individuals under the age of 18. We do not
              knowingly collect personal information from children under 18.
            </p>

            <h2>10. Changes to This Policy</h2>
            <p>
              We may update this privacy policy from time to time. We will notify you of any
              significant changes by posting the new policy on our website and sending you an
              email notification.
            </p>

            <h2>11. Contact Us</h2>
            <p>
              If you have any questions about this privacy policy or our data practices,
              please contact us at:
            </p>
            <ul>
              <li>Email: privacy@lipasasa.online</li>
              <li>Phone: +254716972103</li>
              <li>Address: 123 Business Hub, Westlands, Nairobi, Kenya</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Contact for Privacy Questions */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Shield className="h-16 w-16 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-6">Questions About Your Privacy?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Our privacy team is here to help you understand how we protect your data.
            </p>
            <button className="px-8 py-4 bg-primary text-white rounded-lg font-medium hover:bg-primary/90">
              Contact Privacy Team
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};