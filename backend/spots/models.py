# PDM
import pydantic
from typing import Any


class Element(pydantic.BaseModel):
    name: str
    xpath: str
    url: str | None = None
    return_html: bool = False


class CapturedElement(pydantic.BaseModel):
    xpath: str
    text: str
    name: str
    html: Any | None = None
