import * as vscode from 'vscode';

export class RenameStepCommandHandler {
    constructor(private onSuccess: () => void) {}

    public async execute(item: any): Promise<void> {
        if (!item || !item.stepData || !item.stepData.location) {
            vscode.window.showErrorMessage('Error: Could not identify the step for renaming.');
            return;
        }

        const oldPattern = item.stepData.pattern;
        const cleanOld = oldPattern.replace(/^\^|\$$/g, '').replace(/\\"/g, '"');

        const newName = await vscode.window.showInputBox({
            prompt: 'Enter the new name for this step (will be updated everywhere):',
            value: cleanOld,
        });

        if (!newName || newName === cleanOld) {
            return;
        }

        const workspaceEdit = new vscode.WorkspaceEdit();

        const tsUri = item.stepData.location.uri;
        const tsDoc = await vscode.workspace.openTextDocument(tsUri);
        const tsText = tsDoc.getText();

        const tsRegex = new RegExp(oldPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        let match;
        while ((match = tsRegex.exec(tsText)) !== null) {
            const startPos = tsDoc.positionAt(match.index);
            const endPos = tsDoc.positionAt(match.index + match[0].length);
            const range = new vscode.Range(startPos, endPos);

            const newPattern = oldPattern.startsWith('^') ? `^${newName}$` : newName;
            workspaceEdit.replace(tsUri, range, newPattern);
        }

        const featureFiles = await vscode.workspace.findFiles('**/*.feature', '**/node_modules/**');

        for (const file of featureFiles) {
            const doc = await vscode.workspace.openTextDocument(file);
            const text = doc.getText();

            const featureRegex = new RegExp(cleanOld.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
            let featureMatch;
            while ((featureMatch = featureRegex.exec(text)) !== null) {
                const startPos = doc.positionAt(featureMatch.index);
                const endPos = doc.positionAt(featureMatch.index + featureMatch[0].length);
                const range = new vscode.Range(startPos, endPos);
                workspaceEdit.replace(file, range, newName);
            }
        }

        const success = await vscode.workspace.applyEdit(workspaceEdit);
        if (success) {
            await vscode.workspace.saveAll();
            vscode.window.showInformationMessage(`Step successfully renamed to "${newName}" everywhere.`);
            this.onSuccess();
        } else {
            vscode.window.showErrorMessage('An error occurred during global rename.');
        }
    }
}
