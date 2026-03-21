import { ISnippetGenerator, IConfigProvider, ParsedStep } from '../interfaces';

export class SnippetGenerator implements ISnippetGenerator {
    constructor(private configProvider: IConfigProvider) {}

    public getImports(stepType: string): string {
        const stepsImportPath = this.configProvider.getStepsImportPath();
        const worldImportPath = this.configProvider.getWorldImportPath();

        return `import { ${stepType} } from '${stepsImportPath}';\nimport { UnifiedWorld } from '${worldImportPath}';\n`;
    }

    public generateBody(parsedStep: ParsedStep): string {
        let variableArgs = '';
        for (let i = 0; i < parsedStep.variableCount; i++) {
            variableArgs += `, param${i + 1}: string`;
        }

        if (parsedStep.hasDataTable) {
            variableArgs += ', dataTable: any';
        }

        return `${parsedStep.stepType}(/^${parsedStep.regexPattern}$/, async ({ world }: { world: UnifiedWorld }${variableArgs}) => {\n` +
               `  // TODO: Implement logic for "${parsedStep.stepText}"\n` +
               `});\n`;
    }
}