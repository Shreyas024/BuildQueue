// ===== Module 3: Service Boot Sequencer — Topological Sort + Gantt =====

const GANTT_COLORS = ['#6366f1','#a855f7','#06b6d4','#10b981','#f59e0b','#f43f5e','#ec4899','#8b5cf6','#14b8a6','#f97316'];

export async function renderServiceBoot() {
  let payload, cyclicPayload;
  try {
    const res = await fetch('http://127.0.0.1:5000/api/services');
    payload = await res.json();
    
    const cyclicRes = await fetch('http://127.0.0.1:5000/api/services/cycle-test');
    cyclicPayload = await cyclicRes.json();
  } catch (e) {
    return `<div style="padding:40px;text-align:center;color:red">Failed to connect to backend: ${e.message}</div>`;
  }

  const data = payload.data;
  const cyclicResult = cyclicPayload.data;
  
  const hasCycle = data.cycle_detected;
  const order = data.startup_order || [];
  const ganttChart = data.gantt_chart || [];
  const bootLog = data.boot_log || [];
  const maxTime = data.total_boot_time || 20;

  // Rejected students from Module 2 — cross-module bonus
  const rejected = window.__rejectedStudents || [];

  // We don't have the full raw graph in the response, but we can display the Gantt
  // and the order returned by the backend.

  // Gantt rows
  const ganttRows = ganttChart.map((s, i) => {
    const left = (s.start_time / maxTime) * 100;
    const width = (s.duration / maxTime) * 100;
    const color = GANTT_COLORS[i % GANTT_COLORS.length];
    return `<div class="gantt-row">
      <div class="gantt-label">${s.service}</div>
      <div class="gantt-track">
        <div class="gantt-bar" style="left:${left}%;width:${width}%;background:${color}">${s.duration}s</div>
      </div>
    </div>`;
  }).join('');

  // Time axis for Gantt
  const ganttAxis = `<div style="display:flex;margin-left:100px;margin-top:4px;">${Array.from({ length: Math.ceil(maxTime) + 1 }, (_, i) =>
    `<div style="flex:1;font-size:0.6rem;color:var(--text-muted);text-align:center">${i}s</div>`
  ).join('')}</div>`;

  // Topological order display
  const orderHTML = order.map((id, i) => {
    return `<span style="display:inline-flex;align-items:center;gap:4px;padding:4px 10px;background:var(--bg-primary);border-radius:var(--radius-sm);font-size:0.75rem;font-weight:600;">
      <span style="color:var(--text-muted);font-size:0.65rem;">${i + 1}.</span> ${id}
    </span>`;
  }).join('<span style="color:var(--text-muted);margin:0 4px;">→</span>');
  
  const logHTML = bootLog.map(msg => 
      `<div class="log-line"><span class="log-time">SYS</span><span class="log-msg">${msg}</span></div>`
  ).join('');

  return `
  <div class="fade-in">
    <div class="page-header" style="display:flex;justify-content:space-between;align-items:flex-start;">
      <div>
        <h1 class="page-title">⚡ Service Boot Sequencer</h1>
        <p class="page-desc">Topological Sort (Decrease & Conquer) + Process Scheduling Gantt (API Integrated)</p>
      </div>
      <div style="display:flex;gap:8px;">
        <button class="btn btn-primary" id="btn-run-m3" onclick="window.showToast('Fetching Service Boot data...', 'info'); window.navigateTo('service-boot')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          Refresh Data
        </button>
      </div>
    </div>

    <!-- Algorithm + Order -->
    <div class="card slide-up" style="margin-bottom:20px;border-left:3px solid var(--accent-cyan);">
      <div style="display:flex;gap:16px;align-items:center;margin-bottom:16px;">
        <div style="font-size:2.2rem;">🔀</div>
        <div>
          <div style="font-weight:700;">Kahn's Topological Sort</div>
          <div style="font-size:0.78rem;color:var(--text-secondary);">
            Decrease & Conquer — repeatedly remove nodes with 0 in-degree to find valid boot order. Handled by backend API.
          </div>
        </div>
        <div style="margin-left:auto;text-align:center;">
          <div style="font-size:1.6rem;font-weight:800;color:${hasCycle ? 'var(--accent-rose)' : 'var(--accent-green)'};">${hasCycle ? 'CYCLE!' : 'Valid'}</div>
          <div style="font-size:0.65rem;color:var(--text-muted);">Graph Status</div>
        </div>
      </div>
      <div style="font-size:0.72rem;font-weight:600;color:var(--text-muted);margin-bottom:8px;">BOOT ORDER</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;">${orderHTML}</div>
    </div>

    <div class="module-grid module-grid-2" style="margin-bottom:20px;">
      <!-- Backend Log -->
      <div class="card slide-up" style="animation-delay:0.1s;">
        <div class="card-header">
          <div class="card-title">Backend Evaluation Log</div>
        </div>
        <div class="log-console" style="max-height: 300px; overflow-y: auto;">
            ${logHTML}
        </div>
      </div>

      <!-- Gantt Chart -->
      <div class="card slide-up" style="animation-delay:0.15s;">
        <div class="card-header">
          <div class="card-title">Gantt — Process Scheduling</div>
          <span class="tag tag-indigo">Total: ${maxTime}s</span>
        </div>
        <div class="gantt-container">
          ${ganttRows}
          ${ganttAxis}
        </div>
      </div>
    </div>

    <!-- Cycle Detection Demo -->
    <div class="card slide-up" style="animation-delay:0.2s;" id="cycle-section">
      <div class="card-header">
        <div class="card-title">🔄 Cycle Detection (Backend Evaluated)</div>
        <span class="tag ${cyclicResult.cycle_detected ? 'tag-rose' : 'tag-green'}">${cyclicResult.cycle_detected ? 'Cycle Detected!' : 'No Cycle'}</span>
      </div>
      <div style="font-size:0.82rem;color:var(--text-secondary);margin-bottom:12px;">
        Testing cyclic config from API (/api/services/cycle-test)
      </div>
      <div class="log-console">
        ${(cyclicResult.boot_log || []).map(msg => 
            `<div class="log-line"><span class="log-time">boot</span><span class="log-msg">${msg}</span></div>`
        ).join('')}
      </div>
    </div>

    ${rejected.length > 0 ? `
    <!-- Cross-Module Bonus -->
    <div class="card slide-up" style="animation-delay:0.25s;border-left:3px solid var(--accent-amber);margin-top:20px;">
      <div class="card-header">
        <div class="card-title">⚠️ Cross-Module Flag (Bonus)</div>
        <span class="tag tag-amber">Active</span>
      </div>
      <p style="font-size:0.82rem;color:var(--text-secondary);">GPU-rejected students flagged as low priority on Student Portal service:</p>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;">
        ${rejected.map(s => `<span class="tag tag-amber">${s}</span>`).join('')}
      </div>
    </div>` : ''}
  </div>`;
}
