# =============================================
# Module 3: Service Boot Sequencer
# Algorithm: Kahn's Topological Sort
#            (Decrease & Conquer)
# + Cycle Detection
# + Parallel-aware Gantt Chart
# =============================================

from collections import deque


def topological_sort(graph, boot_times=None):
    """
    Kahn's Algorithm — Decrease & Conquer approach.

    Repeatedly removes nodes with 0 in-degree from
    the graph until all nodes are processed or a
    cycle is detected.

    Args:
        graph: dict mapping service -> list of dependencies
               e.g. {"svc-api": ["svc-auth", "svc-db"]}
        boot_times: optional dict mapping service -> boot
                    duration in seconds. If None, each
                    service defaults to 1 second.

    Returns:
        dict with startup_order, gantt_chart, boot_log,
        cycle info, and success flag.
    """

    boot_log = []

    # -----------------------------------------
    # STEP 1: Build the forward adjacency list
    #         and compute in-degrees
    # -----------------------------------------
    # graph stores: node -> [dependencies]
    # We need:  forward_adj: dep -> [nodes that depend on it]
    # in_degree: node -> number of unresolved dependencies

    all_nodes = set(graph.keys())

    forward_adj = {node: [] for node in all_nodes}

    in_degree = {node: 0 for node in all_nodes}

    for node, deps in graph.items():

        for dep in deps:

            if dep in forward_adj:
                forward_adj[dep].append(node)

            in_degree[node] += 1

    boot_log.append(
        "INIT: Computed in-degrees for "
        f"{len(all_nodes)} services"
    )

    # -----------------------------------------
    # STEP 2: Seed the queue with 0 in-degree
    #         nodes (Decrease step)
    # -----------------------------------------

    queue = deque()

    for node in sorted(all_nodes):

        if in_degree[node] == 0:

            queue.append(node)

            boot_log.append(
                f"READY: {node} has no dependencies "
                "(in-degree = 0)"
            )

    # -----------------------------------------
    # STEP 3: Kahn's BFS — Decrease & Conquer
    # -----------------------------------------

    startup_order = []

    while queue:

        # DECREASE: remove a node with 0 in-degree
        current = queue.popleft()

        startup_order.append(current)

        boot_log.append(
            f"BOOT: Starting service {current}"
        )

        # CONQUER: reduce in-degree of neighbors
        for neighbor in forward_adj[current]:

            in_degree[neighbor] -= 1

            boot_log.append(
                f"  -> {neighbor} in-degree reduced "
                f"to {in_degree[neighbor]}"
            )

            if in_degree[neighbor] == 0:

                queue.append(neighbor)

                boot_log.append(
                    f"READY: {neighbor} unlocked "
                    "(all deps resolved)"
                )

        boot_log.append(
            f"DONE: Service {current} is ready"
        )

    # -----------------------------------------
    # STEP 4: Cycle Detection
    # -----------------------------------------

    if len(startup_order) != len(all_nodes):

        # Nodes still with in_degree > 0 are in a cycle
        cycle_nodes = [
            node for node in all_nodes
            if in_degree[node] > 0
        ]

        boot_log.append(
            f"ERROR: Cycle detected involving "
            f"{cycle_nodes}"
        )

        return {
            "success": False,
            "cycle_detected": True,
            "cycle_path": sorted(cycle_nodes),
            "resolved_count": len(startup_order),
            "total_count": len(all_nodes),
            "boot_log": boot_log
        }

    # -----------------------------------------
    # STEP 5: Gantt Chart — Parallel-Aware
    #
    # Each service starts as soon as ALL of its
    # dependencies have finished booting.
    # Services without shared deps can boot in
    # parallel.
    # -----------------------------------------

    # Default boot time is 1 second per service
    if boot_times is None:
        boot_times = {node: 1 for node in all_nodes}

    finish_time = {}

    gantt = []

    for service in startup_order:

        deps = graph[service]

        # Earliest start = max finish time of all deps
        if deps:
            earliest_start = max(
                finish_time[dep]
                for dep in deps
                if dep in finish_time
            )
        else:
            earliest_start = 0

        duration = boot_times.get(service, 1)

        end_time = earliest_start + duration

        finish_time[service] = end_time

        gantt.append({
            "service": service,
            "start_time": earliest_start,
            "end_time": end_time,
            "duration": duration
        })

        boot_log.append(
            f"GANTT: {service} "
            f"[{earliest_start}s -> {end_time}s] "
            f"(duration: {duration}s)"
        )

    total_boot_time = max(finish_time.values()) if finish_time else 0

    boot_log.append(
        f"COMPLETE: All {len(startup_order)} services "
        f"booted in {total_boot_time}s (parallel)"
    )

    return {

        "success": True,

        "cycle_detected": False,

        "startup_order": startup_order,

        "boot_log": boot_log,

        "gantt_chart": gantt,

        "total_boot_time": total_boot_time

    }