// highlightRange.ts
import { EditorView, Decoration, DecorationSet, ViewPlugin } from '@codemirror/view';
import { RangeSetBuilder, Extension } from '@codemirror/state';

export function highlightRange(start: number, end: number): Extension {
  return ViewPlugin.fromClass(class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = this.buildDecorations(view);
    }

    update(update: any) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = this.buildDecorations(update.view);
      }
    }

    buildDecorations(view: EditorView): DecorationSet {
        const builder = new RangeSetBuilder<Decoration>();
        const doc = view.state.doc;
        const docLength = doc.length;

        const from = Math.max(0, Math.min(start, docLength));
        let to = Math.max(0, Math.min(end, docLength));

        // Trim trailing whitespace from highlight
        while (to > from && /\s/.test(doc.slice(to - 1, to).toString())) {
            to--;
        }

        if (from < to) {
            builder.add(from, to, Decoration.mark({
            class: 'cm-highlight-range'
            }));
        }

        return builder.finish();
    }
  }, {
    decorations: v => v.decorations
  });
}
