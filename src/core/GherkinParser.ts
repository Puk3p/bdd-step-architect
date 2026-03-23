import * as vscode from 'vscode';
import { IStepParser, ParsedStep } from '../interfaces';
import { GHERKIN_KEYWORD_PATTERN, GHERKIN_ALIAS_KEYWORDS } from './constants';

export class GherkinParser implements IStepParser {
    public parse(lineText: string): ParsedStep | null {
        const stepMatch = lineText.match(new RegExp(`^(${GHERKIN_KEYWORD_PATTERN})\\s+(.+)$`));

        if (!stepMatch) {
            return null;
        }

        const originalkeyword = stepMatch[1];
        const stepBody = stepMatch[2];
        const stepType = (GHERKIN_ALIAS_KEYWORDS as readonly string[]).includes(originalkeyword)
            ? 'Given'
            : originalkeyword;

        let varCount = 0;
        let regex = stepBody.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        regex = regex.replace(/"([^"]+)"/g, () => {
            varCount++;
            return '"([^"]+)"';
        });

        const aliasPattern = /(?:\s+(as|for\s+session)\s+([a-zA-Z]+)(\d+))$/;
        const aliasMatchFound = stepBody.match(aliasPattern);

        if (aliasMatchFound) {
            const prefix = aliasMatchFound[1];
            const word = aliasMatchFound[2];
            regex = regex.replace(new RegExp(`\\s+${prefix}\\s+${word}\\d+$`), '');
            regex += `(?: ${prefix} (${word}\\d+))?`;
            varCount++;
        } else {
            const numberRegex = /(\d+(?:\.\d+)?)/g;
            regex = regex.replace(
                new RegExp(`\\s${numberRegex.source}(\\s|$)`, 'g'),
                (_match, _num, _trailingSpace) => {
                    varCount++;
                    return ` (\\d+(?:\\.\\d+)?)$1`;
                },
            );
        }

        return {
            stepType,
            stepText: stepBody,
            regexPattern: regex,
            variableCount: varCount,
            hasDataTable: false,
        };
    }

    public parseContextualLine(document: vscode.TextDocument, lineNumber: number): ParsedStep | null {
        const lineText = document.lineAt(lineNumber).text.trim();

        const parsedStep = this.parse(lineText);

        if (!parsedStep) {
            return null;
        }

        if (lineNumber + 1 < document.lineCount) {
            const nextLine = document.lineAt(lineNumber + 1).text.trim();
            if (nextLine.startsWith('|')) {
                parsedStep.hasDataTable = true;
            }
        }

        return parsedStep;
    }
}
