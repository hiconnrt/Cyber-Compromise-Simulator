import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Play,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { SimulationConfig, TrialResult, StatisticalSummary } from '../types/simulation';
import { runRepeatedTrials } from '../utils/simulationEngine';
import { computeStatisticalSummary } from '../utils/statistics';
import { exportRawTrialsCSV } from '../utils/exportUtils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

interface RepeatedExperimentViewProps {
  config: SimulationConfig;
}

export const RepeatedExperimentView: React.FC<RepeatedExperimentViewProps> = ({
  config,
}) => {
  const [trials, setTrials] = useState<TrialResult[]>([]);
  const [summary, setSummary] = useState<StatisticalSummary | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [progress, setProgress] = useState<{ completed: number; total: number }>({
    completed: 0,
    total: config.numTrials,
  });

  const runTrials = () => {
    setIsRunning(true);
    setProgress({ completed: 0, total: config.numTrials });

    // Use small timeout so UI updates progress bar smoothly
    setTimeout(() => {
      const results = runRepeatedTrials(config, config.numTrials, (completed, total) => {
        setProgress({ completed, total });
      });
      const statsSummary = computeStatisticalSummary(results);

      setTrials(results);
      setSummary(statsSummary);
      setIsRunning(false);
    }, 50);
  };

  // Run automatically when first opening or when config changes significantly
  useEffect(() => {
    runTrials();
  }, [config.networkType, config.patchPercentage, config.numTrials, config.randomSeed]);

  // Build histogram data for chart
  const histogramData = React.useMemo(() => {
    const buckets: Record<string, number> = {
      '0-20%': 0,
      '21-40%': 0,
      '41-60%': 0,
      '61-80%': 0,
      '81-100%': 0,
    };

    trials.forEach((t) => {
      const pct = t.finalCompromisePct;
      if (pct <= 20) buckets['0-20%']++;
      else if (pct <= 40) buckets['21-40%']++;
      else if (pct <= 60) buckets['41-60%']++;
      else if (pct <= 80) buckets['61-80%']++;
      else buckets['81-100%']++;
    });

    return Object.entries(buckets).map(([range, count]) => ({
      range,
      count,
    }));
  }, [trials]);

  return (
    <div className="space-y-6 text-slate-200">
      {/* Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            Repeated Experiment Mode ({config.numTrials} Independent Trials)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Why repeated trials matter: Random network layouts, initial starting nodes, and
            probabilistic spread events produce different outcomes. Repeating the simulation
            calculates reliable statistical averages and measures variance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={runTrials}
            disabled={isRunning}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 shadow-md shadow-blue-900/40 disabled:opacity-50"
          >
            <Play className="w-4 h-4" /> Re-run {config.numTrials} Trials
          </button>

          <button
            onClick={() => exportRawTrialsCSV(trials, `cyber_trials_${config.networkType}_${config.patchPercentage}pct.csv`)}
            disabled={trials.length === 0}
            className="px-3 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-emerald-400" /> Download Trial CSV
          </button>
        </div>
      </div>

      {/* Progress Indicator */}
      {isRunning && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex justify-between items-center mb-1 text-xs font-semibold">
            <span>Running simulation trials...</span>
            <span className="font-mono">
              {progress.completed} / {progress.total}
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-500 h-2 transition-all duration-150"
              style={{
                width: `${(progress.completed / progress.total) * 100}%`,
              }}
            ></div>
          </div>
        </div>
      )}

      {/* Statistical Summary Grid */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
            <div className="text-xs text-slate-400">Mean Compromise</div>
            <div className="text-xl font-bold font-mono text-red-400 mt-1">
              {summary.meanCompromisePct}%
            </div>
            <div className="text-[10px] text-slate-400">
              95% CI: [{summary.ci95Low}% - {summary.ci95High}%]
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
            <div className="text-xs text-slate-400">Median Compromise</div>
            <div className="text-xl font-bold font-mono text-white mt-1">
              {summary.medianCompromisePct}%
            </div>
            <div className="text-[10px] text-slate-400">Middle trial outcome</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
            <div className="text-xs text-slate-400">Standard Deviation</div>
            <div className="text-xl font-bold font-mono text-amber-400 mt-1">
              {summary.stdDevCompromisePct}
            </div>
            <div className="text-[10px] text-slate-400">Spread across trials</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
            <div className="text-xs text-slate-400">Min / Max Range</div>
            <div className="text-base font-bold font-mono text-white mt-1">
              {summary.minCompromisePct}% - {summary.maxCompromisePct}%
            </div>
            <div className="text-[10px] text-slate-400">Best &amp; worst trial</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
            <div className="text-xs text-slate-400">Mean Outbreak Duration</div>
            <div className="text-xl font-bold font-mono text-blue-400 mt-1">
              {summary.meanDuration}
            </div>
            <div className="text-[10px] text-slate-400">Time steps to finish</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
            <div className="text-xs text-slate-400">Mean Unaffected</div>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
              {summary.meanUnaffectedCount}
            </div>
            <div className="text-[10px] text-slate-400">Computers safe</div>
          </div>
        </div>
      )}

      {/* Distribution Histogram & Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Histogram */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-4">
          <h3 className="text-sm font-bold text-white mb-2">
            Distribution of Final Compromise %
          </h3>
          <p className="text-xs text-slate-400 mb-3">
            Frequency of outcomes across {trials.length} trials
          </p>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={histogramData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="range" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    color: '#f8fafc',
                  }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Trials" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Trial Log Table */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col">
          <h3 className="text-sm font-bold text-white mb-2">
            Individual Trial Log ({trials.length} runs)
          </h3>

          <div className="overflow-y-auto max-h-72 border border-slate-800 rounded-lg">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-950 text-slate-400 sticky top-0 border-b border-slate-800">
                <tr>
                  <th className="py-2 px-3">Trial</th>
                  <th className="py-2 px-3">Seed</th>
                  <th className="py-2 px-3 text-right">Compromised</th>
                  <th className="py-2 px-3 text-right">Compromise %</th>
                  <th className="py-2 px-3 text-right">Peak Spread</th>
                  <th className="py-2 px-3 text-right">Duration</th>
                  <th className="py-2 px-3">Largest Unaffected Section</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {trials.map((t) => (
                  <tr key={t.trialId} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-2 px-3 font-bold text-slate-300">#{t.trialId}</td>
                    <td className="py-2 px-3 font-mono text-slate-400">{t.seed}</td>
                    <td className="py-2 px-3 text-right font-mono text-red-400 font-semibold">
                      {t.finalCompromisedCount}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-white">
                      {t.finalCompromisePct}%
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-amber-400">
                      {t.peakSpreadSpeed}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-blue-400">
                      {t.outbreakDuration} steps
                    </td>
                    <td className="py-2 px-3 text-emerald-400 truncate max-w-[150px]">
                      {t.largestUnaffectedSection}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
