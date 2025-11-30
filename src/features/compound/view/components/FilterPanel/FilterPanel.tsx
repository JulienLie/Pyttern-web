import './FilterPanel.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCheck, faFilter } from '@fortawesome/free-solid-svg-icons';
import { CompoundPattern, PatternFile, MatchType, PatternFilterConfig } from '../../../compoundModels.ts';
import { getPatternFilesOfCompound } from '../../../compoundService.ts';
import { useAppDispatch } from '../../../../../common/hooks.ts';
import { selectPattern, updatePatternFilter } from '../../../compoundSlice.ts';

interface FilterPanelProps {
    isOpen: boolean;
    onClose: () => void;
    compoundPattern: CompoundPattern | null;
    selectedPatterns: string[];
    patternFilters: Record<string, PatternFilterConfig>;
}

function FilterPanel({ isOpen, onClose, compoundPattern, selectedPatterns, patternFilters }: FilterPanelProps) {
    const dispatch = useAppDispatch();

    const patternFiles: PatternFile[] = compoundPattern 
        ? getPatternFilesOfCompound(compoundPattern)
        : [];

    const handleTogglePattern = (patternFilename: string) => {
        dispatch(selectPattern(patternFilename));
    };

    const handleMatchTypeChange = (patternFilename: string, matchType: MatchType) => {
        dispatch(updatePatternFilter({ patternFilename, matchType }));
    };

    const handleIncludeUncheckedChange = (patternFilename: string, includeUnchecked: boolean) => {
        dispatch(updatePatternFilter({ patternFilename, includeUnchecked }));
    };

    const getFilterConfig = (patternFilename: string): PatternFilterConfig => {
        // If filter config exists, return it
        if (patternFilters[patternFilename]) {
            return patternFilters[patternFilename];
        }
        
        // Otherwise, get default from pattern file's isUnderNot property
        const patternFile = patternFiles.find(pf => pf.filename === patternFilename);
        const defaultMatchType = patternFile?.isUnderNot ? MatchType.NOT_MATCH : MatchType.MATCH;
        
        return {
            matchType: defaultMatchType,
            includeUnchecked: false,
        };
    };

    return (
        <div className={`filter-panel ${isOpen ? 'filter-panel-open' : ''}`}>
            <div className="filter-panel-header">
                <h3 className="filter-panel-title">
                    <FontAwesomeIcon icon={faFilter} className="filter-panel-title-icon" />
                    Filter Code Files
                </h3>
                <button 
                    className="filter-panel-close-btn" 
                    onClick={onClose}
                    aria-label="Close panel"
                >
                    <FontAwesomeIcon icon={faTimes} />
                </button>
            </div>
            
            <div className="filter-panel-body">
                {patternFiles.length === 0 ? (
                    <div className="filter-panel-empty">
                        <p>No patterns available. Please import a compound pattern first.</p>
                    </div>
                ) : (
                    <div className="filter-pattern-list">
                        {patternFiles.map((patternFile) => {
                            const isSelected = selectedPatterns.includes(patternFile.filename);
                            const filterConfig = getFilterConfig(patternFile.filename);
                            
                            return (
                                <div
                                    key={patternFile.filename}
                                    className={`filter-pattern-item ${isSelected ? 'selected' : ''} ${isSelected ? (filterConfig.matchType === MatchType.MATCH ? 'match-type-match' : 'match-type-not-match') : ''}`}
                                >
                                    <div 
                                        className="filter-pattern-selector"
                                        onClick={() => handleTogglePattern(patternFile.filename)}
                                    >
                                        <div className="filter-pattern-checkbox">
                                            {isSelected && <FontAwesomeIcon icon={faCheck} />}
                                        </div>
                                        <span className="filter-pattern-name">{patternFile.filename}</span>
                                    </div>
                                    
                                    {isSelected && (
                                        <div className="filter-pattern-controls">
                                            <div className="filter-control-group">
                                                <label className="filter-control-label">Match Type:</label>
                                                <select
                                                    className="filter-match-type-select"
                                                    value={filterConfig.matchType}
                                                    onChange={(e) => handleMatchTypeChange(patternFile.filename, e.target.value as MatchType)}
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <option value={MatchType.MATCH}>Match</option>
                                                    <option value={MatchType.NOT_MATCH}>Not Match</option>
                                                </select>
                                            </div>
                                            
                                            <div className="filter-control-group">
                                                <label className="filter-checkbox-label">
                                                    <input
                                                        type="checkbox"
                                                        className="filter-include-unchecked"
                                                        checked={filterConfig.includeUnchecked}
                                                        onChange={(e) => handleIncludeUncheckedChange(patternFile.filename, e.target.checked)}
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                    <span className="filter-checkbox-text">Include unchecked files</span>
                                                </label>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default FilterPanel;

