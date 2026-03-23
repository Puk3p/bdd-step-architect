import * as vscode from 'vscode';
import { BulkGenerateCommandHandler } from './commands/BulkGenerateCommandHandler';
import { InsertStepCommandHandler } from './commands/InsertStepCommandHandler';
import { JumpToStepCommandHandler } from './commands/JumpToStepCommandHandler';
import { OpenTestDataCommandHandler } from './commands/OpenTestDataCommandHandler';
import { RenameStepCommandHandler } from './commands/RenameStepCommandHandler';
import { GherkinParser } from './core/GherkinParser';
import { SnippetGenerator } from './core/SnippetGenerator';
import { StepScanner } from './core/StepScanner';
import { BddCodeActionProvider } from './providers/BddCodeActionProvider';
import { BddCodeLensProvider } from './providers/BddCodeLensProvider';
import { BddCompletionProvider } from './providers/BddCompletionProvider';
import { BddDefinitionProvider } from './providers/BddDefinitionProvider';
import { BddStepCatalogProvider } from './providers/BddStepCatalogProvider';
import { FeatureCodeLensProvider } from './providers/FeatureCodeLensProvider';
import { TestDataLinkProvider } from './providers/TestDataLinkProvider';
import { AnimationService } from './services/AnimationService';
import { ConfigProvider } from './services/ConfigProvider';
import { DeadCodeSweeper } from './services/DeadCodeSweeper';
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
    const highlighter = new ParameterHighlighter();
    const gutterDecorator = new GutterDecorator();

    await scanner.scanWorkspace();

    const catalogProvider = new BddStepCatalogProvider(scanner);
    const insertHandler = new InsertStepCommandHandler(generator, fileSelector, importResolver, animationService);
    const jumpHandler = new JumpToStepCommandHandler();
    const renameHandler = new RenameStepCommandHandler(() => catalogProvider.refresh());
    const bulkHandler = new BulkGenerateCommandHandler(parser, generator, fileSelector, scanner);
    const openTestDataHandler = new OpenTestDataCommandHandler();
    const sweeper = new DeadCodeSweeper(scanner);
    const actionProvider = new BddCodeActionProvider(parser, generator);
    const completionProvider = new BddCompletionProvider(scanner);

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
    const rescanAndRefresh = async () => {
        await scanner.scanWorkspace();
        catalogProvider.refresh();
    };
    tsWatcher.onDidChange(rescanAndRefresh);
    tsWatcher.onDidCreate(rescanAndRefresh);
    tsWatcher.onDidDelete(rescanAndRefresh);

    context.subscriptions.push(
        vscode.commands.registerCommand('bdd-step-architect.insertStep', (parsedStep: any) =>
            insertHandler.execute(parsedStep),
        ),
        vscode.commands.registerCommand('bdd-step-architect.jumpToStep', (location: vscode.Location) =>
            jumpHandler.execute(location),
        ),
        vscode.commands.registerCommand('bdd-step-architect.renameStep', (item: any) => renameHandler.execute(item)),
        vscode.commands.registerCommand('bdd-step-architect.generateBulkSteps', (steps: string[]) =>
            bulkHandler.execute(steps),
        ),
        vscode.commands.registerCommand('bdd-step-architect.openTestData', (fileName: string) =>
            openTestDataHandler.execute(fileName),
        ),
        vscode.commands.registerCommand('bdd-step-architect.findUnusedSteps', () => sweeper.findUnusedSteps()),
        vscode.commands.registerCommand(
            'bdd-step-architect.showStepUsages',
            (uri: vscode.Uri, pos: vscode.Position, locs: vscode.Location[]) =>
                vscode.commands.executeCommand('editor.action.showReferences', uri, pos, locs),
        ),
        vscode.languages.registerCodeActionsProvider({ pattern: '**/*.feature' }, actionProvider, {
            providedCodeActionKinds: [vscode.CodeActionKind.QuickFix],
        }),
        vscode.languages.registerCompletionItemProvider({ pattern: '**/*.feature' }, completionProvider, ' '),
        vscode.languages.registerCodeLensProvider({ pattern: '**/*.ts' }, new BddCodeLensProvider(featureScanner)),
        vscode.languages.registerCodeLensProvider({ pattern: '**/*.feature' }, new FeatureCodeLensProvider(scanner)),
        vscode.languages.registerDefinitionProvider({ pattern: '**/*.feature' }, new BddDefinitionProvider()),
        vscode.languages.registerDocumentLinkProvider({ pattern: '**/*.feature' }, new TestDataLinkProvider()),
        vscode.window.registerTreeDataProvider('bddStepCatalog', catalogProvider),
        tsWatcher,
        activeEditorChange,
        documentChange,
    );
}

export function deactivate() {}
