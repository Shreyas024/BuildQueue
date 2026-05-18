// ===== CampusCore Semester Dataset =====
// This mock data simulates one semester's worth of data.
// The backend will replace these with real API calls.

export const SEMESTER = { name: 'Fall 2026', startDate: '2026-08-15', endDate: '2026-12-10' };

// ── Module 1: Room Allocation ──
export const ROOMS = [
  { id: 'R101', name: 'Turing Hall', capacity: 60 },
  { id: 'R102', name: 'Lovelace Lab', capacity: 40 },
  { id: 'R103', name: 'Dijkstra Room', capacity: 30 },
  { id: 'R104', name: 'Knuth Auditorium', capacity: 120 },
  { id: 'R105', name: 'Hopper Suite', capacity: 50 },
];

export const COURSES = [
  { id: 'CS301', name: 'Algorithms', instructor: 'Dr. Patel', start: 8, end: 10, students: 55, priority: 'high' },
  { id: 'CS302', name: 'Operating Systems', instructor: 'Dr. Kumar', start: 9, end: 11, students: 45, priority: 'high' },
  { id: 'CS303', name: 'Database Systems', instructor: 'Dr. Singh', start: 10, end: 12, students: 35, priority: 'medium' },
  { id: 'CS304', name: 'Machine Learning', instructor: 'Dr. Sharma', start: 11, end: 13, students: 50, priority: 'high' },
  { id: 'CS305', name: 'Computer Networks', instructor: 'Dr. Gupta', start: 8, end: 9, students: 28, priority: 'medium' },
  { id: 'CS306', name: 'Software Engineering', instructor: 'Dr. Verma', start: 13, end: 15, students: 40, priority: 'medium' },
  { id: 'CS307', name: 'Cyber Security', instructor: 'Dr. Reddy', start: 14, end: 16, students: 38, priority: 'low' },
  { id: 'CS308', name: 'Cloud Computing', instructor: 'Dr. Joshi', start: 10, end: 11, students: 25, priority: 'low' },
  { id: 'CS309', name: 'Data Science', instructor: 'Dr. Mehta', start: 15, end: 17, students: 55, priority: 'high' },
  { id: 'CS310', name: 'Web Development', instructor: 'Dr. Iyer', start: 12, end: 14, students: 42, priority: 'medium' },
];

// ── Module 2: GPU Cluster ──
export const GPU_CONFIG = {
  totalMemoryGB: 24,
  maxConcurrentUsers: 4,  // Counting semaphore limit
};

export const GPU_JOBS = [
  { id: 'J001', student: 'Aarav S.', model: 'ResNet-50', memoryGB: 6, priority: 3, duration: 45, status: 'queued' },
  { id: 'J002', student: 'Priya M.', model: 'BERT-Base', memoryGB: 8, priority: 5, duration: 60, status: 'queued' },
  { id: 'J003', student: 'Rohan K.', model: 'GPT-2 Small', memoryGB: 10, priority: 4, duration: 90, status: 'queued' },
  { id: 'J004', student: 'Sneha R.', model: 'YOLO v5', memoryGB: 4, priority: 2, duration: 30, status: 'queued' },
  { id: 'J005', student: 'Vikram T.', model: 'StyleGAN', memoryGB: 12, priority: 5, duration: 120, status: 'queued' },
  { id: 'J006', student: 'Neha P.', model: 'Wav2Vec', memoryGB: 7, priority: 3, duration: 55, status: 'queued' },
  { id: 'J007', student: 'Arjun D.', model: 'EfficientNet', memoryGB: 5, priority: 1, duration: 25, status: 'queued' },
  { id: 'J008', student: 'Kavya L.', model: 'Transformer-XL', memoryGB: 14, priority: 4, duration: 100, status: 'queued' },
];

// ── Module 3: Service Boot Sequencer ──
export const SERVICES = [
  { id: 'svc-db', name: 'Database', bootTime: 3, deps: [] },
  { id: 'svc-cache', name: 'Cache Server', bootTime: 2, deps: ['svc-db'] },
  { id: 'svc-auth', name: 'Auth Service', bootTime: 4, deps: ['svc-db', 'svc-cache'] },
  { id: 'svc-api', name: 'API Gateway', bootTime: 3, deps: ['svc-auth'] },
  { id: 'svc-portal', name: 'Student Portal', bootTime: 5, deps: ['svc-api', 'svc-auth'] },
  { id: 'svc-lms', name: 'LMS Engine', bootTime: 4, deps: ['svc-api', 'svc-db'] },
  { id: 'svc-notify', name: 'Notifications', bootTime: 2, deps: ['svc-api'] },
  { id: 'svc-analytics', name: 'Analytics', bootTime: 3, deps: ['svc-db', 'svc-cache'] },
  { id: 'svc-gpu', name: 'GPU Manager', bootTime: 6, deps: ['svc-api', 'svc-auth'] },
  { id: 'svc-cdn', name: 'CDN Service', bootTime: 2, deps: [] },
];

// Cyclic dependency test set (for cycle detection demo)
export const SERVICES_CYCLIC = [
  { id: 'svc-a', name: 'Service A', bootTime: 2, deps: ['svc-c'] },
  { id: 'svc-b', name: 'Service B', bootTime: 3, deps: ['svc-a'] },
  { id: 'svc-c', name: 'Service C', bootTime: 2, deps: ['svc-b'] },
];
