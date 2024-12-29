from Backend.DB.Config import get_db_connection


def Coordinates():

    Coordinate_sql_query = """
    create table IF NOT EXISTS coordinates (
    object_id int primary key,
    ra_coord DECIMAL not null,    
    dec_coord DECIMAL not null,    
    distance DECIMAL,              
    constraint coord_obj foreign key (object_id) references object(object_id)
);
"""

    try:
        conn = get_db_connection()
        cur  = conn.cursor()
        
        cur.execute(Coordinate_sql_query)
        print("The Coordinate Table has been created Successfully")

        
        conn.commit()
    except Exception as e:
        print(f"An Error Occured in the Coordinate Table : {e}")
        conn.rollback()
        
        
    finally:
        
        if cur:
            cur.close()
        if conn:
            conn.close() 