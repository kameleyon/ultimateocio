"use strict";
// File reader tool implementation
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
exports.outputSchema = exports.inputSchema = exports.ReadMultipleFilesSchema = exports.ReadFileSchema = exports.toolDescription = exports.toolName = void 0;
exports.execute = execute;
const zod_1 = require("zod");
const fs = __importStar(require("fs/promises"));
const pathUtils_1 = require("../../utils/pathUtils");
exports.toolName = 'file-reader';
exports.toolDescription = 'Read file contents with support for single and multiple files';
// Schema for reading a single file
exports.ReadFileSchema = zod_1.z.object({
    path: zod_1.z.string().describe('Path to the file to read'),
});
// Schema for reading multiple files
exports.ReadMultipleFilesSchema = zod_1.z.object({
    paths: zod_1.z.array(zod_1.z.string()).describe('Array of file paths to read'),
});
// Input schema for the tool
exports.inputSchema = zod_1.z.discriminatedUnion('operation', [
    zod_1.z.object({
        operation: zod_1.z.literal('read_file'),
        params: exports.ReadFileSchema,
    }),
    zod_1.z.object({
        operation: zod_1.z.literal('read_multiple_files'),
        params: exports.ReadMultipleFilesSchema,
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
 * Read a single file
 */
async function readFile(filePath) {
    try {
        // Resolve and validate the path
        const resolvedPath = await (0, pathUtils_1.resolvePath)(filePath);
        // Check if path exists
        if (!(await (0, pathUtils_1.pathExists)(resolvedPath))) {
            throw new Error(`File does not exist: ${filePath}`);
        }
        const content = await fs.readFile(resolvedPath, 'utf-8');
        return content;
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to read file ${filePath}: ${errorMessage}`);
    }
}
/**
 * Read multiple files
 */
async function readMultipleFiles(filePaths) {
    const results = await Promise.all(filePaths.map(async (filePath) => {
        try {
            // Resolve and validate the path
            const resolvedPath = await (0, pathUtils_1.resolvePath)(filePath);
            // Check if path exists
            if (!(await (0, pathUtils_1.pathExists)(resolvedPath))) {
                return `${filePath}: Error - File does not exist`;
            }
            const content = await fs.readFile(resolvedPath, 'utf-8');
            return `${filePath}:\n${content}\n`;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return `${filePath}: Error - ${errorMessage}`;
        }
    }));
    return results.join('\n---\n');
}
/**
 * Execute the file reader tool
 */
async function execute(input) {
    try {
        switch (input.operation) {
            case 'read_file': {
                const content = await readFile(input.params.path);
                return {
                    content: [{ type: 'text', text: content }],
                };
            }
            case 'read_multiple_files': {
                const content = await readMultipleFiles(input.params.paths);
                return {
                    content: [{ type: 'text', text: content }],
                };
            }
            default:
                throw new Error(`Unknown operation: ${input.operation}`);
        }
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
            content: [{ type: 'text', text: errorMessage }],
            isError: true,
        };
    }
}
