# =============================================
# Module 2: GPU Cluster Access
# Algorithm: 0-1 Knapsack DP (job selection)
# OS Concept: Counting Semaphore
#             (limits concurrent GPU users)
# =============================================

from threading import Semaphore, Lock
import threading
import time


def knapsack_select(jobs, memory_limit):
    """
    0-1 Knapsack DP — selects the subset of jobs
    that maximises total memory usage without
    exceeding the GPU memory budget.

    Each job is either fully selected or not (0-1).

    Args:
        jobs: list of dicts with 'memory' key (int GB)
        memory_limit: total GPU memory budget (int GB)

    Returns:
        list of selected job dicts
    """

    n = len(jobs)

    # DP table: dp[i][w] = max memory achievable
    # using first i jobs with capacity w

    dp = [[0] * (memory_limit + 1)
          for _ in range(n + 1)]

    for i in range(1, n + 1):

        mem = jobs[i - 1]['memory']

        for w in range(memory_limit + 1):

            if mem <= w:

                dp[i][w] = max(
                    mem + dp[i - 1][w - mem],
                    dp[i - 1][w]
                )

            else:
                dp[i][w] = dp[i - 1][w]

    # Backtrack to find selected jobs

    selected = []

    w = memory_limit

    for i in range(n, 0, -1):

        if dp[i][w] != dp[i - 1][w]:

            selected.append(jobs[i - 1])

            w -= jobs[i - 1]['memory']

    return selected


def simulate_gpu_execution(jobs, max_concurrent_users=4):
    """
    Simulates concurrent GPU job execution using a
    counting semaphore that limits to N concurrent
    users. The (N+1)th user is blocked until a slot
    opens.

    Each job runs in its own thread. The semaphore
    enforces the concurrency limit.

    Args:
        jobs: list of selected job dicts
        max_concurrent_users: semaphore limit (N)

    Returns:
        dict with execution_logs, timeline, and stats
    """

    semaphore = Semaphore(max_concurrent_users)

    log_lock = Lock()

    logs = []

    timeline = []

    start_epoch = [None]  # mutable ref for threads

    blocked_count = [0]

    def get_elapsed():
        """Milliseconds since simulation started."""
        if start_epoch[0] is None:
            return 0.0
        return round(
            (time.time() - start_epoch[0]) * 1000, 1
        )

    def execute_job(job, job_index):

        with log_lock:

            elapsed = get_elapsed()

            logs.append({
                "time_ms": elapsed,
                "job": job['id'],
                "event": "WAITING",
                "message": (
                    f"{job['id']} ({job.get('student', 'N/A')}) "
                    f"requesting GPU access..."
                )
            })

        # This is where the (N+1)th user blocks
        acquired = semaphore.acquire(blocking=False)

        if not acquired:

            with log_lock:

                blocked_count[0] += 1

                logs.append({
                    "time_ms": get_elapsed(),
                    "job": job['id'],
                    "event": "BLOCKED",
                    "message": (
                        f"{job['id']} BLOCKED — "
                        f"semaphore full "
                        f"(max {max_concurrent_users} users). "
                        f"Waiting for slot..."
                    )
                })

            # Now actually block until a slot opens
            semaphore.acquire(blocking=True)

        with log_lock:

            acquire_time = get_elapsed()

            logs.append({
                "time_ms": acquire_time,
                "job": job['id'],
                "event": "STARTED",
                "message": (
                    f"{job['id']} ACQUIRED GPU — "
                    f"executing {job.get('model', 'job')} "
                    f"({job['memory']}GB)"
                )
            })

            timeline.append({
                "job": job['id'],
                "student": job.get('student', 'N/A'),
                "model": job.get('model', 'N/A'),
                "memory": job['memory'],
                "start_ms": acquire_time
            })

        # Simulate execution (scaled down for speed)
        # Real duration is in minutes; we use 0.5s per job
        time.sleep(0.5)

        with log_lock:

            finish_time = get_elapsed()

            logs.append({
                "time_ms": finish_time,
                "job": job['id'],
                "event": "COMPLETED",
                "message": (
                    f"{job['id']} COMPLETED — "
                    f"released GPU slot"
                )
            })

            # Update timeline entry with end time
            for entry in timeline:
                if entry["job"] == job['id']:
                    entry["end_ms"] = finish_time
                    break

        semaphore.release()

    # -----------------------------------------
    # Launch all threads
    # -----------------------------------------

    start_epoch[0] = time.time()

    threads = []

    for idx, job in enumerate(jobs):

        t = threading.Thread(
            target=execute_job,
            args=(job, idx)
        )

        threads.append(t)

        t.start()

    for t in threads:
        t.join()

    # Sort logs by timestamp for clean output
    logs.sort(key=lambda x: x["time_ms"])

    return {

        "execution_logs": logs,

        "timeline": sorted(
            timeline,
            key=lambda x: x["start_ms"]
        ),

        "stats": {
            "total_jobs": len(jobs),
            "max_concurrent": max_concurrent_users,
            "jobs_blocked": blocked_count[0],
            "total_time_ms": get_elapsed()
        }

    }