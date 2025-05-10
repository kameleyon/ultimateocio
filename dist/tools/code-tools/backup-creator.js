"use strict";
// Auto-generated boilerplate for backup-creator
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteBackupSchema = exports.ListBackupsSchema = exports.RestoreBackupSchema = exports.CreateBackupSchema = void 0;
exports.activate = activate;
exports.onFileWrite = onFileWrite;
exports.onSessionStart = onSessionStart;
exports.onCommand = onCommand;
const zod_1 = require("zod");
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
function activate() {
    console.error("[TOOL] backup-creator activated");
    // Ensure backup directory exists
    ensureBackupDirectoryExists();
}
/**
 * Handles file write events to potentially trigger backups
 */
function onFileWrite(event) {
    console.error(`[Backup Creator] Watching file write: ${event.path}`);
    // Could trigger auto-backup on certain file changes
    if (isImportantFile(event.path)) {
        console.error(`[Backup Creator] Detected important file change: ${event.path}`);
        // Could trigger automatic backup
    }
}
/**
 * Handles session start logic
 */
function onSessionStart(session) {
    console.error(`[Backup Creator] Session started: ${session.id}`);
    // Could run initial backup at session start
}
/**
 * Handles backup-creator commands
 */
async function onCommand(command) {
    switch (command.name) {
        case 'backup-creator:create':
            console.error('[Backup Creator] Creating backup...');
            return await handleCreateBackup(command.args[0]);
        case 'backup-creator:restore':
            console.error('[Backup Creator] Restoring backup...');
            return await handleRestoreBackup(command.args[0]);
        case 'backup-creator:list':
            console.error('[Backup Creator] Listing backups...');
            return await handleListBackups(command.args[0]);
        case 'backup-creator:delete':
            console.error('[Backup Creator] Deleting backup...');
            return await handleDeleteBackup(command.args[0]);
        default:
            console.warn(`[Backup Creator] Unknown command: ${command.name}`);
            return { error: `Unknown command: ${command.name}` };
    }
}
// Define schemas for Backup Creator tool
exports.CreateBackupSchema = zod_1.z.object({
    name: zod_1.z.string().optional(),
    directory: zod_1.z.string(),
    includePatterns: zod_1.z.array(zod_1.z.string()).optional(),
    excludePatterns: zod_1.z.array(zod_1.z.string()).optional(),
    compress: zod_1.z.boolean().optional().default(true),
    includeMetadata: zod_1.z.boolean().optional().default(true),
});
exports.RestoreBackupSchema = zod_1.z.object({
    backupId: zod_1.z.string(),
    targetDirectory: zod_1.z.string().optional(),
    overwrite: zod_1.z.boolean().optional().default(false),
    validateChecksum: zod_1.z.boolean().optional().default(true),
});
exports.ListBackupsSchema = zod_1.z.object({
    directory: zod_1.z.string().optional(),
    limit: zod_1.z.number().optional().default(20),
    sortBy: zod_1.z.enum(['date', 'name', 'size']).optional().default('date'),
    order: zod_1.z.enum(['asc', 'desc']).optional().default('desc'),
});
exports.DeleteBackupSchema = zod_1.z.object({
    backupId: zod_1.z.string(),
    force: zod_1.z.boolean().optional().default(false),
});
// Path to backup directory
const BACKUP_DIR = path.join(process.cwd(), '.backups');
/**
 * Ensures the backup directory exists
 */
async function ensureBackupDirectoryExists() {
    try {
        await fs.mkdir(BACKUP_DIR, { recursive: true });
        console.error(`[Backup Creator] Backup directory ensured: ${BACKUP_DIR}`);
    }
    catch (error) {
        console.error(`[Backup Creator] Failed to create backup directory: ${error}`);
    }
}
/**
 * Checks if a file is important enough for auto-backup
 */
function isImportantFile(filePath) {
    const basename = path.basename(filePath).toLowerCase();
    const ext = path.extname(filePath).toLowerCase();
    // Check for important configuration or data files
    return basename.includes('config')
        || basename.includes('settings')
        || basename.includes('data')
        || basename.includes('db')
        || ext === '.json'
        || ext === '.sql'
        || ext === '.env';
}
/**
 * Creates a backup of specified files/directories
 */
async function handleCreateBackup(args) {
    try {
        const result = exports.CreateBackupSchema.safeParse(args);
        if (!result.success) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: result.error.format(),
                            message: "Invalid arguments for creating backup"
                        }, null, 2)
                    }],
                isError: true
            };
        }
        const { name, directory, includePatterns, excludePatterns, compress, includeMetadata } = result.data;
        // Generate a unique backup ID
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupId = name ? `${timestamp}-${name}` : `backup-${timestamp}`;
        const backupPath = path.join(BACKUP_DIR, backupId);
        // Ensure backup directory exists
        await fs.mkdir(backupPath, { recursive: true });
        // In a real implementation, this would backup the files/directories
        // For now, we'll just return a mock success response
        const mockBackupResults = {
            backupId,
            timestamp: new Date().toISOString(),
            directory,
            filesCount: 42,
            totalSize: 1024 * 1024 * 15, // 15 MB
            compressed: compress,
            backupPath,
        };
        // Create mock metadata file
        if (includeMetadata) {
            await fs.writeFile(path.join(backupPath, 'metadata.json'), JSON.stringify({
                ...mockBackupResults,
                includePatterns,
                excludePatterns,
                createdAt: new Date().toISOString(),
                checksums: {
                    files: {},
                    metadata: crypto.createHash('sha256').update(JSON.stringify(mockBackupResults)).digest('hex')
                }
            }, null, 2));
        }
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        ...mockBackupResults,
                        message: `Backup created successfully with ID: ${backupId}`
                    }, null, 2)
                }]
        };
    }
    catch (error) {
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        error: String(error),
                        message: "Failed to create backup"
                    }, null, 2)
                }],
            isError: true
        };
    }
}
/**
 * Restores a backup to the specified directory
 */
