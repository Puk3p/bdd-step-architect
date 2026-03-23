import * as vscode from 'vscode';
import { STEP_DEFINITION_KEYWORD_PATTERN } from '../core/constants';
import { IFeatureScanner } from '../interfaces';

export class BddCodeLensProvider implements vscode.CodeLensProvider {
    constructor(private featureScanner: IFeatureScanner) {}

    public async provideCodeLenses(
        document: vscode.TextDocument,
        _token: vscode.CancellationToken,
    ): Promise<vscode.CodeLens[]> {
        const lenses: vscode.CodeLens[] = [];
        const text = document.getText();

        const stepRegex = new RegExp(`(${STEP_DEFINITION_KEYWORD_PATTERN})\\(\\s*\\/(.+?)\\/`, 'g');
        let match;

        while ((match = stepRegex.exec(text)) !== null) {
            const keyword = match[1];
            const rawPattern = match[2];

            const cleanPattern = rawPattern.replace(/^\^/, '').replace(/\$$/, '');

            const humanReadable = cleanPattern
                .replace(/\(\[\^"\]\+\)/g, '{string}')
                .replace(/\(\[\^'\]\+\)/g, '{string}')
                .replace(/\(\\d\+\(\?:\.\\d\+\)\?\)/g, '{number}')
                .replace(/\\\?/g, '?')
                .replace(/\(\?:\s.*?\)\?/g, '{optional}')
                .replace(/\(([^)|]+)\|([^)|]+)\)/g, '{$1 or $2}');

            const line = document.positionAt(match.index).line;
            const range = new vscode.Range(line, 0, line, 0);

            let title = `✨ BDD: ${keyword} ${humanReadable}`;
            let commandAction: vscode.Command;

            try {
                const actualRegex = new RegExp(`^${cleanPattern}$`);
                const usage = await this.featureScanner.getStepUsage(actualRegex);

                if (usage.count > 0) {
                    title += `   |   📊 Used in ${usage.count} scenarios (Click to view)`;

                    commandAction = {
                        title: title,
                        command: 'bdd-step-architect.showStepUsages',
                        arguments: [document.uri, new vscode.Position(line, 0), usage.locations],
                        tooltip: 'Click to see all places where this step is used',
                    };
                } else {
                    title += `   |   ⚠️ Unused step`;
                    commandAction = {
                        title: title,
                        command: '',
                        tooltip: 'This step is currently not used anywhere',
                    };
                }
            } catch {
                commandAction = { title, command: '' };
            }

            lenses.push(new vscode.CodeLens(range, commandAction));
        }

        return lenses;
    }
}
