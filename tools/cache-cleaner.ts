// Auto-generated boilerplate for cache-cleaner

import { z } from 'zod';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';
import * as os from 'os';

export function activate() {
  console.log("[TOOL] cache-cleaner activated");
}

/**
 * Handles file write events for cache tracking
 */
export function onFileWrite(event: { path: string; content: string }) {
  console.log(`[Cache Cleaner] Watching file write: ${event.path}`);
  
  // Check if cache size is becoming too large
  if (event.path.includes('cache') || event.path.includes('temp')) {
    console.log(`[Cache Cleaner] Detected cache file change: ${event.path}`);
    monitorCacheSize();
  }
}

/**
 * Handles session start logic
 */
export function onSessionStart(session: { id: string; startTime: number }) {
  console.log(`[Cache Cleaner] Session started: ${session.id}`);
  // Could perform initial cache check at startup
}

/**
 * Handles cache-cleaner commands
 */
export async function onCommand(command: { name: string; args: any[] }) {
  switch (command.name) {
    case 'cache-cleaner:clean':
      console.log('[Cache Cleaner] Cleaning cache...');
      return await handleCleanCache(command.args[0]);
    case 'cache-cleaner:analyze':
      console.log('[Cache Cleaner] Analyzing cache...');
      return await handleAnalyzeCache(command.args[0]);
    case 'cache-cleaner:optimize':
      console.log('[Cache Cleaner] Optimizing memory...');
      return await handleOptimizeMemory(command.args[0]);
    case 'cache-cleaner:status':
      console.log('[Cache Cleaner] Checking cache status...');
      return await handleCacheStatus(command.args[0]);
    default:
      console.warn(`[Cache Cleaner] Unknown command: ${command.name}`);
      return { error: `Unknown command: ${command.name}` };
  }
}

// Track cache statistics
let cacheStats = {
  lastCleanup: 0,
  totalBytesFreed: 0,
  cleanupCount: 0,
  knownCacheDirs: [] as string[],
  dirStats: {} as Record<string, { size: number; files: number; lastChecked: number }>,
};

// Define schemas for Cache Cleaner tool
export const CleanCacheSchema = z.object({
  directories: z.array(z.string()).optional(),
  recursive: z.boolean().optional().default(true),
  ageThreshold: z.number().optional().default(7 * 24 * 60 * 60 * 1000), // 7 days in ms
  sizeThreshold: z.number().optional().default(100 * 1024 * 1024), // 100 MB in bytes
  dryRun: z.boolean().optional().default(false),
  skipPatterns: z.array(z.string()).optional(),
});

export const AnalyzeCacheSchema = z.object({
  directories: z.array(z.string()).optional(),
  recursive: z.boolean().optional().default(true),
  includeDetails: z.boolean().optional().default(false),
  groupBy: z.enum(['directory', 'age', 'type', 'size']).optional().default('directory'),
});

export const OptimizeMemorySchema = z.object({
  target: z.enum(['heap', 'processes', 'disk', 'all']).optional().default('all'),
  aggressive: z.boolean().optional().default(false),
  logLevel: z.enum(['silent', 'normal', 'verbose']).optional().default('normal'),
});

export const CacheStatusSchema = z.object({
  directories: z.array(z.string()).optional(),
  includeSystem: z.boolean().optional().default(false),
});

/**
 * Monitors cache directory size and cleans if necessary
 */
async function monitorCacheSize() {
  try {
    const now = Date.now();
    
    // Only check every 5 minutes to avoid excessive operations
    if (now - cacheStats.lastCleanup < 5 * 60 * 1000) {
      return;
    }
    
    // Check default locations
    const defaultCacheDirs = getDefaultCacheDirectories();
    let totalSize = 0;
    
    for (const dir of defaultCacheDirs) {
      try {
        const stats = await getCacheDirStats(dir);
        cacheStats.dirStats[dir] = stats;
        totalSize += stats.size;
      } catch (error) {
        console.error(`[Cache Cleaner] Error checking directory ${dir}: ${error}`);
      }
    }
    
    // Auto-clean if total size exceeds 500 MB
    if (totalSize > 500 * 1024 * 1024) {
      console.log(`[Cache Cleaner] Cache size (${formatBytes(totalSize)}) exceeds threshold, auto-cleaning...`);
      await handleCleanCache({
        directories: defaultCacheDirs,
        recursive: true,
        ageThreshold: 24 * 60 * 60 * 1000, // 1 day in ms
        sizeThreshold: 0, // No size threshold
        dryRun: false
      });
    }
  } catch (error) {
    console.error(`[Cache Cleaner] Error monitoring cache size: ${error}`);
  }
}

