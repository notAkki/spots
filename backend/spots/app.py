import logging
from flask import Flask, jsonify
import os
from flask_cors import CORS
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait

from constants import STERNE_DATA_MAP, LISTER_DATA_MAP
from scraping import create_driver

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

        WebDriverWait(driver, 30).until(
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


def extract_room_data(driver, building_div_id, data_map):
    rooms = []
    resource_rows = driver.find_elements(
        By.XPATH, f"//div[@id='{building_div_id}']//table[contains(@class, 'fc-datagrid-body')]//tr"
    )
    LOG.info(f"Found {len(resource_rows)} resource rows for {building_div_id}")

    availability_rows = driver.find_elements(
        By.XPATH, f"//div[@id='{building_div_id}']//table[contains(@class, 'fc-timeline-body')]//tr"
    )
    LOG.info(f"Found {len(availability_rows)} availability rows for {building_div_id}")


    if len(resource_rows) != len(availability_rows):
        LOG.error(
            f"Number of resource rows ({len(resource_rows)}) does not match number of availability rows ({len(availability_rows)})"
        )
        return None

    for res_row, avail_row in zip(resource_rows, availability_rows):
        # Room name capture
        room_name_elem = res_row.find_element(
            By.XPATH,
            ".//td[contains(@class, 'fc-datagrid-cell')]//span[@class='fc-datagrid-cell-main']",
        )
        room_name = room_name_elem.text.strip()

        a_elements = avail_row.find_elements(
            By.XPATH, ".//a[contains(@class, 'fc-timeline-event')]"
        )

        slots = []

        for a_elem in a_elements:
            # Get the title attribute
            title = a_elem.get_attribute("title")
            # The title may contain time and status
            # For example: "10:30am Saturday, October 26, 2024 - Study Room 336 A - Available"
            parts = title.split(" - ")
            if len(parts) >= 3:
                time_and_date = parts[0]
                room_name_in_title = parts[1]
                status = parts[2]
                time = time_and_date.split(" ")[0]
                slots.append(
                    {
                        "StartTime": time,
                        "EndTime": "",  # We may need to find a way to get the end time
                        "Status": status.lower(),
                    }
                )
        room = {"roomNumber": room_name, "slots": slots}
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
