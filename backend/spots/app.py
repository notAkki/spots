from flask import Flask, jsonify, request
from datetime import datetime
import requests
import json
import os

from spots.utils import haversine, get_slot_status

app = Flask(__name__)


@app.route("/api/test", methods=["GET"])
def test():
    return jsonify({"message": "Test route is working!"})


@app.route("/api/open-classrooms", methods=["GET", "POST"])
def get_open_classrooms():
    user_lat = 0
    user_lng = 0

    if request.method == "GET":
        print("get method")

    if request.method == "POST":
        print("Method post")
        user_location = request.get_json()

        if user_location is None:
            return jsonify({"error": "No data provided"}), 400

        user_lat = user_location.get("lat")
        user_lng = user_location.get("lng")

        if user_lat is None or user_lng is None:
            return (
                jsonify(
                    {"error": "Invalid location data. 'lat' and 'lng' are required."}
                ),
                400,
            )

    # print(f"Received user location: lat = {user_lat}, lng = {user_lng}")

    r = requests.get("https://portalapi2.uwaterloo.ca/v2/map/OpenClassrooms")
    data = r.json()

    # print(r.status_code)
    # print (data)

    current_time = datetime.now().time()

    building_info_list = []

    for feature in data.get("data", {}).get("features", []):
        building_name = feature["properties"]["buildingName"]
        building_code = feature["properties"]["buildingCode"]
        building_coords = feature["geometry"]["coordinates"]

        open_classroom_slots = json.loads(feature["properties"]["openClassroomSlots"])
        rooms = {}

        building_status = "unavailable"

        for room in open_classroom_slots.get("data", []):
            room_number = room["roomNumber"]
            schedule = room["Schedule"]

            # print (room_number + " " + str(schedule))

            if schedule:
                slots = schedule[0]["Slots"] if schedule else []
                slots_with_status = []

                for slot in slots:
                    start_time = slot["StartTime"]
                    end_time = slot["EndTime"]

                    status = get_slot_status(current_time, start_time, end_time)

                    # print (room_number + " " + start_time + " " + end_time + " " + status)

                    if building_status != "available" and status == "available":
                        building_status = "available"
                    elif building_status == "unavailable" and status == "upcoming":
                        building_status = "upcoming"

                    if status != "passed":
                        slots_with_status.append(
                            {
                                "StartTime": start_time,
                                "EndTime": end_time,
                                "Status": status,
                            }
                        )

                if slots_with_status:
                    rooms[room_number] = {"slots": slots_with_status}

        building_info = {
            "building": building_name,
            "building_code": building_code,
            "building_status": building_status,
            "rooms": rooms,
            "coords": building_coords,
            "distance": (
                haversine(user_lat, user_lng, building_coords[1], building_coords[0])
                if user_lat != 0 and user_lng != 0
                else 0
            ),
        }

        if rooms:
            building_info_list.append(building_info)

    if user_lat != 0 and user_lng != 0:
        building_info_list = sorted(building_info_list, key=lambda x: x["distance"])

    return jsonify(building_info_list)


if __name__ == "__main__":
    debug_mode = os.getenv("FLASK_DEBUG", "0") == "1"
    app.run(host="0.0.0.0", port=8080, debug=debug_mode)
