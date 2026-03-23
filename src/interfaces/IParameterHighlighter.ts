import * as vscode from 'vscode';

export interface IParameterHighlighter {
    highlight(editor: vscode.TextEditor | undefined): void;
}
