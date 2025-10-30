'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  Search,
  Filter,
  FileAudio,
  Video,
  FileText,
  AlertTriangle,
  CheckCircle,
  Trash2,
  SortAsc,
  SortDesc,
  Grid,
  List,
  HardDrive,
  Clock,
  TrendingUp,
  Calendar,
  BarChart3,
  RefreshCw,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { Breadcrumbs, breadcrumbConfigs } from '@/components/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ToastNotifications';
import { DownloadHistoryItem, DownloadFileType, LANGUAGES } from '@/types';
import { fetchDownloads } from '@/lib/api';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

type SortField = 'downloadedAt' | 'fileName' | 'languageName' | 'fileType' | 'fileSize';
type SortDirection = 'asc' | 'desc';
type ViewMode = 'grid' | 'list';

function DownloadsPageContent() {
  const { addToast } = useToast();
  const [downloadHistory, setDownloadHistory] = useState<DownloadHistoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFileTypes, setSelectedFileTypes] = useState<DownloadFileType[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [sortField, setSortField] = useState<SortField>('downloadedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const items = await fetchDownloads();
        setDownloadHistory(items);
      } catch {
        setDownloadHistory([]);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const getFileTypeIcon = (fileType: DownloadFileType) => {
    switch (fileType) {
      case 'voice':
        return <FileAudio className="w-4 h-4" />;
      case 'full':
        return <Video className="w-4 h-4" />;
      case 'captions':
        return <FileText className="w-4 h-4" />;
      default:
        return <FileAudio className="w-4 h-4" />;
    }
  };

  const getFileTypeLabel = (fileType: DownloadFileType): string => {
    switch (fileType) {
      case 'voice':
        return 'Voice Only';
      case 'full':
        return 'Full Mix';
      case 'captions':
        return 'Captions';
      default:
        return 'Unknown';
    }
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return 'Unknown size';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getExpirationStatus = (expiresAt?: string): { status: 'active' | 'expiring' | 'expired'; message: string } => {
    if (!expiresAt) {
      return { status: 'active', message: 'No expiration' };
    }
    const now = new Date();
    const expiration = new Date(expiresAt);
    const hoursUntilExpiration = (expiration.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilExpiration < 0) {
      return { status: 'expired', message: 'Expired' };
    } else if (hoursUntilExpiration < 24) {
      return { status: 'expiring', message: `Expires in ${Math.round(hoursUntilExpiration)}h` };
    } else {
      return { status: 'active', message: 'Active' };
    }
  };

  const filteredAndSortedHistory = useMemo(() => {
    const filtered = downloadHistory.filter(item => {
      const matchesSearch = item.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.languageName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFileType = selectedFileTypes.length === 0 || selectedFileTypes.includes(item.fileType);
      const matchesLanguage = selectedLanguages.length === 0 || selectedLanguages.includes(item.languageCode);

      return matchesSearch && matchesFileType && matchesLanguage;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: string | number, bValue: string | number;

      switch (sortField) {
        case 'downloadedAt':
          aValue = new Date(a.downloadedAt).getTime();
          bValue = new Date(b.downloadedAt).getTime();
          break;
        case 'fileName':
          aValue = a.fileName.toLowerCase();
          bValue = b.fileName.toLowerCase();
          break;
        case 'languageName':
          aValue = a.languageName.toLowerCase();
          bValue = b.languageName.toLowerCase();
          break;
        case 'fileType':
          aValue = a.fileType;
          bValue = b.fileType;
          break;
        case 'fileSize':
          aValue = a.fileSize || 0;
          bValue = b.fileSize || 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [downloadHistory, searchTerm, selectedFileTypes, selectedLanguages, sortField, sortDirection]);

  const handleDownload = (item: DownloadHistoryItem) => {
    if (item.isExpired || !item.downloadUrl) {
      addToast({
        type: 'error',
        title: 'Download Unavailable',
        message: 'This file has expired and is no longer available for download.',
        duration: 5000
      });
      return;
    }

    // Create download link
    const link = document.createElement('a');
    link.href = item.downloadUrl;
    link.download = item.fileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast({
      type: 'success',
      title: 'Download Started',
      message: `${item.fileName} is being downloaded.`,
      duration: 3000
    });
  };

  const handleDelete = (itemId: string) => {
    setDownloadHistory(prev => prev.filter(item => item.id !== itemId));
    addToast({
      type: 'success',
      title: 'Item Removed',
      message: 'Download history item has been removed.',
      duration: 3000
    });
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const items = await fetchDownloads();
      setDownloadHistory(items);
      addToast({ type: 'success', title: 'Refreshed', message: 'Download history has been refreshed.', duration: 3000 });
    } catch {
      addToast({ type: 'error', title: 'Refresh failed', message: 'Could not refresh downloads.', duration: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  const stats = useMemo(() => {
    const total = downloadHistory.length;
    const active = downloadHistory.filter(item => !item.isExpired).length;
    const expired = downloadHistory.filter(item => item.isExpired).length;
    const expiring = downloadHistory.filter(item => {
      const status = getExpirationStatus(item.expiresAt);
      return status.status === 'expiring';
    }).length;
    const totalSize = downloadHistory.reduce((sum, item) => sum + (item.fileSize || 0), 0);

    // Group by language
    const languageBreakdown = downloadHistory.reduce((acc, item) => {
      acc[item.languageName] = (acc[item.languageName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Group by file type
    const fileTypeBreakdown = downloadHistory.reduce((acc, item) => {
      acc[item.fileType] = (acc[item.fileType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { total, active, expired, expiring, totalSize, languageBreakdown, fileTypeBreakdown };
  }, [downloadHistory]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navigation currentPath="/downloads" />

        <main className="px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumbs */}
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Breadcrumbs items={breadcrumbConfigs.downloads} />
          </motion.div>

          {/* Header */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center space-x-4">
                <motion.div
                  className="w-12 h-12 bg-gradient-to-br from-[#ff0000] to-[#cc0000] rounded-xl flex items-center justify-center shadow-lg"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
                >
                  <Download className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-[#ff0000] mb-2 tracking-tight">
                    Download Center
                  </h1>
                  <p className="text-base text-muted-foreground">
                    Manage and track all your downloaded files
                  </p>
                </div>
              </div>

              <motion.div
                className="flex items-center space-x-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="flex items-center space-x-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </Button>

                <Link
                  href="/jobs"
                  className="inline-flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors duration-200 group px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
                  <span>Back to Jobs</span>
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between mb-2">
                <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400 opacity-50" />
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-300 mb-1">Total Files</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.total}</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                <BarChart3 className="w-4 h-4 text-green-600 dark:text-green-400 opacity-50" />
              </div>
              <p className="text-xs text-green-700 dark:text-green-300 mb-1">Active</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.active}</p>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 opacity-50" />
              </div>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-1">Expiring Soon</p>
              <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{stats.expiring}</p>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
              <div className="flex items-center justify-between mb-2">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <Calendar className="w-4 h-4 text-red-600 dark:text-red-400 opacity-50" />
              </div>
              <p className="text-xs text-red-700 dark:text-red-300 mb-1">Expired</p>
              <p className="text-2xl font-bold text-red-900 dark:text-red-100">{stats.expired}</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center justify-between mb-2">
                <HardDrive className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400 opacity-50" />
              </div>
              <p className="text-xs text-purple-700 dark:text-purple-300 mb-1">Total Size</p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{formatFileSize(stats.totalSize)}</p>
            </div>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex flex-col lg:flex-row gap-4 mb-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by filename, job title, or language..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ff0000] focus:border-transparent"
                  />
                </div>
              </div>

              {/* View Mode and Filters */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  className="flex items-center space-x-2"
                >
                  {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
                  <span className="hidden sm:inline">{viewMode === 'grid' ? 'List' : 'Grid'}</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2"
                >
                  <Filter className="w-4 h-4" />
                  <span>Filters</span>
                </Button>
              </div>
            </div>

            {/* Filter Options */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  className="pt-4 border-t border-gray-200 dark:border-gray-600 space-y-4"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  {/* File Types */}
                  <div>
                    <label className="text-sm font-medium text-gray-900 dark:text-white mb-2 block">File Types</label>
                    <div className="flex flex-wrap gap-2">
                      {(['voice', 'full', 'captions'] as DownloadFileType[]).map(fileType => (
                        <Button
                          key={fileType}
                          variant={selectedFileTypes.includes(fileType) ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedFileTypes(prev =>
                            prev.includes(fileType)
                              ? prev.filter(type => type !== fileType)
                              : [...prev, fileType]
                          )}
                          className="flex items-center space-x-2"
                        >
                          {getFileTypeIcon(fileType)}
                          <span>{getFileTypeLabel(fileType)}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Languages */}
                  <div>
                    <label className="text-sm font-medium text-gray-900 dark:text-white mb-2 block">Languages</label>
                    <div className="flex flex-wrap gap-2">
                      {LANGUAGES.slice(0, 10).map(language => (
                        <Button
                          key={language.code}
                          variant={selectedLanguages.includes(language.code) ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedLanguages(prev =>
                            prev.includes(language.code)
                              ? prev.filter(lang => lang !== language.code)
                              : [...prev, language.code]
                          )}
                        >
                          {language.flag} {language.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Sort Options */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <div className="flex items-center space-x-2 flex-wrap">
                <span className="text-sm text-gray-600 dark:text-gray-400">Sort:</span>
                {(['downloadedAt', 'fileName', 'languageName', 'fileType', 'fileSize'] as SortField[]).map(field => (
                  <Button
                    key={field}
                    variant={sortField === field ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSort(field)}
                    className="flex items-center space-x-1"
                  >
                    <span className="capitalize text-xs">{field.replace(/([A-Z])/g, ' $1').trim()}</span>
                    {sortField === field && (
                      sortDirection === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />
                    )}
                  </Button>
                ))}
              </div>

              <div className="text-sm text-gray-600 dark:text-gray-400">
                {filteredAndSortedHistory.length} of {downloadHistory.length} items
              </div>
            </div>
          </motion.div>

          {/* Download Items */}
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-[#ff0000] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading downloads...</p>
              </div>
            </div>
          ) : (
            <motion.div
              className={viewMode === 'grid'
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                : "space-y-3"
              }
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <AnimatePresence>
                {filteredAndSortedHistory.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    {viewMode === 'grid' ? (
                      <DownloadCard
                        item={item}
                        onDownload={() => handleDownload(item)}
                        onDelete={() => handleDelete(item.id)}
                        getFileTypeIcon={getFileTypeIcon}
                        getFileTypeLabel={getFileTypeLabel}
                        formatFileSize={formatFileSize}
                        formatDate={formatDate}
                        getExpirationStatus={getExpirationStatus}
                      />
                    ) : (
                      <DownloadListItem
                        item={item}
                        onDownload={() => handleDownload(item)}
                        onDelete={() => handleDelete(item.id)}
                        getFileTypeIcon={getFileTypeIcon}
                        getFileTypeLabel={getFileTypeLabel}
                        formatFileSize={formatFileSize}
                        formatDate={formatDate}
                        getExpirationStatus={getExpirationStatus}
                      />
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {filteredAndSortedHistory.length === 0 && (
                <motion.div
                  className="col-span-full text-center py-20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Download className="w-20 h-20 text-gray-400 mx-auto mb-6 opacity-50" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">No Downloads Found</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {searchTerm || selectedFileTypes.length > 0 || selectedLanguages.length > 0
                      ? 'No downloads match your current filters. Try adjusting your search criteria.'
                      : 'You haven\'t downloaded any files yet. Start by creating a new dubbing job!'}
                  </p>
                  {!searchTerm && selectedFileTypes.length === 0 && selectedLanguages.length === 0 && (
                    <Link
                      href="/new"
                      className="inline-flex items-center space-x-2 px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-[#ff0000] to-[#cc0000] hover:from-[#cc0000] hover:to-[#aa0000] rounded-xl transition-all duration-200 group shadow-lg hover:shadow-xl"
                    >
                      <span>Create New Job</span>
                    </Link>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}

// Download Card Component
function DownloadCard({
  item,
  onDownload,
  onDelete,
  getFileTypeIcon,
  getFileTypeLabel,
  formatFileSize,
  formatDate,
  getExpirationStatus
}: {
  item: DownloadHistoryItem;
  onDownload: () => void;
  onDelete: () => void;
  getFileTypeIcon: (fileType: DownloadFileType) => React.ReactElement;
  getFileTypeLabel: (fileType: DownloadFileType) => string;
  formatFileSize: (bytes?: number) => string;
  formatDate: (dateString: string) => string;
  getExpirationStatus: (expiresAt?: string) => { status: 'active' | 'expiring' | 'expired'; message: string };
}) {
  const expirationStatus = getExpirationStatus(item.expiresAt);

  return (
    <motion.div
      className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 transition-all duration-300 hover:shadow-lg ${
        item.isExpired ? 'opacity-70' : ''
      }`}
      whileHover={{ y: -4 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className="flex-shrink-0">
            {getFileTypeIcon(item.fileType)}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
              {item.fileName}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {getFileTypeLabel(item.fileType)} ? {item.languageName}
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="p-1.5 text-gray-400 hover:text-red-600 flex-shrink-0"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Status Badge */}
      <div className={`inline-flex px-3 py-1.5 rounded-full text-xs font-medium mb-4 ${
        expirationStatus.status === 'expired'
          ? 'text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-300'
          : expirationStatus.status === 'expiring'
          ? 'text-yellow-700 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300'
          : 'text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-300'
      }`}>
        {expirationStatus.message}
      </div>

      {/* Job Info */}
      <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-900 dark:text-white font-medium mb-1">{item.jobTitle}</p>
        <p className="text-xs text-gray-600 dark:text-gray-400">Job #{item.jobId.slice(-8)}</p>
      </div>

      {/* File Details */}
      <div className="space-y-2.5 mb-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600 dark:text-gray-400">Size:</span>
          <span className="font-medium text-gray-900 dark:text-white">{formatFileSize(item.fileSize)}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600 dark:text-gray-400">Downloaded:</span>
          <span className="font-medium text-gray-900 dark:text-white">{formatDate(item.downloadedAt)}</span>
        </div>
      </div>

      {/* Actions */}
      <Button
        onClick={onDownload}
        disabled={item.isExpired}
        size="sm"
        className="w-full flex items-center justify-center space-x-2"
      >
        <Download className="w-4 h-4" />
        <span>
          {item.isExpired ? 'Expired' : 'Re-download'}
        </span>
      </Button>
    </motion.div>
  );
}

// Download List Item Component
function DownloadListItem({
  item,
  onDownload,
  onDelete,
  getFileTypeIcon,
  getFileTypeLabel,
  formatFileSize,
  formatDate,
  getExpirationStatus
}: {
  item: DownloadHistoryItem;
  onDownload: () => void;
  onDelete: () => void;
  getFileTypeIcon: (fileType: DownloadFileType) => React.ReactElement;
  getFileTypeLabel: (fileType: DownloadFileType) => string;
  formatFileSize: (bytes?: number) => string;
  formatDate: (dateString: string) => string;
  getExpirationStatus: (expiresAt?: string) => { status: 'active' | 'expiring' | 'expired'; message: string };
}) {
  const expirationStatus = getExpirationStatus(item.expiresAt);

  return (
    <motion.div
      className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 transition-all duration-300 hover:shadow-md ${
        item.isExpired ? 'opacity-70' : ''
      }`}
      whileHover={{ x: 4 }}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Left Section - File Info */}
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          <div className="flex-shrink-0">
            {getFileTypeIcon(item.fileType)}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
              {item.fileName}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
              {getFileTypeLabel(item.fileType)} ? {item.languageName} ? {item.jobTitle}
            </p>
          </div>
        </div>

        {/* Middle Section - Details */}
        <div className="hidden md:flex items-center space-x-6">
          <div className="text-center">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Size</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{formatFileSize(item.fileSize)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Downloaded</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(item.downloadedAt)}</p>
          </div>
          <div className="text-center min-w-[100px]">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Status</p>
            <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
              expirationStatus.status === 'expired'
                ? 'text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-300'
                : expirationStatus.status === 'expiring'
                ? 'text-yellow-700 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300'
                : 'text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-300'
            }`}>
              {expirationStatus.message}
            </div>
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          <Button
            onClick={onDownload}
            disabled={item.isExpired}
            size="sm"
            className="flex items-center space-x-1"
          >
            <Download className="w-3 h-3" />
            <span className="hidden sm:inline text-xs">
              {item.isExpired ? 'Expired' : 'Download'}
            </span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="p-2 text-gray-400 hover:text-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function DownloadsPageLoading() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation currentPath="/downloads" />
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-10 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-6 bg-muted rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-5 gap-4 mb-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DownloadsPage() {
  return (
    <Suspense fallback={<DownloadsPageLoading />}>
      <DownloadsPageContent />
    </Suspense>
  );
}
