#!/bin/bash
# Startup script to run all tools

# Change to project root directory
cd "$(dirname "$0")"

# Start the services in background
node startup.js &

# Output success message
echo "Background services started successfully!"
