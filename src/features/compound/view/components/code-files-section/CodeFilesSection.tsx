import './CodeFilesSection.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCode, faPlus, faRotateRight, faFile, faFilter } from '@fortawesome/free-solid-svg-icons';
import { CodeFile, CompoundPattern, CompoundPatternElement, PatternFile, PatternsMatchResult, PatternMatchStatus, PatternFilterConfig, MatchType } from '../../../compoundModels.ts';
import CodeFileDetailsCard from './components/code-file-details-card/CodeFileDetailsCard.tsx';

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
                        filteredCodeFiles.map((file) => (
                            <CodeFileDetailsCard
                                key={file.filename}
                                file={file}
                                pattern={pattern}
                                isMatchDone={isMatchDone}
                                onDeleteFile={onDeleteFile}
                                getModifiedPatternForFile={getModifiedPatternForFile}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default CodeFilesSection;

