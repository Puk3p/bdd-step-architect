import * as vscode from 'vscode';
import { IAnimationService } from '../interfaces';

export class AnimationService implements IAnimationService {
    public async typewriterInsert(editor: vscode.TextEditor, startLine: number, body: string): Promise<number> {
        let currentLine = startLine;
        const lines = body.split('\n');

        for (const line of lines) {
            await editor.edit(editBuilder => {
                editBuilder.insert(new vscode.Position(currentLine, 0), line + '\n');
            });
            currentLine++;
            await new Promise(resolve => setTimeout(resolve, 150));
        }

        return currentLine;
    }

    public colorMorph(editor: vscode.TextEditor, startLine: number, endLine: number): void {
        const morphRange = new vscode.Range(startLine, 0, endLine, 0);

        const colors = [
            'rgba(0, 255, 128, 0.4)',
            'rgba(0, 191, 255, 0.3)',
            'rgba(138, 43, 226, 0.2)',
            'transparent'
        ];

        let colorIndex = 0;
        let currentDecoration: vscode.TextEditorDecorationType | null = null;

        const morphInterval = setInterval(() => {
            if (currentDecoration) {
                currentDecoration.dispose(); 
            }

            const isLast = colorIndex === colors.length - 1;
            currentDecoration = vscode.window.createTextEditorDecorationType({
                backgroundColor: colors[colorIndex],
                isWholeLine: true,
                after: isLast ? undefined : {
                    contentText: ' ✨ crafted by Endava & Lupu George',
                    color: 'rgba(150, 150, 150, 0.8)',
                    fontStyle: 'italic',
                    margin: '0 0 0 20px'
                }
            });

            editor.setDecorations(currentDecoration, [morphRange]);
            colorIndex++;

            if (colorIndex >= colors.length) {
                clearInterval(morphInterval);
                setTimeout(() => { if (currentDecoration) currentDecoration.dispose(); }, 800);
            }
        }, 500);
    }
}
