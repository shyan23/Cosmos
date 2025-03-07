from pydantic import BaseModel
from typing import Optional


class SatelliteCreate(BaseModel):
    satellite_name: str
    parent_planet: str
    satellite_radii: float
    satellite_mass: float
    orbital_period: float
    atmosphere: str


class SatelliteUpdate(BaseModel):
    satellite_name: Optional[str] = None
    parent_planet: Optional[str] = None
    satellite_radii: Optional[float] = None
    satellite_mass: Optional[float] = None
    orbital_period: Optional[float] = None
    atmosphere: Optional[str] = None
