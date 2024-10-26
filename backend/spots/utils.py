import math
from datetime import datetime, time, timedelta
from typing import Literal


def convert_to_24_hour_format(time_str: str, add_hours: int | float = 0) -> str:
    time_obj = datetime.strptime(time_str, "%I:%M%p")
    # Add hours and handle overflow
    time_obj += timedelta(hours=add_hours)
    return time_obj.strftime("%H:%M:%S")


def haversine(
    lat1: float, lon1: float, lat2: float, lon2: float, unit: Literal["mi", "km"] = "mi"
) -> float:
    r = 3958.756

    if unit == "km":
        r = 6371

    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return r * c


def get_slot_status(current_time: time, start_time_str: str, end_time_str: str) -> str:
    start_time = datetime.strptime(start_time_str, "%H:%M:%S").time()
    end_time = datetime.strptime(end_time_str, "%H:%M:%S").time()

    time_until = datetime.combine(datetime.today(), start_time) - datetime.combine(
        datetime.today(), current_time
    )
    time_until = time_until.total_seconds() / 60

    if time_until > 0 and time_until < 20:
        return "upcoming"
    elif start_time <= current_time <= end_time:
        return "available"
    elif current_time > end_time:
        return "passed"
    else:
        return "unavailable"
