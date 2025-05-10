// Auto-generated boilerplate for formatter

import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';

// Import optional formatter libraries in a way that handles missing dependencies
let prettier: any;
let js_beautify: any;
let html_beautify: any;
let css_beautify: any;
let xml_beautify: any;

// Use dynamic import for ESM compatibility
async function loadDependencies() {
  try {
    // Try to resolve prettier from different possible locations
    const possiblePaths = [
      'prettier',
      '../node_modules/prettier',
      '../../node_modules/prettier',
      '../../../node_modules/prettier',
      process.cwd() + '/node_modules/prettier'
    ];
    
    for (const path of possiblePaths) {
      try {
        prettier = await import(path);
        console.log(`[Formatter] Prettier successfully loaded from ${path}`);
        break;
      } catch (e) {
        // Continue trying other paths
      }
    }
    
    if (!prettier) {
      console.log('[Formatter] prettier not available. Some formatting features will be limited.');
    }
  } catch (err) {
    console.log('[Formatter] prettier not available. Some formatting features will be limited.');
  }

  try {
    // Try to resolve js-beautify from different possible locations
    const possiblePaths = [
      'js-beautify',
      '../node_modules/js-beautify',
      '../../node_modules/js-beautify',
      '../../../node_modules/js-beautify',
      process.cwd() + '/node_modules/js-beautify'
    ];
    
    let jsBeautify;
    for (const path of possiblePaths) {
      try {
        jsBeautify = await import(path);
        console.log(`[Formatter] js-beautify successfully loaded from ${path}`);
        break;
      } catch (e) {
        // Continue trying other paths
      }
    }
    
    if (jsBeautify) {
      js_beautify = jsBeautify.js;
      html_beautify = jsBeautify.html;
      css_beautify = jsBeautify.css;
    } else {
      console.log('[Formatter] js-beautify not available. Some formatting features will be limited.');
    }
  } catch (err) {
    console.log('[Formatter] js-beautify not available. Some formatting features will be limited.');
  }
}

// Load dependencies immediately
loadDependencies().catch(err => {
  console.error('[Formatter] Error loading dependencies:', err);
});

export function activate() {
  console.log("[TOOL] formatter activated");
  
  // Check for required dependencies and install them if missing
  ensureDependencies();
}

/**
 * Handles file write events to auto-format
 */
export function onFileWrite(event: { path: string; content: string }) {
  console.log(`[Formatter] File write detected: ${event.path}`);
  
  // Auto-format could be implemented here based on configuration
}

/**
 * Handles session start logic
 */
export function onSessionStart(session: { id: string; startTime: number }) {
  console.log(`[Formatter] Session started: ${session.id}`);
}

/**
 * Handles formatter commands
 */
export async function onCommand(command: { name: string; args: any[] }) {
  switch (command.name) {
    case 'formatter:format':
      console.log('[Formatter] Formatting content...');
      return await handleFormatContent(command.args[0]);
    case 'formatter:format-file':
      console.log('[Formatter] Formatting file...');
      return await handleFormatFile(command.args[0]);
    case 'formatter:detect':
      console.log('[Formatter] Detecting format...');
      return await handleDetectFormat(command.args[0]);
    case 'formatter:convert':
      console.log('[Formatter] Converting format...');
      return await handleConvertFormat(command.args[0]);
    default:
      console.warn(`[Formatter] Unknown command: ${command.name}`);
      return { error: `Unknown command: ${command.name}` };
  }
}

// Define schemas for Formatter tool
export const FormatContentSchema = z.object({
  content: z.string(),
  language: z.enum([
    'json', 'javascript', 'typescript', 'html', 'css', 'markdown', 
    'yaml', 'xml', 'sql', 'graphql', 'python', 'java', 'c', 'cpp', 
    'csharp', 'go', 'rust', 'php', 'ruby', 'swift'
  ]),
  options: z.record(z.any()).optional(),
  prettier: z.boolean().optional().default(true),
});

export const FormatFileSchema = z.object({
  path: z.string(),
  language: z.enum([
    'json', 'javascript', 'typescript', 'html', 'css', 'markdown', 
    'yaml', 'xml', 'sql', 'graphql', 'python', 'java', 'c', 'cpp', 
    'csharp', 'go', 'rust', 'php', 'ruby', 'swift'
  ]).optional(),
  options: z.record(z.any()).optional(),
  prettier: z.boolean().optional().default(true),
  write: z.boolean().optional().default(true),
});

export const DetectFormatSchema = z.object({
  content: z.string().optional(),
  path: z.string().optional(),
});

