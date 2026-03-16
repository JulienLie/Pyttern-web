export const getLangFromFileExtension = (filename: string): string => {
    const extension = filename.split('.').pop() || '';
    switch (extension) {
        case 'py':
        case 'pyt':
        case 'pyh':
            return 'python';
        case 'java':
        case 'jat':
            return 'java';
        default:
            return '';
    }
};

export const getExtensionsForLang = (lang: string): string[] => {
    switch (lang) {
        case 'python':
            return ['.py', '.pyt'];
        case 'java':
            return ['.java'];
        default:
            return [];
    }
};
