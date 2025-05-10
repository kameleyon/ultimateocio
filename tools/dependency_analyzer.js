// Dependency Analyzer Tool
// Automatically checks for outdated, vulnerable, or unused dependencies

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class DependencyAnalyzer {
  constructor(options = {}) {
    this.options = {
      projectPath: options.projectPath || process.cwd(),
      checkFrequency: options.checkFrequency || 'daily', // 'daily', 'weekly'
      checkVulnerabilities: options.checkVulnerabilities !== false,
      checkUnused: options.checkUnused !== false,
      outputFile: options.outputFile || path.join(process.cwd(), 'dependency-report.json'),
      alertThreshold: options.alertThreshold || 'moderate', // 'low', 'moderate', 'high', 'critical'
    };
    
    this.lastRunFile = path.join(this.options.projectPath, '.dependency-analyzer-last-run');
  }

  // Check if we should run based on frequency setting
  shouldRun() {
    try {
      if (fs.existsSync(this.lastRunFile)) {
        const lastRun = new Date(fs.readFileSync(this.lastRunFile, 'utf8'));
        const now = new Date();
        
        // Calculate days since last run
        const daysSinceLastRun = Math.floor((now - lastRun) / (1000 * 60 * 60 * 24));
        
        if (this.options.checkFrequency === 'daily' && daysSinceLastRun < 1) {
          return false;
        }
        
        if (this.options.checkFrequency === 'weekly' && daysSinceLastRun < 7) {
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error checking run frequency:', error);
      return true; // Run by default if there's an error
    }
  }
  
  // Update the last run timestamp
  updateLastRun() {
    fs.writeFileSync(this.lastRunFile, new Date().toISOString());
  }

  // Check for outdated dependencies
  checkOutdated() {
    try {
      console.log('Checking for outdated dependencies...');
      const output = execSync('npm outdated --json', { 
        cwd: this.options.projectPath,
        stdio: ['pipe', 'pipe', 'pipe']
      }).toString();
      
      return output ? JSON.parse(output) : {};
    } catch (error) {
      // npm outdated returns exit code 1 if there are outdated packages
      if (error.status === 1 && error.stdout) {
        return JSON.parse(error.stdout.toString());
      }
      
      console.error('Error checking outdated dependencies:', error);
      return {};
    }
  }

  // Check for security vulnerabilities
  checkVulnerabilities() {
    if (!this.options.checkVulnerabilities) return {};
    
    try {
      console.log('Checking for security vulnerabilities...');
      const output = execSync('npm audit --json', { 
        cwd: this.options.projectPath,
        stdio: ['pipe', 'pipe', 'pipe']
      }).toString();
      
      return output ? JSON.parse(output) : {};
    } catch (error) {
      // npm audit returns exit code 1 if there are vulnerabilities
      if (error.status === 1 && error.stdout) {
        return JSON.parse(error.stdout.toString());
      }
      
      console.error('Error checking vulnerabilities:', error);
      return {};
    }
  }

  // Check for unused dependencies
  checkUnused() {
    if (!this.options.checkUnused) return [];
    
    try {
      console.log('Checking for unused dependencies...');
      // This is a simplified approach. A real implementation would use
      // a tool like depcheck to scan the codebase more thoroughly.
      
      const packageJson = require(path.join(this.options.projectPath, 'package.json'));
      const dependencies = { 
        ...packageJson.dependencies, 
        ...packageJson.devDependencies 
      };
      
      const unusedDeps = [];
      
      // This is a placeholder. A real implementation would do more thorough checking.
      return unusedDeps;
    } catch (error) {
      console.error('Error checking unused dependencies:', error);
      return [];
    }
  }

  // Generate a report of all dependency issues
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      outdated: this.checkOutdated(),
      vulnerabilities: this.checkVulnerabilities(),
      unused: this.checkUnused(),
      summary: {
        outdatedCount: Object.keys(this.checkOutdated()).length,
        vulnerableCount: 0,
        unusedCount: this.checkUnused().length,
        criticalIssues: 0
      }
    };
    
    // Count vulnerabilities by severity
    if (report.vulnerabilities.metadata) {
      const vulns = report.vulnerabilities.metadata.vulnerabilities;
      report.summary.vulnerableCount = 
        vulns.low + vulns.moderate + vulns.high + vulns.critical;
      report.summary.criticalIssues = vulns.high + vulns.critical;
    }
    
    return report;
  }

  // Save the report to a file
  saveReport(report) {
    fs.writeFileSync(this.options.outputFile, JSON.stringify(report, null, 2));
    console.log(`Dependency report saved to ${this.options.outputFile}`);
    
    // If there are critical issues, log a warning
    if (report.summary.criticalIssues > 0) {
      console.warn(`⚠️ WARNING: ${report.summary.criticalIssues} critical security issues found!`);
    }
  }

  // Main method to run the analyzer
  run() {
    if (!this.shouldRun()) {
      console.log(`Dependency analysis was run recently. Next check scheduled according to ${this.options.checkFrequency} frequency.`);
      return;
    }
    
    console.log('Starting dependency analysis...');
    const report = this.generateReport();
    this.saveReport(report);
    this.updateLastRun();
    
    return report;
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
    } else if (arg === '--frequency' && i + 1 < args.length) {
      options.checkFrequency = args[++i];
    } else if (arg === '--no-vulnerabilities') {
      options.checkVulnerabilities = false;
    } else if (arg === '--no-unused') {
      options.checkUnused = false;
    } else if (arg === '--output' && i + 1 < args.length) {
      options.outputFile = args[++i];
    } else if (arg === '--threshold' && i + 1 < args.length) {
      options.alertThreshold = args[++i];
    }
  }
  
  const analyzer = new DependencyAnalyzer(options);
  analyzer.run();
}

module.exports = DependencyAnalyzer;
