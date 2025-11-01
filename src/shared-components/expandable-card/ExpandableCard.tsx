import { useState, ReactNode, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import './ExpandableCard.css';

interface ExpandableCardProps {
    icon?: IconDefinition;
    title: ReactNode;
    subtitle?: ReactNode;
    midTitle?: ReactNode;
    ableToOpen?: boolean;
    postfixIcon?: IconDefinition;
    onPostfixAction?: () => void;
    postfixTooltip?: string;
    expandedContent?: ReactNode;
    defaultExpanded?: boolean;
    className?: string;
    postfixButtonClassName?: string;
    hoverAnimation?: boolean;
}

function ExpandableCard({
    icon,
    title,
    subtitle,
    midTitle,
    ableToOpen = false,
    postfixIcon,
    onPostfixAction,
    postfixTooltip,
    expandedContent,
    defaultExpanded = false,
    className = '',
    postfixButtonClassName = 'btn-postfix-action',
    hoverAnimation = true
}: ExpandableCardProps) {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);
    const contentRef = useRef<HTMLDivElement>(null);
    const [contentHeight, setContentHeight] = useState<number>(0);

    useEffect(() => {
        if (contentRef.current) {
            setContentHeight(contentRef.current.scrollHeight);
        }
    }, [expandedContent]);

    const handleCardClick = () => {
        if (ableToOpen) {
            setIsExpanded(!isExpanded);
        }
    };

    const handlePostfixClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onPostfixAction) {
            onPostfixAction();
        }
    };

    return (
        <div 
            className={`card expandable-card ${ableToOpen ? 'expandable-card-clickable' : ''} ${hoverAnimation ? 'expandable-card-hover' : ''} ${className}`}
        >
            <div 
                className={`card-body expandable-card-header d-flex align-items-center gap-3 ${ableToOpen ? 'cursor-pointer' : ''}`}
                onClick={handleCardClick}
            >
                {ableToOpen && (
                    <FontAwesomeIcon 
                        icon={isExpanded ? faChevronDown : faChevronRight} 
                        className={`expandable-chevron ${isExpanded ? 'expanded' : ''}`}
                    />
                )}
                {icon && (
                    <FontAwesomeIcon icon={icon} className="expandable-icon" />
                )}
                <div className="expandable-section expandable-section-start">
                    <div className="expandable-content">
                        <div className="expandable-title">{title}</div>
                        {subtitle && (
                            <div className="expandable-subtitle">{subtitle}</div>
                        )}
                    </div>
                </div>
                <div className="expandable-section expandable-section-start">
                    {midTitle && (
                        <div className="expandable-mid-title">
                            {midTitle}
                        </div>
                    )}
                </div>
                <div className="expandable-section expandable-section-end">
                    {postfixIcon && (
                        <button 
                            className={postfixButtonClassName}
                            onClick={handlePostfixClick}
                            title={postfixTooltip}
                        >
                            <FontAwesomeIcon icon={postfixIcon} />
                        </button>
                    )}
                </div>
            </div>
            {ableToOpen && expandedContent && (
                <div 
                    className={`expandable-card-collapse ${isExpanded ? 'show' : ''}`}
                    style={{ 
                        maxHeight: isExpanded ? `${contentHeight}px` : '0px'
                    }}
                >
                    <div ref={contentRef} className="card-body expandable-card-expanded-content">
                        {expandedContent}
                    </div>
                </div>
            )}
        </div>
    );
}

export default ExpandableCard;