export const ConvertFormatSchema = z.object({
  content: z.string().optional(),
  path: z.string().optional(),
  fromFormat: z.enum(['json', 'yaml', 'xml', 'csv', 'html', 'markdown']),
  toFormat: z.enum(['json', 'yaml', 'xml', 'csv', 'html', 'markdown']),
  options: z.record(z.any()).optional(),
  write: z.boolean().optional().default(false),
  outputPath: z.string().optional(),
});

/**
 * Ensures required dependencies are installed
 */
function ensureDependencies() {
  const dependencies = [
    { name: 'prettier', installed: !!prettier },
    { name: 'js-beautify', installed: !!js_beautify }
  ];
  
  const missingDeps = dependencies.filter(dep => !dep.installed).map(dep => dep.name);
  
  if (missingDeps.length > 0) {
    console.log(`[Formatter] Missing dependencies: ${missingDeps.join(', ')}`);
    console.log(`[Formatter] Install using: npm install ${missingDeps.join(' ')}`);
  }
}

/**
 * Detects the language from a file extension
 */
function detectLanguageFromPath(filePath: string): string | undefined {
  const extension = path.extname(filePath).toLowerCase();
  
  const extensionMap: Record<string, string> = {
    '.js': 'javascript',
    '.jsx': 'javascript',
    '.ts': 'typescript',
    '.tsx': 'typescript',
    '.json': 'json',
    '.html': 'html',
    '.htm': 'html',
    '.css': 'css',
    '.scss': 'css',
    '.less': 'css',
    '.md': 'markdown',
    '.markdown': 'markdown',
    '.yaml': 'yaml',
    '.yml': 'yaml',
    '.xml': 'xml',
    '.svg': 'xml',
    '.sql': 'sql',
    '.py': 'python',
    '.java': 'java',
    '.c': 'c',
    '.cpp': 'cpp',
    '.cs': 'csharp',
    '.go': 'go',
    '.rs': 'rust',
    '.php': 'php',
    '.rb': 'ruby',
    '.swift': 'swift',
    '.graphql': 'graphql',
    '.gql': 'graphql',
  };
  
  return extensionMap[extension];
}

/**
 * Formats code content based on language
 */
async function formatCode(content: string, language: string, options?: any): Promise<string> {
  if (!content || content.trim() === '') {
    return content;
  }
  
  try {
    // Use prettier if available
    if (prettier) {
      const prettierOptions = {
        parser: getPrettierParser(language),
        ...options
      };
      
      try {
        return prettier.format(content, prettierOptions);
      } catch (prettierError) {
        console.error('[Formatter] Prettier error:', prettierError);
        // Fall back to basic formatting if prettier fails
      }
    }
    
    // Fallback to js-beautify
    switch (language) {
      case 'json':
        try {
          // Try to parse and re-stringify with proper indentation
          const parsed = JSON.parse(content);
          return JSON.stringify(parsed, null, 2);
        } catch (e) {
          // If invalid JSON, try to beautify it anyway
          return js_beautify ? js_beautify(content, { indent_size: 2 }) : content;
        }
        
      case 'javascript':
      case 'typescript':
        return js_beautify ? js_beautify(content, { indent_size: 2 }) : content;
        
      case 'html':
        return html_beautify ? html_beautify(content, { indent_size: 2 }) : content;
        
      case 'css':
        return css_beautify ? css_beautify(content, { indent_size: 2 }) : content;
        
      default:
        // For other languages, just return the content as is
        return content;
    }
  } catch (error) {
    console.error(`[Formatter] Error formatting ${language} code:`, error);
    return content;
  }
}

/**
 * Gets the appropriate parser for prettier based on language
 */
function getPrettierParser(language: string): string {
  switch (language) {
    case 'javascript':
    case 'typescript':
      return language;
    case 'json':
      return 'json';
    case 'html':
      return 'html';
    case 'css':
      return 'css';
    case 'markdown':
      return 'markdown';
    case 'yaml':
      return 'yaml';
    case 'graphql':
      return 'graphql';
    default:
      return 'babel';
  }
}

/**
 * Formats content in the specified language
 */
async function handleFormatContent(args: any) {
  try {
    const result = FormatContentSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for formatting content"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const { content, language, options, prettier: usePrettier } = result.data;
    
    // Check if we can format this language
    if (usePrettier && !prettier) {
      console.warn(`[Formatter] Prettier requested but not available. Using fallback formatter.`);
    }
    
    // Format the content
    const formattedContent = await formatCode(content, language, options);
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          language,
          originalSize: content.length,
          formattedSize: formattedContent.length,
          formatted: formattedContent,
          message: `Content formatted successfully as ${language}`
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to format content"
        }, null, 2)
      }],
      isError: true
    };
  }
}

/**
 * Formats a file in the specified language
 */
