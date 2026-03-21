import * as vscode from 'vscode';
import { ParsedStep } from './ParsedStep';

export interface IStepParser {
    parseContextualLine(document: vscode.TextDocument, lineNumber: number): ParsedStep | null;
}
