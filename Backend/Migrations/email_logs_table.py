from Gateway.MySQL_Gateway import get_connection


db = get_connection()
cursor = db.cursor()

def create_emails_table():
    cursor.execute("""
                CREATE TABLE IF NOT EXISTS emails (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    application_code VARCHAR(255),
                    name VARCHAR(255),
                    email VARCHAR(255),
                    position VARCHAR(255),
                    remarks VARCHAR(255),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)


    print("✅ Emails table created")
    cursor.close()
    db.close()