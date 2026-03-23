import * as vscode from 'vscode';
import { ParsedStep } from './ParsedStep';

export interface IStepParser {
    parse(lineText: string): ParsedStep | null;
    parseContextualLine(document: vscode.TextDocument, lineNumber: number): ParsedStep | null;
}
