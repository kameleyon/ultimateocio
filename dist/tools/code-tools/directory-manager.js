"use strict";
// Directory manager tool implementation
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
exports.outputSchema = exports.inputSchema = exports.DirectoryTreeSchema = exports.ListDirectorySchema = exports.CreateDirectorySchema = exports.toolDescription = exports.toolName = void 0;
exports.execute = execute;
const zod_1 = require("zod");
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const pathUtils_1 = require("../../utils/pathUtils");
exports.toolName = 'directory-manager';
exports.toolDescription = 'Manage directories with create, list, and tree operations';
// Schema for creating a directory
exports.CreateDirectorySchema = zod_1.z.object({
    path: zod_1.z.string().describe('Path to the directory to create'),
});
// Schema for listing a directory
exports.ListDirectorySchema = zod_1.z.object({
    path: zod_1.z.string().describe('Path to the directory to list'),
});
// Schema for getting a directory tree
exports.DirectoryTreeSchema = zod_1.z.object({
    path: zod_1.z.string().describe('Path to the directory to get tree for'),
});
// Input schema for the tool
exports.inputSchema = zod_1.z.discriminatedUnion('operation', [
    zod_1.z.object({
        operation: zod_1.z.literal('create_directory'),
        params: exports.CreateDirectorySchema,
    }),
    zod_1.z.object({
        operation: zod_1.z.literal('list_directory'),
        params: exports.ListDirectorySchema,
    }),
    zod_1.z.object({
        operation: zod_1.z.literal('directory_tree'),
        params: exports.DirectoryTreeSchema,
    }),
]);
// Output schema for the tool
exports.outputSchema = zod_1.z.object({
    content: zod_1.z.array(zod_1.z.object({
        type: zod_1.z.literal('text'),
        text: zod_1.z.string(),
    })),
    isError: zod_1.z.boolean().optional(),
});
/**
 * Create a directory
 */
async function createDirectory(dirPath) {
    try {
        if (!dirPath) {
            throw new Error("Directory path is required");
        }
        console.error(`[DIRECTORY_MANAGER] Creating directory: ${dirPath}`);
        // Resolve and validate the path
        const resolvedPath = await (0, pathUtils_1.resolvePath)(dirPath);
        console.error(`[DIRECTORY_MANAGER] Resolved path: ${resolvedPath}`);
        await fs.mkdir(resolvedPath, { recursive: true });
        return `Successfully created directory ${dirPath} (resolved to ${resolvedPath})`;
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`[DIRECTORY_MANAGER] Error creating directory: ${errorMessage}`);
        throw new Error(`Failed to create directory ${dirPath}: ${errorMessage}`);
    }
}
/**
 * List a directory
 */
async function listDirectory(dirPath) {
    try {
        if (!dirPath) {
            throw new Error("Directory path is required");
        }
        console.error(`[DIRECTORY_MANAGER] Listing directory: ${dirPath}`);
        // Resolve and validate the path
        const resolvedPath = await (0, pathUtils_1.resolvePath)(dirPath);
        console.error(`[DIRECTORY_MANAGER] Resolved path: ${resolvedPath}`);
        // Check if path exists
        if (!(await (0, pathUtils_1.pathExists)(resolvedPath))) {
            throw new Error(`Directory does not exist: ${dirPath} (resolved to ${resolvedPath})`);
        }
        const entries = await fs.readdir(resolvedPath, { withFileTypes: true });
        console.error(`[DIRECTORY_MANAGER] Found ${entries.length} entries in ${resolvedPath}`);
        const formatted = entries
            .map((entry) => `${entry.isDirectory() ? "[DIR]" : "[FILE]"} ${entry.name}`)
            .join("\n");
        return formatted || "Directory is empty";
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`[DIRECTORY_MANAGER] Error listing directory: ${errorMessage}`);
        throw new Error(`Failed to list directory ${dirPath}: ${errorMessage}`);
    }
}
/**
 * Get a directory tree
 */
async function getDirectoryTree(dirPath) {
    async function buildTree(currentPath) {
        // Resolve and validate the path
        const resolvedPath = await (0, pathUtils_1.resolvePath)(currentPath);
        const entries = await fs.readdir(resolvedPath, { withFileTypes: true });
        const result = [];
        for (const entry of entries) {
            const entryData = {
                name: entry.name,
                type: entry.isDirectory() ? 'directory' : 'file'
            };
            if (entry.isDirectory()) {
                const subPath = path.join(currentPath, entry.name);
                try {
                    entryData.children = await buildTree(subPath);
                }
                catch (error) {
                    // Skip directories we can't access
                    console.error(`[ERROR][DIRECTORY_TREE] Failed to access ${subPath}: ${error}`);
                    entryData.children = [];
                }
            }
            result.push(entryData);
        }
        return result;
    }
    try {
        // Resolve and validate the path
        const resolvedPath = await (0, pathUtils_1.resolvePath)(dirPath);
        // Check if path exists
        if (!(await (0, pathUtils_1.pathExists)(resolvedPath))) {
            throw new Error(`Directory does not exist: ${dirPath}`);
        }
        const treeData = await buildTree(resolvedPath);
        return JSON.stringify(treeData, null, 2);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to get directory tree for ${dirPath}: ${errorMessage}`);
    }
}
/**
 * Execute the directory manager tool
 */
async function execute(input) {
    try {
        switch (input.operation) {
            case 'create_directory': {
                const result = await createDirectory(input.params.path);
                return {
                    content: [{ type: 'text', text: result }],
                };
            }
            case 'list_directory': {
                const result = await listDirectory(input.params.path);
                return {
                    content: [{ type: 'text', text: result }],
                };
            }
            case 'directory_tree': {
                const result = await getDirectoryTree(input.params.path);
                return {
                    content: [{ type: 'text', text: result }],
                };
            }
            default:
                throw new Error(`Unknown operation: ${input.operation}`);
        }
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`[DIRECTORY_MANAGER] Error executing operation ${input.operation}: ${errorMessage}`);
        // Provide more detailed error message
        let detailedMessage = errorMessage;
        // Add specific guidance for common errors
        if (errorMessage.includes('Access to path') || errorMessage.includes('does not exist')) {
            detailedMessage += `\n\nPlease check:
1. The path exists and is accessible
2. The path is within allowed directories
3. The correct operation is being used`;
        }
        return {
            content: [{ type: 'text', text: detailedMessage }],
            isError: true,
        };
    }
}
