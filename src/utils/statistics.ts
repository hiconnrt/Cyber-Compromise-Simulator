import {
  TrialResult,
  StatisticalSummary,
  StatTestResult,
  FullExperimentRow,
  Department,
} from '../types/simulation';

/**
 * Computes descriptive statistics for an array of numbers
 */
export function calculateMean(arr: number[]): number {
  if (arr.length === 0) return 0;
  const sum = arr.reduce((acc, val) => acc + val, 0);
  return sum / arr.length;
}

export function calculateMedian(arr: number[]): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

export function calculateStdDev(arr: number[], mean?: number): number {
  if (arr.length <= 1) return 0;
  const m = mean !== undefined ? mean : calculateMean(arr);
  const varianceSum = arr.reduce((acc, val) => acc + Math.pow(val - m, 2), 0);
  return Math.sqrt(varianceSum / (arr.length - 1));
}

/**
 * Standard error and 95% Confidence Interval
 * CI = mean +/- 1.96 * (stdDev / sqrt(N))
 */
export function calculate95CI(arr: number[]): { mean: number; low: number; high: number } {
  const mean = calculateMean(arr);
  const stdDev = calculateStdDev(arr, mean);
  const se = stdDev / Math.sqrt(Math.max(1, arr.length));
  const margin = 1.96 * se;
  return {
    mean,
    low: Math.max(0, Math.round((mean - margin) * 10) / 10),
    high: Math.min(100, Math.round((mean + margin) * 10) / 10),
  };
}

/**
 * Computes full statistical summary for a set of trial results
 */
export function computeStatisticalSummary(
  trials: TrialResult[],
  baselineMeanPct?: number
): StatisticalSummary {
  if (trials.length === 0) {
    return {
      meanCompromisePct: 0,
      medianCompromisePct: 0,
      stdDevCompromisePct: 0,
      minCompromisePct: 0,
      maxCompromisePct: 0,
      ci95Low: 0,
      ci95High: 0,
      meanDuration: 0,
      meanPeakSpread: 0,
      meanUnaffectedCount: 0,
      percentReductionFromBaseline: 0,
    };
  }

  const pcts = trials.map((t) => t.finalCompromisePct);
  const durations = trials.map((t) => t.outbreakDuration);
  const peakSpeeds = trials.map((t) => t.peakSpreadSpeed);
  const unaffected = trials.map((t) => t.unaffectedCount);

  const meanCompromisePct = Math.round(calculateMean(pcts) * 10) / 10;
  const medianCompromisePct = Math.round(calculateMedian(pcts) * 10) / 10;
  const stdDevCompromisePct = Math.round(calculateStdDev(pcts, meanCompromisePct) * 10) / 10;
  const minCompromisePct = Math.min(...pcts);
  const maxCompromisePct = Math.max(...pcts);

  const { low: ci95Low, high: ci95High } = calculate95CI(pcts);

  const meanDuration = Math.round(calculateMean(durations) * 10) / 10;
  const meanPeakSpread = Math.round(calculateMean(peakSpeeds) * 10) / 10;
  const meanUnaffectedCount = Math.round(calculateMean(unaffected) * 10) / 10;

  // Formula: ((baseline mean - comparison mean) / baseline mean) * 100
  let percentReductionFromBaseline = 0;
  if (baselineMeanPct !== undefined && baselineMeanPct > 0) {
    percentReductionFromBaseline =
      Math.round(((baselineMeanPct - meanCompromisePct) / baselineMeanPct) * 1000) / 10;
  }

  return {
    meanCompromisePct,
    medianCompromisePct,
    stdDevCompromisePct,
    minCompromisePct,
    maxCompromisePct,
    ci95Low,
    ci95High,
    meanDuration,
    meanPeakSpread,
    meanUnaffectedCount,
    percentReductionFromBaseline,
  };
}

/**
 * Welch's Independent-Samples t-test for comparing two independent groups with unequal variances
 */
export function performWelchsTTest(
  groupA: number[],
  groupB: number[],
  alpha: number = 0.05
): StatTestResult {
  const nA = groupA.length;
  const nB = groupB.length;
  const meanA = calculateMean(groupA);
  const meanB = calculateMean(groupB);
  const varA = Math.pow(calculateStdDev(groupA, meanA), 2);
  const varB = Math.pow(calculateStdDev(groupB, meanB), 2);

  if (nA < 2 || nB < 2 || (varA === 0 && varB === 0)) {
    const diff = Math.abs(meanA - meanB);
    return {
      testName: "Welch's Independent-Samples t-test",
      statistic: 0,
      pValue: diff === 0 ? 1.0 : 0.001,
      isSignificant: diff > 0,
      interpretation:
        diff > 0
          ? 'Group means differ with zero variance.'
          : 'Group means are identical with zero variance.',
    };
  }

  const seDiff = Math.sqrt(varA / nA + varB / nB);
  if (seDiff === 0) {
    return {
      testName: "Welch's Independent-Samples t-test",
      statistic: 0,
      pValue: 1.0,
      isSignificant: false,
      interpretation: 'No variance in either group; means are indistinguishable.',
    };
  }

  const tStat = (meanA - meanB) / seDiff;

  // Welch–Satterthwaite degrees of freedom
  const dfNum = Math.pow(varA / nA + varB / nB, 2);
  const dfDen =
    Math.pow(varA / nA, 2) / (nA - 1) + Math.pow(varB / nB, 2) / (nB - 1);
  const df = dfNum / (dfDen || 1);

  // Normal approximation for two-tailed p-value (accurate for df > 15)
  const z = Math.abs(tStat);
  const pValue = 2 * (1 - normalCDF(z));

  const isSignificant = pValue < alpha;

  let interpretation = '';
  if (isSignificant) {
    interpretation = `The difference in final compromise rates between the two networks is statistically significant (p = ${pValue.toFixed(
      4
    )}, α = ${alpha}). This suggests network segmentation reliably alters spread outcomes. Note: Statistical significance does not automatically prove practical importance or real-world causation.`;
  } else {
    interpretation = `The difference between the two networks is not statistically significant (p = ${pValue.toFixed(
      4
    )}, α = ${alpha}). There is insufficient evidence to conclude the network structure alone caused a reliable difference at this sample size.`;
  }

  return {
    testName: "Welch's Independent-Samples t-test",
    statistic: Math.round(tStat * 100) / 100,
    pValue: Math.round(pValue * 10000) / 10000,
    isSignificant,
    interpretation,
  };
}

