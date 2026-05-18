# CampusCore: Project Status & Gap Analysis Report

## 1. Executive Summary
CampusCore is designed as a unified resource manager with three core modules: Room Allocation, GPU Cluster Access, and Service Boot Sequencer. Currently, the project has scaffolding and basic implementations in both the Python Flask backend and the Vanilla JS (Vite) frontend. However, the system is not fully operational due to missing data layers, algorithm mismatches against the problem statement, and a complete lack of API integration between the client and server.

## 2. Implementation Status

| Module | Core Concept | Backend Status | Frontend Status |
|---|---|---|---|
| **Module 1: Room Allocation** | Greedy Interval Scheduling | ✅ Implemented | ❌ Static Mock Data |
| **Module 2: GPU Cluster Access** | 0-1 Knapsack DP + Semaphore | ⚠️ Partially Implemented | ❌ Static Mock Data |
| **Module 3: Service Boot Sequencer**| Topological Sort (Decrease & Conquer) | ⚠️ Algorithm Mismatch (Uses DFS) | ⚠️ Local Algorithm / No API |
| **System Driver** | Unified execution & UI | ⚠️ `sample_data.py` missing | ❌ No `fetch` / API calls |

## 3. Backend: Missing Features & Issues
1. **Critical Missing Data (`sample_data.py`)**: The file `Backend/data/sample_data.py` is currently empty (0 bytes). The main Flask application (`app.py`) imports data from this file (`courses`, `rooms`, `jobs`, `GPU_MEMORY`, `services`). Without this, the backend will immediately crash on startup due to `ImportError`/`NameError`.
2. **Topological Sort Algorithm Mismatch (Module 3)**: The problem statement strictly requires a "Decrease & Conquer" approach for the Topological Sort. The current backend implementation (`service_boot.py`) uses a Depth-First Search (DFS) approach. It must be refactored to use Kahn's Algorithm (in-degree array with queue manipulation).
3. **Gantt Chart Logic (Module 3)**: The backend returns a sequentially generated Gantt output where each service takes 1 unit of time consecutively (`start_time = time_counter`, `end_time = time_counter + 1`). It does not correctly account for parallel boots and dependency waiting times. The actual computation of earliest start times based on dependencies is currently handled by the frontend alone.
4. **GPU Simulation Realism (Module 2)**: The GPU execution multithreading logic is present, but it might not return synchronized or correctly ordered logs to the frontend since the threads are joined synchronously and time tracking is basic.

## 4. Frontend: Missing Features & Issues
1. **Zero API Integration**: The entire frontend is disconnected from the Flask backend. All pages (`dashboard.js`, `roomAllocation.js`, `gpuCluster.js`, `serviceBoot.js`) rely on static mock data exported from `src/data.js`. There are no `fetch` or `axios` calls to the `/api/*` endpoints.
2. **Duplicated Business Logic**: The frontend contains the actual algorithmic implementations for calculating the Gantt chart and Topological Sort (`serviceBoot.js`), effectively bypassing the backend. The frontend should act purely as a presentation layer rendering the responses received from the Flask server.
3. **Simulated Interactions**: The "Run All" feature and module execution buttons in `main.js` currently use `setTimeout` to simulate loading and completion toasts instead of waiting for the actual backend processing to finish.

## 5. Roadmap to Completion
To finalize the project and meet all deliverables, the following steps must be taken:

**Phase 1: Backend Fixes**
- Populate `Backend/data/sample_data.py` with the shared semester dataset (similar to what is mocked in `Frontend/src/data.js`).
- Refactor `Backend/modules/service_boot.py` to implement Kahn's Algorithm (Decrease & Conquer) and compute correct Gantt-style start/end times based on service boot durations and dependencies.

**Phase 2: Frontend API Integration**
- Remove static data dependencies in the UI components.
- Implement an API service layer to make HTTP `GET` requests to `http://127.0.0.1:5000/api/rooms`, `/api/gpu`, `/api/services`, and `/api/run-all`.
- Update the UI rendering functions to parse and map the dynamic JSON responses returned from the backend.

**Phase 3: End-to-End Testing**
- Run the Flask server and Vite dev server simultaneously.
- Verify that clicking "Run All" correctly triggers the full backend driver pipeline and displays synchronized output across all three modules on the UI.
