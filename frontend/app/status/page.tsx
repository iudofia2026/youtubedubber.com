'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Clock, Zap, Server, Database, Globe, Shield, Activity, TrendingUp, RefreshCw, ExternalLink } from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { YTdubberIcon } from '@/components/YTdubberIcon';

export default function StatusPage() {
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock data - in a real app, this would come from an API
  const systemStatus = {
    overall: 'operational',
    uptime: '99.9%',
    lastIncident: '2024-01-15',
    responseTime: '120ms'
  };

  const services = [
    {
      name: 'API Services',
      status: 'operational',
      description: 'Core API endpoints and authentication',
      uptime: '99.9%',
      responseTime: '95ms',
      lastIncident: null,
      icon: Server
    },
    {
      name: 'Audio Processing',
      status: 'operational',
      description: 'AI dubbing and voice synthesis',
      uptime: '99.8%',
      responseTime: '2.3s',
      lastIncident: null,
      icon: Zap
    },
    {
      name: 'File Storage',
      status: 'operational',
      description: 'Audio file upload and storage',
      uptime: '99.9%',
      responseTime: '180ms',
      lastIncident: null,
      icon: Database
    },
    {
      name: 'CDN',
      status: 'operational',
      description: 'Content delivery and downloads',
      uptime: '99.9%',
      responseTime: '45ms',
      lastIncident: null,
      icon: Globe
    },
    {
      name: 'Authentication',
      status: 'operational',
      description: 'User login and account management',
      uptime: '99.9%',
      responseTime: '80ms',
      lastIncident: null,
      icon: Shield
    },
    {
      name: 'Job Queue',
      status: 'operational',
      description: 'Background job processing',
      uptime: '99.7%',
      responseTime: '150ms',
      lastIncident: null,
      icon: Activity
    }
  ];

  const recentIncidents = [
    {
      id: 1,
      title: 'Scheduled Maintenance - Audio Processing',
      status: 'resolved',
      severity: 'maintenance',
      startTime: '2024-01-15T02:00:00Z',
      endTime: '2024-01-15T04:00:00Z',
      description: 'Planned maintenance window for audio processing infrastructure updates.',
      affectedServices: ['Audio Processing', 'Job Queue']
    },
    {
      id: 2,
      title: 'API Rate Limiting Issue',
      status: 'resolved',
      severity: 'minor',
      startTime: '2024-01-10T14:30:00Z',
      endTime: '2024-01-10T15:45:00Z',
      description: 'Temporary rate limiting issues affecting some API endpoints. Resolved by scaling infrastructure.',
      affectedServices: ['API Services']
    },
    {
      id: 3,
      title: 'File Upload Intermittent Failures',
      status: 'resolved',
      severity: 'minor',
      startTime: '2024-01-05T09:15:00Z',
      endTime: '2024-01-05T11:30:00Z',
      description: 'Some users experienced intermittent file upload failures. Issue was resolved by optimizing storage configuration.',
      affectedServices: ['File Storage', 'CDN']
    }
  ];

  const performanceMetrics = [
    {
      name: 'Average Response Time',
      value: '120ms',
      change: '+5ms',
      trend: 'up',
      icon: Clock
    },
    {
      name: 'Success Rate',
      value: '99.9%',
      change: '+0.1%',
      trend: 'up',
      icon: TrendingUp
    },
    {
      name: 'Active Users',
      value: '2,847',
      change: '+12%',
      trend: 'up',
      icon: Activity
    },
    {
      name: 'Jobs Processed Today',
      value: '15,432',
      change: '+8%',
      trend: 'up',
      icon: Zap
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'degraded':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'outage':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'maintenance':
        return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return CheckCircle;
      case 'degraded':
        return AlertCircle;
      case 'outage':
        return AlertCircle;
      case 'maintenance':
        return Clock;
      default:
        return Clock;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'major':
        return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
      case 'minor':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'maintenance':
        return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800';
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLastUpdated(new Date());
    setIsRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Seamless gradient background */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#ff0000]/3 via-[#ff0000]/1 via-[#ff0000]/0.5 to-[#ff0000]/2 pointer-events-none z-0"></div>
      <div className="fixed inset-0 bg-gradient-to-r from-transparent via-[#ff0000]/0.5 to-transparent pointer-events-none z-0 animate-pulse-slow"></div>
      
      <div className="relative z-10">
        <Navigation currentPath="/status" />
        
        <main>
          {/* Hero Section */}
          <motion.section
            className="py-12 sm:py-20 relative overflow-hidden px-4 sm:px-6 lg:px-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <motion.div
                    className="flex items-center mb-6"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    <div className="w-16 h-16 bg-gradient-to-r from-[#ff0000] to-[#cc0000] rounded-2xl flex items-center justify-center mr-4">
                      <Activity className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl sm:text-5xl font-bold text-foreground tracking-tight">
                        System Status
                      </h1>
                      <p className="text-lg text-muted-foreground mt-2">
                        Real-time status of YT Dubber services
                      </p>
                    </div>
                  </motion.div>
                </div>

                <motion.div
                  className="flex items-center space-x-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Last updated</p>
                    <p className="text-foreground font-medium">
                      {lastUpdated.toLocaleTimeString()}
                    </p>
                  </div>
                  <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="p-3 bg-card border border-border rounded-lg hover:bg-muted transition-colors duration-200 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-5 h-5 text-foreground ${isRefreshing ? 'animate-spin' : ''}`} />
                  </button>
                </motion.div>
              </div>

              {/* Overall Status */}
              <motion.div
                className="mt-8 p-6 bg-card border border-border rounded-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-4 h-4 rounded-full ${systemStatus.overall === 'operational' ? 'bg-green-500' : 'bg-red-500'}`} />
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">
                        All Systems Operational
                      </h2>
                      <p className="text-muted-foreground">
                        All services are running normally
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-foreground">
                      {systemStatus.uptime}
                    </p>
                    <p className="text-sm text-muted-foreground">Uptime (30 days)</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.section>

          {/* Performance Metrics */}
          <motion.section
            className="py-12 px-4 sm:px-6 lg:px-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl font-bold text-foreground mb-8">
                Performance Metrics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {performanceMetrics.map((metric, index) => {
                  const Icon = metric.icon;
                  return (
                    <motion.div
                      key={metric.name}
                      className="bg-card border border-border rounded-xl p-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 1.0 + index * 0.1 }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <Icon className="w-8 h-8 text-[#ff0000]" />
                        <span className={`text-sm font-medium ${
                          metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {metric.change}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-foreground mb-1">
                        {metric.value}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {metric.name}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.section>

          {/* Services Status */}
          <motion.section
            className="py-12 px-4 sm:px-6 lg:px-8 bg-muted/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
          >
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl font-bold text-foreground mb-8">
                Service Status
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service, index) => {
                  const Icon = service.icon;
                  const StatusIcon = getStatusIcon(service.status);
                  return (
                    <motion.div
                      key={service.name}
                      className="bg-card border border-border rounded-xl p-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 1.2 + index * 0.1 }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <Icon className="w-6 h-6 text-[#ff0000]" />
                          <h3 className="text-lg font-semibold text-foreground">
                            {service.name}
                          </h3>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(service.status)}`}>
                          <div className="flex items-center space-x-1">
                            <StatusIcon className="w-3 h-3" />
                            <span className="capitalize">{service.status}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-muted-foreground text-sm mb-4">
                        {service.description}
                      </p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Uptime</span>
                          <span className="text-foreground font-medium">{service.uptime}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Response Time</span>
                          <span className="text-foreground font-medium">{service.responseTime}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.section>

          {/* Recent Incidents */}
          <motion.section
            className="py-12 px-4 sm:px-6 lg:px-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl font-bold text-foreground mb-8">
                Recent Incidents
              </h2>
              <div className="space-y-4">
                {recentIncidents.map((incident, index) => (
                  <motion.div
                    key={incident.id}
                    className="bg-card border border-border rounded-xl p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.4 + index * 0.1 }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-foreground">
                          {incident.title}
                        </h3>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(incident.severity)}`}>
                          {incident.severity}
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(incident.status)}`}>
                        {incident.status}
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-4">
                      {incident.description}
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">Affected Services:</span> {incident.affectedServices.join(', ')}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(incident.startTime)} - {formatDate(incident.endTime)}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* Status Page Footer */}
          <motion.section
            className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[#ff0000]/5 to-[#ff0000]/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.4 }}
          >
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Stay Updated
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Subscribe to status updates and get notified about incidents
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:status@ytdubber.com"
                  className="inline-flex items-center space-x-2 bg-[#ff0000] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#cc0000] transition-colors duration-200"
                >
                  <span>Subscribe to Updates</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
                <a
                  href="/contact"
                  className="inline-flex items-center space-x-2 border-2 border-[#ff0000] text-[#ff0000] px-6 py-3 rounded-lg font-medium hover:bg-[#ff0000] hover:text-white transition-colors duration-200"
                >
                  <span>Report an Issue</span>
                </a>
              </div>
            </div>
          </motion.section>
        </main>
      </div>
    </div>
  );
}