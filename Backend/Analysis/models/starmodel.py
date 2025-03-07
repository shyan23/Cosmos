from typing import Optional
from pydantic import BaseModel

class StarCreate(BaseModel):
    star_name: str
    origin_system: str
    luminosity: float
    solar_radii: float
    solar_mass: float
    stellar_class: str

class StarUpdate(BaseModel):
    star_name: str | None = None  # Changed to optional
    new_star_name: str | None = None
    origin_system: str | None = None
    luminosity: float | None = None
    solar_radii: float | None = None
    solar_mass: float | None = None
    stellar_class: str | None = None