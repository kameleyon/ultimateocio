// Auto-generated boilerplate for metadata-reader

import { z } from 'zod';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// Supported file types for metadata extraction
const fileTypeExtensions: Record<string, string[]> = {
  image: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.tif', '.svg'],
  audio: ['.mp3', '.wav', '.ogg', '.flac', '.aac', '.m4a'],
  video: ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.flv'],
  document: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.odt', '.ods', '.odp'],
  code: ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.c', '.cpp', '.cs', '.go', '.rb', '.php', '.html', '.css', '.scss'],
  archive: ['.zip', '.rar', '.tar', '.gz', '.7z'],
  text: ['.txt', '.md', '.json', '.yaml', '.yml', '.xml', '.csv']
};

// Metadata extractor tools
type ExternalTools = {
  exiftool: boolean;
  imagemagick: boolean;
  ffmpeg: boolean;
};

// Check for external tools availability
let externalTools: ExternalTools = {
  exiftool: false,
  imagemagick: false,
  ffmpeg: false
};

export function activate() {
  console.log("[TOOL] metadata-reader activated");
  
  // Check for external tools
  checkExternalTools();
}

/**
 * Check for external tools availability
 */
function checkExternalTools() {
  // Check for exiftool
  try {
    execSync('exiftool -ver', { stdio: 'ignore' });
    externalTools.exiftool = true;
    console.log('[Metadata Reader] ExifTool is available');
  } catch (err) {
    console.log('[Metadata Reader] ExifTool is not available');
  }
  
  // Check for ImageMagick
  try {
    execSync('convert -version', { stdio: 'ignore' });
    externalTools.imagemagick = true;
    console.log('[Metadata Reader] ImageMagick is available');
  } catch (err) {
    console.log('[Metadata Reader] ImageMagick is not available');
  }
  
  // Check for ffmpeg
  try {
    execSync('ffmpeg -version', { stdio: 'ignore' });
    externalTools.ffmpeg = true;
    console.log('[Metadata Reader] FFmpeg is available');
  } catch (err) {
    console.log('[Metadata Reader] FFmpeg is not available');
  }
}

/**
 * Handles file write events to extract metadata from new files
 */
export function onFileWrite(event: { path: string; content: string }) {
  // We don't process file writes directly because this tool reads metadata
  // rather than modifying files.
}

/**
 * Handles session start logic
 */
export function onSessionStart(session: { id: string; startTime: number }) {
  console.log(`[Metadata Reader] Session started: ${session.id}`);
}

/**
 * Handles metadata-reader commands
 */
export async function onCommand(command: { name: string; args: any[] }) {
  switch (command.name) {
    case 'metadata-reader:read':
      console.log('[Metadata Reader] Reading metadata...');
      return await handleReadMetadata(command.args[0]);
    case 'metadata-reader:extract':
      console.log('[Metadata Reader] Extracting metadata...');
      return await handleExtractMetadata(command.args[0]);
    case 'metadata-reader:batch':
      console.log('[Metadata Reader] Batch processing metadata...');
      return await handleBatchProcess(command.args[0]);
    case 'metadata-reader:parse':
      console.log('[Metadata Reader] Parsing file content...');
      return await handleParseFileContent(command.args[0]);
    default:
      console.warn(`[Metadata Reader] Unknown command: ${command.name}`);
      return { error: `Unknown command: ${command.name}` };
  }
}

// Define schemas for Metadata Reader tool
export const ReadMetadataSchema = z.object({
  path: z.string(),
  type: z.enum(['auto', 'file', 'image', 'audio', 'video', 'document', 'code', 'archive'])
    .optional().default('auto'),
  includeBasic: z.boolean().optional().default(true),
  includeExtended: z.boolean().optional().default(false),
});

export const ExtractMetadataSchema = z.object({
  path: z.string(),
  options: z.object({
    extractExif: z.boolean().optional().default(true),
    extractContent: z.boolean().optional().default(false),
    extractTags: z.boolean().optional().default(true),
    extractDimensions: z.boolean().optional().default(true),
    extractDuration: z.boolean().optional().default(true),
  }).optional().default({}),
  useExternalTools: z.boolean().optional().default(true),
});

export const BatchProcessSchema = z.object({
  directory: z.string(),
  recursive: z.boolean().optional().default(false),
  pattern: z.string().optional(),
  outputFormat: z.enum(['json', 'csv']).optional().default('json'),
  outputPath: z.string().optional(),
});

