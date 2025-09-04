import React from 'react';
import { MapPin, Clock, Briefcase, Heart, Trophy, Users } from 'lucide-react';

export const Careers = () => {
  const openPositions = [
    {
      title: "Senior Frontend Developer",
      department: "Engineering",
      location: "Nairobi, Kenya",
      type: "Full-time",
      description: "Join our engineering team to build the future of payments in Africa."
    },
    {
      title: "Product Manager",
      department: "Product",
      location: "Nairobi, Kenya",
      type: "Full-time",
      description: "Lead product strategy and development for our payment solutions."
    },
    {
      title: "Business Development Manager",
      department: "Sales",
      location: "Nairobi, Kenya",
      type: "Full-time",
      description: "Drive business growth and build partnerships across Kenya."
    }
  ];

  const benefits = [
    {
      icon: Heart,
      title: "Health & Wellness",
      description: "Comprehensive health insurance and wellness programs"
    },
    {
      icon: Trophy,
      title: "Growth Opportunities",
      description: "Continuous learning and professional development"
    },
    {
      icon: Users,
      title: "Team Culture",
      description: "Collaborative and inclusive work environment"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Join Our Team
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Help us build the future of payments in Africa. Join a team that's passionate
              about making a difference.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-16">Why Work With Us?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {benefits.map((benefit, i) => (
                <div key={i} className="text-center p-8 rounded-xl bg-slate-50">
                  <benefit.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-4">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-16">Open Positions</h2>
            <div className="space-y-6">
              {openPositions.map((position, i) => (
                <div key={i} className="bg-white p-8 rounded-xl shadow-sm border border-border">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">{position.title}</h3>
                      <p className="text-muted-foreground mb-4">{position.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4" />
                          {position.department}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {position.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {position.type}
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 md:mt-0">
                      <button className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90">
                        Apply Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Don't See Your Role?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              We're always looking for talented individuals. Send us your resume and
              tell us how you'd like to contribute.
            </p>
            <button className="px-8 py-4 bg-primary text-white rounded-lg font-medium hover:bg-primary/90">
              Send Us Your Resume
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};