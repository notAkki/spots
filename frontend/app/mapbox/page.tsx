"use client";
import React from "react";
import { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import Classrooms from "@/components/classrooms";
import { ScrollArea } from "@/components/ui/scroll-area";

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
}

export default function page() {
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement | null>(null);

    const [center, setCenter] = useState<[number, number]>([-80.5425, 43.4695]);
    const [zoom, setZoom] = useState(16.25);
    const [pitch, setPitch] = useState(52);

    const [classrooms, setClassrooms] = useState<dataFormat[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const res = await fetch("/api/open-classrooms");
            const data = await res.json();
            console.log("Checking if data is pulled:");
            console.log(data);

            setClassrooms(data);
        };

        fetchData();
    }, []);

    const getColorByStatus = (status: string) => {
        switch (status) {
            case "available":
                return "h-2 w-2 rounded-full bg-green-400 shadow-[0px_0px_4px_2px_rgba(34,197,94,0.7)]";
            case "unavailable":
                return "h-2 w-2 rounded-full bg-red-400 shadow-[0px_0px_4px_2px_rgba(239,68,68,0.9)]";
            case "upcoming":
                return "h-2 w-2 rounded-full bg-amber-400 shadow-[0px_0px_4px_2px_rgba(245,158,11,0.9)]";
            default:
                return "gray";
        }
    };

    useEffect(() => {
        mapboxgl.accessToken =
            "pk.eyJ1Ijoibm90YWtraSIsImEiOiJjbTFtejY5MXAwcml1MmxvZGowZHF4eXltIn0.xfh20iSQcvt7lOhxDnliyg";
        ("pk.eyJ1Ijoibm90YWtraSIsImEiOiJjbTFtejY5MXAwcml1MmxvZGowZHF4eXltIn0.xfh20iSQcvt7lOhxDnliyg");
        mapRef.current = new mapboxgl.Map({
            style: "mapbox://styles/notakki/cm1o3v5kr00bl01pd2k7tho6i",
            container: mapContainerRef.current as HTMLElement,
            center: center,
            zoom: zoom,
            pitch: pitch,
        });

        mapRef.current.on("move", () => {
            if (mapRef.current) {
                const mapCenter = mapRef.current.getCenter();
                const mapZoom = mapRef.current.getZoom();
                const mapPitch = mapRef.current.getPitch();

                setCenter([mapCenter.lng, mapCenter.lat]);
                setZoom(mapZoom);
                setPitch(mapPitch);
            }
        });

        console.log("Checking if data is pulled in the other ref:");
        console.log(classrooms);

        classrooms.map((classroom) => {
            const el = document.createElement("div");
            el.className = getColorByStatus(classroom.building_status);

            el.addEventListener("click", () => {
                const accordionItem = document.getElementById(
                    classroom.building_code
                );

                console.log("clicked on building", classroom.building_code);

                if (accordionItem) {
                    accordionItem.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                    });

                    // setValue(classroom.building_code);
                }
            });

            if (mapRef.current && classroom.coords) {
                new mapboxgl.Marker(el)
                    .setLngLat([classroom.coords[0], classroom.coords[1]])
                    .addTo(mapRef.current);
            }
        });

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
            }
        };
    }, [classrooms]);

    return (
        <div className="flex gap-4">
            <ScrollArea className="basis-2/5 h-screen">
                <Classrooms />
            </ScrollArea>
            <div className="basis-3/5 h-screen">
                <div id="map-container" ref={mapContainerRef} />

                {/* <div className="sidebar">
                Longitude: {center[0].toFixed(4)} | Latitude:{" "}
                {center[1].toFixed(4)} | Zoom: {zoom.toFixed(2)} | Rotation:{" "}
                {pitch.toFixed(2)}
                </div> */}
            </div>
        </div>
    );
}
