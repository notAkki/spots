"use client";
import React, { useEffect, useState } from "react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

// import {
//     HoverCard,
//     HoverCardContent,
//     HoverCardTrigger,
// } from "@/components/ui/hover-card";

interface dataFormat {
    // Define the structure of the expected data here
    building: string;
    building_code: string;
    building_status: string;
    rooms: {
        [key: string]: {
            roomNumber: string;
            slots: { StartTime: string; EndTime: string; Status: string }[];
        };
    };
    coords: [number, number];
}

function formatTime(timeString: string) {
    const options = {
        hour: "numeric" as "numeric",
        minute: "numeric" as "numeric",
        hour12: true,
    };
    const time = new Date(`1970-01-01T${timeString}`); // Using a date to convert time
    return new Intl.DateTimeFormat("en-US", options).format(time);
}

function formatStatus(status: string) {
    return (
        <div
            className={`rounded-lg px-2 py-1 text-sm w-[fit-content]
                ${status === "unavailable" && "bg-red-700/20 text-red-300/80"}
                ${status === "available" && "bg-green-800/20 text-green-300/90"}
                ${status === "upcoming" && "bg-amber-800/20 text-amber-300/90"}
                `}
        >
            {status}
        </div>
    );
}

function statusIndicator(status: string) {
    return (
        <div>
            {/* <HoverCard>
                <HoverCardTrigger>
                    <div
                        className={`absolute h-2 w-2 rounded-full top-[33%] 
                        ${status === "unavailable" && "bg-red-400"}
                        ${status === "available" && "bg-green-400"}
                        ${status === "upcoming" && "bg-amber-400"}
                        `}
                    ></div>
                </HoverCardTrigger>
                <HoverCardContent
                    className={`w-[fit-content] px-2 py-0.5 text-xs translate-x-16 border-none
                        ${
                            status === "unavailable" &&
                            "bg-red-700/20 text-red-300/80"
                        }
                        ${
                            status === "available" &&
                            "bg-green-800/20 text-green-300/90"
                        }
                        ${
                            status === "upcoming" &&
                            "bg-amber-800/20 text-amber-300/90"
                        }`}
                >
                    {status}
                </HoverCardContent>
            </HoverCard> */}
            <div
                className={`h-2 w-2 rounded-full 
                    ${status === "unavailable" && "bg-red-400"}
                    ${status === "available" && "bg-green-400"}
                    ${status === "upcoming" && "bg-amber-400"}
                        `}
            ></div>
        </div>
    );
}

export default function Classrooms() {
    const [classrooms, setClassrooms] = useState<dataFormat[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const res = await fetch("/api/open-classrooms");
            const data = await res.json();
            // console.log(data); // Log the data to inspect its structure

            setClassrooms(data);
        };

        fetchData();
    }, []);

    return (
        <div className="px-8">
            <Accordion type="single" collapsible className="w-full">
                {classrooms.map((classroom) => (
                    <AccordionItem
                        id={classroom.building_code}
                        value={classroom.building_code}
                    >
                        <AccordionTrigger>
                            <div className="flex justify-between w-[95%] text-left text-lg group items-center">
                                <div className="group-hover:underline underline-offset-8 pr-2">
                                    {classroom.building_code} -{" "}
                                    {classroom.building}
                                </div>
                                <div className="">
                                    {formatStatus(classroom.building_status)}
                                </div>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="divide-y divide-zinc-500">
                            {classroom.rooms &&
                                Object.entries(classroom.rooms).map(
                                    ([roomNumber, room]) => {
                                        return (
                                            <div
                                                key={roomNumber}
                                                className="flex justify-between py-4 text-lg font-[family-name:var(--font-geist-mono)] text-[16px]"
                                            >
                                                <div className="flex gap-4 items-center h-[fit-content]">
                                                    <div className="w-18">
                                                        {
                                                            classroom.building_code
                                                        }{" "}
                                                        {roomNumber}
                                                    </div>
                                                    <div className="relative">
                                                        {statusIndicator(
                                                            room.slots[0].Status
                                                        )}
                                                    </div>
                                                </div>
                                                <ul className="text-right">
                                                    {room.slots.map(
                                                        (slot, index) => (
                                                            <li key={index}>
                                                                {formatTime(
                                                                    slot.StartTime
                                                                )}{" "}
                                                                -{" "}
                                                                {formatTime(
                                                                    slot.EndTime
                                                                )}
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
