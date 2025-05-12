#!/bin/bash

# Navigate to the application directory
cd /home/ec2-user/cloud-backend

# Load environment variables if you have an .env file
if [ -f .env ]; then
    export $(cat .env | xargs)
fi

# Start the application using PM2
echo "Starting the application..."
pm2 start dist/src/main.js --name cloud-backend

# Ensure the application starts on system boot
echo "Configuring PM2 startup..."
pm2 startup
pm2 save