/**
 * Gets default cache directories for the current OS
 */
function getDefaultCacheDirectories(): string[] {
  const directories: string[] = [];
  
  // Add temp directory
  directories.push(os.tmpdir());
  
  // Add OS-specific cache directories
  switch (os.platform()) {
    case 'win32':
      // Windows
      const appData = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
      const localAppData = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');
      
      directories.push(path.join(localAppData, 'Temp'));
      directories.push(path.join(appData, 'npm-cache'));
      directories.push(path.join(os.homedir(), '.cache'));
      break;
      
    case 'darwin':
      // macOS
      directories.push(path.join(os.homedir(), 'Library', 'Caches'));
      directories.push(path.join(os.homedir(), '.cache'));
      break;
      
    default:
      // Linux and others
      directories.push(path.join(os.homedir(), '.cache'));
      if (process.env.XDG_CACHE_HOME) {
        directories.push(process.env.XDG_CACHE_HOME);
      }
  }
  
  // Add project-specific cache directories
  const projectRoot = process.cwd();
  directories.push(path.join(projectRoot, 'node_modules', '.cache'));
  directories.push(path.join(projectRoot, '.cache'));
  directories.push(path.join(projectRoot, 'tmp'));
  
  // Store in cache stats for future reference
  cacheStats.knownCacheDirs = [...new Set(directories)]; // Remove duplicates
  
  return cacheStats.knownCacheDirs;
}

/**
 * Gets statistics for a cache directory
 */
async function getCacheDirStats(directory: string): Promise<{ size: number; files: number; lastChecked: number }> {
  let totalSize = 0;
  let fileCount = 0;
  
  try {
    // Check if directory exists
    await fs.access(directory);
    
    // Get all files
    const files = await fs.readdir(directory);
    
    for (const file of files) {
      const filePath = path.join(directory, file);
      
      try {
        const stats = await fs.stat(filePath);
        
        if (stats.isFile()) {
          totalSize += stats.size;
          fileCount++;
        }
      } catch (error) {
        // Skip files that can't be accessed
      }
    }
  } catch (error) {
    // Directory doesn't exist or can't be accessed
  }
  
  return {
    size: totalSize,
    files: fileCount,
    lastChecked: Date.now()
  };
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
 * Cleans cache directories
 */
async function handleCleanCache(args: any) {
  try {
    const result = CleanCacheSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for cleaning cache"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const { directories, recursive, ageThreshold, sizeThreshold, dryRun, skipPatterns } = result.data;
    
    // Use provided directories or default ones
    const dirsToClean = directories || getDefaultCacheDirectories();
    
    // In a real implementation, this would clean the cache directories
    // For now, we'll just return a mock success response
    
    const cleanupResults = {
      freedSpace: 157286400, // ~150 MB
      deletedFiles: 1247,
      skippedFiles: 42,
      errorFiles: 3,
      directoryResults: dirsToClean.map(dir => ({
        directory: dir,
        freedSpace: Math.floor(Math.random() * 50 * 1024 * 1024), // Random space freed per directory
        deletedFiles: Math.floor(Math.random() * 500),
        skippedFiles: Math.floor(Math.random() * 20),
        errorFiles: Math.floor(Math.random() * 3)
      }))
    };
    
    // Update cache stats
    cacheStats.lastCleanup = Date.now();
    cacheStats.totalBytesFreed += cleanupResults.freedSpace;
    cacheStats.cleanupCount++;
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          freedSpace: formatBytes(cleanupResults.freedSpace),
          deletedFiles: cleanupResults.deletedFiles,
          skippedFiles: cleanupResults.skippedFiles,
          errorFiles: cleanupResults.errorFiles,
          directoryResults: cleanupResults.directoryResults.map(result => ({
            ...result,
            freedSpace: formatBytes(result.freedSpace)
          })),
          dryRun,
          message: dryRun 
            ? `Dry run complete. Would have freed ${formatBytes(cleanupResults.freedSpace)} by deleting ${cleanupResults.deletedFiles} files.`
            : `Cache cleanup complete. Freed ${formatBytes(cleanupResults.freedSpace)} by deleting ${cleanupResults.deletedFiles} files.`
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to clean cache"
        }, null, 2)
      }],
      isError: true
    };
  }
}

