import './PatternTree.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFile, faFolder } from '@fortawesome/free-solid-svg-icons';
import { selectPattern } from '../../../compoundSlice.ts';
import { CompoundPattern, CompoundPatternElement, PatternFile } from '../../../compoundModels.ts';
import { useAppDispatch } from '../../../../../common/hooks.ts';


interface PatternTreeProps {
    pattern: CompoundPattern;
}

function PatternTree({ pattern }: PatternTreeProps) {
    const dispatch = useAppDispatch();

    // Helper function to check if an element is a pattern file (leaf node)
    const isPatternFile = (element: CompoundPatternElement): element is PatternFile => {
        return 'code' in element;
    };

    // Helper function to check if a node is a logical operator (and, or, not)
    const isLogicalOperator = (name: string): boolean => {
        return ['and', 'or', 'not'].includes(name.toLowerCase());
    };

    const handleSelectPattern = (pattern: PatternFile): void => {
        console.log(`Clicked on: ${pattern.filename}`);
        dispatch(selectPattern(pattern.filename));
    }

    // Recursive function to render tree nodes
    const renderTreeNode = (element: CompoundPatternElement): JSX.Element => {
        if (isPatternFile(element)) {
            return (
                <div 
                    key={element.filename} 
                    className={`tree-leaf`} 
                    onClick={() => handleSelectPattern(element)}
                >
                    <span className={`branch-line`}></span>
                    <FontAwesomeIcon icon={faFile} className="leaf-icon" />
                    <span 
                        className={`leaf-text ${element.isSelected ? 'selected' : ''}`}
                    >{element.filename}</span>
                </div>
            );
        } else {
            // Render a branch node (compound pattern or logical operator)
            const isOperator = isLogicalOperator(element.name);
            
            return (
                <div key={element.name} className="tree-branch">
                    <span className="branch-line"></span>
                    <span 
                        className={`node-text d-inline-flex align-items-center gap-2 ${isOperator ? `keyword keyword-${element.name.toLowerCase()}` : ''}`}
                    >
                        {element.name}
                    </span>
                    {element.children && element.children.length > 0 && (
                        <div className="tree-children">
                            {element.children.map((child) => renderTreeNode(child))}
                        </div>
                    )}
                </div>
            );
        }
    };

    console.log('Haloo');

    return (
        <div className="pattern-tree-container bg-white rounded-3 border p-4 shadow-sm">
            <div className="pattern-tree">
                <div className="tree-node root-node">
                    <span className="node-text root d-inline-flex align-items-center gap-2">
                        <FontAwesomeIcon icon={faFolder} className="pattern-icon" />
                        {pattern.name}
                    </span>
                    {pattern.children && pattern.children.length > 0 && (
                        <div className="tree-children">
                            {pattern.children.map((child) => renderTreeNode(child))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default PatternTree;

