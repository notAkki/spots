// /app/api/open-classrooms/route.ts

import { NextResponse } from "next/server";

interface dataFormat {
    // Define the structure of the expected data here
    building: string;
    building_code: string;
    rooms: {
        roomNumber: string;
        slots: { StartTime: string; EndTime: string }[];
    }[];
    coords: { lat: number; lng: number };
}

export async function GET() {
    const response = await fetch("http://localhost:5000/api/open-classrooms", {
        method: "GET",
        cache: "no-cache",
    });

    if (!response.ok) {
        return NextResponse.json(
            { error: "Failed to fetch data" },
            { status: 500 }
        );
    }

    const data: dataFormat[] = await response.json();
    return NextResponse.json(data);
}
