'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  ChevronDown,
  SortAsc,
  SortDesc,
  Grid,
  List,
  HardDrive
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ToastNotifications';
import { DownloadHistoryItem, DownloadFileType, LANGUAGES } from '@/types';

type SortField = 'downloadedAt' | 'fileName' | 'languageName' | 'fileType' | 'fileSize';
type SortDirection = 'asc' | 'desc';
type ViewMode = 'grid' | 'list';

interface DownloadHistorySectionProps {
  className?: string;
}

export function DownloadHistorySection({ className = '' }: DownloadHistorySectionProps) {
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
  const [isExpanded, setIsExpanded] = useState(false);

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
      <div className={`bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#ff0000] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading download history...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={`bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-[#ff0000]/10 rounded-xl">
              <Download className="w-6 h-6 text-[#ff0000]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Download History</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage your downloaded files and access re-download links
              </p>
            </div>
          </div>
          
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
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center space-x-2"
            >
              <span className="hidden sm:inline">{isExpanded ? 'Collapse' : 'Expand'}</span>
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-4 h-4" />
              </motion.div>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Total</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
              <Download className="w-5 h-5 text-[#ff0000] opacity-50" />
            </div>
          </div>
          
          <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Active</p>
                <p className="text-lg font-bold text-green-600">{stats.active}</p>
              </div>
              <CheckCircle className="w-5 h-5 text-green-600 opacity-50" />
            </div>
          </div>
          
          <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Expired</p>
                <p className="text-lg font-bold text-red-600">{stats.expired}</p>
              </div>
              <AlertTriangle className="w-5 h-5 text-red-600 opacity-50" />
            </div>
          </div>
          
          <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Size</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{formatFileSize(stats.totalSize)}</p>
              </div>
              <HardDrive className="w-5 h-5 text-[#ff0000] opacity-50" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Expandable Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-6 space-y-6">
              {/* Search and Filters */}
              <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Search */}
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search downloads..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ff0000] focus:border-transparent"
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
                    className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600 space-y-4"
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
                        {LANGUAGES.slice(0, 8).map(language => (
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
              </div>

              {/* Sort Options */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
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

              {/* Download Items */}
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                : "space-y-3"
              }>
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
                        <DownloadHistoryListItem
                          item={item}
                          onDownload={() => handleDownload(item)}
                          onDelete={() => handleDelete(item.id)}
                        />
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
                    <Download className="w-16 h-16 text-gray-400 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Downloads Found</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {searchTerm || selectedFileTypes.length > 0 || selectedLanguages.length > 0
                        ? 'No downloads match your current filters.'
                        : 'You haven\'t downloaded any files yet.'}
                    </p>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
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
      className={`bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-gray-200 dark:border-gray-600 rounded-xl p-4 transition-all duration-300 ${
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
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                {item.fileName}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
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
            className="p-1 text-gray-400 hover:text-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Job Info */}
      <div className="mb-3">
        <p className="text-sm text-gray-900 dark:text-white font-medium">{item.jobTitle}</p>
        <p className="text-xs text-gray-600 dark:text-gray-400">Job #{item.jobId.slice(-8)}</p>
      </div>

      {/* File Details */}
      <div className="space-y-2 mb-4">
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
      className={`bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-gray-200 dark:border-gray-600 rounded-xl p-4 transition-all duration-300 ${
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
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                {item.fileName}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {getFileTypeLabel(item.fileType)} • {item.languageName} • {item.jobTitle}
              </p>
            </div>
          </div>
        </div>

        {/* Middle Section - Details */}
        <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
          <div className="text-center">
            <p className="text-xs text-gray-600 dark:text-gray-400">Size</p>
            <p className="font-medium text-gray-900 dark:text-white">{formatFileSize(item.fileSize)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-600 dark:text-gray-400">Downloaded</p>
            <p className="font-medium text-gray-900 dark:text-white">{formatDate(item.downloadedAt)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-600 dark:text-gray-400">Status</p>
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
            className="p-1 text-gray-400 hover:text-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
