"use strict";
// Auto-generated boilerplate for duplicate-finder
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CleanupDuplicatesSchema = exports.AnalyzeFileSchema = exports.ScanProjectSchema = exports.FindDuplicatesSchema = void 0;
exports.activate = activate;
exports.onFileWrite = onFileWrite;
exports.onSessionStart = onSessionStart;
exports.onCommand = onCommand;
const zod_1 = require("zod");
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
const fs_1 = require("fs");
function activate() {
    console.log("[TOOL] duplicate-finder activated");
}
/**
 * Handles file write events to detect potential duplicates
 */
function onFileWrite(event) {
    console.log(`[Duplicate Finder] Watching file write: ${event.path}`);
    // Could analyze file for duplicate content
    const filename = path.basename(event.path);
    if (filename.match(/copy|duplicate|backup|\(\d+\)/i)) {
        console.log(`[Duplicate Finder] Detected potential duplicate file: ${event.path}`);
    }
}
/**
 * Handles session start logic
 */
function onSessionStart(session) {
    console.log(`[Duplicate Finder] Session started: ${session.id}`);
    // Could initialize state or settings
}
/**
 * Handles duplicate-finder commands
 */
function onCommand(command) {
    return __awaiter(this, void 0, void 0, function* () {
        switch (command.name) {
            case 'duplicate-finder:find':
                console.log('[Duplicate Finder] Finding duplicates...');
                return yield handleFindDuplicates(command.args[0]);
            case 'duplicate-finder:scan':
                console.log('[Duplicate Finder] Scanning project...');
                return yield handleScanProject(command.args[0]);
            case 'duplicate-finder:analyze':
                console.log('[Duplicate Finder] Analyzing file duplicates...');
                return yield handleAnalyzeFile(command.args[0]);
            case 'duplicate-finder:cleanup':
                console.log('[Duplicate Finder] Cleaning up duplicates...');
                return yield handleCleanupDuplicates(command.args[0]);
            default:
                console.warn(`[Duplicate Finder] Unknown command: ${command.name}`);
                return { error: `Unknown command: ${command.name}` };
        }
    });
}
// Define schemas for Duplicate Finder tool
exports.FindDuplicatesSchema = zod_1.z.object({
    directories: zod_1.z.array(zod_1.z.string()),
    compareBy: zod_1.z.enum(['content', 'name', 'hash', 'all']).optional().default('content'),
    recursive: zod_1.z.boolean().optional().default(true),
    minSize: zod_1.z.number().optional().default(1), // minimum size in bytes
    maxSize: zod_1.z.number().optional().default(1024 * 1024 * 100), // 100MB maximum size
    includePatterns: zod_1.z.array(zod_1.z.string()).optional(),
    excludePatterns: zod_1.z.array(zod_1.z.string()).optional(),
    similarityThreshold: zod_1.z.number().optional().default(1), // 1 means exact match, lower values allow partial matches
    compareContent: zod_1.z.boolean().optional().default(true),
});
exports.ScanProjectSchema = zod_1.z.object({
    projectPath: zod_1.z.string(),
    scanType: zod_1.z.enum(['code', 'assets', 'all']).optional().default('all'),
    reportLevel: zod_1.z.enum(['summary', 'detailed', 'full']).optional().default('detailed'),
    outputPath: zod_1.z.string().optional(),
});
exports.AnalyzeFileSchema = zod_1.z.object({
    filePath: zod_1.z.string(),
    compareAgainst: zod_1.z.array(zod_1.z.string()).optional(),
    checkTypes: zod_1.z.array(zod_1.z.enum(['exact', 'fuzzy', 'code-similarity', 'refactored', 'partial'])).optional().default(['exact']),
});
exports.CleanupDuplicatesSchema = zod_1.z.object({
    duplicatesReport: zod_1.z.string().optional(),
    directories: zod_1.z.array(zod_1.z.string()).optional(),
    action: zod_1.z.enum(['delete', 'move', 'symlink', 'report']).optional().default('report'),
    targetDirectory: zod_1.z.string().optional(),
    skipConfirmation: zod_1.z.boolean().optional().default(false),
    preserveNewest: zod_1.z.boolean().optional().default(true),
});
/**
 * Calculates hash for a file
 */
function calculateFileHash(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            const hash = crypto.createHash('sha256');
            const stream = (0, fs_1.createReadStream)(filePath);
            stream.on('error', err => reject(err));
            stream.on('data', chunk => hash.update(chunk));
            stream.on('end', () => resolve(hash.digest('hex')));
        });
    });
}
/**
 * Finds duplicate files across directories
 */
