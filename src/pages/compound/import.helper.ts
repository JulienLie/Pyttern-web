import { directoryOpen, fileOpen } from 'browser-fs-access';
import { CompoundPattern, CompoundPatternElement, PatternFile, CodeFile, FileStatus } from '../../store/slices/compoundSlice';
import * as _ from 'lodash';

/**
 * Checks if the directory name is a valid logical operator
 */
const isLogicalOperator = (name: string): boolean => {
    const lowerName = name.toLowerCase();
    return lowerName === 'and' || lowerName === 'or' || lowerName === 'not';
};

/**
 * Checks if the file is a pattern file (.pyt extension)
 */
const isPatternFile = (name: string): boolean => {
    return name.endsWith('.pyt') || name.endsWith('.py');
};

/**
 * Reads the content of a file
 */
const readFileContent = async (file: File): Promise<string> => {
    return await file.text();
};

/**
 * Build a path string for a file
 */
const getRelativePath = (file: File & { directoryPath?: string; directoryHandle?: FileSystemDirectoryHandle; handle?: FileSystemFileHandle }): string => {
    // Try different path properties that might be available
    if (file.webkitRelativePath) {
        return file.webkitRelativePath;
    }
    if (file.directoryPath) {
        return file.directoryPath + '/' + file.name;
    }
    return file.name;
};

/**
 * Processes an array of files from browser-fs-access and builds the compound pattern tree
 */
const processFilesArray = async (files: File[]): Promise<CompoundPattern | null> => {
    if (files.length === 0) return null;

    // Build a tree structure from the flat file list
    interface TreeNode {
        name: string;
        type: 'directory' | 'file';
        children?: Map<string, TreeNode>;
        file?: File;
    }

    // Get the root folder name from the first file's path
    const firstPath = getRelativePath(files[0]);
    const rootName = firstPath.split('/')[0];

    const root: TreeNode = {
        name: rootName,
        type: 'directory',
        children: new Map(),
    };

    // Populate the tree
    for (const file of files) {
        const relativePath = getRelativePath(file);
        const pathParts = relativePath.split('/').slice(1); // Skip root
        let current = root;

        for (let i = 0; i < pathParts.length; i++) {
            const part = pathParts[i];
            const isLastPart = i === pathParts.length - 1;

            if (isLastPart) {
                // This is a file
                if (isPatternFile(part)) {
                    current.children!.set(part, {
                        name: part,
                        type: 'file',
                        file: file,
                    });
                }
            } else {
                // This is a directory
                if (!current.children!.has(part)) {
                    current.children!.set(part, {
                        name: part,
                        type: 'directory',
                        children: new Map(),
                    });
                }
                current = current.children!.get(part)!;
            }
        }
    }

    // Convert tree to CompoundPattern
    const convertTreeNode = async (node: TreeNode): Promise<CompoundPattern> => {
        const children: CompoundPatternElement[] = [];

        if (node.children) {
            for (const [_, childNode] of node.children) {
                if (childNode.type === 'directory' && isLogicalOperator(childNode.name)) {
                    const subPattern = await convertTreeNode(childNode);
                    children.push(subPattern);
                } else if (childNode.type === 'file' && childNode.file) {
                    const content = await readFileContent(childNode.file);
                    const patternFile: PatternFile = {
                        filename: childNode.name,
                        code: content.trim(),
                        status: FileStatus.PENDING,
                        lang: getLangFromFileExtension(childNode.name),
                        isSelected: false,
                    };
                    children.push(patternFile);
                }
            }
        }

        return {
            name: node.name,
            children,
        };
    };

    return await convertTreeNode(root);
};

/**
 * Opens a folder picker dialog and imports the compound pattern structure
 * Uses browser-fs-access for cross-browser compatibility
 */
