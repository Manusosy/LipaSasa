import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: 'Features', href: '#features' },
      { name: 'Pricing', href: '#pricing' },
      { name: 'Integrations', href: '#integrations' },
      { name: 'API Documentation', href: '/docs' },
    ],
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Blog', href: '/blog' },
      { name: 'Careers', href: '/careers' },
      { name: 'Press Kit', href: '/press' },
    ],
    support: [
      { name: 'Help Center', href: '/help' },
      { name: 'Contact Us', href: '/contact' },
      { name: 'Status', href: '/status' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Privacy Policy', href: '/privacy' },
    ],
    contact: [
      { 
        icon: Phone,
        text: '+254716972103',
        href: 'tel:+254716972103'
      },
      {
        icon: Mail,
        text: 'support@lipasasa.online',
        href: 'mailto:support@lipasasa.online'
      },
      {
        icon: MapPin,
        text: 'Nairobi, Kenya',
        href: 'https://maps.google.com'
      }
    ]
  };

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com/lipasasa' },
    { icon: Twitter, href: 'https://twitter.com/lipasasa' },
    { icon: Instagram, href: 'https://instagram.com/lipasasa' },
    { icon: Linkedin, href: 'https://linkedin.com/company/lipasasa' },
  ];

  return (
    <footer className="bg-slate-50 border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <img src="/lipasasa-logo.png" alt="LipaSasa Logo" className="h-8" />
            </div>
            <p className="text-muted-foreground mb-6 max-w-md">
              The simple way for Kenyan businesses to collect M-Pesa, Airtel Money, and card payments.
              Get started in minutes.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <social.icon className="h-5 w-5 text-muted-foreground" />
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Product</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support & Contact */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-wrap gap-8 justify-between items-center">
            <div className="flex flex-wrap gap-8">
              {footerLinks.contact.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  <span>{item.text}</span>
                </a>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              © {currentYear} LipaSasa. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
