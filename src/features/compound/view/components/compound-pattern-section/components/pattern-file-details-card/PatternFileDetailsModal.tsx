import Modal from 'react-modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { PatternFile, FileStatus } from '../../../../../compoundModels';

import ValidationErrorCard from '../../../../../../../common/components/validation-error-card/ValidationErrorCard';
import './PatternFileDetailsModal.css';
import CodeView from '../../../../../../../common/components/code-view/CodeView';

export interface PatternFileDetailsModalProps {
    isOpen: boolean;
    onRequestClose: () => void;
    patternFile: PatternFile | null;
}

function formatStatus(status: FileStatus): string {
    switch (status) {
        case FileStatus.VALIDATED:
            return 'Validated';
        case FileStatus.NOT_VALIDATED:
            return 'Not Validated';
        case FileStatus.PENDING:
            return 'Pending';
        case FileStatus.ERROR:
            return 'Error';
        default:
            return 'Unknown';
    }
}

function PatternFileDetailsModal({ isOpen, onRequestClose, patternFile }: PatternFileDetailsModalProps) {
    if (!patternFile) {
        return (
            <Modal
                isOpen={isOpen}
                onRequestClose={onRequestClose}
                className="pattern-file-details-modal"
                overlayClassName="pattern-file-details-modal-overlay"
                ariaHideApp={false}
                closeTimeoutMS={200}
            >
                <div className="pattern-file-details-modal-content" />
            </Modal>
        );
    }

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            className="pattern-file-details-modal"
            overlayClassName="pattern-file-details-modal-overlay"
            ariaHideApp={false}
            closeTimeoutMS={200}
        >
            <div className="pattern-file-details-modal-content">
                <div className="pattern-file-details-modal-header">
                    <h3 className="pattern-file-details-modal-title">Pyttern File</h3>
                    <span className="pattern-file-details-modal-filename">{patternFile.filename}</span>
                    <button
                        type="button"
                        className="pattern-file-details-modal-close"
                        onClick={onRequestClose}
                        aria-label="Close"
                    >
                        <FontAwesomeIcon icon={faXmark} />
                    </button>
                </div>
                <div className="pattern-file-details-modal-body">
                    <div className="file-details">
                        <div className="file-details-meta">
                            <p className="m-0">
                                <strong>File:</strong> {patternFile.filename}
                            </p>
                            <p className="m-0">
                                <strong>Status:</strong> {formatStatus(patternFile.status)}
                            </p>
                        </div>

                        {patternFile.validationError != null && (
                            <ValidationErrorCard error={patternFile.validationError} />
                        )}

                        <div className="pattern-file-details-code-section">
                            <p className="pattern-file-details-code-title">
                                <strong>Pyttern Code:</strong>
                            </p>
                            <CodeView
                                code={patternFile.code}
                                lang={patternFile.lang}
                                errorLine={patternFile.validationError?.line}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
}

export default PatternFileDetailsModal;
