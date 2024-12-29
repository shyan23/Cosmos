import psycopg2
import matplotlib.pyplot as plt
import numpy as np
import os
from Backend.DB.Config import get_db_connection


def ichhamoton():
    conn = get_db_connection()
    cur = conn.cursor()

    
    sql_query = """
    SELECT tablename
    FROM pg_tables
    WHERE schemaname NOT IN ('pg_catalog', 'information_schema');
    """
    cur.execute(sql_query)
    result = cur.fetchall()  
    tables = [row[0] for row in result]
    
    print("Available Tables:")
    for i, table in enumerate(tables):
        print(f"{i + 1}. {table}")
    
    
    table_index = int(input("Select a table (number): ")) - 1
    if table_index < 0 or table_index >= len(tables):
        print("Invalid selection!")
        return
    selected_table = tables[table_index]
    
    
    sql_query_for_selected_column = """
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = %s;
    """
    cur.execute(sql_query_for_selected_column, (selected_table,))
    column_names = [row[0] for row in cur.fetchall()]
    
    print("Available Columns:")
    for i, col in enumerate(column_names):
        print(f"{i + 1}. {col}")
    
    
    x_index = int(input("Select X-axis column (number): ")) - 1
    y_index = int(input("Select Y-axis column (number): ")) - 1
    if x_index < 0 or x_index >= len(column_names) or y_index < 0 or y_index >= len(column_names):
        print("Invalid column selection!")
        return
    
    x_col = column_names[x_index]
    y_col = column_names[y_index]
    
    
    sql_query_x = f"SELECT {x_col} FROM {selected_table};"
    cur.execute(sql_query_x)
    X = np.array([row[0] for row in cur.fetchall()])
    
    sql_query_y = f"SELECT {y_col} FROM {selected_table};"
    cur.execute(sql_query_y)
    Y = np.array([row[0] for row in cur.fetchall()])
    
    
    plt.figure(figsize=(10, 6))
    plt.plot(X, Y)
    plt.title(f"{selected_table}: {x_col} vs {y_col}")
    plt.xlabel(x_col)
    plt.ylabel(y_col)
    plt.grid(True)
    
    
    image_path = "/home/shyan/Desktop/DbPostgresql/Backend/image/ichhamoton.png"
    os.makedirs(os.path.dirname(image_path), exist_ok=True)
    try:
        plt.savefig(image_path)
        print(f"Image saved to {image_path}")
    except Exception as e:
        print(f"Error saving image: {e}")
    plt.close()


if __name__ == "__main__":
    ichhamoton()
