// ===== Module 3: Service Boot Sequencer — Topological Sort + Gantt =====
import { SERVICES, SERVICES_CYCLIC } from '../data.js';

const GANTT_COLORS = ['#6366f1','#a855f7','#06b6d4','#10b981','#f59e0b','#f43f5e','#ec4899','#8b5cf6','#14b8a6','#f97316'];

// Topological Sort (Kahn's Algorithm — Decrease & Conquer) with cycle detection
function topologicalSort(services) {
  const graph = new Map();
  const inDeg = new Map();
  services.forEach(s => { graph.set(s.id, []); inDeg.set(s.id, 0); });
  services.forEach(s => {
    for (const dep of s.deps) {
      if (graph.has(dep)) {
        graph.get(dep).push(s.id);
        inDeg.set(s.id, inDeg.get(s.id) + 1);
      }
    }
  });

  const queue = [];
  inDeg.forEach((deg, id) => { if (deg === 0) queue.push(id); });
  const order = [];
  while (queue.length > 0) {
    const node = queue.shift();
    order.push(node);
    for (const neighbor of graph.get(node)) {
      inDeg.set(neighbor, inDeg.get(neighbor) - 1);
      if (inDeg.get(neighbor) === 0) queue.push(neighbor);
    }
  }

  const hasCycle = order.length !== services.length;
  return { order, hasCycle };
}

// Compute Gantt-style schedule: each service starts after all deps finish
function computeGantt(services, order) {
  const svcMap = new Map(services.map(s => [s.id, s]));
  const schedule = new Map();
  for (const id of order) {
    const svc = svcMap.get(id);
    let earliest = 0;
    for (const dep of svc.deps) {
      if (schedule.has(dep)) {
        const depEnd = schedule.get(dep).start + schedule.get(dep).duration;
        earliest = Math.max(earliest, depEnd);
      }
    }
    schedule.set(id, { start: earliest, duration: svc.bootTime, name: svc.name });
  }
  return schedule;
}

export function renderServiceBoot() {
  const { order, hasCycle } = topologicalSort(SERVICES);
  const cyclicResult = topologicalSort(SERVICES_CYCLIC);

  const svcMap = new Map(SERVICES.map(s => [s.id, s]));
  const schedule = hasCycle ? new Map() : computeGantt(SERVICES, order);

  // Find max time for Gantt scale
  let maxTime = 0;
  schedule.forEach(s => { maxTime = Math.max(maxTime, s.start + s.duration); });
  maxTime = maxTime || 20;

  // Rejected students from Module 2 — cross-module bonus
  const rejected = window.__rejectedStudents || [];

  // Build dependency graph nodes
  const depNodes = SERVICES.map((svc, i) => {
    const isLowPri = rejected.length > 0 && svc.id === 'svc-portal';
    const cls = isLowPri ? 'flag-low-priority' : '';
    return `<div class="dep-node ${cls}" data-svc="${svc.id}" id="dep-${svc.id}">
      <div class="dep-node-name">${svc.name}</div>
      <div class="dep-node-status">deps: ${svc.deps.length === 0 ? 'none' : svc.deps.map(d => svcMap.get(d)?.name || d).join(', ')}</div>
      <div style="font-size:0.6rem;color:var(--text-muted);margin-top:4px">${svc.bootTime}s boot</div>
    </div>`;
  }).join('');

  // Gantt rows
  const ganttRows = order.map((id, i) => {
    const s = schedule.get(id);
    const left = (s.start / maxTime) * 100;
    const width = (s.duration / maxTime) * 100;
    const color = GANTT_COLORS[i % GANTT_COLORS.length];
    return `<div class="gantt-row">
      <div class="gantt-label">${s.name}</div>
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
    const svc = svcMap.get(id);
    return `<span style="display:inline-flex;align-items:center;gap:4px;padding:4px 10px;background:var(--bg-primary);border-radius:var(--radius-sm);font-size:0.75rem;font-weight:600;">
      <span style="color:var(--text-muted);font-size:0.65rem;">${i + 1}.</span> ${svc.name}
    </span>`;
  }).join('<span style="color:var(--text-muted);margin:0 4px;">→</span>');

  return `
  <div class="fade-in">
    <div class="page-header" style="display:flex;justify-content:space-between;align-items:flex-start;">
      <div>
        <h1 class="page-title">⚡ Service Boot Sequencer</h1>
        <p class="page-desc">Topological Sort (Decrease & Conquer) + Process Scheduling Gantt</p>
      </div>
      <div style="display:flex;gap:8px;">
        <button class="btn btn-primary" id="btn-run-m3">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          Boot Services
        </button>
        <button class="btn btn-danger btn-sm" id="btn-test-cycle">Test Cycle</button>
      </div>
    </div>

    <!-- Algorithm + Order -->
    <div class="card slide-up" style="margin-bottom:20px;border-left:3px solid var(--accent-cyan);">
      <div style="display:flex;gap:16px;align-items:center;margin-bottom:16px;">
        <div style="font-size:2.2rem;">🔀</div>
        <div>
          <div style="font-weight:700;">Kahn's Topological Sort</div>
          <div style="font-size:0.78rem;color:var(--text-secondary);">
            Decrease & Conquer — repeatedly remove nodes with 0 in-degree to find valid boot order.
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
      <!-- Dependency Graph -->
      <div class="card slide-up" style="animation-delay:0.1s;">
        <div class="card-header">
          <div class="card-title">Dependency Graph</div>
          <span class="tag tag-cyan">${SERVICES.length} nodes</span>
        </div>
        <div class="dep-graph">${depNodes}</div>
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
        <div class="card-title">🔄 Cycle Detection</div>
        <span class="tag ${cyclicResult.hasCycle ? 'tag-rose' : 'tag-green'}">${cyclicResult.hasCycle ? 'Cycle Detected!' : 'No Cycle'}</span>
      </div>
      <div style="font-size:0.82rem;color:var(--text-secondary);margin-bottom:12px;">
        Testing cyclic config: ${SERVICES_CYCLIC.map(s => s.name).join(' → ')} → ${SERVICES_CYCLIC[0].name}
      </div>
      <div class="log-console">
        <div class="log-line"><span class="log-time">boot</span><span class="log-tag info">TOPO</span><span class="log-msg">Running topological sort on ${SERVICES_CYCLIC.length} services...</span></div>
        <div class="log-line"><span class="log-time">boot</span><span class="log-tag ${cyclicResult.hasCycle ? 'error' : 'success'}">TOPO</span><span class="log-msg">${cyclicResult.hasCycle ? `⚠ CYCLE DETECTED — only ${cyclicResult.order.length}/${SERVICES_CYCLIC.length} nodes resolved. Circular dependency prevents boot!` : 'All services resolved in valid order.'}</span></div>
        ${cyclicResult.hasCycle ? `<div class="log-line"><span class="log-time">boot</span><span class="log-tag warn">FIX</span><span class="log-msg">Remove one dependency edge to break the cycle and retry.</span></div>` : ''}
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
