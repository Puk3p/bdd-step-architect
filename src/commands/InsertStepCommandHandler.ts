import * as vscode from 'vscode';
import { ParsedStep, ISnippetGenerator, IFileSelector, IImportResolver, IAnimationService } from '../interfaces';

export class InsertStepCommandHandler {
    constructor(
        private generator: ISnippetGenerator,
        private fileSelector: IFileSelector,
        private importResolver: IImportResolver,
        private animationService: IAnimationService
    ) {}

    public async execute(parsedStep: ParsedStep): Promise<void> {
        const targetUri = await this.fileSelector.selectTargetFile();
        if (!targetUri) return;

        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "🧙‍♂️ BDD Step Architect",
            cancellable: false
        }, async (progress) => {
            
            progress.report({ increment: 20, message: "Brewing Regex potions... 🧪" });
            await new Promise(resolve => setTimeout(resolve, 600));

            progress.report({ increment: 30, message: "Sprinkling TypeScript dust... ✨" });
            await new Promise(resolve => setTimeout(resolve, 500));

            const document = await vscode.workspace.openTextDocument(targetUri);

            await this.importResolver.resolveImports(document, targetUri, parsedStep.stepType);

            const editor = await vscode.window.showTextDocument(document);
            let currentLine = document.lineCount;
            const endPosition = new vscode.Position(currentLine, 0);
            editor.selection = new vscode.Selection(endPosition, endPosition);
            editor.revealRange(new vscode.Range(endPosition, endPosition));

            progress.report({ increment: 20, message: "Hacking into the mainframe... ⌨️" });
            
            const body = '\n' + this.generator.generateBody(parsedStep);
            const linesCount = body.split('\n').length;

            await this.animationService.typewriterInsert(editor, currentLine, body);

            progress.report({ increment: 30, message: "Step summoned! 🚀" });

            const startLine = document.lineCount - linesCount;
            const endLine = document.lineCount;
            this.animationService.colorMorph(editor, startLine, endLine);
        });
    }
}
