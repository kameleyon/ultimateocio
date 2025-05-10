"use strict";
// File searcher tool implementation
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
exports.outputSchema = exports.inputSchema = exports.SearchFilesSchema = exports.toolDescription = exports.toolName = void 0;
exports.execute = execute;
const zod_1 = require("zod");
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const minimatch_1 = require("minimatch");
const pathUtils_1 = require("../../utils/pathUtils");
exports.toolName = 'file-searcher';
exports.toolDescription = 'Search for files and directories with pattern matching';
// Schema for searching files
exports.SearchFilesSchema = zod_1.z.object({
    path: zod_1.z.string().describe('Starting directory path for the search'),
    pattern: zod_1.z.string().describe('Search pattern to match against file and directory names'),
    excludePatterns: zod_1.z.array(zod_1.z.string()).optional().default([]).describe('Patterns to exclude from search results'),
});
// Input schema for the tool
exports.inputSchema = exports.SearchFilesSchema;
// Output schema for the tool
exports.outputSchema = zod_1.z.object({
    content: zod_1.z.array(zod_1.z.object({
        type: zod_1.z.literal('text'),
        text: zod_1.z.string(),
    })),
    isError: zod_1.z.boolean().optional(),
});
/**
 * Check if a path should be excluded based on patterns
 */
function shouldExclude(relativePath, excludePatterns) {
    return excludePatterns.some(pattern => {
        const globPattern = pattern.includes('*') ? pattern : `**/${pattern}/**`;
        return (0, minimatch_1.minimatch)(relativePath, globPattern, { dot: true });
    });
}
/**
 * Search for files and directories
 */
async function searchFiles(rootPath, pattern, excludePatterns = []) {
    // Resolve and validate the root path
    const resolvedRootPath = await (0, pathUtils_1.resolvePath)(rootPath);
    // Check if path exists
    if (!(await (0, pathUtils_1.pathExists)(resolvedRootPath))) {
        throw new Error(`Directory does not exist: ${rootPath}`);
    }
    const results = [];
    async function search(currentPath) {
        try {
            // Resolve and validate the current path
            const resolvedCurrentPath = await (0, pathUtils_1.resolvePath)(currentPath);
            const entries = await fs.readdir(resolvedCurrentPath, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(currentPath, entry.name);
                try {
                    // Resolve and validate the full path
                    const resolvedFullPath = await (0, pathUtils_1.resolvePath)(fullPath);
                    // Check if path matches any exclude pattern
                    const relativePath = path.relative(rootPath, fullPath);
                    if (shouldExclude(relativePath, excludePatterns)) {
                        continue;
                    }
                    // Check if the entry name matches the pattern
                    if (entry.name.toLowerCase().includes(pattern.toLowerCase())) {
                        results.push(fullPath);
                    }
                    // Recursively search directories
                    if (entry.isDirectory()) {
                        await search(fullPath);
                    }
                }
                catch (error) {
                    // Skip paths we can't access or that are outside allowed directories
                    console.error(`Error processing ${fullPath}: ${error}`);
                }
            }
        }
        catch (error) {
            // Skip directories we can't access
            console.error(`Error accessing ${currentPath}: ${error}`);
        }
    }
    await search(resolvedRootPath);
    return results;
}
/**
 * Execute the file searcher tool
 */
async function execute(input) {
    try {
        const results = await searchFiles(input.path, input.pattern, input.excludePatterns);
        if (results.length === 0) {
            return {
                content: [{ type: 'text', text: 'No matches found' }],
            };
        }
        return {
            content: [{
                    type: 'text',
                    text: results.join('\n')
                }],
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
            content: [{ type: 'text', text: `Error searching files: ${errorMessage}` }],
            isError: true,
        };
    }
}
