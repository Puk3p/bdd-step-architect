import * as vscode from 'vscode';
import { IGutterDecorator } from '../interfaces';

export class GutterDecorator implements IGutterDecorator {
    private givenDecoration = vscode.window.createTextEditorDecorationType({
        isWholeLine: true,
        borderWidth: '0 0 0 4px',
        borderStyle: 'solid',
        borderColor: '#2196F3',
        overviewRulerColor: '#2196F3',
        overviewRulerLane: vscode.OverviewRulerLane.Left,
    });

    private whenDecoration = vscode.window.createTextEditorDecorationType({
        isWholeLine: true,
        borderWidth: '0 0 0 4px',
        borderStyle: 'solid',
        borderColor: '#FFC107',
        overviewRulerColor: '#FFC107',
        overviewRulerLane: vscode.OverviewRulerLane.Left,
    });

    private thenDecoration = vscode.window.createTextEditorDecorationType({
        isWholeLine: true,
        borderWidth: '0 0 0 4px',
        borderStyle: 'solid',
        borderColor: '#4CAF50',
        overviewRulerColor: '#4CAF50',
        overviewRulerLane: vscode.OverviewRulerLane.Left,
    });

    public decorate(editor: vscode.TextEditor | undefined) {
        if (!editor || editor.document.languageId !== 'typescript') {
            return;
        }

        const text = editor.document.getText();
        const givenRanges: vscode.Range[] = [];
        const whenRanges: vscode.Range[] = [];
        const thenRanges: vscode.Range[] = [];

        const regex = /\b(Given|When|Then)\s*\(/g;
        let match;

        while ((match = regex.exec(text)) !== null) {
            const keyword = match[1];

            const startPos = editor.document.positionAt(match.index);
            const range = new vscode.Range(startPos.line, 0, startPos.line, 0);

            if (keyword === 'Given') {
                givenRanges.push(range);
            } else if (keyword === 'When') {
                whenRanges.push(range);
            } else if (keyword === 'Then') {
                thenRanges.push(range);
            }
        }

        editor.setDecorations(this.givenDecoration, givenRanges);
        editor.setDecorations(this.whenDecoration, whenRanges);
        editor.setDecorations(this.thenDecoration, thenRanges);
    }
}
