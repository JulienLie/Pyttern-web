import { useState } from 'react';
import './MatchFooter.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faFileCsv,
    faPlay,
    faRotateRight,
    faCheckCircle,
    faXmarkCircle,
    faExclamationTriangle,
    faCircleExclamation,
    faCircleInfo,
    faToolbox,
} from '@fortawesome/free-solid-svg-icons';
import { CodeFile, CompoundPattern, FileStatus } from '../../../compoundModels';
import InfoModal from '../../../../../common/components/info-modal/InfoModal.tsx';

export interface MatchFooterProps {
    compoundPattern?: CompoundPattern | null;
    codeFiles: CodeFile[];
    isMatchDone: boolean;
    isFilesReadyToMatch: boolean;
    isPatternReadyToMatch: boolean;
    onMatch: () => void;
    onResetMatch: () => void;
    onExportCsv?: () => void;
}

function MatchFooter({ compoundPattern, codeFiles, isMatchDone, isFilesReadyToMatch, isPatternReadyToMatch, onMatch, onResetMatch, onExportCsv }: MatchFooterProps) {
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

    const validatedCount = codeFiles.filter((f) => f.status === FileStatus.VALIDATED).length;
    const notValidatedCount = codeFiles.filter((f) => f.status === FileStatus.NOT_VALIDATED || f.status === FileStatus.PENDING).length;
    const matchedCount = codeFiles.filter((f) => f.status === FileStatus.MATCHED).length;
    const notMatchedCount = codeFiles.filter((f) => f.status === FileStatus.NOT_MATCHED).length;
    const notValidatedAfterMatchCount = codeFiles.filter((f) => f.status === FileStatus.NOT_VALIDATED || f.status === FileStatus.PENDING).length;
    const errorCount = codeFiles.filter((f) => f.status === FileStatus.ERROR).length;

    const hasAnyFiles = codeFiles.length > 0;
    const hasPattern = compoundPattern !== null;

    return (
        <div className="match-footer position-fixed bottom-0 start-0 end-0 d-flex justify-content-between align-items-center p-3 px-5 gap-3">
            <div className="match-footer__left d-flex align-items-center gap-3">
            <button className="info-icon-btn match-footer__info-btn" onClick={() => setIsInfoModalOpen(true)} title="Learn about the match toolbar">
                <FontAwesomeIcon icon={faCircleInfo} />
            </button>
            <div className="match-footer__info-divider"></div>
            <div className="match-footer__summary">
                {!hasAnyFiles && !hasPattern ? (
                    <div className="match-footer__summary-info">
                        <span>Please upload a compound pattern and code files to start matching.</span>
                    </div>
                ) : hasPattern && !hasAnyFiles && !isMatchDone ? (
                    <div className="match-footer__summary-info">
                        <span>Please add code files to validate before matching.</span>
                    </div>
                ) : isMatchDone ? (
                <>
                <span className="match-footer__summary-title fs-6">Match Results</span>
                <span className="match-footer__summary-sep">|</span>
                <div className="match-footer__stats match-footer__stats--post">
                    {matchedCount > 0 && (
                        <div className="match-footer__stat match-footer__stat--matched" title="Pattern matched">
                            <FontAwesomeIcon icon={faCheckCircle} className="match-footer__stat-icon" />
                            <span className="match-footer__stat-value">{matchedCount}</span>
                            <span className="match-footer__stat-label">Matched</span>
                        </div>
                    )}
                    {notMatchedCount > 0 && (
                        <div className="match-footer__stat match-footer__stat--not-matched" title="Pattern did not match">
                            <FontAwesomeIcon icon={faXmarkCircle} className="match-footer__stat-icon" />
                            <span className="match-footer__stat-value">{notMatchedCount}</span>
                            <span className="match-footer__stat-label">Not matched</span>
                        </div>
                    )}
                    {notValidatedAfterMatchCount > 0 && (
                        <div className="match-footer__stat match-footer__stat--not-validated" title="Skipped (not validated)">
                            <FontAwesomeIcon icon={faExclamationTriangle} className="match-footer__stat-icon" />
                            <span className="match-footer__stat-value">{notValidatedAfterMatchCount}</span>
                            <span className="match-footer__stat-label">Not validated</span>
                        </div>
                    )}
                    {errorCount > 0 && (
                        <div className="match-footer__stat match-footer__stat--error" title="Match error">
                            <FontAwesomeIcon icon={faCircleExclamation} className="match-footer__stat-icon" />
                            <span className="match-footer__stat-value">{errorCount}</span>
                            <span className="match-footer__stat-label">Error</span>
                        </div>
                    )}
                </div>
                </>
                ) : (
                <>
                <span className="match-footer__summary-title fs-6">Validation Results</span>
                <span className="match-footer__summary-sep">|</span>
                <div className="match-footer__stats match-footer__stats--pre">
                    {validatedCount > 0 && (
                        <div className="match-footer__stat match-footer__stat--validated" title="Ready to match">
                            <FontAwesomeIcon icon={faCheckCircle} className="match-footer__stat-icon" />
                            <span className="match-footer__stat-value">{validatedCount}</span>
                            <span className="match-footer__stat-label">Validated</span>
                        </div>
                    )}
                    {notValidatedCount > 0 && (
                        <div className="match-footer__stat match-footer__stat--not-validated" title="Validation failed or pending">
                            <FontAwesomeIcon icon={faExclamationTriangle} className="match-footer__stat-icon" />
                            <span className="match-footer__stat-value">{notValidatedCount}</span>
                            <span className="match-footer__stat-label">Not validated</span>
                        </div>
                    )}
                </div>
                </>
                )}
            </div>
            </div>
            <div className="match-footer__actions d-flex align-items-center gap-3">
            {isMatchDone && (
                <button className="match-footer__btn-reset d-flex align-items-center gap-2" onClick={onResetMatch}>
                    <FontAwesomeIcon icon={faRotateRight} />
                    RESET
                </button>
            )}
            {isMatchDone && onExportCsv ? (
                <button className="match-footer__btn-export d-flex align-items-center gap-2" onClick={onExportCsv}>
                    <FontAwesomeIcon icon={faFileCsv} />
                    Export To CSV
                </button>
            ) : (
                <>
                    {hasAnyFiles && !hasPattern && (
                        <div className="match-footer__requirement">
                            <FontAwesomeIcon icon={faExclamationTriangle} className="match-footer__requirement-icon" />
                            <span>Please import a compound pattern to start matching</span>
                        </div>
                    )}
                    {!isPatternReadyToMatch && hasPattern && (
                        <div className="match-footer__requirement">
                            <FontAwesomeIcon icon={faExclamationTriangle} className="match-footer__requirement-icon" />
                            <span>Every pattern must be validated for matching</span>
                        </div>
                    )}
                    <button
                        className="match-footer__btn-match d-flex align-items-center gap-2"
                        onClick={onMatch}
                        disabled={!(isFilesReadyToMatch && isPatternReadyToMatch)}
                    >
                        <FontAwesomeIcon icon={faPlay} className="match-footer__play-icon" />
                        MATCH
                    </button>
                </>
            )}
            </div>

            <InfoModal
                isOpen={isInfoModalOpen}
                onRequestClose={() => setIsInfoModalOpen(false)}
                title="Match Toolbar"
                icon={faToolbox}
            >
                <p>The match toolbar shows validation and match status for your code files, and provides actions to run the matching process.</p>
                <p><strong>How to use:</strong></p>
                <ul>
                    <li><strong>Before matching:</strong> The toolbar shows how many files are validated and ready for matching</li>
                    <li>All pattern files and code files must be <strong>validated</strong> before the Match button becomes active</li>
                    <li>Click <strong>Match</strong> to start the pattern matching process against all validated code files</li>
                    <li><strong>After matching:</strong> The toolbar shows how many files matched, didn't match, or had errors</li>
                    <li>Use <strong>Export to CSV</strong> to download the match results as a CSV file</li>
                    <li>Use <strong>Reset</strong> to clear all results and return to the initial state</li>
                </ul>
            </InfoModal>
        </div>
    );
}

export default MatchFooter;
