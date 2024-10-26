"use client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  DRAWER_STATUS_TO_COLOR,
  formatTime,
  INDICATOR_STATUS_TO_COLOR,
  type MapData,
} from "@/lib";

export const statusLabel = (status: string) => {
  const color =
    DRAWER_STATUS_TO_COLOR[status as keyof typeof DRAWER_STATUS_TO_COLOR];
  return (
    <div className={`rounded-lg px-2 py-1 text-sm w-[fit-content] ${color}`}>
      {status}
    </div>
  );
};

function statusIndicator(status: string) {
  const color =
    INDICATOR_STATUS_TO_COLOR[status as keyof typeof INDICATOR_STATUS_TO_COLOR];
  return <div className={`h-2 w-2 rounded-full ${color}`}></div>;
}

export type BuildingDrawerProps = {
  data: MapData[];
  activeBuilding: string | null;
  setActiveBuilding: (building: string) => void;
};

export const BuildingDrawer = ({
  data,
  activeBuilding,
  setActiveBuilding,
}: BuildingDrawerProps) => {
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
};