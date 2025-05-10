// Auto-generated boilerplate for refactor-tool

import { z } from 'zod';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

// Types of refactorings supported
type RefactoringType = 
  'rename' | 
  'extract-method' | 
  'extract-interface' | 
  'move' | 
  'inline';

// Language support
type SupportedLanguage = 'typescript' | 'javascript' | 'java' | 'csharp' | 'python' | 'go';

// Refactoring metadata
interface RefactoringOperation {
  id: string;
  type: RefactoringType;
  language: SupportedLanguage;
  files: string[];
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
  error?: string;
  details: any;
}

// In-memory store for refactoring operations
const refactoringHistory: RefactoringOperation[] = [];

// TypeScript compiler options for parsing
const defaultTsCompilerOptions: ts.CompilerOptions = {
  target: ts.ScriptTarget.ESNext,
  module: ts.ModuleKind.ESNext,
  jsx: ts.JsxEmit.React,
  esModuleInterop: true,
  allowJs: true
};

export function activate() {
  console.log("[TOOL] refactor-tool activated");
}

/**
 * Handles file write events
 */
export function onFileWrite(event: { path: string; content: string }) {
  // No specific handling for file writes
}

/**
 * Handles session start logic
 */
export function onSessionStart(session: { id: string; startTime: number }) {
  console.log(`[Refactor Tool] Session started: ${session.id}`);
  
  // Clear the refactoring history for a new session
  refactoringHistory.length = 0;
}

/**
 * Handles refactor-tool commands
 */
export async function onCommand(command: { name: string; args: any[] }) {
  switch (command.name) {
    case 'refactor-tool:rename':
      console.log('[Refactor Tool] Renaming symbol...');
      return await handleRenameSymbol(command.args[0]);
    case 'refactor-tool:extract-method':
      console.log('[Refactor Tool] Extracting method...');
      return await handleExtractMethod(command.args[0]);
    case 'refactor-tool:extract-interface':
      console.log('[Refactor Tool] Extracting interface...');
      return await handleExtractInterface(command.args[0]);
    case 'refactor-tool:move':
      console.log('[Refactor Tool] Moving symbol...');
      return await handleMoveSymbol(command.args[0]);
    case 'refactor-tool:inline':
      console.log('[Refactor Tool] Inlining code...');
      return await handleInlineCode(command.args[0]);
    case 'refactor-tool:analyze':
      console.log('[Refactor Tool] Analyzing refactor opportunities...');
      return await handleAnalyzeCode(command.args[0]);
    default:
      console.warn(`[Refactor Tool] Unknown command: ${command.name}`);
      return { error: `Unknown command: ${command.name}` };
  }
}

// Define schemas for Refactor Tool
export const RenameSymbolSchema = z.object({
  filePath: z.string(),
  symbol: z.string(),
  newName: z.string(),
  isGlobal: z.boolean().optional().default(true),
  dryRun: z.boolean().optional().default(false),
});

export const ExtractMethodSchema = z.object({
  filePath: z.string(),
  startLine: z.number(),
  endLine: z.number(),
  methodName: z.string(),
  visibility: z.enum(['public', 'private', 'protected']).optional().default('private'),
  returnType: z.string().optional(),
  dryRun: z.boolean().optional().default(false),
});

export const ExtractInterfaceSchema = z.object({
  filePath: z.string(),
  className: z.string(),
  interfaceName: z.string(),
  methods: z.array(z.string()).optional(),
  properties: z.array(z.string()).optional(),
  outputPath: z.string().optional(),
  dryRun: z.boolean().optional().default(false),
});

export const MoveSymbolSchema = z.object({
  sourcePath: z.string(),
  targetPath: z.string(),
  symbol: z.string(),
  updateImports: z.boolean().optional().default(true),
  dryRun: z.boolean().optional().default(false),
});

export const InlineCodeSchema = z.object({
  filePath: z.string(),
  targetType: z.enum(['variable', 'method', 'function']),
  targetName: z.string(),
  dryRun: z.boolean().optional().default(false),
});

export const AnalyzeCodeSchema = z.object({
  paths: z.array(z.string()).optional(),
  path: z.string().optional(),
  suggestionTypes: z.array(z.enum([
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
function generateOperationId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
}

/**
 * Parse TypeScript file
 */
function parseTypeScriptFile(filePath: string, content?: string): ts.SourceFile | null {
  try {
    // Read file content if not provided
    if (!content) {
      content = fsSync.readFileSync(filePath, 'utf8');
    }
    
    // Parse the file
    return ts.createSourceFile(
      filePath,
      content,
      defaultTsCompilerOptions.target || ts.ScriptTarget.Latest,
      true
    );
  } catch (error) {
    console.error(`[Refactor Tool] Error parsing TypeScript file: ${error}`);
    return null;
  }
}

/**
 * Find all occurrences of a symbol in TypeScript file
 */
function findSymbol(sourceFile: ts.SourceFile, symbolName: string): ts.Node[] {
  const occurrences: ts.Node[] = [];
  
  function visit(node: ts.Node) {
    if (
      ts.isIdentifier(node) && 
      node.text === symbolName
    ) {
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
function renameSymbolInFile(
  filePath: string, 
  symbolName: string, 
  newName: string,
  dryRun: boolean = false
): { content: string; occurrences: number } {
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
async function findTsJsFiles(directory: string): Promise<string[]> {
  const files: string[] = [];
  
  async function scanDir(dir: string) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        // Skip node_modules and hidden directories
        if (entry.name !== 'node_modules' && !entry.name.startsWith('.')) {
          await scanDir(fullPath);
        }
      } else if (
        entry.isFile() && 
        (
          entry.name.endsWith('.ts') || 
          entry.name.endsWith('.tsx') || 
          entry.name.endsWith('.js') || 
          entry.name.endsWith('.jsx')
        )
      ) {
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
function extractLines(content: string, startLine: number, endLine: number): string {
  const lines = content.split('\n');
  // Adjust for 0-based array indexing
  return lines.slice(startLine - 1, endLine).join('\n');
}

/**
 * Handles renaming a symbol across files
 */
async function handleRenameSymbol(args: any) {
  try {
    const result = RenameSymbolSchema.safeParse(args);
    
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
    const operation: RefactoringOperation = {
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
    let filesToProcess: string[] = [filePath];
    
    if (isGlobal) {
      // If the file is in a directory, search for all TS/JS files in that directory
      const directory = path.dirname(filePath);
      filesToProcess = await findTsJsFiles(directory);
    }
    
    // Process each file
    const results: { file: string; occurrences: number }[] = [];
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
      } catch (error) {
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
  } catch (error) {
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
async function handleExtractMethod(args: any) {
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

async function handleExtractInterface(args: any) {
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

async function handleMoveSymbol(args: any) {
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

async function handleInlineCode(args: any) {
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

async function handleAnalyzeCode(args: any) {
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