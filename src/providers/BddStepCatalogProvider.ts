import * as vscode from 'vscode';
import { IStepScanner } from '../interfaces';

export class StepTreeItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly type: 'category' | 'step',
        public readonly bddKeyword: string,
        public readonly command?: vscode.Command,
        public readonly tooltipText?: string | vscode.MarkdownString,
        public readonly descriptionText?: string,
        public readonly stepData?: any,
    ) {
        super(label, collapsibleState);
        this.tooltip = tooltipText;
        this.description = descriptionText;
        this.contextValue = this.type;

        let themeColor: vscode.ThemeColor;
        switch (this.bddKeyword) {
            case 'Given':
                themeColor = new vscode.ThemeColor('terminal.ansiBlue');
                break;
            case 'When':
                themeColor = new vscode.ThemeColor('terminal.ansiYellow');
                break;
            case 'Then':
                themeColor = new vscode.ThemeColor('terminal.ansiGreen');
                break;
            default:
                themeColor = new vscode.ThemeColor('foreground');
        }

        if (this.type === 'category') {
            this.iconPath = new vscode.ThemeIcon('folder-library', themeColor);
        } else {
            this.iconPath = new vscode.ThemeIcon('symbol-method', themeColor);
        }
    }
}

export class BddStepCatalogProvider implements vscode.TreeDataProvider<StepTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<StepTreeItem | undefined | void> = new vscode.EventEmitter<
        StepTreeItem | undefined | void
    >();
    readonly onDidChangeTreeData: vscode.Event<StepTreeItem | undefined | void> = this._onDidChangeTreeData.event;

    constructor(private scanner: IStepScanner) {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: StepTreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: StepTreeItem): Thenable<StepTreeItem[]> {
        const steps = this.scanner.getSteps();

        if (!element) {
            const givenCount = steps.filter((s) => s.type?.trim() === 'Given').length;
            const whenCount = steps.filter((s) => s.type?.trim() === 'When').length;
            const thenCount = steps.filter((s) => s.type?.trim() === 'Then').length;

            return Promise.resolve([
                new StepTreeItem(
                    'Given',
                    vscode.TreeItemCollapsibleState.Expanded,
                    'category',
                    'Given',
                    undefined,
                    undefined,
                    `${givenCount} steps`,
                ),
                new StepTreeItem(
                    'When',
                    vscode.TreeItemCollapsibleState.Expanded,
                    'category',
                    'When',
                    undefined,
                    undefined,
                    `${whenCount} steps`,
                ),
                new StepTreeItem(
                    'Then',
                    vscode.TreeItemCollapsibleState.Expanded,
                    'category',
                    'Then',
                    undefined,
                    undefined,
                    `${thenCount} steps`,
                ),
            ]);
        }

        if (element.type === 'category') {
            const filteredSteps = steps.filter((s) => s.type && s.type.trim() === element.label);

            const items = filteredSteps.map((step) => {
                const cleanLabel = step.pattern.replace(/^\^|\$$/g, '').replace(/\\"/g, '"');
                const fileName = step.location ? step.location.uri.path.split('/').pop() : 'unknown.ts';

                const mdTooltip = new vscode.MarkdownString();
                mdTooltip.appendMarkdown(`**${step.type?.trim()}** ${cleanLabel}\n\n`);
                mdTooltip.appendCodeblock(step.pattern, 'typescript');
                mdTooltip.appendMarkdown(`\n*📍 Defined in: ${fileName}*`);

                return new StepTreeItem(
                    cleanLabel,
                    vscode.TreeItemCollapsibleState.None,
                    'step',
                    element.label,
                    {
                        command: 'bdd-step-architect.jumpToStep',
                        title: 'Jump to Step Definition',
                        arguments: [step.location],
                    },
                    mdTooltip,
                    fileName,
                    step,
                );
            });

            return Promise.resolve(items);
        }

        return Promise.resolve([]);
    }
}
