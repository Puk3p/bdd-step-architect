import * as vscode from 'vscode';
import { IFeatureScanner } from '../interfaces';

interface CachedStepLine {
    stepBody: string;
    fileUri: vscode.Uri;
    fileName: string;
    line: number;
    column: number;
}

export class FeatureScanner implements IFeatureScanner {
    private cache: CachedStepLine[] = [];

    public async scanWorkspace(): Promise<void> {
        this.cache = [];

        const files = await vscode.workspace.findFiles('**/*.feature', '**/node_modules/**');

        for (const file of files) {
            await this.scanFile(file);
        }

        console.log(`FeatureScanner cached ${this.cache.length} step lines from ${files.length} feature files.`);
    }

    private async scanFile(file: vscode.Uri): Promise<void> {
        const fileData = await vscode.workspace.fs.readFile(file);
        const content = Buffer.from(fileData).toString('utf8');
        const lines = content.split('\n');
        const fileName = vscode.workspace.asRelativePath(file).split('/').pop() || '';

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const match = line.trim().match(/^(Given|When|Then|And|But)\s+(.+)$/);

            if (match) {
                this.cache.push({
                    stepBody: match[2],
                    fileUri: file,
                    fileName,
                    line: i,
                    column: line.indexOf(match[0]) > -1 ? line.indexOf(match[0]) : 0,
                });
            }
        }
    }

    public async getStepUsage(
        regexPattern: RegExp,
    ): Promise<{ count: number; lastUsedFile: string; locations: vscode.Location[] }> {
        let count = 0;
        let lastUsedFile = '';
        const locations: vscode.Location[] = [];

        for (const entry of this.cache) {
            if (regexPattern.test(entry.stepBody)) {
                count++;
                lastUsedFile = entry.fileName;
                locations.push(new vscode.Location(entry.fileUri, new vscode.Position(entry.line, entry.column)));
            }
        }

        return { count, lastUsedFile, locations };
    }
}
