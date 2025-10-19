import { useState } from 'react';
import './Compound.css';
import CodeFilesSection from './components/CodeFilesSection/CodeFilesSection';
import CompoundPatternSection from './components/CompoundPatternSection/CompoundPatternSection';
import { CodeFile, CompoundPattern } from '../../store/slices/compoundSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay } from '@fortawesome/free-solid-svg-icons';

function Compound() {
    let mockCodeFiles: CodeFile[] = [
        { id: '1', name: 'code1.py', status: 'ready', code: 'def foo(): print("Hello, world!")' },
        { id: '2', name: 'code2.py', status: 'ready', code: 'def foo(): print("Hello, world!")' },
        { id: '3', name: 'code3.py', status: 'ready', code: 'def foo(): print("Hello, world!")' },
        { id: '4', name: 'code4.py', status: 'ready', code: 'def foo(): print("Hello, world!")' },
        { id: '5', name: 'code5.py', status: 'ready', code: 'def foo(): print("Hello, world!")' },
    ];

    let mockCompoundPattern: CompoundPattern = {
        name: 'pattern_name',
        children: [
            {
                id: '1',
                name: 'and',
                children: [
                    {
                        id: '2',
                        name: 'pattern1.py',
                        pattern: 'def foo(?*):?*',
                        isSelected: false,
                    },
                    {
                        id: '3',
                        name: 'pattern2.py',
                        pattern: 'def foo(?*):?*',
                        isSelected: false,
                    },
                    {
                        id: '4',
                        name: 'or',
                        children: [
                            {
                                id: '5',
                                name: 'not',
                                children: [
                                    {
                                        id: '6',
                                        name: 'pattern3.py',
                                        pattern: 'def foo(?*):?*',
                                        isSelected: false,
                                    },
                                ],
                            },
                            {
                                id: '7',
                                name: 'pattern4.py',
                                pattern: 'def foo(?*):?*',
                                isSelected: false,
                            },
                            {
                                id: '7',
                                name: 'pattern5.py',
                                pattern: 'def foo(?*):?*',
                                isSelected: false,
                            }
                        ],
                    }
                ],
            },
        ],
    };

    const [codeFiles, setCodeFiles] = useState<CodeFile[]>([]);

    const [compoundPattern, setCompoundPattern] = useState<CompoundPattern | null>(null);

    const handleAddCode = () => {
        console.log('Add code');
        setCodeFiles(mockCodeFiles);
    };

    const handleResetCode = () => {
        setCodeFiles([]);
    };

    const handleDeleteFile = (id: string) => {
        setCodeFiles(codeFiles.filter(file => file.id !== id));
    };

    const handleImportPattern = () => {
        console.log('Import pattern');
        setCompoundPattern(mockCompoundPattern);
    };

    const handleResetPattern = () => {
        console.log('Reset pattern');
        setCompoundPattern(null);
    };

    const handleRun = () => {
        console.log('Run');
    };

    return (
        <div className="compound-container">
            <div className="compound-content">
                <div className="compound-left">
                    <CodeFilesSection 
                        codeFiles={codeFiles}
                        onAddCode={handleAddCode}
                        onResetCode={handleResetCode}
                        onDeleteFile={handleDeleteFile}
                    />
                </div>

                <div className="compound-divider"></div>

                <div className="compound-right">
                    <CompoundPatternSection 
                        pattern={compoundPattern}
                        onImportPattern={handleImportPattern}
                        onResetPattern={handleResetPattern}
                    />
                </div>
            </div>

            <div className="run-button-container">
                <button className="btn-run" onClick={handleRun}>
                    <FontAwesomeIcon icon={faPlay} className="play-icon" />
                    RUN
                </button>
            </div>
        </div>
    );
}

export default Compound;