import logging
import re

from spots.scraping import sxpath
from spots.models import HtmlElement

LOG = logging.getLogger(__name__)


def get_available_slots(slots: list[HtmlElement], data_map: dict[str, str]):
    data_objects: list[dict[str, str]] = []

    for slot in slots:
        room = {}

        LOG.info(f"Slot: {slot}")

        available_slots = sxpath(slot, ".//a")
        LOG.info(f"Available slots: {available_slots}")

        if available_slots:
            first_available_slot = available_slots[0]
            tag_title = first_available_slot.attrib.get("title")

            LOG.info(f"Tag title: {tag_title}")
            pattern = r"- (.*?) -"

            if not tag_title:
                continue

            matches = re.search(pattern, tag_title)

            if matches:
                room_name = matches.group(1)
                room["roomNumber"] = room_name
                slots: list[dict[str, str]] = []
                room["slots"] = slots

                if "unavailable" in tag_title.lower():
                    slots.append(
                        {
                            "StartTime": "00:00:00",
                            "EndTime": "00:00:00",
                            "Status": "unavailable",
                        }
                    )
                else:
                    room["slots"].append(
                        {
                            "StartTime": "00:00:00",
                            "EndTime": "00:00:00",
                            "Status": "available",
                        }
                    )

                room["building"] = data_map["building"]
                room["building_code"] = data_map["building_code"]
                room["building_status"] = data_map["building_status"]
                room["coords"] = data_map["coords"]
                data_objects.append(room)

    LOG.info(f"Slot to room map: {data_objects}")

    return data_objects