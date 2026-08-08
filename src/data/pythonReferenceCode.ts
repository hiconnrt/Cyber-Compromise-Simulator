export interface PythonFile {
  filename: string;
  language: string;
  description: string;
  content: string;
}

export const PYTHON_REFERENCE_FILES: PythonFile[] = [
  {
    filename: 'requirements.txt',
    language: 'text',
    description: 'Python package dependencies required to run the Streamlit simulator.',
    content: `streamlit>=1.38.0
networkx>=3.2
numpy>=1.26.0
pandas>=2.2.0
matplotlib>=3.8.0
plotly>=5.20.0
scipy>=1.11.0
`
  },
  {
    filename: 'network_models.py',
    language: 'python',
    description: 'NetworkX network generators for Flat Office and Segmented Enterprise networks.',
    content: `"""
network_models.py
-----------------
Generates Flat Office Networks and Segmented Enterprise Networks using NetworkX
with deterministic random seed reproducibility.
"""

import networkx as nx
import numpy as np
import random

DEPARTMENTS = ['HR', 'Finance', 'IT', 'Engineering']

def generate_flat_network(num_computers=100, avg_connections=6, seed=42):
    """
    Generates a Flat Office Network where every computer belongs to one large network.
    Each computer has approximately avg_connections neighbors.
    """
    random.seed(seed)
    np.random.seed(seed)
    
    # Generate connected Erdős-Rényi graph approximation
    p = avg_connections / (num_computers - 1)
    G = nx.erdos_renyi_graph(num_computers, p, seed=seed)
    
    # Ensure graph is connected
    if not nx.is_connected(G):
        components = list(nx.connected_components(G))
        for i in range(len(components) - 1):
            u = random.choice(list(components[i]))
            v = random.choice(list(components[i + 1]))
            G.add_edge(u, v)
            
    # Assign attributes
    for node in G.nodes():
        G.nodes[node]['department'] = 'None'
        G.nodes[node]['label'] = f'WS-{100 + node}'
        G.nodes[node]['state'] = 'vulnerable'
        G.nodes[node]['compromise_step'] = None
        
    for u, v in G.edges():
        G[u][v]['is_cross_dept'] = False
        
    return G

def generate_segmented_network(num_computers=100, avg_connections=6, seed=42):
    """
    Generates a Segmented Enterprise Network divided into HR, Finance, IT, and Engineering.
    Most connections exist within the department; a small number bridge departments.
    """
    random.seed(seed)
    np.random.seed(seed)
    
    G = nx.Graph()
    nodes_per_dept = num_computers // 4
    remainder = num_computers % 4
    
    dept_nodes = {dept: [] for dept in DEPARTMENTS}
    current_idx = 0
    
    for idx, dept in enumerate(DEPARTMENTS):
        count = nodes_per_dept + (1 if idx < remainder else 0)
        for _ in range(count):
            G.add_node(current_idx, department=dept, label=f'{dept}-{100 + current_idx}',
                       state='vulnerable', compromise_step=None)
            dept_nodes[dept].append(current_idx)
            current_idx += 1

    # Connect nodes internally within each department (spanning tree + random edges)
    for dept, nodes in dept_nodes.items():
        # Ensure intra-department connectivity
        for i in range(len(nodes) - 1):
            G.add_edge(nodes[i], nodes[i + 1], is_cross_dept=False)
        G.add_edge(nodes[-1], nodes[0], is_cross_dept=False)
        
        # Add additional internal edges
        target_internal = int((len(nodes) * avg_connections) * 0.44)
        attempts = 0
        while G.subgraph(nodes).number_of_edges() < target_internal and attempts < len(nodes) * 5:
            attempts += 1
            u = random.choice(nodes)
            v = random.choice(nodes)
            if u != v and not G.has_edge(u, v):
                G.add_edge(u, v, is_cross_dept=False)
                
    # Add controlled cross-department bridges (~12% of total edges)
    total_target = int((num_computers * avg_connections) / 2)
    current_edges = G.number_of_edges()
    cross_target = max(4, total_target - current_edges)
    
    for _ in range(cross_target):
        d1, d2 = random.sample(DEPARTMENTS, 2)
        u = random.choice(dept_nodes[d1])
        v = random.choice(dept_nodes[d2])
        if not G.has_edge(u, v):
            G.add_edge(u, v, is_cross_dept=True)
            
    return G
`
  },
  {
    filename: 'simulation.py',
    language: 'python',
    description: 'Core simulation engine modeling vulnerable, patched, compromised, and safe states over discrete time steps.',
    content: `"""
simulation.py
-------------
Implements synchronous spread logic and patching scenarios for cyber compromise simulation.
"""

import random
import numpy as np
import networkx as nx
from network_models import generate_flat_network, generate_segmented_network

class CyberSimulation:
    def __init__(self, network_type='flat', num_computers=100, patch_percentage=25,
                 vulnerable_prob=0.70, patched_prob=0.10, max_steps=50,
                 avg_connections=6, seed=42):
        self.network_type = network_type
        self.num_computers = num_computers
        self.patch_percentage = patch_percentage
        self.vulnerable_prob = vulnerable_prob
        self.patched_prob = patched_prob
        self.max_steps = max_steps
        self.avg_connections = avg_connections
        self.seed = seed
        
        # Set deterministic seeds
        random.seed(self.seed)
        np.random.seed(self.seed)
        
        # Generate network
        if network_type == 'flat':
            self.G = generate_flat_network(num_computers, avg_connections, seed)
        else:
            self.G = generate_segmented_network(num_computers, avg_connections, seed)
            
        self._apply_patching()
        self._select_initial_compromised()
        self.current_step = 0
        self.history = [self._calculate_stats(newly_compromised=[self.initial_node])]
        self.is_complete = False

    def _apply_patching(self):
        nodes = list(self.G.nodes())
        num_patched = int(round(len(nodes) * (self.patch_percentage / 100.0)))
        patched_nodes = set(random.sample(nodes, num_patched))
        
        for node in nodes:
            if node in patched_nodes:
                self.G.nodes[node]['state'] = 'patched'
            else:
                self.G.nodes[node]['state'] = 'vulnerable'

    def _select_initial_compromised(self):
        vulnerable = [n for n, attr in self.G.nodes(data=True) if attr['state'] == 'vulnerable']
        pool = vulnerable if vulnerable else list(self.G.nodes())
        self.initial_node = random.choice(pool)
        self.G.nodes[self.initial_node]['state'] = 'compromised'
        self.G.nodes[self.initial_node]['compromise_step'] = 0

    def _calculate_stats(self, newly_compromised):
        states = nx.get_node_attributes(self.G, 'state')
        total = len(states)
        comp_count = sum(1 for s in states.values() if s == 'compromised')
        patched_count = sum(1 for s in states.values() if s == 'patched')
        vuln_count = sum(1 for s in states.values() if s == 'vulnerable')
        
        return {
            'step': self.current_step,
            'total': total,
            'compromised': comp_count,
            'newly_compromised': len(newly_compromised),
            'patched': patched_count,
            'vulnerable': vuln_count,
            'compromised_pct': round((comp_count / total) * 100, 1),
            'unaffected_pct': round(((total - comp_count) / total) * 100, 1)
        }

    def step(self):
        """
        Advances simulation by one time step synchronously.
        """
        if self.is_complete or self.current_step >= self.max_steps:
            self.is_complete = True
            return
            
        self.current_step += 1
        newly_compromised = set()
        
        # Synchronous check: evaluate all neighbors before updating state
        compromised_nodes = [n for n, attr in self.G.nodes(data=True) if attr['state'] == 'compromised']
        
        for u in compromised_nodes:
            for v in self.G.neighbors(u):
                neighbor_state = self.G.nodes[v]['state']
                if neighbor_state != 'compromised' and v not in newly_compromised:
                    prob = self.patched_prob if neighbor_state == 'patched' else self.vulnerable_prob
                    if random.random() < prob:
                        newly_compromised.add(v)
                        
        # Apply updates
        for node in newly_compromised:
            self.G.nodes[node]['state'] = 'compromised'
            self.G.nodes[node]['compromise_step'] = self.current_step
            
        stats = self._calculate_stats(list(newly_compromised))
        self.history.append(stats)
        
        if len(newly_compromised) == 0 or self.current_step >= self.max_steps:
            self.is_complete = True

    def run_all(self):
        """Runs simulation until outbreak stops or max_steps reached."""
        while not self.is_complete:
            self.step()
        return self.history
`
  },
  {
    filename: 'analytics.py',
    language: 'python',
    description: 'Statistical analysis including Welch t-test, Mann-Whitney U test, and repeated trial experiments.',
    content: `"""
analytics.py
------------
Statistical tests and multi-trial batch runners for research poster analytics.
"""

import numpy as np
import pandas as pd
from scipy import stats
from simulation import CyberSimulation

def run_repeated_trials(network_type='flat', num_computers=100, patch_percentage=25,
                        vulnerable_prob=0.70, patched_prob=0.10, max_steps=50,
                        avg_connections=6, base_seed=42, num_trials=30):
    results = []
    for idx in range(num_trials):
        seed = base_seed + (idx * 10007)
        sim = CyberSimulation(
            network_type=network_type,
            num_computers=num_computers,
            patch_percentage=patch_percentage,
            vulnerable_prob=vulnerable_prob,
            patched_prob=patched_prob,
            max_steps=max_steps,
            avg_connections=avg_connections,
            seed=seed
        )
        sim.run_all()
        final_stat = sim.history[-1]
        peak_speed = max(h['newly_compromised'] for h in sim.history)
        
        results.append({
            'trial_id': idx + 1,
            'network_type': network_type,
            'patch_percentage': patch_percentage,
            'seed': seed,
            'final_compromised': final_stat['compromised'],
            'final_compromise_pct': final_stat['compromised_pct'],
            'peak_spread_speed': peak_speed,
            'outbreak_duration': final_stat['step'],
            'unaffected_count': final_stat['total'] - final_stat['compromised']
        })
    return pd.DataFrame(results)

def perform_welch_ttest(series_a, series_b):
    """
    Performs Welch's independent t-test (unequal variances).
    """
    t_stat, p_val = stats.ttest_ind(series_a, series_b, equal_var=False)
    return {
        'test': "Welch's Independent t-test",
        'statistic': round(float(t_stat), 3),
        'p_value': round(float(p_val), 5),
        'is_significant': p_val < 0.05
    }

def perform_mann_whitney(series_a, series_b):
    """
    Performs Mann-Whitney U non-parametric test.
    """
    u_stat, p_val = stats.mannwhitneyu(series_a, series_b, alternative='two-sided')
    return {
        'test': "Mann-Whitney U Test",
        'statistic': round(float(u_stat), 3),
        'p_value': round(float(p_val), 5),
        'is_significant': p_val < 0.05
    }
`
  },
  {
    filename: 'app.py',
    language: 'python',
    description: 'Streamlit dashboard entry point with SOC-style theme, animated graphs, and statistical tables.',
    content: `"""
app.py
------
Streamlit interactive cybersecurity dashboard for the Cyber Compromise Network Simulator.
Run with: streamlit run app.py
"""

import streamlit as st
import pandas as pd
import numpy as np
import plotly.graph_objects as go
import matplotlib.pyplot as plt
import networkx as nx
from simulation import CyberSimulation
from analytics import run_repeated_trials, perform_welch_ttest

st.set_page_config(page_title="Cyber Compromise Network Simulator", layout="wide", page_icon="🛡️")

st.title("🛡️ Cyber Compromise Network Simulator")
st.markdown("An interactive research simulator analyzing **network segmentation** and **software patching** on enterprise cyber compromise spread.")

# Sidebar Configuration
st.sidebar.header("⚙️ Simulation Settings")
network_type = st.sidebar.selectbox("Network Architecture", ["flat", "segmented"], format_func=lambda x: "Flat Office Network" if x == "flat" else "Segmented Enterprise Network")
num_computers = st.sidebar.slider("Number of Computers", min_value=20, max_value=200, value=100, step=10)
patch_pct = st.sidebar.select_slider("Patch Percentage Preset", options=[0, 25, 50, 75, 100], value=25)
vuln_prob = st.sidebar.slider("Vulnerable Compromise Probability", 0.0, 1.0, 0.70, 0.05)
patched_prob = st.sidebar.slider("Patched Compromise Probability", 0.0, 1.0, 0.10, 0.05)

if patched_prob > vuln_prob:
    st.sidebar.warning("⚠️ Warning: Patched compromise probability exceeds vulnerable probability!")

max_steps = st.sidebar.slider("Max Simulation Steps", 10, 100, 50)
num_trials = st.sidebar.slider("Repeated Trials Count", 10, 100, 30)
seed = st.sidebar.number_input("Random Seed", min_value=1, value=42, step=1)

# Initialize Simulation
if 'sim' not in st.session_state or st.sidebar.button("🔄 Reset / Re-run Simulation"):
    st.session_state.sim = CyberSimulation(
        network_type=network_type,
        num_computers=num_computers,
        patch_percentage=patch_pct,
        vulnerable_prob=vuln_prob,
        patched_prob=patched_prob,
        max_steps=max_steps,
        seed=seed
    )
    st.session_state.sim.run_all()

sim = st.session_state.sim
final_stat = sim.history[-1]

# Top SOC Metric Cards
c1, c2, c3, c4 = st.columns(4)
c1.metric("Final Compromised", f"{final_stat['compromised']} / {final_stat['total']}", f"{final_stat['compromised_pct']}%")
c2.metric("Unaffected Computers", f"{final_stat['total'] - final_stat['compromised']}", f"{final_stat['unaffected_pct']}% safe")
c3.metric("Outbreak Duration", f"{final_stat['step']} steps")
c4.metric("Patch Coverage", f"{patch_pct}%", f"{final_stat['patched']} patched")

# Tabs
tab1, tab2, tab3 = st.tabs(["📊 Network & Spread Graph", "🔬 Repeated Trials (30x)", "📑 Poster & Summary"])

with tab1:
    st.subheader("Compromise Spread Over Time")
    steps = [h['step'] for h in sim.history]
    pcts = [h['compromised_pct'] for h in sim.history]
    fig = go.Figure(data=go.Scatter(x=steps, y=pcts, mode='lines+markers', line=dict(color='#ef4444', width=3)))
    fig.update_layout(title="Percentage of Compromised Computers per Step", xaxis_title="Time Step", yaxis_title="Compromised %", template="plotly_dark")
    st.plotly_chart(fig, use_container_width=True)

with tab2:
    st.subheader(f"Repeated Experiment Mode ({num_trials} Trials)")
    if st.button("▶️ Run Repeated Experiment"):
        with st.spinner("Running batch trials..."):
            df_trials = run_repeated_trials(network_type, num_computers, patch_pct, vuln_prob, patched_prob, max_steps, seed=seed, num_trials=num_trials)
            st.dataframe(df_trials)
            st.download_button("📥 Download Trial Data (CSV)", df_trials.to_csv(index=False), "trials.csv", "text/csv")

with tab3:
    st.markdown("### Research Poster Summary")
    st.info("Export ready for mentor presentations and science fair posters.")
`
  },
  {
    filename: 'README.md',
    language: 'markdown',
    description: 'Comprehensive installation instructions, troubleshooting, and explanation of all 7 research graphs.',
    content: `# Cyber Compromise Network Simulator (Python + Streamlit)

An educational research simulator demonstrating how network segmentation and software patching reduce cyber compromise spread across enterprise networks.

## Quickstart (Windows PowerShell / macOS / Linux)

\`\`\`bash
# 1. Check your Python installation
python --version
python -m pip --version

# 2. Install dependencies
python -m pip install -r requirements.txt

# 3. Launch Streamlit application
python -m streamlit run app.py
\`\`\`

## Project Structure
- \`app.py\`: Streamlit SOC dashboard UI
- \`simulation.py\`: Core synchronous step engine & patch distributor
- \`network_models.py\`: Flat Office & Segmented Enterprise NetworkX topology generators
- \`analytics.py\`: Welch t-test, Mann-Whitney U test, and multi-trial statistical runners
- \`requirements.txt\`: Pinned package requirements

## Educational Notice
This application models abstract network states (Safe, Vulnerable, Patched, Compromised) for cybersecurity education. No real malware, phishing payloads, or exploit scripts are included.
`
  }
];
