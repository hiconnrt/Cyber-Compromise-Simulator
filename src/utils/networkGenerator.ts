import { ComputerNode, NetworkEdge, NetworkType, Department } from '../types/simulation';
import { DeterministicRNG } from './random';

const DEPARTMENTS: Department[] = ['HR', 'Finance', 'IT', 'Engineering'];

export interface NetworkGraphData {
  nodes: ComputerNode[];
  edges: NetworkEdge[];
  adjacencyList: Map<number, number[]>;
}

/**
 * Generates either a Flat Office Network or a Segmented Enterprise Network
 * using deterministic RNG so the same seed & settings always produce the exact same network.
 */
export function generateNetwork(
  networkType: NetworkType,
  numComputers: number,
  avgConnections: number,
  seed: number
): NetworkGraphData {
  const rng = new DeterministicRNG(seed);
  const nodes: ComputerNode[] = [];
  const edges: NetworkEdge[] = [];
  const adjacencyList = new Map<number, number[]>();

  for (let i = 0; i < numComputers; i++) {
    adjacencyList.set(i, []);
  }

  // Helper to add undirected edge if not existing
  const addEdge = (u: number, v: number, isCrossDept: boolean) => {
    if (u === v) return;
    const uList = adjacencyList.get(u)!;
    if (uList.includes(v)) return;

    uList.push(v);
    adjacencyList.get(v)!.push(u);

    const id = u < v ? `${u}-${v}` : `${v}-${u}`;
    edges.push({
      id,
      source: u,
      target: v,
      isCrossDepartment: isCrossDept,
    });
  };

  if (networkType === 'flat') {
    // FLAT OFFICE NETWORK
    // Position nodes in an aesthetically pleasing circular/spiral pattern with jitter
    const radius = 240;
    for (let i = 0; i < numComputers; i++) {
      const angle = (i / numComputers) * Math.PI * 2;
      const rOffset = (rng.nextFloat() - 0.5) * 80;
      const x = 350 + Math.cos(angle) * (radius + rOffset);
      const y = 350 + Math.sin(angle) * (radius + rOffset);

      nodes.push({
        id: i,
        label: `WS-${100 + i}`,
        department: 'None',
        state: 'vulnerable',
        compromiseStep: null,
        x,
        y,
        connections: [],
      });
    }

    // Connect nodes: first ensure graph is connected (spanning tree)
    const shuffledIds = rng.shuffle(Array.from({ length: numComputers }, (_, i) => i));
    for (let i = 0; i < numComputers - 1; i++) {
      addEdge(shuffledIds[i], shuffledIds[i + 1], false);
    }
    // Connect end to start to form a loop
    addEdge(shuffledIds[numComputers - 1], shuffledIds[0], false);

    // Add random edges until average degree approximates avgConnections
    const targetEdges = Math.round((numComputers * avgConnections) / 2);
    let attempts = 0;
    while (edges.length < targetEdges && attempts < numComputers * 10) {
      attempts++;
      const u = rng.nextInt(0, numComputers - 1);
      const v = rng.nextInt(0, numComputers - 1);
      addEdge(u, v, false);
    }
  } else {
    // SEGMENTED ENTERPRISE NETWORK
    // Divide computers evenly into 4 departments
    const deptCenters: Record<string, { x: number; y: number }> = {
      HR: { x: 180, y: 180 },
      Finance: { x: 520, y: 180 },
      IT: { x: 180, y: 520 },
      Engineering: { x: 520, y: 520 },
    };

    const deptBuckets: Record<Department, number[]> = {
      HR: [],
      Finance: [],
      IT: [],
      Engineering: [],
      None: [],
    };

    for (let i = 0; i < numComputers; i++) {
      const deptIdx = i % 4;
      const dept = DEPARTMENTS[deptIdx];
      deptBuckets[dept].push(i);

      const center = deptCenters[dept];
      const angle = rng.nextFloat() * Math.PI * 2;
      const dist = 30 + rng.nextFloat() * 85;
      const x = center.x + Math.cos(angle) * dist;
      const y = center.y + Math.sin(angle) * dist;

      nodes.push({
        id: i,
        label: `${dept}-${100 + i}`,
        department: dept,
        state: 'vulnerable',
        compromiseStep: null,
        x,
        y,
        connections: [],
      });
    }

    // For each department, connect internally with a spanning tree + extra edges
    const totalTargetEdges = Math.round((numComputers * avgConnections) / 2);
    const internalTargetEdges = Math.round(totalTargetEdges * 0.88); // 88% internal
    const crossTargetEdges = Math.max(4, totalTargetEdges - internalTargetEdges); // ~12% cross

    DEPARTMENTS.forEach((dept) => {
      const bucket = deptBuckets[dept];
      if (bucket.length <= 1) return;

      const shuffled = rng.shuffle([...bucket]);
      for (let i = 0; i < shuffled.length - 1; i++) {
        addEdge(shuffled[i], shuffled[i + 1], false);
      }
      addEdge(shuffled[shuffled.length - 1], shuffled[0], false);

      // Add extra intra-department edges
      const deptTargetEdges = Math.round(internalTargetEdges / 4);
      let attempts = 0;
      let currentDeptEdges = bucket.length;
      while (currentDeptEdges < deptTargetEdges && attempts < bucket.length * 8) {
        attempts++;
        const u = rng.choice(bucket);
        const v = rng.choice(bucket);
        if (u !== v) {
          const before = edges.length;
          addEdge(u, v, false);
          if (edges.length > before) currentDeptEdges++;
        }
      }
    });

    // Now add small number of cross-department connections (visually distinguishable!)
    let crossAdded = 0;
    let attempts = 0;
    while (crossAdded < crossTargetEdges && attempts < 200) {
      attempts++;
      const d1 = rng.choice(DEPARTMENTS);
      let d2 = rng.choice(DEPARTMENTS);
      while (d2 === d1) {
        d2 = rng.choice(DEPARTMENTS);
      }

      const u = rng.choice(deptBuckets[d1]);
      const v = rng.choice(deptBuckets[d2]);
      const before = edges.length;
      addEdge(u, v, true);
      if (edges.length > before) {
        crossAdded++;
      }
    }
  }

  // Populate node connections from adjacencyList
  nodes.forEach((node) => {
    node.connections = [...(adjacencyList.get(node.id) || [])];
  });

  return {
    nodes,
    edges,
    adjacencyList,
  };
}
