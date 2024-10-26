"use client";
import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { Map as MapComponent } from "@/components/controls/map/map";
import { Loading } from "@/components/ui";
import { BuildingDrawer } from "@/components/controls";
import { type MapData } from "@/lib";
import { mapDataService } from "@/lib/services";

export default function OpenSpots() {
  const [data, setData] = useState<MapData[]>([]);
  const [activeBuilding, setActiveBuilding] = useState<string | null>(null);
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(true);
  const startingCenterCoords = process.env.NEXT_PUBLIC_STARTING_CENTER_COORDS
    ? (process.env.NEXT_PUBLIC_STARTING_CENTER_COORDS.split(",").map(
        Number
      ) as [number, number])
    : undefined;
  const startingZoom = process.env.NEXT_PUBLIC_STARTING_ZOOM
    ? Number(process.env.NEXT_PUBLIC_STARTING_ZOOM)
    : undefined;
  const startingPitch = process.env.NEXT_PUBLIC_STARTING_PITCH
    ? Number(process.env.NEXT_PUBLIC_STARTING_PITCH)
    : undefined;

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

            const data = await mapDataService.sendUserLocation(
              latitude,
              longitude
            );
            setData(data);
            setLoading(false);
          },
          async (error) => {
            console.error("Error fetching location here:", error);
            const defaultData = await mapDataService.sendDefaultLocationData();
            setData(defaultData);
            setLoading(false);
          }
        );
      } else {
        console.error("Geolocation is not supported by this browser.");
        const defaultData = await mapDataService.sendDefaultLocationData();
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
          <Image src={"/logo.png"} width={200} height={200} alt="Logo" />
        </div>
        <ScrollArea id="scroll-area" className="h-full">
          <div className="flex flex-col justify-between h-full">
            <div id="building-drawer-container">
              <div className="w-full h-20 pl-8 pr-4 flex sm:hidden justify-between items-center">
                <Image src={"/logo.png"} width={180} height={200} alt="Logo" />
              </div>
              <BuildingDrawer
                data={data}
                activeBuilding={activeBuilding}
                setActiveBuilding={setActiveBuilding}
              />
            </div>
          </div>
        </ScrollArea>
        <div className="github-link align-middle text-center flex justify-center items-center gap-2 text-gray-400">
          <Image
            src={"/images/github.png"}
            width={20}
            height={20}
            alt="Github"
          />
          <a href="https://github.com/jaypyles/spots">Github</a>
        </div>
      </div>
      <div className="h-[60vh] basis-3/5 sm:h-screen">
        <MapComponent
          data={data}
          handleMarkerClick={handleMarkerClick}
          userPos={userPos}
          startingCenterCoords={startingCenterCoords}
          startingZoom={startingZoom}
          startingPitch={startingPitch}
        />
      </div>
    </main>
  );
}
