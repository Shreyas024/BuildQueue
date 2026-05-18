// ===== Module 2: GPU Cluster — Knapsack DP + Counting Semaphore =====
import { GPU_JOBS, GPU_CONFIG } from '../data.js';

// 0-1 Knapsack DP: select jobs that fit within GPU memory budget
function knapsackDP(jobs, capacity) {
  const n = jobs.length;
  const W = capacity;
  // DP table: dp[i][w] = max priority using first i items with capacity w
  const dp = Array.from({ length: n + 1 }, () => Array(W + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    const wt = jobs[i - 1].memoryGB;
    const val = jobs[i - 1].priority;
    for (let w = 0; w <= W; w++) {
      if (wt <= w) {
        dp[i][w] = Math.max(dp[i - 1][w], dp[i - 1][w - wt] + val);
      } else {
        dp[i][w] = dp[i - 1][w];
      }
    }
  }

  // Backtrack to find selected items
  const selected = [];
  let w = W;
  for (let i = n; i > 0; i--) {
    if (dp[i][w] !== dp[i - 1][w]) {
      selected.push(i - 1);
      w -= jobs[i - 1].memoryGB;
    }
  }
  selected.reverse();
  return { dp, selected, maxPriority: dp[n][W] };
}

export function renderGPUCluster() {
  const { dp, selected, maxPriority } = knapsackDP(GPU_JOBS, GPU_CONFIG.totalMemoryGB);
  const selectedJobs = selected.map(i => GPU_JOBS[i]);
  const rejectedJobs = GPU_JOBS.filter((_, i) => !selected.includes(i));
  const usedMem = selectedJobs.reduce((s, j) => s + j.memoryGB, 0);
  const maxUsers = GPU_CONFIG.maxConcurrentUsers;

  // Store rejected students globally for cross-module bonus
  window.__rejectedStudents = rejectedJobs.map(j => j.student);

  // Build DP table preview (show last 5 items and last 8 capacities for readability)
  const showItems = Math.min(GPU_JOBS.length, 5);
  const showCaps = Math.min(GPU_CONFIG.totalMemoryGB, 10);
  const startItem = GPU_JOBS.length - showItems;
  const startCap = GPU_CONFIG.totalMemoryGB - showCaps;

  let dpTableHTML = '<table class="knapsack-table"><thead><tr><th style="font-size:0.65rem">Item\\Cap</th>';
  for (let w = startCap; w <= GPU_CONFIG.totalMemoryGB; w++) {
    dpTableHTML += `<th class="knapsack-cell">${w}GB</th>`;
  }
  dpTableHTML += '</tr></thead><tbody>';
  for (let i = startItem; i <= GPU_JOBS.length; i++) {
    const label = i === 0 ? '∅' : GPU_JOBS[i - 1].id;
    dpTableHTML += `<tr><td style="font-size:0.7rem;font-weight:600;">${label}</td>`;
    for (let w = startCap; w <= GPU_CONFIG.totalMemoryGB; w++) {
      const isHighlight = i === GPU_JOBS.length && w === GPU_CONFIG.totalMemoryGB;
      dpTableHTML += `<td class="knapsack-cell${isHighlight ? ' highlight' : ''}">${dp[i][w]}</td>`;
    }
    dpTableHTML += '</tr>';
  }
  dpTableHTML += '</tbody></table>';

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
        <div class="gpu-slot-user">${job.student}</div>
        <div class="gpu-slot-mem">${job.memoryGB}GB • ${job.model}</div>
        <span class="tag tag-green" style="margin-top:8px">Running</span>
      </div>`;
    } else if (i === maxUsers && selectedJobs[i]) {
      return `<div class="gpu-slot blocked">
        <div class="gpu-slot-id">SLOT ${i + 1} — BLOCKED</div>
        <div class="gpu-slot-user">${selectedJobs[i].student}</div>
        <div class="gpu-slot-mem">${selectedJobs[i].memoryGB}GB • ${selectedJobs[i].model}</div>
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

  const jobRows = GPU_JOBS.map((j, i) => {
    const isSelected = selected.includes(i);
    const isBlocked = isSelected && selected.indexOf(i) >= maxUsers;
    let statusTag;
    if (isBlocked) statusTag = '<span class="tag tag-amber">Blocked (N+1)</span>';
    else if (isSelected) statusTag = '<span class="tag tag-green">Selected</span>';
    else statusTag = '<span class="tag tag-rose">Rejected</span>';
    return `<tr>
      <td><strong>${j.id}</strong></td><td>${j.student}</td><td>${j.model}</td>
      <td>${j.memoryGB} GB</td><td>${j.priority}</td><td>${j.duration} min</td>
      <td>${statusTag}</td>
    </tr>`;
  }).join('');

  return `
  <div class="fade-in">
    <div class="page-header" style="display:flex;justify-content:space-between;align-items:flex-start;">
      <div>
        <h1 class="page-title">🖥️ GPU Cluster Access</h1>
        <p class="page-desc">0-1 Knapsack DP + Counting Semaphore (max ${maxUsers} concurrent)</p>
      </div>
      <button class="btn btn-primary" id="btn-run-m2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        Run Job Selection
      </button>
    </div>

    <div class="module-grid module-grid-2" style="margin-bottom:20px;">
      <!-- Knapsack Info -->
      <div class="card slide-up" style="border-left:3px solid var(--accent-purple);">
        <div style="display:flex;gap:16px;align-items:center;margin-bottom:16px;">
          <div style="font-size:2.2rem;">🎒</div>
          <div>
            <div style="font-weight:700;">0-1 Knapsack DP</div>
            <div style="font-size:0.78rem;color:var(--text-secondary);">Budget: ${GPU_CONFIG.totalMemoryGB}GB — Optimise for max total priority</div>
          </div>
        </div>
        <div style="display:flex;gap:20px;margin-bottom:16px;">
          <div style="text-align:center">
            <div style="font-size:1.6rem;font-weight:800;color:var(--accent-purple);">${maxPriority}</div>
            <div style="font-size:0.65rem;color:var(--text-muted)">Max Priority</div>
          </div>
          <div style="text-align:center">
            <div style="font-size:1.6rem;font-weight:800;color:var(--accent-cyan);">${usedMem}/${GPU_CONFIG.totalMemoryGB}</div>
            <div style="font-size:0.65rem;color:var(--text-muted)">GB Used</div>
          </div>
          <div style="text-align:center">
            <div style="font-size:1.6rem;font-weight:800;color:var(--accent-green);">${selected.length}</div>
            <div style="font-size:0.65rem;color:var(--text-muted)">Jobs Selected</div>
          </div>
        </div>
        <div style="font-size:0.72rem;font-weight:600;margin-bottom:8px;color:var(--text-muted);">DP TABLE (partial view)</div>
        <div class="table-container" style="border:none;">${dpTableHTML}</div>
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
          <span class="tag tag-green">${selected.length} selected</span>
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
