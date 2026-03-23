import * as vscode from 'vscode';

export class ParameterHighlighter {
    private paramDecoration = vscode.window.createTextEditorDecorationType({
        color: '#FF9800',
        fontWeight: 'bold',
    });

    private variableDecoration = vscode.window.createTextEditorDecorationType({
        color: '#00BCD4',
        fontStyle: 'italic',
    });

    public highlight(editor: vscode.TextEditor | undefined) {
        if (!editor || editor.document.languageId !== 'feature') {
            return;
        }

        const paramRanges: vscode.Range[] = [];
        const variableRanges: vscode.Range[] = [];

        for (let i = 0; i < editor.document.lineCount; i++) {
            const line = editor.document.lineAt(i);
            const lineText = line.text;

            if (lineText.trim().startsWith('#')) {
                continue;
            }

            let match;

            const stringRegex = /"([^"\\]|\\.)*"|'([^'\\]|\\.)*'/g;
            while ((match = stringRegex.exec(lineText)) !== null) {
                paramRanges.push(new vscode.Range(i, match.index, i, match.index + match[0].length));
            }

            const numberRegex = /\b\d+(\.\d+)?\b/g;
            while ((match = numberRegex.exec(lineText)) !== null) {
                paramRanges.push(new vscode.Range(i, match.index, i, match.index + match[0].length));
            }

            const varRegex = /<[^>]+>/g;
            while ((match = varRegex.exec(lineText)) !== null) {
                variableRanges.push(new vscode.Range(i, match.index, i, match.index + match[0].length));
            }

            if (lineText.trim().startsWith('|')) {
                const tableCellRegex = /\|([^|]+)/g;
                while ((match = tableCellRegex.exec(lineText)) !== null) {
                    const cellContent = match[1];
                    const trimmedContent = cellContent.trim();

                    if (trimmedContent.length > 0) {
                        const startOffset = match.index + 1 + cellContent.indexOf(trimmedContent);

                        paramRanges.push(new vscode.Range(i, startOffset, i, startOffset + trimmedContent.length));
                    }
                }
            }
        }

        editor.setDecorations(this.paramDecoration, paramRanges);
        editor.setDecorations(this.variableDecoration, variableRanges);
    }
}
