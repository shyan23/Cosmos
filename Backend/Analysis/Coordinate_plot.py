import psycopg2
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd

from Backend.DB.Config import get_db_connection


async def Coordinateshow(star_system: str):
    image_path = '/home/shyan/Desktop/DbPostgresql/Backend/image/Coordinate_plot.png'

    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT COUNT(*) FROM star_system WHERE system_name = %s", (star_system,))
                if cur.fetchone()[0] == 0:
                    return {"message": f"Star system '{star_system}' does not exist."}

                
                sql_query = """
                    SELECT planet_name, ra_coord AS right_ascension, dec_coord AS declination
                    FROM planet p
                    JOIN coordinates c ON p.object_id = c.object_id
                    WHERE p.origin_system = %s
                """
                cur.execute(sql_query, (star_system,))
                result = cur.fetchall()

                if not result:
                    return {"message": "No data available for the given star system."}

                planet_names = [row[0] for row in result]
                ra_values = [row[1] for row in result]
                dec_values = [row[2] for row in result]

                
                plt.figure(figsize=(10, 6))
                plt.scatter(ra_values, dec_values, color='skyblue')
                for i, planet in enumerate(planet_names):
                    plt.text(ra_values[i], dec_values[i], planet, fontsize=9, ha='right')

                plt.xlabel('Right Ascension (RA) in Degree')
                plt.ylabel('Declination (DEC) in Degree')
                plt.title(f'Planet Coordinates in the {star_system}')
                plt.tight_layout()

                plt.savefig(image_path)
                plt.close()

                return {
                    "message": "Image created successfully",
                    "image_path": "http://127.0.0.1:8000/view-image-Coordinate"
                }

    except Exception as e:
        return {"message": f"An error occurred during processing: {e}"}
