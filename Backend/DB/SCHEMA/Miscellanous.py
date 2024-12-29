from Backend.DB.Config import get_db_connection

def  Miscellanous():
    miscellaneous_table_query = """
    CREATE TABLE IF NOT EXISTS miscellaneous (
        object_id INT PRIMARY KEY,
        misc_name VARCHAR(100) UNIQUE NOT NULL,
        misc_category VARCHAR(20) CHECK (misc_category IN ('black_hole', 'asteroid', 'comet')),
        origin_system VARCHAR(100),
        CONSTRAINT misc_system FOREIGN KEY (origin_system) REFERENCES star_system(system_name),
        CONSTRAINT misc_obj FOREIGN KEY (object_id) REFERENCES object(object_id)
    );
    """

    miscellaneous_function_query = """
    CREATE OR REPLACE FUNCTION miscellaneous_object_trigger_function()
    RETURNS TRIGGER AS $$
    BEGIN
        INSERT INTO object (object_type) VALUES ('misc') RETURNING object_id INTO NEW.object_id;
        INSERT INTO coordinates (object_id, ra_coord, dec_coord) VALUES (NEW.object_id, 0, 0); -- Default RA/Dec
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    """

    miscellaneous_trigger_query = """
    CREATE TRIGGER miscellaneous_object_trigger
    BEFORE INSERT ON miscellaneous
    FOR EACH ROW
    EXECUTE FUNCTION miscellaneous_object_trigger_function();
    """

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        # Create the miscellaneous table
        cur.execute(miscellaneous_table_query)
        print("The Miscellaneous table has been created successfully.")

        # Create the trigger function
        cur.execute(miscellaneous_function_query)
        print("The trigger function for the Miscellaneous table has been created successfully.")

        # Create the trigger
        cur.execute(miscellaneous_trigger_query)
        print("The trigger for the Miscellaneous table has been created successfully.")

        conn.commit()
    except Exception as e:
        print(f"An error occurred in the Miscellaneous table setup: {e}")
        conn.rollback()
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

