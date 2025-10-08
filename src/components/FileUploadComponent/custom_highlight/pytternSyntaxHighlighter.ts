import { pythonLanguage } from '@codemirror/lang-python';
import { LanguageSupport, indentService } from '@codemirror/language';
import { ViewPlugin, Decoration, DecorationSet } from '@codemirror/view';
import { RangeSetBuilder } from '@codemirror/state';

/**
 * Custom syntax highlighting for `?` and `?:`
 */
const questionSyntaxHighlighter = ViewPlugin.fromClass(class {
  decorations: DecorationSet;

  constructor(view: any) {
    this.decorations = this.buildDecorations(view);
  }

  update(update: any) {
    if (update.docChanged || update.viewportChanged) {
      this.decorations = this.buildDecorations(update.view);
    }
  }

  buildDecorations(view: any): DecorationSet {
    const builder = new RangeSetBuilder<Decoration>();
    const regex = /\?(?:[a-zA-Z]+|:?)\*?/g;

    for (const { from, to } of view.visibleRanges) {
      const text = view.state.doc.sliceString(from, to);
      let match: RegExpExecArray | null;
      while ((match = regex.exec(text)) !== null) {
        const start = from + match.index;
        const end = start + match[0].length;
        builder.add(start, end, Decoration.mark({
          class: "wildcard"
        }));
      }
    }

    return builder.finish();
  }
}, {
  decorations: (v) => v.decorations,
});

/**
 * Indentation: support `?:` + fallback to existing indentation rules
 */
const questionIndentExtension = indentService.of((context, pos) => {
  const line = context.lineAt(pos - 1).text.trimEnd();

  // Custom rule for our `?:`
  if (line.endsWith(':') || line.endsWith(':*')) {
    return context.lineIndent(pos - 1) + context.unit;
  }

  // Fallback to default (Python) indentation
  return null;
});

/**
 * Combined language support
 */
export const pytternExtension = new LanguageSupport(pythonLanguage, [
  questionIndentExtension,
  questionSyntaxHighlighter
]);
