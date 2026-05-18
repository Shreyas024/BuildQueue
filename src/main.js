// ===== CampusCore — Main Driver =====
import './styles.css';
import { renderDashboard } from './pages/dashboard.js';
import { renderRoomAllocation } from './pages/roomAllocation.js';
import { renderGPUCluster } from './pages/gpuCluster.js';
import { renderServiceBoot } from './pages/serviceBoot.js';
import { renderAnalytics } from './pages/analytics.js';

// Page registry
const pages = {
  'dashboard': { render: renderDashboard, title: 'Dashboard' },
  'room-allocation': { render: renderRoomAllocation, title: 'Room Allocation' },
  'gpu-cluster': { render: renderGPUCluster, title: 'GPU Cluster Access' },
  'service-boot': { render: renderServiceBoot, title: 'Service Boot Sequencer' },
  'analytics': { render: renderAnalytics, title: 'Semester Analytics' },
};

let currentPage = 'dashboard';

function navigateTo(pageId) {
  if (!pages[pageId]) return;
  currentPage = pageId;

  // Update nav
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === pageId);
  });

  // Update topbar title
  document.getElementById('topbar-title').textContent = pages[pageId].title;

  // Render page
  const container = document.getElementById('page-container');
  container.innerHTML = pages[pageId].render();
  container.scrollTop = 0;

  // Close sidebar on mobile
  document.getElementById('sidebar').classList.remove('open');

  // Attach page-specific event listeners
  attachPageListeners(pageId);
}

// Expose for inline onclick handlers
window.navigateTo = navigateTo;

function attachPageListeners(pageId) {
  // Dashboard clear log
  const clearBtn = document.getElementById('btn-clear-log');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      const log = document.getElementById('dashboard-log');
      if (log) log.innerHTML = '<div class="log-line"><span class="log-time">--:--:--</span><span class="log-tag info">SYS</span><span class="log-msg">Log cleared.</span></div>';
    });
  }

  // Run All button
  const runAllBtn = document.getElementById('btn-run-all');
  if (runAllBtn) {
    runAllBtn.addEventListener('click', () => {
      showToast('Running all modules...', 'info');
      // Sequence through modules
      setTimeout(() => { navigateTo('room-allocation'); showToast('Module 1: Room Allocation complete ✓', 'success'); }, 500);
      setTimeout(() => { navigateTo('gpu-cluster'); showToast('Module 2: GPU Cluster complete ✓', 'success'); }, 2000);
      setTimeout(() => { navigateTo('service-boot'); showToast('Module 3: Service Boot complete ✓', 'success'); }, 3500);
      setTimeout(() => { navigateTo('analytics'); showToast('All modules executed! View analytics.', 'success'); }, 5000);
    });
  }

  // Module run buttons
  const m1Btn = document.getElementById('btn-run-m1');
  if (m1Btn) m1Btn.addEventListener('click', () => showToast('Greedy interval scheduling executed ✓', 'success'));

  const m2Btn = document.getElementById('btn-run-m2');
  if (m2Btn) m2Btn.addEventListener('click', () => showToast('Knapsack DP + Semaphore executed ✓', 'success'));

  const m3Btn = document.getElementById('btn-run-m3');
  if (m3Btn) m3Btn.addEventListener('click', () => {
    animateServiceBoot();
    showToast('Topological sort executed — booting services...', 'success');
  });

  const cycleBtn = document.getElementById('btn-test-cycle');
  if (cycleBtn) cycleBtn.addEventListener('click', () => showToast('⚠ Cycle detected in test config!', 'error'));
}

// Animate service boot nodes
function animateServiceBoot() {
  const nodes = document.querySelectorAll('.dep-node');
  nodes.forEach((node, i) => {
    setTimeout(() => {
      node.classList.add('booting');
      setTimeout(() => {
        node.classList.remove('booting');
        node.classList.add('booted');
      }, 800);
    }, i * 400);
  });
}

// Toast notification system
function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
  };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span style="font-weight:700;">${icons[type] || 'ℹ'}</span><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(40px)';
    toast.style.transition = 'all 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ===== Init =====
document.addEventListener('DOMContentLoaded', () => {
  // Sidebar navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(item.dataset.page);
    });
  });

  // Sidebar toggle (mobile)
  document.getElementById('sidebar-toggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
  });

  // Run All button in topbar
  const runAllBtn = document.getElementById('btn-run-all');
  if (runAllBtn) {
    runAllBtn.addEventListener('click', () => {
      showToast('Running all modules sequentially...', 'info');
      setTimeout(() => navigateTo('room-allocation'), 500);
      setTimeout(() => { navigateTo('gpu-cluster'); showToast('Module 1 ✓', 'success'); }, 2000);
      setTimeout(() => { navigateTo('service-boot'); showToast('Module 2 ✓', 'success'); }, 3500);
      setTimeout(() => { navigateTo('analytics'); showToast('All modules complete!', 'success'); }, 5000);
    });
  }

  // Initial render
  navigateTo('dashboard');
});
