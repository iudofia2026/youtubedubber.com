'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  FileAudio, 
  Video, 
  FileText,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Trash2,
  MoreVertical,
  SortAsc,
  SortDesc,
  Grid,
  List
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navigation } from '@/components/Navigation';
import { Breadcrumbs, breadcrumbConfigs } from '@/components/Breadcrumbs';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useToast } from '@/components/ToastNotifications';
import { DownloadHistoryItem, DownloadFileType, LANGUAGES } from '@/types';

type SortField = 'downloadedAt' | 'fileName' | 'languageName' | 'fileType' | 'fileSize';
type SortDirection = 'asc' | 'desc';
type ViewMode = 'grid' | 'list';

export default function DownloadsPage() {
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

  // Mock data - in real app, this would come from API
  useEffect(() => {
    const mockHistory: DownloadHistoryItem[] = [
      {
        id: '1',
        jobId: 'job-12345678',
        jobTitle: 'Tutorial Video',
        languageCode: 'es',
        languageName: 'Spanish',
        fileType: 'full',
        fileName: 'job-12345678_es_full.mp3',
        fileSize: 15728640, // 15MB
        downloadedAt: '2024-01-15T10:30:00Z',
        expiresAt: '2024-01-17T10:30:00Z',
        isExpired: false,
        downloadUrl: '/api/downloads/job-12345678_es_full.mp3'
      },
      {
        id: '2',
        jobId: 'job-12345678',
        jobTitle: 'Tutorial Video',
        languageCode: 'es',
        languageName: 'Spanish',
        fileType: 'voice',
        fileName: 'job-12345678_es_voice.mp3',
        fileSize: 8388608, // 8MB
        downloadedAt: '2024-01-15T10:25:00Z',
        expiresAt: '2024-01-17T10:25:00Z',
        isExpired: false,
        downloadUrl: '/api/downloads/job-12345678_es_voice.mp3'
      },
      {
        id: '3',
        jobId: 'job-87654321',
        jobTitle: 'Product Demo',
        languageCode: 'fr',
        languageName: 'French',
        fileType: 'full',
        fileName: 'job-87654321_fr_full.mp3',
        fileSize: 20971520, // 20MB
        downloadedAt: '2024-01-14T15:45:00Z',
        expiresAt: '2024-01-16T15:45:00Z',
        isExpired: true,
        downloadUrl: undefined
      },
      {
        id: '4',
        jobId: 'job-87654321',
        jobTitle: 'Product Demo',
        languageCode: 'fr',
        languageName: 'French',
        fileType: 'captions',
        fileName: 'job-87654321_fr_captions.srt',
        fileSize: 102400, // 100KB
        downloadedAt: '2024-01-14T15:40:00Z',
        expiresAt: '2024-01-16T15:40:00Z',
        isExpired: true,
        downloadUrl: undefined
      },
      {
        id: '5',
        jobId: 'job-11223344',
        jobTitle: 'Marketing Video',
        languageCode: 'de',
        languageName: 'German',
        fileType: 'full',
        fileName: 'job-11223344_de_full.mp3',
        fileSize: 12582912, // 12MB
        downloadedAt: '2024-01-13T09:20:00Z',
        expiresAt: '2024-01-15T09:20:00Z',
        isExpired: false,
        downloadUrl: '/api/downloads/job-11223344_de_full.mp3'
      }
    ];

    // Simulate loading
    setTimeout(() => {
      setDownloadHistory(mockHistory);
      setIsLoading(false);
    }, 1000);
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

  const stats = useMemo(() => {
    const total = downloadHistory.length;
    const active = downloadHistory.filter(item => !item.isExpired).length;
    const expired = downloadHistory.filter(item => item.isExpired).length;
    const totalSize = downloadHistory.reduce((sum, item) => sum + (item.fileSize || 0), 0);
    
    return { total, active, expired, totalSize };
  }, [downloadHistory]);

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <Navigation currentPath="/downloads" />
          <main className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-[#ff0000] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading download history...</p>
              </div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navigation currentPath="/downloads" />
        
        <main className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
          {/* Breadcrumbs */}
          <Breadcrumbs items={breadcrumbConfigs.downloads} />

          {/* Header */}
          <motion.div
            className="flex items-center justify-between mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div>
              <h1 className="text-3xl font-bold text-foreground">Download History</h1>
              <p className="text-muted-foreground mt-1">
                Manage your downloaded files and access re-download links
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="flex items-center space-x-2"
              >
                {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
                <span>{viewMode === 'grid' ? 'List' : 'Grid'}</span>
              </Button>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Downloads</p>
                  <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                </div>
                <Download className="w-8 h-8 text-[#ff0000] opacity-50" />
              </div>
            </div>
            
            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Files</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600 opacity-50" />
              </div>
            </div>
            
            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Expired Files</p>
                  <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600 opacity-50" />
              </div>
            </div>
            
            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Size</p>
                  <p className="text-2xl font-bold text-foreground">{formatFileSize(stats.totalSize)}</p>
                </div>
                <FileAudio className="w-8 h-8 text-[#ff0000] opacity-50" />
              </div>
            </div>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-4 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search downloads..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#ff0000] focus:border-transparent"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex items-center space-x-2">
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
            {showFilters && (
              <motion.div
                className="mt-4 pt-4 border-t border-border space-y-4"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                {/* File Types */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">File Types</label>
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
                  <label className="text-sm font-medium text-foreground mb-2 block">Languages</label>
                  <div className="flex flex-wrap gap-2">
                    {LANGUAGES.map(language => (
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
          </motion.div>

          {/* Sort Options */}
          <motion.div
            className="flex items-center justify-between mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              {(['downloadedAt', 'fileName', 'languageName', 'fileType', 'fileSize'] as SortField[]).map(field => (
                <Button
                  key={field}
                  variant={sortField === field ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSort(field)}
                  className="flex items-center space-x-1"
                >
                  <span className="capitalize">{field.replace(/([A-Z])/g, ' $1').trim()}</span>
                  {sortField === field && (
                    sortDirection === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />
                  )}
                </Button>
              ))}
            </div>

            <div className="text-sm text-muted-foreground">
              {filteredAndSortedHistory.length} of {downloadHistory.length} items
            </div>
          </motion.div>

          {/* Download Items */}
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
                    <DownloadHistoryCard
                      item={item}
                      onDownload={() => handleDownload(item)}
                      onDelete={() => handleDelete(item.id)}
                    />
                  ) : (
                    <div key={item.id} className="bg-card/50 backdrop-blur-sm border rounded-xl p-4">
                      <p>List item: {item.fileName}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredAndSortedHistory.length === 0 && (
              <motion.div
                className="col-span-full text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Download className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Downloads Found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || selectedFileTypes.length > 0 || selectedLanguages.length > 0
                    ? 'No downloads match your current filters.'
                    : 'You haven\'t downloaded any files yet.'}
                </p>
              </motion.div>
            )}
          </motion.div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

// Download History Card Component
function DownloadHistoryCard({ 
  item, 
  onDownload, 
  onDelete 
}: { 
  item: DownloadHistoryItem; 
  onDownload: () => void; 
  onDelete: () => void; 
}) {
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
    const now = new Date();
    if (!expiresAt) {
      return { status: 'active', message: 'No expiration' };
    }
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

  const expirationStatus = getExpirationStatus(item.expiresAt);

  return (
    <motion.div
      className={`bg-card/50 backdrop-blur-sm border rounded-xl p-4 transition-all duration-300 ${
        item.isExpired ? 'opacity-60' : ''
      }`}
      whileHover={{ scale: 1.02 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            {getFileTypeIcon(item.fileType)}
            <div>
              <h3 className="font-semibold text-foreground text-sm truncate">
                {item.fileName}
              </h3>
              <p className="text-xs text-muted-foreground">
                {getFileTypeLabel(item.fileType)} • {item.languageName}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          {/* Expiration Status */}
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            expirationStatus.status === 'expired' 
              ? 'text-red-600 bg-red-50 dark:bg-red-900/20' 
              : expirationStatus.status === 'expiring'
              ? 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
              : 'text-green-600 bg-green-50 dark:bg-green-900/20'
          }`}>
            {expirationStatus.message}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="p-1 text-muted-foreground hover:text-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Job Info */}
      <div className="mb-3">
        <p className="text-sm text-foreground font-medium">{item.jobTitle}</p>
        <p className="text-xs text-muted-foreground">Job #{item.jobId.slice(-8)}</p>
      </div>

      {/* File Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Size:</span>
          <span className="font-medium">{formatFileSize(item.fileSize)}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Downloaded:</span>
          <span className="font-medium">{formatDate(item.downloadedAt)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button
          onClick={onDownload}
          disabled={item.isExpired}
          size="sm"
          className="flex items-center space-x-1"
        >
          <Download className="w-3 h-3" />
          <span className="text-xs">
            {item.isExpired ? 'Expired' : 'Re-download'}
          </span>
        </Button>
      </div>
    </motion.div>
  );
}

// Download History List Item Component
function DownloadHistoryListItem({ 
  item, 
  onDownload, 
  onDelete 
}: { 
  item: DownloadHistoryItem; 
  onDownload: () => void; 
  onDelete: () => void; 
}) {
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

  const expirationStatus = getExpirationStatus(item.expiresAt);

  return (
    <motion.div
      className={`bg-card/50 backdrop-blur-sm border rounded-xl p-4 transition-all duration-300 ${
        item.isExpired ? 'opacity-60' : ''
      }`}
      whileHover={{ scale: 1.01 }}
    >
      <div className="flex items-center justify-between">
        {/* Left Section - File Info */}
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          <div className="flex items-center space-x-3">
            {getFileTypeIcon(item.fileType)}
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground text-sm truncate">
                {item.fileName}
              </h3>
              <p className="text-xs text-muted-foreground">
                {getFileTypeLabel(item.fileType)} • {item.languageName} • {item.jobTitle}
              </p>
            </div>
          </div>
        </div>

        {/* Middle Section - Details */}
        <div className="flex items-center space-x-6 text-sm text-muted-foreground">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Size</p>
            <p className="font-medium">{formatFileSize(item.fileSize)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Downloaded</p>
            <p className="font-medium">{formatDate(item.downloadedAt)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Status</p>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              expirationStatus.status === 'expired' 
                ? 'text-red-600 bg-red-50 dark:bg-red-900/20' 
                : expirationStatus.status === 'expiring'
                ? 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
                : 'text-green-600 bg-green-50 dark:bg-green-900/20'
            }`}>
              {expirationStatus.message}
            </div>
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center space-x-2">
          <Button
            onClick={onDownload}
            disabled={item.isExpired}
            size="sm"
            className="flex items-center space-x-1"
          >
            <Download className="w-3 h-3" />
            <span className="text-xs">
              {item.isExpired ? 'Expired' : 'Re-download'}
            </span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="p-1 text-muted-foreground hover:text-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}