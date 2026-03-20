import * as vscode from 'vscode';
import { BddCodeActionProvider } from './providers/BddCodeActionProvider';
import { GherkinParser } from './core/GherkinParser';
import { SnippetGenerator } from './core/SnippetGenerator';

export function activate(context: vscode.ExtensionContext) {
    console.log('✅ BDD Step Architect Pro (SOLID) a pornit!');

    const parser = new GherkinParser();
    const generator = new SnippetGenerator();
    const actionProvider = new BddCodeActionProvider(parser, generator);

    const copyCommand = vscode.commands.registerCommand('bdd-step-architect.copySnippet', async (snippet: string) => {
        await vscode.env.clipboard.writeText(snippet);
        vscode.window.showInformationMessage('✅ Boilerplate copiat în clipboard!');
    });

    const quickFixProvider = vscode.languages.registerCodeActionsProvider(
        { pattern: '**/*.feature' },
        actionProvider,
        { providedCodeActionKinds: [vscode.CodeActionKind.QuickFix] }
    );

    context.subscriptions.push(copyCommand, quickFixProvider);
}

export function deactivate() {}