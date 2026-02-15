import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faFile,
    faCode,
    faCheckCircle,
    faTrashAlt,
    faSpinner,
    faExclamationTriangle,
    faXmarkCircle,
} from '@fortawesome/free-solid-svg-icons';
import {
    CodeFile,
    CompoundPattern,
    FileStatus,
    PatternFile,
} from '../../../../../compoundModels';
import ExpandableCard from '../../../../../../../common/components/expandable-card/ExpandableCard';
import PatternTree from '../../../pattern-tree/PatternTree';
import _ from 'lodash';
import { useNavigate } from 'react-router-dom';
import ValidationErrorCard from '../../../../../../../common/components/validation-error-card/ValidationErrorCard';
import CodeView from '../../../../../../../common/components/code-view/CodeView';


export interface CodeFileDetailsCardProps {
    file: CodeFile;
    pattern?: CompoundPattern | null;
    isMatchDone: boolean;
    onDeleteFile: (filename: string) => void;
    getModifiedPatternForFile: (file: CodeFile) => CompoundPattern | null;
}

function CodeFileDetailsCard({
    file,
    pattern,
    isMatchDone,
    onDeleteFile,
    getModifiedPatternForFile,
}: CodeFileDetailsCardProps) {
    const navigate = useNavigate();
    const handlePatternFileClick = (patternFile: PatternFile) => {
        navigate('/', { state: { patternCode: patternFile.code, code: '' } });
    };

    return (
        <ExpandableCard
            key={file.filename}
            icon={faFile}
            title={<span className="file-name">{file.filename}</span>}
            midTitle={
                <span
                    className={`file-status d-flex align-items-center gap-2 ${
                        isMatchDone
                            ? file.status === FileStatus.MATCHED
                                ? 'status-matched'
                                : file.status === FileStatus.NOT_MATCHED
                                  ? 'status-not-matched'
                                  : 'status-error'
                            : file.status === FileStatus.VALIDATED
                              ? 'status-validated'
                              : file.status === FileStatus.NOT_VALIDATED
                                ? 'status-not-validated'
                                : file.status === FileStatus.PENDING
                                  ? 'status-pending'
                                  : 'status-error'
                    }`}
                >
                    {isMatchDone ? (
                        file.status === FileStatus.MATCHED ? (
                            <>
                                <FontAwesomeIcon icon={faCheckCircle} className="status-icon" />
                                <span className="status-text">Matched</span>
                            </>
                        ) : file.status === FileStatus.NOT_MATCHED ? (
                            <>
                                <FontAwesomeIcon icon={faXmarkCircle} className="status-icon" />
                                <span className="status-text">Not Matched</span>
                            </>
                        ) : (
                            <>
                                <FontAwesomeIcon icon={faExclamationTriangle} className="status-icon" />
                                <span className="status-text">Error</span>
                            </>
                        )
                    ) : file.status === FileStatus.VALIDATED ? (
                        <>
                            <FontAwesomeIcon icon={faCheckCircle} className="status-icon" />
                            <span className="status-text">Validated</span>
                        </>
                    ) : file.status === FileStatus.NOT_VALIDATED ? (
                        <>
                            <FontAwesomeIcon icon={faExclamationTriangle} className="status-icon" />
                            <span className="status-text">Validation Failed</span>
                        </>
                    ) : file.status === FileStatus.PENDING ? (
                        <>
                            <FontAwesomeIcon icon={faSpinner} className="status-icon status-icon-spinning" />
                            <span className="status-text">Validating...</span>
                        </>
                    ) : (
                        <>
                            <FontAwesomeIcon icon={faExclamationTriangle} className="status-icon" />
                            <span className="status-text">Error</span>
                        </>
                    )}
                </span>
            }
            ableToOpen={true}
            postfixIcon={!isMatchDone ? faTrashAlt : undefined}
            onPostfixAction={!isMatchDone ? () => onDeleteFile(file.filename) : undefined}
            postfixTooltip={!isMatchDone ? 'Remove file' : undefined}
            expandedContent={
                <div className="file-details">
                    <div className="file-details-meta">
                        <p className="m-0">
                            <strong>File:</strong> {file.filename}
                        </p>
                        <p className="m-0">
                            <strong>Status:</strong>{' '}
                            {(() => {
                                switch (file.status) {
                                    case FileStatus.VALIDATED:
                                        return 'Validated';
                                    case FileStatus.NOT_VALIDATED:
                                        return 'Not Validated';
                                    case FileStatus.PENDING:
                                        return 'Pending';
                                    case FileStatus.MATCHED:
                                        return 'Matched';
                                    case FileStatus.NOT_MATCHED:
                                        return 'Not Matched';
                                    case FileStatus.ERROR:
                                        return 'Error';
                                    default:
                                        return 'Unknown';
                                }
                            })()}
                        </p>
                    </div>

                    {file.validationError != null && (
                        <ValidationErrorCard error={file.validationError} />
                    )}

                    <ExpandableCard
                        icon={faCode}
                        title="View code"
                        ableToOpen={true}
                        className="file-code-card"
                        headerClassName="py-2"
                        expandedContent={
                            <CodeView
                                code={file.code}
                                lang={file.lang}
                                errorLine={file.validationError?.line}
                            />
                        }
                    />

                    {isMatchDone && !_.isNil(pattern) && (
                        <div className="pt-3 pb-3">
                            <PatternTree
                                pattern={getModifiedPatternForFile(file) || pattern}
                                onPatternFileClick={handlePatternFileClick}
                                showMatchStatus
                            />
                        </div>
                    )}
                </div>
            }
            className="file-card"
            postfixButtonClassName="btn-delete"
            headerClassName={isMatchDone ? 'py-3' : ''}
        />
    );
}

export default CodeFileDetailsCard;
