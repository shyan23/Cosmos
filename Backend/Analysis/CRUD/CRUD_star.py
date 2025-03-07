import psycopg2
from Backend.DB.Config import get_db_connection
conn = get_db_connection()

# Function to create a star
def create_star(star_name, origin_system, luminosity, solar_radii, solar_mass, stellar_class):
    try:
        cursor = conn.cursor()

        # Check if the system exists
        cursor.execute("SELECT system_name FROM star_system WHERE system_name = %s", (origin_system,))
        system = cursor.fetchone()

        if system is None:
            return {"error": f"Star system '{origin_system}' does not exist."}

        # Insert into object table first
        cursor.execute(
            "INSERT INTO object (object_type) VALUES ('STAR') RETURNING object_id"
        )
        object_id = cursor.fetchone()[0]  # Fetch object_id correctly

        # Insert into star table
        cursor.execute("""
            INSERT INTO star (object_id, star_name, origin_system, luminosity, 
                              solar_radii, solar_mass, stellar_class)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING *
        """, (object_id, star_name, origin_system, luminosity, solar_radii, solar_mass, stellar_class))

        new_star = cursor.fetchone()
        conn.commit()
        return new_star
    except Exception as e:
        conn.rollback()
        return {"error": str(e)}

# Function to update a star
def update_star(star_name, new_star_name=None, origin_system=None, luminosity=None, solar_radii=None, solar_mass=None, stellar_class=None):
    try:
        cursor = conn.cursor()
        
        set_clauses = []
        params = []
        
        if new_star_name is not None:
            set_clauses.append("star_name = %s")
            params.append(new_star_name.strip())  
        if origin_system is not None:
            set_clauses.append("origin_system = %s")
            params.append(origin_system)
        if luminosity is not None:
            set_clauses.append("luminosity = %s")
            params.append(luminosity)
        if solar_radii is not None:
            set_clauses.append("solar_radii = %s")
            params.append(solar_radii)
        if solar_mass is not None:
            set_clauses.append("solar_mass = %s")
            params.append(solar_mass)
        if stellar_class is not None:
            set_clauses.append("stellar_class = %s")
            params.append(stellar_class)

        # If no fields are provided, return an error or skip the update
        if not set_clauses:
            return {"error": "No fields provided to update"}

        # Construct the SQL query
        query = f"""
            UPDATE star
            SET {', '.join(set_clauses)}
            WHERE LOWER(TRIM(star_name)) = LOWER(%s)
            RETURNING *
        """
        params.append(star_name)

        # Execute the query
        cursor.execute(query, params)
        updated_star = cursor.fetchone()
        
        if updated_star is None:
            return {"error": f"Star '{star_name}' not found"}

        # Convert the result tuple to a dictionary for a cleaner response
        columns = [desc[0] for desc in cursor.description]
        updated_star_dict = dict(zip(columns, updated_star))

        conn.commit()
        return updated_star_dict
    except Exception as e:
        conn.rollback()
        return {"error": str(e)}

# Function to delete a star
def delete_star(star_name):
    try:
        cursor = conn.cursor()
        
    
        # Perform case-insensitive and trim to avoid space issues
        cursor.execute("SELECT object_id FROM star WHERE TRIM(star_name) = %s", (star_name,))
        result = cursor.fetchone()
        
        if result is None:
            return {"error": f"Star '{star_name}' not found"}
        
        object_id = result[0]
        
        cursor.execute("DELETE FROM star WHERE star_name = %s", (star_name,))
        cursor.execute("DELETE FROM coordinates WHERE object_id = %s", (object_id,))
        cursor.execute("DELETE FROM object WHERE object_id = %s", (object_id,))
        
        conn.commit()
        return {"message": f"Star '{star_name}' deleted successfully"}
    except Exception as e:
        conn.rollback()
        return {"error": str(e)}


async def get_star(star_name:str):
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * from star where lower(trim(star_name)) = %s",(star_name,))
        result = cursor.fetchone()
        
        if result is None :
            return{"Error" : "Following star cannot be foumd"}
        else : return {"Sucess!" : result}
    except Exception as e:
        return {"ERROR": str(e)}

        