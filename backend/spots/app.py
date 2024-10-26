# pyright: reportUnknownMemberType=false

import logging
from flask import Flask, jsonify
import os
from flask_cors import CORS
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from spots.constants import STERNE_DATA_MAP, LISTER_DATA_MAP
from spots.scraping import create_driver
from spots.helpers import extract_room_data

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


if __name__ == "__main__":
    debug_mode = os.getenv("FLASK_DEBUG", "0") == "1"
    app.run(host="0.0.0.0", port=8080, debug=debug_mode)
