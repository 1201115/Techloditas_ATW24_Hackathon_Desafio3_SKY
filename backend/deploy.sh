#!/bin/bash

# Load environment variables
export $(cat .env | xargs)

# Define your server details
SERVER="root@157.173.122.221"
LOCAL_APP_PATH="flask_api.py"  # Local path to your Flask app
REMOTE_APP_PATH="~/flask_api"  # Remote path to where you want to deploy

# Transfer the Flask app file first
echo "Transferring Flask app..."
scp $LOCAL_APP_PATH $SERVER:$REMOTE_APP_PATH

# Connect to the server and run deployment commands
ssh $SERVER << EOF
    # Update packages and install necessary software
    sudo apt update
    sudo apt install -y python3-pip python3-venv nginx

    # Create directory for the Flask app if it doesn't exist
    mkdir -p $REMOTE_APP_PATH
    cd $REMOTE_APP_PATH

    # Create and activate a virtual environment if it doesn't exist
    if [ ! -d "venv" ]; then
        python3 -m venv venv
    fi
    source venv/bin/activate

    # Install required packages
    pip install Flask moviepy Flask-Cors pillow gunicorn

    # Check for existing Gunicorn processes and kill them
    echo "Stopping existing Gunicorn processes..."
    pkill -f gunicorn || echo "No existing Gunicorn processes found."

    # Set environment variables (optional)
    export FLASK_APP=flask_api.py  # Adjusted to your actual Flask app filename
    export FLASK_ENV=development

    # Start the Flask app with Gunicorn
    echo "Starting Flask app..."
    gunicorn --bind 0.0.0.0:5000 flask_api:app &
EOF

echo "Deployment completed."