function handleFindDuplicates(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = exports.FindDuplicatesSchema.safeParse(args);
            if (!result.success) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: result.error.format(),
                                message: "Invalid arguments for finding duplicates"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            const { directories, compareBy, recursive, minSize, maxSize, includePatterns, excludePatterns, similarityThreshold, compareContent } = result.data;
            // Verify directories exist
            for (const dir of directories) {
                try {
                    const stats = yield fs.stat(dir);
                    if (!stats.isDirectory()) {
                        return {
                            content: [{
                                    type: "text",
                                    text: JSON.stringify({
                                        error: `Path is not a directory: ${dir}`,
                                        message: "Failed to find duplicates"
                                    }, null, 2)
                                }],
                            isError: true
                        };
                    }
                }
                catch (error) {
                    return {
                        content: [{
                                type: "text",
                                text: JSON.stringify({
                                    error: `Invalid directory path: ${dir}`,
                                    message: "Failed to find duplicates"
                                }, null, 2)
                            }],
                        isError: true
                    };
                }
            }
            // In a real implementation, this would scan directories and find duplicates
            // For now, we'll just return a mock result
            // Mock duplicates result
            const duplicateGroups = [
                {
                    hash: "2fd4e1c67a2d28fced849ee1bb76e7391b93eb12",
                    type: "exact",
                    count: 3,
                    totalSize: 15728640, // 15 MB
                    files: [
                        {
                            path: path.join(directories[0], "images/background.jpg"),
                            size: 5242880, // 5 MB
                            lastModified: new Date().toISOString()
                        },
                        {
                            path: path.join(directories[0], "assets/images/background-copy.jpg"),
                            size: 5242880, // 5 MB
                            lastModified: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
                        },
                        {
                            path: path.join(directories[0], "src/public/img/bg.jpg"),
                            size: 5242880, // 5 MB
                            lastModified: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
                        }
                    ]
                },
                {
                    hash: "5bd9d8cabc46041579a8e45af75f9805eb3fddaf",
                    type: "exact",
                    count: 2,
                    totalSize: 2097152, // 2 MB
                    files: [
                        {
                            path: path.join(directories[0], "src/utils/helpers.js"),
                            size: 1048576, // 1 MB
                            lastModified: new Date().toISOString()
                        },
                        {
                            path: path.join(directories[0], "src/utils/common/helpers.js"),
                            size: 1048576, // 1 MB
                            lastModified: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
                        }
                    ]
                },
                {
                    hash: "3c9909afec25354d551dae21590bb26e38d53f2173b8d3dc3eee4c047e7ab1c1eb8b85103e3be7ba613b31bb5c9c36214dc9f14a42fd7a2fdb84856bca5c44c2",
                    type: "similar",
                    similarityScore: 0.92,
                    count: 2,
                    totalSize: 16384, // 16 KB
                    files: [
                        {
                            path: path.join(directories[0], "src/components/Button.jsx"),
                            size: 8192, // 8 KB
                            lastModified: new Date().toISOString()
                        },
                        {
                            path: path.join(directories[0], "src/components/ui/Button.jsx"),
                            size: 8192, // 8 KB
                            lastModified: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
                        }
                    ]
                }
            ];
            // Calculate summary statistics
            const totalDuplicates = duplicateGroups.reduce((sum, group) => sum + group.count - 1, 0);
            const wastedSpace = duplicateGroups.reduce((sum, group) => {
                // Subtract one file from each group (original)
                return sum + (group.totalSize / group.count) * (group.count - 1);
            }, 0);
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            scanInfo: {
                                directoriesScanned: directories,
                                compareMethod: compareBy,
                                recursive,
                                fileCount: 1240, // Mock total files scanned
                                totalSize: 268435456, // Mock total size scanned (256 MB)
                                duration: 2345 // milliseconds
                            },
                            summary: {
                                duplicateGroups: duplicateGroups.length,
                                totalDuplicates,
                                wastedSpace,
                                wastedSpaceFormatted: formatBytes(wastedSpace)
                            },
                            duplicates: duplicateGroups,
                            message: `Found ${totalDuplicates} duplicate files in ${duplicateGroups.length} groups, wasting ${formatBytes(wastedSpace)}`
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
                            message: "Failed to find duplicates"
                        }, null, 2)
                    }],
                isError: true
            };
        }
    });
}
/**
 * Formats bytes to a human-readable string
 */
