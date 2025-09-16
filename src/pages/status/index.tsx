import React from 'react';
import { CheckCircle, AlertCircle, Clock, Activity } from 'lucide-react';

export const SystemStatus = () => {
  const services = [
    { name: "Payment Processing", status: "operational", uptime: "99.9%" },
    { name: "M-Pesa Gateway", status: "operational", uptime: "99.8%" },
    { name: "Card Processing", status: "operational", uptime: "99.7%" },
    { name: "API Services", status: "operational", uptime: "99.9%" },
    { name: "Webhook Delivery", status: "degraded", uptime: "98.2%" },
    { name: "Dashboard", status: "operational", uptime: "99.9%" }
  ];

  const incidents = [
    {
      title: "Webhook delivery delays",
      status: "investigating",
      time: "2 hours ago",
      description: "We are currently investigating delays in webhook delivery. Payment processing is not affected."
    },
    {
      title: "Scheduled maintenance",
      status: "completed",
      time: "1 day ago",
      description: "Scheduled maintenance completed successfully. All services are now fully operational."
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'degraded':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'down':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'text-green-600 bg-green-50';
      case 'degraded':
        return 'text-yellow-600 bg-yellow-50';
      case 'down':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              System Status
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Real-time status of all LipaSasa services and systems
            </p>
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-50 text-green-700 rounded-full">
              <CheckCircle className="h-5 w-5" />
              All Systems Operational
            </div>
          </div>
        </div>
      </section>

      {/* Current Status */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-12">Current Status</h2>
            <div className="space-y-4">
              {services.map((service, i) => (
                <div key={i} className="flex items-center justify-between p-6 border border-border rounded-xl">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(service.status)}
                    <div>
                      <h3 className="font-semibold">{service.name}</h3>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(service.status)}`}>
                        {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">30-day uptime</div>
                    <div className="font-semibold">{service.uptime}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Recent Incidents */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-12">Recent Incidents</h2>
            <div className="space-y-6">
              {incidents.map((incident, i) => (
                <div key={i} className="bg-white p-6 rounded-xl border border-border">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-semibold">{incident.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        incident.status === 'investigating' ? 'bg-yellow-50 text-yellow-700' : 'bg-green-50 text-green-700'
                      }`}>
                        {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
                      </span>
                      <span className="text-sm text-muted-foreground">{incident.time}</span>
                    </div>
                  </div>
                  <p className="text-muted-foreground">{incident.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Performance Metrics */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-12">Performance Metrics</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-8 rounded-xl bg-slate-50">
                <Activity className="h-12 w-12 text-primary mx-auto mb-4" />
                <div className="text-3xl font-bold mb-2">99.9%</div>
                <div className="text-muted-foreground">Overall Uptime</div>
              </div>
              <div className="text-center p-8 rounded-xl bg-slate-50">
                <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
                <div className="text-3xl font-bold mb-2">250ms</div>
                <div className="text-muted-foreground">Average Response Time</div>
              </div>
              <div className="text-center p-8 rounded-xl bg-slate-50">
                <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                <div className="text-3xl font-bold mb-2">99.8%</div>
                <div className="text-muted-foreground">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subscribe to Updates */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Stay Informed</h2>
            <p className="text-muted-foreground mb-8">
              Subscribe to receive notifications about system status updates and planned maintenance
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