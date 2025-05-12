#!/bin/bash

# Navigate to the application directory
cd /home/ec2-user/cloud-backend

# Clean up any previous builds
echo "Cleaning up previous builds..."
rm -rf node_modules
rm -rf dist

# Install Node.js if not already installed
if ! command -v node &> /dev/null
then
    echo "Installing Node.js..."
    curl -sL https://deb.nodesource.com/setup_16.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Verify Node.js and npm installation
echo "Node.js version: $(node -v)"
echo "npm version: $(npm -v)"

# Install application dependencies
echo "Installing dependencies..."
npm install

# Build the NestJS application
echo "Building the application..."
npm run build

# Install PM2 process manager globally if not installed
if ! command -v pm2 &> /dev/null
then
    echo "Installing PM2..."
    sudo npm install -g pm2
fi