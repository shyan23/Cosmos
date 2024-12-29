from Backend.DB.Config import get_db_connection

def Planet():
    planet_table_query = """
    CREATE TABLE IF NOT EXISTS planet (
        object_id INT PRIMARY KEY,
        planet_name VARCHAR(100) UNIQUE NOT NULL,
        origin_system VARCHAR(100),
        planetary_radii DECIMAL,
        planetary_mass DECIMAL,
        orbital_period DECIMAL,
        atmosphere CHAR(1) CHECK (atmosphere IN ('y', 'n')),
        CONSTRAINT planet_system FOREIGN KEY (origin_system) REFERENCES star_system(system_name),
        CONSTRAINT planet_obj FOREIGN KEY (object_id) REFERENCES object(object_id)
    );
    """

    planet_function_query = """
    CREATE OR REPLACE FUNCTION planet_object_trigger_function()
    RETURNS TRIGGER AS $$
    BEGIN
        INSERT INTO object (object_type) VALUES ('plnt') RETURNING object_id INTO NEW.object_id;
        INSERT INTO coordinates (object_id, ra_coord, dec_coord) VALUES (NEW.object_id, 0, 0); -- Default RA/Dec
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    """

    planet_trigger_query = """
    CREATE TRIGGER planet_object_trigger
    BEFORE INSERT ON planet
    FOR EACH ROW
    EXECUTE FUNCTION planet_object_trigger_function();
    """

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # Create the planet table
        cur.execute(planet_table_query)
        print("The Planet table has been created successfully.")

        # Create the trigger function
        cur.execute(planet_function_query)
        print("The trigger function for the Planet table has been created successfully.")

        # Create the trigger
        cur.execute(planet_trigger_query)
        print("The trigger for the Planet table has been created successfully.")

        conn.commit()
    except Exception as e:
        print(f"An error occurred in the Planet table setup: {e}")
        conn.rollback()
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

