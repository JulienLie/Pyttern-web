import './CompoundPatternSection.css';
import PatternTree from '../PatternTree/PatternTree';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolderTree, faFileImport, faRotateRight } from '@fortawesome/free-solid-svg-icons';
import { CompoundPattern } from '../../../../store/slices/compoundSlice';

interface CompoundPatternSectionProps {
    pattern: CompoundPattern | null;
    onImportPattern: () => void;
    onResetPattern: () => void;
}

function CompoundPatternSection({ pattern, onImportPattern, onResetPattern }: CompoundPatternSectionProps) {
    return (
        <>
            <div className="section-header">
                <h2>
                    <FontAwesomeIcon icon={faFolderTree} className="header-icon" />
                    Compound Pattern
                </h2>
            </div>
            <div className="section-actions">
                <button className="btn-add" onClick={onImportPattern}>
                    <FontAwesomeIcon icon={faFileImport} /> Import Pattern
                </button>
                <button className="btn-reset" onClick={onResetPattern}>
                    <FontAwesomeIcon icon={faRotateRight} /> Reset
                </button>
            </div>
            
            {pattern !== null ? (
                <PatternTree pattern={pattern} />
            ) : (
                <div className="pattern-empty-state">
                    <FontAwesomeIcon icon={faFolderTree} className="empty-icon" />
                    <p>No compound pattern imported yet</p>
                    <button className="btn-import-empty" onClick={onImportPattern}>
                        <FontAwesomeIcon icon={faFileImport} /> Import Your First Pattern
                    </button>
                </div>
            )}
        </>
    );
}

export default CompoundPatternSection;

