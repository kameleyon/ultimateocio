"use strict";
// File writer tool implementation
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
exports.outputSchema = exports.inputSchema = exports.WriteFileSchema = exports.toolDescription = exports.toolName = void 0;
exports.execute = execute;
const zod_1 = require("zod");
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const pathUtils_1 = require("../../utils/pathUtils");
exports.toolName = 'file-writer';
exports.toolDescription = 'Write content to files with support for creating directories';
// Schema for writing a file
exports.WriteFileSchema = zod_1.z.object({
    path: zod_1.z.string().describe('Path to the file to write'),
    content: zod_1.z.string().describe('Content to write to the file'),
});
// Input schema for the tool
exports.inputSchema = zod_1.z.object({
    path: zod_1.z.string().describe('Path to the file to write'),
    content: zod_1.z.string().describe('Content to write to the file'),
});
// Output schema for the tool
exports.outputSchema = zod_1.z.object({
    content: zod_1.z.array(zod_1.z.object({
        type: zod_1.z.literal('text'),
        text: zod_1.z.string(),
    })),
    isError: zod_1.z.boolean().optional(),
});
/**
 * Ensure directory exists
 */
async function ensureDirectoryExists(filePath) {
    const dirname = path.dirname(filePath);
    try {
        // Resolve and validate the directory path
        const resolvedDirname = await (0, pathUtils_1.resolvePath)(dirname);
        try {
            await fs.access(resolvedDirname);
        }
        catch (error) {
            // Directory doesn't exist, create it
            await fs.mkdir(resolvedDirname, { recursive: true });
        }
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to ensure directory exists for ${filePath}: ${errorMessage}`);
    }
}
/**
 * Write content to a file
 */
async function writeFile(filePath, content) {
    try {
        // Resolve and validate the path
        const resolvedPath = await (0, pathUtils_1.resolvePath)(filePath);
        // Ensure the directory exists
        await ensureDirectoryExists(resolvedPath);
        // Write the file
        await fs.writeFile(resolvedPath, content, 'utf-8');
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to write file ${filePath}: ${errorMessage}`);
    }
}
/**
 * Execute the file writer tool
 */
async function execute(input) {
    try {
        await writeFile(input.path, input.content);
        return {
            content: [{
                    type: 'text',
                    text: `Successfully wrote to ${input.path}`
                }],
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
            content: [{ type: 'text', text: errorMessage }],
            isError: true,
        };
    }
}
