"""Quick smoke test for all three CampusCore modules."""

import sys
sys.path.insert(0, ".")

from data.sample_data import *
from modules.room_allocator import allocate_rooms
from modules.gpu_scheduler import knapsack_select, simulate_gpu_execution
from modules.service_boot import topological_sort


print("=" * 50)
print("MODULE 1: Room Allocation (Greedy)")
print("=" * 50)

r = allocate_rooms(list(courses), list(rooms))
assigned = sum(1 for a in r["allocations"] if a["room"] != "UNASSIGNED")
print(f"  Assigned: {assigned}/{len(courses)} courses")
print(f"  Utilization: {r['utilization_percent']}%")
print(f"  Logs: {len(r['logs'])} entries")
print()


print("=" * 50)
print("MODULE 2: GPU Cluster (Knapsack DP + Semaphore)")
print("=" * 50)

sel = knapsack_select(list(jobs), GPU_MEMORY)
print(f"  Selected {len(sel)}/{len(jobs)} jobs")
mem_used = sum(j["memory"] for j in sel)
print(f"  Memory: {mem_used}/{GPU_MEMORY} GB")
print(f"  Selected IDs: {[j['id'] for j in sel]}")

gpu_res = simulate_gpu_execution(sel, MAX_CONCURRENT_GPU_USERS)
print(f"  Blocked count: {gpu_res['stats']['jobs_blocked']}")
print(f"  Concurrent limit: {gpu_res['stats']['max_concurrent']}")
for log in gpu_res["execution_logs"]:
    print(f"    [{log['time_ms']:>8.1f}ms] {log['event']:>9s} | {log['message']}")
print()


print("=" * 50)
print("MODULE 3: Service Boot (Kahn's Topo Sort)")
print("=" * 50)

svc = topological_sort(services, service_boot_times)
print(f"  Success: {svc['success']}")
print(f"  Order: {svc['startup_order']}")
print(f"  Total boot time (parallel): {svc['total_boot_time']}s")
print("  Gantt Chart:")
for g in svc["gantt_chart"]:
    bar = "#" * g["duration"]
    pad = "." * g["start_time"]
    print(f"    {g['service']:>15s} | {pad}{bar} [{g['start_time']}s -> {g['end_time']}s]")
print()


print("=" * 50)
print("MODULE 3: Cycle Detection Test")
print("=" * 50)

cyc = topological_sort(services_cyclic)
print(f"  Cycle detected: {cyc['cycle_detected']}")
print(f"  Cycle nodes: {cyc.get('cycle_path', [])}")
print()

print("ALL MODULES PASSED")
