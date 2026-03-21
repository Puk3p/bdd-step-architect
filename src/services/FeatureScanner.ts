import * as vscode from 'vscode';
import { IFeatureScanner } from '../interfaces';

export class FeatureScanner implements IFeatureScanner {
    public async getStepUsage(
        regexPattern: RegExp,
    ): Promise<{ count: number; lastUsedFile: string; locations: vscode.Location[] }> {
        let count = 0;
        let lastUsedFile = '';
        const locations: vscode.Location[] = [];

        const files = await vscode.workspace.findFiles('**/*.feature', '**/node_modules/**');

        for (const file of files) {
            const fileData = await vscode.workspace.fs.readFile(file);
            const content = Buffer.from(fileData).toString('utf8');
            const lines = content.split('\n');

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const match = line.trim().match(/^(Given|When|Then|And|But)\s+(.+)$/);

                if (match && regexPattern.test(match[2])) {
                    count++;
                    lastUsedFile = vscode.workspace.asRelativePath(file).split('/').pop() || '';

                    const position = new vscode.Position(i, line.indexOf(match[0]) > -1 ? line.indexOf(match[0]) : 0);
                    locations.push(new vscode.Location(file, position));
                }
            }
        }

        return { count, lastUsedFile, locations };
    }
}
