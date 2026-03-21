import * as vscode from 'vscode';

export interface IFeatureScanner {
    getStepUsage(regexPattern: RegExp): Promise<{ count: number; lastUsedFile: string; locations: vscode.Location[] }>;
}
