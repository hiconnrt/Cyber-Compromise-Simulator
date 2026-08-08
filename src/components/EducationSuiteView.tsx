import React, { useState } from 'react';
import {
  BookOpen,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Lock,
  Wifi,
  Cpu,
  HelpCircle,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface QuizQuestion {
  id: number;
  scenario: string;
  correctAnswer: 'legitimate' | 'suspicious' | 'not_enough';
  explanation: string[];
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    scenario:
      'A text message from "SecureBank Alert" claims your debit card will be locked in ten minutes unless you tap a link at http://securebank-verify.invalid and enter your verification code.',
    correctAnswer: 'suspicious',
    explanation: [
      'Extreme urgency ("in ten minutes") designed to cause panic.',
      'Request for verification code and login credentials via link.',
      'Unfamiliar or suspicious domain name (.invalid domain / unofficial URL).',
      'Impersonation of financial institution.',
    ],
  },
  {
    id: 2,
    scenario:
      'You receive an email from your university portal at https://student.university.edu notifying you that your fall schedule is available to view after logging into the official portal.',
    correctAnswer: 'legitimate',
    explanation: [
      'Official institutional domain name.',
      'No threats, extreme urgency, or demands for immediate verification codes.',
      'Directs user to standard login portal without asking for passwords via reply.',
    ],
  },
  {
    id: 3,
    scenario:
      'An unexpected email from "IT Support Desk" asks all employees to reply with their current password so the email server upgrade can be completed.',
    correctAnswer: 'suspicious',
    explanation: [
      'Legitimate IT departments never ask for your password via email.',
      'Pretexting: making up a technical excuse ("email server upgrade") to harvest credentials.',
      'Unencrypted transmission of passwords via plain email.',
    ],
  },
  {
    id: 4,
    scenario:
      'A person wearing a delivery uniform stands at your office back door carrying two large boxes and asks you to hold the door open so they can enter without scanning an ID badge.',
    correctAnswer: 'suspicious',
    explanation: [
      'Tailgating / Piggybacking: attempting to enter a restricted facility without authorization.',
      'Using social pressure and physical props (boxes) to bypass access control.',
      'Every individual should scan their own authorized badge.',
    ],
  },
  {
    id: 5,
    scenario:
      'You receive a voicemail from someone claiming to be a software vendor mentioning an invoice number, but leaving no return phone number or company website.',
    correctAnswer: 'not_enough',
    explanation: [
      'Not enough information to verify authenticity without independent verification.',
      'Never call back unknown numbers provided in unsolicited voicemails; always look up the official company contact number independently.',
    ],
  },
  {
    id: 6,
    scenario:
      'An email from "payroll-update@company-hr.invalid" claims there is a mandatory salary adjustment form attached as a ZIP archive.',
    correctAnswer: 'suspicious',
    explanation: [
      'Spoofed or look-alike domain name (company-hr.invalid).',
      'High-interest bait ("salary adjustment") to entice clicking.',
      'Risky file attachment (ZIP archive) that could contain malware.',
    ],
  },
];

