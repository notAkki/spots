import requests
import json
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

r = requests.get('https://portalapi2.uwaterloo.ca/v2/map/OpenClassrooms')

if r.status_code == 200:
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
                first_weekday_slots = schedule[0]['Slots'] if schedule else []
                
                rooms[room_number] = {
                    "slots": first_weekday_slots
                }


        # Create a new dictionary for the building's info
        building_info = {
            "building": building_name,
            "building_code": building_code,
            "rooms": rooms,
            "coords": building_coords
        }

        building_info_list.append(building_info)

    
    print(json.dumps(building_info_list, indent=2))
    

