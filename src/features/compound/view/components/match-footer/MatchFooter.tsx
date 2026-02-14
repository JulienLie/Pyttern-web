import './MatchFooter.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileCsv, faPlay, faRotateRight } from '@fortawesome/free-solid-svg-icons';

export interface MatchFooterProps {
    isMatchDone: boolean;
    isFilesReadyToMatch: boolean;
    isPatternReadyToMatch: boolean;
    onMatch: () => void;
    onResetMatch: () => void;
    onExportCsv?: () => void;
}

function MatchFooter({ isMatchDone, isFilesReadyToMatch, isPatternReadyToMatch, onMatch, onResetMatch, onExportCsv }: MatchFooterProps) {
    console.log('isFilesReadyToMatch', isFilesReadyToMatch);
    console.log('isPatternReadyToMatch', isPatternReadyToMatch);

    return (
        <div className="match-footer position-fixed bottom-0 start-0 end-0 d-flex justify-content-end align-items-center p-3 px-5 gap-3">
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
                <button
                    className="match-footer__btn-match d-flex align-items-center gap-2"
                    onClick={onMatch}
                    disabled={!(isFilesReadyToMatch && isPatternReadyToMatch)}
                >
                    <FontAwesomeIcon icon={faPlay} className="match-footer__play-icon" />
                    MATCH
                </button>
            )}
        </div>
    );
}

export default MatchFooter;
