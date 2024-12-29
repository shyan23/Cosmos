import os
import psycopg2
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
from Backend.DB.Config import get_db_connection

async def analyze_stellar_dist():
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    
    sql_query = """
    WITH star_discoveries AS (
        SELECT s.stellar_class,
               COUNT(*) as star_count,
               AVG(s.solar_mass) as avg_mass,
               AVG(s.luminosity) as avg_luminosity,
               MAX(d.discovery_year) as latest_discovery
        FROM star s
        LEFT JOIN discovery d ON s.object_id = d.object_id
        GROUP BY s.stellar_class
    ),
    system_stats AS (
        SELECT ss.system_type,
               COUNT(DISTINCT s.object_id) as total_stars,
               COUNT(DISTINCT p.object_id) as total_planets
        FROM star_system ss
        LEFT JOIN star s ON ss.system_name = s.origin_system
        LEFT JOIN planet p ON ss.system_name = p.origin_system
        GROUP BY ss.system_type
        HAVING COUNT(DISTINCT s.object_id) > 0
    )
    SELECT sd.stellar_class,
           sd.star_count,
           sd.avg_mass,
           sd.avg_luminosity,
           sd.latest_discovery,
           ss.total_planets
    FROM star_discoveries sd
    JOIN system_stats ss ON 1=1
    ORDER BY sd.stellar_class;
    """
    
    try:
        
        cur.execute(sql_query)
        col_names = [desc[0] for desc in cur.description]  
        results = cur.fetchall()
        df = pd.DataFrame(results, columns=col_names)  
        
    except Exception as e:
        print(f"Problem executing SQL query from StellarDistFile: {e}")
        return
    finally:
        
        cur.close()
        conn.close()

    
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 6))
    
    
    sns.scatterplot(data=df, 
                    x='avg_mass', 
                    y='avg_luminosity',
                    size='star_count',
                    hue='stellar_class',
                    ax=ax1,
                    palette='viridis')
    ax1.set_title('Star Distribution by Mass and Luminosity')
    ax1.set_xlabel('Average Solar Mass')
    ax1.set_ylabel('Average Luminosity')
    ax1.legend(title='Stellar Class', bbox_to_anchor=(1.05, 1), loc='upper left')
    
    
    sns.barplot(data=df,
                x='stellar_class',
                y='latest_discovery',
                palette='coolwarm',
                ax=ax2)
    ax2.set_title('Latest Discovery Year by Stellar Class')
    ax2.set_xlabel('Stellar Class')
    ax2.set_ylabel('Year')
    
    
    plt.tight_layout()

    
    image_path = '/home/shyan/Desktop/DbPostgresql/Backend/image/StellerDist.png'
    
    
    if not os.path.exists(os.path.dirname(image_path)):
        os.makedirs(os.path.dirname(image_path))
    
    try:
        
        plt.savefig(image_path)
        print(f"Image saved to {image_path}")
    except Exception as e:
        print(f"Error saving image: {e}")
    
    plt.close()


    return {
        "message": "Image created successfully", 
        "image_path": "http://127.0.0.1:8000/show-image-Planetsys"  
    }
    
    