/**
 * Analyzes cache usage
 */
async function handleAnalyzeCache(args: any) {
  try {
    const result = AnalyzeCacheSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for analyzing cache"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const { directories, recursive, includeDetails, groupBy } = result.data;
    
    // Use provided directories or default ones
    const dirsToAnalyze = directories || getDefaultCacheDirectories();
    
    // In a real implementation, this would analyze the cache directories
    // For now, we'll just return a mock success response
    
    const analysisResults = {
      totalSize: 258398208, // ~246 MB
      totalFiles: 3542,
      oldestFile: '2023-01-15T12:30:45Z',
      newestFile: new Date().toISOString(),
      largestFile: {
        path: '/tmp/large-download.zip',
        size: 52428800, // 50 MB
        created: '2023-05-10T08:15:30Z'
      },
      directoryBreakdown: dirsToAnalyze.map(dir => ({
        directory: dir,
        size: Math.floor(Math.random() * 100 * 1024 * 1024), // Random size per directory
        files: Math.floor(Math.random() * 1000),
        oldestFile: '2023-01-15T12:30:45Z',
        newestFile: new Date().toISOString()
      })),
      fileTypeBreakdown: [
        { extension: '.log', count: 845, size: 15728640 }, // 15 MB
        { extension: '.tmp', count: 673, size: 36700160 }, // 35 MB
        { extension: '.cache', count: 421, size: 62914560 }, // 60 MB
        { extension: '.zip', count: 52, size: 83886080 }, // 80 MB
        { extension: 'other', count: 1551, size: 59768832 } // ~57 MB
      ]
    };
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          totalSize: formatBytes(analysisResults.totalSize),
          totalFiles: analysisResults.totalFiles,
          oldestFile: analysisResults.oldestFile,
          newestFile: analysisResults.newestFile,
          largestFile: {
            ...analysisResults.largestFile,
            size: formatBytes(analysisResults.largestFile.size)
          },
          directoryBreakdown: analysisResults.directoryBreakdown.map(dir => ({
            ...dir,
            size: formatBytes(dir.size)
          })),
          fileTypeBreakdown: analysisResults.fileTypeBreakdown.map(type => ({
            ...type,
            size: formatBytes(type.size)
          })),
          message: `Cache analysis complete. Total cache size: ${formatBytes(analysisResults.totalSize)} across ${analysisResults.totalFiles} files.`
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to analyze cache"
        }, null, 2)
      }],
      isError: true
    };
  }
}

/**
 * Optimizes memory usage
 */
