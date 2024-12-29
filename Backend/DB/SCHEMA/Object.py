from Backend.DB.Config import get_db_connection

def Object():

    object_sql_query = """
        -- Create a sequence for generating object_id values
        create sequence IF NOT EXISTS object_id_seq start with 1 increment by 1;

        -- Create the object table
        CREATE TABLE IF NOT EXISTS object(
            object_id int PRIMARY KEY DEFAULT nextval('object_id_seq'),
            object_type char(4)
        );
    """

    try:
        conn = get_db_connection()
        cur  = conn.cursor()
        
        cur.execute(object_sql_query)
        print("The object Table has been created Successfully")

        
        conn.commit()
    except Exception as e:
        print(f"An Error Occured in the object table : {e}")
        conn.rollback()
        
        
    finally:
        
        if cur:
            cur.close()
        if conn:
            conn.close() 

    