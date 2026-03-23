import * as vscode from 'vscode';

export class JumpToStepCommandHandler {
    public async execute(location: vscode.Location): Promise<void> {
        if (!location) {
            vscode.window.showErrorMessage('Could not find the location of this step in code.');
            return;
        }

        const document = await vscode.workspace.openTextDocument(location.uri);
        const editor = await vscode.window.showTextDocument(document);

        editor.selection = new vscode.Selection(location.range.start, location.range.start);
        editor.revealRange(location.range, vscode.TextEditorRevealType.InCenter);
    }
}
