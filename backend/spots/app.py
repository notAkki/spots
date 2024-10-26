# pyright: reportUnknownMemberType=false

import logging
from re import A
from flask import Flask, jsonify
import os
from flask_cors import CORS
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.chrome.webdriver import WebDriver
from spots.utils import convert_to_24_hour_format
from spots.constants import STERNE_DATA_MAP, LISTER_DATA_MAP
from spots.scraping import create_driver

logging.basicConfig(level=logging.INFO)
LOG = logging.getLogger(__name__)

app = Flask(__name__)
_ = CORS(app, resources={r"/*": {"origins": "*"}})


@app.route("/api/healthcheck", methods=["GET"])
def healthcheck():
    return jsonify({"message": "OK"})


@app.route("/api/library-study-rooms", methods=["GET", "POST"])
def get_library_study_rooms():
    driver = create_driver()
    driver.implicitly_wait(10)

    try:
        LOG.info(f"Visiting URL: https://libcal.library.uab.edu/allspaces")
        driver.get("https://libcal.library.uab.edu/allspaces")

        _ = WebDriverWait(driver, 30).until(
            EC.presence_of_element_located((By.CLASS_NAME, "fc-datagrid-cell"))
        )

        # Extract data for Sterne Library
        sterne_data = extract_room_data(driver, "s-lc-17033", STERNE_DATA_MAP)
        # Extract data for Lister Building
        lister_data = extract_room_data(driver, "s-lc-17032", LISTER_DATA_MAP)

        full_rooms_data = [sterne_data, lister_data]

        return jsonify(full_rooms_data)

    finally:
        driver.quit()


def extract_room_data(
    driver: WebDriver, building_div_id: str, data_map: dict[str, str]
) -> dict[str, str] | None:
    rooms = []

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

        slots = []
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
                    {
                        "StartTime": convert_to_24_hour_format(time),
                        "EndTime": convert_to_24_hour_format(time, add_hours=0.5),
                        "Status": status.lower(),
                    }
                )
        room = {"roomNumber": room_name_in_title, "slots": slots[:5]}
        rooms.append(room)

    building_data = {
        "building": data_map["building"],
        "building_code": data_map["building_code"],
        "building_status": data_map["building_status"],
        "coords": data_map["coords"],
        "rooms": rooms,
    }

    return building_data


if __name__ == "__main__":
    debug_mode = os.getenv("FLASK_DEBUG", "0") == "1"
    app.run(host="0.0.0.0", port=8080, debug=debug_mode)
