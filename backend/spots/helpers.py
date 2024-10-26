# pyright: reportUnknownMemberType=false

import logging
from typing import Any
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.webdriver import WebDriver
from spots.utils import convert_to_24_hour_format
from spots.models import DataFormat, RoomDataMap, Room, RoomSlot


LOG = logging.getLogger(__name__)


def extract_room_data(
    driver: WebDriver, building_div_id: str, data_map: RoomDataMap
) -> DataFormat | dict[str, Any]:
    rooms: list[Room] = []

    availability_rows = driver.find_elements(
        By.XPATH,
        f"//div[@id='{building_div_id}']//td[@class='fc-timeline-lane fc-resource']",
    )
    LOG.info(f"Found {len(availability_rows)} availability rows for {building_div_id}")

    for avail_row in availability_rows:
        LOG.debug(f"Inner Html: {avail_row.get_attribute('innerHTML')}")
        # Room name capture

        a_elements = avail_row.find_elements(
            By.XPATH, ".//a[contains(@class, 'fc-timeline-event')]"
        )

        slots: list[RoomSlot] = []
        room_name_in_title = ""

        for a_elem in a_elements[:1]:
            # Get the title attribute
            title = a_elem.get_attribute("title")

            LOG.debug(f"Availability Row Title: {title}")

            if not title:
                continue

            # The title may contain time and status
            # For example: "10:30am Saturday, October 26, 2024 - Study Room 336 A - Available"
            parts = title.split(" - ")
            if len(parts) >= 3:
                time_and_date = parts[0]
                room_name_in_title = parts[1]
                status = parts[2]
                time = time_and_date.split(" ")[0]

                if status.lower() == "unavailable/padding":
                    status = "unavailable"

                slots.append(
                    RoomSlot(
                        StartTime=convert_to_24_hour_format(time),
                        EndTime=convert_to_24_hour_format(time, add_hours=0.5),
                        Status=status.lower(),
                    )
                )
        room = Room(roomNumber=room_name_in_title, slots=slots[:5])
        rooms.append(room)

    building_data = DataFormat(
        building=data_map.building,
        building_code=data_map.building_code,
        building_status=data_map.building_status,
        coords=data_map.coords,
        rooms=rooms,
        distance=0,
    )

    return building_data.model_dump()
