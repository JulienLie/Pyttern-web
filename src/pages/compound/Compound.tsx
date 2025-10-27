import './Compound.css';
import CodeFilesSection from './components/CodeFilesSection/CodeFilesSection';
import CompoundPatternSection from './components/CompoundPatternSection/CompoundPatternSection';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay } from '@fortawesome/free-solid-svg-icons';
import { importCompoundPatternFromFolder, validateCompoundPattern, importCodeFiles } from './import.helper';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setCompoundPattern, setCodeFiles, FileStatus } from '../../store/slices/compoundSlice';
import { validateCodeFiles } from '../../services/compound/compoundService';

function Compound() {

    const dispatch = useAppDispatch();
    const { codeFiles, compoundPattern, isFilesReadyToMatch } = useAppSelector((state) => state.compound);


    const handleAddCode = async () => {
        try {
            console.log('Add code - opening file picker');
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
                // Validate the imported pattern
                const validationError = validateCompoundPattern(pattern);
                
                if (validationError) {
                    console.error('Validation error:', validationError);
                    alert(`Invalid pattern structure: ${validationError}`);
                    return;
                }
                
                console.log('Pattern imported successfully:', pattern);
                dispatch(setCompoundPattern(pattern));
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
        dispatch(setCompoundPattern(null));
    };

    const handleRun = () => {
        console.log('Run');
    };

    return (
        <div className="compound-container d-flex flex-column p-4 pb-5">
            <div className="compound-content d-flex flex-1 gap-4 overflow-hidden position-relative">
                <div className="compound-left d-flex flex-column gap-3 flex-1">
                    <CompoundPatternSection
                        pattern={compoundPattern}
                        onImportPattern={handleImportPattern}
                        onResetPattern={handleResetPattern}
                    />
                </div>

                <div className="compound-divider"></div>

                <div className="compound-right d-flex flex-column gap-3 flex-1">
                    <CodeFilesSection
                        codeFiles={codeFiles}
                        onAddCode={handleAddCode}
                        onResetCode={handleResetCode}
                        onDeleteFile={handleDeleteFile}
                    />
                </div>
            </div>

            <div className="run-button-container position-fixed bottom-0 start-0 end-0 d-flex justify-content-end align-items-center p-3 px-5">
                <button className="btn-run d-flex align-items-center gap-2" onClick={handleRun} disabled={!isFilesReadyToMatch}>
                    <FontAwesomeIcon icon={faPlay} className="play-icon" />
                    MATCH
                </button>
            </div>
        </div>
    );
}

export default Compound;