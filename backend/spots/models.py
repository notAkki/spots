# PDM
from pydantic import BaseModel
from typing import Optional


class Element(BaseModel):
    name: str
    xpath: str
    url: str | None = None
    return_html: bool = False


class RoomSlot(BaseModel):
    StartTime: str
    EndTime: str
    Status: str


class Room(BaseModel):
    roomNumber: str
    slots: list[RoomSlot]


class DataFormat(BaseModel):
    building: str
    building_code: str
    building_status: str
    rooms: list[Room]
    coords: tuple[float, float]
    distance: float


class RoomDataMap(BaseModel):
    building: str
    building_code: Optional[str]
    building_status: str
    coords: tuple[float, float]

class LocationData(RoomDataMap):
    opening_time: str
    closing_time: str
    
    

