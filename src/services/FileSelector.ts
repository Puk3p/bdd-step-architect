import * as vscode from 'vscode';
import { IFileSelector } from '../interfaces';

export class FileSelector implements IFileSelector {
    public async selectTargetFile(): Promise<vscode.Uri | undefined> {
        const files = await vscode.workspace.findFiles('**/*.ts', '**/node_modules/**');
        const items = files.map((f) => ({ label: vscode.workspace.asRelativePath(f), uri: f }));

        items.unshift({ label: 'Create new file...', uri: undefined as any });

        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: 'Select where to insert the new step',
        });
        if (!selected) {
            return undefined;
        }

        let targetUri = selected.uri;

        if (!targetUri) {
            const newFileName = await vscode.window.showInputBox({
                prompt: 'Enter file path relative to workspace (e.g., src/steps/myFeature.steps.ts)',
            });
            if (!newFileName) {
                return undefined;
            }

            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders) {
                vscode.window.showErrorMessage('No workspace folder open.');
                return undefined;
            }
            targetUri = vscode.Uri.joinPath(workspaceFolders[0].uri, newFileName);
            await vscode.workspace.fs.writeFile(targetUri, new Uint8Array(0));
        }

        return targetUri;
    }
}
