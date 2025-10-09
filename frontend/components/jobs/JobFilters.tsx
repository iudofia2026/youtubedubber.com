'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, X, Calendar, CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export type JobStatus = 'all' | 'pending' | 'processing' | 'complete' | 'error';
export type SortOption = 'newest' | 'oldest' | 'status' | 'duration';

interface JobFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: JobStatus;
  onStatusChange: (status: JobStatus) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  onClearFilters: () => void;
}

const statusOptions = [
  { value: 'all', label: 'All Jobs', icon: CheckCircle, count: 0 },
  { value: 'pending', label: 'Pending', icon: Clock, count: 0 },
  { value: 'processing', label: 'Processing', icon: Loader2, count: 0 },
  { value: 'complete', label: 'Complete', icon: CheckCircle, count: 0 },
  { value: 'error', label: 'Error', icon: AlertCircle, count: 0 },
];

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'status', label: 'By Status' },
  { value: 'duration', label: 'By Duration' },
];

export function JobFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  sortBy,
  onSortChange,
  onClearFilters
}: JobFiltersProps) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const hasActiveFilters = searchQuery || statusFilter !== 'all' || sortBy !== 'newest';

  return (
    <div className="space-y-4">
      {/* Search and Filter Toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 z-10" />
          <Input
            type="text"
            placeholder="Search jobs by ID or language..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
        
        <Button
          variant="outline"
          onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          onTouchEnd={(e) => {
            e.preventDefault();
            setIsFiltersOpen(!isFiltersOpen);
          }}
          className={`flex items-center justify-center space-x-2 touch-manipulation ${isFiltersOpen ? 'bg-accent' : ''}`}
        >
          <Filter className="w-4 h-4" />
          <span>Filters</span>
          {hasActiveFilters && (
            <div className="w-2 h-2 bg-primary rounded-full" />
          )}
        </Button>
      </div>

      {/* Filters Panel */}
      <motion.div
        initial={false}
        animate={{
          height: isFiltersOpen ? 'auto' : 0,
          opacity: isFiltersOpen ? 1 : 0,
        }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      >
        <div className="bg-muted/50 rounded-lg p-4 space-y-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Status
            </label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <Button
                    key={option.value}
                    variant={statusFilter === option.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => onStatusChange(option.value as JobStatus)}
                    onTouchEnd={(e) => {
                      e.preventDefault();
                      onStatusChange(option.value as JobStatus);
                    }}
                    className="flex items-center space-x-2 touch-manipulation"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{option.label}</span>
                    {option.count > 0 && (
                      <span className="bg-muted text-muted-foreground px-2 py-1 rounded-full text-xs">
                        {option.count}
                      </span>
                    )}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Sort Options */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Sort By
            </label>
            <Select value={sortBy} onValueChange={(value) => onSortChange(value as SortOption)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select sort option" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  onClearFilters();
                }}
                className="text-muted-foreground hover:text-foreground touch-manipulation"
              >
                <X className="w-4 h-4 mr-1" />
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}