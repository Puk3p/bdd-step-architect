export interface ParsedStep {
    stepType: string;
    stepText: string;
    regexPattern: string;
    variableCount: number;
}

export class GherkinParser {
    public parseLine(line: string): ParsedStep | null {
        const match = line.match(/^(Given|When|Then|And|But)\s+(.*)/);
        if (!match) return null;

        const keyword = match[1];
        const stepType = (keyword === 'And' || keyword === 'But') ? 'When' : keyword;
        const originalText = match[2];

        let regexPattern = originalText;
        let variableCount = 0;

        regexPattern = regexPattern.replace(/"([^"]+)"/g, () => {
            variableCount++;
            return '"([^"]+)"';
        });

        regexPattern = regexPattern.replace(/\b\d+(?:\.\d+)?\b/g, () => {
            variableCount++;
            return '(\\d+(?:\\.\\d+)?)';
        });

        return { stepType, stepText: originalText, regexPattern, variableCount };
    }
}