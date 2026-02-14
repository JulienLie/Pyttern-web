import './Compound.css';
import CodeFilesSection from './components/code-files-section/CodeFilesSection.tsx';
import CompoundPatternSection from './components/compound-pattern-section/CompoundPatternSection.tsx';
import FilterPanel from './components/filter-panel/FilterPanel.tsx';
import MatchFooter from './components/match-footer/MatchFooter.tsx';
import ConfirmationModal from '../../../common/components/confirmation-modal/ConfirmationModal.tsx';
import { importCompoundPatternFromFolder, validateCompoundPatternStructure, importCodeFiles } from '../importUtils.ts';
import { useAppDispatch, useAppSelector } from '../../../common/hooks.ts';
import { setCompoundPattern, setCodeFiles, resetCompoundPattern, resetState } from '../compoundSlice.ts';
import { startMatch, validateCodeFiles, validatePatterns } from '../compoundThunks.ts';
import { FileStatus } from '../compoundModels.ts';
import { buildMatchResultsCsv, downloadCsv } from '../csvUtils.ts';
import { useState, useRef, useEffect, useCallback } from 'react';

function Compound() {
    const dispatch = useAppDispatch();
    const { codeFiles, compoundPattern, isFilesReadyToMatch, isPatternReadyToMatch, isMatchDone, selectedPatterns, patternFilters } = useAppSelector((state) => state.compound);
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
    const [dividerPosition, setDividerPosition] = useState(50); // Percentage from left
    const [isDragging, setIsDragging] = useState(false);
    const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [isResetPatternModalOpen, setIsResetPatternModalOpen] = useState(false);
    const [isResetCodeModalOpen, setIsResetCodeModalOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const dividerRef = useRef<HTMLDivElement>(null);
    const rafRef = useRef<number | null>(null);

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
        setIsResetCodeModalOpen(true);
    };

    const handleResetCodeApprove = () => {
        dispatch(setCodeFiles([]));
        setIsResetCodeModalOpen(false);
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
        setIsResetPatternModalOpen(true);
    };

    const handleResetPatternApprove = () => {
        console.log('Reset pattern');
        dispatch(resetCompoundPattern());
        setIsResetPatternModalOpen(false);
    };

    const handleMatch = () => {
        setIsMatchModalOpen(true);
    };

    const handleMatchApprove = () => {
        console.log('match');
        dispatch(startMatch());
        setIsMatchModalOpen(false);
    };

    const handleResetMatch = () => {
        setIsResetModalOpen(true);
    };

    const handleResetApprove = () => {
        dispatch(resetState());
        setIsResetModalOpen(false);
        setIsFilterPanelOpen(false);
    };

    const handleExportCsv = () => {
        if (!compoundPattern || codeFiles.length === 0) return;
        const csv = buildMatchResultsCsv(codeFiles, compoundPattern.name);
        downloadCsv(csv, `${compoundPattern.name}-results.csv`);
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!containerRef.current) return;

        // Cancel any pending animation frame
        if (rafRef.current !== null) {
            cancelAnimationFrame(rafRef.current);
        }

        // Use requestAnimationFrame for smooth updates
        rafRef.current = requestAnimationFrame(() => {
            const containerRect = containerRef.current!.getBoundingClientRect();
            const newPosition = ((e.clientX - containerRect.left) / containerRect.width) * 100;
            
            // Constrain between 20% and 80% to prevent sections from becoming too small
            const constrainedPosition = Math.max(20, Math.min(80, newPosition));
            setDividerPosition(constrainedPosition);
        });
    }, []);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
        if (rafRef.current !== null) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }
    }, []);

    const handleDividerMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    // Handle divider drag
    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove, { passive: true });
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        } else {
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);



    return (
        <div className="compound-container d-flex flex-column ps-4 pe-4 pt-4">
            <div 
                ref={containerRef}
                className="compound-content d-flex flex-1 gap-4 overflow-hidden position-relative"
            >
                <div 
                    className={`compound-left d-flex flex-column gap-3 ${isDragging ? 'no-transition' : ''}`}
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
                    className={`compound-right d-flex flex-column gap-3 ${isFilterPanelOpen ? 'shift-for-filter-panel' : ''} ${isDragging ? 'no-transition' : ''}`}
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

            <MatchFooter
                isMatchDone={isMatchDone}
                isFilesReadyToMatch={isFilesReadyToMatch}
                isPatternReadyToMatch={isPatternReadyToMatch}
                onMatch={handleMatch}
                onResetMatch={handleResetMatch}
                onExportCsv={handleExportCsv}
            />

            <ConfirmationModal
                isOpen={isMatchModalOpen}
                questionContent="This action will start the matching process and you will not be able to upload new code files."
                onApprove={handleMatchApprove}
                onRequestClose={() => setIsMatchModalOpen(false)}
            />

            <ConfirmationModal
                isOpen={isResetModalOpen}
                questionContent="This action will clear all match results and reset the state."
                onApprove={handleResetApprove}
                onRequestClose={() => setIsResetModalOpen(false)}
                isConfirmPositive={false}
            />

            <ConfirmationModal
                isOpen={isResetPatternModalOpen}
                questionContent="This action will clear the imported pattern."
                onApprove={handleResetPatternApprove}
                onRequestClose={() => setIsResetPatternModalOpen(false)}
                isConfirmPositive={false}
            />

            <ConfirmationModal
                isOpen={isResetCodeModalOpen}
                questionContent="This action will remove all imported code files."
                onApprove={handleResetCodeApprove}
                onRequestClose={() => setIsResetCodeModalOpen(false)}
                isConfirmPositive={false}
            />
        </div>
    );
}

export default Compound;