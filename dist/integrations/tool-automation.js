// Tool automation integration
// Automatically runs tools based on file changes and session events

import { handleCustomTool } from '../handlers/custom-tool-handlers.js';
import { capture } from '../utils.js';

// Initialize the file watcher
export async function initializeFileWatcher() {
    try {
        console.error('Initializing file watcher automation...');
        
        // Create file watcher configuration
        const watchConfig = {
            path: "C:\\Users\\Administrator\\agentocio\\agentocio\\",
            patterns: ["**/*.ts", "**/*.js", "**/*.json"]
        };
        
        // Start the file watcher
        await handleCustomTool('file_watcher', watchConfig);
        console.error('File watcher started successfully');
        
        return true;
    } catch (error) {
        console.error('Failed to initialize file watcher:', error);
        capture('automation_error', { message: `Failed to initialize file watcher: ${error.message}` });
        return false;
    }
}

// Handle file changes
export async function handleFileChange(filePath) {
    try {
        console.error(`File changed: ${filePath}`);
        
        // Create backup before making changes
        await handleCustomTool('backup_creator', {
            path: filePath,
            includeNodeModules: false
        });
        console.error(`Backup created for: ${filePath}`);
        
        // Run code fixer
        await handleCustomTool('code_fixer', {
            path: filePath,
            fixTypes: ['formatting', 'linting', 'style']
        });
        console.error(`Code fixer ran on: ${filePath}`);
        
        return true;
    } catch (error) {
        console.error('Error in file change handler:', error);
        capture('automation_error', { message: `Error handling file change: ${error.message}` });
        return false;
    }
}

// Set up tone adjuster for new sessions
export async function setDefaultTone() {
    try {
        const toneConfig = {
            tone: 'witty technical casual'
        };
        
        await handleCustomTool('tone_adjuster', toneConfig);
        console.error('Default tone set to: witty technical casual');
        
        return true;
    } catch (error) {
        console.error('Failed to set default tone:', error);
        capture('automation_error', { message: `Failed to set default tone: ${error.message}` });
        return false;
    }
}

// Register automation handlers (without using event listeners)
export function registerAutomationHandlers(server) {
    console.error('Setting up automation handlers...');
    
    // Since the SDK server doesn't support event listeners,
    // we'll just set up file monitoring here
    
    // Start file monitoring via the file_watcher custom tool
    // This will have its own internal event handling
    
    console.error('Automation handlers setup completed');
}

// Initialize all automation
export async function initializeAutomation(server) {
    console.error('Initializing automation...');
    
    // Initialize file watcher
    await initializeFileWatcher();
    
    // Register event handlers
    registerAutomationHandlers(server);
    
    // Set default tone
    await setDefaultTone();
    
    console.error('Automation initialized successfully');
}
