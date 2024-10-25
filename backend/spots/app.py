from tarfile import fully_trusted_filter
from flask import Flask, jsonify
import os
import logging

from spots.constants import STERNE_DATA_MAP, LISTER_DATA_MAP
from spots.models import Element
from spots.scraping import scrape
from spots.helpers import get_available_slots

logging.basicConfig(level=logging.INFO)
LOG = logging.getLogger(__name__)

app = Flask(__name__)


SCRAPERR_API = "http://scraperr_api:8000"


@app.route("/api/healthcheck", methods=["GET"])
def healthcheck():
    return jsonify({"message": "OK"})


@app.route("/api/library-study-rooms", methods=["GET"])
async def get_library_study_rooms():
    elements = scrape(
        url="https://libcal.library.uab.edu/allspaces",
        xpaths=[
            Element(
                name="sterne",
                xpath="//div[@id='s-lc-17033']//td[@class='fc-datagrid-cell fc-resource']",
            ),
            Element(
                name="lister",
                xpath="//div[@id='s-lc-17032']//td[@class='fc-datagrid-cell fc-resource']",
            ),
            Element(
                name="sterne_slots",
                xpath="//div[@id='s-lc-17033']//td[@class='fc-timeline-lane fc-resource']",
                return_html=True,
            ),
            Element(
                name="lister_slots",
                xpath="//div[@id='s-lc-17032']//td[@class='fc-timeline-lane fc-resource']",
                return_html=True,
            ),
        ],
    )

    sterne_rooms = elements["sterne"]
    lister_rooms = elements["lister"]

    sterne_room_groups = [e.text for e in sterne_rooms]
    lister_room_groups = [e.text for e in lister_rooms]

    sterne_rooms = [r.split(",") for r in sterne_room_groups]
    lister_rooms = [r.split(",") for r in lister_room_groups]

    sterne_slots = elements["sterne_slots"][0].html
    lister_slots = elements["lister_slots"][0].html

    LOG.info(f"Sterne slots: {sterne_slots}")

    sterne_rooms_data = (
        get_available_slots(sterne_slots, STERNE_DATA_MAP) if sterne_slots else []
    )
    lister_rooms_data = (
        get_available_slots(lister_slots, LISTER_DATA_MAP) if lister_slots else {}
    )

    full_rooms_data = lister_rooms_data + sterne_rooms_data
    return jsonify(full_rooms_data)


if __name__ == "__main__":
    debug_mode = os.getenv("FLASK_DEBUG", "0") == "1"
    app.run(host="0.0.0.0", port=8080, debug=debug_mode)
