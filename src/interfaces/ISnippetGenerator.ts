import { ParsedStep } from './ParsedStep';

export interface ISnippetGenerator {
    getImports(stepType: string): string;
    generateBody(parsedStep: ParsedStep): string;
}
