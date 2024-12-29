from Backend.DB.Config import get_db_connection

def Discovery():
    Discovery_sql_query = """
    create table discovery (
        object_id int,
        telescope_id varchar(50),
        discovery_year int not null,  -- Added Discovery year
        constraint unique_discovery unique (object_id, telescope_id),
        constraint discovery_tele foreign key (telescope_id) references telescope(telescope_id),
        constraint obj_discovery foreign key (object_id) references object(object_id)
        );
    """
    
    try:
        conn = get_db_connection()
        cur  = conn.cursor()
        
        cur.execute(Discovery_sql_query)
        print("The Discovery Table has been created Successfully")
        
        conn.commit()
    except Exception as e:
        print(f"An Error Occured in the discovery table : {e}")
        conn.rollback()
        
        
    finally:
        
        if cur:
            cur.close()
        if conn:
            conn.close() 