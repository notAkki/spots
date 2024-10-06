"use client";
import Left from "@/components/Left";
import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Map from "@/components/Map";
import { LayoutListIcon } from "lucide-react";
import Loading from "@/components/Loading";

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

    // useEffect(() => {
    //     const fetchData = async () => {
    //         const res = await fetch("/api/open-classrooms");
    //         const data = await res.json();
    //         setData(data);
    //     };

    //     fetchData();
    // }, []);

    if (loading) {
        return <Loading />;
    }

    return (
        <main className="flex flex-col sm:flex-row sm:gap-4 h-screen">
            <div className="py-4 sm:p-0 h-[40vh] sm:h-screen order-last sm:order-first overflow-hidden">
                {/* <div className="flex justify-between w-full px-8">
                    <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-red-400"></div>
                        <div className="rounded-lg px-2 py-1 text-sm w-[fit-content] bg-red-700/20 text-red-300/80">
                            unavailable
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-amber-400"></div>
                        <div className="rounded-lg px-2 py-1 text-sm w-[fit-content] bg-amber-800/20 text-amber-300/90">
                            opening soon
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-green-400"></div>
                        <div className="rounded-lg px-2 py-1 text-sm w-[fit-content] bg-green-800/20 text-green-300/90">
                            open now
                        </div>
                    </div>
                </div> */}
                <ScrollArea className="h-full basis-2/5 sm:h-[95%] sm:mt-[2.5%]">
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
