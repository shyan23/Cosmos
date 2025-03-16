from http.client import HTTPException
from typing import Optional
from urllib.request import Request
from fastapi import HTTPException
from models.starmodel import StarCreate, StarUpdate
from fastapi import FastAPI, Query
from fastapi.responses import FileResponse, JSONResponse
from models.satellitemodel import SatelliteCreate, SatelliteUpdate
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
from pathlib import Path
from stellerDist import analyze_stellar_dist
from planetsys import analyze_planetary_systems
from Backend.DB.Config import get_db_connection
from fastapi.middleware.cors import CORSMiddleware
from Tels_disc_no_vs_year import Telescope_image
from Coordinate_plot import Coordinateshow
from search_system import general_search, specified_search
from Map import Create3DMap
from CRUD.CRUD_star import create_star, update_star, delete_star,get_star
from pydantic import BaseModel
from models.planetmodel import PlanetCreate,PlanetUpdate
from CRUD.CRUD_Planet import create_planet_function,update_planet,delete_planet_function
from CRUD.CRUD_satellite import create_satellite_function,update_satellite_function,delete_satellite_function
from fastapi import Request
app = FastAPI()

origins = [
    "http://127.0.0.1:5500",  
    "http://localhost:5500",
    "http://localhost:3000"  # Add Next.js development server
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]  # Optional: Expose headers if needed
)

IMAGE_DIR = Path("/home/shyan/Desktop/DbPostgresql/Backend/image/")
IMAGE_DIR.mkdir(parents=True, exist_ok=True)

@app.post("/api/generalSearch")
async def api_general_search(request: Request):
    return await general_search(request)

@app.post("/api/specifiedSearch")
async def api_specified_search(request: Request):
    return await specified_search(request)


@app.post("/upload-image/")
async def upload_image():
    return await Telescope_image()

@app.get("/view-image")
async def view_image():
    file_path = IMAGE_DIR / "Telescope_discovery_vs_year_seaborn.png"
    if file_path.exists():
        return FileResponse(file_path)
    return JSONResponse(status_code=404, content={"error": "Image not found"})

@app.post("/upload-image-Coordinate_plot")
async def upload_Cordinate_image(star_system: str = Query(...)):
    return await Coordinateshow(star_system)

@app.get('/view-image-Coordinate')
async def show_Coordinate_image():
    file_path = IMAGE_DIR / "Coordinate_plot.png"
    if file_path.exists():
        return FileResponse(file_path)
    return JSONResponse(status_code=404, content={"error": "Image not found"})

@app.post("/upload-image-Planetsys")
async def upload_PlanetSys_image():
    return await analyze_planetary_systems()

@app.get("/show-image-Planetsys")
async def show_PlanetSys_image():
    file_path = IMAGE_DIR / "plntsys.png"
    if file_path.exists():
        return FileResponse(file_path)
    return JSONResponse(status_code=404, content={"error": "Image not found"})

@app.post("/upload-image-stellerDist")
async def upload_Steller_image():
    return await analyze_stellar_dist()

@app.get("/show-image-stellerDist")
async def show_Steller_image():
    file_path = IMAGE_DIR / "StellerDist.png"
    if file_path.exists():
        return FileResponse(file_path)
    return JSONResponse(status_code=404, content={"error": "Image not found"})

@app.get("/star-systems/")
async def get_star_systems():
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT DISTINCT system_name FROM star_system")
                result = cur.fetchall()
        star_systems = [row[0] for row in result]
        return {"star_systems": star_systems}
    except Exception as e:
        return {"error": f"Failed to fetch star systems: {e}"}

@app.post("/MAP/")
async def postmap(ss: str):
    return await Create3DMap(ss)

@app.get("/viewmap")
async def getmap():
    file_path = IMAGE_DIR / "Mapping.png"
    if file_path.exists():
        return FileResponse(file_path)
    return JSONResponse(status_code=404, content={"error": "Image not found"})


# CUD Endpoints for Star

# cursor = get_db_connection().cursor()
@app.get("/stars/{star_name}")
async def get_star(star_name: str):
    cursor = get_db_connection().cursor()
    cursor.execute("SELECT * FROM star WHERE star_name = %s", (star_name,))
    star = cursor.fetchone()
    if star:
        columns = [desc[0] for desc in cursor.description]
        return dict(zip(columns, star))
    raise HTTPException(status_code=404, detail="Star not found")
    

@app.post("/create-star/")
async def create_star_endpoint(star: StarCreate):
    try:
        new_star = create_star(
            star.star_name,
            star.origin_system,
            star.luminosity,
            star.solar_radii,
            star.solar_mass,
            star.stellar_class
        )
        return {"message": "Star created successfully", "star": new_star}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.put("/update-star/{star_name}")
