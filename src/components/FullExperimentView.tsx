import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Download,
  Play,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  FileSpreadsheet,
  CheckCircle2,
  ShieldAlert,
  HelpCircle,
} from 'lucide-react';
import {
  SimulationConfig,
  TrialResult,
  FullExperimentRow,
  Department,
} from '../types/simulation';
import {
  runFullResearchExperiment,
  runRepeatedTrials,
} from '../utils/simulationEngine';
import {
  summarizeFullExperiment,
  performWelchsTTest,
  performMannWhitneyUTest,
  calculateMean,
} from '../utils/statistics';
import { exportSummaryCSV } from '../utils/exportUtils';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  ErrorBar,
} from 'recharts';

interface FullExperimentViewProps {
  baseConfig: SimulationConfig;
}

export const FullExperimentView: React.FC<FullExperimentViewProps> = ({
  baseConfig,
}) => {
  const [trialsPerConfig, setTrialsPerConfig] = useState<number>(30);
  const [resultsMap, setResultsMap] = useState<Record<string, TrialResult[]>>({});
  const [summaryRows, setSummaryRows] = useState<FullExperimentRow[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [selectedPatchTest, setSelectedPatchTest] = useState<number>(25);

  const runExperiment = () => {
    setIsRunning(true);
    setTimeout(() => {
      const allResults = runFullResearchExperiment(baseConfig, trialsPerConfig);
      const rows = summarizeFullExperiment(allResults);

      setResultsMap(allResults);
      setSummaryRows(rows);
      setIsRunning(false);
    }, 50);
  };

  // Run automatically on first mount
  useEffect(() => {
    runExperiment();
  }, []);

  // Compute baseline mean (Flat unpatched 0%)
  const baselineRow = summaryRows.find(
    (r) => r.networkType === 'flat' && r.patchPercentage === 0
  );
  const baselineMean = baselineRow ? baselineRow.meanCompromisePct : 0;

  // Prepare statistical test results comparing Flat vs Segmented at selected patch level
  const flatGroup = (resultsMap[`flat-${selectedPatchTest}`] || []).map(
    (t) => t.finalCompromisePct
  );
  const segmentedGroup = (resultsMap[`segmented-${selectedPatchTest}`] || []).map(
    (t) => t.finalCompromisePct
  );
  const welchResult = React.useMemo(
    () => performWelchsTTest(flatGroup, segmentedGroup),
    [flatGroup, segmentedGroup]
  );
  const mannWhitneyResult = React.useMemo(
    () => performMannWhitneyUTest(flatGroup, segmentedGroup),
    [flatGroup, segmentedGroup]
  );

  // Data for Graph 1: Compromise Spread Over Time (Time step curves by patch level)
  const graph1Data = React.useMemo(() => {
    // Average time-series curve for each patch level in Flat network
    const maxLen = 30;
    const timePoints: Array<Record<string, number>> = [];

    for (let step = 0; step <= maxLen; step++) {
      const row: Record<string, number> = { step };
      [0, 25, 50, 75].forEach((patch) => {
        const trials = resultsMap[`flat-${patch}`] || [];
        if (trials.length === 0) {
          row[`patch_${patch}`] = 0;
          return;
        }
        const vals = trials.map((t) => {
          const series = t.timeSeriesCompromisePct;
          return series[Math.min(step, series.length - 1)] || 0;
        });
        row[`patch_${patch}`] = Math.round(calculateMean(vals) * 10) / 10;
      });
      timePoints.push(row);
    }
    return timePoints;
  }, [resultsMap]);

  // Data for Graph 2 & 3: Patching vs Final Compromise Rate (Flat vs Segmented)
  const graph2Data = React.useMemo(() => {
    return [0, 25, 50, 75].map((patch) => {
      const fRow = summaryRows.find(
        (r) => r.networkType === 'flat' && r.patchPercentage === patch
      );
      const sRow = summaryRows.find(
        (r) => r.networkType === 'segmented' && r.patchPercentage === patch
      );
      return {
        patch: `${patch}% Patched`,
        flat: fRow?.meanCompromisePct || 0,
        flatStd: fRow?.stdDevCompromisePct || 0,
        segmented: sRow?.meanCompromisePct || 0,
        segmentedStd: sRow?.stdDevCompromisePct || 0,
      };
    });
  }, [summaryRows]);

  // Data for Graph 4: Outbreak Duration
  const graph4Data = React.useMemo(() => {
    return [0, 25, 50, 75].map((patch) => {
      const fRow = summaryRows.find(
        (r) => r.networkType === 'flat' && r.patchPercentage === patch
      );
      const sRow = summaryRows.find(
        (r) => r.networkType === 'segmented' && r.patchPercentage === patch
      );
      return {
        patch: `${patch}%`,
        flatDuration: fRow?.meanDuration || 0,
        segmentedDuration: sRow?.meanDuration || 0,
      };
    });
  }, [summaryRows]);

  // Data for Graph 5: Peak Spread Speed
  const graph5Data = React.useMemo(() => {
    return [0, 25, 50, 75].map((patch) => {
      const fRow = summaryRows.find(
        (r) => r.networkType === 'flat' && r.patchPercentage === patch
      );
      const sRow = summaryRows.find(
        (r) => r.networkType === 'segmented' && r.patchPercentage === patch
      );
      return {
        patch: `${patch}%`,
        flatPeak: fRow?.meanPeakSpread || 0,
        segmentedPeak: sRow?.meanPeakSpread || 0,
      };
    });
  }, [summaryRows]);

  // Data for Graph 6: Department Impact (HR, Finance, IT, Engineering in Segmented)
  const graph6Data = React.useMemo(() => {
    const depts: Department[] = ['HR', 'Finance', 'IT', 'Engineering'];
    return depts.map((d) => {
      const row0 = summaryRows.find(
        (r) => r.networkType === 'segmented' && r.patchPercentage === 0
      );
      const row25 = summaryRows.find(
        (r) => r.networkType === 'segmented' && r.patchPercentage === 25
      );
      const row50 = summaryRows.find(
        (r) => r.networkType === 'segmented' && r.patchPercentage === 50
      );
      const row75 = summaryRows.find(
        (r) => r.networkType === 'segmented' && r.patchPercentage === 75
      );
      return {
        department: d,
        '0% Patched': row0?.departmentAverages?.[d] || 0,
        '25% Patched': row25?.departmentAverages?.[d] || 0,
        '50% Patched': row50?.departmentAverages?.[d] || 0,
        '75% Patched': row75?.departmentAverages?.[d] || 0,
      };
    });
  }, [summaryRows]);

  // Data for Graph 7: Unaffected Computers
  const graph7Data = React.useMemo(() => {
    return [0, 25, 50, 75].map((patch) => {
      const fRow = summaryRows.find(
        (r) => r.networkType === 'flat' && r.patchPercentage === patch
      );
      const sRow = summaryRows.find(
        (r) => r.networkType === 'segmented' && r.patchPercentage === patch
      );
      return {
        patch: `${patch}%`,
        flatSafe: fRow?.meanUnaffectedCount || 0,
        segmentedSafe: sRow?.meanUnaffectedCount || 0,
      };
    });
  }, [summaryRows]);

  return (
    <div className="space-y-8 text-slate-200">
      {/* Top Banner & Run Full Research Experiment Button */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            Full Research Experiment (8 Configurations × {trialsPerConfig} Trials ={' '}
            {summaryRows.length > 0 ? summaryRows.length * trialsPerConfig : 240} Runs)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Tests Flat vs. Segmented enterprise networks across 0%, 25%, 50%, and 75%
            patching. Generates statistical tables, t-tests, and all 7 required graphs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="text-xs text-slate-400">Trials per config:</span>
            <select
              value={trialsPerConfig}
              onChange={(e) => setTrialsPerConfig(Number(e.target.value))}
              className="bg-slate-800 border border-slate-700 text-xs text-white rounded px-2 py-1 font-bold"
            >
              <option value={10}>10 trials (80 total)</option>
              <option value={20}>20 trials (160 total)</option>
              <option value={30}>30 trials (240 total - Default)</option>
              <option value={50}>50 trials (400 total)</option>
            </select>
          </div>

          <button
            onClick={runExperiment}
            disabled={isRunning}
            className="px-5 py-2.5 rounded-lg text-xs font-bold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white flex items-center gap-2 shadow-lg shadow-cyan-950/50 disabled:opacity-50"
          >
            <Play className="w-4 h-4" /> Run Full Research Experiment
          </button>

          <button
            onClick={() =>
              exportSummaryCSV(
                summaryRows,
                `cyber_research_summary_${trialsPerConfig}trials.csv`
              )
            }
            disabled={summaryRows.length === 0}
            className="px-4 py-2.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-emerald-400" /> Download Summary CSV
          </button>
        </div>
      </div>

      {isRunning && (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-400 mx-auto mb-2"></div>
          <div className="text-sm font-bold text-white">
            Running 8 experimental configurations ({trialsPerConfig} trials each)...
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Calculating spread curves, duration, peak spread speed, and department
            averages...
          </div>
        </div>
      )}

      {/* 1. REQUIRED RESULTS TABLE */}
      {summaryRows.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              Comprehensive Results Table (Generated from {trialsPerConfig} trials/config)
            </h3>
            <span className="text-xs text-slate-400">
              Baseline: Flat Network 0% Patched ({baselineMean}% mean compromise)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <th className="py-2.5 px-3 font-semibold">Network</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Patch %</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Trials</th>
                  <th className="py-2.5 px-3 font-semibold text-right">
                    Mean Compromise %
                  </th>
                  <th className="py-2.5 px-3 font-semibold text-right">
                    Standard Dev
                  </th>
                  <th className="py-2.5 px-3 font-semibold text-right">
                    95% CI
                  </th>
                  <th className="py-2.5 px-3 font-semibold text-right">
                    Mean Duration
                  </th>
                  <th className="py-2.5 px-3 font-semibold text-right">
                    Mean Peak Spread
                  </th>
                  <th className="py-2.5 px-3 font-semibold text-right">
                    Mean Unaffected
                  </th>
                  <th className="py-2.5 px-3 font-semibold text-right">
                    % Reduction vs Baseline
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {summaryRows.map((row) => {
                  const reduction =
                    baselineMean > 0
                      ? Math.round(
                          ((baselineMean - row.meanCompromisePct) / baselineMean) * 1000
                        ) / 10
                      : 0;
                  const isSegmented = row.networkType === 'segmented';

                  return (
                    <tr
                      key={row.configId}
                      className="hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-2.5 px-3 font-bold text-white flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isSegmented ? 'bg-blue-400' : 'bg-red-400'
                          }`}
                        ></span>
                        {isSegmented ? 'Segmented Enterprise' : 'Flat Office Network'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-400">
                        {row.patchPercentage}%
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-400">
                        {row.trials}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-red-400">
                        {row.meanCompromisePct}%
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-amber-400">
                        {row.stdDevCompromisePct}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-300">
                        [{row.ci95Low}% - {row.ci95High}%]
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-blue-300">
                        {row.meanDuration} steps
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-rose-300">
                        {row.meanPeakSpread} / step
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-emerald-400 font-semibold">
                        {row.meanUnaffectedCount}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span
                          className={`font-mono font-bold px-1.5 py-0.5 rounded ${
                            reduction > 50
                              ? 'bg-emerald-950/80 text-emerald-400'
                              : reduction > 20
                              ? 'bg-blue-950/80 text-blue-400'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {reduction}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. STATISTICAL ANALYSIS CARD (Welch's t-test & Mann-Whitney U Test) */}
      {summaryRows.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                Statistical Significance Testing (Flat vs. Segmented Network)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Compares independent sample distributions using Welch's t-test and
                Mann-Whitney U non-parametric test (α = 0.05).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Compare at Patch Level:</span>
              <div className="flex gap-1">
                {[0, 25, 50, 75].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setSelectedPatchTest(preset)}
                    className={`px-2.5 py-1 rounded text-xs font-semibold border transition-all ${
                      selectedPatchTest === preset
                        ? 'bg-cyan-600 border-cyan-500 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {preset}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Test Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Welch's t-test */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  {welchResult.testName}
                </span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded ${
                    welchResult.isSignificant
                      ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {welchResult.isSignificant
                    ? '● Statistically Significant (p < 0.05)'
                    : '● Not Statistically Significant'}
                </span>
              </div>
              <div className="flex items-center gap-6 font-mono text-sm mb-3">
                <div>
                  <span className="text-slate-500 text-xs">Test Statistic (t):</span>{' '}
                  <span className="font-bold text-white">{welchResult.statistic}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-xs">p-value:</span>{' '}
                  <span className="font-bold text-cyan-400">{welchResult.pValue}</span>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed border-t border-slate-800/80 pt-2">
                {welchResult.interpretation}
              </p>
            </div>

            {/* Mann-Whitney U Test */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                  {mannWhitneyResult.testName}
                </span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded ${
                    mannWhitneyResult.isSignificant
                      ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {mannWhitneyResult.isSignificant
                    ? '● Statistically Significant (p < 0.05)'
                    : '● Not Statistically Significant'}
                </span>
              </div>
              <div className="flex items-center gap-6 font-mono text-sm mb-3">
                <div>
                  <span className="text-slate-500 text-xs">U Statistic:</span>{' '}
                  <span className="font-bold text-white">
                    {mannWhitneyResult.statistic}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-xs">p-value:</span>{' '}
                  <span className="font-bold text-blue-400">
                    {mannWhitneyResult.pValue}
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed border-t border-slate-800/80 pt-2">
                {mannWhitneyResult.interpretation}
              </p>
            </div>
          </div>

          <div className="mt-3 p-2.5 rounded bg-slate-950/60 border border-slate-800 text-slate-400 text-xs flex items-center gap-2">
            <HelpCircle className="w-4 h-4 shrink-0 text-slate-400" />
            <span>
              <strong>Note on Statistical Significance:</strong> A statistically
              significant p-value indicates that the observed reduction in compromise
              percentage is unlikely to be due to random chance alone in this simulation.
              It does not automatically prove practical importance or real-world causation
              in arbitrary network deployments.
            </span>
          </div>
        </div>
      )}

      {/* 3. ALL 7 REQUIRED RESEARCH GRAPHS */}
      {summaryRows.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            Required Research Poster Visualizations (Graphs 1 to 7)
          </h3>

          {/* ROW 1: Graph 1 (Spread over time) and Graph 2 (Patching vs Final Compromise Rate) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Graph 1 */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col">
              <h4 className="text-sm font-bold text-white mb-1">
                Graph 1: Compromise Spread Over Time (Flat Office Network)
              </h4>
              <p className="text-xs text-slate-400 mb-4">
                Average % compromised across time steps for each patch level (0% to 75%).
              </p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={graph1Data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis
                      dataKey="step"
                      stroke="#94a3b8"
                      fontSize={11}
                      label={{
                        value: 'Time Step',
                        position: 'insideBottom',
                        offset: -5,
                        fill: '#94a3b8',
                      }}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={11}
                      unit="%"
                      domain={[0, 100]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        color: '#f8fafc',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                    <Line
                      type="monotone"
                      dataKey="patch_0"
                      name="0% Patched"
                      stroke="#ef4444"
                      strokeWidth={2.5}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="patch_25"
                      name="25% Patched"
                      stroke="#f97316"
                      strokeWidth={2.5}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="patch_50"
                      name="50% Patched"
                      stroke="#3b82f6"
                      strokeWidth={2.5}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="patch_75"
                      name="75% Patched"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Graph 2 */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col">
              <h4 className="text-sm font-bold text-white mb-1">
                Graph 2: Patching vs. Final Compromise Rate
              </h4>
              <p className="text-xs text-slate-400 mb-4">
                Average final compromise % for Flat vs. Segmented networks across patch
                levels.
              </p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={graph2Data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="patch" stroke="#94a3b8" fontSize={11} />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={11}
                      unit="%"
                      domain={[0, 100]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        color: '#f8fafc',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                    <Bar
                      dataKey="flat"
                      name="Flat Office Network"
                      fill="#ef4444"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="segmented"
                      name="Segmented Enterprise Network"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* ROW 2: Graph 3 (Flat vs Segmented Grouped) and Graph 4 (Outbreak Duration) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Graph 3 */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col">
              <h4 className="text-sm font-bold text-white mb-1">
                Graph 3: Flat vs. Segmented Networks (Grouped Comparison)
              </h4>
              <p className="text-xs text-slate-400 mb-4">
                Direct comparison showing how segmentation contains outbreaks at each
                patch level.
              </p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={graph2Data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="patch" stroke="#94a3b8" fontSize={11} />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={11}
                      unit="%"
                      domain={[0, 100]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        color: '#f8fafc',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                    <Line
                      type="monotone"
                      dataKey="flat"
                      name="Flat Office Network (%)"
                      stroke="#ef4444"
                      strokeWidth={3}
                      dot={{ r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="segmented"
                      name="Segmented Network (%)"
                      stroke="#38bdf8"
                      strokeWidth={3}
                      dot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Graph 4 */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col">
              <h4 className="text-sm font-bold text-white mb-1">
                Graph 4: Outbreak Duration (Time Steps to Stop)
              </h4>
              <p className="text-xs text-slate-400 mb-4">
                Average number of time steps before the outbreak ceased spreading.
              </p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={graph4Data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="patch" stroke="#94a3b8" fontSize={11} />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={11}
                      unit=" steps"
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        color: '#f8fafc',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                    <Bar
                      dataKey="flatDuration"
                      name="Flat Office Duration"
                      fill="#f59e0b"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="segmentedDuration"
                      name="Segmented Enterprise Duration"
                      fill="#6366f1"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* ROW 3: Graph 5 (Peak Spread Speed) and Graph 6 (Department Impact) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Graph 5 */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col">
              <h4 className="text-sm font-bold text-white mb-1">
                Graph 5: Peak Spread Speed (Max Nodes Compromised/Step)
              </h4>
              <p className="text-xs text-slate-400 mb-4">
                Measures how quickly the compromise spreads at its most intense moment.
              </p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={graph5Data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="patch" stroke="#94a3b8" fontSize={11} />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={11}
                      unit=" nodes"
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        color: '#f8fafc',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                    <Bar
                      dataKey="flatPeak"
                      name="Flat Network Peak Speed"
                      fill="#ef4444"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="segmentedPeak"
                      name="Segmented Peak Speed"
                      fill="#06b6d4"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Graph 6 */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col">
              <h4 className="text-sm font-bold text-white mb-1">
                Graph 6: Department Impact (Segmented Enterprise Network)
              </h4>
              <p className="text-xs text-slate-400 mb-4">
                Average compromise percentage across HR, Finance, IT, and Engineering.
              </p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={graph6Data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="department" stroke="#94a3b8" fontSize={11} />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={11}
                      unit="%"
                      domain={[0, 100]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        color: '#f8fafc',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                    <Bar
                      dataKey="0% Patched"
                      name="0% Patched"
                      fill="#ef4444"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="25% Patched"
                      name="25% Patched"
                      fill="#f97316"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="50% Patched"
                      name="50% Patched"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="75% Patched"
                      name="75% Patched"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* ROW 4: Graph 7 (Unaffected Computers) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h4 className="text-sm font-bold text-white mb-1">
              Graph 7: Unaffected Computers (Safe Nodes Preserved)
            </h4>
            <p className="text-xs text-slate-400 mb-4">
              Number of computers that remained completely unaffected by the outbreak.
            </p>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={graph7Data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="patch" stroke="#94a3b8" fontSize={11} />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    unit=" safe"
                    domain={[0, 100]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      color: '#f8fafc',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                  <Bar
                    dataKey="flatSafe"
                    name="Flat Office Safe Computers"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="segmentedSafe"
                    name="Segmented Enterprise Safe Computers"
                    fill="#14b8a6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
