'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Environment-aware error logging
    if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_DEV_MODE === 'true') {
      console.error('ErrorBoundary caught:', error, errorInfo);
    } else {
      console.error('Application error:', { name: error.name, message: error.message });
    }

    this.setState({ error, errorInfo });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // TODO: In production, send to error reporting service (Sentry, LogRocket, etc.)
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    // Reset error boundary if resetKeys change
    if (hasError && resetKeys && prevProps.resetKeys) {
      const hasResetKeyChanged = resetKeys.some((key, index) => 
        key !== prevProps.resetKeys?.[index]
      );
      
      if (hasResetKeyChanged) {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined });
      }
    }

    // Reset error boundary if resetOnPropsChange is true and props changed
    if (hasError && resetOnPropsChange && prevProps.children !== this.props.children) {
      this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  getErrorType = (error: Error): string => {
    if (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk')) {
      return 'Chunk Load Error';
    }
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return 'Network Error';
    }
    if (error.name === 'ReferenceError') {
      return 'Reference Error';
    }
    if (error.name === 'TypeError') {
      return 'Type Error';
    }
    if (error.name === 'SyntaxError') {
      return 'Syntax Error';
    }
    return error.name || 'Unknown Error';
  };

  getErrorSuggestion = (error: Error): string => {
    if (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk')) {
      return 'This usually happens when the app has been updated. Try refreshing the page.';
    }
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return 'Check your internet connection and try again.';
    }
    if (error.name === 'ReferenceError') {
      return 'This is likely a code issue. Try refreshing the page or contact support.';
    }
    if (error.name === 'TypeError') {
      return 'There was an issue with data processing. Try refreshing the page.';
    }
    if (error.name === 'SyntaxError') {
      return 'There was an issue with the code. Try refreshing the page.';
    }
    return 'Try refreshing the page or contact support if the issue persists.';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} retry={this.handleRetry} />;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="text-center max-w-lg">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We encountered an unexpected error. This has been logged and we&apos;ll look into it.
            </p>
            
            {/* Error type detection and specific messaging */}
            {this.state.error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                  Error Type: {this.getErrorType(this.state.error)}
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300">
                  {this.getErrorSuggestion(this.state.error)}
                </p>
              </div>
            )}

            <div className="space-y-3">
              <Button onClick={this.handleRetry} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
                className="w-full"
              >
                Reload Page
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.history.back()}
                className="w-full"
              >
                Go Back
              </Button>
            </div>

            {/* Additional help options */}
            <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
              <p className="mb-2">Still having issues?</p>
              <div className="flex justify-center space-x-4">
                <button 
                  onClick={() => window.open('/help', '_blank')}
                  className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Help Center
                </button>
                <button 
                  onClick={() => window.open('/contact', '_blank')}
                  className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Contact Support
                </button>
              </div>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 p-4 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto max-h-60">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;