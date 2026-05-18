def allocate_rooms(courses, rooms):

    courses.sort(key=lambda x: x['end'])

    allocations = []

    room_usage = {
        room['id']: []
        for room in rooms
    }

    logs = []

    assigned_count = 0

    for course in courses:

        assigned = False

        logs.append(
            f"TRYING TO ASSIGN {course['id']}"
        )

        for room in rooms:

            if room['capacity'] < course['students']:

                continue

            conflict = False

            for booked in room_usage[room['id']]:

                overlap = not (
                    course['end'] <= booked['start']
                    or
                    course['start'] >= booked['end']
                )

                if overlap:
                    conflict = True
                    break

            if not conflict:

                room_usage[room['id']].append(course)

                allocations.append({

                    "course": course['id'],
                    "room": room['id'],
                    "start": course['start'],
                    "end": course['end']

                })

                assigned = True
                assigned_count += 1

                logs.append(
                    f"{course['id']} ASSIGNED TO {room['id']}"
                )

                break

        if not assigned:

            allocations.append({

                "course": course['id'],
                "room": "UNASSIGNED",
                "start": course['start'],
                "end": course['end']

            })

            logs.append(
                f"{course['id']} COULD NOT BE ASSIGNED"
            )

    utilization = round(
        (assigned_count / len(courses)) * 100,
        2
    )

    return {

        "allocations": allocations,

        "room_usage": room_usage,

        "logs": logs,

        "utilization_percent": utilization

    }