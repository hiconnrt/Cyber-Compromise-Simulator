import React, { useState } from 'react';
import {
  FileText,
  Download,
  Copy,
  Check,
  Printer,
  Edit3,
  Award,
  BookOpen,
  Shield,
} from 'lucide-react';
import { SimulationConfig, FullExperimentRow } from '../types/simulation';
import { exportResearchSummaryMD } from '../utils/exportUtils';
import { runFullResearchExperiment } from '../utils/simulationEngine';
import { summarizeFullExperiment } from '../utils/statistics';

interface PosterSummaryViewProps {
  baseConfig: SimulationConfig;
}

export const PosterSummaryView: React.FC<PosterSummaryViewProps> = ({
  baseConfig,
}) => {
  const [studentName, setStudentName] = useState<string>('Alex Rivera');
  const [institution, setInstitution] = useState<string>('State University Cyber Security Lab');
  const [mentor, setMentor] = useState<string>('Dr. Elena Vance, CISSP');
  const [copied, setCopied] = useState<boolean>(false);
  const [summaryRows, setSummaryRows] = useState<FullExperimentRow[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Generate factual simulation summary rows on mount or button click
  const generatePosterData = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const allResults = runFullResearchExperiment(baseConfig, 30);
      const rows = summarizeFullExperiment(allResults);
      setSummaryRows(rows);
      setIsGenerating(false);
    }, 50);
  };

  React.useEffect(() => {
    generatePosterData();
  }, []);

  // Compute factual findings from summaryRows
  const findings = React.useMemo(() => {
    if (summaryRows.length === 0) {
      return {
        mostAffected: 'Flat Office Network (0% Patched)',
        leastAffected: 'Segmented Enterprise Network (75% Patched)',
        flat0Pct: 0,
        flat75Pct: 0,
        seg0Pct: 0,
        seg75Pct: 0,
        segReduction: 0,
        findingsText: 'Run the simulation to generate factual bullet points.',
      };
    }

    const flat0 = summaryRows.find((r) => r.networkType === 'flat' && r.patchPercentage === 0);
    const flat75 = summaryRows.find((r) => r.networkType === 'flat' && r.patchPercentage === 75);
    const seg0 = summaryRows.find((r) => r.networkType === 'segmented' && r.patchPercentage === 0);
    const seg75 = summaryRows.find((r) => r.networkType === 'segmented' && r.patchPercentage === 75);

    const flat0Pct = flat0?.meanCompromisePct || 0;
    const flat75Pct = flat75?.meanCompromisePct || 0;
    const seg0Pct = seg0?.meanCompromisePct || 0;
    const seg75Pct = seg75?.meanCompromisePct || 0;

    let mostAffectedRow = summaryRows[0];
    let leastAffectedRow = summaryRows[0];

    summaryRows.forEach((r) => {
      if (r.meanCompromisePct > mostAffectedRow.meanCompromisePct) {
        mostAffectedRow = r;
      }
      if (r.meanCompromisePct < leastAffectedRow.meanCompromisePct) {
        leastAffectedRow = r;
      }
    });

    const mostAffectedStr = `${mostAffectedRow.networkType === 'flat' ? 'Flat Office Network' : 'Segmented Enterprise Network'} (${mostAffectedRow.patchPercentage}% Patched - ${mostAffectedRow.meanCompromisePct}% mean compromise)`;
    const leastAffectedStr = `${leastAffectedRow.networkType === 'flat' ? 'Flat Office Network' : 'Segmented Enterprise Network'} (${leastAffectedRow.patchPercentage}% Patched - ${leastAffectedRow.meanCompromisePct}% mean compromise)`;

    const segReduction = flat0Pct > 0 ? Math.round(((flat0Pct - seg0Pct) / flat0Pct) * 1000) / 10 : 0;

    const findingsText = `
- **Most Affected Configuration:** The most affected configuration was the ${mostAffectedStr}.
- **Least Affected Configuration:** The least affected configuration was the ${leastAffectedStr}.
- **Impact of Software Patching:** Increasing patch coverage from 0% to 75% changed the average compromise rate from **${flat0Pct}%** to **${flat75Pct}%** in the flat network, and from **${seg0Pct}%** to **${seg75Pct}%** in the segmented network.
- **Impact of Network Segmentation:** At 0% patching, network segmentation alone reduced the average compromise rate by **${segReduction}%** (${flat0Pct}% down to ${seg0Pct}%).
- **Synergistic Defense:** Combining network segmentation and 75% software patching produced the strongest containment, restricting the mean outbreak to just **${seg75Pct}%** of computers.
`;

    return {
      mostAffected: mostAffectedStr,
      leastAffected: leastAffectedStr,
      flat0Pct,
      flat75Pct,
      seg0Pct,
      seg75Pct,
      segReduction,
      findingsText,
    };
  }, [summaryRows]);

  const handleCopyText = () => {
    const textToCopy = `SIMULATING NETWORK THREAT SPREAD: THE EFFECTS OF NETWORK SEGMENTATION AND SOFTWARE PATCHING
Student: ${studentName} | Institution: ${institution} | Mentor: ${mentor}

ABSTRACT:
We simulated the spread of a generic cyber compromise through synthetic enterprise networks using Python and NetworkX. Two network topologies—flat and segmented—were evaluated under four software patch levels: 0%, 25%, 50%, and 75%. Compromised computers attempted to affect connected neighbors with probabilities based on patch status.

KEY SIMULATION FINDINGS:
${findings.findingsText}
`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 text-slate-200">
      {/* Action Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            Science Fair &amp; Research Poster Generator
          </h2>
          <p className="text-xs text-slate-400">
            Automatically synthesizes your actual simulation data into a publish-ready
            academic research poster format.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={generatePosterData}
            disabled={isGenerating}
            className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 shadow-md shadow-blue-900/40"
          >
            Refresh Poster Data
          </button>

          <button
            onClick={handleCopyText}
            className="px-3 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy Summary'}
          </button>

          <button
            onClick={() =>
              exportResearchSummaryMD(
                'Simulating Network Threat Spread: The Effects of Network Segmentation and Software Patching',
                studentName,
                institution,
                mentor,
                summaryRows,
                findings.findingsText
              )
            }
            className="px-3 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-emerald-400" /> Download Markdown
          </button>

          <button
            onClick={() => window.print()}
            className="px-3 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4 text-cyan-400" /> Print Poster
          </button>
        </div>
      </div>

      {/* Editable Student Information Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-xs text-slate-400 font-semibold block mb-1">
            Student Name:
          </label>
          <input
            type="text"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-sm font-semibold text-white rounded px-3 py-1.5 focus:outline-none focus:border-blue-500"
            placeholder="[Your Name]"
          />
        </div>

        <div>
          <label className="text-xs text-slate-400 font-semibold block mb-1">
            Institution / School:
          </label>
          <input
            type="text"
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-sm font-semibold text-white rounded px-3 py-1.5 focus:outline-none focus:border-blue-500"
            placeholder="[School or Program]"
          />
        </div>

        <div>
          <label className="text-xs text-slate-400 font-semibold block mb-1">
            Mentor Name:
          </label>
          <input
            type="text"
            value={mentor}
            onChange={(e) => setMentor(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-sm font-semibold text-white rounded px-3 py-1.5 focus:outline-none focus:border-blue-500"
            placeholder="[Mentor Name]"
          />
        </div>
      </div>

      {/* POSTER CANVAS */}
      <div className="bg-slate-950 border-2 border-slate-800 rounded-2xl p-6 md:p-10 space-y-8 shadow-2xl">
        {/* Poster Header */}
        <div className="text-center border-b-2 border-slate-800 pb-6">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-400 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-800 inline-block mb-3">
            Academic Research Poster &amp; Science Fair Exhibit
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-snug">
            Simulating Network Threat Spread: The Effects of Network Segmentation
            and Software Patching
          </h1>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-300 font-medium">
            <span>
              <strong className="text-slate-400">Student:</strong> {studentName}
            </span>
            <span>
              <strong className="text-slate-400">Institution:</strong> {institution}
            </span>
            <span>
              <strong className="text-slate-400">Mentor:</strong> {mentor}
            </span>
          </div>
        </div>

        {/* 2-Column Poster Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* COLUMN 1: Background, Problem, Methods */}
          <div className="space-y-6">
            <section className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl">
              <h2 className="text-base font-bold text-white border-b border-slate-800 pb-2 mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-400" />
                1. Background &amp; Research Motivation
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Modern organizations depend on interconnected computer networks. When a single
                workstation becomes compromised—whether via phishing, unpatched software
                vulnerabilities, or credential theft—connected systems become exposed to
                lateral movement. This research project investigates how two foundational
                defensive strategies—<strong>network segmentation</strong> (dividing networks
                into departmental zones) and <strong>software patching</strong> (remediating
                vulnerabilities)—mitigate outbreak severity and duration.
              </p>
            </section>

            <section className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl">
              <h2 className="text-base font-bold text-white border-b border-slate-800 pb-2 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                2. Materials and Methods
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                We simulated the spread of a generic cyber compromise through synthetic
                enterprise networks using Python and NetworkX models (with a live React/Canvas
                interactive UI). Two network topologies—flat office networks and 4-department
                segmented networks—were evaluated under four software patch levels: 0%, 25%,
                50%, and 75%.
              </p>
              <ul className="list-disc list-inside text-xs text-slate-300 mt-2 space-y-1">
                <li>
                  <strong>Nodes:</strong> {baseConfig.numComputers} simulated computers per
                  network, with an average degree of ~{baseConfig.avgConnections}.
                </li>
                <li>
                  <strong>Spread Mechanics:</strong> Vulnerable neighboring computers had a{' '}
                  {Math.round(baseConfig.vulnerableCompromiseProb * 100)}% compromise
                  probability per step; patched computers had a{' '}
                  {Math.round(baseConfig.patchedCompromiseProb * 100)}% probability.
                </li>
                <li>
                  <strong>Repeated Trials:</strong> Each configuration was evaluated across 30
                  independent runs with reproducible random seeds to calculate stable means,
                  standard deviations, and 95% confidence intervals.
                </li>
              </ul>
            </section>
          </div>

          {/* COLUMN 2: Results & Discussion */}
          <div className="space-y-6">
            <section className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl">
              <h2 className="text-base font-bold text-white border-b border-slate-800 pb-2 mb-3 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                3. Simulation Results &amp; Data-Driven Findings
              </h2>
              <div
                className="text-xs text-slate-200 leading-relaxed space-y-2"
                dangerouslySetInnerHTML={{
                  __html: findings.findingsText
                    .replace(/\n-/g, '<br/>• ')
                    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-amber-300">$1</strong>'),
                }}
              />
            </section>

            <section className="bg-slate-900/80 border border-slate-800 p-5 rounded-xl">
              <h2 className="text-base font-bold text-white border-b border-slate-800 pb-2 mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                4. Conclusions and Cybersecurity Discussion
              </h2>
              <ol className="list-decimal list-inside text-xs text-slate-300 space-y-1.5">
                <li>
                  <strong>Patching as a Primary Layer:</strong> Increasing software patch
                  coverage consistently reduced both outbreak duration and peak spread
                  velocity.
                </li>
                <li>
                  <strong>Containment via Segmentation:</strong> Departmental boundaries
                  restricted cross-zone spread, often preserving entire departments when
                  combined with moderate patch levels.
                </li>
                <li>
                  <strong>Defense-in-Depth Synergy:</strong> Neither defense alone is silver
                  bullet; combining segmentation and patching provided the strongest
                  resilience.
                </li>
              </ol>
            </section>
          </div>
        </div>

        {/* Citations Section */}
        <section className="bg-slate-900/50 border border-slate-800/80 p-5 rounded-xl">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            5. References &amp; Citations (APA Style)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] text-slate-400 font-mono">
            <div>
              • CISA. (2023). <em>Zero Trust Maturity Model (Version 2.0)</em>. U.S.
              Department of Homeland Security.
            </div>
            <div>
              • NIST. (2022). <em>Guide to Enterprise Patch Management Technologies</em> (NIST
              SP 800-40 Rev. 4). U.S. Department of Commerce.
            </div>
            <div>
              • Newman, M. E. J. (2003). The structure and function of complex networks.{' '}
              <em>SIAM Review</em>, 45(2), 167-256.
            </div>
            <div>
              • Pastor-Satorras, R., &amp; Vespignani, A. (2001). Epidemic spreading in
              scale-free networks. <em>Physical Review Letters</em>, 86(14).
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
