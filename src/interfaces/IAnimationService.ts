import * as vscode from 'vscode';

export interface IAnimationService {
    typewriterInsert(editor: vscode.TextEditor, startLine: number, body: string): Promise<number>;
    colorMorph(editor: vscode.TextEditor, startLine: number, endLine: number): void;
}
