import React from 'react';
import { Search, Book, MessageCircle, Phone, Mail } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';

export const HelpCenter = () => {
  const categories = [
    {
      icon: Book,
      title: "Getting Started",
      description: "Learn how to set up your account and start accepting payments",
      articles: [
        "How to create your LipaSasa account",
        "Setting up your first payment method",
        "Understanding transaction fees",
        "Configuring payment notifications"
      ]
    },
    {
      icon: MessageCircle,
      title: "API & Integration",
      description: "Technical guides for developers and integrations",
      articles: [
        "API Authentication",
        "Making your first API call",
        "Webhook implementation",
        "Error handling best practices"
      ]
    },
    {
      icon: Phone,
      title: "Account Management",
      description: "Manage your account settings and preferences",
      articles: [
        "Updating account information",
        "Managing payment methods",
        "Setting up team access",
        "Security best practices"
      ]
    }
  ];

  const popularArticles = [
    "How to integrate M-Pesa payments",
    "Understanding transaction statuses",
    "Setting up webhook notifications",
    "Troubleshooting payment failures",
    "Managing refunds and disputes"
  ];

  return (
    <div className="min-h-screen">
      <SEOHead 
        title="Help Center - LipaSasa Support & Documentation"
        description="Find answers to your questions about M-Pesa integration, payment setup, API documentation, and more. Get help with LipaSasa payment gateway and invoicing solutions."
        keywords="LipaSasa help, M-Pesa integration guide, payment API docs, Kenya payment support, invoice help"
        canonicalUrl="https://lipasasa.online/help"
      />
      {/* Hero Section with Search */}
      <section className="py-24 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Help Center
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Find answers to your questions and get the help you need
            </p>
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <input
                type="text"
                placeholder="Search for articles..."
                className="w-full pl-12 pr-4 py-4 border border-border rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-16">Browse by Category</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {categories.map((category, i) => (
                <div key={i} className="p-8 rounded-xl border border-border hover:shadow-md transition-shadow">
                  <category.icon className="h-12 w-12 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-3">{category.title}</h3>
                  <p className="text-muted-foreground mb-6">{category.description}</p>
                  <ul className="space-y-2">
                    {category.articles.map((article, j) => (
                      <li key={j}>
                        <a
                          href="#"
                          className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          {article}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Popular Articles</h2>
            <div className="space-y-4">
              {popularArticles.map((article, i) => (
                <a
                  key={i}
                  href="#"
                  className="block p-6 bg-white rounded-xl border border-border hover:shadow-md transition-shadow"
                >
                  <h3 className="font-semibold text-lg hover:text-primary transition-colors">
                    {article}
                  </h3>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Still Need Help?</h2>
            <p className="text-lg text-muted-foreground mb-12">
              Can't find the answer you're looking for? Our support team is here to help.
            </p>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-8 rounded-xl border border-border">
                <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Email Support</h3>
                <p className="text-muted-foreground mb-6">
                  Get detailed help via email. We typically respond within 24 hours.
                </p>
                <button className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90">
                  Send Email
                </button>
              </div>
              <div className="p-8 rounded-xl border border-border">
                <Phone className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Phone Support</h3>
                <p className="text-muted-foreground mb-6">
                  Speak directly with our support team. Available Monday to Friday, 9am-6pm.
                </p>
                <button className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90">
                  Call Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};