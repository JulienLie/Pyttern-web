import './CodeFilesSection.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCode, faPlus, faRotateRight, faFile, faCheckCircle, faTrashAlt, faSpinner, faExclamationTriangle, faFilter, faXmarkCircle } from '@fortawesome/free-solid-svg-icons';
import { CodeFile, CompoundPattern, FileStatus, CompoundPatternElement, PatternFile, PatternsMatchResult, PatternMatchStatus, ClickPatternType, PatternFilterConfig, MatchType, ValidationError } from '../../../compoundModels.ts';
import ExpandableCard from '../../../../../common/components/expandable-card/ExpandableCard.tsx';
import PatternTree from '../PatternTree/PatternTree.tsx';
import _ from 'lodash';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { Extension } from '@codemirror/state';
import { Decoration, DecorationSet, ViewPlugin, EditorView } from '@codemirror/view';
import { RangeSetBuilder } from '@codemirror/state';

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

function getLangExtension(lang: string): Extension[] {
    const normalized = (lang || '').toLowerCase();
    if (normalized === 'java' || normalized === 'jat') return [java()];
    return [python()]; // default for .py, .pyt, .pyh
}

/** Highlights a single line (1-based) with the error-line class. */
function highlightErrorLine(lineNumber: number): Extension {
    if (!(lineNumber >= 1)) return [];
    return ViewPlugin.fromClass(
        class {
            decorations: DecorationSet;
            constructor(view: EditorView) {
                this.decorations = this.build(view);
            }
            update(update: { docChanged: boolean; view: EditorView }) {
                if (update.docChanged) this.decorations = this.build(update.view);
            }
            build(view: EditorView): DecorationSet {
                const builder = new RangeSetBuilder<Decoration>();
                const doc = view.state.doc;
                const lineNum = Math.min(Math.max(1, lineNumber), doc.lines);
                const line = doc.line(lineNum);
                // Line decoration: both positions at line start so the full row gets the class
                builder.add(line.from, line.from, Decoration.line({ attributes: { class: 'cm-error-line' } }));
                return builder.finish();
            }
        },
        { decorations: (v) => v.decorations }
    );
}

function ValidationErrorCallout({ error }: { error: ValidationError }) {
    const hasLocation = typeof error.line === 'number' || typeof error.column === 'number';
    return (
        <div className="validation-error-callout">
            <div className="validation-error-callout-header">
                <FontAwesomeIcon icon={faExclamationTriangle} className="validation-error-icon" />
                <span className="validation-error-label">Validation Error</span>
                {hasLocation && (
                    <span className="validation-error-location">
                        Line {error.line ?? '?'}, Column {error.column ?? '?'}
                    </span>
                )}
            </div>
            <pre className="validation-error-message">{error.msg}</pre>
        </div>
    );
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
                        <button className="btn-reset d-flex align-items-center gap-2" onClick={onResetCode} disabled={isMatchDone || codeFiles.length === 0}>
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
                                                    <span className="status-text">Validated</span>
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
                                            <div className="file-details-meta">
                                                <p className="m-0"><strong>File:</strong> {file.filename}</p>
                                                <p className="m-0"><strong>Status:</strong> {file.status}</p>
                                            </div>

                                            {file.validationError != null && (
                                                <ValidationErrorCallout error={file.validationError} />
                                            )}

                                            <ExpandableCard
                                                icon={faCode}
                                                title="View code"
                                                ableToOpen={true}
                                                className="file-code-card"
                                                headerClassName="py-2"
                                                expandedContent={
                                                    <div className="file-code-view-wrapper">
                                                        <CodeMirror
                                                            value={file.code}
                                                            extensions={[
                                                                ...getLangExtension(file.lang),
                                                                ...(file.validationError?.line != null && file.validationError.line >= 1
                                                                    ? [highlightErrorLine(file.validationError.line)]
                                                                    : []),
                                                            ]}
                                                            editable={false}
                                                            readOnly={true}
                                                            basicSetup={{
                                                                lineNumbers: true,
                                                                foldGutter: false,
                                                                highlightActiveLine: false,
                                                                highlightSelectionMatches: false,
                                                            }}
                                                        />
                                                    </div>
                                                }
                                            />

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

