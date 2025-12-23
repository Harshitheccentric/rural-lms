import { useLearningMode } from '../context/LearningModeContext';
import {
    LEARNING_MODES,
    getModeLabel,
    getModeIcon,
    getModeDescription
} from '../utils/learningModeUtils';
import './LearningModeSelector.css';

/**
 * Learning Mode Selector Component
 * Allows users to manually select their preferred learning mode
 * 
 * Phase 5a: Initial implementation
 * 
 * TODO: Phase 6 - Add mode preview/demo
 * TODO: Phase 6 - Add estimated data usage per mode
 * TODO: Phase 7 - Add mode-specific feature highlights
 */
function LearningModeSelector() {
    const { currentMode, effectiveMode, setMode, bandwidthLevel } = useLearningMode();

    const handleModeChange = (mode) => {
        setMode(mode, true); // true = manual selection
    };

    const modes = [
        LEARNING_MODES.AUTO,
        LEARNING_MODES.VIDEO,
        LEARNING_MODES.AUDIO,
        LEARNING_MODES.TEXT
    ];

    return (
        <div className="learning-mode-selector">
            <div className="mode-selector-header">
                <h3>Learning Mode</h3>
                <p className="mode-selector-description">
                    Choose how you want to learn
                </p>
            </div>

            <div className="mode-options">
                {modes.map((mode) => {
                    const isActive = currentMode === mode;
                    const isEffective = effectiveMode === mode && currentMode === LEARNING_MODES.AUTO;

                    return (
                        <button
                            key={mode}
                            className={`mode-option ${isActive ? 'active' : ''} ${isEffective ? 'effective' : ''}`}
                            onClick={() => handleModeChange(mode)}
                            aria-pressed={isActive}
                        >
                            <span className="mode-icon">{getModeIcon(mode)}</span>
                            <span className="mode-label">{getModeLabel(mode)}</span>
                            <span className="mode-description">
                                {getModeDescription(mode)}
                            </span>
                            {isEffective && (
                                <span className="mode-badge">Current</span>
                            )}
                        </button>
                    );
                })}
            </div>

            {currentMode === LEARNING_MODES.AUTO && (
                <div className="auto-mode-info">
                    <p>
                        <strong>Auto mode active:</strong> Currently using{' '}
                        <strong>{getModeLabel(effectiveMode)}</strong> mode based on your connection.
                    </p>
                </div>
            )}
        </div>
    );
}

export default LearningModeSelector;
