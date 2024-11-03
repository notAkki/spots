"use client";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

import { Alert, AlertDescription } from "@/components/ui/alert";

interface DataFormat {
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
    const time = new Date(`1970-01-01T${timeString}`);
    return new Intl.DateTimeFormat("en-US", options).format(time);
}

function statusLabel(status: string) {
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
        <div
            className={`h-2 w-2 rounded-full 
                    ${status === "unavailable" && "bg-red-400"}
                    ${status === "available" && "bg-green-400"}
                    ${status === "upcoming" && "bg-amber-400"}
                        `}
        ></div>
    );
}

const date = new Date();
const day = date.getDay();

export default function Left({
    data,
    activeBuilding,
    setActiveBuilding,
}: {
    data: DataFormat[];
    activeBuilding: string | null;
    setActiveBuilding: (building: string) => void;
}) {
    if (data.length === 0 || !data) {
        return (
            <div className="px-8 my-2">
                <Alert className="mx-auto w-fit text-center">
                    <AlertDescription>
                        Data not available after 10:00 PM
                    </AlertDescription>
                </Alert>
            </div>
        );
    }
    return (
        <div className="px-8">
            {day == 0 || day == 6 ? (
                <div className="my-2">
                    <Alert className="mx-auto w-fit text-center">
                        <AlertDescription>
                            Data on weekends represents data for the coming
                            Monday
                        </AlertDescription>
                    </Alert>
                </div>
            ) : null}
            <Accordion
                type="single"
                collapsible
                className="w-full"
                value={activeBuilding || ""}
                onValueChange={(val) => setActiveBuilding(val)}
            >
                {data.map((building) => (
                    <AccordionItem
                        id={building.building_code}
                        value={building.building_code}
                        key={building.building_code}
                        className=""
                    >
                        <AccordionTrigger>
                            <div className="flex justify-between w-[95%] text-left text-lg group items-center">
                                <div className="group-hover:underline underline-offset-8 pr-2">
                                    {building.building_code} -{" "}
                                    {building.building}
                                </div>
                                <div className="">
                                    {statusLabel(building.building_status)}
                                </div>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="divide-y divide-dashed divide-zinc-600">
                            {building.rooms &&
                                Object.entries(building.rooms).map(
                                    ([roomNumber, room]) => {
                                        return (
                                            <div
                                                key={roomNumber}
                                                className="flex justify-between py-4 text-lg font-[family-name:var(--font-geist-mono)] text-[16px]"
                                            >
                                                <div className="flex gap-4 items-center h-[fit-content]">
                                                    <div className="w-18">
                                                        {building.building_code}{" "}
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
