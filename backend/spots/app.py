# pyright: reportUnknownMemberType=false

from typing import Any
import logging
from flask import Flask, jsonify, request
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

@app.route("/api/get-spots", methods=["GET", "POST"])
def get_all_spots():
    user_lat = 0
    user_lng = 0


    if request.method == "POST":
        data: dict[str, Any] | None = request.json
        if data:
            user_lat: float = data.get("lat", 0)
            user_lng: float = data.get("lng", 0)

    library_rooms = get_library_study_rooms
    buildings = get_buildings
    return_data = {**}

def get_buildings(user_lat: int = 0, user_lng: int = 0):
    LOG.info(f"User lat: {user_lat}, User lng: {user_lng}")

    driver = create_driver()
    driver.implicitly_wait(10)

    try:
        LOG.info(f"Visiting URL: https://uab-it.github.io/projects/SenSource/")

        _ = WebDriverWait(driver, 30).until(
            EC.presence_of_element_located((By.CLASS_NAME, "fc-datagrid-cell"))
        )
    
    finally: 
        driver.quit()



# @app.route("/api/library-study-rooms", methods=["GET", "POST"])
def get_library_study_rooms(user_lat: int = 0, user_lng: int = 0):
    LOG.info(f"User lat: {user_lat}, User lng: {user_lng}")

    driver = create_driver()
    driver.implicitly_wait(10)

    try:
        LOG.info(f"Visiting URL: https://libcal.library.uab.edu/allspaces")
        driver.get("https://libcal.library.uab.edu/allspaces")

        _ = WebDriverWait(driver, 30).until(
            EC.presence_of_element_located((By.CLASS_NAME, "fc-datagrid-cell"))
        )

        # Extract data for Sterne Library
        sterne_data = extract_room_data(
            driver, "s-lc-17033", STERNE_DATA_MAP, user_lat, user_lng
        )
        # Extract data for Lister Building
        lister_data = extract_room_data(
            driver, "s-lc-17032", LISTER_DATA_MAP, user_lat, user_lng
        )

        full_rooms_data = [sterne_data, lister_data]

        return jsonify(full_rooms_data)

    finally:
        driver.quit()


if __name__ == "__main__":
    debug_mode = os.getenv("FLASK_DEBUG", "0") == "1"
    app.run(host="0.0.0.0", port=8080, debug=debug_mode)
