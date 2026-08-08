import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Presentation,
  Shield,
  Play,
  CheckCircle2,
  AlertTriangle,
  FileText,
  TrendingUp,
  Cpu,
  Layers,
  BarChart3,
  BookOpen,
} from 'lucide-react';
import { SimulationConfig, TrialResult } from '../types/simulation';
import { runFullTrial } from '../utils/simulationEngine';

interface PresentationModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseConfig: SimulationConfig;
}

const PRESENTATION_SLIDES = [
  {
    step: 1,
    title: 'Project Title',
    subtitle: 'Simulating Network Threat Spread in Enterprise Networks',
    content: (
      <div className="text-center py-8 space-y-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center mx-auto shadow-2xl">
          <Shield className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Simulating Network Threat Spread: The Effects of Network Segmentation &amp; Software Patching
        </h1>
        <p className="text-lg text-slate-300 max-w-2xl mx-auto">
          An interactive quantitative research simulator analyzing how enterprise network architectures
          and vulnerability remediation reduce lateral cyber compromise.
        </p>
      </div>
    ),
  },
  {
    step: 2,
    title: 'Research Question & Objectives',
    subtitle: 'How do network segmentation and software patching affect enterprise security?',
    content: (
      <div className="space-y-4 text-slate-200">
        <p className="text-base leading-relaxed">
          Modern enterprises depend on connected computer networks. When one workstation becomes
          compromised, lateral movement can expose every connected device. This research answers:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
            <h4 className="font-bold text-cyan-400 mb-1">1. Does Segmentation Reduce Compromise?</h4>
            <p className="text-sm text-slate-400">
              Does separating a large flat network into isolated departments (HR, Finance, IT, Engineering)
              contain outbreaks?
            </p>
          </div>
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
            <h4 className="font-bold text-blue-400 mb-1">2. Does Software Patching Slow Spread?</h4>
            <p className="text-sm text-slate-400">
              How does increasing patch coverage from 0% to 75% alter outbreak velocity and duration?
            </p>
          </div>
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
            <h4 className="font-bold text-amber-400 mb-1">3. Which Defense Has Greater Effect?</h4>
            <p className="text-sm text-slate-400">
              Can architectural containment outperform software patching, or vice-versa?
            </p>
          </div>
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
            <h4 className="font-bold text-emerald-400 mb-1">4. Synergy &amp; Variance</h4>
            <p className="text-sm text-slate-400">
              Does combining both defenses provide the strongest protection across repeated stochastic runs?
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    step: 3,
    title: 'Network A: Flat Office Network Topology',
    subtitle: 'Unrestricted single-zone enterprise network',
    content: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-white">The "Flat" Single-Zone Architecture</h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            In a flat office network, every computer is part of one large broadcast domain with
            an average of 5–8 connections. There are no departmental firewalls or internal security
            boundaries.
          </p>
          <ul className="list-disc list-inside text-sm text-slate-400 space-y-1">
            <li>Any computer can communicate directly with neighbors</li>
            <li>Compromise spreads freely without architectural barriers</li>
            <li>Vulnerable devices have a default 70% probability of infection per step</li>
          </ul>
        </div>
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 text-center">
          <div className="w-16 h-16 rounded-full bg-red-950/80 border border-red-500 flex items-center justify-center mx-auto mb-3">
            <Cpu className="w-8 h-8 text-red-400" />
          </div>
          <div className="font-bold text-white">100 Interconnected Nodes</div>
          <div className="text-xs text-slate-400 mt-1">High vulnerability to lateral movement</div>
        </div>
      </div>
    ),
  },
  {
    step: 4,
    title: 'Network B: Segmented Enterprise Network Topology',
    subtitle: '4-Department isolated architecture (HR, Finance, IT, Engineering)',
    content: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-white">Departmental Segmentation</h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            The segmented network divides computers evenly across 4 departments. Approximately 88%
            of connections remain internal to the department, while only ~12% bridge across zones.
          </p>
          <ul className="list-disc list-inside text-sm text-slate-400 space-y-1">
            <li>HR, Finance, IT, and Engineering clusters</li>
            <li>Cross-department connections are visually highlighted</li>
            <li>Acts as a firewall barrier, slowing inter-zone lateral movement</li>
          </ul>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {['HR Dept', 'Finance Dept', 'IT Dept', 'Engineering'].map((d, i) => (
            <div key={i} className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center font-bold text-sm text-purple-300">
              {d} (25 nodes)
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    step: 5,
    title: 'Patch-Level Controls & Presets',
    subtitle: '0%, 25%, 50%, 75% vulnerability remediation presets',
    content: (
      <div className="space-y-4">
        <p className="text-sm text-slate-300">
          Software patches protect endpoints by closing known weaknesses. In our simulation,
          patched computers have their infection probability reduced from 70% down to 10%.
        </p>
        <div className="grid grid-cols-4 gap-3">
          {[
            { pct: '0%', label: 'Unpatched Baseline', color: 'border-red-600 bg-red-950/20 text-red-300' },
            { pct: '25%', label: 'Low Coverage', color: 'border-orange-600 bg-orange-950/20 text-orange-300' },
            { pct: '50%', label: 'Moderate Coverage', color: 'border-blue-600 bg-blue-950/20 text-blue-300' },
            { pct: '75%', label: 'High Protection', color: 'border-emerald-600 bg-emerald-950/20 text-emerald-300' },
          ].map((preset, idx) => (
            <div key={idx} className={`p-4 rounded-xl border ${preset.color} text-center`}>
              <div className="text-2xl font-bold font-mono">{preset.pct}</div>
              <div className="text-xs mt-1">{preset.label}</div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    step: 6,
    title: 'Guided Demo: Side-by-Side 4-Scenario Comparison',
    subtitle: 'Comparing Flat 0%, Flat 75%, Segmented 0%, and Segmented 75%',
    isGuidedDemoSlide: true,
  },
  {
    step: 7,
    title: 'Repeated Experiment Mode (N=30 Trials)',
    subtitle: 'Why single-run simulations are insufficient in cybersecurity research',
    content: (
      <div className="space-y-4">
        <p className="text-sm text-slate-300 leading-relaxed">
          Random network topologies, starting locations, and probabilistic spread events produce
          outliers. A single run might accidentally start on an isolated node.
        </p>
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-slate-300 text-sm">
          <strong className="text-amber-400">Statistical Rigor:</strong> Repeating every
          configuration across 30 independent trials (240 total simulations) establishes stable
          means, standard deviations, and 95% confidence intervals.
        </div>
      </div>
    ),
  },
  {
    step: 8,
    title: 'Required Graphs & Statistical Results',
    subtitle: 'Welch’s independent-samples t-test & Mann-Whitney U test',
    content: (
      <div className="space-y-4">
        <p className="text-sm text-slate-300">
          The research dashboard automatically plots all 7 required graphs (Spread over time,
          Patching vs Final Rate, Flat vs Segmented grouped, Outbreak Duration, Peak Speed,
          Department Impact, and Unaffected Computers) and calculates two-tailed p-values.
        </p>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-cyan-300 font-mono">
          Welch’s t-test (α = 0.05): Confirms that combining segmentation with software patching
          produces a statistically significant reduction in lateral movement.
        </div>
      </div>
    ),
  },
  {
    step: 9,
    title: 'Real-World Relevance: Data Breaches & Social Engineering',
    subtitle: 'Connecting abstract network simulation to real-world threats',
    content: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <h4 className="font-bold text-white mb-1">Data Breaches &amp; Privacy</h4>
          <p className="text-xs text-slate-400">
            Breaches expose customer names, passwords, and financial data. Segmentation acts as a
            blast radius limit, preventing office computers from directly reaching database servers.
          </p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <h4 className="font-bold text-white mb-1">Social Engineering &amp; Phishing</h4>
          <p className="text-xs text-slate-400">
            Human error is often Patient 0. When an employee clicks a phishing link, patching ensures
            the payload fails, and segmentation prevents lateral propagation.
          </p>
        </div>
      </div>
    ),
  },
  {
    step: 10,
    title: 'Important Simulation Limitations',
    subtitle: 'Simplified mathematical model vs. production enterprise reality',
    content: (
      <div className="space-y-3">
        <p className="text-sm text-slate-300">
          This educational simulator models abstract network states. Real cybersecurity incidents depend
          on many additional factors:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-semibold text-amber-300">
          <div className="p-2 bg-slate-900 rounded border border-slate-800">1. User behavior</div>
          <div className="p-2 bg-slate-900 rounded border border-slate-800">2. Device configs</div>
          <div className="p-2 bg-slate-900 rounded border border-slate-800">3. Security monitoring</div>
          <div className="p-2 bg-slate-900 rounded border border-slate-800">4. IAM / Permissions</div>
          <div className="p-2 bg-slate-900 rounded border border-slate-800">5. Next-Gen Firewalls</div>
          <div className="p-2 bg-slate-900 rounded border border-slate-800">6. Multi-Factor Auth</div>
          <div className="p-2 bg-slate-900 rounded border border-slate-800">7. Zero-Day exploits</div>
          <div className="p-2 bg-slate-900 rounded border border-slate-800">8. SOC response speed</div>
          <div className="p-2 bg-slate-900 rounded border border-slate-800">9. Immutable backups</div>
          <div className="p-2 bg-slate-900 rounded border border-slate-800">10. Traffic inspection</div>
        </div>
      </div>
    ),
  },
  {
    step: 11,
    title: 'Conclusion: Defense-in-Depth',
    subtitle: 'Synergistic protection through architecture and remediation',
    content: (
      <div className="bg-gradient-to-r from-blue-950 to-indigo-950 p-6 rounded-2xl border border-blue-800 text-center space-y-4">
        <h3 className="text-xl font-bold text-white">
          Neither Defense Alone is a Silver Bullet
        </h3>
        <p className="text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Our simulation proves that while software patching reduces infection probability at the
          endpoint, network segmentation provides architectural containment. Combining both
          strategies delivers true enterprise resilience.
        </p>
      </div>
    ),
  },
  {
    step: 12,
    title: 'Citations & Academic References (APA Style)',
    subtitle: 'Government standards & peer-reviewed network science literature',
    content: (
      <div className="space-y-3 text-xs font-mono text-slate-300 bg-slate-900 p-5 rounded-xl border border-slate-800">
        <div>• CISA. (2023). Zero Trust Maturity Model (Version 2.0). U.S. Department of Homeland Security.</div>
        <div>• NIST. (2022). Guide to Enterprise Patch Management Technologies (NIST SP 800-40 Rev. 4).</div>
        <div>• Newman, M. E. J. (2003). The structure and function of complex networks. SIAM Review, 45(2).</div>
        <div>• Pastor-Satorras, R., &amp; Vespignani, A. (2001). Epidemic spreading in scale-free networks.</div>
      </div>
    ),
  },
];

export const PresentationModeModal: React.FC<PresentationModeModalProps> = ({
  isOpen,
  onClose,
  baseConfig,
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [guidedResults, setGuidedResults] = useState<{
    flat0: TrialResult | null;
    flat75: TrialResult | null;
    seg0: TrialResult | null;
    seg75: TrialResult | null;
  }>({
    flat0: null,
    flat75: null,
    seg0: null,
    seg75: null,
  });

  // Calculate guided demo results when reaching slide 6 or on button click
  const runGuidedDemo = () => {
    const r1 = runFullTrial({ ...baseConfig, networkType: 'flat', patchPercentage: 0 }, baseConfig.randomSeed);
    const r2 = runFullTrial({ ...baseConfig, networkType: 'flat', patchPercentage: 75 }, baseConfig.randomSeed);
    const r3 = runFullTrial({ ...baseConfig, networkType: 'segmented', patchPercentage: 0 }, baseConfig.randomSeed);
    const r4 = runFullTrial({ ...baseConfig, networkType: 'segmented', patchPercentage: 75 }, baseConfig.randomSeed);

    setGuidedResults({
      flat0: r1,
      flat75: r2,
      seg0: r3,
      seg75: r4,
    });
  };

  useEffect(() => {
    if (isOpen) {
      runGuidedDemo();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentSlide = PRESENTATION_SLIDES[currentSlideIndex];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col justify-between p-6 animate-in fade-in">
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-sm text-white">
            {currentSlide.step}
          </span>
          <div>
            <h2 className="text-base font-bold text-white">{currentSlide.title}</h2>
            <p className="text-xs text-slate-400">{currentSlide.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={runGuidedDemo}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-900/80 hover:bg-indigo-800 text-indigo-300 border border-indigo-700 flex items-center gap-1"
          >
            <Play className="w-3.5 h-3.5" /> Re-run 4-Scenario Demo
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
            title="Exit Presentation Mode"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Slide Content Area */}
      <div className="max-w-5xl mx-auto w-full my-auto py-6">
        {currentSlide.isGuidedDemoSlide ? (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-bold text-white">
                Side-by-Side 4-Scenario Comparison (Seed: {baseConfig.randomSeed})
              </h3>
              <p className="text-xs text-slate-400">
                Direct quantitative comparison of Flat vs. Segmented networks at 0% and 75% patching.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 1. Flat 0% */}
              <div className="p-4 rounded-xl bg-slate-900 border border-red-800/80 space-y-3">
                <div className="text-xs font-bold text-red-400 uppercase">
                  1. Flat Office - 0% Patched
                </div>
                <div className="text-2xl font-mono font-extrabold text-white">
                  {guidedResults.flat0?.finalCompromisePct ?? '---'}%
                </div>
                <div className="text-xs text-slate-400 space-y-1">
                  <div>Compromised: {guidedResults.flat0?.finalCompromisedCount} / 100</div>
                  <div>Duration: {guidedResults.flat0?.outbreakDuration} steps</div>
                  <div>Peak Speed: {guidedResults.flat0?.peakSpreadSpeed} nodes/step</div>
                </div>
              </div>

              {/* 2. Flat 75% */}
              <div className="p-4 rounded-xl bg-slate-900 border border-orange-800/80 space-y-3">
                <div className="text-xs font-bold text-orange-400 uppercase">
                  2. Flat Office - 75% Patched
                </div>
                <div className="text-2xl font-mono font-extrabold text-white">
                  {guidedResults.flat75?.finalCompromisePct ?? '---'}%
                </div>
                <div className="text-xs text-slate-400 space-y-1">
                  <div>Compromised: {guidedResults.flat75?.finalCompromisedCount} / 100</div>
                  <div>Duration: {guidedResults.flat75?.outbreakDuration} steps</div>
                  <div>Peak Speed: {guidedResults.flat75?.peakSpreadSpeed} nodes/step</div>
                </div>
              </div>

              {/* 3. Segmented 0% */}
              <div className="p-4 rounded-xl bg-slate-900 border border-blue-800/80 space-y-3">
                <div className="text-xs font-bold text-blue-400 uppercase">
                  3. Segmented - 0% Patched
                </div>
                <div className="text-2xl font-mono font-extrabold text-white">
                  {guidedResults.seg0?.finalCompromisePct ?? '---'}%
                </div>
                <div className="text-xs text-slate-400 space-y-1">
                  <div>Compromised: {guidedResults.seg0?.finalCompromisedCount} / 100</div>
                  <div>Duration: {guidedResults.seg0?.outbreakDuration} steps</div>
                  <div>Peak Speed: {guidedResults.seg0?.peakSpreadSpeed} nodes/step</div>
                </div>
              </div>

              {/* 4. Segmented 75% */}
              <div className="p-4 rounded-xl bg-slate-900 border border-emerald-800/80 space-y-3">
                <div className="text-xs font-bold text-emerald-400 uppercase">
                  4. Segmented - 75% Patched
                </div>
                <div className="text-2xl font-mono font-extrabold text-white">
                  {guidedResults.seg75?.finalCompromisePct ?? '---'}%
                </div>
                <div className="text-xs text-slate-400 space-y-1">
                  <div>Compromised: {guidedResults.seg75?.finalCompromisedCount} / 100</div>
                  <div>Duration: {guidedResults.seg75?.outbreakDuration} steps</div>
                  <div>Peak Speed: {guidedResults.seg75?.peakSpreadSpeed} nodes/step</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          currentSlide.content
        )}
      </div>

      {/* Bottom Slide Navigation */}
      <div className="flex items-center justify-between border-t border-slate-800 pt-4">
        <button
          onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
          disabled={currentSlideIndex === 0}
          className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 disabled:opacity-40 flex items-center gap-1.5"
        >
          <ChevronLeft className="w-4 h-4" /> Previous Slide
        </button>

        <div className="flex items-center gap-1.5">
          {PRESENTATION_SLIDES.map((s, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlideIndex(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i === currentSlideIndex
                  ? 'bg-blue-500 w-6'
                  : 'bg-slate-800 hover:bg-slate-700'
              }`}
              title={`Slide ${s.step}: ${s.title}`}
            />
          ))}
        </div>

        <button
          onClick={() =>
            setCurrentSlideIndex((prev) =>
              Math.min(PRESENTATION_SLIDES.length - 1, prev + 1)
            )
          }
          disabled={currentSlideIndex === PRESENTATION_SLIDES.length - 1}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white disabled:opacity-40 flex items-center gap-1.5"
        >
          Next Slide <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
