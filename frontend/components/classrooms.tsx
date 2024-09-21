"use client";
import React, { useEffect, useState } from "react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

interface dataFormat {
    // Define the structure of the expected data here
    building: string;
    building_code: string;
    rooms: {
        [key: string]: {
            roomNumber: string;
            slots: { StartTime: string; EndTime: string }[];
        };
    };
    coords: { lat: number; lng: number };
}

export default function Classrooms() {
    const [classrooms, setClassrooms] = useState<dataFormat[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const res = await fetch("/api/open-classrooms");
            const data = await res.json();
            console.log(data); // Log the data to inspect its structure

            setClassrooms(data);
        };

        fetchData();
    }, []);

    return (
        <div className="w-[500px]">
            <Accordion type="single" collapsible className="w-full">
                {classrooms.map((classroom) => (
                    <AccordionItem value={classroom.building_code}>
                        <AccordionTrigger>
                            {classroom.building}
                        </AccordionTrigger>
                        <AccordionContent className="font-[family-name:var(--font-geist-mono)] divide-y divide-zinc-500">
                            {classroom.rooms &&
                                Object.entries(classroom.rooms).map(
                                    ([roomNumber, room]) => {
                                        // console.log(roomNumber);
                                        return (
                                            <div
                                                key={roomNumber}
                                                className="flex justify-between py-3"
                                            >
                                                <h2>
                                                    {classroom.building_code}{" "}
                                                    {roomNumber}
                                                </h2>
                                                <ul>
                                                    {room.slots.map(
                                                        (slot, index) => (
                                                            <li key={index}>
                                                                {slot.StartTime}{" "}
                                                                - {slot.EndTime}
                                                            </li>
                                                        )
                                                    )}
                                                </ul>
                                            </div>
                                        );
                                    }
                                )}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
}
