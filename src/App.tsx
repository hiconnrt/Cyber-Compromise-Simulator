/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { SidebarControls } from './components/SidebarControls';
import { LiveStatsCards } from './components/LiveStatsCards';
import { NetworkGraphCanvas } from './components/NetworkGraphCanvas';
import { SingleRunResultsPanel } from './components/SingleRunResultsPanel';
import { RepeatedExperimentView } from './components/RepeatedExperimentView';
import { FullExperimentView } from './components/FullExperimentView';
import { PosterSummaryView } from './components/PosterSummaryView';
import { EducationSuiteView } from './components/EducationSuiteView';
import { PythonExportView } from './components/PythonExportView';
import { PresentationModeModal } from './components/PresentationModeModal';
import {
  SimulationConfig,
} from './types/simulation';
import {
  initializeSimulation,
  runNextStep,
  calculateDepartmentResults,
  calculateLargestUnaffectedSection,
} from './utils/simulationEngine';

const DEFAULT_CONFIG: SimulationConfig = {
  networkType: 'flat',
  numComputers: 100,
  patchPercentage: 25,
  vulnerableCompromiseProb: 0.70,
  patchedCompromiseProb: 0.10,
  maxSteps: 50,
  avgConnections: 6,
  randomSeed: 42,
  numTrials: 30,
  simSpeedMs: 350,
};

export default function App() {
  const [config, setConfig] = useState<SimulationConfig>(DEFAULT_CONFIG);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPresentationOpen, setIsPresentationOpen] = useState<boolean>(false);

  // Core Simulation State
  const [simState, setSimState] = useState(() =>
    initializeSimulation(DEFAULT_CONFIG)
  );

  // When config changes, re-initialize simulation and stop running
  useEffect(() => {
    setIsRunning(false);
    setSimState(initializeSimulation(config));
  }, [
    config.networkType,
    config.numComputers,
    config.patchPercentage,
    config.vulnerableCompromiseProb,
    config.patchedCompromiseProb,
    config.maxSteps,
    config.randomSeed,
  ]);

  // Simulation timer loop
  useEffect(() => {
    if (!isRunning || simState.isComplete) {
      if (simState.isComplete) {
        setIsRunning(false);
      }
      return;
    }

    const timer = setTimeout(() => {
      setSimState((prev) => {
        if (prev.isComplete) return prev;
        return runNextStep(prev);
      });
    }, config.simSpeedMs);

    return () => clearTimeout(timer);
  }, [isRunning, simState, config.simSpeedMs]);

  const handleStep = () => {
    if (simState.isComplete) return;
    setSimState((prev) => runNextStep(prev));
  };

  const handleReset = () => {
    setIsRunning(false);
    setSimState(initializeSimulation(config));
  };

  const handleToggleRun = () => {
    if (simState.isComplete) {
      // If complete, restart and run
      setSimState(initializeSimulation(config));
      setIsRunning(true);
    } else {
      setIsRunning((prev) => !prev);
    }
  };

  // Compute stats for current view
  const currentStats =
    simState.statsHistory[simState.statsHistory.length - 1] || {
      step: 0,
      totalComputers: config.numComputers,
      compromisedCount: 1,
      newlyCompromisedCount: 1,
      patchedCount: 0,
      vulnerableCount: config.numComputers,
      compromisedPct: 1,
      unaffectedPct: 99,
      spreadRate: 1,
    };

  let peakSpreadSpeed = 0;
  simState.statsHistory.forEach((s) => {
    if (s.newlyCompromisedCount > peakSpreadSpeed) {
      peakSpreadSpeed = s.newlyCompromisedCount;
    }
  });

  const departmentResults = React.useMemo(
    () => calculateDepartmentResults(simState.nodes),
    [simState.nodes]
  );
  const largestUnaffectedSection = React.useMemo(
    () => calculateLargestUnaffectedSection(simState.nodes),
    [simState.nodes]
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-red-600 selection:text-white">
      {/* Top SOC Navbar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isRunning={isRunning}
        onToggleRun={handleToggleRun}
        onStep={handleStep}
        onReset={handleReset}
        onOpenPresentation={() => setIsPresentationOpen(true)}
        currentStep={simState.currentStep}
        maxSteps={config.maxSteps}
        isComplete={simState.isComplete}
      />

      {/* Main Container with Sidebar & Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Control Sidebar */}
        <SidebarControls
          config={config}
          onChangeConfig={setConfig}
          isRunning={isRunning}
          onToggleRun={handleToggleRun}
          onStep={handleStep}
          onReset={handleReset}
          onRunComparison={() => setActiveTab('experiment')}
          onRunGuidedDemo={() => setIsPresentationOpen(true)}
          isComplete={simState.isComplete}
        />

        {/* Right Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Top 10 Live Metric Cards */}
              <LiveStatsCards
                stats={currentStats}
                peakSpreadSpeed={peakSpreadSpeed}
              />

              {/* Network Graph & Single Run Results Panel */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Network Canvas Column */}
                <div className="xl:col-span-2">
                  <NetworkGraphCanvas
                    nodes={simState.nodes}
                    edges={simState.edges}
                    networkType={config.networkType}
                    initialCompromisedId={simState.initialCompromisedId}
                    newlyCompromisedIds={simState.newlyCompromisedIds}
                    currentStep={simState.currentStep}
                  />
                </div>

                {/* Single Run Summary Results Column */}
                <div className="xl:col-span-1">
                  <SingleRunResultsPanel
                    finalStats={currentStats}
                    peakSpreadSpeed={peakSpreadSpeed}
                    largestUnaffectedSection={largestUnaffectedSection}
                    departmentResults={departmentResults}
                    networkType={config.networkType}
                    isComplete={simState.isComplete}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'repeated' && (
            <RepeatedExperimentView config={config} />
          )}

          {activeTab === 'experiment' && (
            <FullExperimentView baseConfig={config} />
          )}

          {activeTab === 'poster' && (
            <PosterSummaryView baseConfig={config} />
          )}

          {activeTab === 'education' && <EducationSuiteView />}

          {activeTab === 'python' && <PythonExportView />}
        </main>
      </div>

      {/* Full-Screen Demo Presentation Mode Modal */}
      <PresentationModeModal
        isOpen={isPresentationOpen}
        onClose={() => setIsPresentationOpen(false)}
        baseConfig={config}
      />
    </div>
  );
}
