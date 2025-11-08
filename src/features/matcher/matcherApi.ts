/**
 * Matcher API Layer
 * Pure API call functions - no Redux dependencies
 * These functions handle HTTP requests and response parsing
 */

// API Response Types
export interface MatchResponse {
    status: 'ok' | 'error';
    message?: string;
    state: [string, string];
    n_steps: number;
    match_states: number[];
}

export interface StepResponse {
    status: 'ok' | 'error';
    message?: string;
    state: [string, string];
    current_matchings: [string, string][];
    previous_matchings: [string, string][];
    current_stack: string;
    previous_stack: string;
    code_pos: [number, number];
}

export interface ValidationResponse {
    status: 'ok' | 'error';
    message?: string | {
        line: number;
        column: number;
        msg: string;
    };
}

export interface GraphResponse {
    status: 'ok' | 'error';
    message?: string;
    graph: any; // Cytoscape graph data
}

/**
 * Start a pattern matching operation
 * @param code - The code to analyze
 * @param pattern - The pattern to match
 * @returns Match result data
 */
export async function matchPattern(code: string, pattern: string): Promise<MatchResponse> {
    const response = await fetch('/api/match', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, pattern }),
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.status === 'error') {
        throw new Error(data.message);
    }

    return data;
}

/**
 * Fetch step data for a specific step in the matching process
 * @param step - The step number to fetch
 * @returns Step data
 */
export async function fetchStep(step: number): Promise<StepResponse> {
    const response = await fetch('/api/step', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ step }),
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.status === 'error') {
        throw new Error(data.message);
    }

    return data;
}

/**
 * Validate code or pattern syntax
 * @param code - The code to validate
 * @param lang - The language (e.g., 'python')
 * @returns Validation result
 */
export async function validateCode(code: string, lang: string): Promise<ValidationResponse> {
    const response = await fetch('/api/validate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, lang }),
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
}

/**
 * Fetch graph data for pattern or code visualization
 * @param code - The code to generate a graph for
 * @param type - Whether it's 'pattern' or 'code'
 * @returns Graph data for Cytoscape
 */
export async function fetchGraph(code: string, type: 'pattern' | 'code'): Promise<GraphResponse> {
    const response = await fetch(`/api/${type}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.status === 'error') {
        throw new Error(data.message);
    }

    return data;
}

