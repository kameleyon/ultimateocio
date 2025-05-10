// File reader tool implementation

import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';
import { resolvePath, pathExists } from '../../utils/pathUtils';

export const toolName = 'file-reader';
export const toolDescription = 'Read file contents with support for single and multiple files';

// Schema for reading a single file
export const ReadFileSchema = z.object({
  path: z.string().describe('Path to the file to read'),
});

// Schema for reading multiple files
export const ReadMultipleFilesSchema = z.object({
  paths: z.array(z.string()).describe('Array of file paths to read'),
});

// Input schema for the tool
export const inputSchema = z.discriminatedUnion('operation', [
  z.object({
    operation: z.literal('read_file'),
    params: ReadFileSchema,
  }),
  z.object({
    operation: z.literal('read_multiple_files'),
    params: ReadMultipleFilesSchema,
  }),
]);

// Output schema for the tool
export const outputSchema = z.object({
  content: z.array(
    z.object({
      type: z.literal('text'),
      text: z.string(),
    })
  ),
  isError: z.boolean().optional(),
});

/**
 * Read a single file
 */
async function readFile(filePath: string): Promise<string> {
  try {
    // Resolve and validate the path
    const resolvedPath = await resolvePath(filePath);
    
    // Check if path exists
    if (!(await pathExists(resolvedPath))) {
      throw new Error(`File does not exist: ${filePath}`);
    }
    
    const content = await fs.readFile(resolvedPath, 'utf-8');
    return content;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to read file ${filePath}: ${errorMessage}`);
  }
}

/**
 * Read multiple files
 */
async function readMultipleFiles(filePaths: string[]): Promise<string> {
  const results = await Promise.all(
    filePaths.map(async (filePath) => {
      try {
        // Resolve and validate the path
        const resolvedPath = await resolvePath(filePath);
        
        // Check if path exists
        if (!(await pathExists(resolvedPath))) {
          return `${filePath}: Error - File does not exist`;
        }
        
        const content = await fs.readFile(resolvedPath, 'utf-8');
        return `${filePath}:\n${content}\n`;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return `${filePath}: Error - ${errorMessage}`;
      }
    })
  );
  
  return results.join('\n---\n');
}

/**
 * Execute the file reader tool
 */
export async function execute(input: z.infer<typeof inputSchema>) {
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
        throw new Error(`Unknown operation: ${(input as any).operation}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [{ type: 'text', text: errorMessage }],
      isError: true,
    };
  }
}