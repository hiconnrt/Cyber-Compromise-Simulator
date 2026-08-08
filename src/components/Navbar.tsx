import React from 'react';
import {
  Shield,
  Activity,
  BarChart3,
  FileText,
  BookOpen,
  Code2,
  Presentation,
  PlayCircle,
  PauseCircle,
  RotateCcw,
} from 'lucide-react';

export type ActiveTab =
  | 'dashboard'
  | 'repeated'
  | 'experiment'
  | 'poster'
  | 'education'
  | 'python';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  isRunning: boolean;
  onToggleRun: () => void;
  onStep: () => void;
  onReset: () => void;
  onOpenPresentation: () => void;
  currentStep: number;
  maxSteps: number;
  isComplete: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  isRunning,
  onToggleRun,
  onStep,
  onReset,
  onOpenPresentation,
  currentStep,
  maxSteps,
  isComplete,
}) => {
  const navItems: Array<{ id: ActiveTab; label: string; icon: React.ReactNode }> = [
    { id: 'dashboard', label: 'SOC Dashboard (Live Sim)', icon: <Activity className="w-4 h-4" /> },
    { id: 'repeated', label: 'Repeated Trials (30x)', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'experiment', label: 'Research Experiment (7 Graphs)', icon: <BarChart3 className="w-4 h-4 text-cyan-400" /> },
    { id: 'poster', label: 'Poster Summary', icon: <FileText className="w-4 h-4" /> },
    { id: 'education', label: 'Cyber Education & Quiz', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'python', label: 'Python Streamlit Export', icon: <Code2 className="w-4 h-4 text-emerald-400" /> },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 px-4 py-3 sticky top-0 z-40">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center shadow-lg shadow-red-900/40">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
              Enterprise Network Security Simulator
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                SOC-PRO v2.5
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Enterprise Network Segmentation &amp; Software Patching Research
            </p>
          </div>
        </div>

        {/* Quick Simulation Controls */}
        <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800">
          <div className="flex items-center gap-2 mr-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Step:
            </span>
            <span className="text-sm font-mono font-bold text-white">
              {currentStep} / {maxSteps}
            </span>
            {isComplete && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800">
                Outbreak Stopped
              </span>
            )}
          </div>

          <button
            onClick={onToggleRun}
            disabled={isComplete && !isRunning}
            className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-sm'
                : isComplete
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-500 text-white shadow-sm shadow-red-900/50'
            }`}
          >
            {isRunning ? (
              <>
                <PauseCircle className="w-4 h-4" /> Pause
              </>
            ) : (
              <>
                <PlayCircle className="w-4 h-4" /> Start
              </>
            )}
          </button>

          <button
            onClick={onStep}
            disabled={isRunning || isComplete}
            className="px-2.5 py-1 rounded text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-700"
            title="Step forward 1 time step"
          >
            +1 Step
          </button>

          <button
            onClick={onReset}
            className="px-2.5 py-1 rounded text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1"
            title="Reset simulation to step 0"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>

        {/* Presentation Mode Button */}
        <div>
          <button
            onClick={onOpenPresentation}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white flex items-center gap-1.5 shadow-md shadow-blue-900/40"
          >
            <Presentation className="w-4 h-4" /> Demo Presentation Mode
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 mt-3 overflow-x-auto pb-1 border-t border-slate-800/80 pt-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
