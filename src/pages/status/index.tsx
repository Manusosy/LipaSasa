import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Clock, Activity, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { SEOHead } from '@/components/SEOHead';

interface HealthCheck {
  service: string;
  status: 'operational' | 'degraded' | 'down';
  response_time_ms: number;
  last_checked: string;
  error?: string;
}

interface SystemHealth {
  overall_status: string;
  checks: HealthCheck[];
  timestamp: string;
}

interface Incident {
  id: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  affected_services: string[];
  started_at: string;
  resolved_at?: string;
}

export const SystemStatus = () => {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatusData();
    // Refresh every 30 seconds
    const interval = setInterval(loadStatusData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadStatusData = async () => {
    try {
      // Fetch latest health check
      const { data: healthData, error: healthError } = await supabase
        .from('system_health_checks')
        .select('*')
        .order('checked_at', { ascending: false })
        .limit(1)
        .single();

      if (!healthError && healthData) {
        setHealth({
          overall_status: healthData.overall_status,
          checks: healthData.checks,
          timestamp: healthData.checked_at,
        });
      }

      // Fetch active and recent incidents
      const { data: incidentsData, error: incidentsError } = await supabase
        .from('system_incidents')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(10);

      if (!incidentsError && incidentsData) {
        setIncidents(incidentsData);
      }

    } catch (error) {
      console.error('Failed to load status data:', error);
    } finally {
      setLoading(false);
    }
  };

  const serviceMapping: { [key: string]: string } = {
    'database': 'Database',
    'mpesa_api': 'M-Pesa Gateway',
    'paypal_api': 'PayPal Gateway',
    'edge_functions': 'API Services',
  };

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

  const overallStatusColor = 
    health?.overall_status === 'operational' ? 'bg-green-50 text-green-700' :
    health?.overall_status === 'degraded' ? 'bg-yellow-50 text-yellow-700' :
    'bg-red-50 text-red-700';

  const overallStatusText =
    health?.overall_status === 'operational' ? 'All Systems Operational' :
    health?.overall_status === 'degraded' ? 'Some Systems Degraded' :
    'System Issues Detected';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SEOHead 
        title="System Status - LipaSasa Platform Health"
        description="Real-time status of LipaSasa payment platform services. Monitor M-Pesa integration, API services, and system uptime."
        keywords="LipaSasa status, system health, M-Pesa uptime, API status, platform monitoring"
        canonicalUrl="https://lipasasa.online/status"
      />
      
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
            <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full ${overallStatusColor}`}>
              {health?.overall_status === 'operational' && <CheckCircle className="h-5 w-5" />}
              {health?.overall_status !== 'operational' && <AlertCircle className="h-5 w-5" />}
              {overallStatusText}
            </div>
            {health?.timestamp && (
              <p className="mt-4 text-sm text-muted-foreground">
                Last checked: {new Date(health.timestamp).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Current Status */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-12">Current Status</h2>
            {health?.checks && health.checks.length > 0 ? (
              <div className="space-y-4">
                {health.checks.map((check, i) => (
                  <div key={i} className="flex items-center justify-between p-6 border border-border rounded-xl">
                    <div className="flex items-center gap-4">
                      {getStatusIcon(check.status)}
                      <div>
                        <h3 className="font-semibold">{serviceMapping[check.service] || check.service}</h3>
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(check.status)}`}>
                          {check.status.charAt(0).toUpperCase() + check.status.slice(1)}
                        </span>
                        {check.error && (
                          <p className="text-xs text-red-600 mt-1">{check.error}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Response Time</div>
                      <div className="font-semibold">{check.response_time_ms}ms</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-12 border border-border rounded-xl">
                <p className="text-muted-foreground">No health check data available. System monitoring in progress...</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Recent Incidents */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-12">Recent Incidents</h2>
            {incidents.length > 0 ? (
              <div className="space-y-6">
                {incidents.map((incident) => (
                  <div key={incident.id} className="bg-white p-6 rounded-xl border border-border">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold mb-2">{incident.title}</h3>
                        <div className="flex flex-wrap gap-2">
                          {incident.affected_services.map((service, idx) => (
                            <span key={idx} className="px-2 py-1 text-xs bg-slate-100 text-slate-700 rounded">
                              {serviceMapping[service] || service}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          incident.status === 'resolved' ? 'bg-green-50 text-green-700' :
                          incident.status === 'monitoring' ? 'bg-blue-50 text-blue-700' :
                          incident.status === 'identified' ? 'bg-orange-50 text-orange-700' :
                          'bg-yellow-50 text-yellow-700'
                        }`}>
                          {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          incident.severity === 'critical' ? 'bg-red-50 text-red-700' :
                          incident.severity === 'high' ? 'bg-orange-50 text-orange-700' :
                          incident.severity === 'medium' ? 'bg-yellow-50 text-yellow-700' :
                          'bg-blue-50 text-blue-700'
                        }`}>
                          {incident.severity.charAt(0).toUpperCase() + incident.severity.slice(1)}
                        </span>
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-3">{incident.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Started: {new Date(incident.started_at).toLocaleString()}</span>
                      {incident.resolved_at && (
                        <span>Resolved: {new Date(incident.resolved_at).toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-12 rounded-xl border border-border text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-lg font-semibold mb-2">No Recent Incidents</p>
                <p className="text-muted-foreground">All systems are running smoothly</p>
              </div>
            )}
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