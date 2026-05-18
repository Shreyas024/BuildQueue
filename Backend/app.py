from flask import Flask, jsonify
from flask_cors import CORS

from modules.room_allocator import allocate_rooms
from modules.gpu_scheduler import simulate_gpu_execution
from modules.service_boot import topological_sort

from data.sample_data import (
    courses, rooms, 
    jobs, GPU_MEMORY, MAX_CONCURRENT_GPU_USERS,
    services, services_cyclic, service_boot_times
)

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return jsonify({"success": True, "message": "CampusCore Backend Running"})

@app.route('/api/rooms', methods=['GET'])
def rooms_api():
    try:
        room_result = allocate_rooms(courses, rooms)
        return jsonify({
            "success": True,
            "module": "Room Allocation",
            "data": room_result
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/gpu', methods=['GET'])
def gpu_api():
    try:
        max_users = MAX_CONCURRENT_GPU_USERS
        memory_limit = GPU_MEMORY
        
        # 1. Select jobs using Knapsack DP
        from modules.gpu_scheduler import knapsack_select
        selected = knapsack_select(jobs, memory_limit)
        
        # Find rejected jobs
        selected_ids = {j['id'] for j in selected}
        rejected = [j for j in jobs if j['id'] not in selected_ids]
        
        # 2. Simulate execution with semaphore
        execution_data = simulate_gpu_execution(selected, max_users)
        
        total_memory_used = sum(job.get('memory', job.get('memory_gb', 0)) for job in selected)
        
        return jsonify({
            "success": True,
            "module": "GPU Scheduler",
            "max_concurrent_users": max_users,
            "memory_limit": memory_limit,
            "memory_used": total_memory_used,
            "jobs_selected": len(selected),
            "selected_jobs": selected,
            "rejected_jobs": rejected,
            "execution": execution_data
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/services', methods=['GET'])
def services_api():
    try:
        # topological_sort(services)
        service_result = topological_sort(services, service_boot_times)
        return jsonify({
            "success": True,
            "module": "Service Boot Sequencer",
            "data": service_result
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/services/cycle-test', methods=['GET'])
def cycle_test_api():
    try:
        service_result = topological_sort(services_cyclic)
        return jsonify({
            "success": True,
            "module": "Service Boot Sequencer - Cycle Test",
            "data": service_result
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/run-all', methods=['GET'])
def run_all():
    try:
        # ROOM MODULE
        room_result = allocate_rooms(courses, rooms)
        
        # GPU MODULE
        max_users = MAX_CONCURRENT_GPU_USERS
        memory_limit = GPU_MEMORY
        from modules.gpu_scheduler import knapsack_select
        selected = knapsack_select(jobs, memory_limit)
        
        selected_ids = {j['id'] for j in selected}
        rejected = [j for j in jobs if j['id'] not in selected_ids]
        
        execution_data = simulate_gpu_execution(selected, max_users)
        total_memory_used = sum(job.get('memory', job.get('memory_gb', 0)) for job in selected)
        
        # SERVICE MODULE
        service_result = topological_sort(services, service_boot_times)
        
        return jsonify({
            "success": True,
            "project": "CampusCore",
            "summary": {
                "total_courses": len(courses),
                "room_utilization_percent": room_result.get("utilization_percent", 0),
                "gpu_jobs_selected": len(selected),
                "gpu_memory_used": total_memory_used,
                "service_boot_success": not service_result.get("cycle_detected", True)
            },
            "rooms": room_result,
            "gpu": {
                "max_concurrent_users": max_users,
                "selected_jobs": selected,
                "rejected_jobs": rejected,
                "execution": execution_data,
                "memory_used": total_memory_used,
                "memory_limit": memory_limit
            },
            "services": service_result
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

import os

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)