import {
    CodeFile,
    CompoundPattern, MatchRequest,
    MatchResponse, MatchType, PatternMatchStatus, PatternsMatchResult,
} from "./compoundModels.ts";
import { ValidationRequest, ValidationResponse } from "./compoundModels.ts";

export async function validateCodeFiles(codeFiles: CodeFile[]): Promise<ValidationResponse> {

    let requestBody: ValidationRequest = {
        codes: [],
        lang: codeFiles[0].lang || '',
    };

    codeFiles.forEach(file => {
        requestBody.codes.push({
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

    if (!response.ok) {
        const message = response.status >= 500
            ? 'Server error. Please try again later.'
            : response.status === 404
                ? 'Service not found.'
                : `Request failed (${response.status}).`;
        throw new Error(message);
    }

    const responseData = await response.json();

    return responseData as ValidationResponse;
}

export interface TransformedMatchResult {
    status: MatchType;
    patternsMatchResults: PatternsMatchResult;
}

export async function match(compoundPattern: CompoundPattern, codeFiles: CodeFile[]): Promise<Record<string, TransformedMatchResult>> {

    const requestBody: MatchRequest = {
        compoundPattern: compoundPattern,
        codes: [],
        lang: codeFiles[0].lang || '',
    };

    codeFiles.forEach(file => {
        requestBody.codes.push({
            filename: file.filename,
            code: file.code,
        });
    });

    const response = await fetch('/api/batch_match', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        const message = response.status >= 500
            ? 'Server error. Please try again later.'
            : response.status === 404
                ? 'Not Found ERROR.'
                : `Request failed (${response.status}).`;
        throw new Error(message);
    }

    const responseData: MatchResponse = await response.json();
    console.log('Match Response -> ', responseData);

    // Transform array response into object keyed by filename
    const transformed: Record<string, TransformedMatchResult> = {};
    for (const item of responseData) {
        const patternsMatchResults: PatternsMatchResult = {};
        for (const [patternName, matched] of Object.entries(item.patternsMatchResults)) {
            patternsMatchResults[patternName] = {
                matchType: matched ? PatternMatchStatus.MATCHED : PatternMatchStatus.NOT_MATCHED,
            };
        }
        transformed[item.name] = {
            status: item.match ? MatchType.MATCH : MatchType.NOT_MATCH,
            patternsMatchResults,
        };
    }

    return transformed;
}