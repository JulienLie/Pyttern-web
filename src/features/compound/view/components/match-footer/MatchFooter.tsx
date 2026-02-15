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
} from '@fortawesome/free-solid-svg-icons';
import { CodeFile, CompoundPattern, FileStatus } from '../../../compoundModels';

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
            <div className="match-footer__summary">
                {!hasAnyFiles && !hasPattern ? (
                    <div className="match-footer__summary-info">
                        <FontAwesomeIcon icon={faCircleInfo} className="match-footer__summary-info-icon" />
                        <span>Please import a compound pattern and upload code files to validate</span>
                    </div>
                ) : (
                <>
                <span className="match-footer__summary-title fs-6">
                    {!isMatchDone ? 'Validation Results' : 'Match Results'}
                </span>
                <span className="match-footer__summary-sep">|</span>
                {!isMatchDone ? (
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
                ) : (
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
                )}
                </>
                )}
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
                    {!isPatternReadyToMatch && hasPattern && (
                        <div className="match-footer__pattern-warning d-flex align-items-center gap-2">
                            <FontAwesomeIcon icon={faExclamationTriangle} className="match-footer__pattern-warning-icon" />
                            <span>Every pattern must be validated for matching</span>
                        </div>
                    )}
                    {hasAnyFiles && !hasPattern && (
                        <div className="match-footer__pattern-warning d-flex align-items-center gap-2">
                            <FontAwesomeIcon icon={faExclamationTriangle} className="match-footer__pattern-warning-icon" />
                            <span>Please import a compound pattern to start matching</span>
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
        </div>
    );
}

export default MatchFooter;
