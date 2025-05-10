"use strict";
// Auto-generated boilerplate for refactor-tool
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
exports.AnalyzeCodeSchema = exports.InlineCodeSchema = exports.MoveSymbolSchema = exports.ExtractInterfaceSchema = exports.ExtractMethodSchema = exports.RenameSymbolSchema = void 0;
exports.activate = activate;
exports.onFileWrite = onFileWrite;
exports.onSessionStart = onSessionStart;
exports.onCommand = onCommand;
const zod_1 = require("zod");
const fs = __importStar(require("fs/promises"));
const fsSync = __importStar(require("fs"));
const path = __importStar(require("path"));
const ts = __importStar(require("typescript"));
// In-memory store for refactoring operations
const refactoringHistory = [];
// TypeScript compiler options for parsing
const defaultTsCompilerOptions = {
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.ESNext,
    jsx: ts.JsxEmit.React,
    esModuleInterop: true,
    allowJs: true
};
function activate() {
    console.error("[TOOL] refactor-tool activated");
}
/**
 * Handles file write events
 */
function onFileWrite(event) {
    // No specific handling for file writes
}
/**
 * Handles session start logic
 */
function onSessionStart(session) {
    console.error(`[Refactor Tool] Session started: ${session.id}`);
    // Clear the refactoring history for a new session
    refactoringHistory.length = 0;
}
/**
 * Handles refactor-tool commands
 */
async function onCommand(command) {
    switch (command.name) {
        case 'refactor-tool:rename':
            console.error('[Refactor Tool] Renaming symbol...');
            return await handleRenameSymbol(command.args[0]);
        case 'refactor-tool:extract-method':
            console.error('[Refactor Tool] Extracting method...');
            return await handleExtractMethod(command.args[0]);
        case 'refactor-tool:extract-interface':
            console.error('[Refactor Tool] Extracting interface...');
            return await handleExtractInterface(command.args[0]);
        case 'refactor-tool:move':
            console.error('[Refactor Tool] Moving symbol...');
            return await handleMoveSymbol(command.args[0]);
        case 'refactor-tool:inline':
            console.error('[Refactor Tool] Inlining code...');
            return await handleInlineCode(command.args[0]);
        case 'refactor-tool:analyze':
            console.error('[Refactor Tool] Analyzing refactor opportunities...');
            return await handleAnalyzeCode(command.args[0]);
        default:
            console.warn(`[Refactor Tool] Unknown command: ${command.name}`);
            return { error: `Unknown command: ${command.name}` };
    }
}
// Define schemas for Refactor Tool
exports.RenameSymbolSchema = zod_1.z.object({
    filePath: zod_1.z.string(),
    symbol: zod_1.z.string(),
    newName: zod_1.z.string(),
    isGlobal: zod_1.z.boolean().optional().default(true),
    dryRun: zod_1.z.boolean().optional().default(false),
});
exports.ExtractMethodSchema = zod_1.z.object({
    filePath: zod_1.z.string(),
    startLine: zod_1.z.number(),
    endLine: zod_1.z.number(),
    methodName: zod_1.z.string(),
    visibility: zod_1.z.enum(['public', 'private', 'protected']).optional().default('private'),
    returnType: zod_1.z.string().optional(),
    dryRun: zod_1.z.boolean().optional().default(false),
});
exports.ExtractInterfaceSchema = zod_1.z.object({
    filePath: zod_1.z.string(),
    className: zod_1.z.string(),
    interfaceName: zod_1.z.string(),
    methods: zod_1.z.array(zod_1.z.string()).optional(),
    properties: zod_1.z.array(zod_1.z.string()).optional(),
    outputPath: zod_1.z.string().optional(),
    dryRun: zod_1.z.boolean().optional().default(false),
});
exports.MoveSymbolSchema = zod_1.z.object({
    sourcePath: zod_1.z.string(),
    targetPath: zod_1.z.string(),
    symbol: zod_1.z.string(),
    updateImports: zod_1.z.boolean().optional().default(true),
    dryRun: zod_1.z.boolean().optional().default(false),
});
exports.InlineCodeSchema = zod_1.z.object({
    filePath: zod_1.z.string(),
    targetType: zod_1.z.enum(['variable', 'method', 'function']),
    targetName: zod_1.z.string(),
    dryRun: zod_1.z.boolean().optional().default(false),
});
exports.AnalyzeCodeSchema = zod_1.z.object({
    paths: zod_1.z.array(zod_1.z.string()).optional(),
    path: zod_1.z.string().optional(),
    suggestionTypes: zod_1.z.array(zod_1.z.enum([
        'unused',
        'duplicate',
        'long-methods',
        'complex-conditions',
        'large-classes'
    ])).optional().default(['unused', 'duplicate', 'long-methods']),
});
/**
 * Generate a unique ID for a refactoring operation
 */
