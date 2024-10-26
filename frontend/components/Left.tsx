"use client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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

  console.log(timeString);

  // Create a date object from the time string
  const time = new Date(`1970-01-01T${timeString}`);

  // Check if the date is valid
  if (isNaN(time.getTime())) {
    console.error("Invalid time string:", timeString);
    return "Invalid time"; // Return a default value or handle the error as needed
  }

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

export default function Left({
  data,
  activeBuilding,
  setActiveBuilding,
}: {
  data: DataFormat[];
  activeBuilding: string | null;
  setActiveBuilding: (building: string) => void;
}) {
  return (
    <div className="px-8">
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
                  {building.building_code} - {building.building}
                </div>
                <div className="">{statusLabel(building.building_status)}</div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="divide-y divide-dashed divide-zinc-600">
              {building.rooms &&
                Object.entries(building.rooms).map(([roomNumber, room]) => {
                  console.log("Room object:", room); // Log the room object
                  return (
                    <div
                      key={roomNumber}
                      className="flex justify-between py-4 text-lg font-[family-name:var(--font-geist-mono)] text-[16px]"
                    >
                      <div className="flex gap-4 items-center h-[fit-content]">
                        <div className="w-18">
                          {building.building_code} {room.roomNumber}
                        </div>
                        <div className="relative">
                          {room.slots && room.slots.length > 0 ? (
                            statusIndicator(room.slots[0].Status)
                          ) : (
                            <div className="text-gray-500">
                              No slots available
                            </div>
                          )}
                        </div>
                      </div>
                      <ul className="text-right">
                        {room.slots && room.slots.length > 0 ? (
                          room.slots.map((slot, index) => (
                            <li key={index}>
                              {formatTime(slot.StartTime)} -{" "}
                              {formatTime(slot.EndTime)}
                            </li>
                          ))
                        ) : (
                          <li>No slots available</li>
                        )}
                      </ul>
                    </div>
                  );
                })}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
