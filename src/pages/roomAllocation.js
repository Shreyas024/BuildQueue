// ===== Module 1: Room Allocation — Greedy Interval Scheduling =====
import { ROOMS, COURSES } from '../data.js';

const COLORS = ['#6366f1','#a855f7','#06b6d4','#10b981','#f59e0b','#f43f5e','#ec4899','#8b5cf6','#14b8a6','#f97316'];
const HOUR_START = 8, HOUR_END = 18, TOTAL_HOURS = HOUR_END - HOUR_START;

// Greedy interval scheduling: earliest-finish-time per room
function greedyAllocate(courses, rooms) {
  const sorted = [...courses].sort((a, b) => a.end - b.end || a.start - b.start);
  const allocation = rooms.map(r => ({ room: r, courses: [], lastEnd: 0 }));
  const unassigned = [];

  for (const course of sorted) {
    // find room with capacity >= students, where course doesn't overlap
    let best = null;
    for (const slot of allocation) {
      if (slot.room.capacity >= course.students && slot.lastEnd <= course.start) {
        if (!best || slot.room.capacity < best.room.capacity) best = slot;
      }
    }
    if (best) {
      best.courses.push(course);
      best.lastEnd = course.end;
    } else {
      unassigned.push(course);
    }
  }
  return { allocation, unassigned };
}

function calcUtilisation(allocation) {
  let used = 0, total = allocation.length * TOTAL_HOURS;
  for (const slot of allocation) {
    for (const c of slot.courses) used += (c.end - c.start);
  }
  return total > 0 ? Math.round((used / total) * 100) : 0;
}

export function renderRoomAllocation() {
  const { allocation, unassigned } = greedyAllocate(COURSES, ROOMS);
  const util = calcUtilisation(allocation);

  const timeLabels = Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => {
    const h = HOUR_START + i;
    return `${h > 12 ? h - 12 : h}${h >= 12 ? 'pm' : 'am'}`;
  });

  let timelineHTML = allocation.map(slot => {
    const blocks = slot.courses.map((c, ci) => {
      const left = ((c.start - HOUR_START) / TOTAL_HOURS) * 100;
      const width = ((c.end - c.start) / TOTAL_HOURS) * 100;
      const color = COLORS[COURSES.indexOf(c) % COLORS.length];
      return `<div class="timeline-block" style="left:${left}%;width:${width}%;background:${color}" title="${c.id}: ${c.name} (${c.start}:00-${c.end}:00)">${c.id}</div>`;
    }).join('');
    return `<div class="timeline-room">
      <div class="timeline-room-label">${slot.room.id}</div>
      <div class="timeline-track">${blocks}</div>
    </div>`;
  }).join('');

  const axisHTML = `<div class="time-axis">${timeLabels.map(l => `<div class="time-label">${l}</div>`).join('')}</div>`;

  const tableRows = allocation.flatMap(slot =>
    slot.courses.map(c => `<tr>
      <td><strong>${c.id}</strong></td><td>${c.name}</td><td>${c.instructor}</td>
      <td>${slot.room.id} — ${slot.room.name}</td>
      <td>${c.start}:00 – ${c.end}:00</td><td>${c.students}/${slot.room.capacity}</td>
      <td><span class="tag tag-green">Assigned</span></td>
    </tr>`)
  ).join('');

  const unassignedRows = unassigned.map(c => `<tr>
    <td><strong>${c.id}</strong></td><td>${c.name}</td><td>${c.instructor}</td>
    <td>—</td><td>${c.start}:00 – ${c.end}:00</td><td>${c.students}</td>
    <td><span class="tag tag-rose">Unassigned</span></td>
  </tr>`).join('');

  return `
  <div class="fade-in">
    <div class="page-header" style="display:flex;justify-content:space-between;align-items:flex-start;">
      <div>
        <h1 class="page-title">🏫 Room Allocation</h1>
        <p class="page-desc">Greedy Interval Scheduling — Earliest Finish Time Rule</p>
      </div>
      <button class="btn btn-primary" id="btn-run-m1">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        Run Allocation
      </button>
    </div>

    <!-- Algorithm Info -->
    <div class="card slide-up" style="margin-bottom:20px;border-left:3px solid var(--accent-green);">
      <div style="display:flex;gap:20px;align-items:center;">
        <div style="font-size:2.5rem;">📐</div>
        <div>
          <div style="font-weight:700;margin-bottom:4px;">Algorithm: Greedy — Earliest Finish Time</div>
          <div style="font-size:0.8rem;color:var(--text-secondary);">Courses sorted by finish time. For each course, the algorithm assigns the smallest-capacity room that fits and doesn't overlap. This maximises total room utilisation across the semester schedule.</div>
        </div>
        <div style="text-align:center;min-width:80px;">
          <div style="font-size:2rem;font-weight:800;color:var(--accent-green);">${util}%</div>
          <div style="font-size:0.65rem;color:var(--text-muted);">Utilisation</div>
        </div>
      </div>
    </div>

    <!-- Timeline Visualization -->
    <div class="card slide-up" style="animation-delay:0.1s;margin-bottom:20px;">
      <div class="card-header">
        <div class="card-title">Schedule Timeline</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;">
          ${COURSES.slice(0, 6).map((c, i) => `<span style="font-size:0.6rem;display:inline-flex;align-items:center;gap:4px;"><span style="width:8px;height:8px;border-radius:2px;background:${COLORS[i]}"></span>${c.id}</span>`).join('')}
        </div>
      </div>
      <div class="timeline-container">
        ${timelineHTML}
        ${axisHTML}
      </div>
    </div>

    <!-- Allocation Table -->
    <div class="card slide-up" style="animation-delay:0.2s;">
      <div class="card-header">
        <div class="card-title">Allocation Results</div>
        <span class="tag tag-green">${COURSES.length - unassigned.length} assigned</span>
        ${unassigned.length ? `<span class="tag tag-rose">${unassigned.length} unassigned</span>` : ''}
      </div>
      <div class="table-container">
        <table>
          <thead><tr><th>Code</th><th>Course</th><th>Instructor</th><th>Room</th><th>Time</th><th>Capacity</th><th>Status</th></tr></thead>
          <tbody>${tableRows}${unassignedRows}</tbody>
        </table>
      </div>
    </div>
  </div>`;
}
