'use client';

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  CheckCircle, 
  AlertCircle, 
  X, 
  RefreshCw, 
  FileAudio, 
  Video, 
  FileText,
  Loader2,
  Play,
  Pause,
  Square,
  MoreVertical,
  Filter,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DownloadCard } from './DownloadCard';
import { Job, DownloadItem, DownloadFileType, DownloadStatus, BulkDownloadOptions } from '@/types';
import { useToast } from '@/components/ToastNotifications';

interface DownloadManagerProps {
  job: Job;
  onClose?: () => void;
  onDownloadComplete?: (item: DownloadItem) => void;
  onDownloadError?: (item: DownloadItem, error: string) => void;
}

export function DownloadManager({ 
  job, 
  onClose, 
  onDownloadComplete, 
  onDownloadError 
}: DownloadManagerProps) {
  const { addToast } = useToast();
  const [downloadItems, setDownloadItems] = useState<DownloadItem[]>([]);
  const [selectedFileTypes, setSelectedFileTypes] = useState<DownloadFileType[]>(['full']);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [isBulkDownloading, setIsBulkDownloading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<DownloadStatus | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  
  const downloadRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());
  const activeDownloads = useRef<Map<string, XMLHttpRequest>>(new Map());

  // Initialize download items when job changes
  React.useEffect(() => {
    if (!job.downloadUrls || job.status !== 'complete') {
      setDownloadItems([]);
      return;
    }

    const items: DownloadItem[] = [];
    const languages = selectedLanguages.length > 0 ? selectedLanguages : job.targetLanguages;

    languages.forEach(languageCode => {
      const languageInfo = job.targetLanguages.includes(languageCode) 
        ? { code: languageCode, name: languageCode.toUpperCase() }
        : { code: languageCode, name: languageCode.toUpperCase() };

      selectedFileTypes.forEach(fileType => {
        const downloadUrl = job.downloadUrls?.[languageCode]?.[fileType];
        if (downloadUrl) {
          items.push({
            id: `${job.id}-${languageCode}-${fileType}`,
            jobId: job.id,
            languageCode,
            languageName: languageInfo.name,
            fileType,
            fileName: `${job.id.slice(-8)}_${languageCode}_${fileType}.${getFileExtension(fileType)}`,
            downloadUrl,
            status: 'pending',
            progress: 0,
            expiresAt: getExpirationDate()
          });
        }
      });
    });

    setDownloadItems(items);
  }, [job, selectedFileTypes, selectedLanguages]);

  const getFileExtension = (fileType: DownloadFileType): string => {
    switch (fileType) {
      case 'voice':
      case 'full':
        return 'mp3';
      case 'captions':
        return 'srt';
      default:
        return 'mp3';
    }
  };

  const getExpirationDate = (): string => {
    const expiration = new Date();
    expiration.setHours(expiration.getHours() + 48); // 48 hours
    return expiration.toISOString();
  };

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

  const handleFileTypeToggle = (fileType: DownloadFileType) => {
    setSelectedFileTypes(prev => 
      prev.includes(fileType) 
        ? prev.filter(type => type !== fileType)
        : [...prev, fileType]
    );
  };

  const handleLanguageToggle = (languageCode: string) => {
    setSelectedLanguages(prev => 
      prev.includes(languageCode) 
        ? prev.filter(lang => lang !== languageCode)
        : [...prev, languageCode]
    );
  };

  const startDownload = useCallback(async (item: DownloadItem) => {
    if (item.status === 'downloading') return;

    const updatedItem = { ...item, status: 'downloading' as DownloadStatus, progress: 0 };
    setDownloadItems(prev => 
      prev.map(i => i.id === item.id ? updatedItem : i)
    );

    try {
      // Create download link
      const link = document.createElement('a');
      link.href = item.downloadUrl;
      link.download = item.fileName;
      link.style.display = 'none';
      document.body.appendChild(link);

      // Track download progress
      const xhr = new XMLHttpRequest();
      activeDownloads.current.set(item.id, xhr);

      xhr.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setDownloadItems(prev => 
            prev.map(i => i.id === item.id ? { ...i, progress } : i)
          );
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const completedItem = { 
            ...updatedItem, 
            status: 'completed' as DownloadStatus, 
            progress: 100,
            completedAt: new Date().toISOString()
          };
          setDownloadItems(prev => 
            prev.map(i => i.id === item.id ? completedItem : i)
          );
          onDownloadComplete?.(completedItem);
          addToast({
            type: 'success',
            title: 'Download Complete',
            message: `${item.fileName} has been downloaded successfully.`,
            duration: 3000
          });
        } else {
          throw new Error(`Download failed with status ${xhr.status}`);
        }
        activeDownloads.current.delete(item.id);
        document.body.removeChild(link);
      });

      xhr.addEventListener('error', () => {
        const failedItem = { 
          ...updatedItem, 
          status: 'failed' as DownloadStatus,
          error: 'Network error occurred'
        };
        setDownloadItems(prev => 
          prev.map(i => i.id === item.id ? failedItem : i)
        );
        onDownloadError?.(failedItem, 'Network error occurred');
        addToast({
          type: 'error',
          title: 'Download Failed',
          message: `Failed to download ${item.fileName}. Please try again.`,
          duration: 5000
        });
        activeDownloads.current.delete(item.id);
        document.body.removeChild(link);
      });

      xhr.open('GET', item.downloadUrl);
      xhr.send();

      // Trigger download
      link.click();

    } catch (error) {
      const failedItem = { 
        ...updatedItem, 
        status: 'failed' as DownloadStatus,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      setDownloadItems(prev => 
        prev.map(i => i.id === item.id ? failedItem : i)
      );
      onDownloadError?.(failedItem, error instanceof Error ? error.message : 'Unknown error');
      addToast({
        type: 'error',
        title: 'Download Failed',
        message: `Failed to download ${item.fileName}. Please try again.`,
        duration: 5000
      });
    }
  }, [onDownloadComplete, onDownloadError, addToast]);

  const cancelDownload = useCallback((item: DownloadItem) => {
    const xhr = activeDownloads.current.get(item.id);
    if (xhr) {
      xhr.abort();
      activeDownloads.current.delete(item.id);
    }

    const cancelledItem = { 
      ...item, 
      status: 'cancelled' as DownloadStatus 
    };
    setDownloadItems(prev => 
      prev.map(i => i.id === item.id ? cancelledItem : i)
    );
  }, []);

  const retryDownload = useCallback((item: DownloadItem) => {
    const retryItem = { 
      ...item, 
      status: 'pending' as DownloadStatus, 
      progress: 0,
      error: undefined
    };
    setDownloadItems(prev => 
      prev.map(i => i.id === item.id ? retryItem : i)
    );
    startDownload(retryItem);
  }, [startDownload]);

  const handleBulkDownload = useCallback(async () => {
    if (downloadItems.length === 0) return;

    setIsBulkDownloading(true);
    const pendingItems = downloadItems.filter(item => item.status === 'pending');

    try {
      // Download items sequentially to avoid overwhelming the browser
      for (const item of pendingItems) {
        await startDownload(item);
        // Small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      addToast({
        type: 'success',
        title: 'Bulk Download Complete',
        message: `Successfully initiated download for ${pendingItems.length} files.`,
        duration: 3000
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Bulk Download Error',
        message: 'Some downloads may have failed. Please check individual items.',
        duration: 5000
      });
    } finally {
      setIsBulkDownloading(false);
    }
  }, [downloadItems, startDownload, addToast]);

  const filteredItems = downloadItems.filter(item => {
    const matchesSearch = item.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.languageName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const completedCount = downloadItems.filter(item => item.status === 'completed').length;
  const totalCount = downloadItems.length;
  const downloadingCount = downloadItems.filter(item => item.status === 'downloading').length;

  if (job.status !== 'complete' || !job.downloadUrls) {
    return (
      <motion.div
        className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-8 text-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No Downloads Available</h3>
        <p className="text-muted-foreground mb-4">
          This job is not yet complete or doesn&apos;t have downloadable files.
        </p>
        {onClose && (
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Download Files</h2>
          <p className="text-muted-foreground">
            Job #{job.id.slice(-8)} • {completedCount}/{totalCount} completed
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {onClose && (
            <Button onClick={onClose} variant="ghost" size="sm">
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* File Type Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-3">File Types</h3>
        <div className="flex flex-wrap gap-2">
          {(['voice', 'full', 'captions'] as DownloadFileType[]).map(fileType => (
            <Button
              key={fileType}
              variant={selectedFileTypes.includes(fileType) ? "default" : "outline"}
              size="sm"
              onClick={() => handleFileTypeToggle(fileType)}
              className="flex items-center space-x-2"
            >
              {getFileTypeIcon(fileType)}
              <span>{getFileTypeLabel(fileType)}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Language Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-3">Languages</h3>
        <div className="flex flex-wrap gap-2">
          {job.targetLanguages.map(languageCode => (
            <Button
              key={languageCode}
              variant={selectedLanguages.includes(languageCode) || selectedLanguages.length === 0 ? "default" : "outline"}
              size="sm"
              onClick={() => handleLanguageToggle(languageCode)}
            >
              {languageCode.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#ff0000] focus:border-transparent"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2"
          >
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          {downloadingCount > 0 && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{downloadingCount} downloading</span>
            </div>
          )}
          <Button
            onClick={handleBulkDownload}
            disabled={isBulkDownloading || downloadItems.filter(item => item.status === 'pending').length === 0}
            className="flex items-center space-x-2"
          >
            {isBulkDownloading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>Download All</span>
          </Button>
        </div>
      </div>

      {/* Status Filter */}
      {showFilters && (
        <motion.div
          className="mb-4 p-4 bg-muted/50 rounded-lg"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <div className="flex flex-wrap gap-2">
            {(['all', 'pending', 'downloading', 'completed', 'failed'] as const).map(status => (
              <Button
                key={status}
                variant={filterStatus === status ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus(status)}
              >
                {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Download Items */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <DownloadCard
                item={item}
                onDownload={() => startDownload(item)}
                onCancel={() => cancelDownload(item)}
                onRetry={() => retryDownload(item)}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredItems.length === 0 && (
          <motion.div
            className="text-center py-8 text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <FileAudio className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No files match your current filters.</p>
          </motion.div>
        )}
      </div>

      {/* Progress Summary */}
      {totalCount > 0 && (
        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Download Progress</span>
            <span>{completedCount}/{totalCount} completed</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 mt-2">
            <motion.div
              className="bg-[#ff0000] h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(completedCount / totalCount) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}