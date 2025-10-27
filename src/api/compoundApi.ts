import { CodeFile } from "../store/slices/compoundSlice";

export interface ValidationRequest {
    codes: {
        id: string;
        filename: string;
        code: string;
    }[];
    lang?: string;
}

export interface ValidationResponse {
    [id: string]: {
        filename: string;
        status: ValidationStatus;
        message?: {
            line: number;
            column: number;
            symbol: string;
            msg: string;
        } | null;
    };
}

export enum ValidationStatus {
    OK = 'ok',
    ERROR = 'error',
}


/**
 * Start a pattern matching operation
 * @param codeFiles - The code files to validate
 * @returns The validation results
 */
export async function validateCodeFiles(codeFiles: CodeFile[]): Promise<ValidationResponse> {

    let requestBody: ValidationRequest = {
        codes: [],
        lang: codeFiles[0].lang || '',
    };

    codeFiles.forEach(file => {
        requestBody.codes.push({
            id: file.id,
            filename: file.filename,
            code: file.code,
        });
    });
    
    const response = await fetch('/api/batch_validate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    });

    // TODO: Delete this after testing!!!
    await new Promise(resolve => setTimeout(resolve, 3000));

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();

    return responseData as ValidationResponse;
}