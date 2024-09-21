"use client";

import { useEffect, useState } from "react";

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

export default function OpenClassrooms() {
    const [classrooms, setClassrooms] = useState<dataFormat[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const res = await fetch("/api/open-classrooms");
            const data = await res.json();
            setClassrooms(data);
        };

        fetchData();
    }, []);

    return (
        <div>
            {/* Render the classrooms data here */}
            <div>
                {classrooms.map((classroom) => (
                    <div key={classroom.building_code}>
                        {classroom.building}
                    </div>
                ))}
            </div>
        </div>
    );
}
