from pathlib import Path
from fastapi.responses import JSONResponse
import psycopg2
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
from Backend.DB.Config import get_db_connection


async def Telescope_image():
    
    IMAGE_DIR = Path("/home/shyan/Desktop/DbPostgresql/Backend/image/")
    IMAGE_DIR.mkdir(parents=True, exist_ok=True)
    conn = get_db_connection()
    cur = conn.cursor()

    
    sql_query = """
        SELECT d.discovery_year, t.telescope_id, COUNT(d.object_id) AS number_of_discoveries
        FROM discovery d
        JOIN telescope t ON d.telescope_id = t.telescope_id
        GROUP BY d.discovery_year, t.telescope_id
        ORDER BY d.discovery_year, t.telescope_id;
    """
    try:
        cur.execute(sql_query)
        result = cur.fetchall()
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Database query failed: {e}"}
        )
    finally:
        cur.close()
        conn.close()

    
    data = [
        {'Discovery Year': i[0], 'Telescope Name': i[1], 'Number of Discoveries': i[2]}
        for i in result
    ]
    df = pd.DataFrame(data)
    df['Telescope-Year'] = df['Telescope Name'].astype(str) + '-' + df['Discovery Year'].astype(str)

    
    plt.figure(figsize=(12, 8))
    sns.set_theme(style="whitegrid")
    ax = sns.barplot(x='Telescope-Year', y='Number of Discoveries', data=df, palette='muted')
    ax.set_xlabel('Telescope and Discovery Year')
    ax.set_ylabel('Number of Discoveries')
    ax.set_title('Telescope Discoveries Over Time')
    plt.xticks(rotation=45, ha="right")
    plt.tight_layout()
    image_path = IMAGE_DIR / "Telescope_discovery_vs_year_seaborn.png"
    plt.savefig(image_path)
    plt.close()

    return {
        "message": "Image created successfully", 
        "image_path": "http://127.0.0.1:8000/view-image"  
    }

