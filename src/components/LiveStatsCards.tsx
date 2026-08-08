import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertOctagon,
  Activity,
  Cpu,
  Clock,
  TrendingUp,
  Flame,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { StepStats } from '../types/simulation';

interface LiveStatsCardsProps {
  stats: StepStats;
  peakSpreadSpeed: number;
}

export const LiveStatsCards: React.FC<LiveStatsCardsProps> = ({
  stats,
  peakSpreadSpeed,
}) => {
  const cards = [
    {
      label: 'Time Step',
      value: stats.step,
      unit: 'steps',
      icon: <Clock className="w-4 h-4 text-slate-400" />,
      badge: 'Current',
      color: 'border-slate-800 bg-slate-900/80',
    },
    {
      label: 'Total Computers',
      value: stats.totalComputers,
      unit: 'nodes',
      icon: <Cpu className="w-4 h-4 text-slate-400" />,
      badge: '100%',
      color: 'border-slate-800 bg-slate-900/80',
    },
    {
      label: 'Compromised',
      value: stats.compromisedCount,
      unit: 'computers',
      icon: <AlertOctagon className="w-4 h-4 text-red-400" />,
      badge: `${stats.compromisedPct}%`,
      color: 'border-red-950/60 bg-red-950/20 text-red-200',
      valueColor: 'text-red-400',
    },
    {
      label: 'Newly Compromised',
      value: stats.newlyCompromisedCount,
      unit: 'this step',
      icon: <Flame className="w-4 h-4 text-amber-400" />,
      badge: stats.newlyCompromisedCount > 0 ? '+Active' : '0 new',
      color: 'border-amber-950/60 bg-amber-950/20 text-amber-200',
      valueColor: 'text-amber-400',
    },
    {
      label: 'Patched Computers',
      value: stats.patchedCount,
      unit: 'protected',
      icon: <ShieldCheck className="w-4 h-4 text-blue-400" />,
      badge: `${Math.round((stats.patchedCount / stats.totalComputers) * 100)}%`,
      color: 'border-blue-950/60 bg-blue-950/20 text-blue-200',
      valueColor: 'text-blue-400',
    },
    {
      label: 'Vulnerable',
      value: stats.vulnerableCount,
      unit: 'unpatched',
      icon: <ShieldAlert className="w-4 h-4 text-orange-400" />,
      badge: `${Math.round((stats.vulnerableCount / stats.totalComputers) * 100)}%`,
      color: 'border-orange-950/60 bg-orange-950/20 text-orange-200',
      valueColor: 'text-orange-400',
    },
    {
      label: '% Compromised',
      value: `${stats.compromisedPct}%`,
      unit: 'total',
      icon: <TrendingUp className="w-4 h-4 text-red-400" />,
      badge: 'Rate',
      color: 'border-red-950/60 bg-slate-900/80',
      valueColor: 'text-red-400',
    },
    {
      label: '% Unaffected',
      value: `${stats.unaffectedPct}%`,
      unit: 'safe',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
      badge: 'Secure',
      color: 'border-emerald-950/60 bg-slate-900/80',
      valueColor: 'text-emerald-400',
    },
    {
      label: 'Spread Rate',
      value: stats.spreadRate,
      unit: 'nodes/step',
      icon: <Activity className="w-4 h-4 text-amber-400" />,
      badge: 'Current',
      color: 'border-slate-800 bg-slate-900/80',
    },
    {
      label: 'Peak Spread Rate',
      value: peakSpreadSpeed,
      unit: 'max nodes/step',
      icon: <Flame className="w-4 h-4 text-rose-400" />,
      badge: 'Highest',
      color: 'border-rose-950/60 bg-slate-900/80',
      valueColor: 'text-rose-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-2 mb-4">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className={`p-2.5 rounded-lg border ${card.color} transition-all flex flex-col justify-between`}
        >
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[11px] font-semibold text-slate-400 truncate">
              {card.label}
            </span>
            {card.icon}
          </div>
          <div>
            <div
              className={`text-base font-bold font-mono tracking-tight leading-none ${
                card.valueColor || 'text-white'
              }`}
            >
              {card.value}
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-[10px] text-slate-500">{card.unit}</span>
              <span className="text-[10px] font-semibold px-1 py-0.2 rounded bg-slate-800/80 text-slate-300">
                {card.badge}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
