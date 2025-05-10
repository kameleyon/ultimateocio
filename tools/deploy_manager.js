// Deploy Manager Tool
// Handles environment-specific configurations and deployment processes

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { createHash } = require('crypto');

class DeployManager {
  constructor(options = {}) {
    this.options = {
      projectPath: options.projectPath || process.cwd(),
      environment: options.environment || 'development', // 'development', 'staging', 'production'
      configDir: options.configDir || 'deploy-configs',
      deployScript: options.deployScript || 'deploy.sh',
      enableRollback: options.enableRollback !== false,
      notifyOnComplete: options.notifyOnComplete !== false,
      maxDeployRetries: options.maxDeployRetries || 3,
      deployLockTime: options.deployLockTime || 10 * 60 * 1000 // 10 minutes in ms
    };
    
    this.deployLockFile = path.join(this.options.projectPath, '.deploy.lock');
    this.deployHistoryFile = path.join(this.options.projectPath, '.deploy.history.json');
    this.configDir = path.join(this.options.projectPath, this.options.configDir);
    
    // Ensure config directory exists
    if (!fs.existsSync(this.configDir)) {
      fs.mkdirSync(this.configDir, { recursive: true });
    }
    
    // Ensure deploy history file exists
    if (!fs.existsSync(this.deployHistoryFile)) {
      fs.writeFileSync(this.deployHistoryFile, JSON.stringify([], null, 2));
    }
  }
  
  // Check if deployment is currently locked
  isDeploymentLocked() {
    if (!fs.existsSync(this.deployLockFile)) {
      return false;
    }
    
    // Check if lock is expired
    const lockData = JSON.parse(fs.readFileSync(this.deployLockFile, 'utf8'));
    const lockTime = new Date(lockData.time);
    const now = new Date();
    
    return (now - lockTime) < this.options.deployLockTime;
  }
  
  // Create a deployment lock
  createDeployLock() {
    const lockData = {
      time: new Date().toISOString(),
      environment: this.options.environment,
      user: process.env.USER || 'system'
    };
    
    fs.writeFileSync(this.deployLockFile, JSON.stringify(lockData, null, 2));
  }
  
  // Release the deployment lock
  releaseDeployLock() {
    if (fs.existsSync(this.deployLockFile)) {
      fs.unlinkSync(this.deployLockFile);
    }
  }
  
  // Load environment-specific configuration
  loadEnvironmentConfig() {
    const configFile = path.join(this.configDir, `${this.options.environment}.json`);
    
    if (!fs.existsSync(configFile)) {
      throw new Error(`Configuration for ${this.options.environment} not found!`);
    }
    
    return JSON.parse(fs.readFileSync(configFile, 'utf8'));
  }
  
  // Apply environment-specific configuration
  applyEnvironmentConfig() {
    console.log(`Applying configuration for ${this.options.environment}...`);
    const config = this.loadEnvironmentConfig();
    
    // Apply environment variables
    if (config.env) {
      console.log('Setting environment variables...');
      for (const [key, value] of Object.entries(config.env)) {
        process.env[key] = value;
      }
    }
    
    // Apply file-based configuration
    if (config.files) {
      console.log('Updating configuration files...');
      for (const file of config.files) {
        if (file.path && file.content) {
          const filePath = path.join(this.options.projectPath, file.path);
          fs.writeFileSync(filePath, file.content);
          console.log(`Updated ${file.path}`);
        }
      }
    }
    
    return config;
  }
  
  // Generate a deployment artifact (e.g., bundle, container image)
  generateDeploymentArtifact() {
    console.log('Generating deployment artifact...');
    
    // This would typically run build commands, bundle assets, etc.
    try {
      // Example: Run build script
      execSync('npm run build', { 
        cwd: this.options.projectPath,
        stdio: 'inherit'
      });
      
      // Example: Create an artifact identifier
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const artifactId = `deploy-${this.options.environment}-${timestamp}`;
      
      // Record artifact info
      return {
        id: artifactId,
        timestamp: new Date().toISOString(),
        environment: this.options.environment,
        commitHash: this.getCurrentCommitHash() || 'unknown'
      };
    } catch (error) {
      console.error('Error generating deployment artifact:', error);
      throw error;
    }
  }
  
  // Get current git commit hash
  getCurrentCommitHash() {
    try {
      return execSync('git rev-parse HEAD', { 
        cwd: this.options.projectPath,
        stdio: ['pipe', 'pipe', 'pipe'] 
      }).toString().trim();
    } catch (error) {
      console.warn('Unable to get git commit hash:', error.message);
      return null;
    }
  }
  
