// ===== Dashboard Page =====

export async function renderDashboard() {
  let payload;
  try {
    const res = await fetch('http://127.0.0.1:5000/api/run-all');
    payload = await res.json();
  } catch (e) {
    return `<div style="padding:40px;text-align:center;color:red">Failed to connect to backend: ${e.message}</div>`;
  }
  
  const data = payload.summary;
  
  // We can calculate total rooms by looking at the rooms result if we want,
  // but let's just use the summary data.
  const roomUtil = data.room_utilization_percent;
  const gpuActive = data.gpu_jobs_selected;
  
  // Try to get lengths from the nested objects
  const roomsCount = payload.rooms.room_usage ? Object.keys(payload.rooms.room_usage).length : 0;
  const coursesCount = data.total_courses;
  const gpuTotalJobs = payload.gpu.selected_jobs.length + (payload.gpu.rejected_jobs ? payload.gpu.rejected_jobs.length : 0);
  const maxUsers = payload.gpu.max_concurrent_users || 0;
  const svcCount = payload.services.startup_order ? payload.services.startup_order.length : 0;
  const gpuBudget = payload.gpu.memory_limit;

  return `
  <div class="fade-in">
    <div class="page-header">
      <h1 class="page-title">👋 Welcome to CampusCore</h1>
      <p class="page-desc">Here's your semester overview — everything's running smoothly</p>
    </div>

    <!-- Stat Cards -->
    <div class="dashboard-grid" style="margin-bottom: 24px;">
      <div class="stat-card indigo slide-up" style="animation-delay: 0.05s">
        <div class="stat-icon indigo">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        </div>
        <div class="stat-value">${roomsCount}</div>
        <div class="stat-label">Rooms Available</div>
      </div>
      <div class="stat-card cyan slide-up" style="animation-delay: 0.1s">
        <div class="stat-icon cyan">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
        </div>
        <div class="stat-value">${coursesCount}</div>
        <div class="stat-label">Courses to Schedule</div>
      </div>
      <div class="stat-card green slide-up" style="animation-delay: 0.15s">
        <div class="stat-icon green">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/></svg>
        </div>
        <div class="stat-value">${maxUsers}</div>
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
          Assigns ${coursesCount} courses to ${roomsCount} rooms using earliest-finish-time greedy algorithm for maximum utilisation.
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
          ${gpuTotalJobs} jobs competing for ${gpuBudget}GB GPU memory. Semaphore caps at ${maxUsers} concurrent users.
        </p>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="font-size:1.4rem; font-weight:800; color: var(--accent-purple);">${gpuTotalJobs}</div>
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
          ${svcCount} campus services with dependency ordering. Simulates process scheduling with Gantt visualization.
        </p>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="font-size:1.4rem; font-weight:800; color: var(--accent-cyan);">${svcCount}</div>
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
        <div class="log-line"><span class="log-time">09:00:01</span><span class="log-tag info">SYS</span><span class="log-msg">Hey! Backend connected — everything looks good ✨</span></div>
        <div class="log-line"><span class="log-time">09:00:02</span><span class="log-tag success">M1</span><span class="log-msg">Room scheduler is ready — ${roomsCount} rooms and ${coursesCount} courses loaded</span></div>
        <div class="log-line"><span class="log-time">09:00:03</span><span class="log-tag success">M2</span><span class="log-msg">GPU cluster online — ${gpuBudget}GB budget, up to ${maxUsers} users at once</span></div>
        <div class="log-line"><span class="log-time">09:00:04</span><span class="log-tag success">M3</span><span class="log-msg">Service graph loaded — ${svcCount} services ready to boot in order</span></div>
        <div class="log-line"><span class="log-time">09:00:05</span><span class="log-tag info">SYS</span><span class="log-msg">All set! Click any module to explore 🚀</span></div>
      </div>
    </div>
  </div>`;
}
