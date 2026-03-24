import * as vscode from 'vscode';
import { STEP_DEFINITION_KEYWORD_PATTERN } from '../core/constants';

export class BddDefinitionProvider implements vscode.DefinitionProvider {
    public async provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position,
        _token: vscode.CancellationToken,
    ): Promise<vscode.Location | null> {
        const lineText = document.lineAt(position.line).text.trim();
        const match = lineText.match(/^(Given|When|Then|And|But)\s+(.+)$/);

        if (!match) {
            return null;
        }

        const stepBody = match[2];
        const tsFiles = await vscode.workspace.findFiles('**/*.ts', '**/node_modules/**');

        for (const file of tsFiles) {
            const doc = await vscode.workspace.openTextDocument(file);
            const text = doc.getText();

            const regexStepPattern = new RegExp(`(${STEP_DEFINITION_KEYWORD_PATTERN})\\(\\s*\\/(.+?)\\/`, 'g');
            const stringStepPattern = new RegExp(`(${STEP_DEFINITION_KEYWORD_PATTERN})\\(\\s*['"\`](.+?)['"\`]`, 'g');

            let execMatch;

            while ((execMatch = regexStepPattern.exec(text)) !== null) {
                const rawPattern = execMatch[2];
                const cleanPattern = rawPattern.replace(/^\^/, '').replace(/\$$/, '');

                try {
                    const regex = new RegExp(`^${cleanPattern}$`);
                    if (regex.test(stepBody)) {
                        const startPos = doc.positionAt(execMatch.index);
                        return new vscode.Location(file, startPos);
                    }
                } catch {}
            }

            while ((execMatch = stringStepPattern.exec(text)) !== null) {
                const rawPattern = execMatch[2];
                const cleanPattern = rawPattern
                    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
                    .replace(/\\{int\\}/g, '\\d+')
                    .replace(/\\{float\\}/g, '\\d+\\.?\\d*')
                    .replace(/\\{string\\}/g, '[^"]+')
                    .replace(/\\{word\\}/g, '\\w+');

                try {
                    const regex = new RegExp(`^${cleanPattern}$`);
                    if (regex.test(stepBody)) {
                        const startPos = doc.positionAt(execMatch.index);
                        return new vscode.Location(file, startPos);
                    }
                } catch {}
            }
        }

        return null;
    }
}
