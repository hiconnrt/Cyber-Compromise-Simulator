import React from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Clock,
  Flame,
  CheckCircle2,
  Building2,
  TrendingUp,
} from 'lucide-react';
import {
  StepStats,
  Department,
  DepartmentResult,
  NetworkType,
} from '../types/simulation';

interface SingleRunResultsPanelProps {
  finalStats: StepStats;
  peakSpreadSpeed: number;
  largestUnaffectedSection: string;
  departmentResults: Record<Department, DepartmentResult>;
  networkType: NetworkType;
  isComplete: boolean;
}

export const SingleRunResultsPanel: React.FC<SingleRunResultsPanelProps> = ({
  finalStats,
  peakSpreadSpeed,
  largestUnaffectedSection,
  departmentResults,
  networkType,
  isComplete,
}) => {
  const depts: Department[] = ['HR', 'Finance', 'IT', 'Engineering'];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-slate-200">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-red-400" />
          Single-Run Simulation Results Report
        </h3>
        {isComplete ? (
          <span className="text-xs px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800 font-semibold">
            ● Outbreak Fully Stopped at Step {finalStats.step}
          </span>
        ) : (
          <span className="text-xs px-2 py-0.5 rounded bg-amber-950/80 text-amber-400 border border-amber-800 font-semibold">
            ● In Progress (Step {finalStats.step})
          </span>
        )}
      </div>

      {/* Main Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {/* 1. Final Compromise Percentage */}
        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
          <div className="text-xs text-slate-400 font-semibold mb-1">
            Final Compromise Rate
          </div>
          <div className="text-xl font-bold font-mono text-red-400">
            {finalStats.compromisedPct}%
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {finalStats.compromisedCount} of {finalStats.totalComputers} computers compromised
          </div>
        </div>

        {/* 2. Peak Spread Speed */}
        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
          <div className="text-xs text-slate-400 font-semibold mb-1">
            Peak Spread Speed
          </div>
          <div className="text-xl font-bold font-mono text-amber-400">
            {peakSpreadSpeed} <span className="text-xs font-normal">nodes/step</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Largest jump in a single step
          </div>
        </div>

        {/* 3. Time Until Outbreak Stopped */}
        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
          <div className="text-xs text-slate-400 font-semibold mb-1">
            Outbreak Duration
          </div>
          <div className="text-xl font-bold font-mono text-blue-400">
            {finalStats.step} <span className="text-xs font-normal">steps</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Total completed simulation steps
          </div>
        </div>

        {/* 4. Largest Unaffected Section */}
        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
          <div className="text-xs text-slate-400 font-semibold mb-1">
            Largest Unaffected Section
          </div>
          <div className="text-base font-bold text-emerald-400 truncate">
            {largestUnaffectedSection}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {networkType === 'segmented'
              ? 'Department with most safe computers'
              : 'Largest connected safe cluster'}
          </div>
        </div>
      </div>

      {/* Department Breakdown Table (for Segmented Networks) */}
      {networkType === 'segmented' && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-purple-400" />
            Department Results Breakdown
          </h4>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <th className="py-2 px-3 font-semibold">Department</th>
                  <th className="py-2 px-3 font-semibold text-right">Total Computers</th>
                  <th className="py-2 px-3 font-semibold text-right">Patched</th>
                  <th className="py-2 px-3 font-semibold text-right">Compromised</th>
                  <th className="py-2 px-3 font-semibold text-right">Unaffected</th>
                  <th className="py-2 px-3 font-semibold text-right">Final Compromise %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {depts.map((dept) => {
                  const r = departmentResults[dept];
                  if (!r || r.total === 0) return null;

                  return (
                    <tr key={dept} className="hover:bg-slate-800/50 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-white">{r.department}</td>
                      <td className="py-2.5 px-3 text-right font-mono">{r.total}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-blue-400">
                        {r.patched} ({Math.round((r.patched / r.total) * 100)}%)
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-red-400 font-semibold">
                        {r.compromised}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-emerald-400">
                        {r.unaffected}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span
                          className={`font-mono font-bold px-1.5 py-0.5 rounded ${
                            r.compromisedPct > 60
                              ? 'bg-red-950/80 text-red-400'
                              : r.compromisedPct > 30
                              ? 'bg-amber-950/80 text-amber-400'
                              : 'bg-emerald-950/80 text-emerald-400'
                          }`}
                        >
                          {r.compromisedPct}%
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
    </div>
  );
};
