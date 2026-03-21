import * as vscode from 'vscode';

export interface IFileSelector {
    selectTargetFile(): Promise<vscode.Uri | undefined>;
}
