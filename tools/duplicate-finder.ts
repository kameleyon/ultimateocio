// Auto-generated boilerplate for duplicate-finder

import { z } from 'zod';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { createReadStream } from 'fs';

export function activate() {
  console.log("[TOOL] duplicate-finder activated");
}

/**
 * Handles file write events to detect potential duplicates
 */
export function onFileWrite(event: { path: string; content: string }) {
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
export function onSessionStart(session: { id: string; startTime: number }) {
  console.log(`[Duplicate Finder] Session started: ${session.id}`);
  // Could initialize state or settings
}

/**
 * Handles duplicate-finder commands
 */
export async function onCommand(command: { name: string; args: any[] }) {
  switch (command.name) {
    case 'duplicate-finder:find':
      console.log('[Duplicate Finder] Finding duplicates...');
      return await handleFindDuplicates(command.args[0]);
    case 'duplicate-finder:scan':
      console.log('[Duplicate Finder] Scanning project...');
      return await handleScanProject(command.args[0]);
    case 'duplicate-finder:analyze':
      console.log('[Duplicate Finder] Analyzing file duplicates...');
      return await handleAnalyzeFile(command.args[0]);
    case 'duplicate-finder:cleanup':
      console.log('[Duplicate Finder] Cleaning up duplicates...');
      return await handleCleanupDuplicates(command.args[0]);
    default:
      console.warn(`[Duplicate Finder] Unknown command: ${command.name}`);
      return { error: `Unknown command: ${command.name}` };
  }
}

// Define schemas for Duplicate Finder tool
export const FindDuplicatesSchema = z.object({
  directories: z.array(z.string()),
  compareBy: z.enum(['content', 'name', 'hash', 'all']).optional().default('content'),
  recursive: z.boolean().optional().default(true),
  minSize: z.number().optional().default(1), // minimum size in bytes
  maxSize: z.number().optional().default(1024 * 1024 * 100), // 100MB maximum size
  includePatterns: z.array(z.string()).optional(),
  excludePatterns: z.array(z.string()).optional(),
  similarityThreshold: z.number().optional().default(1), // 1 means exact match, lower values allow partial matches
  compareContent: z.boolean().optional().default(true),
});

export const ScanProjectSchema = z.object({
  projectPath: z.string(),
  scanType: z.enum(['code', 'assets', 'all']).optional().default('all'),
  reportLevel: z.enum(['summary', 'detailed', 'full']).optional().default('detailed'),
  outputPath: z.string().optional(),
});

export const AnalyzeFileSchema = z.object({
  filePath: z.string(),
  compareAgainst: z.array(z.string()).optional(),
  checkTypes: z.array(
    z.enum(['exact', 'fuzzy', 'code-similarity', 'refactored', 'partial'])
  ).optional().default(['exact']),
});

export const CleanupDuplicatesSchema = z.object({
  duplicatesReport: z.string().optional(),
  directories: z.array(z.string()).optional(),
  action: z.enum(['delete', 'move', 'symlink', 'report']).optional().default('report'),
  targetDirectory: z.string().optional(),
  skipConfirmation: z.boolean().optional().default(false),
  preserveNewest: z.boolean().optional().default(true),
});

/**
 * Calculates hash for a file
 */
async function calculateFileHash(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = createReadStream(filePath);
    
    stream.on('error', err => reject(err));
    stream.on('data', chunk => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
  });
}

/**
 * Finds duplicate files across directories
 */
async function handleFindDuplicates(args: any) {
  try {
    const result = FindDuplicatesSchema.safeParse(args);
    
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
    
    const { 
      directories, 
      compareBy, 
      recursive, 
      minSize, 
      maxSize, 
      includePatterns, 
      excludePatterns,
      similarityThreshold,
      compareContent
    } = result.data;
    
    // Verify directories exist
    for (const dir of directories) {
      try {
        const stats = await fs.stat(dir);
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
      } catch (error) {
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
  } catch (error) {
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
}

/**
 * Formats bytes to a human-readable string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Scans a project for duplicate code and assets
 */
async function handleScanProject(args: any) {
  try {
    const result = ScanProjectSchema.safeParse(args);
    
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
      const stats = await fs.stat(projectPath);
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
    } catch (error) {
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
          message: `Project scan complete. ${scanResults.codeAnalysis?.duplicateCodeBlocks || 0} duplicate code blocks and ${scanResults.assetAnalysis?.duplicateImages || 0} duplicate images found.`
        }, null, 2)
      }]
    };
  } catch (error) {
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
}

/**
 * Analyzes a file to find duplicates or similar files
 */
async function handleAnalyzeFile(args: any) {
  try {
    const result = AnalyzeFileSchema.safeParse(args);
    
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
      await fs.access(filePath);
    } catch (error) {
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
    
    const fileStats = await fs.stat(filePath);
    const fileExt = path.extname(filePath).toLowerCase();
    
    // Mock analysis results
    const analysisResults = {
      file: {
        path: filePath,
        name: path.basename(filePath),
        size: fileStats.size,
        lastModified: fileStats.mtime.toISOString(),
        extension: fileExt,
        hash: await calculateFileHash(filePath)
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
  } catch (error) {
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
}

/**
 * Cleans up duplicate files
 */
async function handleCleanupDuplicates(args: any) {
  try {
    const result = CleanupDuplicatesSchema.safeParse(args);
    
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
        const stats = await fs.stat(targetDirectory);
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
      } catch (error) {
        // Target directory doesn't exist, create it
        try {
          await fs.mkdir(targetDirectory, { recursive: true });
        } catch (mkdirError) {
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
  } catch (error) {
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
}

/**
 * Gets past tense for action verbs
 */
function getActionPastTense(action: string): string {
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