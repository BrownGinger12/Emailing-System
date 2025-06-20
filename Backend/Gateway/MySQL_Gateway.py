import mysql.connector
from dotenv import load_dotenv
import os

load_dotenv()


host = os.getenv("DB_HOST")
user = os.getenv("DB_USER")
password = os.getenv("DB_PASSWORD")
database = os.getenv("DB_NAME")


def get_connection():
    return mysql.connector.connect(
        host=host,
        user=user,
        password=password,
        database=database
    )

def query(sql, params=None):
    db = get_connection()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute(sql, params)
        db.commit()
        return {"statusCode": 200, "message": "Query executed successfully"}
    except mysql.connector.Error as err:
        return {"statusCode": 500, "message": err.msg}
    finally:
        cursor.close()
        db.close()
    

def fetch(table: str, conditions: dict = None):
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        query = f"SELECT * FROM {table}"
        values = []

        if conditions:
            where_clause = " AND ".join([f"{col} = %s" for col in conditions])
            query += f" WHERE {where_clause}"
            values = list(conditions.values())

        cursor.execute(query, values)
        results = cursor.fetchall()
        cursor.close()
        conn.close()
        return results

    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return []