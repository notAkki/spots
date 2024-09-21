from flask import Flask, jsonify
import requests
import json

app = Flask(__name__)

@app.route('/api/open-classrooms', methods=['GET'])
def get_open_classrooms():
    r = requests.get('https://portalapi2.uwaterloo.ca/v2/map/OpenClassrooms')
    data = r.json()

    building_info_list = []

    for feature in data.get('data', {}).get('features', []):
        building_name = feature['properties']['buildingName']
        building_code = feature['properties']['buildingCode']
       
        building_coords = feature['geometry']['coordinates']
        temp = building_coords[0]
        building_coords[0] = building_coords[1]
        building_coords[1] = temp
        
        open_classroom_slots = json.loads(feature['properties']['openClassroomSlots'])

        rooms = {}

        for room in open_classroom_slots.get('data', []):
            room_number = room['roomNumber']
            schedule = room['Schedule']

            if schedule:
                first_weekday_slots = schedule[1]['Slots'] if schedule else []
                
                rooms[room_number] = {
                    "slots": first_weekday_slots
                }

        building_info = {
            "building": building_name,
            "building_code": building_code,
            "rooms": rooms,
            "coords": building_coords
        }

        building_info_list.append(building_info)

    
    return jsonify(building_info_list)

if __name__ == '__main__':
    app.run(debug=True)