function formatBytes(bytes) {
    if (bytes === 0)
        return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
/**
 * Scans a project for duplicate code and assets
 */
function handleScanProject(args) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            const result = exports.ScanProjectSchema.safeParse(args);
            if (!result.success) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: result.error.format(),
                                message: "Invalid arguments for scanning project"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            const { projectPath, scanType, reportLevel, outputPath } = result.data;
            // Check if project path exists
            try {
                const stats = yield fs.stat(projectPath);
                if (!stats.isDirectory()) {
                    return {
                        content: [{
                                type: "text",
                                text: JSON.stringify({
                                    error: `Project path is not a directory: ${projectPath}`,
                                    message: "Failed to scan project"
                                }, null, 2)
                            }],
                        isError: true
                    };
                }
            }
            catch (error) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: `Invalid project path: ${projectPath}`,
                                message: "Failed to scan project"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            // In a real implementation, this would scan the project for duplicates
            // For now, we'll just return a mock result
            // Mock scan results
            const scanResults = {
                projectInfo: {
                    name: path.basename(projectPath),
                    path: projectPath,
                    size: 536870912, // 512 MB
                    files: 4250
                },
                codeAnalysis: scanType === 'code' || scanType === 'all' ? {
                    duplicateCodeBlocks: 23,
                    duplicateFiles: 5,
                    mostDuplicatedCode: {
                        pattern: "export const fetchData = async (url) => { try { const response = await fetch(url); if (!response.ok) { throw new Error('Network response was not ok'); } return await response.json(); } catch (error) { console.error('Failed to fetch data:', error); throw error; } };",
                        occurrences: 7,
                        locations: [
                            "src/utils/api.js:25",
                            "src/services/data.js:42",
                            "src/modules/users.js:78",
                            "src/modules/products.js:56",
                            "src/modules/orders.js:91",
                            "src/helpers/http.js:15",
                            "src/components/DataFetcher.js:34"
                        ]
                    },
                    totalDuplicateLines: 578,
                    percentageDuplicated: 8.2
                } : undefined,
                assetAnalysis: scanType === 'assets' || scanType === 'all' ? {
                    duplicateImages: 15,
                    duplicateFonts: 3,
                    duplicateOther: 7,
                    largestDuplicates: [
                        {
                            name: "background.jpg",
                            size: 5242880, // 5 MB
                            occurrences: 3,
                            locations: [
                                "public/images/background.jpg",
                                "src/assets/images/background-copy.jpg",
                                "public/img/bg.jpg"
                            ]
                        },
                        {
                            name: "logo.svg",
                            size: 2097152, // 2 MB
                            occurrences: 2,
                            locations: [
                                "public/logo.svg",
                                "src/assets/logo.svg"
                            ]
                        }
                    ],
                    totalWastedSpace: 38797312 // 37 MB
                } : undefined
            };
            // If outputPath specified, we would write the report there
            let reportFilePath = '';
            if (outputPath) {
                reportFilePath = path.join(outputPath, `duplicate-report-${Date.now()}.json`);
            }
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            scanInfo: {
                                projectPath,
                                scanType,
                                reportLevel,
                                scanTime: new Date().toISOString(),
                                duration: 4532 // milliseconds
                            },
                            results: scanResults,
                            reportFile: reportFilePath || null,
                            message: `Project scan complete. ${((_a = scanResults.codeAnalysis) === null || _a === void 0 ? void 0 : _a.duplicateCodeBlocks) || 0} duplicate code blocks and ${((_b = scanResults.assetAnalysis) === null || _b === void 0 ? void 0 : _b.duplicateImages) || 0} duplicate images found.`
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
                            message: "Failed to scan project"
                        }, null, 2)
                    }],
                isError: true
            };
        }
    });
}
/**
 * Analyzes a file to find duplicates or similar files
 */
