import logging
import re
from selenium.webdriver.remote.webelement import WebElement

from spots.utils import convert_to_24_hour_format


LOG = logging.getLogger(__name__)


def get_available_slots(
    available_slot_elements: list[WebElement], data_map: dict[str, str]
):
    rooms_dict = {}
    for a_element in available_slot_elements:
        title = a_element.get_attribute("title")

        # Parse the title to extract time, date, room name, status
        # Example title: "10:30am Saturday, October 26, 2024 - Study Room 336 A - Available"
        parts = title.split(" - ")
        if len(parts) >= 3:
            time_and_date = parts[0]  # e.g., "10:30am Saturday, October 26, 2024"
            room_name = parts[1]  # e.g., "Study Room 336 A"
            status = parts[2]  # e.g., "Available"
            # Extract time from time_and_date
            time = time_and_date.split(" ")[0]  # e.g., "10:30am"
            # Initialize room entry if not present
            if room_name not in rooms_dict:
                rooms_dict[room_name] = {"roomNumber": room_name, "slots": []}
            # Add the slot to the room
            rooms_dict[room_name]["slots"].append(
                {
                    "StartTime": convert_to_24_hour_format(time),
                    "EndTime": "",  # End time is not provided in title
                    "Status": status.lower(),
                }
            )
        else:
            LOG.warning(f"Unexpected title format: {title}")
    rooms = list(rooms_dict.values())
    return {
        "building": data_map["building"],
        "building_code": data_map["building_code"],
        "building_status": data_map["building_status"],
        "coords": data_map["coords"],
        "rooms": rooms,
    }
