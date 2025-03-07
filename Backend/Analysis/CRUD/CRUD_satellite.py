

from models.satellitemodel import SatelliteCreate,SatelliteUpdate
from Backend.DB.Config import get_db_connection


conn = get_db_connection()


def create_satellite_function(satellite: SatelliteCreate):
    try:
        cursor = conn.cursor()
        
        # Insert into object table to get a new object_id for the satellite
        cursor.execute(
            "INSERT INTO object (object_type) VALUES ('SAT') RETURNING object_id"
        )
        object_id = cursor.fetchone()[0]
        
        # Fetch the object_id of the parent planet based on its name
        cursor.execute(
            "SELECT object_id FROM planet WHERE planet_name = %s",
            (satellite.parent_planet,)
        )
        result = cursor.fetchone()
        if result is None:
            return {"error": "Parent planet not found"}
        planet_id = result[0]
        
        # Insert the satellite with the planet's object_id as parent_planet
        cursor.execute("""
            INSERT INTO satellite (object_id, satellite_name, parent_planet, satellite_radii,
                                 satellite_mass, orbital_period, atmosphere)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING *
        """, (object_id, satellite.satellite_name, planet_id,
              satellite.satellite_radii, satellite.satellite_mass,
              satellite.orbital_period, satellite.atmosphere))
        
        new_satellite = cursor.fetchone()
        conn.commit()
        return new_satellite
    except Exception as e:
        conn.rollback()
        raise
    

def update_satellite_function(
    satellite_name,
    parent_planet= None,
    satellite_radii = None,
    satellite_mass = None,
    orbital_period = None,
    atmosphere = None,

):
    try:
        cursor = conn.cursor()
        
        # Lists to build the dynamic SQL query
        set_clauses = []
        params = []

        # Handle parent_planet if provided
        if parent_planet is not None:
            # Convert parent_planet name to object_id
            cursor.execute(
                "SELECT object_id FROM planet WHERE planet_name = %s",
                (parent_planet,)
            )
            result = cursor.fetchone()
            if result is None:
                return {"Error" : "Parent planet cannot be found"}
            planet_id = result[0]
            set_clauses.append("parent_planet = %s")
            params.append(planet_id)

        # Add other fields if provided
        if satellite_radii is not None:
            set_clauses.append("satellite_radii = %s")
            params.append(satellite_radii)
        if satellite_mass is not None:
            set_clauses.append("satellite_mass = %s")
            params.append(satellite_mass)
        if orbital_period is not None:
            set_clauses.append("orbital_period = %s")
            params.append(orbital_period)
        if atmosphere is not None:
            set_clauses.append("atmosphere = %s")
            params.append(atmosphere)

        # Check if any fields were provided to update
        if not set_clauses:
            return {"Error" : "Need to select at least one field to modify"}

        # Build and execute the dynamic SQL query
        query = f"""
            UPDATE satellite
            SET {', '.join(set_clauses)}
            WHERE satellite_name = %s
            RETURNING *
        """
        params.append(satellite_name)

        cursor.execute(query, params)
        updated_satellite = cursor.fetchone()

        if updated_satellite is None:
            return None  # Satellite not found

        # Commit the transaction
        conn.commit()
        return updated_satellite

    except Exception as e:
        conn.rollback()
        raise e
    
    
def delete_satellite_function(satellite_name: str):
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT object_id FROM satellite WHERE satellite_name = %s", (satellite_name,))
        result = cursor.fetchone()
        if result is None:
            return None  # Satellite not found
        
        object_id = result[0]
        
        cursor.execute("Delete from coordinates where object_id = %s",(object_id,))
        cursor.execute("DELETE FROM satellite WHERE satellite_name = %s", (satellite_name,))
        cursor.execute("DELETE FROM object WHERE object_id = %s", (object_id,))
        
        conn.commit()
        return {"message": f"Satellite {satellite_name} deleted successfully"}
    except Exception as e:
        conn.rollback()
        raise