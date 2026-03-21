import * as vscode from 'vscode';
import { StepScanner } from '../core/StepScanner';

export class BddCompletionProvider implements vscode.CompletionItemProvider {
    constructor(private scanner: StepScanner) {}

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
        
        const linePrefix = document.lineAt(position).text.substring(0, position.character);
        
        const match = linePrefix.match(/^\s*(Given|When|Then|And|But)\s+/);
        if (!match) {
            return undefined;
        }

        const steps = this.scanner.getSteps();
        const completions: vscode.CompletionItem[] = [];

        for (const step of steps) {
            const cleanText = step.pattern.replace(/^\^|\$$/g, '').replace(/\\"/g, '"');

            const completion = new vscode.CompletionItem(cleanText, vscode.CompletionItemKind.Snippet);
            completion.detail = `${step.type} (existent în proiect)`;
            completion.insertText = cleanText;

            completions.push(completion);
        }

        return completions;
    }
}