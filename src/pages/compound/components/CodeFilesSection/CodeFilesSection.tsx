import './CodeFilesSection.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCode, faPlus, faRotateRight, faChevronRight, faFile, faCheckCircle, faTrashAlt, faSpinner, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { CodeFile, FileStatus } from '../../../../store/slices/compoundSlice';

interface CodeFilesSectionProps {
    codeFiles: CodeFile[];
    onAddCode: () => void;
    onResetCode: () => void;
    onDeleteFile: (filename: string) => void;
}

function CodeFilesSection({ codeFiles, onAddCode, onResetCode, onDeleteFile }: CodeFilesSectionProps) {
    return (
        <>
            <div className="section-header d-flex justify-content-between align-items-center mb-1">
                <h2 className="d-flex align-items-center gap-3 m-0">
                    <FontAwesomeIcon icon={faCode} className="header-icon" />
                    Code Files
                </h2>
                <span className="file-count">{codeFiles.length} file{codeFiles.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="section-actions d-flex gap-3">
                <button className="btn-add d-flex align-items-center gap-2" onClick={onAddCode}>
                    <FontAwesomeIcon icon={faPlus} /> Add Code
                </button>
                <button className="btn-reset d-flex align-items-center gap-2" onClick={onResetCode}>
                    <FontAwesomeIcon icon={faRotateRight} /> Reset
                </button>
            </div>
            <div className="file-list d-flex flex-column bg-white rounded-3 border shadow-sm">
                {codeFiles.length === 0 ? (
                    <div className="empty-state d-flex flex-column align-items-center justify-content-center text-center p-5">
                        <FontAwesomeIcon icon={faFile} className="empty-icon" />
                        <p className="m-0 mb-3">No code files added yet</p>
                        <button className="btn-add-empty d-flex align-items-center gap-2" onClick={onAddCode}>
                            <FontAwesomeIcon icon={faPlus} /> Add Your First Code File
                        </button>
                    </div>
                ) : (
                    codeFiles.map((file) => (
                        <div key={file.filename} className="file-item d-flex align-items-center gap-3 p-3 border-bottom">
                            <FontAwesomeIcon icon={faChevronRight} className="file-chevron" />
                            <FontAwesomeIcon icon={faFile} className="file-icon" />
                            <span className="file-name">{file.filename}</span>
                            <span className={`file-status d-flex align-items-center gap-2 ${
                                file.status === FileStatus.READY ? 'status-ready' 
                                : file.status === FileStatus.PENDING ? 'status-pending' 
                                : 'status-error'
                            }`}>
                                {file.status === FileStatus.READY ? (
                                    <>
                                        <FontAwesomeIcon icon={faCheckCircle} className="status-icon" />
                                        <span className="status-text">Ready to Run</span>
                                    </>
                                ) : file.status === FileStatus.PENDING ? (
                                    <>
                                        <FontAwesomeIcon icon={faSpinner} className="status-icon status-icon-spinning" />
                                        <span className="status-text">Validating...</span>
                                    </>
                                ) : (
                                    <>
                                        <FontAwesomeIcon icon={faExclamationTriangle} className="status-icon" />
                                        <span className="status-text">Validation Failed</span>
                                    </>
                                )}
                            </span>
                            <button 
                                className="btn-delete"
                                onClick={() => onDeleteFile(file.filename)}
                                title="Remove file"
                            >
                                <FontAwesomeIcon icon={faTrashAlt} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </>
    );
}

export default CodeFilesSection;

