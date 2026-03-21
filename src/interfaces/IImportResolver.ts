import * as vscode from 'vscode';

export interface IImportResolver {
    resolveImports(document: vscode.TextDocument, targetUri: vscode.Uri, stepType: string): Promise<void>;
}
