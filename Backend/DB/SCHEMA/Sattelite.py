from Backend.DB.Config import get_db_connection

def Sattelite():
    satellite_table_query = """
    CREATE TABLE IF NOT EXISTS satellite (
        object_id INT PRIMARY KEY,
        satellite_name VARCHAR(100) UNIQUE NOT NULL,
        parent_planet INT NOT NULL,
        satellite_radii DECIMAL,
        satellite_mass DECIMAL,
        orbital_period DECIMAL,
        atmosphere CHAR(1) CHECK (atmosphere IN ('y', 'n')),
        CONSTRAINT satellite_parent FOREIGN KEY (parent_planet) REFERENCES planet(object_id),
        CONSTRAINT sat_obj FOREIGN KEY (object_id) REFERENCES object(object_id)
    );
    """

    satellite_function_query = """
    CREATE OR REPLACE FUNCTION satellite_object_trigger_function()
    RETURNS TRIGGER AS $$
    BEGIN
        INSERT INTO object (object_type) VALUES ('satl') RETURNING object_id INTO NEW.object_id;
        INSERT INTO coordinates (object_id, ra_coord, dec_coord) VALUES (NEW.object_id, 0, 0); -- Default RA/Dec
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    """

    satellite_trigger_query = """
    CREATE TRIGGER satellite_object_trigger
    BEFORE INSERT ON satellite
    FOR EACH ROW
    EXECUTE FUNCTION satellite_object_trigger_function();
    """

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # Create the satellite table
        cur.execute(satellite_table_query)
        print("The Satellite table has been created successfully.")

        # Create the trigger function
        cur.execute(satellite_function_query)
        print("The trigger function for the Satellite table has been created successfully.")

        # Create the trigger
        cur.execute(satellite_trigger_query)
        print("The trigger for the Satellite table has been created successfully.")

        conn.commit()
    except Exception as e:
        print(f"An error occurred in the Satellite table setup: {e}")
        conn.rollback()
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


