import './PatternTree.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFile, faFolder, faCheckCircle, faXmarkCircle, faFileHalfDashed } from '@fortawesome/free-solid-svg-icons';
import { selectPattern } from '../../../compoundSlice.ts';
import { CompoundPattern, CompoundPatternElement, PatternFile, ClickPatternType, PatternMatchStatus } from '../../../compoundModels.ts';
import { useAppDispatch } from '../../../../../common/hooks.ts';
import { useNavigate } from 'react-router-dom';


interface PatternTreeProps {
    pattern: CompoundPattern;
    clickPatternType?: ClickPatternType;
}

function PatternTree({ pattern, clickPatternType = ClickPatternType.NONE }: PatternTreeProps) {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

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

    const openMatcher = (pattern: PatternFile): void => {
        console.log(`Opening matcher for: ${pattern.filename}`);
        // Navigate to matcher route with pattern code
        navigate('/', { state: { patternCode: pattern.code, code: '' } });
    }

    const isPatternsClickable = (): boolean => {
        return clickPatternType !== ClickPatternType.NONE;
    }

    // Get icon and icon class based on matchStatus
    const getIconForMatchStatus = (matchStatus?: PatternMatchStatus) => {
        const status = matchStatus;
        switch (status) {
            case PatternMatchStatus.MATCHED:
                return { icon: faCheckCircle, className: 'leaf-icon leaf-icon-matched' };
            case PatternMatchStatus.NOT_MATCHED:
                return { icon: faXmarkCircle, className: 'leaf-icon leaf-icon-not-matched' };
            case PatternMatchStatus.NOT_CHECKED:
                return { icon: faFileHalfDashed, className: 'leaf-icon leaf-icon-not-checked' };
            default:
                return { icon: faFile, className: 'leaf-icon' };
        }
    };

    // Recursive function to render tree nodes
    const renderTreeNode = (element: CompoundPatternElement): JSX.Element => {
        if (isPatternFile(element)) {
            const handleClick = isPatternsClickable()
                ? (clickPatternType === ClickPatternType.FILTER 
                    ? () => handleSelectPattern(element)
                    : () => openMatcher(element))
                : undefined;

            // Get matchStatus - always use it if available
            const matchStatus = element.matchStatus;
            
            // Determine leaf-text className based on clickPatternType and matchStatus
            let leafTextClassName = 'leaf-text';
            if (clickPatternType === ClickPatternType.FILTER) {
                leafTextClassName += element.isSelected ? ' selected' : '';
            } else {
                // Always apply matchStatus class for visual feedback
                leafTextClassName += ` ${matchStatus}`;
            }

            const { icon, className: iconClassName } = getIconForMatchStatus(matchStatus);

            return (
                <div 
                    key={element.filename} 
                    className={`tree-leaf ${isPatternsClickable() ? 'clickable' : 'non-clickable'}`} 
                    onClick={handleClick}
                >
                    <span className={`branch-line`}></span>
                    <FontAwesomeIcon icon={icon} className={iconClassName} />
                    <span className={leafTextClassName}>
                        {element.filename}
                    </span>
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

