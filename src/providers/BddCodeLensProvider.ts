import * as vscode from 'vscode';
import { STEP_DEFINITION_KEYWORD_PATTERN } from '../core/constants';

export class BddCodeLensProvider implements vscode.CodeLensProvider {
    
    public provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.CodeLens[] {
        const lenses: vscode.CodeLens[] = [];
        const text = document.getText();
        
        const stepRegex = new RegExp(`(${STEP_DEFINITION_KEYWORD_PATTERN})\\(\\s*\\/\\^(.+?)\\$\\/`, 'g');
        let match;

        while ((match = stepRegex.exec(text)) !== null) {
            const keyword = match[1];
            let pattern = match[2];

            let humanReadable = pattern
                .replace(/\(\[\^"\]\+\)/g, '{string}')
                .replace(/\(\[\^'\]\+\)/g, "{string}")
                .replace(/\(\\d\+\(\?:\.\\d\+\)\?\)/g, '{number}')
                .replace(/\\\?/g, '?')
                .replace(/\(\?:\s.*?\)\?/g, '{optional}');

            const line = document.positionAt(match.index).line;
            const range = new vscode.Range(line, 0, line, 0);

            const command: vscode.Command = {
                title: `✨ BDD: ${keyword} ${humanReadable}`,
                command: "",
                tooltip: "This is how Gherkin translates your Regex"
            };

            lenses.push(new vscode.CodeLens(range, command));
        }

        return lenses;
    }
}