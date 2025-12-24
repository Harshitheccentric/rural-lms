import { useEffect } from 'react';
import { useLearningMode } from '../context/LearningModeContext';
import { getModeLabel, getModeIcon } from '../utils/learningModeUtils';
import './BandwidthNotification.css';

/**
 * Bandwidth Notification Component
 * Non-blocking notification for suggesting mode changes based on bandwidth
 * 
 * Phase 5a: Initial implementation
 * 
 * TODO: Phase 6 - Add animation for slide-in/slide-out
 * TODO: Phase 6 - Add sound notification option
 * TODO: Phase 7 - Add notification history
 */
function BandwidthNotification() {
    const {
        showModeSuggestion,
        suggestedNewMode,
        acceptSuggestion,
        dismissSuggestion
    } = useLearningMode();

    // Auto-dismiss after 10 seconds
    useEffect(() => {
        if (showModeSuggestion) {
            const timer = setTimeout(() => {
                dismissSuggestion();
            }, 10000);

            return () => clearTimeout(timer);
        }
    }, [showModeSuggestion, dismissSuggestion]);

    if (!showModeSuggestion || !suggestedNewMode) {
        return null;
    }

    return (
        <div className="bandwidth-notification">
            <div className="notification-content">
                <span className="notification-icon">{getModeIcon(suggestedNewMode)}</span>
                <div className="notification-text">
                    <strong>Better connection detected!</strong>
                    <p>Switch to {getModeLabel(suggestedNewMode)} mode for a better experience?</p>
                </div>
            </div>
            <div className="notification-actions">
                <button
                    className="notification-button accept"
                    onClick={acceptSuggestion}
                >
                    Switch to {getModeLabel(suggestedNewMode)}
                </button>
                <button
                    className="notification-button dismiss"
                    onClick={dismissSuggestion}
                >
                    Dismiss
                </button>
            </div>
        </div>
    );
}

export default BandwidthNotification;
