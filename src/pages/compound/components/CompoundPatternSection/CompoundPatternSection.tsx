import './CompoundPatternSection.css';
import PatternTree from '../PatternTree/PatternTree';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolderTree, faFileImport, faRotateRight } from '@fortawesome/free-solid-svg-icons';
import { CompoundPattern } from '../../../../store/slices/compoundSlice';
import * as _ from 'lodash';

interface CompoundPatternSectionProps {
    pattern?: CompoundPattern | null;
    onImportPattern: () => void;
    onResetPattern: () => void;
}

function CompoundPatternSection({ pattern, onImportPattern, onResetPattern }: CompoundPatternSectionProps) {
    return (
        <>
            <div className="section-header d-flex justify-content-between align-items-center mb-1">
                <h2 className="d-flex align-items-center gap-3 m-0">
                    <FontAwesomeIcon icon={faFolderTree} className="header-icon" />
                    Compound Pattern
                </h2>
            </div>
            <div className="section-actions d-flex gap-3">
                <button className="btn-add d-flex align-items-center gap-2" onClick={onImportPattern}>
                    <FontAwesomeIcon icon={faFileImport} /> Import Pattern
                </button>
                <button className="btn-reset d-flex align-items-center gap-2" onClick={onResetPattern}>
                    <FontAwesomeIcon icon={faRotateRight} /> Reset
                </button>
            </div>
            
            {!_.isNil(pattern) ? (
                <PatternTree pattern={pattern} />
            ) : (
                <div className="pattern-empty-state d-flex flex-column align-items-center justify-content-center text-center p-5 bg-white rounded-3 border shadow-sm">
                    <FontAwesomeIcon icon={faFolderTree} className="empty-icon" />
                    <p className="m-0 mb-3">No compound pattern imported yet</p>
                    <button className="btn-import-empty d-flex align-items-center gap-2" onClick={onImportPattern}>
                        <FontAwesomeIcon icon={faFileImport} /> Import Your First Pattern
                    </button>
                </div>
            )}
        </>
    );
}

export default CompoundPatternSection;