/**
 * Mann-Whitney U test for non-parametric comparison
 */
export function performMannWhitneyUTest(
  groupA: number[],
  groupB: number[],
  alpha: number = 0.05
): StatTestResult {
  const n1 = groupA.length;
  const n2 = groupB.length;
  const combined = [
    ...groupA.map((val) => ({ val, group: 'A' as const })),
    ...groupB.map((val) => ({ val, group: 'B' as const })),
  ];

  combined.sort((a, b) => a.val - b.val);

  // Assign ranks with tie handling
  let rankSumA = 0;
  let i = 0;
  while (i < combined.length) {
    let j = i;
    while (j < combined.length && combined[j].val === combined[i].val) {
      j++;
    }
    const rank = (i + 1 + j) / 2;
    for (let k = i; k < j; k++) {
      if (combined[k].group === 'A') {
        rankSumA += rank;
      }
    }
    i = j;
  }

  const uA = rankSumA - (n1 * (n1 + 1)) / 2;
  const uB = n1 * n2 - uA;
  const uStat = Math.min(uA, uB);

  // Z-score approximation
  const meanU = (n1 * n2) / 2;
  const stdU = Math.sqrt((n1 * n2 * (n1 + n2 + 1)) / 12);
  const z = stdU > 0 ? Math.abs((uStat - meanU) / stdU) : 0;
  const pValue = 2 * (1 - normalCDF(z));

  const isSignificant = pValue < alpha;
  const interpretation = isSignificant
    ? `Mann-Whitney U test indicates a statistically significant difference in distribution ranks (p = ${pValue.toFixed(
        4
      )}, α = ${alpha}). Note: Statistical significance does not automatically prove practical importance.`
    : `Mann-Whitney U test shows no statistically significant difference in rank distributions (p = ${pValue.toFixed(
        4
      )}, α = ${alpha}).`;

  return {
    testName: 'Mann–Whitney U Test (Non-Parametric)',
    statistic: Math.round(uStat * 100) / 100,
    pValue: Math.round(pValue * 10000) / 10000,
    isSignificant,
    interpretation,
  };
}

/**
 * Standard Normal Cumulative Distribution Function approximation
 */
function normalCDF(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  const prob =
    d *
    t *
    (0.3193815 +
      t *
        (-0.3565638 +
          t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - prob : prob;
}

/**
 * Summarizes the full 8-configuration experiment into rows for table and charts
 */
export function summarizeFullExperiment(
  resultsMap: Record<string, TrialResult[]>
): FullExperimentRow[] {
  const flatUnpatched = resultsMap['flat-0'] || [];
  const baselinePct =
    flatUnpatched.length > 0
      ? calculateMean(flatUnpatched.map((t) => t.finalCompromisePct))
      : 0;

  const rows: FullExperimentRow[] = [];

  const configs: Array<{ net: 'flat' | 'segmented'; patch: number }> = [
    { net: 'flat', patch: 0 },
    { net: 'flat', patch: 25 },
    { net: 'flat', patch: 50 },
    { net: 'flat', patch: 75 },
    { net: 'segmented', patch: 0 },
    { net: 'segmented', patch: 25 },
    { net: 'segmented', patch: 50 },
    { net: 'segmented', patch: 75 },
  ];

  configs.forEach(({ net, patch }) => {
    const key = `${net}-${patch}`;
    const trials = resultsMap[key] || [];
    const summary = computeStatisticalSummary(trials, baselinePct);

    let departmentAverages: Record<Department, number> | undefined;
    if (net === 'segmented' && trials.length > 0) {
      const depts: Department[] = ['HR', 'Finance', 'IT', 'Engineering'];
      departmentAverages = {} as Record<Department, number>;
      depts.forEach((d) => {
        const pcts = trials.map(
          (t) => t.departmentResults[d]?.compromisedPct || 0
        );
        departmentAverages![d] = Math.round(calculateMean(pcts) * 10) / 10;
      });
    }

    rows.push({
      configId: key,
      networkType: net,
      patchPercentage: patch,
      trials: trials.length,
      meanCompromisePct: summary.meanCompromisePct,
      stdDevCompromisePct: summary.stdDevCompromisePct,
      meanDuration: summary.meanDuration,
      meanPeakSpread: summary.meanPeakSpread,
      meanUnaffectedCount: summary.meanUnaffectedCount,
      ci95Low: summary.ci95Low,
      ci95High: summary.ci95High,
      departmentAverages,
    });
  });

  return rows;
}
