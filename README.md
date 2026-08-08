# Enterprise Network Security Simulator

An interactive, web-based quantitative research simulator analyzing the effects of **Network Segmentation** and **Software Patching** on lateral threat propagation across enterprise network topologies.

---

## 🛡️ Overview

The **Enterprise Network Security Simulator** models the spread of lateral compromise across synthetic corporate network topologies. By contrasting unsegmented (flat) network architectures against segmented VLAN/DMZ structures under varying software patching levels ($0\%$, $25\%$, $50\%$, $75\%$), security analysts, researchers, and students can visually inspect, quantitatively measure, and statistically validate defense-in-depth strategies.

---

## ✨ Key Features

### 1. 🌐 Live Network Visualizer & Simulation Engine
- **Interactive D3 Network Graph**: Real-time canvas rendering of connected network nodes, subnets, and active threat vectors.
- **Topologies**: Compare **Flat Enterprise** (high interconnectivity) vs. **Segmented Architecture** (subnets, VLAN boundaries, DMZ chokepoints).
- **Infection Dynamics**: Synchronous step-by-step lateral spread calculations with customizable vulnerable and patched compromise probabilities.
- **Live Monitoring Metrics**: Real-time tracking of compromise rate, peak propagation speed, active step count, and remaining unaffected systems.

### 2. 📊 Multi-Trial Monte Carlo Experiments
- **Statistical Rigor**: Run batch trials across randomized seeds to smooth out stochastic variance.
- **Distribution Analysis**: Confidence intervals, mean compromise rates, and spread variance across multiple iterations.

### 3. 🧪 Full Experimental Matrix Analysis
- **Comprehensive Heatmaps**: Cross-compare network topology versus software patching percentages ($0\% - 75\%$).
- **Comparative Metrics**: Evaluate containment efficiency, blast radius reduction, and outbreak duration across all experimental scenarios.

### 4. 🎓 Educational Cybersecurity Suite
- **SOC Case Studies**: Real-world breach scenarios demonstrating lateral movement mechanics.
- **Interactive Quizzes & Scenarios**: Test defense concepts on network segmentation, zero-trust principles, and vulnerability management.
- **Interactive Glossary**: Comprehensive cybersecurity terminology definitions.

### 5. 📜 Academic Poster & Research Summary View
- **Science Fair & Academic Format**: Displays abstract, methodology, results tables, and research conclusions.
- **Multi-Format Export**: Export research findings as formatted Markdown (`.md`), JSON datasets, CSV metrics tables, and BibTeX citations.

### 6. 🐍 Standalone Python Reference Export
- **Python + NetworkX Script**: Download complete, self-contained Python source code for offline experimentation.
- **Streamlit Interactive App**: Code for running the full simulator in Streamlit with PyVis visualizers.

### 7. 🎤 Presentation Mode
- **Built-in Slide Deck**: Fullscreen presentation modal designed for briefings, lectures, and research defense sessions.

---

## 🛠️ Technology Stack

- **Framework**: React 19 (TypeScript) with Vite
- **Styling**: Tailwind CSS v4
- **Visualization & Graphing**: D3.js (Network Force Simulation) & Recharts (Data Charts)
- **Animations & Icons**: Motion (`framer-motion`), Lucide React
- **Server Environment**: Express / Node.js
- **AI Integration**: `@google/genai` (Google Gemini API support)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- `npm` or `yarn`

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd enterprise-network-security-simulator
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   Access the application in your browser at `http://localhost:3000`.

---

## ⚙️ Simulation Configuration Parameters

| Parameter | Default Value | Description |
| :--- | :--- | :--- |
| **Network Type** | `flat` | Network topology (`flat` or `segmented`) |
| **Computer Count** | `100` | Total number of nodes in the simulated network |
| **Patch Percentage** | `25%` | Percentage of systems with security patches applied |
| **Vulnerable Infection Prob.** | `0.70` | Probability of compromise transfer to unpatched systems |
| **Patched Infection Prob.** | `0.10` | Probability of compromise transfer to patched systems |
| **Average Connections** | `6` | Degree of node connectivity |
| **Max Simulation Steps** | `50` | Step threshold for containment measurement |
| **Number of Trials** | `30` | Iterations executed in Monte Carlo batch modes |

---

## 📄 License

Apache License 2.0
