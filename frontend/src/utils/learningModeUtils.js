/**
 * Learning Mode Utilities
 * Constants and helper functions for learning mode management
 * 
 * Phase 5a: Bandwidth-sensitive learning modes
 * 
 * TODO: Phase 6 - Add video quality presets
 * TODO: Phase 7 - Add audio format preferences
 * TODO: Phase 8 - Add AI summary complexity levels
 */

/**
 * Learning Mode Constants
 */
export const LEARNING_MODES = {
    AUTO: 'AUTO',
    VIDEO: 'VIDEO',
    AUDIO: 'AUDIO',
    TEXT: 'TEXT'
};

/**
 * Bandwidth Level Constants
 */
export const BANDWIDTH_LEVELS = {
    HIGH: 'HIGH',
    MEDIUM: 'MEDIUM',
    LOW: 'LOW',
    UNKNOWN: 'UNKNOWN'
};

/**
 * Bandwidth Thresholds (in Mbps)
 */
export const BANDWIDTH_THRESHOLDS = {
    HIGH: 1.5,      // >= 1.5 Mbps = VIDEO mode
    MEDIUM: 0.25    // 0.25 - 1.5 Mbps = AUDIO mode
    // < 0.25 Mbps = TEXT mode
};

/**
 * Map bandwidth level to suggested learning mode
 * @param {string} bandwidthLevel - BANDWIDTH_LEVELS constant
 * @returns {string} - LEARNING_MODES constant
 */
export function mapBandwidthToMode(bandwidthLevel) {
    switch (bandwidthLevel) {
        case BANDWIDTH_LEVELS.HIGH:
            return LEARNING_MODES.VIDEO;
        case BANDWIDTH_LEVELS.MEDIUM:
            return LEARNING_MODES.AUDIO;
        case BANDWIDTH_LEVELS.LOW:
            return LEARNING_MODES.TEXT;
        case BANDWIDTH_LEVELS.UNKNOWN:
        default:
            return LEARNING_MODES.TEXT; // Default to most accessible mode
    }
}

/**
 * Get human-readable label for learning mode
 * @param {string} mode - LEARNING_MODES constant
 * @returns {string} - Display label
 */
export function getModeLabel(mode) {
    switch (mode) {
        case LEARNING_MODES.AUTO:
            return 'Auto';
        case LEARNING_MODES.VIDEO:
            return 'Video';
        case LEARNING_MODES.AUDIO:
            return 'Audio';
        case LEARNING_MODES.TEXT:
            return 'Text';
        default:
            return 'Unknown';
    }
}

/**
 * Get icon/emoji for learning mode
 * @param {string} mode - LEARNING_MODES constant
 * @returns {string} - Icon/emoji
 */
export function getModeIcon(mode) {
    switch (mode) {
        case LEARNING_MODES.AUTO:
            return '🔄';
        case LEARNING_MODES.VIDEO:
            return '🎥';
        case LEARNING_MODES.AUDIO:
            return '🎧';
        case LEARNING_MODES.TEXT:
            return '📝';
        default:
            return '❓';
    }
}

/**
 * Get description for learning mode
 * @param {string} mode - LEARNING_MODES constant
 * @returns {string} - Mode description
 */
export function getModeDescription(mode) {
    switch (mode) {
        case LEARNING_MODES.AUTO:
            return 'Automatically adjust based on your connection';
        case LEARNING_MODES.VIDEO:
            return 'Best for fast connections (video + text)';
        case LEARNING_MODES.AUDIO:
            return 'Best for moderate connections (audio + text)';
        case LEARNING_MODES.TEXT:
            return 'Best for slow connections (text only)';
        default:
            return '';
    }
}

/**
 * Get bandwidth level description
 * @param {string} level - BANDWIDTH_LEVELS constant
 * @returns {string} - Level description
 */
export function getBandwidthDescription(level) {
    switch (level) {
        case BANDWIDTH_LEVELS.HIGH:
            return 'Fast connection';
        case BANDWIDTH_LEVELS.MEDIUM:
            return 'Moderate connection';
        case BANDWIDTH_LEVELS.LOW:
            return 'Slow connection';
        case BANDWIDTH_LEVELS.UNKNOWN:
            return 'Connection speed unknown';
        default:
            return '';
    }
}

/**
 * Resolve effective mode (convert AUTO to actual mode)
 * @param {string} currentMode - Current mode setting
 * @param {string} suggestedMode - System-suggested mode based on bandwidth
 * @returns {string} - Effective mode to use
 */
export function resolveEffectiveMode(currentMode, suggestedMode) {
    if (currentMode === LEARNING_MODES.AUTO) {
        return suggestedMode || LEARNING_MODES.TEXT;
    }
    return currentMode;
}
