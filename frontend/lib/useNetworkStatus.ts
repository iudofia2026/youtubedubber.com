'use client';

import { useState, useEffect } from 'react';

export interface NetworkStatus {
  isOnline: boolean;
  isSlowConnection: boolean;
  connectionType?: string;
  effectiveType?: string;
}

export const useNetworkStatus = (): NetworkStatus => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isSlowConnection: false,
  });

  useEffect(() => {
    if (typeof navigator === 'undefined') return;

    const updateNetworkStatus = () => {
      const isOnline = navigator.onLine;
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      
      let isSlowConnection = false;
      let connectionType = 'unknown';
      let effectiveType = 'unknown';

      if (connection) {
        connectionType = connection.type || 'unknown';
        effectiveType = connection.effectiveType || 'unknown';
        
        // Consider 2g and slow-2g as slow connections
        isSlowConnection = effectiveType === '2g' || effectiveType === 'slow-2g';
      }

      setNetworkStatus({
        isOnline,
        isSlowConnection,
        connectionType,
        effectiveType,
      });
    };

    // Initial check
    updateNetworkStatus();

    // Listen for online/offline events
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);

    // Listen for connection changes
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection) {
      connection.addEventListener('change', updateNetworkStatus);
    }

    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
      if (connection) {
        connection.removeEventListener('change', updateNetworkStatus);
      }
    };
  }, []);

  return networkStatus;
};

// Hook for handling offline state with retry logic
export const useOfflineHandler = () => {
  const { isOnline } = useNetworkStatus();
  const [pendingActions, setPendingActions] = useState<Array<() => Promise<any>>>([]);

  const queueAction = (action: () => Promise<any>) => {
    if (isOnline) {
      return action();
    } else {
      setPendingActions(prev => [...prev, action]);
      return Promise.reject(new Error('Action queued for when connection is restored'));
    }
  };

  const retryPendingActions = async () => {
    if (pendingActions.length === 0) return;

    const actions = [...pendingActions];
    setPendingActions([]);

    const results = await Promise.allSettled(actions.map(action => action()));
    const failures = results.filter(result => result.status === 'rejected');

    if (failures.length > 0) {
      // Re-queue failed actions
      const failedActions = actions.filter((_, index) => results[index].status === 'rejected');
      setPendingActions(prev => [...prev, ...failedActions]);
    }
  };

  // Retry pending actions when connection is restored
  useEffect(() => {
    if (isOnline && pendingActions.length > 0) {
      retryPendingActions();
    }
  }, [isOnline]);

  return {
    isOnline,
    pendingActionsCount: pendingActions.length,
    queueAction,
    retryPendingActions,
  };
};