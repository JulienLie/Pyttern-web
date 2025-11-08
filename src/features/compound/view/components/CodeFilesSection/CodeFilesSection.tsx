import './CodeFilesSection.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCode, faPlus, faRotateRight, faFile, faCheckCircle, faTrashAlt, faSpinner, faExclamationTriangle, faFilter, faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import { selectPattern } from '../../../compoundSlice.ts';
import { CodeFile, CompoundPattern, FileStatus } from '../../../compoundModels.ts';
import ExpandableCard from '../../../../../common/components/expandable-card/ExpandableCard.tsx';
import { useAppDispatch } from '../../../../../common/hooks.ts';
import PatternTree from '../PatternTree/PatternTree.tsx';
import _ from 'lodash';

interface CodeFilesSectionProps {
    codeFiles: CodeFile[];
    pattern?: CompoundPattern | null;
    selectedPatterns: string[];
    onAddCode: () => void;
    onResetCode: () => void;
    onDeleteFile: (filename: string) => void;
}

function CodeFilesSection({ codeFiles, pattern, selectedPatterns, onAddCode, onResetCode, onDeleteFile }: CodeFilesSectionProps) {
    const dispatch = useAppDispatch();

    const updatePatternFilter = (pattern: string) => {
        dispatch(selectPattern(pattern));
    }

    return (
        <div className="code-files-section d-flex flex-column h-100">
            <div className="section-header-wrapper">

                <div className="section-header d-flex justify-content-between align-items-center mb-3">
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

                {selectedPatterns.length > 0 && (
                    <div className="pt-4 ps-4 pe-4 pb-2">
                        <div className="d-flex align-items-center gap-2">
                            <FontAwesomeIcon icon={faFilter} className="filter-icon" />
                            <span className="filter-label">Filter by:</span>
                            <div className="d-flex align-items-center gap-2 flex-wrap">
                                {selectedPatterns.map((pattern, index) => (
                                    <span key={index} className="pattern-badge">
                                        {pattern}
                                        <span className="ms-2">
                                            <FontAwesomeIcon icon={faCircleXmark} className="fa-circle-xmark" onClick={() => updatePatternFilter(pattern)} />
                                        </span>
                                    </span>

                                ))}
                            </div>
                        </div>
                    </div>
                )}

            </div>
            <div className="section-content-wrapper">
                <div className="file-list d-flex flex-column">
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
                            <ExpandableCard
                                key={file.filename}
                                icon={faFile}
                                title={<span className="file-name">{file.filename}</span>}
                                midTitle={
                                    <span className={`file-status d-flex align-items-center gap-2 ${file.status === FileStatus.READY ? 'status-ready'
                                            : file.status === FileStatus.PENDING ? 'status-pending'
                                                : 'status-error'
                                        }`}>
                                        {file.status === FileStatus.READY ? (
                                            <>
                                                <FontAwesomeIcon icon={faCheckCircle} className="status-icon" />
                                                <span className="status-text">Ready to Match</span>
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
                                }
                                ableToOpen={true}
                                postfixIcon={faTrashAlt}
                                onPostfixAction={() => onDeleteFile(file.filename)}
                                postfixTooltip="Remove file"
                                expandedContent={
                                    <div className="file-details">
                                        <p className="m-0"><strong>File:</strong> {file.filename}</p>
                                        <p className="m-0"><strong>Status:</strong> {file.status}</p>
                                        
                                        {file.validationError != null ? (
                                            <p className="m-0"><strong>Validation Error:</strong> {file.validationError.msg}</p>
                                        ) : (
                                            <div></div>
                                        )}
                                        
                                        {!_.isNil(pattern) && (
                                            <div className="pt-3 pb-3">
                                                <PatternTree pattern={pattern} />
                                            </div>
                                        )}
                                    </div>
                                }
                                className="file-card"
                                postfixButtonClassName="btn-delete"
                            />
                        ))

                    )}
                </div>
            </div>
        </div>
    );
}

export default CodeFilesSection;

