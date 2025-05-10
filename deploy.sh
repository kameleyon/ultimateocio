#!/bin/bash
# Deployment script for agentocio

# Get environment from first argument
ENVIRONMENT=${1:-development}
echo "Deploying to $ENVIRONMENT environment..."

# Load environment-specific variables
CONFIG_FILE="./deploy-configs/$ENVIRONMENT.json"

if [ ! -f "$CONFIG_FILE" ]; then
  echo "Error: Configuration file $CONFIG_FILE not found!"
  exit 1
fi

# Deploy based on environment
case "$ENVIRONMENT" in
  development)
    echo "Running development deployment..."
    npm install
    npm run build
    npm run start
    ;;
    
  staging)
    echo "Running staging deployment..."
    npm ci
    npm run build
    # Add staging-specific deployment commands here
    ;;
    
  production)
    echo "Running production deployment..."
    npm ci --production
    npm run build
    
    # Here you would typically:
    # 1. Stop the current service
    # 2. Deploy the new version
    # 3. Restart the service
    # 4. Run health checks
    
    echo "Production deployment completed!"
    ;;
    
  *)
    echo "Unknown environment: $ENVIRONMENT"
    exit 1
    ;;
esac

echo "Deployment completed successfully!"
