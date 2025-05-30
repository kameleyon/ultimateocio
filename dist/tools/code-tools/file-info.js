"use strict";
// File info tool implementation
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
exports.outputSchema = exports.inputSchema = exports.GetFileInfoSchema = exports.toolDescription = exports.toolName = void 0;
exports.execute = execute;
const zod_1 = require("zod");
const fs = __importStar(require("fs/promises"));
const pathUtils_1 = require("../../utils/pathUtils");
exports.toolName = 'file-info';
exports.toolDescription = 'Get detailed metadata about files and directories';
// Schema for getting file info
exports.GetFileInfoSchema = zod_1.z.object({
    path: zod_1.z.string().describe('Path to the file or directory to get info for'),
});
// Input schema for the tool
exports.inputSchema = exports.GetFileInfoSchema;
// Output schema for the tool
exports.outputSchema = zod_1.z.object({
    content: zod_1.z.array(zod_1.z.object({
        type: zod_1.z.literal('text'),
        text: zod_1.z.string(),
    })),
    isError: zod_1.z.boolean().optional(),
});
/**
 * Get file or directory stats
 */
async function getFileStats(filePath) {
    // Resolve and validate the path
    const resolvedPath = await (0, pathUtils_1.resolvePath)(filePath);
    // Check if path exists
    if (!(await (0, pathUtils_1.pathExists)(resolvedPath))) {
        throw new Error(`File or directory does not exist: ${filePath}`);
    }
    const stats = await fs.stat(resolvedPath);
    return {
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        accessed: stats.atime,
        isDirectory: stats.isDirectory(),
        isFile: stats.isFile(),
        permissions: stats.mode.toString(8).slice(-3),
    };
}
/**
 * Format file stats into a readable string
 */
function formatFileStats(stats) {
    return Object.entries(stats)
        .map(([key, value]) => {
        if (value instanceof Date) {
            return `${key}: ${value.toISOString()}`;
        }
        return `${key}: ${value}`;
    })
        .join('\n');
}
/**
 * Execute the file info tool
 */
async function execute(input) {
    try {
        const stats = await getFileStats(input.path);
        const formattedStats = formatFileStats(stats);
        return {
            content: [{
                    type: 'text',
                    text: formattedStats
                }],
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
            content: [{ type: 'text', text: `Error getting file info: ${errorMessage}` }],
            isError: true,
        };
    }
}
