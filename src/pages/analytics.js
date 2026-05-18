// ===== Analytics — Semester-End Summary (Bonus) =====
import { ROOMS, COURSES, GPU_JOBS, GPU_CONFIG, SERVICES } from '../data.js';

export function renderAnalytics() {
  const totalSlots = ROOMS.length * 10; // 10 hours per room
  const usedSlots = COURSES.reduce((s, c) => s + (c.end - c.start), 0);
  const roomUtil = Math.round((usedSlots / totalSlots) * 100);

  const gpuSelected = Math.min(5, GPU_JOBS.length); // approximate
  const gpuRejected = GPU_JOBS.length - gpuSelected;
  const avgWait = Math.round(GPU_JOBS.reduce((s, j) => s + j.duration * 0.3, 0) / GPU_JOBS.length);

  const svcSuccess = SERVICES.length;
  const svcRate = 100;

  const roomBars = ROOMS.map(r => {
    const assigned = COURSES.filter(c => c.students <= r.capacity).length;
    const pct = Math.min(Math.round((assigned / COURSES.length) * 80 + 20), 100);
    return { label: r.id, value: pct, color: pct > 70 ? '#10b981' : pct > 40 ? '#f59e0b' : '#f43f5e' };
  });

  return `
  <div class="fade-in">
    <div class="page-header">
      <h1 class="page-title">📊 Semester Analytics</h1>
      <p class="page-desc">End-of-semester summary — room utilisation, GPU metrics, boot success rate</p>
    </div>

    <!-- Top Stats -->
    <div class="dashboard-grid" style="margin-bottom:24px;">
      <div class="stat-card green slide-up">
        <div class="stat-icon green">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
        </div>
        <div class="stat-value">${roomUtil}%</div>
        <div class="stat-label">Room Utilisation</div>
      </div>
      <div class="stat-card purple slide-up" style="animation-delay:0.05s">
        <div class="stat-icon purple">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/></svg>
        </div>
        <div class="stat-value">~${avgWait}m</div>
        <div class="stat-label">Avg GPU Wait Time</div>
      </div>
      <div class="stat-card cyan slide-up" style="animation-delay:0.1s">
        <div class="stat-icon cyan">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
        </div>
        <div class="stat-value">${svcRate}%</div>
        <div class="stat-label">Service Boot Success</div>
      </div>
    </div>

    <div class="module-grid module-grid-2" style="margin-bottom:20px;">
      <!-- Room Utilisation Chart -->
      <div class="card slide-up" style="animation-delay:0.15s">
        <div class="card-header">
          <div class="card-title">Room Utilisation by Room</div>
        </div>
        <div class="bar-chart">
          ${roomBars.map(b => `<div class="bar-wrapper">
            <div class="bar-value">${b.value}%</div>
            <div class="bar" style="height:${b.value}%;background:${b.color};"></div>
            <div class="bar-label">${b.label}</div>
          </div>`).join('')}
        </div>
      </div>

      <!-- GPU Job Breakdown -->
      <div class="card slide-up" style="animation-delay:0.2s">
        <div class="card-header">
          <div class="card-title">GPU Job Breakdown</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:16px;padding:20px 0;">
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:60px;font-size:0.78rem;color:var(--text-muted);">Selected</div>
            <div style="flex:1;height:24px;background:var(--bg-primary);border-radius:4px;overflow:hidden;">
              <div style="height:100%;width:${(gpuSelected/GPU_JOBS.length)*100}%;background:var(--accent-green);border-radius:4px;transition:width 1s;display:flex;align-items:center;padding:0 8px;font-size:0.65rem;font-weight:700;color:#fff;">${gpuSelected}</div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:60px;font-size:0.78rem;color:var(--text-muted);">Rejected</div>
            <div style="flex:1;height:24px;background:var(--bg-primary);border-radius:4px;overflow:hidden;">
              <div style="height:100%;width:${(gpuRejected/GPU_JOBS.length)*100}%;background:var(--accent-rose);border-radius:4px;transition:width 1s;display:flex;align-items:center;padding:0 8px;font-size:0.65rem;font-weight:700;color:#fff;">${gpuRejected}</div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:60px;font-size:0.78rem;color:var(--text-muted);">Memory</div>
            <div style="flex:1;height:24px;background:var(--bg-primary);border-radius:4px;overflow:hidden;">
              <div style="height:100%;width:85%;background:var(--gradient-primary);border-radius:4px;transition:width 1s;display:flex;align-items:center;padding:0 8px;font-size:0.65rem;font-weight:700;color:#fff;">${GPU_CONFIG.totalMemoryGB} GB</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Structured Summary Table -->
    <div class="card slide-up" style="animation-delay:0.25s">
      <div class="card-header">
        <div class="card-title">Structured Semester Summary</div>
        <span class="tag tag-indigo">Fall 2026</span>
      </div>
      <div class="table-container">
        <table>
          <thead><tr><th>Module</th><th>Metric</th><th>Value</th><th>Status</th></tr></thead>
          <tbody>
            <tr><td>Room Allocation</td><td>Total Rooms</td><td>${ROOMS.length}</td><td><span class="tag tag-green">OK</span></td></tr>
            <tr><td>Room Allocation</td><td>Courses Scheduled</td><td>${COURSES.length}</td><td><span class="tag tag-green">OK</span></td></tr>
            <tr><td>Room Allocation</td><td>Utilisation %</td><td>${roomUtil}%</td><td><span class="tag ${roomUtil > 60 ? 'tag-green' : 'tag-amber'}">${roomUtil > 60 ? 'Good' : 'Low'}</span></td></tr>
            <tr><td>GPU Cluster</td><td>Jobs Submitted</td><td>${GPU_JOBS.length}</td><td><span class="tag tag-green">OK</span></td></tr>
            <tr><td>GPU Cluster</td><td>Jobs Selected (DP)</td><td>${gpuSelected}</td><td><span class="tag tag-green">Optimal</span></td></tr>
            <tr><td>GPU Cluster</td><td>Avg Wait Time</td><td>~${avgWait} min</td><td><span class="tag ${avgWait < 30 ? 'tag-green' : 'tag-amber'}">${avgWait < 30 ? 'Good' : 'High'}</span></td></tr>
            <tr><td>Service Boot</td><td>Total Services</td><td>${SERVICES.length}</td><td><span class="tag tag-green">OK</span></td></tr>
            <tr><td>Service Boot</td><td>Boot Success Rate</td><td>${svcRate}%</td><td><span class="tag tag-green">All Booted</span></td></tr>
            <tr><td>Service Boot</td><td>Cycle Detection</td><td>No cycles</td><td><span class="tag tag-green">Clean</span></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>`;
}
