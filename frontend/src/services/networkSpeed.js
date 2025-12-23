/**
 * Network Speed Detection Service
 * Measures user's internet bandwidth and categorizes it
 * 
 * Features:
 * - Downloads a test file to measure speed
 * - Categorizes: High (≥5 Mbps), Medium (1-5 Mbps), Low (<1 Mbps)
 * - Stores results in localStorage
 * - Periodic rechecking (every 5 minutes)
 * - Manual preference override
 */

class NetworkSpeedService {
  constructor() {
    this.speedCategory = 'medium'; // default
    this.lastCheck = null;
    this.checkInterval = 5 * 60 * 1000; // 5 minutes
    this.apiUrl = 'http://localhost:3000'; // Backend API URL
  }

  /**
   * Measure download speed by downloading a test file
   * @returns {Promise<Object>} Speed measurement result
   */
  async measureSpeed() {
    try {
      const startTime = performance.now();
      
      // Download test file from backend
      const response = await fetch(`${this.apiUrl}/api/speed-test`, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error('Speed test request failed');
      }

      const blob = await response.blob();
      const endTime = performance.now();
      
      // Calculate speed
      const durationSeconds = (endTime - startTime) / 1000;
      const fileSizeBytes = blob.size;
      const speedBps = (fileSizeBytes * 8) / durationSeconds; // bits per second
      const speedMbps = speedBps / (1024 * 1024); // convert to Mbps
      
      // Categorize the speed
      this.categorizeSpeed(speedMbps);
      this.lastCheck = Date.now();
      
      // Store results
      localStorage.setItem('network-speed-mbps', speedMbps.toFixed(2));
      localStorage.setItem('network-speed-category', this.speedCategory);
      localStorage.setItem('network-speed-timestamp', this.lastCheck.toString());
      
      return {
        speedMbps: parseFloat(speedMbps.toFixed(2)),
        category: this.speedCategory,
        timestamp: this.lastCheck,
        error: false
      };
    } catch (error) {
      console.error('Speed test failed:', error);
      // Fallback to stored value or default
      this.loadStoredSpeed();
      return {
        speedMbps: 0,
        category: this.speedCategory,
        timestamp: Date.now(),
        error: true,
        errorMessage: error.message
      };
    }
  }

  /**
   * Categorize speed into High/Medium/Low
   * @param {number} speedMbps - Speed in megabits per second
   */
  categorizeSpeed(speedMbps) {
    if (speedMbps >= 5) {
      this.speedCategory = 'high';
    } else if (speedMbps >= 1) {
      this.speedCategory = 'medium';
    } else {
      this.speedCategory = 'low';
    }
  }

  /**
   * Load stored speed from localStorage
   */
  loadStoredSpeed() {
    const stored = localStorage.getItem('network-speed-category');
    if (stored) {
      this.speedCategory = stored;
    }
    
    const timestamp = localStorage.getItem('network-speed-timestamp');
    if (timestamp) {
      this.lastCheck = parseInt(timestamp);
    }
  }

  /**
   * Get current speed category
   * @returns {string} 'high', 'medium', or 'low'
   */
  getSpeedCategory() {
    return this.speedCategory;
  }

  /**
   * Check if we should recheck the speed
   * @returns {boolean}
   */
  shouldRecheck() {
    if (!this.lastCheck) return true;
    return Date.now() - this.lastCheck > this.checkInterval;
  }

  /**
   * Set manual bandwidth preference
   * @param {string} category - 'high', 'medium', or 'low'
   */
  setManualPreference(category) {
    const validCategories = ['low', 'medium', 'high'];
    if (!validCategories.includes(category)) {
      console.error('Invalid category. Must be: low, medium, or high');
      return;
    }
    
    this.speedCategory = category;
    localStorage.setItem('network-speed-manual', category);
  }

  /**
   * Get manual preference if set
   * @returns {string|null}
   */
  getManualPreference() {
    return localStorage.getItem('network-speed-manual');
  }

  /**
   * Clear manual preference
   */
  clearManualPreference() {
    localStorage.removeItem('network-speed-manual');
  }

  /**
   * Get stored speed in Mbps
   * @returns {number}
   */
  getStoredSpeedMbps() {
    const stored = localStorage.getItem('network-speed-mbps');
    return stored ? parseFloat(stored) : 0;
  }
}

// Create singleton instance
export const networkSpeedService = new NetworkSpeedService();

// Export the class as well for testing
export default NetworkSpeedService;