export const ParseFileContentSchema = z.object({
  path: z.string(),
  format: z.enum(['auto', 'json', 'yaml', 'xml', 'csv', 'toml', 'ini', 'markdown'])
    .optional().default('auto'),
  extractStructure: z.boolean().optional().default(true),
  extractLinks: z.boolean().optional().default(false),
  extractHeadings: z.boolean().optional().default(false),
});

/**
 * Gets a file's type by examining its extension
 */
function getFileType(filePath: string): string {
  const extension = path.extname(filePath).toLowerCase();
  
  for (const [type, extensions] of Object.entries(fileTypeExtensions)) {
    if (extensions.includes(extension)) {
      return type;
    }
  }
  
  return 'unknown';
}

/**
 * Gets basic file system metadata
 */
async function getBasicMetadata(filePath: string): Promise<Record<string, any>> {
  try {
    const stats = await fs.stat(filePath);
    
    return {
      path: filePath,
      name: path.basename(filePath),
      directory: path.dirname(filePath),
      extension: path.extname(filePath),
      size: stats.size,
      sizeFormatted: formatBytes(stats.size),
      created: stats.birthtime,
      modified: stats.mtime,
      accessed: stats.atime,
      isFile: stats.isFile(),
      isDirectory: stats.isDirectory(),
      isSymlink: stats.isSymbolicLink()
    };
  } catch (error) {
    throw new Error(`Failed to get basic metadata: ${error}`);
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
 * Extract extended metadata based on file type
 */
async function getExtendedMetadata(
  filePath: string, 
  type: string, 
  useExternalTools: boolean = true
): Promise<Record<string, any>> {
  const metadata: Record<string, any> = {};
  
  try {
    if (type === 'image') {
      if (useExternalTools && externalTools.exiftool) {
        try {
          const exifData = execSync(`exiftool -j "${filePath}"`, { encoding: 'utf8' });
          const parsedExif = JSON.parse(exifData);
          
          if (parsedExif && parsedExif.length > 0) {
            metadata.exif = parsedExif[0];
          }
        } catch (err) {
          console.warn(`[Metadata Reader] ExifTool extraction failed: ${err}`);
        }
      }
      
      if (useExternalTools && externalTools.imagemagick) {
        try {
          const imageMagickData = execSync(`identify -format "%[width]x%[height] %[colorspace] %m" "${filePath}"`, { encoding: 'utf8' });
          const [dimensions, colorspace, format] = imageMagickData.trim().split(' ');
          const [width, height] = dimensions.split('x').map(Number);
          
          metadata.dimensions = { width, height };
          metadata.colorspace = colorspace;
          metadata.format = format;
        } catch (err) {
          console.warn(`[Metadata Reader] ImageMagick extraction failed: ${err}`);
        }
      }
    } else if (type === 'audio' || type === 'video') {
      if (useExternalTools && externalTools.ffmpeg) {
        try {
          const ffmpegData = execSync(`ffprobe -v quiet -print_format json -show_format -show_streams "${filePath}"`, { encoding: 'utf8' });
          const parsed = JSON.parse(ffmpegData);
          
          if (parsed) {
            metadata.format = parsed.format;
            metadata.streams = parsed.streams;
            
            if (parsed.format && parsed.format.duration) {
              metadata.duration = parseFloat(parsed.format.duration);
              metadata.durationFormatted = formatDuration(metadata.duration);
            }
          }
        } catch (err) {
          console.warn(`[Metadata Reader] FFmpeg extraction failed: ${err}`);
        }
      }
    } else if (type === 'code' || type === 'text') {
      // For code files, extract some basic info
      const content = await fs.readFile(filePath, 'utf8');
      const lines = content.split('\n');
      
      metadata.lines = lines.length;
      metadata.characters = content.length;
      metadata.isEmpty = content.trim().length === 0;
      
      // Extract language-specific metadata
      const extension = path.extname(filePath).toLowerCase();
      
      if (['.js', '.ts', '.jsx', '.tsx'].includes(extension)) {
        metadata.imports = extractImports(content, 'javascript');
        metadata.exports = extractExports(content, 'javascript');
        metadata.functions = countFunctions(content, 'javascript');
      } else if (['.py'].includes(extension)) {
        metadata.imports = extractImports(content, 'python');
        metadata.functions = countFunctions(content, 'python');
        metadata.classes = countClasses(content, 'python');
      } else if (['.java'].includes(extension)) {
        metadata.imports = extractImports(content, 'java');
        metadata.classes = countClasses(content, 'java');
        metadata.methods = countFunctions(content, 'java');
      }
    } else if (type === 'document') {
      // For document files, we just note the type
      // Full text extraction would require specific libraries
      const extension = path.extname(filePath).toLowerCase();
      
      if (extension === '.pdf') {
        metadata.documentType = 'PDF';
      } else if (['.doc', '.docx'].includes(extension)) {
        metadata.documentType = 'Word Document';
      } else if (['.xls', '.xlsx'].includes(extension)) {
        metadata.documentType = 'Excel Spreadsheet';
      } else if (['.ppt', '.pptx'].includes(extension)) {
        metadata.documentType = 'PowerPoint Presentation';
      }
    }
  } catch (error) {
    console.error(`[Metadata Reader] Error extracting extended metadata: ${error}`);
  }
  
  return metadata;
}

/**
 * Formats duration in seconds to a human-readable string
 */
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}

/**
 * Extract import statements from code
 */
function extractImports(content: string, language: string): string[] {
  const imports: string[] = [];
  
  if (language === 'javascript') {
    // Match import statements
    const importPattern = /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s+from\s+)?['"]([^'"]+)['"]/g;
    let match;
    
    while ((match = importPattern.exec(content)) !== null) {
      imports.push(match[1]);
    }
    
    // Match require statements
    const requirePattern = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
    
    while ((match = requirePattern.exec(content)) !== null) {
      imports.push(match[1]);
    }
  } else if (language === 'python') {
    // Match import statements
    const importPattern = /(?:from\s+([\w.]+)\s+import\s+(?:[\w, ]+|\*)|import\s+([\w.]+))/g;
    let match;
    
    while ((match = importPattern.exec(content)) !== null) {
      imports.push(match[1] || match[2]);
    }
  } else if (language === 'java') {
    // Match import statements
    const importPattern = /import\s+(?:static\s+)?([\w.]+)(?:\s*;\s*|$)/g;
    let match;
    
    while ((match = importPattern.exec(content)) !== null) {
      imports.push(match[1]);
    }
  }
  
  return imports;
}

