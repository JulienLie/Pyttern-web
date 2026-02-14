import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { ValidationError } from '../../../features/compound/compoundModels';

export interface ValidationErrorCardProps {
    error: ValidationError;
}

function ValidationErrorCard({ error }: ValidationErrorCardProps) {
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

export default ValidationErrorCard;
