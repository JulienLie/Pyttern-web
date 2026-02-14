import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { Extension } from '@codemirror/state';
import { Decoration, DecorationSet, ViewPlugin, EditorView } from '@codemirror/view';
import { RangeSetBuilder } from '@codemirror/state';

function getLangExtension(lang: string): Extension[] {
    const normalized = (lang || '').toLowerCase();
    if (normalized === 'java' || normalized === 'jat') return [java()];
    return [python()];
}

function highlightErrorLine(lineNumber: number): Extension {
    if (!(lineNumber >= 1)) return [];
    return ViewPlugin.fromClass(
        class {
            decorations: DecorationSet;
            constructor(view: EditorView) {
                this.decorations = this.build(view);
            }
            update(update: { docChanged: boolean; view: EditorView }) {
                if (update.docChanged) this.decorations = this.build(update.view);
            }
            build(view: EditorView): DecorationSet {
                const builder = new RangeSetBuilder<Decoration>();
                const doc = view.state.doc;
                const lineNum = Math.min(Math.max(1, lineNumber), doc.lines);
                const line = doc.line(lineNum);
                builder.add(line.from, line.from, Decoration.line({ attributes: { class: 'cm-error-line' } }));
                return builder.finish();
            }
        },
        { decorations: (v) => v.decorations }
    );
}

export interface CodeViewProps {
    code: string;
    lang: string;
    /** 1-based line number to highlight (e.g. validation error line). Omit or pass &lt; 1 for no highlight. */
    errorLine?: number | null;
}

export function CodeView({ code, lang, errorLine }: CodeViewProps) {
    const extensions: Extension[] = [
        ...getLangExtension(lang),
        ...(errorLine != null && errorLine >= 1 ? [highlightErrorLine(errorLine)] : []),
    ];

    return (
        <div className="file-code-view-wrapper">
            <CodeMirror
                value={code}
                extensions={extensions}
                editable={false}
                readOnly={true}
                basicSetup={{
                    lineNumbers: true,
                    foldGutter: false,
                    highlightActiveLine: false,
                    highlightSelectionMatches: false,
                }}
            />
        </div>
    );
}

export default CodeView;
