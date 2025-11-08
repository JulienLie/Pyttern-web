import { MatchState, GraphData, StartMatchResult, FetchStepDataResult } from './matcherModels.ts';
import { ValidationResponse } from './matcherApi.ts';
import * as matcherApi from './matcherApi.ts';

export async function startMatch(
    code: string,
    patternCode: string
): Promise<StartMatchResult> {
    const data = await matcherApi.matchPattern(code, patternCode);

    return {
        maxSteps: data.n_steps,
        matchStates: data.match_states,
        patternNode: data.state[0],
        codeNode: data.state[1],
    };
}

export async function fetchStepData(step: number): Promise<FetchStepDataResult> {
    const data = await matcherApi.fetchStep(step);

    const matchedNodes: MatchState[] = data.current_matchings.map(
        (match: [string, string]) => ({
            patternNode: match[0],
            codeNode: match[1],
        })
    );

    const prevMatchedNodes: MatchState[] = data.previous_matchings.map(
        (match: [string, string]) => ({
            patternNode: match[0],
            codeNode: match[1],
        })
    );

    const codePos: [number, number] = [data.code_pos[0], data.code_pos[1] + 1];

    return {
        patternNode: data.state[0],
        codeNode: data.state[1],
        matchedNodes,
        prevMatchedNodes,
        currentStack: data.current_stack,
        previousStack: data.previous_stack,
        codePos,
    };
}


export function formatValidationErrorMessage(
    message: ValidationResponse['message']
): string {
    if (typeof message === 'string') {
        return message;
    } else if (message && typeof message === 'object') {
        return `Error at line ${message.line}:${message.column} - ${message.msg}`;
    } else {
        return 'Validation failed';
    }
}


export async function fetchGraphData(
    code: string,
    type: 'pattern' | 'code'
): Promise<GraphData> {
    const data = await matcherApi.fetchGraph(code, type);
    return data.graph;
}

