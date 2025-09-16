import React from 'react';
import { Download, Mail, Calendar } from 'lucide-react';

export const PressKit = () => {
  const pressReleases = [
    {
      title: "LipaSasa Raises $2M Series A to Expand Payment Solutions",
      date: "March 20, 2024",
      excerpt: "Leading Kenyan fintech company secures funding to accelerate growth across East Africa."
    },
    {
      title: "LipaSasa Partners with Major Banks to Enhance Payment Infrastructure",
      date: "February 15, 2024",
      excerpt: "Strategic partnerships aim to improve payment processing and financial inclusion."
    },
    {
      title: "LipaSasa Launches New API for Seamless M-Pesa Integration",
      date: "January 10, 2024",
      excerpt: "New developer tools make it easier for businesses to accept mobile money payments."
    }
  ];

  const mediaAssets = [
    { name: "LipaSasa Logo (PNG)", size: "2.4 MB", type: "Logo" },
    { name: "LipaSasa Logo (SVG)", size: "156 KB", type: "Logo" },
    { name: "Brand Guidelines", size: "8.2 MB", type: "PDF" },
    { name: "Product Screenshots", size: "15.3 MB", type: "Images" }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Press Kit
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Media resources, press releases, and brand assets for journalists and partners
            </p>
            <div className="flex gap-4">
              <button className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 flex items-center gap-2">
                <Download className="h-5 w-5" />
                Download Full Kit
              </button>
              <button className="px-6 py-3 border border-border rounded-lg font-medium hover:bg-slate-50 flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contact Press Team
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Company Overview */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">About LipaSasa</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-muted-foreground mb-6">
                LipaSasa is Kenya's leading payment solution provider, enabling businesses
                to accept M-Pesa, card payments, and bank transfers through a single platform.
                Founded in 2023, we've helped over 1,200 businesses streamline their payment
                processes and drive growth.
              </p>
              <div className="grid md:grid-cols-3 gap-8 my-12">
                <div className="text-center p-6 rounded-xl bg-slate-50">
                  <div className="text-3xl font-bold text-primary mb-2">1200+</div>
                  <div className="text-muted-foreground">Active Businesses</div>
                </div>
                <div className="text-center p-6 rounded-xl bg-slate-50">
                  <div className="text-3xl font-bold text-primary mb-2">$2.4M+</div>
                  <div className="text-muted-foreground">Monthly Processing</div>
                </div>
                <div className="text-center p-6 rounded-xl bg-slate-50">
                  <div className="text-3xl font-bold text-primary mb-2">99.8%</div>
                  <div className="text-muted-foreground">Success Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Press Releases */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-12">Recent Press Releases</h2>
            <div className="space-y-8">
              {pressReleases.map((release, i) => (
                <div key={i} className="bg-white p-8 rounded-xl shadow-sm border border-border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Calendar className="h-4 w-4" />
                    {release.date}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{release.title}</h3>
                  <p className="text-muted-foreground mb-4">{release.excerpt}</p>
                  <button className="text-primary font-medium hover:underline">
                    Read Full Release →
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Media Assets */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-12">Media Assets</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {mediaAssets.map((asset, i) => (
                <div key={i} className="flex items-center justify-between p-6 border border-border rounded-xl">
                  <div>
                    <h3 className="font-semibold">{asset.name}</h3>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>{asset.type}</span>
                      <span>{asset.size}</span>
                    </div>
                  </div>
                  <button className="px-4 py-2 border border-border rounded-lg hover:bg-slate-50 flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Media Inquiries</h2>
            <p className="text-lg text-muted-foreground mb-8">
              For press inquiries, interviews, or additional information,
              please contact our media team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:press@lipasasa.online"
                className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90"
              >
                press@lipasasa.online
              </a>
              <a
                href="tel:+254716972103"
                className="px-6 py-3 border border-border rounded-lg font-medium hover:bg-white"
              >
                +254716972103
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};