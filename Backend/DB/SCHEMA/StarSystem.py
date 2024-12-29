from Backend.DB.Config import get_db_connection

def StarSystem():
    StarSystem_sql_query = """
    create table IF NOT EXISTS star_system (
    system_name varchar(100) primary key,
    distance DECIMAL,
    system_type varchar(20),
    system_age DECIMAL
);
    """
    
    try:
        conn = get_db_connection()
        cur  = conn.cursor()
        
        cur.execute(StarSystem_sql_query)
        print("The StarSystem Table has been created Successfully")        
        conn.commit()
    except Exception as e:
        print(f"An Error Occured in the StarSystem table : {e}")
        conn.rollback()
        
    finally:
        
        if cur:
            cur.close()
        if conn:
            conn.close() 