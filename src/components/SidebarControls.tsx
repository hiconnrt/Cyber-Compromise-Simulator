import React from 'react';
import {
  ShieldAlert,
  Sliders,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Shuffle,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import { NetworkType, SimulationConfig } from '../types/simulation';

interface SidebarControlsProps {
  config: SimulationConfig;
  onChangeConfig: (newConfig: SimulationConfig) => void;
  isRunning: boolean;
  onToggleRun: () => void;
  onStep: () => void;
  onReset: () => void;
  onRunComparison: () => void;
  onRunGuidedDemo: () => void;
  isComplete: boolean;
}

export const SidebarControls: React.FC<SidebarControlsProps> = ({
  config,
  onChangeConfig,
  isRunning,
  onToggleRun,
  onStep,
  onReset,
  onRunComparison,
  onRunGuidedDemo,
  isComplete,
}) => {
  const handleNetworkTypeChange = (type: NetworkType) => {
    onChangeConfig({ ...config, networkType: type });
  };

  const handlePatchPreset = (pct: number) => {
    onChangeConfig({ ...config, patchPercentage: pct });
  };

  const handleRandomizeSeed = () => {
    const newSeed = Math.floor(Math.random() * 100000) + 1;
    onChangeConfig({ ...config, randomSeed: newSeed });
  };

  const isPatchedHigherThanVuln =
    config.patchedCompromiseProb > config.vulnerableCompromiseProb;

  return (
    <aside className="w-80 bg-slate-900/95 border-r border-slate-800 text-slate-200 p-4 flex flex-col gap-5 h-[calc(100vh-105px)] overflow-y-auto shrink-0">
      {/* Network Topology */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
          1. Network Architecture
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleNetworkTypeChange('flat')}
            className={`p-2 rounded-lg border text-left transition-all ${
              config.networkType === 'flat'
                ? 'bg-red-950/40 border-red-600 text-white shadow-sm'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-300'
            }`}
          >
            <div className="font-semibold text-xs">Flat Office</div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              1 zone, free spread
            </div>
          </button>
          <button
            type="button"
            onClick={() => handleNetworkTypeChange('segmented')}
            className={`p-2 rounded-lg border text-left transition-all ${
              config.networkType === 'segmented'
                ? 'bg-blue-950/40 border-blue-500 text-white shadow-sm'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-300'
            }`}
          >
            <div className="font-semibold text-xs">Segmented</div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              4 departments
            </div>
          </button>
        </div>
      </div>

      {/* Number of Computers */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="text-xs font-semibold text-slate-300">
            Number of Computers
          </label>
          <span className="text-xs font-mono font-bold text-white">
            {config.numComputers}
          </span>
        </div>
        <input
          type="range"
          min={20}
          max={200}
          step={10}
          value={config.numComputers}
          onChange={(e) =>
            onChangeConfig({ ...config, numComputers: Number(e.target.value) })
          }
          className="w-full accent-blue-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
          <span>20 (min)</span>
          <span>100 (default)</span>
          <span>200 (max)</span>
        </div>
      </div>

      {/* Software Patching */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-blue-400" />
            Software Patching (%)
          </label>
          <span className="text-xs font-mono font-bold text-blue-400">
            {config.patchPercentage}%
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={config.patchPercentage}
          onChange={(e) =>
            onChangeConfig({ ...config, patchPercentage: Number(e.target.value) })
          }
          className="w-full accent-blue-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer mb-2"
        />

        {/* Preset Buttons */}
        <div className="grid grid-cols-4 gap-1.5">
          {[0, 25, 50, 75].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => handlePatchPreset(preset)}
              className={`py-1 px-1.5 rounded text-xs font-semibold border transition-all ${
                config.patchPercentage === preset
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {preset}%
            </button>
          ))}
        </div>
      </div>

      {/* Compromise Probabilities */}
      <div className="space-y-3 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
          2. Spread Probabilities
        </label>

        {/* Vulnerable probability */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-orange-400 font-semibold">
              Vulnerable Computer Prob.
            </span>
            <span className="text-xs font-mono font-bold text-orange-400">
              {Math.round(config.vulnerableCompromiseProb * 100)}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={config.vulnerableCompromiseProb}
            onChange={(e) =>
              onChangeConfig({
                ...config,
                vulnerableCompromiseProb: Number(e.target.value),
              })
            }
            className="w-full accent-orange-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>

        {/* Patched probability */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-blue-400 font-semibold">
              Patched Computer Prob.
            </span>
            <span className="text-xs font-mono font-bold text-blue-400">
              {Math.round(config.patchedCompromiseProb * 100)}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={config.patchedCompromiseProb}
            onChange={(e) =>
              onChangeConfig({
                ...config,
                patchedCompromiseProb: Number(e.target.value),
              })
            }
            className="w-full accent-blue-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>

        {isPatchedHigherThanVuln && (
          <div className="p-2.5 rounded bg-amber-950/80 border border-amber-700/80 text-amber-300 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
            <div>
              <strong>Warning:</strong> Patched infection probability (
              {Math.round(config.patchedCompromiseProb * 100)}%) is higher than
              vulnerable probability ({Math.round(config.vulnerableCompromiseProb * 100)}
              %).
            </div>
          </div>
        )}
      </div>

      {/* Advanced Settings */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
          3. Simulation Parameters
        </label>

        {/* Max Simulation steps */}
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-300">Max Time Steps</span>
          <select
            value={config.maxSteps}
            onChange={(e) =>
              onChangeConfig({ ...config, maxSteps: Number(e.target.value) })
            }
            className="bg-slate-800 border border-slate-700 text-xs text-white rounded px-2 py-1"
          >
            <option value={20}>20 Steps</option>
            <option value={30}>30 Steps</option>
            <option value={50}>50 Steps (Default)</option>
            <option value={100}>100 Steps</option>
          </select>
        </div>

        {/* Number of Repeated Trials */}
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-300">Repeated Trials (N)</span>
          <select
            value={config.numTrials}
            onChange={(e) =>
              onChangeConfig({ ...config, numTrials: Number(e.target.value) })
            }
            className="bg-slate-800 border border-slate-700 text-xs text-white rounded px-2 py-1"
          >
            <option value={10}>10 Trials</option>
            <option value={20}>20 Trials</option>
            <option value={30}>30 Trials (Default)</option>
            <option value={50}>50 Trials</option>
            <option value={100}>100 Trials</option>
          </select>
        </div>

        {/* Random Seed */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-slate-300">Random Seed</span>
            <button
              type="button"
              onClick={handleRandomizeSeed}
              className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <Shuffle className="w-3 h-3" /> Randomize
            </button>
          </div>
          <input
            type="number"
            value={config.randomSeed}
            onChange={(e) =>
              onChangeConfig({
                ...config,
                randomSeed: Math.max(1, parseInt(e.target.value) || 1),
              })
            }
            className="w-full bg-slate-800 border border-slate-700 text-xs font-mono text-white rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
          />
          <p className="text-[10px] text-slate-500 mt-0.5">
            Same seed produces identical results.
          </p>
        </div>

        {/* Simulation Speed */}
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-300">Speed (Step Delay)</span>
          <select
            value={config.simSpeedMs}
            onChange={(e) =>
              onChangeConfig({ ...config, simSpeedMs: Number(e.target.value) })
            }
            className="bg-slate-800 border border-slate-700 text-xs text-white rounded px-2 py-1"
          >
            <option value={150}>Fast (0.15s)</option>
            <option value={350}>Normal (0.35s)</option>
            <option value={700}>Slow (0.70s)</option>
            <option value={0}>Instant (Max Speed)</option>
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 border-t border-slate-800 space-y-2 mt-auto">
        <button
          onClick={onToggleRun}
          disabled={isComplete && !isRunning}
          className={`w-full py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md ${
            isRunning
              ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-950/50'
              : isComplete
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-red-950/50'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-4 h-4" /> Pause Simulation
            </>
          ) : (
            <>
              <Play className="w-4 h-4" /> Start Simulation
            </>
          )}
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onStep}
            disabled={isRunning || isComplete}
            className="py-2 px-3 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <FastForward className="w-3.5 h-3.5" /> +1 Step
          </button>
          <button
            onClick={onReset}
            className="py-2 px-3 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>

        <button
          onClick={onRunComparison}
          className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 flex items-center justify-center gap-2"
        >
          <Sliders className="w-3.5 h-3.5" /> Run Comparison Experiment
        </button>

        <button
          onClick={onRunGuidedDemo}
          className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-indigo-950/80 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-700/60 flex items-center justify-center gap-2"
        >
          <Zap className="w-3.5 h-3.5" /> Run Guided 4-Scenario Demo
        </button>
      </div>
    </aside>
  );
};
