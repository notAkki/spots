"use client";
import Left from "@/components/Left";
import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Map from "@/components/Map";
import Loading from "@/components/Loading";
import Image from "next/image";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
              const res = await fetch(
                `http://localhost:8080/api/library-study-rooms`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    lat: latitude,
                    lng: longitude,
                  }),
                }
              );

              const data = await res.json();
              setData(data);
            } catch (error) {
              console.error("Failed to fetch data from backend:", error);
            } finally {
              setLoading(false);
            }
          },
          (error) => { // Handle error here
            console.error("Error fetching location here:", error);
            // Only fetch default data if there's an error
            const fetchDefaultData = async () => {
              const res = await fetch(
                `http://localhost:8080/api/library-study-rooms`
              );
              const defaultData = await res.json();
              setData(defaultData);
              setLoading(false);
            };
            fetchDefaultData();
          }
        );
      } else {
        console.error("Geolocation is not supported by this browser.");
        const res = await fetch(
          `http://localhost:8080/api/library-study-rooms`,
          {
            method: "GET",
          }
        );
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
      <div className="basis-2/5 sm:h-full order-last sm:order-first py-4 sm:px-0 sm:py-2 overflow-hidden sm:flex sm:flex-col">
        <div className="w-full h-20 pl-8 pr-4 hidden sm:flex sm:justify-between items-center">
          <Image src={"/logo.png"} width={200} height={200} alt="Logo" />
          <Alert className="h-fit text-pretty w-40">
            <AlertDescription>
              Availability may differ during exam period
            </AlertDescription>
          </Alert>
        </div>
        <ScrollArea className="h-full">
          <div className="w-full h-20 pl-8 pr-4 flex sm:hidden justify-between items-center">
            <Image src={"/logo.png"} width={180} height={200} alt="Logo" />
            <Alert className="h-fit text-pretty w-40">
              <AlertDescription>
                Availability may differ during exam period
              </AlertDescription>
            </Alert>
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
