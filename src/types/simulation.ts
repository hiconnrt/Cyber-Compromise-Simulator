export type ComputerState = 'safe' | 'vulnerable' | 'patched' | 'compromised';

export type Department = 'HR' | 'Finance' | 'IT' | 'Engineering' | 'None';

export interface ComputerNode {
  id: number;
  label: string;
  department: Department;
  state: ComputerState;
  compromiseStep: number | null;
  x: number;
  y: number;
  connections: number[];
}

export interface NetworkEdge {
  id: string;
  source: number;
  target: number;
  isCrossDepartment: boolean;
}

export type NetworkType = 'flat' | 'segmented';

export interface SimulationConfig {
  networkType: NetworkType;
  numComputers: number;
  patchPercentage: number; // 0 to 100
  vulnerableCompromiseProb: number; // default 0.70
  patchedCompromiseProb: number; // default 0.10
  maxSteps: number; // default 50
  avgConnections: number; // default 6
  randomSeed: number;
  numTrials: number; // default 30
  simSpeedMs: number; // delay between steps
}

export interface StepStats {
  step: number;
  totalComputers: number;
  compromisedCount: number;
  newlyCompromisedCount: number;
  patchedCount: number;
  vulnerableCount: number;
  compromisedPct: number;
  unaffectedPct: number;
  spreadRate: number;
}

export interface DepartmentResult {
  department: Department;
  total: number;
  patched: number;
  compromised: number;
  unaffected: number;
  compromisedPct: number;
}

export interface TrialResult {
  trialId: number;
  networkType: NetworkType;
  patchPercentage: number;
  seed: number;
  finalCompromisedCount: number;
  finalCompromisePct: number;
  peakSpreadSpeed: number;
  outbreakDuration: number;
  unaffectedCount: number;
  largestUnaffectedSection: string;
  departmentResults: Record<Department, DepartmentResult>;
  timeSeriesCompromisePct: number[]; // step -> % compromised
}

export interface StatisticalSummary {
  meanCompromisePct: number;
  medianCompromisePct: number;
  stdDevCompromisePct: number;
  minCompromisePct: number;
  maxCompromisePct: number;
  ci95Low: number;
  ci95High: number;
  meanDuration: number;
  meanPeakSpread: number;
  meanUnaffectedCount: number;
  percentReductionFromBaseline: number;
}

export interface StatTestResult {
  testName: string;
  statistic: number;
  pValue: number;
  isSignificant: boolean;
  interpretation: string;
}

export interface FullExperimentRow {
  configId: string;
  networkType: NetworkType;
  patchPercentage: number;
  trials: number;
  meanCompromisePct: number;
  stdDevCompromisePct: number;
  meanDuration: number;
  meanPeakSpread: number;
  meanUnaffectedCount: number;
  ci95Low: number;
  ci95High: number;
  departmentAverages?: Record<Department, number>;
}
