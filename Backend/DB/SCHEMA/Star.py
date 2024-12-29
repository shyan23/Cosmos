from Backend.DB.Config import get_db_connection

def Star():
    star_table_query = """
    CREATE TABLE IF NOT EXISTS star (
        object_id INT PRIMARY KEY,
        star_name VARCHAR(100) UNIQUE NOT NULL,
        origin_system VARCHAR(100) NOT NULL,
        luminosity DECIMAL,
        solar_radii DECIMAL,
        solar_mass DECIMAL,
        stellar_class CHAR(1) CHECK(stellar_class IN ('O', 'B', 'A', 'F', 'G', 'K', 'M')),
        CONSTRAINT stellar_system FOREIGN KEY (origin_system) REFERENCES star_system(system_name),
        CONSTRAINT star_obj FOREIGN KEY (object_id) REFERENCES object(object_id)
    );
    """

    star_function_query = """
    CREATE OR REPLACE FUNCTION star_object_trigger_function()
    RETURNS TRIGGER AS $$
    BEGIN
        INSERT INTO object (object_type) VALUES ('star') RETURNING object_id INTO NEW.object_id;
        INSERT INTO coordinates (object_id, ra_coord, dec_coord) VALUES (NEW.object_id, 0, 0);
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    """

    star_trigger_query = """
    CREATE TRIGGER star_object_trigger
    BEFORE INSERT ON star
    FOR EACH ROW
    EXECUTE FUNCTION star_object_trigger_function();
    """

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # Create the star table
        cur.execute(star_table_query)
        print("The Star table has been created successfully.")

        # Create the trigger function
        cur.execute(star_function_query)
        print("The trigger function for the Star table has been created successfully.")

        # Create the trigger
        cur.execute(star_trigger_query)
        print("The trigger for the Star table has been created successfully.")

        conn.commit()
    except Exception as e:
        print(f"An error occurred in the Star table setup: {e}")
        conn.rollback()
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()
