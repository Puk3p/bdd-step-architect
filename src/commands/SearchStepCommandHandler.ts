import * as vscode from 'vscode';
import { IStepScanner } from '../interfaces';

export class SearchStepCommandHandler {
    constructor(private scanner: IStepScanner) {}

    public async execute(): Promise<void> {
        const steps = this.scanner.getSteps();

        if (steps.length === 0) {
            vscode.window.showInformationMessage('No step definitions found. Try reopening the workspace.');
            return;
        }

        const items: vscode.QuickPickItem[] = steps.map((step) => {
            const cleanLabel = step.pattern.replace(/^\^|\$$/g, '').replace(/\\"/g, '"');
            const fileName = step.location ? step.location.uri.path.split('/').pop() : 'unknown.ts';

            return {
                label: `$(symbol-method) ${cleanLabel}`,
                description: fileName,
                detail: `${step.type?.trim() ?? 'Step'}`,
            };
        });

        const picked = await vscode.window.showQuickPick(items, {
            placeHolder: '🔍 Search step definitions by keyword...',
            matchOnDescription: true,
            matchOnDetail: true,
        });

        if (!picked) {
            return;
        }

        const index = items.indexOf(picked);
        const step = steps[index];

        if (step.location) {
            const document = await vscode.workspace.openTextDocument(step.location.uri);
            const editor = await vscode.window.showTextDocument(document);
            editor.selection = new vscode.Selection(step.location.range.start, step.location.range.start);
            editor.revealRange(step.location.range, vscode.TextEditorRevealType.InCenter);
        }
    }
}
