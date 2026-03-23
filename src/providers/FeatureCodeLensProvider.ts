import * as vscode from 'vscode';
import { IStepScanner } from '../interfaces';

export class FeatureCodeLensProvider implements vscode.CodeLensProvider {
    constructor(private scanner: IStepScanner) {}

    public provideCodeLenses(document: vscode.TextDocument, _token: vscode.CancellationToken): vscode.CodeLens[] {
        const lenses: vscode.CodeLens[] = [];
        const lines = document.getText().split('\n');
        const existingSteps = this.scanner.getSteps();

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            if (line.startsWith('Scenario:') || line.startsWith('Scenario Outline:')) {
                const missingSteps: string[] = [];
                let j = i + 1;

                while (j < lines.length) {
                    const stepLine = lines[j].trim();
                    if (stepLine.startsWith('Scenario:') || stepLine.startsWith('Rule:')) {
                        break;
                    }

                    const match = stepLine.match(/^(Given|When|Then|And|But)\s+(.*)/);
                    if (match) {
                        const stepText = match[2];
                        let isFound = false;

                        for (const existing of existingSteps) {
                            try {
                                const regex = new RegExp(existing.pattern);
                                if (regex.test(stepText)) {
                                    isFound = true;
                                    break;
                                }
                            } catch {}
                        }

                        if (!isFound) {
                            missingSteps.push(stepLine);
                        }
                    }
                    j++;
                }

                if (missingSteps.length > 0) {
                    const range = new vscode.Range(i, 0, i, lines[i].length);
                    const lens = new vscode.CodeLens(range, {
                        title: `✨ Generate ${missingSteps.length} Missing Steps`,
                        command: 'bdd-step-architect.generateBulkSteps',
                        arguments: [missingSteps],
                    });
                    lenses.push(lens);
                }
            }
        }

        return lenses;
    }
}
