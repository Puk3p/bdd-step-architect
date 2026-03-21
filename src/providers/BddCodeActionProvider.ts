import * as vscode from 'vscode';
import { IStepParser, ISnippetGenerator } from '../interfaces';

export class BddCodeActionProvider implements vscode.CodeActionProvider {
    constructor(
        private parser: IStepParser,
        private generator: ISnippetGenerator,
    ) {}

    public provideCodeActions(document: vscode.TextDocument, range: vscode.Range): vscode.CodeAction[] | undefined {
        const parsedStep = this.parser.parseContextualLine(document, range.start.line);
        if (!parsedStep) {
            return undefined;
        }

        const action = new vscode.CodeAction(`Generate Step: "${parsedStep.stepText}"`, vscode.CodeActionKind.QuickFix);

        action.command = {
            command: 'bdd-step-architect.insertStep',
            title: 'Insert Step',
            arguments: [parsedStep],
        };

        return [action];
    }
}
