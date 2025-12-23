/**
 * Bandwidth Detector
 * Hybrid bandwidth detection using Network Information API + download speed test
 * 
 * Phase 5a: Initial implementation
 * 
 * TODO: Phase 6 - Add WebRTC-based latency detection
 * TODO: Phase 6 - Add connection stability monitoring
 * TODO: Phase 6 - Add historical bandwidth tracking
 */

import { BANDWIDTH_LEVELS, BANDWIDTH_THRESHOLDS } from './learningModeUtils';

/**
 * Detect current bandwidth using hybrid approach
 * @returns {Promise<Object>} - Detection result with bandwidth level and speed
 */
export async function detectBandwidth() {
    const result = {
        level: BANDWIDTH_LEVELS.UNKNOWN,
        speedMbps: null,
        method: null,
        timestamp: new Date().toISOString()
    };

    try {
        // Try Network Information API first (if available)
        if ('connection' in navigator && navigator.connection) {
            const connection = navigator.connection;

            // Get effective type (4g, 3g, 2g, slow-2g)
            const effectiveType = connection.effectiveType;

            // Get downlink speed in Mbps (if available)
            const downlink = connection.downlink;

            // Get RTT (Round Trip Time) in ms (if available)
            const rtt = connection.rtt;

            console.log('[Bandwidth] Network API:', { effectiveType, downlink, rtt });

            // Use downlink if available
            if (downlink !== undefined && downlink !== null) {
                result.speedMbps = downlink;
                result.method = 'network-api';
                result.level = classifyBandwidth(downlink);
                result.effectiveType = effectiveType;
                result.rtt = rtt;
                return result;
            }

            // Fallback to effective type classification
            if (effectiveType) {
                result.method = 'network-api-effective-type';
                result.effectiveType = effectiveType;
                result.level = classifyEffectiveType(effectiveType);
                return result;
            }
        }

        // Fallback to download speed test
        console.log('[Bandwidth] Network API not available, running speed test...');
        const speedTestResult = await runSpeedTest();
        result.speedMbps = speedTestResult.speedMbps;
        result.method = 'speed-test';
        result.level = classifyBandwidth(speedTestResult.speedMbps);
        result.downloadTime = speedTestResult.downloadTime;

        return result;
    } catch (error) {
        console.error('[Bandwidth] Detection failed:', error);
        // Default to TEXT mode on error (safest option)
        result.level = BANDWIDTH_LEVELS.LOW;
        result.method = 'error-fallback';
        result.error = error.message;
        return result;
    }
}

/**
 * Classify bandwidth speed into levels
 * @param {number} speedMbps - Speed in Mbps
 * @returns {string} - BANDWIDTH_LEVELS constant
 */
export function classifyBandwidth(speedMbps) {
    if (speedMbps === null || speedMbps === undefined) {
        return BANDWIDTH_LEVELS.UNKNOWN;
    }

    if (speedMbps >= BANDWIDTH_THRESHOLDS.HIGH) {
        return BANDWIDTH_LEVELS.HIGH;
    } else if (speedMbps >= BANDWIDTH_THRESHOLDS.MEDIUM) {
        return BANDWIDTH_LEVELS.MEDIUM;
    } else {
        return BANDWIDTH_LEVELS.LOW;
    }
}

/**
 * Classify based on Network Information API effective type
 * @param {string} effectiveType - '4g', '3g', '2g', 'slow-2g'
 * @returns {string} - BANDWIDTH_LEVELS constant
 */
function classifyEffectiveType(effectiveType) {
    switch (effectiveType) {
        case '4g':
            return BANDWIDTH_LEVELS.HIGH;
        case '3g':
            return BANDWIDTH_LEVELS.MEDIUM;
        case '2g':
        case 'slow-2g':
            return BANDWIDTH_LEVELS.LOW;
        default:
            return BANDWIDTH_LEVELS.UNKNOWN;
    }
}

/**
 * Run download speed test
 * Downloads a small file and measures speed
 * @returns {Promise<Object>} - Speed test result
 */
export async function runSpeedTest() {
    const testFileUrl = '/test-file.dat';
    const testFileSizeBytes = 200 * 1024; // 200 KB

    const startTime = performance.now();

    try {
        // Add cache-busting parameter to ensure fresh download
        const cacheBuster = `?t=${Date.now()}`;
        const response = await fetch(testFileUrl + cacheBuster, {
            cache: 'no-store'
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        // Read the response body
        await response.blob();

        const endTime = performance.now();
        const downloadTime = (endTime - startTime) / 1000; // Convert to seconds

        // Calculate speed in Mbps
        const speedBps = testFileSizeBytes / downloadTime;
        const speedMbps = (speedBps * 8) / (1024 * 1024); // Convert bytes/s to Mbps

        console.log('[Bandwidth] Speed test completed:', {
            downloadTime: `${downloadTime.toFixed(2)}s`,
            speedMbps: `${speedMbps.toFixed(2)} Mbps`
        });

        return {
            speedMbps: parseFloat(speedMbps.toFixed(2)),
            downloadTime: parseFloat(downloadTime.toFixed(2)),
            fileSizeBytes: testFileSizeBytes
        };
    } catch (error) {
        console.error('[Bandwidth] Speed test failed:', error);
        // Return very low speed on error
        return {
            speedMbps: 0.1,
            downloadTime: null,
            error: error.message
        };
    }
}

/**
 * Check if Network Information API is available
 * @returns {boolean}
 */
export function isNetworkAPIAvailable() {
    return 'connection' in navigator && navigator.connection !== undefined;
}

/**
 * Get current connection info (if available)
 * @returns {Object|null} - Connection info or null
 */
export function getConnectionInfo() {
    if (!isNetworkAPIAvailable()) {
        return null;
    }

    const connection = navigator.connection;
    return {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData
    };
}
