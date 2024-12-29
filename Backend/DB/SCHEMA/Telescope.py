from Backend.DB.Config import get_db_connection


def Telescope():

    Telescope_sql_query = """
    create table telescope (
        telescope_id varchar(50) primary key,
        category varchar(50),
        launch_year int,
        operating_country char(3)
);
    """

    try:
        conn = get_db_connection()
        cur  = conn.cursor()
        
        cur.execute(Telescope_sql_query)
        print("The Telescope Table has been created Successfully")

        
        conn.commit()
    except Exception as e:
        print(f"An Error Occured in the Telescope table : {e}")
        conn.rollback()
        
        
    finally:
        
        if cur:
            cur.close()
        if conn:
            conn.close() 

    