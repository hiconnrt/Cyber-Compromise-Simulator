import { TrialResult, FullExperimentRow } from '../types/simulation';

/**
 * Triggers a file download in the browser
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Exports raw repeated trial results as CSV
 */
export function exportRawTrialsCSV(trials: TrialResult[], filename: string = 'cyber_simulation_trials.csv'): void {
  const headers = [
    'Trial ID',
    'Network Type',
    'Patch %',
    'Random Seed',
    'Final Compromised Count',
    'Final Compromise %',
    'Peak Spread Speed',
    'Outbreak Duration (Steps)',
    'Unaffected Count',
    'Largest Unaffected Section',
  ];

  const rows = trials.map((t) => [
    t.trialId,
    t.networkType === 'flat' ? 'Flat Office Network' : 'Segmented Enterprise Network',
    t.patchPercentage,
    t.seed,
    t.finalCompromisedCount,
    t.finalCompromisePct,
    t.peakSpreadSpeed,
    t.outbreakDuration,
    t.unaffectedCount,
    `"${t.largestUnaffectedSection.replace(/"/g, '""')}"`,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');

  downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
}

/**
 * Exports summary experiment results table as CSV
 */
export function exportSummaryCSV(rows: FullExperimentRow[], filename: string = 'cyber_simulation_summary.csv'): void {
  const headers = [
    'Network',
    'Patch %',
    'Trials',
    'Mean Compromise %',
    'Standard Deviation',
    'Mean Duration (Steps)',
    'Mean Peak Spread',
    'Mean Unaffected',
    '95% CI Low',
    '95% CI High',
  ];

  const csvRows = rows.map((r) => [
    r.networkType === 'flat' ? 'Flat Office Network' : 'Segmented Enterprise Network',
    r.patchPercentage,
    r.trials,
    r.meanCompromisePct,
    r.stdDevCompromisePct,
    r.meanDuration,
    r.meanPeakSpread,
    r.meanUnaffectedCount,
    r.ci95Low,
    r.ci95High,
  ]);

  const csvContent = [
    headers.join(','),
    ...csvRows.map((row) => row.join(',')),
  ].join('\n');

  downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
}

/**
 * Exports formatted markdown research summary
 */
export function exportResearchSummaryMD(
  title: string,
  studentName: string,
  institution: string,
  mentor: string,
  summaryRows: FullExperimentRow[],
  findingsText: string
): void {
  const md = `# ${title}
**Student:** ${studentName || '[Student Name]'}  
**Institution:** ${institution || '[School / Institution]'}  
**Mentor:** ${mentor || '[Mentor Name]'}  

---

## 1. Abstract
We simulated the spread of a generic cyber compromise through synthetic enterprise networks using Python and NetworkX models. Two network topologies—flat and segmented—were evaluated under four software patch levels: 0%, 25%, 50%, and 75%. Compromised computers attempted to affect connected neighbors with probabilities based on patch status. Each configuration was repeated using multiple random seeds. We measured final compromise percentage, outbreak duration, peak spread speed, and the number of unaffected computers.

---

## 2. Experimental Summary Results Table

| Network | Patch % | Trials | Mean Compromise % | Std Dev | Mean Duration | Mean Peak Spread | Mean Unaffected |
|---|---:|---:|---:|---:|---:|---:|---:|
${summaryRows
  .map(
    (r) =>
      `| ${r.networkType === 'flat' ? 'Flat Office' : 'Segmented Enterprise'} | ${
        r.patchPercentage
      }% | ${r.trials} | **${r.meanCompromisePct}%** | ${r.stdDevCompromisePct} | ${
        r.meanDuration
      } | ${r.meanPeakSpread} | ${r.meanUnaffectedCount} |`
  )
  .join('\n')}

---

## 3. Key Research Findings
${findingsText}

---

## 4. Conclusions and Cybersecurity Discussion
1. **Patching as a Primary Defense:** Increasing software patch coverage consistently reduced both the speed and total extent of compromise spread across all network architectures.
2. **Containment via Network Segmentation:** The segmented enterprise topology reduced cross-departmental spread, often preserving entire departments when combined with moderate patch levels.
3. **Synergistic Defense-in-Depth:** Combining network segmentation with software patching provided the strongest resilience against simulated network outbreaks.
4. **Stochastic Variation:** Repeated runs across distinct random seeds demonstrated measurable variation, emphasizing why single-trial experiments are insufficient for cybersecurity policy conclusions.

---

## 5. References & Citations (APA Style)
- Cybersecurity and Infrastructure Security Agency (CISA). (2023). *Zero Trust Maturity Model (Version 2.0)*. U.S. Department of Homeland Security.
- National Institute of Standards and Technology (NIST). (2022). *Guide to Enterprise Patch Management Technologies* (NIST SP 800-40 Rev. 4). U.S. Department of Commerce.
- Newman, M. E. J. (2003). The structure and function of complex networks. *SIAM Review*, 45(2), 167-256.
- Pastor-Satorras, R., & Vespignani, A. (2001). Epidemic spreading in scale-free networks. *Physical Review Letters*, 86(14), 3200-3203.
`;

  downloadFile(md, 'cyber_compromise_research_summary.md', 'text/markdown;charset=utf-8;');
}
