import {
  ComputerNode,
  NetworkEdge,
  SimulationConfig,
  StepStats,
  TrialResult,
  DepartmentResult,
  Department,
  NetworkType,
} from '../types/simulation';
import { DeterministicRNG } from './random';
import { generateNetwork } from './networkGenerator';

const ALL_DEPARTMENTS: Department[] = ['HR', 'Finance', 'IT', 'Engineering'];

export interface SimulationState {
  config: SimulationConfig;
  nodes: ComputerNode[];
  edges: NetworkEdge[];
  currentStep: number;
  statsHistory: StepStats[];
  isComplete: boolean;
  initialCompromisedId: number | null;
  newlyCompromisedIds: number[];
}

/**
 * Initialize a new simulation state based on config and deterministic randomSeed
 */
export function initializeSimulation(config: SimulationConfig): SimulationState {
  const rng = new DeterministicRNG(config.randomSeed);

  // Generate network topology
  const { nodes, edges } = generateNetwork(
    config.networkType,
    config.numComputers,
    config.avgConnections,
    config.randomSeed
  );

  // Determine which nodes are patched
  const totalPatched = Math.round((config.numComputers * config.patchPercentage) / 100);
  const nodeIndices = Array.from({ length: config.numComputers }, (_, i) => i);
  const shuffledForPatching = rng.shuffle(nodeIndices);

  const patchedSet = new Set(shuffledForPatching.slice(0, totalPatched));
  nodes.forEach((node) => {
    if (patchedSet.has(node.id)) {
      node.state = 'patched';
    } else {
      node.state = 'vulnerable';
    }
  });

  // Time Step 0: Select initial compromised computer from vulnerable computers whenever possible
  const vulnerableNodes = nodes.filter((n) => n.state === 'vulnerable');
  const pool = vulnerableNodes.length > 0 ? vulnerableNodes : nodes;
  const initialNode = rng.choice(pool);

  initialNode.state = 'compromised';
  initialNode.compromiseStep = 0;

  const initialStats = calculateStepStats(0, nodes, [initialNode.id]);

  return {
    config,
    nodes,
    edges,
    currentStep: 0,
    statsHistory: [initialStats],
    isComplete: false,
    initialCompromisedId: initialNode.id,
    newlyCompromisedIds: [initialNode.id],
  };
}

/**
 * Calculates step summary statistics from current node states
 */
export function calculateStepStats(
  step: number,
  nodes: ComputerNode[],
  newlyCompromisedIds: number[]
): StepStats {
  const totalComputers = nodes.length;
  let compromisedCount = 0;
  let patchedCount = 0;
  let vulnerableCount = 0;

  nodes.forEach((node) => {
    if (node.state === 'compromised') {
      compromisedCount++;
    } else if (node.state === 'patched') {
      patchedCount++;
    } else if (node.state === 'vulnerable') {
      vulnerableCount++;
    }
  });

  const compromisedPct = Math.round((compromisedCount / totalComputers) * 1000) / 10;
  const unaffectedPct = Math.round(((totalComputers - compromisedCount) / totalComputers) * 1000) / 10;

  return {
    step,
    totalComputers,
    compromisedCount,
    newlyCompromisedCount: newlyCompromisedIds.length,
    patchedCount,
    vulnerableCount,
    compromisedPct,
    unaffectedPct,
    spreadRate: newlyCompromisedIds.length,
  };
}

/**
 * Advances the simulation by 1 time step using synchronous spread calculation
 */
export function runNextStep(state: SimulationState, rng?: DeterministicRNG): SimulationState {
  if (state.isComplete || state.currentStep >= state.config.maxSteps) {
    return { ...state, isComplete: true };
  }

  const activeRng = rng || new DeterministicRNG(state.config.randomSeed + state.currentStep * 997);

  const nextStepNum = state.currentStep + 1;
  const currentlyCompromised = state.nodes.filter((n) => n.state === 'compromised');
  const newlyCompromisedSet = new Set<number>();

  // Synchronous spread calculation: compute all spread attempts before mutating state
  currentlyCompromised.forEach((compNode) => {
    compNode.connections.forEach((neighborId) => {
      const neighbor = state.nodes[neighborId];
      if (!neighbor || neighbor.state === 'compromised') return;

      if (!newlyCompromisedSet.has(neighborId)) {
        const prob =
          neighbor.state === 'patched'
            ? state.config.patchedCompromiseProb
            : state.config.vulnerableCompromiseProb;

        const roll = activeRng.nextFloat();
        if (roll < prob) {
          newlyCompromisedSet.add(neighborId);
        }
      }
    });
  });

  const newlyCompromisedIds = Array.from(newlyCompromisedSet);

  // Apply state updates
  newlyCompromisedIds.forEach((id) => {
    const node = state.nodes[id];
    if (node) {
      node.state = 'compromised';
      node.compromiseStep = nextStepNum;
    }
  });

  const stepStats = calculateStepStats(nextStepNum, state.nodes, newlyCompromisedIds);
  const nextHistory = [...state.statsHistory, stepStats];

  // Stop condition: no new computers compromised OR max steps reached
  const isComplete =
    newlyCompromisedIds.length === 0 || nextStepNum >= state.config.maxSteps;

  return {
    ...state,
    currentStep: nextStepNum,
    statsHistory: nextHistory,
    isComplete,
    newlyCompromisedIds,
  };
}

/**
 * Calculates department breakdown from final nodes
 */