export const EducationSuiteView: React.FC = () => {
  const [openSection, setOpenSection] = useState<string>('core_concepts');
  const [quizAnswers, setQuizAnswers] = useState<
    Record<number, 'legitimate' | 'suspicious' | 'not_enough'>
  >({});
  const [showFeedback, setShowFeedback] = useState<Record<number, boolean>>({});

  const handleSelectAnswer = (
    qId: number,
    answer: 'legitimate' | 'suspicious' | 'not_enough'
  ) => {
    setQuizAnswers((prev) => ({ ...prev, [qId]: answer }));
    setShowFeedback((prev) => ({ ...prev, [qId]: true }));
  };

  const toggleSection = (id: string) => {
    setOpenSection((prev) => (prev === id ? '' : id));
  };

  return (
    <div className="space-y-6 text-slate-200">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-400" />
          Cybersecurity Education Suite &amp; "Real or Scam?" Quiz
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Explore the foundational science behind network segmentation, software patching,
          broad cybersecurity defense topics, and test your skills against simulated social
          engineering attacks.
        </p>
      </div>

      {/* Accordion Sections */}
      <div className="space-y-4">
        {/* SECTION 1: Core Simulation Concepts */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <button
            onClick={() => toggleSection('core_concepts')}
            className="w-full p-4 text-left flex items-center justify-between hover:bg-slate-800/50 transition-colors"
          >
            <span className="text-sm font-bold text-white flex items-center gap-2">
              1. Core Simulation Concepts: Segmentation, Patching &amp; Repeated Trials
            </span>
            {openSection === 'core_concepts' ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {openSection === 'core_concepts' && (
            <div className="p-4 pt-0 border-t border-slate-800/80 space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                  <h4 className="font-bold text-purple-400 text-sm mb-1">
                    Network Segmentation
                  </h4>
                  <p>
                    Network segmentation divides a large network into smaller, isolated
                    sections (such as HR, Finance, IT, and Engineering). By reducing the
                    number of cross-departmental connections, segmentation reduces the
                    pathways available for an unauthorized incident to spread laterally,
                    helping contain outbreaks to a single zone.
                  </p>
                </div>

                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                  <h4 className="font-bold text-blue-400 text-sm mb-1">
                    Software Patching
                  </h4>
                  <p>
                    Software patches fix known weaknesses and vulnerabilities in operating
                    systems and applications. In our simulation, patched computers are not
                    guaranteed to be 100% immune, but they have a significantly reduced
                    probability of compromise (default 10% vs. 70% for unpatched devices).
                  </p>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                <h4 className="font-bold text-amber-400 text-sm mb-1">
                  Why Repeated Trials Matter in Cybersecurity Research
                </h4>
                <p>
                  A single simulation trial is insufficient for a research conclusion.
                  Random network topologies, the location of the initially compromised
                  computer ("Patient 0"), and probabilistic spread attempts can produce
                  outliers. Repeating the experiment across many trials (e.g., 30 runs)
                  establishes reliable statistical averages and reveals variance.
                </p>
              </div>

              <div className="bg-amber-950/40 p-4 rounded-lg border border-amber-800 text-amber-200">
                <h4 className="font-bold text-amber-300 text-sm mb-1 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Important Limitations of Simplified Mathematical Models
                </h4>
                <p>
                  This simulator is an educational model. Real-world cyber incidents depend on
                  many additional defensive and operational factors, including:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-2 font-semibold text-[11px] text-amber-300">
                  <div>1. User behavior</div>
                  <div>2. Device configs</div>
                  <div>3. Security monitoring</div>
                  <div>4. Account permissions</div>
                  <div>5. Firewalls &amp; IDS</div>
                  <div>6. Multi-Factor Auth</div>
                  <div>7. Attack techniques</div>
                  <div>8. Response speed</div>
                  <div>9. Backup systems</div>
                  <div>10. Traffic patterns</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 2: Broad Cybersecurity Subjects */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <button
            onClick={() => toggleSection('broad_topics')}
            className="w-full p-4 text-left flex items-center justify-between hover:bg-slate-800/50 transition-colors"
          >
            <span className="text-sm font-bold text-white flex items-center gap-2">
              2. Broad Cybersecurity Topics: Breaches, Social Engineering &amp; Web Security
            </span>
            {openSection === 'broad_topics' ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {openSection === 'broad_topics' && (
            <div className="p-4 pt-0 border-t border-slate-800/80 space-y-4 text-xs text-slate-300 leading-relaxed">
              {/* Grid of Topics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Data Breaches */}
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                  <h4 className="font-bold text-red-400 text-sm mb-1">
                    Data Breaches &amp; Customer Privacy
                  </h4>
                  <p>
                    Data breaches can expose customer names, passwords, Social Security
                    numbers, and credit card records. Companies protect against breaches by
                    employing least-privilege access, encryption at rest, regular vulnerability
                    scanning, and multi-factor authentication.
                  </p>
                </div>

                {/* Social Engineering */}
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                  <h4 className="font-bold text-orange-400 text-sm mb-1">
                    Social Engineering &amp; Psychological Manipulation
                  </h4>
                  <p>
                    Attackers manipulate fear, trust, urgency, curiosity, or authority to
                    trick victims into revealing passwords or clicking dangerous links. Common
                    forms include Phishing, Smishing, Impersonation, Pretexting, Baiting, and
                    Tailgating.
                  </p>
                </div>

                {/* Cyber Warfare & Ransomware */}
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                  <h4 className="font-bold text-cyan-400 text-sm mb-1">
                    Cyber Warfare &amp; Factual Ransomware Timeline
                  </h4>
                  <p>
                    At a high level, cyber operations may target infrastructure disruption or
                    espionage (e.g., historical case studies like Stuxnet and NotPetya). A typical
                    defensive 6-stage ransomware timeline is:
                  </p>
                  <ol className="list-decimal list-inside text-slate-400 mt-1 space-y-0.5">
                    <li>Initial Access</li>
                    <li>Account/System Compromise</li>
                    <li>Lateral Movement</li>
                    <li>Data/Service Disruption</li>
                    <li>Detection &amp; Response</li>
                    <li>Recovery from Offline Backups</li>
                  </ol>
                </div>

                {/* Encryption Diagram */}
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                  <h4 className="font-bold text-emerald-400 text-sm mb-1">
                    How Encryption Works (Data in Transit &amp; at Rest)
                  </h4>
                  <div className="font-mono text-center bg-slate-900 p-2 rounded text-emerald-300 my-2 text-[11px] leading-snug">
                    Readable Info → [Encryption Engine] → Unreadable Ciphertext →
                    [Authorized Decryption] → Readable Info
                  </div>
                  <p>
                    Encryption ensures that even if traffic on Public Wi-Fi or data in a
                    cloud database is intercepted, unauthorized parties cannot read the
                    contents without the decryption key.
                  </p>
                </div>

                {/* Facial Recognition */}
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                  <h4 className="font-bold text-indigo-400 text-sm mb-1">
                    Facial Recognition: Advantages vs. Concerns
                  </h4>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div>
                      <strong className="text-emerald-400">Advantages:</strong>
                      <ul className="list-disc list-inside text-[11px] text-slate-400">
                        <li>Faster identity verification</li>
                        <li>Device &amp; facility security</li>
                        <li>Finding missing persons</li>
                      </ul>
                    </div>
                    <div>
                      <strong className="text-rose-400">Concerns:</strong>
                      <ul className="list-disc list-inside text-[11px] text-slate-400">
                        <li>Privacy &amp; surveillance</li>
                        <li>Bias / unequal error rates</li>
                        <li>Biometric storage security</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Malware Family Tree */}
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                  <h4 className="font-bold text-amber-400 text-sm mb-1">
                    Malware Classification Family Tree (8 Major Classes)
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px] font-semibold text-slate-300 mt-2">
                    <div className="p-1 bg-slate-900 rounded text-center border border-slate-800">
                      1. Virus
                    </div>
                    <div className="p-1 bg-slate-900 rounded text-center border border-slate-800">
                      2. Worm
                    </div>
                    <div className="p-1 bg-slate-900 rounded text-center border border-slate-800">
                      3. Trojan
                    </div>
                    <div className="p-1 bg-slate-900 rounded text-center border border-slate-800">
                      4. Ransomware
                    </div>
                    <div className="p-1 bg-slate-900 rounded text-center border border-slate-800">
                      5. Spyware
                    </div>
                    <div className="p-1 bg-slate-900 rounded text-center border border-slate-800">
                      6. Adware
                    </div>
                    <div className="p-1 bg-slate-900 rounded text-center border border-slate-800">
                      7. Rootkit
                    </div>
                    <div className="p-1 bg-slate-900 rounded text-center border border-slate-800">
                      8. Botnet
                    </div>
                  </div>
                </div>
              </div>

              {/* Web Application Security (Defensive prevention focus) */}
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                <h4 className="font-bold text-blue-400 text-sm mb-1">
                  Web Application Security (Defensive Prevention Focus)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs mt-2">
                  <div>
                    <strong className="text-white">Penetration Testing:</strong>
                    <p className="text-slate-400 mt-0.5">
                      Authorized security testing used by organizations to identify weaknesses
                      before adversaries do.
                    </p>
                  </div>
                  <div>
                    <strong className="text-white">SQL Injection (SQLi):</strong>
                    <p className="text-slate-400 mt-0.5">
                      Prevented via parameterized database queries and input validation so input
                      is never executed as commands.
                    </p>
                  </div>
                  <div>
                    <strong className="text-white">Cross-Site Scripting (XSS):</strong>
                    <p className="text-slate-400 mt-0.5">
                      Prevented via output encoding, strict Content Security Policy (CSP), and
                      framework auto-escaping.
                    </p>
                  </div>
                  <div>
                    <strong className="text-white">CSRF:</strong>
                    <p className="text-slate-400 mt-0.5">
                      Prevented via anti-CSRF tokens and SameSite cookie attributes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 3: "REAL OR SCAM?" QUIZ */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                3. "Real or Scam?" Social Engineering Interactive Quiz
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Test your ability to spot warning signs across 6 fictional cybersecurity
                scenarios (all domains end in .invalid or are safe educational examples).
              </p>
            </div>
          </div>

          <div className="p-4 space-y-6">
            {QUIZ_QUESTIONS.map((q) => {
              const selected = quizAnswers[q.id];
              const isSubmitted = showFeedback[q.id];
              const isCorrect = selected === q.correctAnswer;

              return (
                <div
                  key={q.id}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-white">
                        {q.id}
                      </span>
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Scenario #{q.id}
                      </span>
                    </div>
                    {isSubmitted && (
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded flex items-center gap-1 ${
                          isCorrect
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                            : 'bg-rose-950/80 text-rose-400 border border-rose-800'
                        }`}
                      >
                        {isCorrect ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" /> Correct Assessment
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" /> Incorrect
                          </>
                        )}
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-medium text-white leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                    "{q.scenario}"
                  </p>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'legitimate', label: 'Likely Legitimate' },
                      { id: 'suspicious', label: 'Suspicious / Scam' },
                      { id: 'not_enough', label: 'Not Enough Info' },
                    ].map((opt) => {
                      const isSelected = selected === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() =>
                            handleSelectAnswer(
                              q.id,
                              opt.id as 'legitimate' | 'suspicious' | 'not_enough'
                            )
                          }
                          className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                            isSelected
                              ? opt.id === q.correctAnswer
                                ? 'bg-emerald-600 border-emerald-500 text-white'
                                : 'bg-rose-600 border-rose-500 text-white'
                              : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Feedback Explanation */}
                  {isSubmitted && (
                    <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs space-y-1.5 mt-2 animate-in fade-in">
                      <div className="font-bold text-slate-200">
                        Warning Signs &amp; Analysis:
                      </div>
                      <ul className="list-disc list-inside text-slate-300 space-y-1">
                        {q.explanation.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
