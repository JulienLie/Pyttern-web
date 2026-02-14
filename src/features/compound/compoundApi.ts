import { CodeFile, CompoundPattern, MatchRequest, MatchResponse } from "./compoundModels.ts";
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

    // TODO: Delete this after testing!!!
    await new Promise(resolve => setTimeout(resolve, 3000));

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();

    return responseData as ValidationResponse;
}

export async function match(compoundPattern: CompoundPattern, codeFiles: CodeFile[]): Promise<MatchResponse> {
    // TODO: Implement the match API call

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

    // TODO: Delete this after testing!!!
    await new Promise(resolve => setTimeout(resolve, 3000));

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    console.log('Match Response -> ', responseData);

    return responseData as MatchResponse;

    // TODO: Delete this after update!
    /*
    await new Promise(resolve => setTimeout(resolve, 3000));

    const responseData: MatchResponse = {
        "code1.py": {
            status: MatchType.MATCH,
            patternsMatchResults: {
                "pattern3.py": {
                    matchType: PatternMatchStatus.NOT_MATCHED
                },
                "pattern2.py": {
                    matchType: PatternMatchStatus.NOT_CHECKED
                },
                "pattern1.py": {
                    matchType: PatternMatchStatus.MATCHED
                },
            }
        },
        "code2.py": {
            status: MatchType.NOT_MATCH,
            patternsMatchResults: {
                "pattern3.py": {
                    matchType: PatternMatchStatus.MATCHED
                },
                "pattern2.py": {
                    matchType: PatternMatchStatus.NOT_MATCHED
                },
                "pattern1.py": {
                    matchType: PatternMatchStatus.NOT_CHECKED
                },
            }
        },
        "code3.py": {
            status: MatchType.MATCH,
            patternsMatchResults: {
                "pattern3.py": {
                    matchType: PatternMatchStatus.MATCHED
                },
                "pattern2.py": {
                    matchType: PatternMatchStatus.MATCHED
                },
                "pattern1.py": {
                    matchType: PatternMatchStatus.MATCHED
                },
            }
        },
        "code4.py": {
            status: MatchType.NOT_MATCH,
            patternsMatchResults: {
                "pattern3.py": {
                    matchType: PatternMatchStatus.NOT_MATCHED
                },
                "pattern2.py": {
                    matchType: PatternMatchStatus.NOT_CHECKED
                },
                "pattern1.py": {
                    matchType: PatternMatchStatus.NOT_MATCHED
                },
            }
        },
        "code5.py": {
            status: MatchType.NOT_MATCH,
            patternsMatchResults: {
                "pattern3.py": {
                    matchType: PatternMatchStatus.MATCHED
                },
                "pattern2.py": {
                    matchType: PatternMatchStatus.MATCHED
                },
                "pattern1.py": {
                    matchType: PatternMatchStatus.NOT_MATCHED
                },
            }
        },
        "code6.py": {
            status: MatchType.MATCH,
            patternsMatchResults: {
                "pattern3.py": {
                    matchType: PatternMatchStatus.NOT_MATCHED
                },
                "pattern2.py": {
                    matchType: PatternMatchStatus.NOT_CHECKED
                },
                "pattern1.py": {
                    matchType: PatternMatchStatus.MATCHED
                },
            }
        },
    }

    return responseData;
    */
}