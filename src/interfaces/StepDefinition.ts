import * as vscode from 'vscode';

export interface StepDefinition {
    type: string;
    pattern: string;
    location?: vscode.Location;
}
