'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight, Home, BarChart3, Plus, Download } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  return (
    <nav className={`flex items-center space-x-2 text-sm ${className}`} aria-label="Breadcrumb">
      <motion.div
        className="flex items-center space-x-2"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {items.map((item, index) => {
          const Icon = item.icon;
          const isLast = index === items.length - 1;
          
          return (
            <React.Fragment key={index}>
              {index > 0 && (
                <motion.div
                  className="text-muted-foreground/60"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <ChevronRight className="w-4 h-4" />
                </motion.div>
              )}
              
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                {isLast ? (
                  <span className="flex items-center space-x-2 text-foreground font-medium">
                    {Icon && <Icon className="w-4 h-4" />}
                    <span>{item.label}</span>
                  </span>
                ) : (
                  <Link
                    href={item.href!}
                    className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors duration-200 group"
                  >
                    {Icon && <Icon className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />}
                    <span className="group-hover:underline">{item.label}</span>
                  </Link>
                )}
              </motion.div>
            </React.Fragment>
          );
        })}
      </motion.div>
    </nav>
  );
}

// Predefined breadcrumb configurations for common pages
export const breadcrumbConfigs = {
  home: [{ label: 'Home', href: '/', icon: Home }],
  
  newJob: [
    { label: 'Home', href: '/', icon: Home },
    { label: 'New Job', href: '/new', icon: Plus }
  ],
  
  jobs: [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Jobs', href: '/jobs', icon: BarChart3 }
  ],

  downloads: [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Downloads', href: '/downloads', icon: Download }
  ],

  jobDetail: (jobId: string) => [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Jobs', href: '/jobs', icon: BarChart3 },
    { label: `Job #${jobId.slice(-8)}`, href: `/jobs/${jobId}` }
  ],

  jobDetailFromNew: (jobId: string) => [
    { label: 'Home', href: '/', icon: Home },
    { label: 'New Job', href: '/new', icon: Plus },
    { label: `Job #${jobId.slice(-8)}`, href: `/jobs/${jobId}` }
  ],

};