import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { detectBandwidth } from '../utils/bandwidthDetector';
import {
    LEARNING_MODES,
    BANDWIDTH_LEVELS,
    mapBandwidthToMode,
    resolveEffectiveMode
} from '../utils/learningModeUtils';

/**
 * Learning Mode Context
 * Manages learning mode state, bandwidth detection, and user preferences
 * 
 * Phase 5a: Initial implementation
 * 
 * TODO: Phase 6 - Add mode-specific content preloading
 * TODO: Phase 6 - Add bandwidth history tracking
 * TODO: Phase 7 - Add offline mode detection
 * TODO: Phase 8 - Add AI personalization based on mode
 */

const LearningModeContext = createContext(null);

// localStorage keys
const STORAGE_KEYS = {
    MODE: 'rural-lms-learning-mode',
    IS_MANUAL: 'rural-lms-mode-is-manual',
    LAST_CHECK: 'rural-lms-last-bandwidth-check'
};

// Periodic check interval (3-5 minutes)
const CHECK_INTERVAL_MS = 4 * 60 * 1000; // 4 minutes

export const useLearningMode = () => {
    const context = useContext(LearningModeContext);
    if (!context) {
        throw new Error('useLearningMode must be used within LearningModeProvider');
    }
    return context;
};

export const LearningModeProvider = ({ children }) => {
    // Core state
    const [currentMode, setCurrentMode] = useState(LEARNING_MODES.AUTO);
    const [isManualMode, setIsManualMode] = useState(false);
    const [suggestedMode, setSuggestedMode] = useState(LEARNING_MODES.TEXT);
    const [bandwidthLevel, setBandwidthLevel] = useState(BANDWIDTH_LEVELS.UNKNOWN);
    const [lastBandwidthCheck, setLastBandwidthCheck] = useState(null);
    const [bandwidthData, setBandwidthData] = useState(null);

    // UI state
    const [showModeSuggestion, setShowModeSuggestion] = useState(false);
    const [suggestedNewMode, setSuggestedNewMode] = useState(null);
    const [isCheckingBandwidth, setIsCheckingBandwidth] = useState(false);

    /**
     * Load saved preferences from localStorage
     */
    useEffect(() => {
        const savedMode = localStorage.getItem(STORAGE_KEYS.MODE);
        const savedIsManual = localStorage.getItem(STORAGE_KEYS.IS_MANUAL);
        const savedLastCheck = localStorage.getItem(STORAGE_KEYS.LAST_CHECK);

        if (savedMode && Object.values(LEARNING_MODES).includes(savedMode)) {
            setCurrentMode(savedMode);
        }

        if (savedIsManual !== null) {
            setIsManualMode(savedIsManual === 'true');
        }

        if (savedLastCheck) {
            setLastBandwidthCheck(savedLastCheck);
        }

        // Run initial bandwidth check
        checkBandwidth();
    }, []);

    /**
     * Set up periodic bandwidth checking
     */
    useEffect(() => {
        const interval = setInterval(() => {
            console.log('[LearningMode] Periodic bandwidth check...');
            checkBandwidth(true); // true = periodic check
        }, CHECK_INTERVAL_MS);

        return () => clearInterval(interval);
    }, [currentMode, isManualMode, suggestedMode]);

    /**
     * Check bandwidth and update suggested mode
     * @param {boolean} isPeriodic - Whether this is a periodic check
     */
    const checkBandwidth = useCallback(async (isPeriodic = false) => {
        if (isCheckingBandwidth) {
            console.log('[LearningMode] Bandwidth check already in progress');
            return;
        }

        setIsCheckingBandwidth(true);

        try {
            const result = await detectBandwidth();

            console.log('[LearningMode] Bandwidth detected:', result);

            setBandwidthLevel(result.level);
            setBandwidthData(result);
            setLastBandwidthCheck(result.timestamp);
            localStorage.setItem(STORAGE_KEYS.LAST_CHECK, result.timestamp);

            // Determine suggested mode based on bandwidth
            const newSuggestedMode = mapBandwidthToMode(result.level);
            setSuggestedMode(newSuggestedMode);

            // If this is a periodic check and mode has changed
            if (isPeriodic && newSuggestedMode !== suggestedMode) {
                // Only show suggestion if:
                // 1. User is in AUTO mode, OR
                // 2. User manually selected a mode but bandwidth suggests a better one
                const effectiveMode = resolveEffectiveMode(currentMode, suggestedMode);

                if (newSuggestedMode !== effectiveMode) {
                    console.log('[LearningMode] Suggesting mode change:', {
                        current: effectiveMode,
                        suggested: newSuggestedMode
                    });
                    setSuggestedNewMode(newSuggestedMode);
                    setShowModeSuggestion(true);
                }
            }

            // If user is in AUTO mode, update current mode automatically
            if (!isManualMode && currentMode === LEARNING_MODES.AUTO) {
                console.log('[LearningMode] Auto mode: updating to', newSuggestedMode);
                // Don't show notification for auto mode changes
            }

        } catch (error) {
            console.error('[LearningMode] Bandwidth check failed:', error);
        } finally {
            setIsCheckingBandwidth(false);
        }
    }, [isCheckingBandwidth, currentMode, isManualMode, suggestedMode]);

    /**
     * Set learning mode (manual or auto)
     * @param {string} mode - LEARNING_MODES constant
     * @param {boolean} isManual - Whether this is a manual selection
     */
    const setMode = useCallback((mode, isManual = true) => {
        console.log('[LearningMode] Setting mode:', { mode, isManual });

        setCurrentMode(mode);
        setIsManualMode(isManual);

        // Save to localStorage
        localStorage.setItem(STORAGE_KEYS.MODE, mode);
        localStorage.setItem(STORAGE_KEYS.IS_MANUAL, isManual.toString());

        // Dismiss any pending suggestions
        setShowModeSuggestion(false);
        setSuggestedNewMode(null);
    }, []);

    /**
     * Accept suggested mode change
     */
    const acceptSuggestion = useCallback(() => {
        if (suggestedNewMode) {
            setMode(suggestedNewMode, false); // false = auto-accepted
        }
        setShowModeSuggestion(false);
        setSuggestedNewMode(null);
    }, [suggestedNewMode, setMode]);

    /**
     * Dismiss mode suggestion
     */
    const dismissSuggestion = useCallback(() => {
        setShowModeSuggestion(false);
        setSuggestedNewMode(null);
    }, []);

    /**
     * Get effective mode (resolve AUTO to actual mode)
     */
    const effectiveMode = resolveEffectiveMode(currentMode, suggestedMode);

    const value = {
        // Current state
        currentMode,
        effectiveMode,
        isManualMode,
        suggestedMode,
        bandwidthLevel,
        bandwidthData,
        lastBandwidthCheck,
        isCheckingBandwidth,

        // Suggestion state
        showModeSuggestion,
        suggestedNewMode,

        // Actions
        setMode,
        checkBandwidth,
        acceptSuggestion,
        dismissSuggestion
    };

    return (
        <LearningModeContext.Provider value={value}>
            {children}
        </LearningModeContext.Provider>
    );
};
