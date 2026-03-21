export interface ParsedStep {
    stepType: string;
    stepText: string;
    regexPattern: string;
    variableCount: number;
    hasDataTable: boolean;
}