export function calculateDepartmentResults(nodes: ComputerNode[]): Record<Department, DepartmentResult> {
  const depts: Department[] = ['HR', 'Finance', 'IT', 'Engineering', 'None'];
  const results: Record<string, DepartmentResult> = {};

  depts.forEach((dept) => {
    results[dept] = {
      department: dept as Department,
      total: 0,
      patched: 0,
      compromised: 0,
      unaffected: 0,
      compromisedPct: 0,
    };
  });

  nodes.forEach((node) => {
    const d = node.department || 'None';
    const rec = results[d];
    if (!rec) return;

    rec.total++;
    if (node.state === 'patched') rec.patched++;
    if (node.state === 'compromised') rec.compromised++;
    else rec.unaffected++;
  });

  depts.forEach((dept) => {
    const rec = results[dept];
    if (rec.total > 0) {
      rec.compromisedPct = Math.round((rec.compromised / rec.total) * 1000) / 10;
    }
  });

  return results as Record<Department, DepartmentResult>;
}

/**
 * Calculates largest unaffected section:
 * For segmented networks: department with greatest number/percentage of unaffected computers.
 * For flat networks: size of largest connected unaffected component.
 */
export function calculateLargestUnaffectedSection(nodes: ComputerNode[]): string {
  const hasDepartments = nodes.some((n) => n.department !== 'None');

  if (hasDepartments) {
    const deptResults = calculateDepartmentResults(nodes);
    let bestDept = 'None';
    let maxUnaffected = -1;

    ALL_DEPARTMENTS.forEach((dept) => {
      const res = deptResults[dept];
      if (res.unaffected > maxUnaffected) {
        maxUnaffected = res.unaffected;
        bestDept = dept;
      }
    });

    return `${bestDept} (${maxUnaffected} safe computers)`;
  } else {
    // Find largest connected unaffected component using BFS
    const visited = new Set<number>();
    const safeNodes = new Set(
      nodes.filter((n) => n.state !== 'compromised').map((n) => n.id)
    );

    let maxComponentSize = 0;

    safeNodes.forEach((startId) => {
      if (visited.has(startId)) return;

      let count = 0;
      const queue: number[] = [startId];
      visited.add(startId);

      while (queue.length > 0) {
        const curr = queue.shift()!;
        count++;
        const node = nodes[curr];
        if (!node) continue;

        node.connections.forEach((nextId) => {
          if (safeNodes.has(nextId) && !visited.has(nextId)) {
            visited.add(nextId);
            queue.push(nextId);
          }
        });
      }

      if (count > maxComponentSize) {
        maxComponentSize = count;
      }
    });

    return `Connected cluster of ${maxComponentSize} computers`;
  }
}

/**
 * Run a full simulation trial from start to end synchronously
 */
export function runFullTrial(
  config: SimulationConfig,
  seedOverride?: number,
  trialId: number = 1
): TrialResult {
  const activeConfig = seedOverride !== undefined ? { ...config, randomSeed: seedOverride } : config;
  let state = initializeSimulation(activeConfig);
  const rng = new DeterministicRNG(activeConfig.randomSeed + 54321);

  while (!state.isComplete) {
    state = runNextStep(state, rng);
  }

  const finalStats = state.statsHistory[state.statsHistory.length - 1];
  let peakSpreadSpeed = 0;
  state.statsHistory.forEach((s) => {
    if (s.newlyCompromisedCount > peakSpreadSpeed) {
      peakSpreadSpeed = s.newlyCompromisedCount;
    }
  });

  const departmentResults = calculateDepartmentResults(state.nodes);
  const largestUnaffectedSection = calculateLargestUnaffectedSection(state.nodes);
  const timeSeriesCompromisePct = state.statsHistory.map((s) => s.compromisedPct);

  return {
    trialId,
    networkType: activeConfig.networkType,
    patchPercentage: activeConfig.patchPercentage,
    seed: activeConfig.randomSeed,
    finalCompromisedCount: finalStats.compromisedCount,
    finalCompromisePct: finalStats.compromisedPct,
    peakSpreadSpeed,
    outbreakDuration: finalStats.step,
    unaffectedCount: finalStats.totalComputers - finalStats.compromisedCount,
    largestUnaffectedSection,
    departmentResults,
    timeSeriesCompromisePct,
  };
}

/**
 * Runs repeated trials (default 30) using deterministic distinct seeds
 */
export function runRepeatedTrials(
  config: SimulationConfig,
  numTrials: number = 30,
  onProgress?: (completed: number, total: number) => void
): TrialResult[] {
  const results: TrialResult[] = [];
  const baseSeed = config.randomSeed;

  for (let i = 0; i < numTrials; i++) {
    const trialSeed = baseSeed + i * 10007;
    const result = runFullTrial(config, trialSeed, i + 1);
    results.push(result);
    if (onProgress) {
      onProgress(i + 1, numTrials);
    }
  }

  return results;
}

/**
 * Runs the Full Research Experiment:
 * Flat network with 0%, 25%, 50%, 75% patching
 * Segmented network with 0%, 25%, 50%, 75% patching
 * Total: 8 configurations × numTrials (default 30 = 240 simulations)
 */
export function runFullResearchExperiment(
  baseConfig: SimulationConfig,
  trialsPerConfig: number = 30
): Record<string, TrialResult[]> {
  const patchLevels = [0, 25, 50, 75];
  const networkTypes: NetworkType[] = ['flat', 'segmented'];
  const allResults: Record<string, TrialResult[]> = {};

  networkTypes.forEach((netType) => {
    patchLevels.forEach((patchPct) => {
      const configKey = `${netType}-${patchPct}`;
      const config: SimulationConfig = {
        ...baseConfig,
        networkType: netType,
        patchPercentage: patchPct,
      };
      const trials = runRepeatedTrials(config, trialsPerConfig);
      allResults[configKey] = trials;
    });
  });

  return allResults;
}
