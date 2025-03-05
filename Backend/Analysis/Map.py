from pathlib import Path
import matplotlib.pyplot as plt
from fastapi import FastAPI
from fastapi.responses import FileResponse, JSONResponse
from Backend.DB.Config import get_db_connection
import numpy as np
from mpl_toolkits.mplot3d import Axes3D

app = FastAPI()

IMAGE_DIR = Path("/home/shyan/Desktop/DbPostgresql/Backend/image/")
IMAGE_DIR.mkdir(parents=True, exist_ok=True)


def ra_dec_to_cartesian(ra, dec):
    x = []
    y = []
    z = []
    
    for i, j in zip(ra, dec):
        ra_rad = np.radians(float(i))  
        dec_rad = np.radians(float(j))  
        
        x.append(np.cos(dec_rad) * np.cos(ra_rad))
        y.append(np.cos(dec_rad) * np.sin(ra_rad))
        z.append(np.sin(dec_rad))
    
    return np.array(x), np.array(y), np.array(z)


async def Create3DMap(star_system: str):
    conn = get_db_connection()
    cur = conn.cursor()

    mis_query = """
    select miscellaneous.misc_name, miscellaneous.misc_category, coordinates.ra_coord, coordinates.dec_coord
    from miscellaneous
    join coordinates on miscellaneous.object_id = coordinates.object_id
    where miscellaneous.origin_system = %s
    """
    
    try:
        cur.execute(mis_query, (star_system,))
        rows_misc = cur.fetchall()
    except Exception as e:
        print("Error while fetching miscellaneous data:", e)
    
    planet_query = """
    select planet.planet_name, coordinates.ra_coord, coordinates.dec_coord
    from planet
    join coordinates on planet.object_id = coordinates.object_id
    where planet.origin_system = %s
    """
    
    try:
        cur.execute(planet_query, (star_system,))
        rows_planet = cur.fetchall()
    except Exception as e:
        print("Error while fetching planet data:", e)
    
    sat_query = """
    select satellite.satellite_name, coordinates.ra_coord, coordinates.dec_coord
    from satellite
    join coordinates on satellite.object_id = coordinates.object_id
    join planet on satellite.parent_planet = planet.object_id
    where planet.origin_system = %s;
    """
    
    try:
        cur.execute(sat_query, (star_system,))
        rows_sat = cur.fetchall()
    except Exception as e:
        print("Error while fetching satellite data:", e)
        
    star_query = """
    select star.star_name, coordinates.ra_coord, coordinates.dec_coord
    from star
    join coordinates on star.object_id = coordinates.object_id
    where star.origin_system = %s
    """
    
    try:
        cur.execute(star_query, (star_system,))
        rows_star = cur.fetchall()
    except Exception as e:
        print("Error while fetching star data:", e)
    
    # Extract RA and DEC for all objects
    ra_star = [i[1] for i in rows_star]
    dec_star = [j[2] for j in rows_star]
    
    ra_misc = [i[2] for i in rows_misc]
    dec_misc = [i[3] for i in rows_misc]
    
    ra_planet = [i[1] for i in rows_planet]
    dec_planet = [j[2] for j in rows_planet]
    
    ra_satellite = [i[1] for i in rows_sat]
    dec_satellite = [j[2] for j in rows_sat]
    
    # Convert RA and DEC to Cartesian coordinates
    x_misc, y_misc, z_misc = ra_dec_to_cartesian(ra_misc, dec_misc)
    x_planet, y_planet, z_planet = ra_dec_to_cartesian(ra_planet, dec_planet)
    x_satellite, y_satellite, z_satellite = ra_dec_to_cartesian(ra_satellite, dec_satellite)
    x_star, y_star, z_star = ra_dec_to_cartesian(ra_star, dec_star)
    
    # Create the 3D plot
    fig = plt.figure(figsize=(10, 10))
    ax = fig.add_subplot(111, projection='3d')
    
    # Plot the points
    ax.scatter(x_misc, y_misc, z_misc, c='r', label='Miscellaneous', marker='o', s=50)
    ax.scatter(x_planet, y_planet, z_planet, c='b', label='Planets', marker='^', s=100)
    ax.scatter(x_satellite, y_satellite, z_satellite, c='g', label='Satellites', marker='s', s=30)
    ax.scatter(x_star, y_star, z_star, c='y', label='Star', marker='*', s=200)  # Plot the star
    
    # Annotate the names
    for i, name in enumerate([i[0] for i in rows_misc]):
        ax.text(x_misc[i], y_misc[i], z_misc[i], name, fontsize=8, color='black')
    
    for i, name in enumerate([i[0] for i in rows_planet]):
        ax.text(x_planet[i], y_planet[i], z_planet[i], name, fontsize=8, color='black')
    
    for i, name in enumerate([i[0] for i in rows_sat]):
        ax.text(x_satellite[i], y_satellite[i], z_satellite[i], name, fontsize=8, color='black')
    
    for i, name in enumerate([i[0] for i in rows_star]):
        ax.text(x_star[i], y_star[i], z_star[i], name, fontsize=8, color='black')  # Annotate the star
    
    # Set labels and title
    ax.set_xlabel('X')
    ax.set_ylabel('Y')
    ax.set_zlabel('Z')
    ax.set_title(f"3D Map of {star_system} Star System")
    
    ax.legend()
    
    # Save the plot to the image directory
    image_path = IMAGE_DIR / "Mapping.png"
    plt.savefig(image_path)
    
    plt.close()
    conn.close()

    return {
        "message": "Image created successfully", 
        "image_path": "http://127.0.0.1:8000/viewmap"  
    }