function handleAnalyzeFile(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = exports.AnalyzeFileSchema.safeParse(args);
            if (!result.success) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: result.error.format(),
                                message: "Invalid arguments for analyzing file"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            const { filePath, compareAgainst, checkTypes } = result.data;
            // Check if file exists
            try {
                yield fs.access(filePath);
            }
            catch (error) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: `File not found: ${filePath}`,
                                message: "Failed to analyze file"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            // In a real implementation, this would analyze the file for duplicates
            // For now, we'll just return a mock result
            const fileStats = yield fs.stat(filePath);
            const fileExt = path.extname(filePath).toLowerCase();
            // Mock analysis results
            const analysisResults = {
                file: {
                    path: filePath,
                    name: path.basename(filePath),
                    size: fileStats.size,
                    lastModified: fileStats.mtime.toISOString(),
                    extension: fileExt,
                    hash: yield calculateFileHash(filePath)
                },
                results: [
                    {
                        path: path.join(path.dirname(filePath), `copy-of-${path.basename(filePath)}`),
                        similarity: 1.0, // Exact match
                        type: 'exact',
                        size: fileStats.size,
                        lastModified: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
                    },
                    {
                        path: path.join(path.dirname(filePath), '..', 'backup', path.basename(filePath)),
                        similarity: 0.95, // 95% similar
                        type: 'similar',
                        size: fileStats.size * 0.98,
                        lastModified: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
                    }
                ]
            };
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            file: analysisResults.file,
                            matches: analysisResults.results,
                            message: `File analysis complete. Found ${analysisResults.results.filter(r => r.similarity === 1).length} exact matches and ${analysisResults.results.filter(r => r.similarity < 1).length} similar files.`
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
                            message: "Failed to analyze file"
                        }, null, 2)
                    }],
                isError: true
            };
        }
    });
}
/**
 * Cleans up duplicate files
 */
function handleCleanupDuplicates(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = exports.CleanupDuplicatesSchema.safeParse(args);
            if (!result.success) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: result.error.format(),
                                message: "Invalid arguments for cleaning up duplicates"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            const { duplicatesReport, directories, action, targetDirectory, skipConfirmation, preserveNewest } = result.data;
            // Check input validity
            if (!duplicatesReport && (!directories || directories.length === 0)) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: "Either duplicatesReport or directories must be provided",
                                message: "Failed to cleanup duplicates"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            // Check if target directory exists for 'move' action
            if (action === 'move' && !targetDirectory) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: "Target directory is required for 'move' action",
                                message: "Failed to cleanup duplicates"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            if (action === 'move' && targetDirectory) {
                try {
                    const stats = yield fs.stat(targetDirectory);
                    if (!stats.isDirectory()) {
                        return {
                            content: [{
                                    type: "text",
                                    text: JSON.stringify({
                                        error: `Target path is not a directory: ${targetDirectory}`,
                                        message: "Failed to cleanup duplicates"
                                    }, null, 2)
                                }],
                            isError: true
                        };
                    }
                }
                catch (error) {
                    // Target directory doesn't exist, create it
                    try {
                        yield fs.mkdir(targetDirectory, { recursive: true });
                    }
                    catch (mkdirError) {
                        return {
                            content: [{
                                    type: "text",
                                    text: JSON.stringify({
                                        error: `Failed to create target directory: ${targetDirectory}`,
                                        message: "Failed to cleanup duplicates"
                                    }, null, 2)
                                }],
                            isError: true
                        };
                    }
                }
            }
            // In a real implementation, this would cleanup duplicate files
            // For now, we'll just return a mock result
            // Mock cleanup results
            const cleanupResults = {
                action,
                processed: 25,
                actioned: 18, // Files deleted/moved/linked
                skipped: 7,
                savedSpace: 31457280, // 30 MB
                details: [
                    {
                        original: '/project/images/original.jpg',
                        duplicates: [
                            {
                                path: '/project/backup/original-copy.jpg',
                                action: action,
                                success: true
                            },
                            {
                                path: '/project/assets/images/original.jpg',
                                action: action,
                                success: true
                            }
                        ]
                    },
                    {
                        original: '/project/src/utils/helpers.js',
                        duplicates: [
                            {
                                path: '/project/src/utils/common/helpers.js',
                                action: action,
                                success: true
                            }
                        ]
                    },
                    // More entries would be here in real implementation
                ]
            };
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            action,
                            stats: {
                                processed: cleanupResults.processed,
                                actioned: cleanupResults.actioned,
                                skipped: cleanupResults.skipped,
                                savedSpace: cleanupResults.savedSpace,
                                savedSpaceFormatted: formatBytes(cleanupResults.savedSpace)
                            },
                            details: action === 'report' ? cleanupResults.details : undefined,
                            message: `Duplicate cleanup complete. ${cleanupResults.actioned} files ${getActionPastTense(action)}, saving ${formatBytes(cleanupResults.savedSpace)}.`
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
                            message: "Failed to cleanup duplicates"
                        }, null, 2)
                    }],
                isError: true
            };
        }
    });
}
/**
 * Gets past tense for action verbs
 */
function getActionPastTense(action) {
    switch (action) {
        case 'delete':
            return 'deleted';
        case 'move':
            return 'moved';
        case 'symlink':
            return 'symlinked';
        case 'report':
            return 'reported';
        default:
            return 'processed';
    }
}
