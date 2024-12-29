import psycopg2
from psycopg2.extensions import connection

NEW_DB_NAME = "StarCatalogue"
DB_USER = "postgres"  
DB_PASSWORD = "1234"  
DB_HOST = "localhost"
DB_PORT = "5432"

def get_db_connection() -> connection:
    try:
        conn = psycopg2.connect(
            dbname=NEW_DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT
        )
        return conn
    except Exception as e:
        print(f"An error occurred while connecting to the database: {e}")
        raise


