import pymysql
from dotenv import load_dotenv
import os

load_dotenv()

host = os.getenv("DB_HOST")
user = os.getenv("DB_USER")
password = os.getenv("DB_PASSWORD")
database = os.getenv("DB_NAME")


def get_connection():
    return pymysql.connect(
        host=host,
        user=user,
        password=password,
        database=database,
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=True
    )


def query(sql, params=None):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(sql, params)
        return {"statusCode": 200, "message": "Query executed successfully"}
    except Exception as err:
        return {"statusCode": 500, "message": str(err)}
    finally:
        cursor.close()
        conn.close()


def fetch(table: str, conditions: dict = None):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        sql = f"SELECT * FROM `{table}`"
        values = []

        if conditions:
            where_clause = " AND ".join([f"`{col}` = %s" for col in conditions])
            sql += f" WHERE {where_clause}"
            values = list(conditions.values())

        cursor.execute(sql, values)
        return cursor.fetchall()

    except Exception as err:
        print(f"Error: {err}")
        return []
    finally:
        cursor.close()
        conn.close()
