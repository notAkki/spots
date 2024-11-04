"use client";
import Left from "@/components/Left";
import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Map from "@/components/Map";
import Loading from "@/components/Loading";
import Image from "next/image";

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface dataFormat {
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
    distance: number;
}

export default function Home() {
    const [data, setData] = useState<dataFormat[]>([]);
    const [activeBuilding, setActiveBuilding] = useState<string | null>(null);
    const [userPos, setUserPos] = useState<[number, number] | null>(null);
    const [loading, setLoading] = useState(true);

    const handleMarkerClick = (building: string) => {
        setActiveBuilding(building);
    };

    useEffect(() => {
        const fetchLocationAndData = async () => {
            setLoading(true);

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const { latitude, longitude } = position.coords;
                        setUserPos([latitude, longitude]);
                        // console.log("User location (Frontend):", {
                        //     lat: latitude,
                        //     lng: longitude,
                        // });

                        try {
                            // Send the user's location to the backend
                            const res = await fetch("/api/open-classrooms", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                    lat: latitude,
                                    lng: longitude,
                                }),
                            });

                            const data = await res.json();
                            setData(data);
                        } catch (error) {
                            console.error(
                                "Failed to fetch data from backend:",
                                error
                            );
                        } finally {
                            setLoading(false);
                        }
                    },
                    async (error) => {
                        console.error("Error fetching location here:", error);

                        // Fallback to fetching unsorted data
                        const res = await fetch("/api/open-classrooms");
                        const defaultData = await res.json();
                        setData(defaultData);

                        // console.log("Default data (no location):", defaultData);
                        setData(defaultData);
                        setLoading(false);
                    }
                );
            } else {
                console.error("Geolocation is not supported by this browser.");
                const res = await fetch("/api/open-classrooms", {
                    method: "GET",
                });
                const defaultData = await res.json();
                setData(defaultData);
                setLoading(false);
            }
        };

        fetchLocationAndData();
    }, []);

    if (loading) {
        return <Loading />;
    }

    return (
        <main className="flex flex-col sm:flex-row sm:gap-4 h-screen">
            <div className="basis-2/5 sm:h-full order-last sm:order-first py-4 sm:px-0 sm:py-2 overflow-hidden sm:flex sm:flex-col">
                <div className="w-full h-20 pl-8 pr-4 hidden sm:flex sm:justify-between items-center">
                    <Image
                        src={"/logo.png"}
                        width={200}
                        height={200}
                        alt="Logo"
                    />
                    <Popover>
                        <PopoverTrigger className="">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                width={28}
                                height={28}
                                fill={"none"}
                            >
                                <path
                                    d="M22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12Z"
                                    stroke="currentColor"
                                    strokeWidth="1.7"
                                />
                                <path
                                    d="M12.2422 17V12C12.2422 11.5286 12.2422 11.2929 12.0957 11.1464C11.9493 11 11.7136 11 11.2422 11"
                                    stroke="currentColor"
                                    strokeWidth="1.7"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                                <path
                                    d="M11.992 8H12.001"
                                    stroke="currentColor"
                                    strokeWidth="2.2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </PopoverTrigger>
                        <PopoverContent className="bg-zinc-900 border-zinc-600 text-zinc-200 w-72">
                            <div className="font-bold mb-1">
                                Important Notes:
                            </div>
                            <ul className="list-disc pl-4">
                                <li>
                                    Building/room access may be restricted to
                                    specific colleges or departments
                                </li>
                                <li>
                                    Displayed availability only reflects
                                    official class schedules
                                </li>
                                <li>
                                    Rooms may be occupied by unofficial meetings
                                    or study groups
                                </li>
                                <li>
                                    Click on indicators to view room schedules
                                    for that building
                                </li>
                            </ul>
                            {/* <div className="text-sm mt-2 pl-4">
                                Built by{" "}
                                <a href="https://www.aksharbarot.com/">
                                    Akshar Barot
                                </a>
                            </div> */}
                        </PopoverContent>
                    </Popover>
                </div>
                <ScrollArea className="h-full">
                    <div className="w-full h-20 pl-8 pr-8 flex sm:hidden justify-between items-center">
                        <Image
                            src={"/logo.png"}
                            width={180}
                            height={200}
                            alt="Logo"
                        />
                        <Popover>
                            <PopoverTrigger className="">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    width={28}
                                    height={28}
                                    fill={"none"}
                                >
                                    <path
                                        d="M22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12Z"
                                        stroke="currentColor"
                                        strokeWidth="1.7"
                                    />
                                    <path
                                        d="M12.2422 17V12C12.2422 11.5286 12.2422 11.2929 12.0957 11.1464C11.9493 11 11.7136 11 11.2422 11"
                                        stroke="currentColor"
                                        strokeWidth="1.7"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <path
                                        d="M11.992 8H12.001"
                                        stroke="currentColor"
                                        strokeWidth="2.2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </PopoverTrigger>
                            <PopoverContent className="bg-zinc-900 border-zinc-600 text-zinc-200 w-72">
                                <div className="font-bold mb-1">
                                    Important Notes:
                                </div>
                                <ul className="list-disc pl-4">
                                    <li>
                                        Building/room access may be restricted
                                        to specific colleges or departments
                                    </li>
                                    <li>
                                        Displayed availability only reflects
                                        official class schedules
                                    </li>
                                    <li>
                                        Rooms may be occupied by unofficial
                                        meetings or study groups
                                    </li>
                                    <li>
                                        Click on indicators to view room
                                        schedules for that building
                                    </li>
                                </ul>
                                {/* <div className="text-sm mt-2 pl-4">
                                Built by{" "}
                                <a href="https://www.aksharbarot.com/">
                                    Akshar Barot
                                </a>
                            </div> */}
                            </PopoverContent>
                        </Popover>
                    </div>
                    <Left
                        data={data}
                        activeBuilding={activeBuilding}
                        setActiveBuilding={setActiveBuilding}
                    />
                </ScrollArea>
            </div>
            <div className="h-[60vh] basis-3/5 sm:h-screen">
                <Map
                    data={data}
                    handleMarkerClick={handleMarkerClick}
                    userPos={userPos}
                />
            </div>
        </main>
    );
}
