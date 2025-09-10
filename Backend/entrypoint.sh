#!/bin/sh
echo "Waiting for MySQL... "$DB_HOST" "

while ! mysqladmin ping -h"$DB_HOST" --silent; do
    sleep 2
done

echo "MySQL is up - running migrations..."
python Migrate.py

echo "Starting Flask app..."
python app.py