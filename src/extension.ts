import * as vscode from 'vscode';
import { BddCodeActionProvider } from './providers/BddCodeActionProvider';
import { BddCompletionProvider } from './providers/BddCompletionProvider';
import { GherkinParser } from './core/GherkinParser';
import { SnippetGenerator } from './core/SnippetGenerator';
import { StepScanner } from './core/StepScanner';

export async function activate(context: vscode.ExtensionContext) {
    console.log('BDD Step Architect Pro initialized successfully.');

    const parser = new GherkinParser();
    const generator = new SnippetGenerator();
    const actionProvider = new BddCodeActionProvider(parser, generator);
    
    const scanner = new StepScanner();
    await scanner.scanWorkspace(); 
    const completionProvider = new BddCompletionProvider(scanner);

    const tsWatcher = vscode.workspace.createFileSystemWatcher('**/*.ts');
    
    tsWatcher.onDidChange(async () => {
        console.log('TypeScript file modified. Rescanning workspace steps...');
        await scanner.scanWorkspace();
    });
    
    tsWatcher.onDidCreate(async () => {
        console.log('New TypeScript file created. Rescanning workspace steps...');
        await scanner.scanWorkspace();
    });
    
    tsWatcher.onDidDelete(async () => {
        console.log('TypeScript file deleted. Rescanning workspace steps...');
        await scanner.scanWorkspace();
    });

    const copyCommand = vscode.commands.registerCommand('bdd-step-architect.copySnippet', async (snippet: string) => {
        await vscode.env.clipboard.writeText(snippet);
        vscode.window.showInformationMessage('Boilerplate code copied to clipboard.');
    });

    const quickFixProvider = vscode.languages.registerCodeActionsProvider(
        { pattern: '**/*.feature' },
        actionProvider,
        { providedCodeActionKinds: [vscode.CodeActionKind.QuickFix] }
    );

    const autoCompletion = vscode.languages.registerCompletionItemProvider(
        { pattern: '**/*.feature' },
        completionProvider,
        ' '
    );

    context.subscriptions.push(copyCommand, quickFixProvider, autoCompletion, tsWatcher);
}

export function deactivate() {}