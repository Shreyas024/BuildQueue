# ===== CampusCore Semester Dataset =====
# Shared data for one semester — used by all three modules.


# ── Module 1: Room Allocation ──

rooms = [
    {"id": "R101", "name": "Turing Hall",      "capacity": 60},
    {"id": "R102", "name": "Lovelace Lab",      "capacity": 40},
    {"id": "R103", "name": "Dijkstra Room",     "capacity": 30},
    {"id": "R104", "name": "Knuth Auditorium",  "capacity": 120},
    {"id": "R105", "name": "Hopper Suite",      "capacity": 50},
]

courses = [
    {"id": "CS301", "name": "Algorithms",            "instructor": "Dr. Patel",  "start": 8,  "end": 10, "students": 55, "priority": "high"},
    {"id": "CS302", "name": "Operating Systems",     "instructor": "Dr. Kumar",  "start": 9,  "end": 11, "students": 45, "priority": "high"},
    {"id": "CS303", "name": "Database Systems",      "instructor": "Dr. Singh",  "start": 10, "end": 12, "students": 35, "priority": "medium"},
    {"id": "CS304", "name": "Machine Learning",      "instructor": "Dr. Sharma", "start": 11, "end": 13, "students": 50, "priority": "high"},
    {"id": "CS305", "name": "Computer Networks",     "instructor": "Dr. Gupta",  "start": 8,  "end": 9,  "students": 28, "priority": "medium"},
    {"id": "CS306", "name": "Software Engineering",  "instructor": "Dr. Verma",  "start": 13, "end": 15, "students": 40, "priority": "medium"},
    {"id": "CS307", "name": "Cyber Security",        "instructor": "Dr. Reddy",  "start": 14, "end": 16, "students": 38, "priority": "low"},
    {"id": "CS308", "name": "Cloud Computing",       "instructor": "Dr. Joshi",  "start": 10, "end": 11, "students": 25, "priority": "low"},
    {"id": "CS309", "name": "Data Science",          "instructor": "Dr. Mehta",  "start": 15, "end": 17, "students": 55, "priority": "high"},
    {"id": "CS310", "name": "Web Development",       "instructor": "Dr. Iyer",   "start": 12, "end": 14, "students": 42, "priority": "medium"},
]


# ── Module 2: GPU Cluster ──

GPU_MEMORY = 24  # Total GPU memory budget in GB

MAX_CONCURRENT_GPU_USERS = 4  # Counting semaphore limit (N)

jobs = [
    {"id": "J001", "student": "Aarav S.",  "model": "ResNet-50",       "memory": 6,  "priority": 3, "duration": 45},
    {"id": "J002", "student": "Priya M.",  "model": "BERT-Base",       "memory": 8,  "priority": 5, "duration": 60},
    {"id": "J003", "student": "Rohan K.",  "model": "GPT-2 Small",     "memory": 10, "priority": 4, "duration": 90},
    {"id": "J004", "student": "Sneha R.",  "model": "YOLO v5",         "memory": 4,  "priority": 2, "duration": 30},
    {"id": "J005", "student": "Vikram T.", "model": "StyleGAN",        "memory": 12, "priority": 5, "duration": 120},
    {"id": "J006", "student": "Neha P.",   "model": "Wav2Vec",         "memory": 7,  "priority": 3, "duration": 55},
    {"id": "J007", "student": "Arjun D.",  "model": "EfficientNet",    "memory": 5,  "priority": 1, "duration": 25},
    {"id": "J008", "student": "Kavya L.",  "model": "Transformer-XL",  "memory": 14, "priority": 4, "duration": 100},
]


# ── Module 3: Service Boot Sequencer ──
# Graph represented as adjacency list: service -> list of dependencies

services = {
    "svc-db":        [],
    "svc-cdn":       [],
    "svc-cache":     ["svc-db"],
    "svc-auth":      ["svc-db", "svc-cache"],
    "svc-analytics": ["svc-db", "svc-cache"],
    "svc-api":       ["svc-auth"],
    "svc-portal":    ["svc-api", "svc-auth"],
    "svc-lms":       ["svc-api", "svc-db"],
    "svc-notify":    ["svc-api"],
    "svc-gpu":       ["svc-api", "svc-auth"],
}

# Boot time for each service (seconds)
service_boot_times = {
    "svc-db": 3,
    "svc-cdn": 2,
    "svc-cache": 2,
    "svc-auth": 4,
    "svc-analytics": 3,
    "svc-api": 3,
    "svc-portal": 5,
    "svc-lms": 4,
    "svc-notify": 2,
    "svc-gpu": 6,
}


# Cyclic dependency test set (for cycle detection demo)
services_cyclic = {
    "svc-a": ["svc-c"],
    "svc-b": ["svc-a"],
    "svc-c": ["svc-b"],
}
