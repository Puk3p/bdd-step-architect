import { ParsedStep } from './GherkinParser';

export class SnippetGenerator {
    public generateTypeScript(parsedStep: ParsedStep): string {
        let variableArgs = '';
        for (let i = 0; i < parsedStep.variableCount; i++) {
            variableArgs += `, param${i + 1}: string`;
        }

        return `import { ${parsedStep.stepType} } from 'src/steps/bdd';\n` +
               `import { UnifiedWorld } from 'src/support/worlds/UnifiedWorld';\n\n` +
               `${parsedStep.stepType}(/^${parsedStep.regexPattern}$/, async ({ world }: { world: UnifiedWorld }${variableArgs}) => {\n` +
               `  // TODO: Implement logic for "${parsedStep.stepText}"\n` +
               `});\n`;
    }
}