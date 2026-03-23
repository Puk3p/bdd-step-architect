import * as vscode from 'vscode';
import { IStepScanner } from '../interfaces';

export class DeadCodeSweeper {
    constructor(private scanner: IStepScanner) {}

    public async findUnusedSteps() {
        vscode.window.showInformationMessage('Scanning project for dead code... Please wait.');

        const allSteps = this.scanner.getSteps();
        if (allSteps.length === 0) {
            vscode.window.showWarningMessage('No step definitions found in TypeScript.');
            return;
        }

        const featureFiles = await vscode.workspace.findFiles('**/*.feature', '**/node_modules/**');
        const usedStepLines: string[] = [];

        for (const file of featureFiles) {
            const doc = await vscode.workspace.openTextDocument(file);
            const text = doc.getText();
            const lines = text.split('\n');

            for (let line of lines) {
                line = line.trim();
                if (/^(Given|When|Then|And|But)\s+/.test(line)) {
                    const stepText = line.replace(/^(Given|When|Then|And|But)\s+/, '');
                    usedStepLines.push(stepText);
                }
            }
        }

        const unusedSteps = [];

        for (const step of allSteps) {
            try {
                const regex = new RegExp(step.pattern);
                let isUsed = false;

                for (const usedLine of usedStepLines) {
                    if (regex.test(usedLine)) {
                        isUsed = true;
                        break;
                    }
                }

                if (!isUsed) {
                    unusedSteps.push(step);
                }
            } catch {
                console.error(`Error processing regex for step: ${step.pattern}`);
            }
        }

        const outputChannel = vscode.window.createOutputChannel('BDD Dead Code Sweeper');
        outputChannel.clear();
        outputChannel.show(true);

        outputChannel.appendLine('🧹 BDD STEP ARCHITECT: DEAD CODE REPORT 🧹');
        outputChannel.appendLine('==================================================');
        outputChannel.appendLine(`Feature files scanned: ${featureFiles.length}`);
        outputChannel.appendLine(`Total implemented steps: ${allSteps.length}`);
        outputChannel.appendLine(`Unused steps found:     ${unusedSteps.length}`);
        outputChannel.appendLine('==================================================\n');

        if (unusedSteps.length === 0) {
            outputChannel.appendLine('All steps are in use. No dead code found.');
        } else {
            outputChannel.appendLine('The following steps can be safely removed from the project:\n');
            for (const step of unusedSteps) {
                const filePath = step.location ? vscode.workspace.asRelativePath(step.location.uri) : 'unknown file';
                const cleanPattern = step.pattern.replace(/^\^|\$$/g, '').replace(/\\"/g, '"');

                outputChannel.appendLine(`[${step.type?.trim()}] ${cleanPattern}`);
                outputChannel.appendLine(`  Found in: ${filePath}`);
                outputChannel.appendLine('--------------------------------------------------');
            }
        }
    }
}
