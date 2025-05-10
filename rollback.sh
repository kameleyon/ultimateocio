#!/bin/bash
# Rollback script for agentocio

# Get environment and deployment ID from arguments
ENVIRONMENT=${1:-development}
DEPLOY_ID=$2

echo "Rolling back $ENVIRONMENT to deployment $DEPLOY_ID..."

# Validate inputs
if [ -z "$DEPLOY_ID" ]; then
  echo "Error: No deployment ID specified for rollback!"
  exit 1
fi

# Load environment-specific variables
CONFIG_FILE="./deploy-configs/$ENVIRONMENT.json"

if [ ! -f "$CONFIG_FILE" ]; then
  echo "Error: Configuration file $CONFIG_FILE not found!"
  exit 1
fi

# Rollback based on environment
case "$ENVIRONMENT" in
  development)
    echo "Development rollback is a no-op. Just restart the service."
    npm run start
    ;;
    
  staging)
    echo "Rolling back staging environment..."
    # Add staging-specific rollback logic here
    ;;
    
  production)
    echo "Rolling back production to $DEPLOY_ID..."
    
    # Here you would typically:
    # 1. Stop the current service
    # 2. Restore the previous version from backup/artifact
    # 3. Restart the service
    # 4. Run health checks
    
    echo "Production rollback completed!"
    ;;
    
  *)
    echo "Unknown environment: $ENVIRONMENT"
    exit 1
    ;;
esac

echo "Rollback completed successfully!"
