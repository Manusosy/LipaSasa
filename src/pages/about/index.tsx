import React from 'react';
import { ArrowRight, Heart, Trophy, Target, Users } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';

export const AboutUs = () => {
  return (
    <div className="min-h-screen">
      <SEOHead 
        title="About Us - Building the Future of Payments in Africa"
        description="Learn about LipaSasa's mission to empower African businesses with seamless payment solutions. We're helping thousands of Kenyan businesses accept M-Pesa, Airtel Money, and mobile payments."
        keywords="About LipaSasa, payment solutions Kenya, African fintech, M-Pesa integration, business payments"
        canonicalUrl="https://lipasasa.online/about"
      />
      {/* Hero Section with Parallax */}
      <section className="relative h-[70vh] overflow-hidden flex items-center">
        <div 
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600880292203-757bb62b4baf')] bg-cover bg-center bg-no-repeat"
          style={{ transform: 'translateZ(-1px) scale(2)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/60" />
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Building the Future of <br />
            Payments in Africa
          </h1>
          <p className="text-xl text-white/90 max-w-2xl">
            We're on a mission to simplify payments for businesses across Kenya and beyond,
            making it easier for entrepreneurs to focus on what they do best.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 bg-white relative">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
              <p className="text-lg text-muted-foreground mb-8">
                To empower African businesses with seamless payment solutions that drive growth
                and enable financial inclusion. We believe that every business, regardless of size,
                deserves access to modern financial tools.
              </p>
              <div className="grid gap-6">
                {[
                  { icon: Heart, title: 'Customer First', desc: "Every decision we make starts with our customers' needs" },
                  { icon: Trophy, title: 'Excellence', desc: 'We strive for excellence in everything we do' },
                  { icon: Target, title: 'Innovation', desc: 'Continuously pushing boundaries in financial technology' }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <item.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{item.title}</h3>
                      <p className="text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="sticky top-24">
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c"
                  alt="Team collaboration"
                  className="rounded-2xl shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section with Parallax */}
      <section className="relative py-24 overflow-hidden">
        <div 
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f')] bg-cover bg-fixed bg-center"
          style={{ transform: 'translateZ(-1px) scale(1.2)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-secondary/90" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-3xl font-bold mb-6">Meet Our Team</h2>
            <p className="text-lg mb-12">
              We're a diverse team of payments experts, engineers, and customer success specialists,
              united by our passion for transforming African commerce.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="text-center">
                  <div className="w-24 h-24 rounded-full bg-white/10 mx-auto mb-4" />
                  <h3 className="font-semibold">Team Member</h3>
                  <p className="text-sm text-white/80">Position</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="sticky top-24">
                <img
                  src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0"
                  alt="Business impact"
                  className="rounded-2xl shadow-2xl"
                />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Impact</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Since our founding, we've helped thousands of businesses streamline their payment
                processes, enabling growth and innovation across the continent.
              </p>
              <div className="grid grid-cols-2 gap-8">
                {[
                  { value: '1200+', label: 'Active Businesses' },
                  { value: '$2.4M+', label: 'Monthly Processing' },
                  { value: '99.8%', label: 'Success Rate' },
                  { value: '24/7', label: 'Support Available' },
                ].map((stat, i) => (
                  <div key={i} className="text-center p-6 rounded-xl bg-slate-50">
                    <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of businesses that trust LipaSasa for their payment needs.
            </p>
            <button className="inline-flex items-center px-6 py-3 rounded-full bg-primary text-white font-medium hover:bg-primary/90 transition-colors">
              Start Your Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