async def update_star_endpoint(star_name: str, star: StarUpdate):
    try:
        updated_star = update_star(
            star_name=star_name,  # Use path parameter here
            new_star_name=star.new_star_name,
            origin_system=star.origin_system,
            luminosity=star.luminosity,
            solar_radii=star.solar_radii,
            solar_mass=star.solar_mass,
            stellar_class=star.stellar_class
        )
        if "error" in updated_star:
            raise HTTPException(status_code=404, detail=updated_star["error"])
        return {"message": "Star updated successfully", "star": updated_star}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

@app.delete("/delete-star/{star_name}")
async def delete_star_endpoint(star_name: str):
    try:
        result = delete_star(star_name)
        if "error" in result:
            return {"error": result["error"]}
        return {"message": result["message"]}
    except Exception as e:
        return {"error": str(e)}


@app.get("/planets/{planet_name}")
async def getplanet(planet_name:str):
    cursor = get_db_connection().cursor()
    cursor.execute("SELECT * FROM planet WHERE lower(trim(planet_name)) = %s", (planet_name,))
    planet = cursor.fetchone()
    if planet:
        columns = [desc[0] for desc in cursor.description]
        return dict(zip(columns, planet))
    raise HTTPException(status_code=404, detail="Planet not found")
    

# Create Planet Endpoint
@app.post("/planets/")
def create_planet(planet: PlanetCreate):
    try:
        new_planet = create_planet_function(planet)
        return {"message": "Planet created successfully", "planet": new_planet}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Update Planet Endpoint
@app.put("/planets/{planet_name}")
def update_planet_details(planet_name: str, planet_data: PlanetUpdate):
    updated_planet = update_planet(
        planet_name,
        planet_data.origin_system,
        planet_data.planetary_radii,
        planet_data.planetary_mass,
        planet_data.orbital_period,
        planet_data.atmosphere,
    )
    if "error" in updated_planet:
        raise HTTPException(status_code=404, detail=updated_planet["error"])
    return {"message": "Planet updated successfully", "planet": updated_planet}

# Delete Planet Endpoint
@app.delete("/planets/{planet_name}")
def delete_planet(planet_name: str):
    result = delete_planet_function(planet_name)
    if result is None:
        raise HTTPException(status_code=404, detail=f"Planet '{planet_name}' not found")
    return result

# Satellite

@app.post("/satellite/")
def create_satellite(satellite: SatelliteCreate):
    result = create_satellite_function(satellite)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return {"message": "Satellite created successfully", "satellite": result}


@app.put("/satellite/{satellite_name}", response_model=dict)
def update_satellite(
    satellite_name: str,
    satellite_update: SatelliteUpdate,  # Request body
):
    result = update_satellite_function(
        satellite_name,
        parent_planet=satellite_update.parent_planet,
        satellite_radii=satellite_update.satellite_radii,
        satellite_mass=satellite_update.satellite_mass,
        orbital_period=satellite_update.orbital_period,
        atmosphere=satellite_update.atmosphere
    )
    if result is None:
        raise HTTPException(status_code=404, detail=f"Satellite '{satellite_name}' not found")
    return {"message": "Satellite updated successfully", "satellite": result}


@app.delete("/satellite/{satellite_name}", response_model=dict)
def delete_satellite(satellite_name: str):
    result = delete_satellite_function(satellite_name)
    if result is None:
        raise HTTPException(status_code=404, detail=f"Satellite '{satellite_name}' not found")
    return result

@app.get("/parent-planet")
async def get_parent_planet():
    
    cursor = get_db_connection().cursor()
    cursor.execute("""
            SELECT DISTINCT planet.planet_name 
            FROM planet 
            JOIN satellite ON planet.object_id = satellite.parent_planet
        """)

    planets = cursor.fetchall()  # Fetch all rows
        
    if planets:
        return {"planet_names": [row[0] for row in planets]}  # Return as a list

    raise HTTPException(status_code=404, detail="No planets found")


@app.get("/satellites/{satellite_name}")

async def getSatellite(satellite_name:str):
    cursor = get_db_connection().cursor()
    cursor.execute("SELECT * FROM satellite WHERE lower(trim(satellite_name)) = %s", (satellite_name,))
    satellite = cursor.fetchone()
    if satellite:
        columns = [desc[0] for desc in cursor.description]
        return dict(zip(columns, satellite))
    raise HTTPException(status_code=404, detail="satellite not found")

        

    