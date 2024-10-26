import json
from app import app

def test_get_library_study_rooms():
    with app.test_client() as client:
        response = client.get("/api/library-study-rooms")
        print("Status Code:", response.status_code)
        print("Response JSON:", json.loads(response.data))

if __name__ == "__main__":
    test_get_library_study_rooms()