# Spots

**Spots** is a web application designed to help students at the University of Waterloo find open classrooms for studying. When libraries and other common study areas are full, students can use Spots to locate available classrooms in real-time, offering more options for quiet and productive study spaces on campus.

![alt text](SpotsDemoImage.png)

## Features

-   Displays open classrooms across the University of Waterloo campus.
-   Sorts classrooms based on proximity to the user’s current location.
-   Provides up-to-date availability of classrooms.
-   Interactive map to visualize classroom locations.
-   List view of classrooms with real-time status updates.

## Tech Stack

### Frontend

-   **Next.js**: Handles server-side rendering and provides a robust React-based framework for building the frontend UI.
-   **Mapbox GL**: Provides the interactive map to display classroom locations on the University of Waterloo campus.
-   **Tailwind CSS**: Used for styling the UI components with utility-first CSS for responsive and consistent design.
-   **Geolocation API**: Retrieves the user’s current location to sort classrooms by proximity.

### Backend

-   **Flask**: A lightweight Python web framework to handle API requests and logic for retrieving and processing classroom availability data.
-   **Requests**: A Python library used in Flask to fetch classroom data from external APIs.
-   **Haversine Formula**: Implemented in the backend to calculate the distance between the user and classroom locations based on coordinates.

## Future Enhancements

-   **User Authentication**: Allow users to log in and save favorite classrooms.
-   **Notifications**: Send alerts when a classroom is available or about to close.
-   **Schedule Integration**: Connect with class schedules to avoid occupied classrooms.