function generateOperationId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
}
/**
 * Parse TypeScript file
 */
function parseTypeScriptFile(filePath, content) {
    try {
        // Read file content if not provided
        if (!content) {
            content = fsSync.readFileSync(filePath, 'utf8');
        }
        // Parse the file
        return ts.createSourceFile(filePath, content, defaultTsCompilerOptions.target || ts.ScriptTarget.Latest, true);
    }
    catch (error) {
        console.error(`[Refactor Tool] Error parsing TypeScript file: ${error}`);
        return null;
    }
}
/**
 * Find all occurrences of a symbol in TypeScript file
 */
function findSymbol(sourceFile, symbolName) {
    const occurrences = [];
    function visit(node) {
        if (ts.isIdentifier(node) &&
            node.text === symbolName) {
            occurrences.push(node);
        }
        ts.forEachChild(node, visit);
    }
    visit(sourceFile);
    return occurrences;
}
/**
 * Rename a symbol in TypeScript file
 */
function renameSymbolInFile(filePath, symbolName, newName, dryRun = false) {
    // Read the file
    const content = fsSync.readFileSync(filePath, 'utf8');
    // Parse the file
    const sourceFile = parseTypeScriptFile(filePath, content);
    if (!sourceFile) {
        throw new Error(`Failed to parse file: ${filePath}`);
    }
    // Find all occurrences of the symbol
    const occurrences = findSymbol(sourceFile, symbolName);
    if (occurrences.length === 0) {
        return { content, occurrences: 0 };
    }
    // Sort occurrences by position (descending) to replace from end to start
    occurrences.sort((a, b) => b.getStart() - a.getStart());
    // Replace occurrences
    let newContent = content;
    for (const occurrence of occurrences) {
        const start = occurrence.getStart();
        const end = occurrence.getEnd();
        newContent =
            newContent.substring(0, start) +
                newName +
                newContent.substring(end);
    }
    // Write to file if not dry run
    if (!dryRun && newContent !== content) {
        fsSync.writeFileSync(filePath, newContent, 'utf8');
    }
    return { content: newContent, occurrences: occurrences.length };
}
/**
 * Find all TypeScript/JavaScript files in a directory
 */
async function findTsJsFiles(directory) {
    const files = [];
    async function scanDir(dir) {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                // Skip node_modules and hidden directories
                if (entry.name !== 'node_modules' && !entry.name.startsWith('.')) {
                    await scanDir(fullPath);
                }
            }
            else if (entry.isFile() &&
                (entry.name.endsWith('.ts') ||
                    entry.name.endsWith('.tsx') ||
                    entry.name.endsWith('.js') ||
                    entry.name.endsWith('.jsx'))) {
                files.push(fullPath);
            }
        }
    }
    await scanDir(directory);
    return files;
}
/**
 * Extract a range of lines from a file
 */
function extractLines(content, startLine, endLine) {
    const lines = content.split('\n');
    // Adjust for 0-based array indexing
    return lines.slice(startLine - 1, endLine).join('\n');
}
/**
 * Handles renaming a symbol across files
 */
