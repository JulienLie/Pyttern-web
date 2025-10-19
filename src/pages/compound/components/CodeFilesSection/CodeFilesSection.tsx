import './CodeFilesSection.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCode, faPlus, faRotateRight, faChevronRight, faFile, faCheckCircle, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { CodeFile } from '../../../../store/slices/compoundSlice';

interface CodeFilesSectionProps {
    codeFiles: CodeFile[];
    onAddCode: () => void;
    onResetCode: () => void;
    onDeleteFile: (id: string) => void;
}

function CodeFilesSection({ codeFiles, onAddCode, onResetCode, onDeleteFile }: CodeFilesSectionProps) {
    return (
        <>
            <div className="section-header">
                <h2>
                    <FontAwesomeIcon icon={faCode} className="header-icon" />
                    Code Files
                </h2>
                <span className="file-count">{codeFiles.length} file{codeFiles.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="section-actions">
                <button className="btn-add" onClick={onAddCode}>
                    <FontAwesomeIcon icon={faPlus} /> Add Code
                </button>
                <button className="btn-reset" onClick={onResetCode}>
                    <FontAwesomeIcon icon={faRotateRight} /> Reset
                </button>
            </div>
            <div className="file-list">
                {codeFiles.length === 0 ? (
                    <div className="empty-state">
                        <FontAwesomeIcon icon={faFile} className="empty-icon" />
                        <p>No code files added yet</p>
                        <button className="btn-add-empty" onClick={onAddCode}>
                            <FontAwesomeIcon icon={faPlus} /> Add Your First Code File
                        </button>
                    </div>
                ) : (
                    codeFiles.map((file) => (
                        <div key={file.id} className="file-item">
                            <FontAwesomeIcon icon={faChevronRight} className="file-chevron" />
                            <FontAwesomeIcon icon={faFile} className="file-icon" />
                            <span className="file-name">{file.name}</span>
                            <span className="file-status">
                                <FontAwesomeIcon icon={faCheckCircle} className="status-icon" />
                                Ready to Run
                            </span>
                            <button 
                                className="btn-delete"
                                onClick={() => onDeleteFile(file.id)}
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
export type { CodeFile };

