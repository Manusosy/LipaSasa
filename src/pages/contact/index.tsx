import React from 'react';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { SEOHead } from '@/components/SEOHead';

export const ContactUs = () => {
  return (
    <div className="min-h-screen">
      <SEOHead 
        title="Contact Us - Get in Touch with LipaSasa"
        description="Contact LipaSasa for support, inquiries, or partnership opportunities. Our team is here to help you succeed with M-Pesa and mobile payment integration. Available Monday to Friday, 9am-6pm."
        keywords="Contact LipaSasa, payment support Kenya, M-Pesa help, customer support, Nairobi office"
        canonicalUrl="https://lipasasa.online/contact"
      />
      {/* Hero Section with Parallax Map */}
      <section className="relative h-[70vh] overflow-hidden flex items-center">
        <div 
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1521737711867-e3b97375f902')] bg-cover bg-center bg-no-repeat"
          style={{ transform: 'translateZ(-1px) scale(2)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/60" />
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Get in Touch
          </h1>
          <p className="text-xl text-white/90 max-w-2xl">
            We're here to help you succeed. Reach out to our team for support,
            inquiries, or partnership opportunities.
          </p>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-24 bg-white relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div className="relative">
              <div className="sticky top-24 bg-white p-8 rounded-2xl shadow-lg">
                <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
                <form className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">First Name</label>
                      <Input placeholder="John" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Last Name</label>
                      <Input placeholder="Doe" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Email</label>
                    <Input type="email" placeholder="john@example.com" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Subject</label>
                    <Input placeholder="How can we help?" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Message</label>
                    <Textarea 
                      placeholder="Tell us more about your inquiry..."
                      className="min-h-[150px]"
                    />
                  </div>
                  <Button className="w-full">
                    Send Message
                    <Send className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <h2 className="text-2xl font-bold mb-8">Contact Information</h2>
              <div className="space-y-8">
                {[
                  {
                    icon: MapPin,
                    title: 'Visit Us',
                    content: '123 Business Hub, Westlands',
                    details: 'Nairobi, Kenya'
                  },
                  {
                    icon: Phone,
                    title: 'Call Us',
                    content: '+254716972103',
                    details: 'Monday to Friday, 9am to 6pm'
                  },
                  {
                    icon: Mail,
                    title: 'Email Us',
                    content: 'support@lipasasa.online',
                    details: "We'll respond within 24 hours"
                  },
                  {
                    icon: Clock,
                    title: 'Business Hours',
                    content: 'Monday - Friday: 9:00 AM - 6:00 PM',
                    details: 'Weekend: Closed'
                  }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 p-6 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div className="p-3 rounded-lg bg-primary/10 h-fit">
                      <item.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{item.title}</h3>
                      <p className="text-muted-foreground">{item.content}</p>
                      <p className="text-sm text-muted-foreground">{item.details}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Map Section */}
              <div className="mt-12">
                <h3 className="text-xl font-semibold mb-4">Find Us on Map</h3>
                <div className="relative h-[300px] rounded-xl overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.818223751224!2d36.81196561475402!3d-1.2667023990669586!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f17395e68d6af%3A0x3e2c1c8f5f4c5c0a!2sWestlands%2C%20Nairobi!5e0!3m2!1sen!2ske!4v1620147451234!5m2!1sen!2ske"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section with Parallax */}
      <section className="relative py-24 overflow-hidden">
        <div 
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557804506-669a67965ba0')] bg-cover bg-fixed bg-center opacity-10"
          style={{ transform: 'translateZ(-1px) scale(1.2)' }}
        />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {[
                {
                  q: "What payment methods do you support?",
                  a: "We support M-Pesa, card payments, and bank transfers."
                },
                {
                  q: "How long does it take to get started?",
                  a: "You can start accepting payments within 24 hours of completing your registration."
                },
                {
                  q: "What are your transaction fees?",
                  a: "Our fees are competitive and transparent. Contact our sales team for detailed pricing."
                }
              ].map((item, i) => (
                <div key={i} className="p-6 rounded-xl bg-white shadow-sm">
                  <h3 className="font-semibold mb-2">{item.q}</h3>
                  <p className="text-muted-foreground">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