/**
 * Extract export statements from code
 */
function extractExports(content: string, language: string): string[] {
  const exports: string[] = [];
  
  if (language === 'javascript') {
    // Match export statements
    const exportPattern = /export\s+(?:default\s+)?(?:const|let|var|function|class|interface)?\s+(\w+)/g;
    let match;
    
    while ((match = exportPattern.exec(content)) !== null) {
      exports.push(match[1]);
    }
    
    // Match module.exports
    const moduleExportsPattern = /module\.exports\s*=\s*(?:(\w+)|{([^}]*)})*/g;
    
    while ((match = moduleExportsPattern.exec(content)) !== null) {
      if (match[1]) {
        // Single export
        exports.push(match[1]);
      } else if (match[2]) {
        // Object export
        const properties = match[2].split(',').map(p => p.trim().split(':')[0].trim());
        exports.push(...properties);
      }
    }
  }
  
  return exports;
}

/**
 * Count function declarations in code
 */
function countFunctions(content: string, language: string): number {
  let count = 0;
  
  if (language === 'javascript') {
    // Match function declarations
    const functionPattern = /(?:function\s+\w+|const\s+\w+\s*=\s*(?:async\s*)?\([^)]*\)\s*=>|(?:async\s*)?\([^)]*\)\s*=>|class\s+\w+\s*\{[^}]*constructor\s*\([^)]*\))/g;
    let match;
    
    while ((match = functionPattern.exec(content)) !== null) {
      count++;
    }
  } else if (language === 'python') {
    // Match function declarations
    const functionPattern = /def\s+\w+\s*\(/g;
    let match;
    
    while ((match = functionPattern.exec(content)) !== null) {
      count++;
    }
  } else if (language === 'java') {
    // Match method declarations (simplified)
    const methodPattern = /(?:public|protected|private|static|\s) +[\w<>[\]]+\s+(\w+) *\([^)]*\) *(?:throws [\w,]+ *)?{?/g;
    let match;
    
    while ((match = methodPattern.exec(content)) !== null) {
      count++;
    }
  }
  
  return count;
}

