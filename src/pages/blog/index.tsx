import React from 'react';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { SEOHead } from '@/components/SEOHead';

export const Blog = () => {
  const blogPosts = [
    {
      title: "The Future of Digital Payments in Kenya",
      excerpt: "Explore how mobile money and digital payments are transforming the Kenyan economy.",
      author: "LipaSasa Team",
      date: "March 15, 2024",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d"
    },
    {
      title: "5 Ways to Optimize Your Payment Flow",
      excerpt: "Learn best practices to reduce checkout abandonment and increase conversions.",
      author: "Sarah Mutindi",
      date: "March 10, 2024",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f"
    },
    {
      title: "Understanding M-Pesa Integration",
      excerpt: "A comprehensive guide to integrating M-Pesa payments into your business.",
      author: "John Kariuki",
      date: "March 5, 2024",
      image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3"
    }
  ];

  return (
    <div className="min-h-screen">
      <SEOHead 
        title="Blog - Insights on Digital Payments in Kenya"
        description="Read the latest insights, updates, and stories about digital payments, M-Pesa integration, and fintech innovations in Kenya from the LipaSasa team."
        keywords="payment blog Kenya, M-Pesa insights, digital payment trends, fintech news Kenya, business payment tips"
        canonicalUrl="https://lipasasa.online/blog"
      />
      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              LipaSasa Blog
            </h1>
            <p className="text-xl text-muted-foreground">
              Insights, updates, and stories from the world of digital payments
            </p>
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post, i) => (
                <article key={i} className="bg-white rounded-xl shadow-sm border border-border overflow-hidden hover:shadow-md transition-shadow">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <h2 className="text-xl font-semibold mb-3 hover:text-primary cursor-pointer">
                      {post.title}
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {post.author}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {post.date}
                      </div>
                    </div>
                    <button className="flex items-center text-primary font-medium hover:gap-2 transition-all">
                      Read More
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Stay Updated</h2>
            <p className="text-muted-foreground mb-8">
              Get the latest insights and updates delivered to your inbox
            </p>
            <div className="flex gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 border border-border rounded-lg"
              />
              <button className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};