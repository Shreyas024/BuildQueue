// ===== Dashboard Page =====
import { ROOMS, COURSES, GPU_JOBS, SERVICES, GPU_CONFIG } from '../data.js';

export function renderDashboard() {
  const allocated = COURSES.length;
  const roomUtil = Math.round((allocated / (ROOMS.length * 5)) * 100);
  const gpuActive = GPU_JOBS.filter(j => j.status === 'running').length;
  const svcCount = SERVICES.length;

  return `
  <div class="fade-in">
    <div class="page-header">
      <h1 class="page-title">Dashboard</h1>
      <p class="page-desc">Semester overview — all three modules at a glance</p>
    </div>

    <!-- Stat Cards -->
    <div class="dashboard-grid" style="margin-bottom: 24px;">
      <div class="stat-card indigo slide-up" style="animation-delay: 0.05s">
        <div class="stat-icon indigo">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        </div>
        <div class="stat-value">${ROOMS.length}</div>
        <div class="stat-label">Rooms Available</div>
      </div>
      <div class="stat-card cyan slide-up" style="animation-delay: 0.1s">
        <div class="stat-icon cyan">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
        </div>
        <div class="stat-value">${COURSES.length}</div>
        <div class="stat-label">Courses to Schedule</div>
      </div>
      <div class="stat-card green slide-up" style="animation-delay: 0.15s">
        <div class="stat-icon green">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/></svg>
        </div>
        <div class="stat-value">${GPU_CONFIG.maxConcurrentUsers}</div>
        <div class="stat-label">GPU Semaphore Limit</div>
      </div>
      <div class="stat-card purple slide-up" style="animation-delay: 0.2s">
        <div class="stat-icon purple">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
        </div>
        <div class="stat-value">${svcCount}</div>
        <div class="stat-label">Services to Boot</div>
      </div>
    </div>

    <!-- Module Cards -->
    <div class="module-grid module-grid-3" style="margin-bottom: 24px;">
      <div class="card slide-up" style="animation-delay: 0.25s">
        <div class="card-header">
          <div>
            <div class="card-title">🏫 Room Allocation</div>
            <div class="card-subtitle">Greedy Interval Scheduling</div>
          </div>
          <span class="tag tag-green">Module 1</span>
        </div>
        <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 16px;">
          Assigns ${COURSES.length} courses to ${ROOMS.length} rooms using earliest-finish-time greedy algorithm for maximum utilisation.
        </p>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="font-size:1.4rem; font-weight:800; color: var(--accent-green);">${roomUtil}%</div>
            <div style="font-size:0.7rem; color: var(--text-muted);">Est. Utilisation</div>
          </div>
          <button class="btn btn-sm btn-secondary" onclick="window.navigateTo('room-allocation')">Open →</button>
        </div>
      </div>

      <div class="card slide-up" style="animation-delay: 0.3s">
        <div class="card-header">
          <div>
            <div class="card-title">🖥️ GPU Cluster</div>
            <div class="card-subtitle">Knapsack DP + Semaphore</div>
          </div>
          <span class="tag tag-purple">Module 2</span>
        </div>
        <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 16px;">
          ${GPU_JOBS.length} jobs competing for ${GPU_CONFIG.totalMemoryGB}GB GPU memory. Semaphore caps at ${GPU_CONFIG.maxConcurrentUsers} concurrent users.
        </p>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="font-size:1.4rem; font-weight:800; color: var(--accent-purple);">${GPU_JOBS.length}</div>
            <div style="font-size:0.7rem; color: var(--text-muted);">Jobs Queued</div>
          </div>
          <button class="btn btn-sm btn-secondary" onclick="window.navigateTo('gpu-cluster')">Open →</button>
        </div>
      </div>

      <div class="card slide-up" style="animation-delay: 0.35s">
        <div class="card-header">
          <div>
            <div class="card-title">⚡ Service Boot</div>
            <div class="card-subtitle">Topological Sort + Gantt</div>
          </div>
          <span class="tag tag-cyan">Module 3</span>
        </div>
        <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 16px;">
          ${SERVICES.length} campus services with dependency ordering. Simulates process scheduling with Gantt visualization.
        </p>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="font-size:1.4rem; font-weight:800; color: var(--accent-cyan);">${SERVICES.length}</div>
            <div style="font-size:0.7rem; color: var(--text-muted);">Services</div>
          </div>
          <button class="btn btn-sm btn-secondary" onclick="window.navigateTo('service-boot')">Open →</button>
        </div>
      </div>
    </div>

    <!-- Activity Log -->
    <div class="card slide-up" style="animation-delay: 0.4s">
      <div class="card-header">
        <div>
          <div class="card-title">System Activity Log</div>
          <div class="card-subtitle">Real-time module events</div>
        </div>
        <button class="btn btn-sm btn-secondary" id="btn-clear-log">Clear</button>
      </div>
      <div class="log-console" id="dashboard-log">
        <div class="log-line"><span class="log-time">09:00:01</span><span class="log-tag info">SYS</span><span class="log-msg">CampusCore initialised for Fall 2026 semester</span></div>
        <div class="log-line"><span class="log-time">09:00:02</span><span class="log-tag success">M1</span><span class="log-msg">Room allocation module loaded — ${ROOMS.length} rooms, ${COURSES.length} courses</span></div>
        <div class="log-line"><span class="log-time">09:00:03</span><span class="log-tag success">M2</span><span class="log-msg">GPU cluster module loaded — ${GPU_CONFIG.totalMemoryGB}GB budget, semaphore(${GPU_CONFIG.maxConcurrentUsers})</span></div>
        <div class="log-line"><span class="log-time">09:00:04</span><span class="log-tag success">M3</span><span class="log-msg">Service boot module loaded — ${SERVICES.length} services in dependency graph</span></div>
        <div class="log-line"><span class="log-time">09:00:05</span><span class="log-tag info">SYS</span><span class="log-msg">All modules ready. Awaiting operator commands.</span></div>
      </div>
    </div>
  </div>`;
}