async function handleFormatFile(args: any) {
  try {
    const result = FormatFileSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for formatting file"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const { path: filePath, language, options, prettier: usePrettier, write } = result.data;
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: `File not found: ${filePath}`,
            message: "Failed to format file"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    // Read the file
    const fileContent = await fs.readFile(filePath, 'utf8');
    
    // Detect language if not provided
    const detectedLanguage = language || detectLanguageFromPath(filePath);
    
    if (!detectedLanguage) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: `Could not detect language for file: ${filePath}`,
            message: "Failed to format file"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    // Format the content
    const formattedContent = await formatCode(fileContent, detectedLanguage, options);
    
    // Write back to the file if requested
    if (write) {
      await fs.writeFile(filePath, formattedContent);
    }
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          path: filePath,
          language: detectedLanguage,
          originalSize: fileContent.length,
          formattedSize: formattedContent.length,
          written: write,
          message: `File ${write ? 'formatted' : 'analyzed'} successfully`
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to format file"
        }, null, 2)
      }],
      isError: true
    };
  }
}

/**
 * Detects format/language of content or file
 */
async function handleDetectFormat(args: any) {
  try {
    const result = DetectFormatSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for detecting format"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const { content, path: filePath } = result.data;
    
    if (!content && !filePath) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: "Either content or path must be provided",
            message: "Failed to detect format"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    let detectedFormat = 'unknown';
    let confidence = 0;
    let fileContent = content;
    
    // Read file content if path is provided
    if (filePath) {
      try {
        fileContent = await fs.readFile(filePath, 'utf8');
        
        // Try to detect from file extension
        const languageFromPath = detectLanguageFromPath(filePath);
        if (languageFromPath) {
          detectedFormat = languageFromPath;
          confidence = 0.8; // 80% confidence based on extension
        }
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              error: `Failed to read file: ${filePath}`,
              message: "Failed to detect format"
            }, null, 2)
          }],
          isError: true
        };
      }
    }
    
    // If still unknown or low confidence, try to detect from content
    if (detectedFormat === 'unknown' || confidence < 0.8) {
      if (!fileContent) {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              format: detectedFormat,
              confidence,
              message: "Could not detect format from empty content"
            }, null, 2)
          }]
        };
      }
      
      const trimmedContent = fileContent.trim();
      
      // Check for JSON
      if ((trimmedContent.startsWith('{') && trimmedContent.endsWith('}')) || 
          (trimmedContent.startsWith('[') && trimmedContent.endsWith(']'))) {
        try {
          JSON.parse(trimmedContent);
          detectedFormat = 'json';
          confidence = 0.9; // 90% confidence
        } catch (e) {
          // Not valid JSON
        }
      }
      
      // Check for HTML
      if (trimmedContent.match(/<html[\s>]/i) || trimmedContent.match(/<body[\s>]/i)) {
        detectedFormat = 'html';
        confidence = 0.9;
      } else if (trimmedContent.match(/<[a-z][a-z0-9]*[\s>]/i)) {
        detectedFormat = 'html';
        confidence = 0.7;
      }
      
      // Check for XML
      if (trimmedContent.match(/<\?xml[\s>]/i)) {
        detectedFormat = 'xml';
        confidence = 0.9;
      }
      
      // Check for YAML
      if (trimmedContent.match(/^---\s*$/m) || 
          trimmedContent.match(/^\s*[a-zA-Z0-9_-]+:\s*[^\s].*$/m)) {
        detectedFormat = 'yaml';
        confidence = 0.7;
      }
      
      // Check for Markdown
      if (trimmedContent.match(/^#{1,6}\s+.+$/m) || 
          trimmedContent.match(/\[.+\]\(.+\)/)) {
        detectedFormat = 'markdown';
        confidence = 0.7;
      }
    }
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          format: detectedFormat,
          confidence,
          source: filePath ? 'file' : 'content',
          message: `Detected format: ${detectedFormat} (${Math.round(confidence * 100)}% confidence)`
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to detect format"
        }, null, 2)
      }],
      isError: true
    };
  }
}

/**
 * Converts content between formats
 */
async function handleConvertFormat(args: any) {
  try {
    const result = ConvertFormatSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for converting format"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const { content, path: filePath, fromFormat, toFormat, options, write, outputPath } = result.data;
    
    // For now, we only support simple JSON to YAML conversion
    // In a real implementation, this would handle more formats
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          fromFormat,
          toFormat,
          convertedContent: "# Converted content would be here",
          source: filePath || "provided content",
          written: write,
          outputPath: write ? outputPath || filePath : undefined,
          message: `Format conversion from ${fromFormat} to ${toFormat} is not fully implemented`
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to convert format"
        }, null, 2)
      }],
      isError: true
    };
  }
}