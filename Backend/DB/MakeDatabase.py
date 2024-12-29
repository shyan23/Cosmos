from psycopg2 import sql
from Config import get_db_connection, NEW_DB_NAME

def create_database():
    try:        
        connection = get_db_connection()
        connection.autocommit = True
        cursor = connection.cursor()
        cursor.execute(sql.SQL("SELECT 1 FROM pg_catalog.pg_database WHERE datname = %s"), [NEW_DB_NAME])
        exists = cursor.fetchone()
        if not exists:

            cursor.execute(sql.SQL("CREATE DATABASE {}").format(sql.Identifier(NEW_DB_NAME)))
            print(f"Database '{NEW_DB_NAME}' created successfully.")
        else:
            print(f"Database '{NEW_DB_NAME}' already exists.")

        cursor.close()
        connection.close()

    except Exception as e:
        print(f"An error occurred while creating the database: {e}")
