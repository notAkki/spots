from flask import Flask, jsonify
import os
import logging


from spots.models import Element
from spots.scraping import scrape, sxpath


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
        ],
    )

    sterne_rooms = elements["sterne"]
    lister_rooms = elements["lister"]

    sterne_room_groups = [e.text for e in sterne_rooms]
    lister_room_groups = [e.text for e in lister_rooms]

    sterne_rooms = [r.split(",") for r in sterne_room_groups]
    lister_rooms = [r.split(",") for r in lister_room_groups]

    sterne_slots = elements["sterne_slots"][0].html

    LOG.info(f"Sterne slots: {sterne_slots}")

    STERNE_SLOT_TO_ROOM_MAP = {}

    if sterne_slots:
        for sterne_slot in sterne_slots:
            LOG.info(f"Sterne slot: {sterne_slot}")

            available_slots = sxpath(sterne_slot, ".//a")
            LOG.info(f"Available slots: {available_slots}")

            if available_slots:
                first_available_slot = available_slots[0]
                tag_title = first_available_slot.attrib.get("title")

                LOG.info(f"Tag title: {tag_title}")

                if tag_title and "available" in tag_title.lower():
                    STERNE_SLOT_TO_ROOM_MAP[sterne_slot] = "available"
                else:
                    STERNE_SLOT_TO_ROOM_MAP[sterne_slot] = "unavailable"

                LOG.info(f"Sterne slot to room map: {STERNE_SLOT_TO_ROOM_MAP}")

        return jsonify(
            {
                "sterne_rooms": sterne_rooms,
                "lister_rooms": lister_rooms,
                "sterne_slot_to_room_map": STERNE_SLOT_TO_ROOM_MAP,
            }
        )

    return jsonify(
        {
            "sterne_rooms": sterne_rooms,
            "lister_rooms": lister_rooms,
        }
    )


if __name__ == "__main__":
    debug_mode = os.getenv("FLASK_DEBUG", "0") == "1"
    app.run(host="0.0.0.0", port=8080, debug=debug_mode)
