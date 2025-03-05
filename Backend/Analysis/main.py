from fastapi import FastAPI, Query
from fastapi.responses import FileResponse, JSONResponse
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
from Map import Create3DMap


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

async def upload_Cordinate_image(star_system:str = Query (...)):
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

async def show_PlanetSys_image():
    
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


    







    


