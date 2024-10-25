# PDM
from pydantic import BaseModel, SkipValidation
from lxml.etree import _Element


class HtmlElement(_Element): ...


class Element(BaseModel):
    name: str
    xpath: str
    url: str | None = None
    return_html: bool = False


class CapturedElement(BaseModel):
    xpath: str
    text: str
    name: str
    html: SkipValidation[list[HtmlElement] | None] = None

    class Config:
        arbitrary_types_allowed = True  # Allow arbitrary types


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
    rooms: dict[str, Room]
    coords: tuple[float, float]
    distance: float
