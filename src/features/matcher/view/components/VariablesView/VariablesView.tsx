import React from 'react';
import ExpandableCard from '../../../../../common/components/expandable-card/ExpandableCard';
import { useAppDispatch } from '../../../../../common/hooks';
import { setSelectedNodeId } from '../../../matcherSlice';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import './VariablesView.css';

interface VariablesViewProps {
    variables: any;
    previousVariables: any;
}

interface VarEntry {
    type: 'added' | 'removed' | 'stayed';
    name: string;
    data?: any;
    raw?: string;
}

const VariablesView: React.FC<VariablesViewProps> = ({ variables, previousVariables }) => {
    const dispatch = useAppDispatch();

    /**
     * Recursively reconstructs the code from the node structure.
     */
    const reconstructCode = (node: any): string => {
        if (!node) return '';
        if (node.symbol !== undefined && node.symbol !== null) {
            return String(node.symbol);
        }
        if (Array.isArray(node.children) && node.children.length > 0) {
            return node.children
                .map((child: any) => reconstructCode(child))
                .filter((s: string) => s.length > 0)
                .join(' ');
        }
        return '';
    };

    const parseVariable = (varStr: any): { name: string; data?: any; raw?: string } | null => {
        try {
            if (typeof varStr === 'object' && varStr !== null) {
                const keys = Object.keys(varStr);
                if (keys.length === 1 && typeof varStr[keys[0]] === 'object') {
                    return { name: keys[0], data: varStr[keys[0]] };
                }
                return { name: varStr.name || 'Variable', data: varStr };
            }
            if (typeof varStr !== 'string') return null;
            
            const colonIndex = varStr.indexOf(': ');
            if (colonIndex !== -1) {
                const name = varStr.substring(0, colonIndex).trim();
                const jsonPart = varStr.substring(colonIndex + 2).trim();
                
                let normalizedJson = jsonPart.replace(/'/g, '"');
                normalizedJson = normalizedJson.replace(/\((\d+),\s*(\d+)\)/g, '[$1, $2]');

                try {
                    const parsed = JSON.parse(normalizedJson);
                    return { name, data: parsed };
                } catch (e) {
                    return { name, raw: jsonPart };
                }
            }
            return { name: 'Variable', raw: varStr };
        } catch (e) {
            return null;
        }
    };

    const filterObject = (obj: any) => {
        if (!obj || typeof obj !== 'object') return obj;
        const filtered: any = {};
        const excludedFields = ['id', 'start', 'end'];
        Object.keys(obj).forEach(key => {
            if (!excludedFields.includes(key)) {
                filtered[key] = obj[key];
            }
        });
        return filtered;
    };

    const ensureArray = (vars: any): any[] => {
        if (!vars) return [];
        if (Array.isArray(vars)) return vars;
        if (typeof vars === 'string' && vars.trim().startsWith('[')) {
            try {
                const parsed = JSON.parse(vars);
                if (Array.isArray(parsed)) return parsed;
            } catch (e) {}
        }
        return [];
    };

    const currentVars = ensureArray(variables);
    const prevVars = ensureArray(previousVariables);

    const parsedCurrent = currentVars.map(v => parseVariable(v)).filter(v => v !== null) as { name: string; data?: any; raw?: string }[];
    const parsedPrev = prevVars.map(v => parseVariable(v)).filter(v => v !== null) as { name: string; data?: any; raw?: string }[];

    const currentNames = new Set(parsedCurrent.map(v => v.name));
    const prevNames = new Set(parsedPrev.map(v => v.name));

    const allVarEntries: VarEntry[] = [];

    // Stayed and Added
    parsedCurrent.forEach(v => {
        if (prevNames.has(v.name)) {
            allVarEntries.push({ type: 'stayed', ...v });
        } else {
            allVarEntries.push({ type: 'added', ...v });
        }
    });

    // Removed
    parsedPrev.forEach(v => {
        if (!currentNames.has(v.name)) {
            allVarEntries.push({ type: 'removed', ...v });
        }
    });

    const sortedEntries = allVarEntries.sort((a, b) => {
        const order = { stayed: 0, added: 1, removed: 2 };
        return order[a.type] - order[b.type];
    });

    const handleFocusNode = (id: string) => {
        dispatch(setSelectedNodeId({ id: String(id), type: 'code' }));
        // Reset after a short delay so clicking again triggers effect
        setTimeout(() => {
            dispatch(setSelectedNodeId(null));
        }, 1000);
    };

    return (
        <div className="variables-view-container">
            <h3>Variables Mapping ({parsedCurrent.length})</h3>
            <div className="variables-list">
                {sortedEntries.length === 0 && (
                    <div className="p-3 text-center border rounded bg-white">
                        <p className="text-muted mb-0">No variables mapped in this step.</p>
                    </div>
                )}
                {sortedEntries.map((entry, index) => {
                    const codePreview = entry.data ? reconstructCode(entry.data) : '';
                    const nodeId = entry.data?.id;
                    
                    let cardClass = "";
                    let headerStyle = {};
                    let badge = null;

                    if (entry.type === 'added') {
                        cardClass = "border-success bg-success-subtle";
                        badge = <span className="badge bg-success me-2">Added</span>;
                    } else if (entry.type === 'removed') {
                        cardClass = "border-danger bg-danger-subtle opacity-75";
                        headerStyle = { color: '#6c757d' };
                        badge = <span className="badge bg-danger me-2">Removed</span>;
                    }

                    return (
                        <ExpandableCard
                            key={`${entry.name}-${index}`}
                            title={
                                <div className="d-flex flex-column" style={headerStyle}>
                                    <div className="d-flex align-items-center">
                                        {badge}
                                        <span className="fw-bold">{entry.name}</span>
                                    </div>
                                    {codePreview && (
                                        <code className={`mt-1 p-1 rounded ${entry.type === 'removed' ? 'bg-secondary text-light' : 'bg-dark text-white'}`} style={{ fontSize: '0.9rem', width: 'fit-content' }}>
                                            {codePreview}
                                        </code>
                                    )}
                                </div>
                            }
                            subtitle={entry.data?.name || ''}
                            ableToOpen={true}
                            postfixIcon={nodeId ? faSearch : undefined}
                            onPostfixAction={nodeId ? () => handleFocusNode(nodeId) : undefined}
                            postfixTooltip="Focus node in code graph"
                            expandedContent={
                                <div className="variable-details">
                                    <pre className="m-0" style={{ fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}>
                                        {entry.raw ? entry.raw : JSON.stringify(filterObject(entry.data), null, 2)}
                                    </pre>
                                </div>
                            }
                            className={`mb-2 ${cardClass}`}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default VariablesView;
