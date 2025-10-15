'use client';

import { useState, useEffect, useCallback } from 'react';

export interface NetworkStatus {
  isOnline: boolean;
  isSlowConnection: boolean;
  connectionType?: string;
  effectiveType?: string;
}

interface NetworkInformationLike {
  type?: string;
  effectiveType?: string;
  addEventListener?: (type: string, listener: () => void) => void;
  removeEventListener?: (type: string, listener: () => void) => void;
}

type NavigatorWithConnection = Navigator & {
  connection?: NetworkInformationLike;
  mozConnection?: NetworkInformationLike;
  webkitConnection?: NetworkInformationLike;
};

const getNavigatorConnection = (): NetworkInformationLike | undefined => {
  if (typeof navigator === 'undefined') {
    return undefined;
  }

  const nav = navigator as NavigatorWithConnection;
  return nav.connection || nav.mozConnection || nav.webkitConnection;
};

export const useNetworkStatus = (): NetworkStatus => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isSlowConnection: false,
  });

  useEffect(() => {
    if (typeof navigator === 'undefined') return;

    const updateNetworkStatus = () => {
      const isOnline = navigator.onLine;
      const connection = getNavigatorConnection();
      
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
    const connection = getNavigatorConnection();
    if (connection?.addEventListener) {
      connection.addEventListener('change', updateNetworkStatus);
    }

    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
      if (connection?.removeEventListener) {
        connection.removeEventListener('change', updateNetworkStatus);
      }
    };
  }, []);

  return networkStatus;
};

// Hook for handling offline state with retry logic
export const useOfflineHandler = () => {
  const { isOnline } = useNetworkStatus();
  const [pendingActions, setPendingActions] = useState<Array<() => Promise<unknown>>>([]);

  const queueAction = (action: () => Promise<unknown>): Promise<unknown> => {
    if (isOnline) {
      return action();
    } else {
      setPendingActions(prev => [...prev, action]);
      return Promise.reject(new Error('Action queued for when connection is restored'));
    }
  };

  const retryPendingActions = useCallback(async (): Promise<void> => {
    if (pendingActions.length === 0) return;

    const actions = [...pendingActions];
    setPendingActions([]);

    const results = await Promise.allSettled(actions.map(action => action()));
    const failures = results.filter((result): result is PromiseRejectedResult => result.status === 'rejected');

    if (failures.length > 0) {
      // Re-queue failed actions
      const failedActions = actions.filter((_, index) => results[index].status === 'rejected');
      setPendingActions(prev => [...prev, ...failedActions]);
    }
  }, [pendingActions]);

  // Retry pending actions when connection is restored
  useEffect(() => {
    if (isOnline && pendingActions.length > 0) {
      retryPendingActions();
    }
  }, [isOnline, pendingActions.length, retryPendingActions]);

  return {
    isOnline,
    pendingActionsCount: pendingActions.length,
    queueAction,
    retryPendingActions,
  };
};
