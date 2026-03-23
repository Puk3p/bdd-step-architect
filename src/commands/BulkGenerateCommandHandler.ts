import * as vscode from 'vscode';
import { IStepParser, ISnippetGenerator, IFileSelector, IStepScanner } from '../interfaces';

export class BulkGenerateCommandHandler {
    constructor(
        private parser: IStepParser,
        private generator: ISnippetGenerator,
        private fileSelector: IFileSelector,
        private scanner: IStepScanner,
    ) {}

    public async execute(missingSteps: string[]): Promise<void> {
        if (!missingSteps || missingSteps.length === 0) {
            return;
        }

        const fileUri = await this.fileSelector.selectTargetFile();
        if (!fileUri) {
            return;
        }

        const doc = await vscode.workspace.openTextDocument(fileUri);
        const editor = await vscode.window.showTextDocument(doc);

        let fullCodeToInsert = '\n\n';

        for (const stepLine of missingSteps) {
            const parsedStep = this.parser.parse(stepLine);
            if (parsedStep) {
                const snippet = this.generator.generateBody(parsedStep);
                fullCodeToInsert += snippet + '\n\n';
            }
        }

        const lastLine = doc.lineCount;
        const position = new vscode.Position(lastLine, 0);

        await editor.edit((editBuilder) => {
            editBuilder.insert(position, fullCodeToInsert);
        });

        editor.revealRange(new vscode.Range(position, position));
        vscode.window.showInformationMessage(`Successfully generated ${missingSteps.length} new steps.`);

        await this.scanner.scanWorkspace();
    }
}
