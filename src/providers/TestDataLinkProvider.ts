import * as vscode from 'vscode';

export class TestDataLinkProvider implements vscode.DocumentLinkProvider {
    provideDocumentLinks(document: vscode.TextDocument, _token: vscode.CancellationToken): vscode.DocumentLink[] {
        const links: vscode.DocumentLink[] = [];
        const text = document.getText();

        const regex = /"([^" ]+)"/g;
        let match;

        while ((match = regex.exec(text)) !== null) {
            const fileName = match[1];

            const startPos = document.positionAt(match.index + 1);
            const endPos = document.positionAt(match.index + 1 + fileName.length);
            const range = new vscode.Range(startPos, endPos);

            const encodedArgs = encodeURIComponent(JSON.stringify([fileName]));
            const commandUri = vscode.Uri.parse(`command:bdd-step-architect.openTestData?${encodedArgs}`);

            const link = new vscode.DocumentLink(range, commandUri);
            link.tooltip = `Click to open file: ${fileName}`;
            links.push(link);
        }

        return links;
    }
}
