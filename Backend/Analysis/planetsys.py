import os
import psycopg2
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
from Backend.DB.Config import get_db_connection

async def analyze_planetary_systems():
    
    
    image_path = '/home/shyan/Desktop/DbPostgresql/Backend/image/plntsys'
    if not os.path.exists(os.path.dirname(image_path)):
        os.makedirs(os.path.dirname(image_path))      
    
    conn = get_db_connection()
    
    
    sql_query = """
    with planet_counts AS (
        select
        p.origin_system,
        COUNT(*) as planet_count,
        AVG(p.planetary_mass) as avg_planet_mass,
        SUM(CASE when p.atmosphere = 'y' then 1 else 0 end) as planets_with_atmosphere
        
        FROM planet p
        GROUP BY p.origin_system
    ),
    satellite_stats AS (
        select p.origin_system,
               count(DISTINCT sat.object_id) as total_satellites,
               AVG(sat.satellite_mass) as avg_satellite_mass
        FROM planet p
        left join satellite sat on p.object_id = sat.parent_planet
        group by p.origin_system
    )
    SELECT pc.*,
           ss.total_satellites,
           sys.system_age,
           sys.system_type,
           (SELECT COUNT(*)
            FROM miscellaneous m 
            WHERE m.origin_system = pc.origin_system 
            AND m.misc_category = 'asteroid') as asteroid_count
    from planet_counts pc
    join satellite_stats ss ON pc.origin_system = ss.origin_system
    join star_system sys ON pc.origin_system = sys.system_name
    where exists (
        SELECT 1 
        FROM star s 
        WHERE s.origin_system = pc.origin_system
        AND s.stellar_class IN ('F', 'G', 'K')
    )
    ORDER BY pc.planet_count DESC;
    """
    
    
    df = pd.read_sql_query(sql_query, conn)
    
    
    conn.close()
    
    
    df_melted = pd.melt(df, 
                        id_vars=['origin_system', 'system_type'],
                        value_vars=['planet_count', 'total_satellites', 'asteroid_count'])
    
    
    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(12, 10))
    
    
    sns.barplot(data=df_melted,
                x='origin_system',
                y='value',
                hue='variable',
                ax=ax1)
    ax1.set_title('System Composition by Object Type')
    ax1.set_xlabel('Star System')
    ax1.set_ylabel('Count')
    plt.xticks(rotation=45)
    
    
    sns.scatterplot(data=df,
                    x='system_age',
                    y='planet_count',
                    size='total_satellites',
                    hue='system_type',
                    ax=ax2)
    ax2.set_title('System Age vs Planet Count')
    ax2.set_xlabel('System Age')
    ax2.set_ylabel('Number of Planets')
    
    
    plt.tight_layout()
    
    try:
        # Save the plot
        plt.savefig(image_path)
        print(f"Image saved to {image_path}")
    except Exception as e:
        print(f"Error saving image: {e}")
    
    plt.close()


    return {
        "message": "Image created successfully", 
        "image_path": "http://127.0.0.1:8000/show-image-Planetsys"  
    }
    
    

