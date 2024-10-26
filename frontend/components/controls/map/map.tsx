"use client";
import React from "react";
import { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapData } from "@/lib/types";
import { createMarkerFromMapData } from "@/lib/helpers";

export type MapProps = {
  data: MapData[];
  handleMarkerClick: (building: string) => void;
  userPos: [number, number] | null;
  startingCenterCoords?: [number, number];
  startingZoom?: number;
  startingPitch?: number;
};

export const Map = ({
  data,
  handleMarkerClick,
  userPos,
  startingCenterCoords = [0, 0],
  startingZoom = 100,
  startingPitch = 100,
}: MapProps) => {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const [center, setCenter] = useState<[number, number]>(startingCenterCoords);
  const [zoom, setZoom] = useState<number>(startingZoom);
  const [pitch, setPitch] = useState<number>(startingPitch);
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  const MAPBOX_STYLE_URL = process.env.NEXT_PUBLIC_MAPBOX_STYLE_URL;

  useEffect(() => {
    if (!mapboxToken) {
      throw new Error("Mapbox token is not defined");
    }

    mapboxgl.accessToken = mapboxToken;
    mapRef.current = new mapboxgl.Map({
      style: MAPBOX_STYLE_URL,
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

    data.map((data) => {
      const buildingMarker = createMarkerFromMapData(data, handleMarkerClick);

      if (mapRef.current && data.coords) {
        new mapboxgl.Marker(buildingMarker)
          .setLngLat([data.coords[0], data.coords[1]])
          .addTo(mapRef.current);
      }
    });

    if (userPos) {
      const userMarker = document.createElement("div");
      userMarker.className =
        "h-3 w-3 border-[1.5px] border-zinc-50 rounded-full bg-blue-400 shadow-[0px_0px_4px_2px_rgba(14,165,233,1)]";
      new mapboxgl.Marker(userMarker)
        .setLngLat([userPos[1], userPos[0]])
        .addTo(mapRef.current);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []);

  return (
    <div className="h-[60vh] sm:w-full sm:h-full relative bg-red-500/0 rounded-[20px] p-2 sm:p-0">
      <div id="map-container" ref={mapContainerRef} className="opacity-100" />
      <div className="bg-[#18181b]/90 absolute bottom-10 left-2 sm:bottom-8 sm:left-0 flex flex-col gap-2 m-1 py-2.5 p-2 rounded-[16px]">
        <div className="flex items-center gap-0">
          <div className="h-2 w-2 rounded-full bg-red-400 flex-none"></div>
          <div className="ml-2 rounded-lg px-2 py-1 text-sm w-full bg-red-700/30 text-red-300/90">
            unavailable
          </div>
        </div>
        <div className="flex items-center gap-0">
          <div className="h-2 w-2 rounded-full bg-amber-400 flex-none"></div>
          <div className="ml-2 rounded-lg px-2 py-1 text-sm w-full bg-amber-800/30 text-amber-300/90">
            opening soon
          </div>
        </div>
        <div className="flex items-center gap-0">
          <div className="h-2 w-2 rounded-full bg-green-400 flex-none"></div>
          <div className="ml-2 rounded-lg px-2 py-1 text-sm w-full bg-green-800/30 text-green-300/90">
            open now
          </div>
        </div>
      </div>
    </div>
  );
};