/**
 * Count class declarations in code
 */
function countClasses(content: string, language: string): number {
  let count = 0;
  
  if (language === 'javascript') {
    // Match class declarations
    const classPattern = /class\s+\w+/g;
    let match;
    
    while ((match = classPattern.exec(content)) !== null) {
      count++;
    }
  } else if (language === 'python') {
    // Match class declarations
    const classPattern = /class\s+\w+/g;
    let match;
    
    while ((match = classPattern.exec(content)) !== null) {
      count++;
    }
  } else if (language === 'java') {
    // Match class declarations
    const classPattern = /(?:public|protected|private|static|\s) +class +(\w+)/g;
    let match;
    
    while ((match = classPattern.exec(content)) !== null) {
      count++;
    }
  }
  
  return count;
}

/**
 * Handles reading file metadata
 */
async function handleReadMetadata(args: any) {
  try {
    const result = ReadMetadataSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for reading metadata"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const { path: filePath, type, includeBasic, includeExtended } = result.data;
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: `File not found: ${filePath}`,
            message: "Failed to read metadata"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    // Get basic metadata
    const metadata: Record<string, any> = {};
    
    if (includeBasic) {
      Object.assign(metadata, await getBasicMetadata(filePath));
    }
    
    // Determine file type
    const fileType = type === 'auto' ? getFileType(filePath) : type;
    metadata.fileType = fileType;
    
    // Get extended metadata if requested
    if (includeExtended) {
      const extended = await getExtendedMetadata(filePath, fileType);
      metadata.extended = extended;
    }
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          metadata,
          message: `Successfully read metadata for ${path.basename(filePath)}`
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to read metadata"
        }, null, 2)
      }],
      isError: true
    };
  }
}

/**
 * Handles extracting specific metadata from a file
 */
async function handleExtractMetadata(args: any) {
  try {
    const result = ExtractMetadataSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for extracting metadata"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const { path: filePath, options, useExternalTools } = result.data;
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: `File not found: ${filePath}`,
            message: "Failed to extract metadata"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    // Get basic metadata
    const basicMetadata = await getBasicMetadata(filePath);
    const fileType = getFileType(filePath);
    
    // Initialize result
    const extractedMetadata: Record<string, any> = {
      path: filePath,
      name: basicMetadata.name,
      size: basicMetadata.size,
      type: fileType
    };
    
    // Extract requested metadata based on file type
    if (fileType === 'image' && options.extractExif) {
      if (useExternalTools && externalTools.exiftool) {
        try {
          const exifData = execSync(`exiftool -j "${filePath}"`, { encoding: 'utf8' });
          const parsedExif = JSON.parse(exifData);
          
          if (parsedExif && parsedExif.length > 0) {
            extractedMetadata.exif = parsedExif[0];
          }
        } catch (err) {
          console.warn(`[Metadata Reader] ExifTool extraction failed: ${err}`);
        }
      }
    }
    
    if ((fileType === 'image' || fileType === 'video') && options.extractDimensions) {
      if (fileType === 'image' && useExternalTools && externalTools.imagemagick) {
        try {
          const imageMagickData = execSync(`identify -format "%[width]x%[height]" "${filePath}"`, { encoding: 'utf8' });
          const [width, height] = imageMagickData.trim().split('x').map(Number);
          
          extractedMetadata.dimensions = { width, height };
        } catch (err) {
          console.warn(`[Metadata Reader] ImageMagick extraction failed: ${err}`);
        }
      } else if (fileType === 'video' && useExternalTools && externalTools.ffmpeg) {
        try {
          const ffmpegData = execSync(`ffprobe -v quiet -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 "${filePath}"`, { encoding: 'utf8' });
          const [width, height] = ffmpegData.trim().split('x').map(Number);
          
          extractedMetadata.dimensions = { width, height };
        } catch (err) {
          console.warn(`[Metadata Reader] FFmpeg extraction failed: ${err}`);
        }
      }
    }
    
    if ((fileType === 'audio' || fileType === 'video') && options.extractDuration) {
      if (useExternalTools && externalTools.ffmpeg) {
        try {
          const durationData = execSync(`ffprobe -v quiet -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`, { encoding: 'utf8' });
          const duration = parseFloat(durationData.trim());
          
          extractedMetadata.duration = duration;
          extractedMetadata.durationFormatted = formatDuration(duration);
        } catch (err) {
          console.warn(`[Metadata Reader] FFmpeg duration extraction failed: ${err}`);
        }
      }
    }
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          metadata: extractedMetadata,
          message: `Successfully extracted specific metadata from ${path.basename(filePath)}`
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to extract metadata"
        }, null, 2)
      }],
      isError: true
    };
  }
}

