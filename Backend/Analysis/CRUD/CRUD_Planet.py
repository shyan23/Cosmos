

from Backend.DB.Config import get_db_connection
conn = get_db_connection()
from pydantic import BaseModel
from models.planetmodel import PlanetCreate,PlanetUpdate


conn = get_db_connection()



def create_planet_function(planet: PlanetCreate ):
    try:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO object (object_type) VALUES ('PLAN') RETURNING object_id"
        )
        object_id = cursor.fetchone()[0]
        
        cursor.execute("""
            INSERT INTO planet (object_id, planet_name, origin_system, planetary_radii,
                              planetary_mass, orbital_period, atmosphere)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING *
        """, (object_id, planet.planet_name, planet.origin_system, planet.planetary_radii,
              planet.planetary_mass, planet.orbital_period, planet.atmosphere))
        
        new_planet = cursor.fetchone()
        conn.commit()
        return new_planet
    except Exception as e:
        conn.rollback()
        raise
    
    
    
def update_planet(planet_name, origin_system=None, planetary_radii=None, planetary_mass=None, orbital_period=None, atmosphere=None):
    try:
        cursor = conn.cursor()
        planet_name = planet_name.strip()

        # Build the SET clause dynamically based on provided (non-None) values
        set_clauses = []
        params = []
        
        if origin_system is not None:
            set_clauses.append("origin_system = %s")
            params.append(origin_system)
        if planetary_radii is not None:
            set_clauses.append("planetary_radii = %s")
            params.append(planetary_radii)
        if planetary_mass is not None:
            set_clauses.append("planetary_mass = %s")
            params.append(planetary_mass)
        if orbital_period is not None:
            set_clauses.append("orbital_period = %s")
            params.append(orbital_period)
        if atmosphere is not None:
            set_clauses.append("atmosphere = %s")
            params.append(atmosphere)

        # If no fields are provided, return an error
        if not set_clauses:
            return {"error": "No fields provided to update"}

        # Construct the SQL query
        query = f"""
            UPDATE planet
            SET {', '.join(set_clauses)}
            WHERE LOWER(TRIM(planet_name)) = LOWER(%s)
            RETURNING *
        """
        params.append(planet_name)

        # Execute the query
        cursor.execute(query, params)
        updated_planet = cursor.fetchone()
        
        if updated_planet is None:
            return {"error": f"Planet '{planet_name}' not found"}

        # Convert the result tuple to a dictionary for a cleaner response
        columns = [desc[0] for desc in cursor.description]
        updated_planet_dict = dict(zip(columns, updated_planet))

        conn.commit()
        return updated_planet_dict
    except Exception as e:
        conn.rollback()
        return {"error": str(e)}
    
    
    
def delete_planet_function(planet_name: str):
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT object_id FROM planet WHERE trim(planet_name) = %s", (planet_name,))
        result = cursor.fetchone()
        if result is None:
            return None  # Planet not found
        
        object_id = result[0]
        
        cursor.execute("Delete from coordinates where object_id = %s",(object_id,))
        cursor.execute("DELETE FROM planet WHERE planet_name = %s", (planet_name,))
        cursor.execute("DELETE FROM object WHERE object_id = %s", (object_id,))
        
        conn.commit()
        return {"message": f"Planet {planet_name} deleted successfully"}
    except Exception as e:
        conn.rollback()
        raise  


