# PDM
import pydantic
from typing import Any
from lxml.etree import _Element


class HtmlElement(_Element): ...


class Element(pydantic.BaseModel):
    name: str
    xpath: str
    url: str | None = None
    return_html: bool = False


class CapturedElement(pydantic.BaseModel):
    xpath: str
    text: str
    name: str
    html: pydantic.SkipValidation[list[HtmlElement] | None] = None

    class Config:
        arbitrary_types_allowed = True  # Allow arbitrary types
