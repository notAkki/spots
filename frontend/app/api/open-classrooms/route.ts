// /app/api/open-classrooms/route.ts

import { NextResponse } from "next/server";

interface dataFormat {
    // Define the structure of the expected data here
    building: string;
    building_code: string;
    rooms: {
        roomNumber: string;
        slots: { StartTime: string; EndTime: string; status: string }[];
    }[];
    coords: [number, number];
    distance: number;
}

export async function POST(req: Request) {
    try {
        // Extract user location from the request body
        const { lat, lng } = await req.json();

        // Send the user location to the backend
        const response = await fetch(
            "https://spots-backend-1036276518870.us-central1.run.app/api/open-classrooms",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ lat, lng }),
            }
        );

        if (!response.ok) {
            return NextResponse.json(
                { error: "Failed to fetch data" },
                { status: 500 }
            );
        }

        // Get data from backend
        const data: dataFormat[] = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error in route:", error);
        return NextResponse.json(
            { error: "Failed to process request" },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        // Fetch the default data without location
        const response = await fetch(
            "https://spots-backend-1036276518870.us-central1.run.app/api/open-classrooms",
            {
                method: "GET",
                cache: "no-cache",
            }
        );

        if (!response.ok) {
            return NextResponse.json(
                { error: "Failed to fetch data" },
                { status: 500 }
            );
        }

        // Get data from backend
        const data: dataFormat[] = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error in GET route:", error);
        return NextResponse.json(
            { error: "Failed to process request" },
            { status: 500 }
        );
    }
}
