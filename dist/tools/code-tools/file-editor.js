"use strict";
// File editor tool implementation
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
exports.outputSchema = exports.inputSchema = exports.EditFileSchema = exports.toolDescription = exports.toolName = void 0;
exports.execute = execute;
const zod_1 = require("zod");
const fs = __importStar(require("fs/promises"));
const diff_1 = require("diff");
const pathUtils_1 = require("../../utils/pathUtils");
exports.toolName = 'file-editor';
exports.toolDescription = 'Edit files with advanced pattern matching and formatting';
// Schema for edit operations
const EditOperation = zod_1.z.object({
    oldText: zod_1.z.string().describe('Text to search for - must match exactly'),
    newText: zod_1.z.string().describe('Text to replace with'),
});
// Schema for edit file
exports.EditFileSchema = zod_1.z.object({
    path: zod_1.z.string().describe('Path to the file to edit'),
    edits: zod_1.z.array(EditOperation).describe('List of edit operations to perform'),
    dryRun: zod_1.z.boolean().optional().default(false).describe('Preview changes without applying them'),
});
// Input schema for the tool
exports.inputSchema = exports.EditFileSchema;
// Output schema for the tool
exports.outputSchema = zod_1.z.object({
    content: zod_1.z.array(zod_1.z.object({
        type: zod_1.z.literal('text'),
        text: zod_1.z.string(),
    })),
    isError: zod_1.z.boolean().optional(),
});
/**
 * Normalize line endings to \n
 */
function normalizeLineEndings(text) {
    return text.replace(/\r\n/g, '\n');
}
/**
 * Create a unified diff between original and new content
 */
function createUnifiedDiff(originalContent, newContent, filepath = 'file') {
    // Ensure consistent line endings for diff
    const normalizedOriginal = normalizeLineEndings(originalContent);
    const normalizedNew = normalizeLineEndings(newContent);
    return (0, diff_1.createTwoFilesPatch)(filepath, filepath, normalizedOriginal, normalizedNew, 'original', 'modified');
}
/**
 * Apply edits to a file
 */
async function applyFileEdits(filePath, edits, dryRun = false) {
    // Resolve and validate the path
    const resolvedPath = await (0, pathUtils_1.resolvePath)(filePath);
    // Check if path exists
    if (!(await (0, pathUtils_1.pathExists)(resolvedPath))) {
        throw new Error(`File does not exist: ${filePath}`);
    }
    // Read file content and normalize line endings
    const content = normalizeLineEndings(await fs.readFile(resolvedPath, 'utf-8'));
    // Apply edits sequentially
    let modifiedContent = content;
    for (const edit of edits) {
        const normalizedOld = normalizeLineEndings(edit.oldText);
        const normalizedNew = normalizeLineEndings(edit.newText);
        // If exact match exists, use it
        if (modifiedContent.includes(normalizedOld)) {
            modifiedContent = modifiedContent.replace(normalizedOld, normalizedNew);
            continue;
        }
        // Otherwise, try line-by-line matching with flexibility for whitespace
        const oldLines = normalizedOld.split('\n');
        const contentLines = modifiedContent.split('\n');
        let matchFound = false;
        for (let i = 0; i <= contentLines.length - oldLines.length; i++) {
            const potentialMatch = contentLines.slice(i, i + oldLines.length);
            // Compare lines with normalized whitespace
            const isMatch = oldLines.every((oldLine, j) => {
                const contentLine = potentialMatch[j];
                return oldLine.trim() === contentLine.trim();
            });
            if (isMatch) {
                // Preserve original indentation of first line
                const originalIndent = contentLines[i].match(/^\s*/)?.[0] || '';
                const newLines = normalizedNew.split('\n').map((line, j) => {
                    if (j === 0)
                        return originalIndent + line.trimStart();
                    // For subsequent lines, try to preserve relative indentation
                    const oldIndent = oldLines[j]?.match(/^\s*/)?.[0] || '';
                    const newIndent = line.match(/^\s*/)?.[0] || '';
                    if (oldIndent && newIndent) {
                        const relativeIndent = newIndent.length - oldIndent.length;
                        return originalIndent + ' '.repeat(Math.max(0, relativeIndent)) + line.trimStart();
                    }
                    return line;
                });
                contentLines.splice(i, oldLines.length, ...newLines);
                modifiedContent = contentLines.join('\n');
                matchFound = true;
                break;
            }
        }
        if (!matchFound) {
            throw new Error(`Could not find exact match for edit:\n${edit.oldText}`);
        }
    }
    // Create unified diff
    const diff = createUnifiedDiff(content, modifiedContent, filePath);
    // Format diff with appropriate number of backticks
    let numBackticks = 3;
    while (diff.includes('`'.repeat(numBackticks))) {
        numBackticks++;
    }
    const formattedDiff = `${'`'.repeat(numBackticks)}diff\n${diff}${'`'.repeat(numBackticks)}\n\n`;
    if (!dryRun) {
        await fs.writeFile(resolvedPath, modifiedContent, 'utf-8');
    }
    return formattedDiff;
}
/**
 * Execute the file editor tool
 */
async function execute(input) {
    try {
        const result = await applyFileEdits(input.path, input.edits, input.dryRun);
        const actionType = input.dryRun ? 'Preview of changes' : 'Applied changes';
        return {
            content: [{
                    type: 'text',
                    text: `${actionType} to ${input.path}:\n\n${result}`
                }],
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
            content: [{ type: 'text', text: `Error editing file: ${errorMessage}` }],
            isError: true,
        };
    }
}
