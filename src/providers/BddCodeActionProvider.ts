import * as vscode from 'vscode';
import { GherkinParser } from '../core/GherkinParser';
import { SnippetGenerator } from '../core/SnippetGenerator';

export class BddCodeActionProvider implements vscode.CodeActionProvider {
    constructor(
        private parser: GherkinParser,
        private generator: SnippetGenerator
    ) {}

    provideCodeActions(document: vscode.TextDocument, range: vscode.Range): vscode.CodeAction[] | undefined {
        const line = document.lineAt(range.start.line).text.trim();
        
        const parsedStep = this.parser.parseLine(line);
        if (!parsedStep) return undefined;

        const snippet = this.generator.generateTypeScript(parsedStep);

        const action = new vscode.CodeAction(`⚡ Generează Step: "${parsedStep.stepText}"`, vscode.CodeActionKind.QuickFix);
        action.command = {
            command: 'bdd-step-architect.copySnippet',
            title: 'Copy Snippet',
            arguments: [snippet]
        };

        return [action];
    }
}