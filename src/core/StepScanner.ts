import * as vscode from 'vscode';
import { IStepScanner, StepDefinition } from '../interfaces';
import { GHERKIN_KEYWORD_PATTERN } from './constants';

export class StepScanner implements IStepScanner {
    private steps: StepDefinition[] = [];

    public async scanWorkspace(): Promise<void> {
        this.steps = [];

        const files = await vscode.workspace.findFiles('**/*.ts', '**/node_modules/**');

        for (const file of files) {
            const document = await vscode.workspace.openTextDocument(file);
            const text = document.getText();

            const stepRegex = new RegExp(`(${GHERKIN_KEYWORD_PATTERN})\\s*\\(\\s*[/\`'"](.*?)[/\`'"]`, 'g');
            let match;

            while ((match = stepRegex.exec(text)) !== null) {
                const position = document.positionAt(match.index);

                this.steps.push({
                    type: match[1],
                    pattern: match[2],
                    location: new vscode.Location(file, position),
                });
            }
        }
        console.log(`Scanned workspace and found ${this.steps.length} existing step definitions.`);
    }

    public getSteps(): StepDefinition[] {
        return this.steps;
    }
}
