import os from 'os';
import { executeSandboxedCommand as macExecuteSandboxedCommand } from './mac-sandbox.js';
import { configManager } from '../config-manager.js';
/**
 * Platform detection and sandbox execution router
 */
export async function executeSandboxedCommand(command, timeoutMs = 30000, shell) {
    // Get the allowed directories from config
    const config = await configManager.getConfig();
    const allowedDirectories = config.allowedDirectories || [os.homedir()];
    const platform = os.platform();
    // Platform-specific sandbox execution
    switch (platform) {
        case 'darwin': // macOS
            try {
                const result = await macExecuteSandboxedCommand(command, allowedDirectories, timeoutMs);
                return {
                    pid: result.pid,
                    output: result.output,
                    isBlocked: result.isBlocked
                };
            }
            catch (error) {
                console.error('Mac sandbox execution error:', error);
                return {
                    pid: -1,
                    output: `Sandbox execution error: ${error instanceof Error ? error.message : String(error)}`,
                    isBlocked: false
                };
            }
        // Add cases for other platforms when implemented
        // case 'linux':
        // case 'win32':
        default:
            // For unsupported platforms, return an error
            return {
                pid: -1,
                output: `Sandbox execution not supported on ${platform}. Command was not executed: ${command}`,
                isBlocked: false
            };
    }
}
/**
 * Check if sandboxed execution is available for the current platform
 */
export function isSandboxAvailable() {
    const platform = os.platform();
    // Currently only implemented for macOS
    return platform === 'darwin';
}
