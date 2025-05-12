#!/bin/bash

# Stop the PM2 process
echo "Stopping the application..."
pm2 stop cloud-backend
pm2 delete cloud-backend