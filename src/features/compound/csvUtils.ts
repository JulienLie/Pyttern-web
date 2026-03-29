import { CodeFile } from './compoundModels';
import _ from "lodash";

function escapeCsvField(value: string): string {
    if (!/[\n",]/.test(value)) {
        return value;
    }
    return `"${value.replace(/"/g, '""')}"`;
}


export function buildMatchResultsCsv(codeFiles: CodeFile[], compoundPatternName: string): string {
    const patternKeysSet = new Set<string>();
    for (const file of codeFiles) {
        if (file.patternsMatchResults) {
            for (const key of Object.keys(file.patternsMatchResults)) {
                patternKeysSet.add(key);
            }
        }
    }
    const patternColumns = Array.from(patternKeysSet).sort();

    const headerCells = ['Code File Name', compoundPatternName, ...patternColumns];
    const headerRow = headerCells.map(escapeCsvField).join(',');

    const dataRows = codeFiles.map((file: CodeFile) => {
        const isNotValidated: boolean = !_.isNil(file.validationError);
        const notValidated = 'not-validated';

        const statuses = patternColumns.map((patternKey) => {
            if (isNotValidated)
                return notValidated;

            const result = file.patternsMatchResults?.[patternKey];
            return result?.matchType ?? '';
        });

        const cells = [file.filename, isNotValidated? notValidated : file.status, ...statuses];
        return cells.map(escapeCsvField).join(',');
    });

    return [headerRow, ...dataRows].join('\n');
}

export function downloadCsv(csv: string, filename: string): void {
    const blob = new Blob([csv], {type: 'text/csv'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}
