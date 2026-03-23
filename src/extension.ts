import * as vscode from 'vscode';
import { InsertStepCommandHandler } from './commands/InsertStepCommandHandler';
import { GherkinParser } from './core/GherkinParser';
import { SnippetGenerator } from './core/SnippetGenerator';
import { StepScanner } from './core/StepScanner';
import { BddCodeActionProvider } from './providers/BddCodeActionProvider';
import { BddCodeLensProvider } from './providers/BddCodeLensProvider';
import { BddCompletionProvider } from './providers/BddCompletionProvider';
import { BddDefinitionProvider } from './providers/BddDefinitionProvider';
import { AnimationService } from './services/AnimationService';
import { ConfigProvider } from './services/ConfigProvider';
import { FeatureScanner } from './services/FeatureScanner';
import { FileSelector } from './services/FileSelector';
import { GutterDecorator } from './services/GutterDecorator';
import { ImportResolver } from './services/ImportResolver';
import { ParameterHighlighter } from './services/ParameterHighlighter';

export async function activate(context: vscode.ExtensionContext) {
    console.log('BDD Step Architect Pro initialized successfully.');

    const configProvider = new ConfigProvider();
    const parser = new GherkinParser();
    const generator = new SnippetGenerator(configProvider);
    const scanner = new StepScanner();
    const fileSelector = new FileSelector();
    const importResolver = new ImportResolver(configProvider);
    const animationService = new AnimationService();
    const featureScanner = new FeatureScanner();

    const commandHandler = new InsertStepCommandHandler(generator, fileSelector, importResolver, animationService);
    const actionProvider = new BddCodeActionProvider(parser, generator);

    await scanner.scanWorkspace();
    const completionProvider = new BddCompletionProvider(scanner);

    const highlighter = new ParameterHighlighter();
    const gutterDecorator = new GutterDecorator();

    if (vscode.window.activeTextEditor) {
        highlighter.highlight(vscode.window.activeTextEditor);
        gutterDecorator.decorate(vscode.window.activeTextEditor);
    }

    const activeEditorChange = vscode.window.onDidChangeActiveTextEditor((editor) => {
        highlighter.highlight(editor);
        gutterDecorator.decorate(editor);
    });

    const documentChange = vscode.workspace.onDidChangeTextDocument((event) => {
        if (vscode.window.activeTextEditor && event.document === vscode.window.activeTextEditor.document) {
            highlighter.highlight(vscode.window.activeTextEditor);
            gutterDecorator.decorate(vscode.window.activeTextEditor);
        }
    });

    const tsWatcher = vscode.workspace.createFileSystemWatcher('**/*.ts');
    tsWatcher.onDidChange(async () => await scanner.scanWorkspace());
    tsWatcher.onDidCreate(async () => await scanner.scanWorkspace());
    tsWatcher.onDidDelete(async () => await scanner.scanWorkspace());

    const insertCommand = vscode.commands.registerCommand('bdd-step-architect.insertStep', async (parsedStep: any) => {
        await commandHandler.execute(parsedStep);
    });

    const showUsagesCommand = vscode.commands.registerCommand(
        'bdd-step-architect.showStepUsages',
        async (uri: vscode.Uri, position: vscode.Position, locations: vscode.Location[]) => {
            await vscode.commands.executeCommand('editor.action.showReferences', uri, position, locations);
        },
    );

    const quickFixProvider = vscode.languages.registerCodeActionsProvider({ pattern: '**/*.feature' }, actionProvider, {
        providedCodeActionKinds: [vscode.CodeActionKind.QuickFix],
    });

    const autoCompletion = vscode.languages.registerCompletionItemProvider(
        { pattern: '**/*.feature' },
        completionProvider,
        ' ',
    );

    const codeLensProvider = new BddCodeLensProvider(featureScanner);
    const codeLensRegistration = vscode.languages.registerCodeLensProvider({ pattern: '**/*.ts' }, codeLensProvider);

    const definitionProvider = vscode.languages.registerDefinitionProvider(
        { pattern: '**/*.feature' },
        new BddDefinitionProvider(),
    );

    context.subscriptions.push(
        insertCommand,
        showUsagesCommand,
        quickFixProvider,
        autoCompletion,
        tsWatcher,
        codeLensRegistration,
        definitionProvider,
        activeEditorChange,
        documentChange,
    );
}

export function deactivate() {}
