import { createContext, useContext, useState, useEffect } from 'react';
import { networkSpeedService } from '../services/networkSpeed';

/**
 * Network Context
 * Provides network speed information and controls throughout the app
 * 
 * Features:
 * - Automatic speed detection on mount
 * - Periodic rechecking
 * - Manual bandwidth override
 * - Data saver mode
 * - Global state management
 */

const NetworkContext = createContext();

export function NetworkProvider({ children }) {
  const [networkInfo, setNetworkInfo] = useState({
    speedMbps: 0,
    category: 'medium',
    loading: true,
    manualOverride: null,
    error: false,
    lastChecked: null
  });

  const [dataSaverMode, setDataSaverMode] = useState(() => {
    return localStorage.getItem('data-saver-mode') === 'true';
  });

  useEffect(() => {
    initializeNetwork();
    
    // Recheck periodically (every minute, checks if 5 minutes have passed)
    const interval = setInterval(() => {
      if (networkSpeedService.shouldRecheck() && !networkInfo.manualOverride) {
        checkNetworkSpeed();
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  /**
   * Initialize network detection
   */
  const initializeNetwork = async () => {
    // Check if user has manual preference
    const manual = networkSpeedService.getManualPreference();
    if (manual) {
      setNetworkInfo({
        speedMbps: networkSpeedService.getStoredSpeedMbps(),
        category: manual,
        loading: false,
        manualOverride: manual,
        error: false,
        lastChecked: null
      });
    } else {
      // Load stored speed first for instant UI
      networkSpeedService.loadStoredSpeed();
      setNetworkInfo({
        speedMbps: networkSpeedService.getStoredSpeedMbps(),
        category: networkSpeedService.getSpeedCategory(),
        loading: true,
        manualOverride: null,
        error: false,
        lastChecked: null
      });
      
      // Then do actual speed test
      await checkNetworkSpeed();
    }
  };

  /**
   * Perform network speed check
   */
  const checkNetworkSpeed = async () => {
    setNetworkInfo(prev => ({ ...prev, loading: true }));
    
    const result = await networkSpeedService.measureSpeed();
    
    setNetworkInfo({
      speedMbps: result.speedMbps,
      category: result.category,
      loading: false,
      manualOverride: null,
      error: result.error,
      lastChecked: result.timestamp
    });

    return result;
  };

  /**
   * Set manual bandwidth preference
   * @param {string} category - 'low', 'medium', or 'high'
   */
  const setManualBandwidth = (category) => {
    networkSpeedService.setManualPreference(category);
    setNetworkInfo(prev => ({
      ...prev,
      category,
      manualOverride: category
    }));
  };

  /**
   * Clear manual bandwidth preference and recheck
   */
  const clearManualBandwidth = async () => {
    networkSpeedService.clearManualPreference();
    await checkNetworkSpeed();
  };

  /**
   * Toggle data saver mode
   */
  const toggleDataSaver = () => {
    const newMode = !dataSaverMode;
    setDataSaverMode(newMode);
    localStorage.setItem('data-saver-mode', newMode.toString());
    
    if (newMode) {
      // Force low bandwidth when data saver is on
      setManualBandwidth('low');
    } else {
      // Recheck speed when data saver is off
      clearManualBandwidth();
    }
  };

  /**
   * Get bandwidth label for display
   * @param {string} category - 'low', 'medium', or 'high'
   * @returns {string}
   */
  const getBandwidthLabel = (category) => {
    const labels = {
      high: 'High Speed (≥5 Mbps)',
      medium: 'Medium Speed (1-5 Mbps)',
      low: 'Low Speed (<1 Mbps)'
    };
    return labels[category] || 'Unknown';
  };

  /**
   * Get bandwidth icon
   * @param {string} category - 'low', 'medium', or 'high'
   * @returns {string}
   */
  const getBandwidthIcon = (category) => {
    const icons = {
      high: '🚀',
      medium: '📶',
      low: '🐌'
    };
    return icons[category] || '📡';
  };

  const value = {
    networkInfo,
    dataSaverMode,
    checkNetworkSpeed,
    setManualBandwidth,
    clearManualBandwidth,
    toggleDataSaver,
    getBandwidthLabel,
    getBandwidthIcon
  };

  return (
    <NetworkContext.Provider value={value}>
      {children}
    </NetworkContext.Provider>
  );
}

/**
 * Hook to use network context
 * @returns {Object} Network context value
 */
export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within NetworkProvider');
  }
  return context;
};

export default NetworkContext;
