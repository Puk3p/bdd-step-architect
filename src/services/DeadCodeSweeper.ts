import * as vscode from 'vscode';
import { IStepScanner } from '../interfaces';

export class DeadCodeSweeper {
    private diagnosticCollection: vscode.DiagnosticCollection | undefined;

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
                const isCucumberExpr = /\{(int|float|string|word)\}/.test(step.pattern);
                let regexStr = step.pattern;

                if (isCucumberExpr) {
                    regexStr = regexStr
                        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
                        .replace(/\\{int\\}/g, '\\d+')
                        .replace(/\\{float\\}/g, '\\d+\\.?\\d*')
                        .replace(/\\{string\\}/g, '"[^"]*"')
                        .replace(/\\{word\\}/g, '\\w+');
                }

                const regex = new RegExp(regexStr);
                let isUsed = false;

                for (const usedLine of usedStepLines) {
                    if (regex.test(usedLine)) {
                        isUsed = true;
                        break;
                    }

                    if (/<[^>]+>/.test(usedLine)) {
                        const featureRegexStr = usedLine
                            .replace(/<[^>]+>/g, '\x00WILDCARD\x00')
                            .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
                            .replace(/\x00WILDCARD\x00/g, '.*');
                        try {
                            const featureRegex = new RegExp(`^${featureRegexStr}$`);
                            const stepClean = regexStr.replace(/^\^/, '').replace(/\$$/, '');
                            if (featureRegex.test(stepClean)) {
                                isUsed = true;
                                break;
                            }
                        } catch {}
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

        if (!this.diagnosticCollection) {
            this.diagnosticCollection = vscode.languages.createDiagnosticCollection('bdd-dead-code');
        }
        this.diagnosticCollection.clear();

        if (unusedSteps.length === 0) {
            outputChannel.appendLine('All steps are in use. No dead code found.');
        } else {
            outputChannel.appendLine('The following steps can be safely removed from the project:\n');

            const diagnosticMap = new Map<string, vscode.Diagnostic[]>();

            for (const step of unusedSteps) {
                const cleanPattern = step.pattern.replace(/^\^|\$$/g, '').replace(/\\"/g, '"');

                if (step.location) {
                    const uri = step.location.uri.toString();
                    const filePath = vscode.workspace.asRelativePath(step.location.uri);
                    const line = step.location.range.start.line;

                    outputChannel.appendLine(`[${step.type?.trim()}] ${cleanPattern}`);
                    outputChannel.appendLine(`  📍 ${filePath}:${line + 1}`);
                    outputChannel.appendLine('--------------------------------------------------');

                    const diagnostic = new vscode.Diagnostic(
                        step.location.range,
                        `Unused step: [${step.type?.trim()}] ${cleanPattern}`,
                        vscode.DiagnosticSeverity.Information,
                    );
                    diagnostic.source = 'BDD Dead Code';

                    if (!diagnosticMap.has(uri)) {
                        diagnosticMap.set(uri, []);
                    }
                    diagnosticMap.get(uri)!.push(diagnostic);
                } else {
                    outputChannel.appendLine(`[${step.type?.trim()}] ${cleanPattern}`);
                    outputChannel.appendLine(`  Found in: unknown file`);
                    outputChannel.appendLine('--------------------------------------------------');
                }
            }

            for (const [uriStr, diagnostics] of diagnosticMap) {
                this.diagnosticCollection.set(vscode.Uri.parse(uriStr), diagnostics);
            }

            outputChannel.appendLine(
                `\n💡 Check the Problems panel (Ctrl+Shift+M) to click and navigate to each unused step.`,
            );
        }
    }
}
