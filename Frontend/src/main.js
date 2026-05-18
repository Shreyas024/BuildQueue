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
  container.innerHTML = '<div style="padding: 40px; text-align: center;">Loading...</div>';
  
  Promise.resolve(pages[pageId].render())
    .then(html => {
      container.innerHTML = html;
      container.scrollTop = 0;
      // Close sidebar on mobile
      document.getElementById('sidebar').classList.remove('open');
      // Attach page-specific event listeners
      attachPageListeners(pageId);
    })
    .catch(err => {
      container.innerHTML = `<div style="padding: 40px; text-align: center; color: red;">Error loading page: ${err.message}</div>`;
    });
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
      showToast('Running all modules via API...', 'info');
      fetch('http://127.0.0.1:5000/api/run-all')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            showToast('All modules executed! View analytics.', 'success');
            navigateTo('analytics');
          } else {
            showToast('Error: ' + data.error, 'error');
          }
        })
        .catch(err => showToast('Fetch error: ' + err.message, 'error'));
    });
  }

  // Module run buttons are handled within their respective pages now, 
  // as the data is fetched directly on render.
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
window.showToast = showToast;

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
      showToast('Running all modules via API...', 'info');
      fetch('http://127.0.0.1:5000/api/run-all')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            showToast('All modules complete! ✓', 'success');
            navigateTo('analytics');
          } else {
            showToast('Error: ' + data.error, 'error');
          }
        })
        .catch(err => showToast('Fetch error: ' + err.message, 'error'));
    });
  }

  // Initial render
  navigateTo('dashboard');
});
