import React from 'react';
import Modal from 'react-modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons';
import './ConfirmationModal.css';

interface ConfirmationModalProps {
    question: string | React.ReactNode;
    onApprove: () => void;
    onDecline?: () => void;
    isOpen: boolean;
    onRequestClose?: () => void;
    isConfirmPositive?: boolean;
}

function ConfirmationModal({
    question,
    onApprove,
    onDecline,
    isOpen,
    onRequestClose,
    isConfirmPositive = true
}: ConfirmationModalProps) {
    const handleApprove = () => {
        onApprove();
        if (onRequestClose) {
            onRequestClose();
        }
    };

    const handleDecline = () => {
        if (onDecline) {
            onDecline();
        }
        if (onRequestClose) {
            onRequestClose();
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose || handleDecline}
            className="confirmation-modal"
            overlayClassName="confirmation-modal-overlay"
            ariaHideApp={false}
        >
            <div className="confirmation-modal-content">
                <div className="confirmation-modal-header">
                    <div className="confirmation-modal-icon-wrapper">
                        <FontAwesomeIcon icon={faCircleExclamation} className="confirmation-modal-icon" />
                    </div>
                    <h3 className="confirmation-modal-title">Are you sure?</h3>
                </div>
                <div className="confirmation-modal-question">
                    {question}
                </div>
                <div className="confirmation-modal-actions">
                    <button
                        className="confirmation-modal-button confirmation-modal-button-decline"
                        onClick={handleDecline}
                    >
                        Cancel
                    </button>
                    <button
                        className={`confirmation-modal-button confirmation-modal-button-approve ${!isConfirmPositive ? 'confirmation-modal-button-approve-negative' : ''}`}
                        onClick={handleApprove}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </Modal>
    );
}

export default ConfirmationModal;

