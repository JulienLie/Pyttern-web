
import React, { useState, useEffect } from 'react';
import { Modal, Button, ListGroup, Alert } from 'react-bootstrap';

interface MultiUploadModalProps {
    show: boolean;
    onHide: () => void;
}

interface ApiResponse {
    status: 'ok' | 'error';
    message?: string;
    names?: string[];
}

async function uploadMacro(code: string): Promise<ApiResponse> {
    const response = await fetch('/api/macro', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
}

async function deleteMacro(name: string): Promise<ApiResponse> {
    const response = await fetch('/api/macro', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
}

async function getMacros(): Promise<ApiResponse> {
    const response = await fetch('/api/macro', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
}


const MultiUploadModal: React.FC<MultiUploadModalProps> = ({ show, onHide }) => {
    const [names, setNames] = useState<string[]>([]);
    const [errors, setErrors] = useState<string[]>([]);

    useEffect(() => {
        if (show) {
            const fetchMacros = async () => {
                try {
                    const result = await getMacros();
                    if (result.status === 'ok' && result.names) {
                        setNames(result.names);
                        setErrors([]);
                    } else if (result.status === 'error') {
                        setErrors([`Error loading macros: ${result.message}`]);
                    }
                } catch (error) {
                    setErrors([`Error loading macros: ${(error as Error).message}`]);
                }
            };
            fetchMacros();
        }
    }, [show]);


    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const newFiles = Array.from(event.target.files);
            const newErrors: string[] = [];

            for (const file of newFiles) {
                const reader = new FileReader();
                reader.onload = async (e) => {
                    const content = e.target?.result as string;
                    try {
                        const result = await uploadMacro(content);

                        if (result.status === 'ok') {
                            if (result.names) {
                                setNames(prevNames => {
                                    const namesSet = new Set(prevNames);
                                    result.names?.forEach(name => namesSet.add(name));
                                    return Array.from(namesSet);
                                });
                            }
                        } else {
                            newErrors.push(`Error uploading ${file.name}: ${result.message}`);
                        }
                    } catch (error) {
                        newErrors.push(`Error uploading ${file.name}: ${(error as Error).message}`);
                    } finally {
                        setErrors([...newErrors]);
                    }
                };
                reader.onerror = () => {
                    newErrors.push(`Failed to read the file ${file.name}. Please try again.`);
                    setErrors([...newErrors]);
                };
                reader.readAsText(file);
            }
        }
    };

    const handleNameDelete = async (indexToDelete: number) => {
        const nameToDelete = names[indexToDelete];
        try {
            const result = await deleteMacro(nameToDelete);

            if (result.status === 'ok') {
                setNames(prevNames => prevNames.filter((_, i) => i !== indexToDelete));
                setErrors([]);
            } else {
                setErrors([`Error deleting ${nameToDelete}: ${result.message}`]);
            }
        } catch (error) {
            setErrors([`Error deleting ${nameToDelete}: ${(error as Error).message}`]);
        }
    };

    return (
        <Modal show={show} onHide={() => { setErrors([]); setNames([]); onHide(); }} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Upload Multiple Files</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {errors.length > 0 && (
                    <Alert variant="danger">
                        {errors.map((error, index) => (
                            <div key={index}>{error}</div>
                        ))}
                    </Alert>
                )}
                <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="form-control mb-3"
                    accept=".myt"
                />
                <ListGroup>
                    {names.map((name, index) => (
                        <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                            {name}
                            <Button variant="danger" size="sm" onClick={() => handleNameDelete(index)}>
                                Delete
                            </Button>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default MultiUploadModal;
