#!/bin/bash

# Define your server details
SERVER="root@157.173.122.221"
REMOTE_APP_PATH="~/flask_api"  # Remote path to where your Flask app is deployed

# Connect to the server and run cleanup commands
ssh $SERVER << EOF
    # Navigate to the Flask app directory
    cd $REMOTE_APP_PATH

    # Remove the uploads directory if it exists
    echo "Removing uploads directory..."
    rm -rf uploads

    # Create a new uploads directory
    echo "Creating uploads directory..."
    mkdir uploads

    echo "Cleanup completed."
EOF