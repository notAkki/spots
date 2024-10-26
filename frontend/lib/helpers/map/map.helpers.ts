import { MapData } from "@/lib/types";

export const STATUS_TO_COLOR = {
  available:
    "h-2 w-2 rounded-full bg-green-400 shadow-[0px_0px_4px_2px_rgba(34,197,94,0.7)]",
  unavailable:
    "h-2 w-2 rounded-full bg-red-400 shadow-[0px_0px_4px_2px_rgba(239,68,68,0.9)]",
  upcoming:
    "h-2 w-2 rounded-full bg-amber-400 shadow-[0px_0px_4px_2px_rgba(245,158,11,0.9)]",
};

export const DRAWER_STATUS_TO_COLOR = {
  available: "bg-green-800/20 text-green-300/90",
  unavailable: "bg-red-700/20 text-red-300/80",
  upcoming: "bg-amber-800/20 text-amber-300/90",
};

export const INDICATOR_STATUS_TO_COLOR = {
  available: "bg-green-400",
  unavailable: "bg-red-400",
  upcoming: "bg-amber-400",
};

export const createMarkerFromMapData = (
  data: MapData,
  handleMarkerClick: (building: string) => void
) => {
  const el = document.createElement("div");
  el.className =
    STATUS_TO_COLOR[data.building_status as keyof typeof STATUS_TO_COLOR];

  el.addEventListener("click", () => {
    const accordionItem = document.getElementById(data.building_code);

    setTimeout(() => {
      if (accordionItem) {
        accordionItem.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 300);

    handleMarkerClick(data.building_code);
  });

  return el;
};
