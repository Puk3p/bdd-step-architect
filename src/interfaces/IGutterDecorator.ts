import * as vscode from 'vscode';

export interface IGutterDecorator {
    decorate(editor: vscode.TextEditor | undefined): void;
}