/**
 * Handles batch processing of metadata for multiple files
 */
async function handleBatchProcess(args: any) {
  try {
    const result = BatchProcessSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for batch processing"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const { directory, recursive, pattern, outputFormat, outputPath } = result.data;
    
    // Check if directory exists
    try {
      const stats = await fs.stat(directory);
      if (!stats.isDirectory()) {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              error: `Path is not a directory: ${directory}`,
              message: "Failed to batch process metadata"
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
            error: `Directory not found: ${directory}`,
            message: "Failed to batch process metadata"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    // Find all files
    const filePaths: string[] = [];
    
    await findFiles(directory, filePaths, {
      recursive,
      pattern: pattern ? new RegExp(pattern) : undefined
    });
    
    // Process each file
    const results: Record<string, any>[] = [];
    
    for (const filePath of filePaths) {
      try {
        const basicMetadata = await getBasicMetadata(filePath);
        const fileType = getFileType(filePath);
        
        results.push({
          ...basicMetadata,
          fileType
        });
      } catch (error) {
        console.error(`[Metadata Reader] Error processing ${filePath}:`, error);
      }
    }
    
    // Save output if requested
    if (outputPath) {
      try {
        const outputDir = path.dirname(outputPath);
        
        // Create directory if it doesn't exist
        if (!fsSync.existsSync(outputDir)) {
          await fs.mkdir(outputDir, { recursive: true });
        }
        
        if (outputFormat === 'json') {
          await fs.writeFile(outputPath, JSON.stringify(results, null, 2));
        } else if (outputFormat === 'csv') {
          const csv = convertToCSV(results);
          await fs.writeFile(outputPath, csv);
        }
      } catch (error) {
        console.error(`[Metadata Reader] Error saving output:`, error);
      }
    }
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          filesProcessed: results.length,
          results: results.slice(0, 20), // Limit number of results returned
          hasMore: results.length > 20,
          outputPath: outputPath ? outputPath : undefined,
          outputFormat,
          message: `Successfully processed metadata for ${results.length} files`
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to batch process metadata"
        }, null, 2)
      }],
      isError: true
    };
  }
}

/**
 * Find files in a directory matching criteria
 */
async function findFiles(
  dir: string, 
  results: string[], 
  options: { recursive: boolean; pattern?: RegExp }
): Promise<void> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory() && options.recursive) {
      await findFiles(fullPath, results, options);
    } else if (entry.isFile()) {
      if (!options.pattern || options.pattern.test(entry.name)) {
        results.push(fullPath);
      }
    }
  }
}

/**
 * Convert array of objects to CSV
 */
function convertToCSV(data: Record<string, any>[]): string {
  if (data.length === 0) {
    return '';
  }
  
  // Get all possible headers
  const allHeaders = new Set<string>();
  
  for (const item of data) {
    for (const key of Object.keys(item)) {
      if (typeof item[key] !== 'object') {
        allHeaders.add(key);
      }
    }
  }
  
  const headers = Array.from(allHeaders);
  
  // Build CSV
  const rows = [
    headers.join(','),
    ...data.map(row => {
      return headers.map(header => {
        const value = row[header];
        
        if (value === undefined || value === null) {
          return '';
        } else if (typeof value === 'string') {
          // Escape quotes and wrap in quotes
          return `"${value.replace(/"/g, '""')}"`;
        } else {
          return String(value);
        }
      }).join(',');
    })
  ];
  
  return rows.join('\n');
}

/**
 * Handles parsing file content
 */