async function handleRenameSymbol(args) {
    try {
        const result = exports.RenameSymbolSchema.safeParse(args);
        if (!result.success) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: result.error.format(),
                            message: "Invalid arguments for renaming symbol"
                        }, null, 2)
                    }],
                isError: true
            };
        }
        const { filePath, symbol, newName, isGlobal, dryRun } = result.data;
        // Ensure file exists
        if (!fsSync.existsSync(filePath)) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: `File not found: ${filePath}`,
                            message: "Failed to rename symbol"
                        }, null, 2)
                    }],
                isError: true
            };
        }
        // Create refactoring operation
        const operationId = generateOperationId();
        const operation = {
            id: operationId,
            type: 'rename',
            language: filePath.endsWith('.ts') || filePath.endsWith('.tsx') ? 'typescript' : 'javascript',
            files: [filePath],
            timestamp: Date.now(),
            status: 'pending',
            details: {
                symbol,
                newName,
                isGlobal,
                dryRun
            }
        };
        // Add to history
        refactoringHistory.push(operation);
        // If global, find all relevant files
        let filesToProcess = [filePath];
        if (isGlobal) {
            // If the file is in a directory, search for all TS/JS files in that directory
            const directory = path.dirname(filePath);
            filesToProcess = await findTsJsFiles(directory);
        }
        // Process each file
        const results = [];
        let totalOccurrences = 0;
        for (const file of filesToProcess) {
            try {
                const { occurrences } = renameSymbolInFile(file, symbol, newName, dryRun);
                if (occurrences > 0) {
                    results.push({ file, occurrences });
                    totalOccurrences += occurrences;
                    // Add file to operation
                    if (!operation.files.includes(file)) {
                        operation.files.push(file);
                    }
                }
            }
            catch (error) {
                console.error(`[Refactor Tool] Error processing file ${file}:`, error);
                // Update operation with error
                operation.status = 'failed';
                operation.error = String(error);
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: `Error processing file ${file}: ${error}`,
                                message: "Failed to rename symbol"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
        }
        // Update operation status
        operation.status = 'completed';
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        operationId,
                        symbol,
                        newName,
                        totalOccurrences,
                        filesChanged: results.length,
                        dryRun,
                        details: results,
                        message: dryRun
                            ? `Found ${totalOccurrences} occurrences of '${symbol}' in ${results.length} files (dry run)`
                            : `Renamed ${totalOccurrences} occurrences of '${symbol}' to '${newName}' in ${results.length} files`
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
                        message: "Failed to rename symbol"
                    }, null, 2)
                }],
            isError: true
        };
    }
}
// Stub implementations for other handlers
async function handleExtractMethod(args) {
    // Implementation would extract code into a separate method
    return {
        content: [{
                type: "text",
                text: JSON.stringify({
                    message: "Extract method functionality would be implemented here"
                }, null, 2)
            }]
    };
}
async function handleExtractInterface(args) {
    // Implementation would extract an interface from a class
    return {
        content: [{
                type: "text",
                text: JSON.stringify({
                    message: "Extract interface functionality would be implemented here"
                }, null, 2)
            }]
    };
}
async function handleMoveSymbol(args) {
    // Implementation would move a symbol to another file
    return {
        content: [{
                type: "text",
                text: JSON.stringify({
                    message: "Move symbol functionality would be implemented here"
                }, null, 2)
            }]
    };
}
async function handleInlineCode(args) {
    // Implementation would inline variables or methods
    return {
        content: [{
                type: "text",
                text: JSON.stringify({
                    message: "Inline code functionality would be implemented here"
                }, null, 2)
            }]
    };
}
async function handleAnalyzeCode(args) {
    // Implementation would analyze code for refactoring opportunities
    return {
        content: [{
                type: "text",
                text: JSON.stringify({
                    message: "Code analysis functionality would be implemented here"
                }, null, 2)
            }]
    };
}
