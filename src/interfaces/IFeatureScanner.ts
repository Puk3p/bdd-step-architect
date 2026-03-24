import * as vscode from 'vscode';

export interface IFeatureScanner {
    scanWorkspace(): Promise<void>;
    getStepUsage(regexPattern: RegExp): Promise<{ count: number; lastUsedFile: string; locations: vscode.Location[] }>;
}
