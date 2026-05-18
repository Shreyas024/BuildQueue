// ===== Module 2: GPU Cluster — Knapsack DP + Counting Semaphore =====

export async function renderGPUCluster() {
  let payload;
  try {
    const res = await fetch('http://127.0.0.1:5000/api/gpu');
    payload = await res.json();
  } catch (e) {
    return `<div style="padding:40px;text-align:center;color:red">Failed to connect to backend: ${e.message}</div>`;
  }

  const data = payload;
  const maxUsers = data.max_concurrent_users;
  const selectedJobs = data.selected_jobs || [];
  const rejectedJobs = data.rejected_jobs || [];
  const usedMem = data.memory_used;
  const totalMem = data.memory_limit;
  
  // Cross module flag
  window.__rejectedStudents = rejectedJobs.map(j => j.student);

  // Semaphore visualization
  const semDots = Array.from({ length: maxUsers + 2 }, (_, i) => {
    if (i < Math.min(selectedJobs.length, maxUsers)) return '<div class="semaphore-dot filled"></div>';
    if (i === maxUsers) return '<div class="semaphore-dot blocked" title="(N+1)th user — BLOCKED!"></div>';
    return '<div class="semaphore-dot"></div>';
  }).join('');

  // GPU slot cards
  const slotCards = Array.from({ length: maxUsers + 2 }, (_, i) => {
    const job = selectedJobs[i];
    if (i < maxUsers && job) {
      return `<div class="gpu-slot active">
        <div class="gpu-slot-id">SLOT ${i + 1}</div>
        <div class="gpu-slot-user">${job.student || 'N/A'}</div>
        <div class="gpu-slot-mem">${job.memory}GB • ${job.model || 'Job'}</div>
        <span class="tag tag-green" style="margin-top:8px">Running</span>
      </div>`;
    } else if (i === maxUsers && selectedJobs[i]) {
      return `<div class="gpu-slot blocked">
        <div class="gpu-slot-id">SLOT ${i + 1} — BLOCKED</div>
        <div class="gpu-slot-user">${selectedJobs[i].student || 'N/A'}</div>
        <div class="gpu-slot-mem">${selectedJobs[i].memory}GB • ${selectedJobs[i].model || 'Job'}</div>
        <span class="tag tag-rose" style="margin-top:8px">Semaphore Full</span>
      </div>`;
    } else {
      return `<div class="gpu-slot">
        <div class="gpu-slot-id">SLOT ${i + 1}</div>
        <div class="gpu-slot-user" style="color:var(--text-muted)">Empty</div>
        <div class="gpu-slot-mem">—</div>
      </div>`;
    }
  }).join('');

  const allJobs = [...selectedJobs, ...rejectedJobs];
  const jobRows = allJobs.map((j, i) => {
    const isSelected = i < selectedJobs.length;
    const isBlocked = isSelected && i >= maxUsers;
    let statusTag;
    if (isBlocked) statusTag = '<span class="tag tag-amber">Blocked (N+1)</span>';
    else if (isSelected) statusTag = '<span class="tag tag-green">Selected</span>';
    else statusTag = '<span class="tag tag-rose">Rejected</span>';
    return `<tr>
      <td><strong>${j.id}</strong></td><td>${j.student || 'N/A'}</td><td>${j.model || 'N/A'}</td>
      <td>${j.memory} GB</td><td>${j.priority || '-'}</td><td>${j.duration || '-'} min</td>
      <td>${statusTag}</td>
    </tr>`;
  }).join('');
  
  // Execution logs
  let logsHTML = '';
  if (data.execution && data.execution.execution_logs) {
      logsHTML = data.execution.execution_logs.map(log => 
          `<div class="log-line">
            <span class="log-time">${log.time_ms.toFixed(1)}ms</span>
            <span class="log-tag ${log.event === 'BLOCKED' ? 'error' : log.event === 'STARTED' ? 'success' : 'info'}">${log.event}</span>
            <span class="log-msg">${log.message}</span>
          </div>`
      ).join('');
  }

  return `
  <div class="fade-in">
    <div class="page-header" style="display:flex;justify-content:space-between;align-items:flex-start;">
      <div>
        <h1 class="page-title">🖥️ GPU Cluster Access</h1>
        <p class="page-desc">0-1 Knapsack DP + Counting Semaphore (API Integrated)</p>
      </div>
      <button class="btn btn-primary" id="btn-run-m2" onclick="window.showToast('Fetching GPU Cluster data...', 'info'); window.navigateTo('gpu-cluster')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        Refresh Data
      </button>
    </div>

    <div class="module-grid module-grid-2" style="margin-bottom:20px;">
      <!-- Knapsack Info -->
      <div class="card slide-up" style="border-left:3px solid var(--accent-purple);">
        <div style="display:flex;gap:16px;align-items:center;margin-bottom:16px;">
          <div style="font-size:2.2rem;">🎒</div>
          <div>
            <div style="font-weight:700;">0-1 Knapsack DP</div>
            <div style="font-size:0.78rem;color:var(--text-secondary);">Budget: ${totalMem}GB — Optimise for max total priority</div>
          </div>
        </div>
        <div style="display:flex;gap:20px;margin-bottom:16px;">
          <div style="text-align:center">
            <div style="font-size:1.6rem;font-weight:800;color:var(--accent-cyan);">${usedMem}/${totalMem}</div>
            <div style="font-size:0.65rem;color:var(--text-muted)">GB Used</div>
          </div>
          <div style="text-align:center">
            <div style="font-size:1.6rem;font-weight:800;color:var(--accent-green);">${selectedJobs.length}</div>
            <div style="font-size:0.65rem;color:var(--text-muted)">Jobs Selected</div>
          </div>
        </div>
        <div style="font-size:0.72rem;font-weight:600;margin-bottom:8px;color:var(--text-muted);">EXECUTION LOGS (from backend semaphore)</div>
        <div class="log-console" style="max-height: 200px; overflow-y: auto;">
          ${logsHTML}
        </div>
      </div>

      <!-- Semaphore -->
      <div class="card slide-up" style="animation-delay:0.1s;border-left:3px solid var(--accent-cyan);">
        <div style="display:flex;gap:16px;align-items:center;margin-bottom:16px;">
          <div style="font-size:2.2rem;">🔒</div>
          <div>
            <div style="font-weight:700;">Counting Semaphore</div>
            <div style="font-size:0.78rem;color:var(--text-secondary);">Max concurrent users: ${maxUsers} — (N+1)th blocked</div>
          </div>
        </div>
        <div class="semaphore-bar">
          <div>
            <div class="semaphore-count">${Math.min(selectedJobs.length, maxUsers)}/${maxUsers}</div>
            <div class="semaphore-label">Slots occupied</div>
          </div>
          <div class="semaphore-dots">${semDots}</div>
        </div>
        <div style="font-size:0.72rem;font-weight:600;margin-bottom:10px;margin-top:16px;color:var(--text-muted);">GPU SLOTS</div>
        <div class="gpu-slots">${slotCards}</div>
      </div>
    </div>

    <!-- Job Table -->
    <div class="card slide-up" style="animation-delay:0.2s;">
      <div class="card-header">
        <div class="card-title">All Jobs</div>
        <div style="display:flex;gap:8px;">
          <span class="tag tag-green">${selectedJobs.length} selected</span>
          <span class="tag tag-rose">${rejectedJobs.length} rejected</span>
        </div>
      </div>
      <div class="table-container">
        <table>
          <thead><tr><th>ID</th><th>Student</th><th>Model</th><th>Memory</th><th>Priority</th><th>Duration</th><th>Status</th></tr></thead>
          <tbody>${jobRows}</tbody>
        </table>
      </div>
    </div>
  </div>`;
}
