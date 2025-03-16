from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
import psycopg2
from Backend.DB.Config import get_db_connection  # Ensure this returns a psycopg2 connection

app = FastAPI()

origins = [
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "http://localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

@app.post("/api/generalSearch")
async def general_search(request: Request):
    # Read the incoming JSON body
    data = await request.json()
    keyword = data.get("keyword", "")
    if not keyword:
        raise HTTPException(status_code=400, detail="Keyword is required")
    
    connection = get_db_connection()
    try:
        cursor = connection.cursor()
        # Using %s placeholders for psycopg2. Note that for UNION queries you must supply a parameter for each use.
        query = """
            SELECT star.star_name, star.origin_system, UPPER(object.object_type), discovery.telescope_id, discovery.discovery_year 
            FROM star
            JOIN object ON star.object_id = object.object_id
            LEFT JOIN discovery ON star.object_id = discovery.object_id 
            WHERE star.star_name LIKE %s
            UNION
            SELECT planet.planet_name, planet.origin_system, UPPER(object.object_type), discovery.telescope_id, discovery.discovery_year  
            FROM planet
            JOIN object ON planet.object_id = object.object_id
            LEFT JOIN discovery ON planet.object_id = discovery.object_id 
            WHERE planet.planet_name LIKE %s
            UNION
            SELECT miscellaneous.misc_name, miscellaneous.origin_system, UPPER(object.object_type), discovery.telescope_id, discovery.discovery_year  
            FROM miscellaneous
            JOIN object ON miscellaneous.object_id = object.object_id
            LEFT JOIN discovery ON miscellaneous.object_id = discovery.object_id 
            WHERE miscellaneous.misc_name LIKE %s
        """
        param = (keyword + "%", keyword + "%", keyword + "%")
        cursor.execute(query, param)
        result = cursor.fetchall()
        # Build a list of dictionaries from the result set.
        output = []
        for row in result:
            output.append({
                "obj_name": row[0],
                "obj_type": row[1],
                "obj_loc": row[2],
                "telescope": row[3],
                "discovery": row[4],
            })
        return output
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error during general search: " + str(e))
    finally:
        cursor.close()
        connection.close()

@app.post("/api/specifiedSearch")
async def specified_search(request: Request):
    data = await request.json()
    keyword = data.get("keyword", "")
    filter_word = data.get("filter", "")
    if not keyword or not filter_word:
        raise HTTPException(status_code=400, detail="Keyword and filter are required")
    
    connection = get_db_connection()
    try:
        if filter_word == "star":
            return search_star(keyword, connection)
        elif filter_word == "planet":
            return search_planet(keyword, connection)
        elif filter_word == "misc":
            return search_misc(keyword, connection)
        else:
            raise HTTPException(status_code=400, detail="Invalid filter specified")
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error during specified search: " + str(e))
    finally:
        connection.close()

def search_star(keyword: str, connection):
    cursor = connection.cursor()
    try:
        query = """
            select star_name, stellar_class, solar_radii, solar_mass, system_type, distance
            from star
            join star_system on star.origin_system = star_system.system_name
            where star_name like %s
        """
        cursor.execute(query, (keyword + "%",))
        result = cursor.fetchall()
        output = []
        for row in result:
            output.append({
                "star_name": row[0],
                "stellar_class": row[1],
                "solar_radii": row[2],
                "solar_mass": row[3],
                "star_type": row[4],
                "distance": row[5],
            })
        return output
    finally:
        cursor.close()

def search_planet(keyword: str, connection):
    cursor = connection.cursor()
    try:
        query = """
            select planet_name, origin_system, planetary_radii, planetary_mass, orbital_period, atmosphere
            from planet
            where planet_name like %s
        """
        cursor.execute(query, (keyword + "%",))
        result = cursor.fetchall()
        output = []
        for row in result:
            output.append({
                "planet_name": row[0],
                "parent_system": row[1],
                "planet_radius": row[2],
                "planet_mass": row[3],
                "orbit": row[4],
                "atmosphere": row[5],
            })
        return output
    finally:
        cursor.close()

def search_misc(keyword: str, connection):
    cursor = connection.cursor()
    try:
        query = """
            select misc_name, origin_system, 
                   REPLACE(UPPER(SUBSTR(misc_category, 1, 1)) || LOWER(SUBSTR(REPLACE(misc_category, '_', ' '), 2)), ' ', ''),
                   distance
            from miscellaneous
            join star_system on miscellaneous.origin_system = star_system.system_name
            where misc_name like %s
            UNION
            select satellite_name, planet.origin_system, 'Satellite', star_system.system_age
            from satellite
            join planet on satellite.parent_planet = planet.object_id
            join star_system on planet.origin_system = star_system.system_name
            where satellite_name like %s
        """
        # Provide the keyword for both parts of the UNION.
        cursor.execute(query, (keyword + "%", keyword + "%"))
        result = cursor.fetchall()
        output = []
        for row in result:
            output.append({
                "misc_name": row[0],
                "parent_system": row[1],
                "misc_category": row[2],
                "distance": row[3],
            })
        return output
    finally:
        cursor.close()
