from pydantic import BaseModel, condecimal
from typing import Optional

class PlanetCreate(BaseModel):
    planet_name: str
    origin_system: str
    planetary_radii: float
    planetary_mass: float
    orbital_period: float
    atmosphere: str  

class PlanetUpdate(BaseModel):
    origin_system: Optional[str] = None
    planetary_radii: Optional[float] = None
    planetary_mass: Optional[float] = None
    orbital_period: Optional[float] = None
    atmosphere: Optional[str] = None  