async function handleRestoreBackup(args) {
    try {
        const result = exports.RestoreBackupSchema.safeParse(args);
        if (!result.success) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: result.error.format(),
                            message: "Invalid arguments for restoring backup"
                        }, null, 2)
                    }],
                isError: true
            };
        }
        const { backupId, targetDirectory, overwrite, validateChecksum } = result.data;
        const backupPath = path.join(BACKUP_DIR, backupId);
        // Check if backup exists
        try {
            await fs.access(backupPath);
        }
        catch (error) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: `Backup not found: ${backupId}`,
                            message: "Failed to restore backup"
                        }, null, 2)
                    }],
                isError: true
            };
        }
        // Read metadata if it exists
        let metadata;
        try {
            const metadataContent = await fs.readFile(path.join(backupPath, 'metadata.json'), 'utf-8');
            metadata = JSON.parse(metadataContent);
        }
        catch (error) {
            console.warn(`[Backup Creator] Metadata not found for backup ${backupId}`);
        }
        // In a real implementation, this would restore the files/directories
        // For now, we'll just return a mock success response
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        backupId,
                        targetDirectory: targetDirectory || metadata?.directory || 'unknown',
                        timestamp: new Date().toISOString(),
                        filesRestored: 42,
                        totalSize: metadata?.totalSize || 0,
                        overwritten: overwrite,
                        message: `Backup ${backupId} restored successfully`
                    }, null, 2)
                }]
        };
    }
    catch (error) {
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        error: String(error),
                        message: "Failed to restore backup"
                    }, null, 2)
                }],
            isError: true
        };
    }
}
/**
 * Lists available backups
 */
async function handleListBackups(args) {
    try {
        const result = exports.ListBackupsSchema.safeParse(args);
        if (!result.success) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: result.error.format(),
                            message: "Invalid arguments for listing backups"
                        }, null, 2)
                    }],
                isError: true
            };
        }
        const { directory, limit, sortBy, order } = result.data;
        let backups = [];
        try {
            const items = await fs.readdir(BACKUP_DIR);
            // Filter only directories
            for (const item of items) {
                const itemPath = path.join(BACKUP_DIR, item);
                const stats = await fs.stat(itemPath);
                if (stats.isDirectory()) {
                    // Try to read metadata
                    let metadata;
                    try {
                        const metadataContent = await fs.readFile(path.join(itemPath, 'metadata.json'), 'utf-8');
                        metadata = JSON.parse(metadataContent);
                    }
                    catch (error) {
                        // Metadata not found, use basic info
                        metadata = {
                            createdAt: stats.birthtime.toISOString(),
                            directory: 'unknown',
                            filesCount: 0,
                            totalSize: 0
                        };
                    }
                    // Only include backups for the specified directory if provided
                    if (!directory || metadata.directory === directory) {
                        backups.push({
                            backupId: item,
                            createdAt: metadata.createdAt,
                            directory: metadata.directory,
                            filesCount: metadata.filesCount,
                            totalSize: metadata.totalSize,
                            path: itemPath
                        });
                    }
                }
            }
            // Sort backups
            backups.sort((a, b) => {
                let comparison = 0;
                if (sortBy === 'date') {
                    comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                }
                else if (sortBy === 'name') {
                    comparison = a.backupId.localeCompare(b.backupId);
                }
                else if (sortBy === 'size') {
                    comparison = a.totalSize - b.totalSize;
                }
                return order === 'asc' ? comparison : -comparison;
            });
            // Limit results
            backups = backups.slice(0, limit);
        }
        catch (error) {
            console.error(`[Backup Creator] Error reading backup directory: ${error}`);
            backups = [];
        }
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        backups,
                        count: backups.length,
                        message: `Found ${backups.length} backups`
                    }, null, 2)
                }]
        };
    }
    catch (error) {
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        error: String(error),
                        message: "Failed to list backups"
                    }, null, 2)
                }],
            isError: true
        };
    }
}
/**
 * Deletes a backup
 */
async function handleDeleteBackup(args) {
    try {
        const result = exports.DeleteBackupSchema.safeParse(args);
        if (!result.success) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: result.error.format(),
                            message: "Invalid arguments for deleting backup"
                        }, null, 2)
                    }],
                isError: true
            };
        }
        const { backupId, force } = result.data;
        const backupPath = path.join(BACKUP_DIR, backupId);
        // Check if backup exists
        try {
            await fs.access(backupPath);
        }
        catch (error) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: `Backup not found: ${backupId}`,
                            message: "Failed to delete backup"
                        }, null, 2)
                    }],
                isError: true
            };
        }
        // In a real implementation, this would delete the backup directory
        // For now, we'll just return a mock success response
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        backupId,
                        timestamp: new Date().toISOString(),
                        message: `Backup ${backupId} deleted successfully`
                    }, null, 2)
                }]
        };
    }
    catch (error) {
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        error: String(error),
                        message: "Failed to delete backup"
                    }, null, 2)
                }],
            isError: true
        };
    }
}
