import * as vscode from 'vscode';
import { IImportResolver } from '../interfaces';
import { IConfigProvider } from '../interfaces';

export class ImportResolver implements IImportResolver {
    constructor(private configProvider: IConfigProvider) {}

    public async resolveImports(document: vscode.TextDocument, targetUri: vscode.Uri, stepType: string): Promise<void> {
        const text = document.getText();
        const edit = new vscode.WorkspaceEdit();

        const stepsImportPath = this.configProvider.getStepsImportPath();
        const worldImportPath = this.configProvider.getWorldImportPath();

        const escapedStepsPath = stepsImportPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const stepImportRegex = new RegExp(`import\\s+\\{([^}]+)\\}\\s+from\\s+['"]${escapedStepsPath}['"]`);
        const stepMatch = text.match(stepImportRegex);

        if (stepMatch) {
            const existingKeywords = stepMatch[1].split(',').map(k => k.trim());
            if (!existingKeywords.includes(stepType)) {
                existingKeywords.push(stepType);
                const newImportStr = `import { ${existingKeywords.join(', ')} } from '${stepsImportPath}'`;
                const startPos = document.positionAt(stepMatch.index!);
                const endPos = document.positionAt(stepMatch.index! + stepMatch[0].length);
                edit.replace(targetUri, new vscode.Range(startPos, endPos), newImportStr);
            }
        } else {
            edit.insert(targetUri, new vscode.Position(0, 0), `import { ${stepType} } from '${stepsImportPath}';\n`);
        }

        const escapedWorldPath = worldImportPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const worldImportRegex = new RegExp(`import\\s+\\{([^}]+)\\}\\s+from\\s+['"]${escapedWorldPath}['"]`);
        if (!worldImportRegex.test(text)) {
            edit.insert(targetUri, new vscode.Position(0, 0), `import { UnifiedWorld } from '${worldImportPath}';\n`);
        }

        await vscode.workspace.applyEdit(edit);
    }
}
