
from psycopg2 import *


from Config import get_db_connection

from MakeDatabase import create_database

from Backend.DB.SCHEMA.Coordinates import Coordinates
from Backend.DB.SCHEMA.Discovery import Discovery
from Backend.DB.SCHEMA.Miscellanous import Miscellanous
from Backend.DB.SCHEMA.Object import Object
from Backend.DB.SCHEMA.Planet import Planet
from Backend.DB.SCHEMA.Sattelite import Sattelite
from Backend.DB.SCHEMA.Star import Star
from Backend.DB.SCHEMA.StarSystem import StarSystem
from Backend.DB.SCHEMA.Telescope import Telescope



def check_table_exists(table_name):
    query = """
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = %s
    );
    """
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(query, (table_name,))
        exists = cur.fetchone()[0]
        return exists
    except Exception as e:
        print(f"An error occurred while initializing the database StarCatalogue: {e}")
        return False
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()



if __name__ == "__main__":
    
    create_database()
    
    if(check_table_exists("object")):
        print(f"The table object already exists.")
    else :
        Object()

    if(check_table_exists("coordinates")):
        print(f"The table coordinates already exists.")
    else :
        Coordinates()
        
    if(check_table_exists("star_system")):
        print(f"The table star_system already exists.")
    else :
        StarSystem()   
        
    if(check_table_exists("Star")):
        print(f"The table Star already exists.")
    else :
        Star() 
    
    if(check_table_exists("planet")):
        print(f"The table planet already exists.")
    else :
        Planet()
        
    if(check_table_exists("sattelite")):
        print(f"The table sattelite already exists.")
    else :
        Sattelite()
        
    if(check_table_exists("miscellaneous")):
        print(f"The table Miscellaneous already exists.")
    else :
        Miscellanous()      
        
    if(check_table_exists("telescope")):
        print(f"The table Telescope already exists.")
    else :
        Telescope()  

    if(check_table_exists("discovery")):
        print(f"The table discovery already exists.")
    else :
        Discovery()        




    
    