async function handleParseFileContent(args: any) {
  try {
    const parseResult = ParseFileContentSchema.safeParse(args);
    
    if (!parseResult.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: parseResult.error.format(),
            message: "Invalid arguments for parsing file content"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const {
      path: filePath,
      format,
      extractStructure,
      extractLinks,
      extractHeadings
    } = parseResult.data;
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: `File not found: ${filePath}`,
            message: "Failed to parse file content"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    // Read file content
    const content = await fs.readFile(filePath, 'utf8');
    
    // Determine format if 'auto' is specified
    let detectedFormat = format;
    
    if (format === 'auto') {
      const extension = path.extname(filePath).toLowerCase();
      
      if (['.json'].includes(extension)) {
        detectedFormat = 'json';
      } else if (['.yaml', '.yml'].includes(extension)) {
        detectedFormat = 'yaml';
      } else if (['.xml', '.svg'].includes(extension)) {
        detectedFormat = 'xml';
      } else if (['.csv'].includes(extension)) {
        detectedFormat = 'csv';
      } else if (['.toml'].includes(extension)) {
        detectedFormat = 'toml';
      } else if (['.ini', '.conf', '.config'].includes(extension)) {
        detectedFormat = 'ini';
      } else if (['.md', '.markdown'].includes(extension)) {
        detectedFormat = 'markdown';
      } else {
        // Use markdown as a fallback
        detectedFormat = 'markdown';
      }
    }
    
    // Parse content
    const parsedData: Record<string, any> = {
      path: filePath,
      format: detectedFormat,
      size: content.length,
      lines: content.split('\n').length
    };
    
    // Extract structure if requested
    if (extractStructure) {
      parsedData.structure = parseStructure(content, detectedFormat);
    }
    
    // Extract links if requested
    if (extractLinks) {
      parsedData.links = extractLinksFromContent(content, detectedFormat);
    }
    
    // Extract headings if requested
    if (extractHeadings) {
      parsedData.headings = extractHeadingsFromContent(content, detectedFormat);
    }
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          ...parsedData,
          message: `Successfully parsed ${path.basename(filePath)} as ${detectedFormat}`
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to parse file content"
        }, null, 2)
      }],
      isError: true
    };
  }
}

/**
 * Parse structure of file content
 */
function parseStructure(content: string, format: string): any {
  try {
    if (format === 'json') {
      return JSON.parse(content);
    } else if (format === 'yaml') {
      // In a real implementation, this would use a YAML parser
      return { message: 'YAML parsing requires additional dependencies' };
    } else if (format === 'xml') {
      // In a real implementation, this would use an XML parser
      return { message: 'XML parsing requires additional dependencies' };
    } else if (format === 'csv') {
      // In a real implementation, this would use a CSV parser
      return { message: 'CSV parsing requires additional dependencies' };
    }
  } catch (error) {
    return { error: `Failed to parse ${format} content: ${error}` };
  }
  
  return null;
}

/**
 * Extract links from content
 */
function extractLinksFromContent(content: string, format: string): string[] {
  const links: string[] = [];
  
  if (['markdown', 'text'].includes(format)) {
    // Match markdown links: [text](url)
    const markdownPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;
    
    while ((match = markdownPattern.exec(content)) !== null) {
      links.push(match[2]);
    }
    
    // Match plain URLs
    const urlPattern = /https?:\/\/[^\s)>"']+/g;
    
    while ((match = urlPattern.exec(content)) !== null) {
      links.push(match[0]);
    }
  } else if (format === 'html' || format === 'xml') {
    // Match HTML href attributes
    const hrefPattern = /href=["']([^"']+)["']/g;
    let match;
    
    while ((match = hrefPattern.exec(content)) !== null) {
      links.push(match[1]);
    }
    
    // Match HTML src attributes
    const srcPattern = /src=["']([^"']+)["']/g;
    
    while ((match = srcPattern.exec(content)) !== null) {
      links.push(match[1]);
    }
  }
  
  // Remove duplicates
  return Array.from(new Set(links));
}

/**
 * Extract headings from content
 */
function extractHeadingsFromContent(content: string, format: string): { level: number; text: string }[] {
  const headings: { level: number; text: string }[] = [];
  
  if (format === 'markdown') {
    // Match markdown headings: # Heading
    const headingPattern = /^(#{1,6})\s+(.+)$/gm;
    let match;
    
    while ((match = headingPattern.exec(content)) !== null) {
      headings.push({
        level: match[1].length,
        text: match[2].trim()
      });
    }
  } else if (format === 'html' || format === 'xml') {
    // Match HTML headings: <h1>Heading</h1>
    const headingPattern = /<h([1-6])>([^<]+)<\/h\1>/g;
    let match;
    
    while ((match = headingPattern.exec(content)) !== null) {
      headings.push({
        level: parseInt(match[1]),
        text: match[2].trim()
      });
    }
  }
  
  return headings;
}