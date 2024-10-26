export type MapData = {
  building: string;
  building_code: string;
  building_status: string;
  rooms: Record<string, Room>;
  coords: [number, number];
  distance: number;
  distance_unit: string;
};

export type Slot = {
  StartTime: string;
  EndTime: string;
  Status: string;
};

export type Room = {
  roomNumber: string;
  slots: Slot[];
};
