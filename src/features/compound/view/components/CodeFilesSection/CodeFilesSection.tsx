import './CodeFilesSection.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCode, faPlus, faRotateRight, faFile, faCheckCircle, faTrashAlt, faSpinner, faExclamationTriangle, faFilter, faXmarkCircle } from '@fortawesome/free-solid-svg-icons';
import { CodeFile, CompoundPattern, FileStatus, CompoundPatternElement, PatternFile, PatternsMatchResult, PatternMatchStatus, ClickPatternType, PatternFilterConfig, MatchType } from '../../../compoundModels.ts';
import ExpandableCard from '../../../../../common/components/expandable-card/ExpandableCard.tsx';
import PatternTree from '../PatternTree/PatternTree.tsx';
import _ from 'lodash';

interface CodeFilesSectionProps {
    codeFiles: CodeFile[];
    pattern?: CompoundPattern | null;
    selectedPatterns: string[];
    patternFilters: Record<string, PatternFilterConfig>;
    isMatchDone: boolean;
    onAddCode: () => void;
    onResetCode: () => void;
    onDeleteFile: (filename: string) => void;
    onOpenFilterPanel: () => void;
}

function CodeFilesSection({ codeFiles, pattern, selectedPatterns, patternFilters, isMatchDone, onAddCode, onResetCode, onDeleteFile, onOpenFilterPanel }: CodeFilesSectionProps) {
    const isPatternFile = (element: CompoundPatternElement): element is PatternFile => {
        return 'code' in element;
    };

    // Filter code files based on selected patterns and their filter configurations
    const filterCodeFiles = (files: CodeFile[]): CodeFile[] => {
        if (selectedPatterns.length === 0) {
            return files;
        }

        if (!isMatchDone) {
            return files;
        }

        return files.filter(file => {
            return selectedPatterns.every(patternFilename => {
                    const filterConfig = patternFilters[patternFilename];

                    if (!filterConfig) {
                        return true;
                    }

                    const patternMatchResult = file.patternsMatchResults?.[patternFilename];
                    const matchStatus = patternMatchResult?.matchType || PatternMatchStatus.NOT_CHECKED;

                    if (filterConfig.matchType === MatchType.MATCH) {
                        return matchStatus === PatternMatchStatus.MATCHED ||
                            (filterConfig.includeUnchecked && matchStatus === PatternMatchStatus.NOT_CHECKED);
                    } else if (filterConfig.matchType === MatchType.NOT_MATCH) {
                        return matchStatus === PatternMatchStatus.NOT_MATCHED ||
                            (filterConfig.includeUnchecked && matchStatus === PatternMatchStatus.NOT_CHECKED);
                    }

                    return true;
                });
        });
    };



    const filteredCodeFiles = filterCodeFiles(codeFiles);
    const totalFiles = codeFiles.length;
    const filteredFilesCount = filteredCodeFiles.length;

    const updatePatternsForPatternTree = (
        element: CompoundPatternElement,
        patternsMatchResults: PatternsMatchResult
    ): CompoundPatternElement => {
        if (isPatternFile(element)) {
            // Update matchStatus based on patternsMatchResults
            const matchResult = patternsMatchResults[element.filename];
            const matchStatus = matchResult?.matchType || PatternMatchStatus.NOT_CHECKED;

            return {
                ...element,
                matchStatus: matchStatus
            };
        } else {
            return {
                ...element,
                children: element.children.map(child =>
                    updatePatternsForPatternTree(child, patternsMatchResults)
                )
            };
        }
    };

    // Create modified pattern for a specific code file
    const getModifiedPatternForFile = (file: CodeFile): CompoundPattern | null => {
        if (!pattern || !file.patternsMatchResults) {
            return pattern || null;
        }

        const modifiedPattern: CompoundPattern = {
            ...pattern,
            children: pattern.children.map(child =>
                updatePatternsForPatternTree(child, file.patternsMatchResults!)
            ) as CompoundPatternElement[]
        };

        return modifiedPattern;
    };

    return (
        <div className="code-files-section d-flex flex-column h-100">
            <div className="section-header-wrapper">

                <div className="section-header d-flex justify-content-between align-items-center mb-3">
                    <h2 className="d-flex align-items-center gap-3 m-0">
                        <FontAwesomeIcon icon={faCode} className="header-icon" />
                        Code Files
                    </h2>
                    <div className="d-flex align-items-center gap-2">
                        <span className="file-count">{totalFiles} file{totalFiles !== 1 ? 's' : ''}</span>
                        {selectedPatterns.length > 0 && isMatchDone && (
                            <span className="file-count-filtered">{filteredFilesCount} filtered</span>
                        )}
                    </div>
                </div>

                <div className="section-actions d-flex gap-3 justify-content-between align-items-center">
                    <div className="d-flex gap-3">
                        <button className="btn-add d-flex align-items-center gap-2" onClick={onAddCode} disabled={isMatchDone}>
                            <FontAwesomeIcon icon={faPlus} /> Add Code
                        </button>
                        <button className="btn-reset d-flex align-items-center gap-2" onClick={onResetCode} disabled={isMatchDone}>
                            <FontAwesomeIcon icon={faRotateRight} /> Reset
                        </button>
                    </div>
                    {isMatchDone && (
                        <button
                            className={`btn-filter d-flex align-items-center gap-2 ${selectedPatterns.length > 0 ? 'btn-filter-active' : ''}`}
                            onClick={onOpenFilterPanel}
                            title="Filter code files by pattern"
                        >
                            <FontAwesomeIcon icon={faFilter} /> Filter
                        </button>
                    )}
                </div>

                {/*
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
                */}

            </div>
            <div className="section-content-wrapper">
                <div className="file-list d-flex flex-column">
                    {totalFiles === 0 ? (
                        <div className="empty-state d-flex flex-column align-items-center justify-content-center text-center p-5">
                            <FontAwesomeIcon icon={faFile} className="empty-icon" />
                            <p className="m-0 mb-3">No code files added yet</p>
                            <button className="btn-add-empty d-flex align-items-center gap-2" onClick={onAddCode} disabled={isMatchDone}>
                                <FontAwesomeIcon icon={faPlus} /> Add Your First Code File
                            </button>
                        </div>
                    ) : filteredCodeFiles.length === 0 && selectedPatterns.length > 0 ? (
                        <div className="empty-state d-flex flex-column align-items-center justify-content-center text-center p-5">
                            <FontAwesomeIcon icon={faFilter} className="empty-icon" />
                            <p className="m-0 mb-3">No files match the selected filters</p>
                        </div>
                    ) : (
                        filteredCodeFiles.map((file) => {
                            return (
                                <ExpandableCard
                                    key={file.filename}
                                    icon={faFile}
                                    title={<span className="file-name">{file.filename}</span>}
                                    midTitle={
                                        <span className={`file-status d-flex align-items-center gap-2 ${isMatchDone
                                                ? (file.status === FileStatus.MATCHED
                                                    ? 'status-matched'
                                                    : file.status === FileStatus.NOT_MATCHED
                                                        ? 'status-not-matched'
                                                        : 'status-error')
                                                : (file.status === FileStatus.READY
                                                    ? 'status-ready'
                                                    : file.status === FileStatus.PENDING
                                                        ? 'status-pending'
                                                        : 'status-error')
                                            }`}>
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
                                            ) : file.status === FileStatus.READY ? (
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
                                    postfixIcon={!isMatchDone ? faTrashAlt : undefined}
                                    onPostfixAction={!isMatchDone ? () => onDeleteFile(file.filename) : undefined}
                                    postfixTooltip={!isMatchDone ? "Remove file" : undefined}
                                    expandedContent={
                                        <div className="file-details">
                                            <p className="m-0"><strong>File:</strong> {file.filename}</p>
                                            <p className="m-0"><strong>Status:</strong> {file.status}</p>

                                            {file.validationError != null ? (
                                                <p className="m-0"><strong>Validation Error:</strong> {file.validationError.msg}</p>
                                            ) : (
                                                <div></div>
                                            )}

                                            {isMatchDone && !_.isNil(pattern) && (
                                                <div className="pt-3 pb-3">
                                                    <PatternTree
                                                        pattern={getModifiedPatternForFile(file) || pattern}
                                                        clickPatternType={ClickPatternType.MATCHER}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    }
                                    className="file-card"
                                    postfixButtonClassName="btn-delete"
                                    headerClassName={isMatchDone ? "py-3" : ""}
                                />
                            );
                        })

                    )}
                </div>
            </div>
        </div>
    );
}

export default CodeFilesSection;

