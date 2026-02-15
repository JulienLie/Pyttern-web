import { useState } from 'react';
import './CompoundPatternSection.css';
import PatternTree from '../pattern-tree/PatternTree.tsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolderTree, faFileImport, faRotateRight } from '@fortawesome/free-solid-svg-icons';
import { CompoundPattern, PatternFile } from '../../../compoundModels.ts';
import * as _ from 'lodash';
import PatternFileDetailsModal from './components/pattern-file-details-card/PatternFileDetailsModal.tsx';

interface CompoundPatternSectionProps {
    pattern?: CompoundPattern | null;
    isMatchDone: boolean;
    onImportPattern: () => void;
    onResetPattern: () => void;
}

function CompoundPatternSection({ pattern, isMatchDone, onImportPattern, onResetPattern }: CompoundPatternSectionProps) {
    const [selectedPatternFile, setSelectedPatternFile] = useState<PatternFile | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    const handlePatternFileClick = (file: PatternFile) => {
        setSelectedPatternFile(file);
        setIsDetailsModalOpen(true);
    };

    const handleCloseDetailsModal = () => {
        setIsDetailsModalOpen(false);
        setSelectedPatternFile(null);
    };

    console.log('Kampaaunnd pettern deyizzz', pattern);

    return (
        <div className="compound-pattern-section d-flex flex-column h-100">
            <div className="section-header-wrapper">
                <div className="section-header d-flex justify-content-between align-items-center mb-3">
                    <h2 className="d-flex align-items-center gap-3 m-0">
                        <FontAwesomeIcon icon={faFolderTree} className="header-icon" />
                        Compound Pattern
                    </h2>
                </div>
                <div className="section-actions d-flex gap-3">
                    <button className="btn-add d-flex align-items-center gap-2" onClick={onImportPattern} disabled={isMatchDone}>
                        <FontAwesomeIcon icon={faFileImport} /> Import Pattern
                    </button>
                    <button className="btn-reset d-flex align-items-center gap-2" onClick={onResetPattern} disabled={isMatchDone || !pattern}>
                        <FontAwesomeIcon icon={faRotateRight} /> Reset
                    </button>
                </div>
            </div>
            <div className="section-content-wrapper">
                {!_.isNil(pattern) ? (
                    <PatternTree
                        pattern={pattern}
                        onPatternFileClick={handlePatternFileClick}
                        showDefaultIcon={isMatchDone}
                    />
                ) : (
                    <div className="pattern-empty-state d-flex flex-column align-items-center justify-content-center text-center p-5 bg-white rounded-3 border shadow-sm">
                        <FontAwesomeIcon icon={faFolderTree} className="empty-icon" />
                        <p className="m-0 mb-3">No compound pattern imported yet</p>
                        <button className="btn-import-empty d-flex align-items-center gap-2" onClick={onImportPattern} disabled={isMatchDone}>
                            <FontAwesomeIcon icon={faFileImport} /> Import Your Compound Pattern
                        </button>
                    </div>
                )}
            </div>

            <PatternFileDetailsModal
                isOpen={isDetailsModalOpen}
                onRequestClose={handleCloseDetailsModal}
                patternFile={selectedPatternFile}
            />
        </div>
    );
}

export default CompoundPatternSection;

