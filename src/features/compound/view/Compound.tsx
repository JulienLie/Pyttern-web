import './Compound.css';
import CodeFilesSection from './components/CodeFilesSection/CodeFilesSection.tsx';
import CompoundPatternSection from './components/CompoundPatternSection/CompoundPatternSection.tsx';
import FilterPanel from './components/FilterPanel/FilterPanel.tsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faRotateRight } from '@fortawesome/free-solid-svg-icons';
import { importCompoundPatternFromFolder, validateCompoundPatternStructure, importCodeFiles } from '../importUtils.ts';
import { useAppDispatch, useAppSelector } from '../../../common/hooks.ts';
import { setCompoundPattern, setCodeFiles, resetCompoundPattern, resetState } from '../compoundSlice.ts';
import { startMatch, validateCodeFiles, validatePatterns } from '../compoundThunks.ts';
import { FileStatus } from '../compoundModels.ts';
import { useState, useRef, useEffect } from 'react';

function Compound() {
    const dispatch = useAppDispatch();
    const { codeFiles, compoundPattern, isFilesReadyToMatch, isMatchDone, selectedPatterns, patternFilters } = useAppSelector((state) => state.compound);
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
    const [dividerPosition, setDividerPosition] = useState(50); // Percentage from left
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const dividerRef = useRef<HTMLDivElement>(null);

    const handleAddCode = async () => {
        try {
            const newFiles = await importCodeFiles(codeFiles[0]?.lang || undefined);

            if (newFiles.length > 0) {
                // Merge with existing files, avoiding duplicates by name
                const existingNames = new Set();


                const codeFilesToValidate = codeFiles.map((file) => {
                    existingNames.add(file.filename);

                    if (newFiles.some(f => f.filename === file.filename)) {
                        return {
                            ...file,
                            status: FileStatus.PENDING,
                        };
                    } else {
                        return file;
                    }
                });


                const uniqueNewFiles = newFiles.filter(f => !existingNames.has(f.filename));

                dispatch(setCodeFiles([...codeFilesToValidate, ...uniqueNewFiles]));
                dispatch(validateCodeFiles());
            } else {
                console.log('No files selected');
            }
        } catch (error) {
            console.error('Error importing code files:', error);
            alert(`Error importing code files: ${(error as Error).message}`);
        }
    };

    const handleResetCode = () => {
        dispatch(setCodeFiles([]));
    };

    const handleDeleteFile = (filename: string) => {
        dispatch(setCodeFiles(codeFiles.filter(file => file.filename !== filename)));
    };

    const handleImportPattern = async () => {
        try {
            console.log('Import pattern - opening folder picker');
            const pattern = await importCompoundPatternFromFolder();

            if (pattern) {
                // Validate the imported pattern structure
                const validationError = validateCompoundPatternStructure(pattern);

                if (validationError) {
                    console.error('Validation error:', validationError);
                    alert(`Invalid pattern structure: ${validationError}`);
                    return;
                }

                console.log('Pattern imported successfully:', pattern);
                dispatch(setCompoundPattern(pattern));
                dispatch(validatePatterns());
            } else {
                console.log('Import cancelled by user');
            }
        } catch (error) {
            console.error('Error importing pattern:', error);
            alert(`Error importing pattern: ${(error as Error).message}`);
        }
    };

    const handleResetPattern = () => {
        console.log('Reset pattern');
        dispatch(resetCompoundPattern());
    };

    const handleMatch = () => {
        console.log('match');
        dispatch(startMatch());
    };

    const handleResetMatch = () => {
        dispatch(resetState());
    };

    const adjustDivider = (isDragging: boolean) => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging || !containerRef.current) return;

            const containerRect = containerRef.current.getBoundingClientRect();
            const newPosition = ((e.clientX - containerRect.left) / containerRect.width) * 100;
            
            // Constrain between 20% and 80% to prevent sections from becoming too small
            const constrainedPosition = Math.max(20, Math.min(80, newPosition));
            setDividerPosition(constrainedPosition);
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
    }

    const handleDividerMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    // Handle divider drag
    useEffect(() => {
        return adjustDivider(isDragging);
    }, [isDragging]);



    return (
        <div className="compound-container d-flex flex-column ps-4 pe-4 pt-4">
            <div 
                ref={containerRef}
                className="compound-content d-flex flex-1 gap-4 overflow-hidden position-relative"
            >
                <div 
                    className="compound-left d-flex flex-column gap-3"
                    style={{ width: `${dividerPosition}%`, minWidth: '200px' }}
                >
                    <CompoundPatternSection
                        pattern={compoundPattern}
                        isMatchDone={isMatchDone}
                        onImportPattern={handleImportPattern}
                        onResetPattern={handleResetPattern}
                    />
                </div>

                <div 
                    ref={dividerRef}
                    className={`compound-divider ${isDragging ? 'dragging' : ''}`}
                    onMouseDown={handleDividerMouseDown}
                ></div>

                <div 
                    className={`compound-right d-flex flex-column gap-3 ${isFilterPanelOpen ? 'shift-for-filter-panel' : ''}`}
                    style={{ width: `${100 - dividerPosition}%`, minWidth: '200px' }}
                >
                    <CodeFilesSection
                        codeFiles={codeFiles}
                        pattern={compoundPattern}
                        selectedPatterns={selectedPatterns}
                        patternFilters={patternFilters}
                        isMatchDone={isMatchDone}
                        onAddCode={handleAddCode}
                        onResetCode={handleResetCode}
                        onDeleteFile={handleDeleteFile}
                        onOpenFilterPanel={() => setIsFilterPanelOpen(true)}
                    />
                </div>
            </div>

            <FilterPanel
                isOpen={isFilterPanelOpen}
                onClose={() => setIsFilterPanelOpen(false)}
                compoundPattern={compoundPattern ?? null}
                selectedPatterns={selectedPatterns}
                patternFilters={patternFilters}
            />

            <div className="match-button-container position-fixed bottom-0 start-0 end-0 d-flex justify-content-end align-items-center p-3 px-5 gap-3">
                {isMatchDone && (
                    <button className="btn-reset-match d-flex align-items-center gap-2" onClick={handleResetMatch}>
                        <FontAwesomeIcon icon={faRotateRight} />
                        RESET
                    </button>
                )}
                <button className="btn-match d-flex align-items-center gap-2" onClick={handleMatch} disabled={!isFilesReadyToMatch || isMatchDone}>
                    <FontAwesomeIcon icon={faPlay} className="play-icon" />
                    MATCH
                </button>
            </div>
        </div>
    );
}

export default Compound;