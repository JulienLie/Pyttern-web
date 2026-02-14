import './PatternTree.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFile, faFolder, faCheckCircle, faXmarkCircle, faFileHalfDashed, faExclamationTriangle, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { CompoundPattern, CompoundPatternElement, PatternFile, PatternMatchStatus, FileStatus } from '../../../compoundModels.ts';


interface PatternTreeProps {
    pattern: CompoundPattern;
    onPatternFileClick?: (patternFile: PatternFile) => void;
    /** When true, always show match-status icons (matched / not-matched / unchecked). Use in code file details after match. */
    showMatchStatus?: boolean;
    showDefaultIcon?: boolean;
}

function PatternTree({ pattern, onPatternFileClick, showMatchStatus = false, showDefaultIcon = false}: PatternTreeProps) {
    // Helper function to check if an element is a pattern file (leaf node)
    const isPatternFile = (element: CompoundPatternElement): element is PatternFile => {
        return 'code' in element;
    };

    // Helper function to check if a node is a logical operator (and, or, not)
    const isLogicalOperator = (name: string): boolean => {
        return ['and', 'or', 'not'].includes(name.toLowerCase());
    };

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

    // Get icon and icon class based on validation status (FileStatus)
    const getIconForValidationStatus = (status?: FileStatus) => {
        if (showDefaultIcon) {
            return { icon: faFile, className: 'leaf-icon' };
        }

        switch (status) {
            case FileStatus.VALIDATED:
                return { icon: faCheckCircle, className: 'leaf-icon leaf-icon-matched' };
            case FileStatus.NOT_VALIDATED:
            case FileStatus.ERROR:
                return { icon: faExclamationTriangle, className: 'leaf-icon leaf-icon-not-validated' };
            case FileStatus.PENDING:
                return { icon: faSpinner, className: 'leaf-icon leaf-icon-not-validated leaf-icon-spinning' };
            default:
                return { icon: faFile, className: 'leaf-icon' };
        }
    };

    // Recursive function to render tree nodes
    const renderTreeNode = (element: CompoundPatternElement): JSX.Element => {
        if (isPatternFile(element)) {
            const matchStatus = element.matchStatus;
            const useMatchStatus = showMatchStatus || (matchStatus !== undefined && matchStatus !== null);
            const { icon, className: iconClassName } = useMatchStatus
                ? getIconForMatchStatus(matchStatus)
                : getIconForValidationStatus(element.status);

            const handleClick = onPatternFileClick ? () => onPatternFileClick(element) : undefined;

            // Determine leaf-text className
            let leafTextClassName = 'leaf-text';
            if (useMatchStatus) {
                leafTextClassName += ` ${matchStatus ?? PatternMatchStatus.NOT_CHECKED}`;
            } else if (element.status === FileStatus.NOT_VALIDATED || element.status === FileStatus.ERROR) {
                leafTextClassName += ' not-validated';
            }

            const isNotValidated = element.status === FileStatus.NOT_VALIDATED || element.status === FileStatus.ERROR;
            const isClickable = Boolean(onPatternFileClick);
            const leafContainerClassName = `tree-leaf ${isClickable ? 'clickable' : 'non-clickable'}${isNotValidated ? ' not-validated' : ''}`;

            return (
                <div
                    key={element.filename}
                    className={leafContainerClassName}
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