export const importCompoundPatternFromFolder = async (): Promise<CompoundPattern | null> => {
    try {
        // Use browser-fs-access to open directory picker with automatic fallback
        const files = await directoryOpen({
            recursive: true,
        });

        if (!files || files.length === 0) {
            return null;
        }

        const pattern = await processFilesArray(files);
        return pattern;
    } catch (error) {
        if ((error as Error).name === 'AbortError') {
            // User cancelled the picker
            return null;
        }
        console.error('Error importing compound pattern:', error);
        throw error;
    }
};

/**
 * Opens a file picker dialog and imports multiple code files
 * Uses browser-fs-access for cross-browser compatibility
 */
export const importCodeFiles = async (lang?: string): Promise<CodeFile[]> => {
    try {
        // Use browser-fs-access to open file picker with multiple selection

        let extensions: string[] = ['.py', '.pyt', '.java'];

        if (!_.isNil(lang) && lang !== '') {
            extensions = getExtensionFromFileExtension(lang);
        }

        const files = await fileOpen({
            multiple: true,
            // Accept Python files
            extensions: extensions,
            description: 'Python Code Files',
        });

        if (!files || files.length === 0) {
            return [];
        }

        // Convert File objects to CodeFile objects
        const codeFiles: CodeFile[] = await Promise.all(
            files.map(async (file, index) => {
                const content = await readFileContent(file);
                const lang = getLangFromFileExtension(file.name);

                return {
                    filename: file.name,
                    status: FileStatus.PENDING,
                    code: content,
                    validationError: null,
                    lang: lang
                };
            })
        );

        const uniqueLangs = [...new Set(codeFiles.map(file => file.lang))];
        if (uniqueLangs.length > 1) {
            throw new Error('Multiple languages found in the code files');
        }

        if (!_.isNil(lang) && lang !== '' && uniqueLangs[0] !== lang) {
            throw new Error('Language mismatch between code files and selected language');
        }

        return codeFiles;
    } catch (error) {
        if ((error as Error).name === 'AbortError') {
            // User cancelled the picker
            return [];
        }
        console.error('Error importing code files:', error);
        throw error;
    }
};

/**
 * Validates the imported compound pattern structure
 */
export const validateCompoundPattern = (pattern: CompoundPattern | null): string | null => {
    if (!pattern) {
        return 'No pattern provided';
    }

    if (!pattern.children || pattern.children.length === 0) {
        return 'Pattern must contain at least one child element';
    }

    // Recursively validate the structure
    const validateElement = (element: CompoundPatternElement, path: string): string | null => {
        if ('code' in element) {
            // This is a PatternFile
            if (!element.code || element.code.trim() === '') {
                return `Pattern file "${element.filename}" at ${path} is empty`;
            }
        } else {
            // This is a CompoundPattern
            if (!isLogicalOperator(element.name)) {
                return `Invalid operator "${element.name}" at ${path}. Must be 'and', 'or', or 'not'`;
            }

            if (!element.children || element.children.length === 0) {
                return `Operator "${element.name}" at ${path} must contain at least one child`;
            }

            // Special validation for 'not' operator
            if (element.name.toLowerCase() === 'not' && element.children.length > 1) {
                return `Operator "not" at ${path} must contain exactly one child`;
            }

            // Recursively validate children
            for (const child of element.children) {
                const childPath = `${path}/${element.name}`;
                const childError = validateElement(child, childPath);
                if (childError) return childError;
            }
        }

        return null;
    };

    for (const child of pattern.children) {
        const error = validateElement(child, pattern.name);
        if (error) return error;
    }

    return null;
};


const getLangFromFileExtension = (filename: string): string => {
    const extension = filename.split('.').pop() || '';
    switch (extension) {
        case 'py':
            return 'python';
        case 'pyt':
            return 'python';
        case 'java':
            return 'java';
        default:
            return '';
    }
};

const getExtensionFromFileExtension = (lang: string): string[] => {
    switch (lang) {
        case 'python':
            return ['.py', '.pyt'];
        case "java":
            return ['.java'];
        default:
            return [];
    }
};
