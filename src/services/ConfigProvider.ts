import * as vscode from 'vscode';
import { IConfigProvider } from '../interfaces';

export class ConfigProvider implements IConfigProvider {
    public getStepsImportPath(): string {
        const config = vscode.workspace.getConfiguration('bddStepArchitect');
        return config.get<string>('stepsImportPath', 'src/steps/bdd');
    }

    public getWorldImportPath(): string {
        const config = vscode.workspace.getConfiguration('bddStepArchitect');
        return config.get<string>('worldImportPath', 'src/support/worlds/UnifiedWorld');
    }
}