  // Execute deployment to the target environment
  deploy() {
    if (this.isDeploymentLocked()) {
      console.error('Deployment is locked! Another deployment is in progress.');
      return false;
    }
    
    this.createDeployLock();
    
    try {
      console.log(`Starting deployment to ${this.options.environment}...`);
      
      // 1. Apply environment configuration
      const config = this.applyEnvironmentConfig();
      
      // 2. Generate deployment artifact
      const artifact = this.generateDeploymentArtifact();
      
      // 3. Record deployment start in history
      this.recordDeployment({
        ...artifact,
        status: 'in_progress',
        startTime: new Date().toISOString()
      });
      
      // 4. Run deployment script if it exists
      const deployScriptPath = path.join(this.options.projectPath, this.options.deployScript);
      if (fs.existsSync(deployScriptPath)) {
        console.log('Executing deployment script...');
        execSync(`bash ${deployScriptPath} ${this.options.environment}`, {
          cwd: this.options.projectPath,
          stdio: 'inherit',
          env: { ...process.env, DEPLOY_ARTIFACT_ID: artifact.id }
        });
      } else {
        console.log('No deployment script found. Skipping execution step.');
      }
      
      // 5. Update deployment record as completed
      this.recordDeployment({
        ...artifact,
        status: 'completed',
        endTime: new Date().toISOString()
      });
      
      console.log(`Deployment to ${this.options.environment} completed successfully!`);
      
      // 6. Send notification if enabled
      if (this.options.notifyOnComplete) {
        this.sendDeploymentNotification(artifact, 'success');
      }
      
      return true;
    } catch (error) {
      console.error(`Deployment to ${this.options.environment} failed:`, error);
      
      // Record failed deployment
      const failedArtifact = {
        id: `failed-${new Date().toISOString().replace(/[:.]/g, '-')}`,
        environment: this.options.environment,
        status: 'failed',
        error: error.message,
        endTime: new Date().toISOString()
      };
      
      this.recordDeployment(failedArtifact);
      
      // Send failure notification
      if (this.options.notifyOnComplete) {
        this.sendDeploymentNotification(failedArtifact, 'failure');
      }
      
      // Attempt rollback if enabled
      if (this.options.enableRollback) {
        this.rollback();
      }
      
      return false;
    } finally {
      this.releaseDeployLock();
    }
  }
  
  // Roll back to previous successful deployment
  rollback() {
    console.log('Initiating rollback to previous successful deployment...');
    
    try {
      // Load deployment history
      const history = this.getDeploymentHistory();
      
      // Find the last successful deployment for this environment
      const lastSuccessful = history
        .filter(d => d.environment === this.options.environment && d.status === 'completed')
        .sort((a, b) => new Date(b.endTime) - new Date(a.endTime))[0];
      
      if (!lastSuccessful) {
        console.error('No previous successful deployment found for rollback!');
        return false;
      }
      
      console.log(`Rolling back to deployment: ${lastSuccessful.id}`);
      
      // Execute rollback script if it exists
      const rollbackScriptPath = path.join(this.options.projectPath, 'rollback.sh');
      if (fs.existsSync(rollbackScriptPath)) {
        execSync(`bash ${rollbackScriptPath} ${this.options.environment} ${lastSuccessful.id}`, {
          cwd: this.options.projectPath,
          stdio: 'inherit'
        });
      } else {
        console.log('No rollback script found. Skipping execution step.');
      }
      
      // Record rollback in history
      this.recordDeployment({
        id: `rollback-${new Date().toISOString().replace(/[:.]/g, '-')}`,
        environment: this.options.environment,
        status: 'rollback',
        rollbackTo: lastSuccessful.id,
        endTime: new Date().toISOString()
      });
      
      console.log('Rollback completed successfully!');
      return true;
    } catch (error) {
      console.error('Rollback failed:', error);
      return false;
    }
  }
  
  // Record deployment in history
  recordDeployment(deployData) {
    const history = this.getDeploymentHistory();
    
    // Update existing record if it's an update
    const existingIndex = history.findIndex(d => d.id === deployData.id);
    if (existingIndex >= 0) {
      history[existingIndex] = { ...history[existingIndex], ...deployData };
    } else {
      history.push(deployData);
    }
    
    // Limit history to last 20 entries
    const limitedHistory = history.slice(-20);
    
    fs.writeFileSync(this.deployHistoryFile, JSON.stringify(limitedHistory, null, 2));
  }
  
  // Get deployment history
  getDeploymentHistory() {
    if (!fs.existsSync(this.deployHistoryFile)) {
      return [];
    }
    
    return JSON.parse(fs.readFileSync(this.deployHistoryFile, 'utf8'));
  }
  
  // Send notification about deployment
  sendDeploymentNotification(deployData, status) {
    // This is a placeholder. In a real implementation, this would send
    // an email, Slack message, or webhook notification.
    console.log(`
      Deployment Notification:
      Status: ${status}
      Environment: ${deployData.environment}
      ID: ${deployData.id}
      Time: ${new Date().toISOString()}
    `);
  }
}

// If this script is run directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};
  
  // Parse command-line arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--path' && i + 1 < args.length) {
      options.projectPath = args[++i];
    } else if (arg === '--env' && i + 1 < args.length) {
      options.environment = args[++i];
    } else if (arg === '--no-rollback') {
      options.enableRollback = false;
    } else if (arg === '--no-notify') {
      options.notifyOnComplete = false;
    } else if (arg === '--action' && i + 1 < args.length) {
      options.action = args[++i]; // 'deploy' or 'rollback'
    }
  }
  
  const manager = new DeployManager(options);
  
  if (options.action === 'rollback') {
    manager.rollback();
  } else {
    manager.deploy();
  }
}

module.exports = DeployManager;
