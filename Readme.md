<div align="center">

# 🏫 CampusCore — Campus Resource Manager

**A full-stack campus resource management system demonstrating DAA algorithms and OS concepts through real-world scheduling problems.**

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-3.x-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

---

</div>

## ✨ Overview

CampusCore is a **semester-scale campus resource manager** that solves three real scheduling and optimization problems faced by universities — room allocation, GPU cluster access, and service boot sequencing. Each module demonstrates a core **Design & Analysis of Algorithms (DAA)** technique combined with an **Operating Systems (OS)** concept.

The project features a **modern dark-themed dashboard** with glassmorphism, animated transitions, and real-time data visualization — all powered by a Flask REST API backend.

---

## 🧩 Modules

### Module 1 — 🏫 Room Allocation
> **Algorithm:** Greedy Interval Scheduling (Earliest Finish Time)

Assigns **10 courses** to **5 rooms** by sorting courses by finish time and greedily assigning each to the smallest-capacity room that fits without time conflicts.

| Feature | Detail |
|---|---|
| **Algorithm** | Greedy — Earliest Finish Time |
| **Visualization** | Interactive timeline showing room schedules |
| **Metrics** | Utilization %, assigned vs unassigned count |
| **API Endpoint** | `GET /api/rooms` |

---

### Module 2 — 🖥️ GPU Cluster Access
> **Algorithm:** 0-1 Knapsack DP  
> **OS Concept:** Counting Semaphore

Selects the optimal subset of **8 GPU jobs** to fit within a **24GB memory budget** using dynamic programming. Then simulates concurrent execution with a **counting semaphore** (limit: 4 users) — the (N+1)th user is blocked until a slot opens.

| Feature | Detail |
|---|---|
| **Algorithm** | 0-1 Knapsack Dynamic Programming |
| **OS Concept** | Counting Semaphore (threading) |
| **Visualization** | Semaphore dots, GPU slot cards, execution logs |
| **Metrics** | Memory used/budget, jobs selected/rejected, wait time |
| **API Endpoint** | `GET /api/gpu` |

---

### Module 3 — ⚡ Service Boot Sequencer
> **Algorithm:** Kahn's Topological Sort (Decrease & Conquer)

Determines the correct startup order for **10 campus services** with complex dependencies using Kahn's algorithm. Includes **cycle detection** and a **parallel-aware Gantt chart** showing realistic boot durations.

| Feature | Detail |
|---|---|
| **Algorithm** | Kahn's Topological Sort (BFS) |
| **Visualization** | Gantt chart with parallel scheduling, dependency chain |
| **Cycle Detection** | Separate endpoint tests cyclic dependency graphs |
| **Metrics** | Boot order, total boot time, per-service duration |
| **API Endpoints** | `GET /api/services`, `GET /api/services/cycle-test` |

---

### 📊 Semester Analytics
> **Bonus Module** — Aggregated end-of-semester report

Pulls data from all three modules via `/api/run-all` and presents:
- Room utilization bar chart (vertical bars per room)
- GPU job breakdown (selected vs rejected)
- Average GPU wait time
- Service boot success rate
- Structured summary table with status indicators

---

## 🔗 Cross-Module Integration

CampusCore features a **cross-module bonus**: students whose GPU jobs are **rejected** by the Knapsack DP are automatically flagged as **low priority** on the Service Boot page's Student Portal service — demonstrating inter-module data flow.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Python 3.10+, Flask, Flask-CORS |
| **Frontend** | Vanilla JavaScript (ES6 Modules), Vite |
| **Styling** | Custom CSS Design System (dark theme, glassmorphism) |
| **Concurrency** | Python `threading` + `Semaphore` |
| **Algorithms** | Greedy, Dynamic Programming, Graph BFS |
| **Data** | In-memory sample dataset (10 courses, 8 GPU jobs, 10 services) |

---

## 📁 Project Structure

```
BuildQueue/
├── Backend/
│   ├── app.py                    # Flask API server (5 endpoints)
│   ├── db.py                     # MongoDB config (optional)
│   ├── requirements.txt          # Python dependencies
│   ├── test_modules.py           # Unit tests
│   ├── data/
│   │   └── sample_data.py        # Semester dataset (courses, jobs, services)
│   └── modules/
│       ├── room_allocator.py     # Greedy interval scheduling
│       ├── gpu_scheduler.py      # Knapsack DP + semaphore simulation
│       └── service_boot.py       # Kahn's topological sort + Gantt
│
├── Frontend/
│   ├── index.html                # SPA shell with sidebar navigation
│   ├── package.json              # Vite dev server config
│   └── src/
│       ├── main.js               # Router, toast system, event handlers
│       ├── styles.css             # Full design system (430+ lines)
│       └── pages/
│           ├── dashboard.js      # Overview with stat cards & activity log
│           ├── roomAllocation.js  # Timeline + allocation table
│           ├── gpuCluster.js     # Semaphore viz + job table + exec logs
│           ├── serviceBoot.js    # Gantt chart + boot order + cycle detection
│           └── analytics.js      # Bar charts + summary table
│
└── Readme.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Python 3.10+** with `pip`
- **Node.js 18+** with `npm`

### 1. Clone the Repository
```bash
git clone https://github.com/Shreyas024/BuildQueue.git
cd BuildQueue
```

### 2. Start the Backend
```bash
cd Backend
pip install flask flask-cors
python app.py
```
> Backend runs at **http://127.0.0.1:5000**

### 3. Start the Frontend
```bash
cd Frontend
npm install
npm run dev
```
> Frontend runs at **http://localhost:5173**

### 4. Open in Browser
Navigate to `http://localhost:5173` — the dashboard will auto-connect to the backend API.

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Health check |
| `GET` | `/api/rooms` | Run room allocation (Greedy) |
| `GET` | `/api/gpu` | Run GPU scheduler (Knapsack + Semaphore) |
| `GET` | `/api/services` | Run service boot sequencer (Topo Sort) |
| `GET` | `/api/services/cycle-test` | Test cycle detection on cyclic graph |
| `GET` | `/api/run-all` | Execute all modules and return combined results |

---

## 🎨 Design Highlights

- **Dark theme** with warm purple-tinted palette
- **Glassmorphism** sidebar and topbar with backdrop blur
- **Animated cards** with lift-on-hover and glow shadows
- **Responsive layout** — works on desktop and mobile
- **Interactive visualizations** — timelines, Gantt charts, semaphore dots
- **Toast notifications** for real-time feedback
- **System activity log** with color-coded event tags

---

## 📐 Algorithms at a Glance

```
┌─────────────────────────────────────────────────────────┐
│  Module 1: Room Allocation                              │
│  ├── Sort courses by finish time         O(n log n)     │
│  ├── Greedy assign to best-fit room      O(n × r)       │
│  └── Total complexity                    O(n × r)       │
├─────────────────────────────────────────────────────────┤
│  Module 2: GPU Cluster                                  │
│  ├── 0-1 Knapsack DP                    O(n × W)        │
│  ├── Backtrack selected jobs             O(n)            │
│  └── Semaphore simulation               O(n) threads    │
├─────────────────────────────────────────────────────────┤
│  Module 3: Service Boot                                 │
│  ├── Build adjacency + in-degree         O(V + E)       │
│  ├── Kahn's BFS topological sort         O(V + E)       │
│  └── Parallel Gantt computation          O(V × deps)    │
└─────────────────────────────────────────────────────────┘
```

---

## 👥 Team

Built for the **DAA + OS Hackathon** by:
- **Shreyas** — Full-stack development

---

<div align="center">

**Made with ❤️ using Python, Flask & Vanilla JS**

</div>