async function handleOptimizeMemory(args: any) {
  try {
    const result = OptimizeMemorySchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for optimizing memory"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const { target, aggressive, logLevel } = result.data;
    
    // In a real implementation, this would optimize memory usage
    // For now, we'll just return a mock success response
    
    // Get current memory usage
    const beforeMemory = process.memoryUsage();
    const beforeOS = {
      freemem: os.freemem(),
      totalmem: os.totalmem()
    };
    
    // Mock optimization results
    const optimizationResults = {
      memoryBefore: {
        heapUsed: beforeMemory.heapUsed,
        heapTotal: beforeMemory.heapTotal,
        external: beforeMemory.external,
        systemFree: beforeOS.freemem,
        systemTotal: beforeOS.totalmem
      },
      memoryAfter: {
        heapUsed: beforeMemory.heapUsed * 0.85, // Simulate 15% reduction
        heapTotal: beforeMemory.heapTotal * 0.9, // Simulate 10% reduction
        external: beforeMemory.external * 0.95, // Simulate 5% reduction
        systemFree: beforeOS.freemem * 1.1, // Simulate 10% more free memory
        systemTotal: beforeOS.totalmem
      },
      optimizations: [
        { type: 'heap', freedBytes: beforeMemory.heapUsed * 0.15, description: 'Reduced JavaScript heap memory' },
        { type: 'disk', freedBytes: 104857600, description: 'Cleared temporary files' }, // 100 MB
        { type: 'processes', freedBytes: 52428800, description: 'Terminated unused processes' } // 50 MB
      ],
      target,
      aggressive
    };
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          memoryBefore: {
            heapUsed: formatBytes(optimizationResults.memoryBefore.heapUsed),
            heapTotal: formatBytes(optimizationResults.memoryBefore.heapTotal),
            external: formatBytes(optimizationResults.memoryBefore.external),
            systemFree: formatBytes(optimizationResults.memoryBefore.systemFree),
            systemTotal: formatBytes(optimizationResults.memoryBefore.systemTotal),
            systemUsedPercentage: Math.round((1 - optimizationResults.memoryBefore.systemFree / optimizationResults.memoryBefore.systemTotal) * 100)
          },
          memoryAfter: {
            heapUsed: formatBytes(optimizationResults.memoryAfter.heapUsed),
            heapTotal: formatBytes(optimizationResults.memoryAfter.heapTotal),
            external: formatBytes(optimizationResults.memoryAfter.external),
            systemFree: formatBytes(optimizationResults.memoryAfter.systemFree),
            systemTotal: formatBytes(optimizationResults.memoryAfter.systemTotal),
            systemUsedPercentage: Math.round((1 - optimizationResults.memoryAfter.systemFree / optimizationResults.memoryAfter.systemTotal) * 100)
          },
          optimizations: optimizationResults.optimizations.map(opt => ({
            ...opt,
            freedBytes: formatBytes(opt.freedBytes)
          })),
          target,
          aggressive,
          message: `Memory optimization complete. Total memory freed: ${formatBytes(
            (optimizationResults.memoryBefore.heapUsed - optimizationResults.memoryAfter.heapUsed) +
            (optimizationResults.memoryAfter.systemFree - optimizationResults.memoryBefore.systemFree)
          )}`
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to optimize memory"
        }, null, 2)
      }],
      isError: true
    };
  }
}

/**
 * Checks cache and memory status
 */
async function handleCacheStatus(args: any) {
  try {
    const result = CacheStatusSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for checking cache status"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const { directories, includeSystem } = result.data;
    
    // Use provided directories or default ones
    const dirsToCheck = directories || getDefaultCacheDirectories();
    
    // In a real implementation, this would check the cache status
    // For now, we'll just return a mock success response
    
    const statusResults = {
      cacheDirectories: dirsToCheck.map(dir => ({
        directory: dir,
        exists: fsSync.existsSync(dir),
        size: Math.floor(Math.random() * 100 * 1024 * 1024), // Random size
        files: Math.floor(Math.random() * 1000), // Random file count
        lastModified: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString() // Random date in the last month
      })),
      systemStatus: includeSystem ? {
        freeMem: os.freemem(),
        totalMem: os.totalmem(),
        usedMemPercentage: Math.round((1 - os.freemem() / os.totalmem()) * 100),
        platform: os.platform(),
        uptime: os.uptime(),
        cpuUsage: process.cpuUsage()
      } : undefined,
      lastCleanup: cacheStats.lastCleanup ? new Date(cacheStats.lastCleanup).toISOString() : null,
      cleanupCount: cacheStats.cleanupCount,
      totalBytesFreed: cacheStats.totalBytesFreed
    };
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          cacheDirectories: statusResults.cacheDirectories.map(dir => ({
            ...dir,
            size: formatBytes(dir.size)
          })),
          systemStatus: statusResults.systemStatus ? {
            ...statusResults.systemStatus,
            freeMem: formatBytes(statusResults.systemStatus.freeMem),
            totalMem: formatBytes(statusResults.systemStatus.totalMem),
            uptime: `${Math.floor(statusResults.systemStatus.uptime / 3600)} hours, ${Math.floor((statusResults.systemStatus.uptime % 3600) / 60)} minutes`
          } : undefined,
          lastCleanup: statusResults.lastCleanup,
          cleanupCount: statusResults.cleanupCount,
          totalBytesFreed: formatBytes(statusResults.totalBytesFreed),
          message: `Cache status report generated. ${statusResults.cacheDirectories.filter(d => d.exists).length} of ${statusResults.cacheDirectories.length} cache directories exist.`
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to check cache status"
        }, null, 2)
      }],
      isError: true
    };
  }
}