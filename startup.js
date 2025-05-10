// Startup configuration for auto-running tools
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Define __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Root directory path
const ROOT_DIR = path.resolve(__dirname);

// Configuration settings
const CONFIG = {
  code_fixer: {
    interval: 60000, // Check every minute
    fixTypes: ['syntax', 'style', 'security']
  },
  code_analyzer: {
    interval: 120000, // Check every 2 minutes
    maxLines: 500
  },
  auth_checker: {
    interval: 30000, // Check every 30 seconds
    rootDir: ROOT_DIR
  },
  file_watcher: {
    patterns: ['**/*.js', '**/*.json', '**/*.html', '**/*.css']
  },
  backup_creator: {
    interval: 1800000, // Every 30 minutes
    includeNodeModules: false
  },
  dependency_analyzer: {
    interval: 86400000, // Once per day (24 hours)
    checkVulnerabilities: true,
    checkUnused: true
  },
  deploy_manager: {
    environment: process.env.NODE_ENV || 'development',
    enableRollback: true,
    notifyOnComplete: true
  }
};

// Start code_fixer periodic checks
setInterval(() => {
  console.log('Running code_fixer...');
  spawn('node', ['./tools/code_fixer.js', 
    '--types', CONFIG.code_fixer.fixTypes.join(','),
    '--path', ROOT_DIR
  ]);
}, CONFIG.code_fixer.interval);

// Start code_analyzer with line limit
setInterval(() => {
  console.log('Running code_analyzer...');
  spawn('node', ['./tools/code_analyzer.js',
    '--max-lines', CONFIG.code_analyzer.maxLines.toString(),
    '--path', ROOT_DIR
  ]);
}, CONFIG.code_analyzer.interval);

// Start auth_checker
setInterval(() => {
  console.log('Running auth_checker...');
  spawn('node', ['./tools/auth_checker.js',
    '--root', CONFIG.auth_checker.rootDir
  ]);
}, CONFIG.auth_checker.interval);

// Setup file_watcher (runs continuously)
console.log('Starting file_watcher...');
const fileWatcher = spawn('node', ['./tools/file_watcher.js',
  '--patterns', CONFIG.file_watcher.patterns.join(','),
  '--path', ROOT_DIR
]);

// Output file_watcher logs
fileWatcher.stdout.on('data', (data) => {
  console.log(`file_watcher: ${data}`);
});

// Setup backup_creator periodic backups
setInterval(() => {
  console.log('Creating backup...');
  spawn('node', ['./tools/backup_creator.js',
    '--path', ROOT_DIR,
    '--include-node-modules', CONFIG.backup_creator.includeNodeModules.toString()
  ]);
}, CONFIG.backup_creator.interval);

// Setup dependency_analyzer daily check
setInterval(() => {
  console.log('Running dependency analyzer...');
  spawn('node', ['./tools/dependency_analyzer.js',
    '--path', ROOT_DIR,
    '--frequency', 'daily',
    '--threshold', 'moderate'
  ]);
}, CONFIG.dependency_analyzer.interval);

// Setup deploy_manager in monitor mode
// The deploy manager primarily responds to events rather than running on a timer
console.log('Initializing deploy manager...');
const deployManager = spawn('node', ['./tools/deploy_manager.js',
  '--path', ROOT_DIR,
  '--env', CONFIG.deploy_manager.environment
]);

// Output deploy_manager logs
deployManager.stdout.on('data', (data) => {
  console.log(`deploy_manager: ${data}`);
});

console.log('All background services started successfully!');