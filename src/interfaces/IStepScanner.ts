import { StepDefinition } from './StepDefinition';

export interface IStepScanner {
    scanWorkspace(): Promise<void>;
    getSteps(): StepDefinition[];
}
