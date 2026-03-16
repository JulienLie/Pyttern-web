import React from 'react';
import Modal from 'react-modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import './InfoModal.css';

interface InfoModalProps {
    isOpen: boolean;
    onRequestClose: () => void;
    title: string;
    icon?: IconDefinition;
    children: React.ReactNode;
}

function InfoModal({ isOpen, onRequestClose, title, icon, children }: InfoModalProps) {
    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            className="info-modal"
            overlayClassName="info-modal-overlay"
            ariaHideApp={false}
        >
            <div className="info-modal-content">
                <div className="info-modal-header">
                    <div className="info-modal-header-left">
                        {icon && (
                            <div className="info-modal-icon-wrapper">
                                <FontAwesomeIcon icon={icon} className="info-modal-icon" />
                            </div>
                        )}
                        <h3 className="info-modal-title">{title}</h3>
                    </div>
                    <button className="info-modal-close" onClick={onRequestClose}>
                        <FontAwesomeIcon icon={faXmark} />
                    </button>
                </div>
                <div className="info-modal-body">
                    {children}
                </div>
            </div>
        </Modal>
    );
}

export default InfoModal;
