// File writer tool implementation

import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';
import { resolvePath, pathExists } from '../../utils/pathUtils';

export const toolName = 'file-writer';
export const toolDescription = 'Write content to files with support for creating directories';

// Schema for writing a file
export const WriteFileSchema = z.object({
  path: z.string().describe('Path to the file to write'),
  content: z.string().describe('Content to write to the file'),
});

// Input schema for the tool
export const inputSchema = z.object({
  path: z.string().describe('Path to the file to write'),
  content: z.string().describe('Content to write to the file'),
});

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
 * Ensure directory exists
 */
async function ensureDirectoryExists(filePath: string): Promise<void> {
  const dirname = path.dirname(filePath);
  try {
    // Resolve and validate the directory path
    const resolvedDirname = await resolvePath(dirname);
    
    try {
      await fs.access(resolvedDirname);
    } catch (error) {
      // Directory doesn't exist, create it
      await fs.mkdir(resolvedDirname, { recursive: true });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to ensure directory exists for ${filePath}: ${errorMessage}`);
  }
}

/**
 * Write content to a file
 */
async function writeFile(filePath: string, content: string): Promise<void> {
  try {
    // Resolve and validate the path
    const resolvedPath = await resolvePath(filePath);
    
    // Ensure the directory exists
    await ensureDirectoryExists(resolvedPath);
    
    // Write the file
    await fs.writeFile(resolvedPath, content, 'utf-8');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to write file ${filePath}: ${errorMessage}`);
  }
}

/**
 * Execute the file writer tool
 */
export async function execute(input: z.infer<typeof inputSchema>) {
  try {
    await writeFile(input.path, input.content);
    
    return {
      content: [{ 
        type: 'text', 
        text: `Successfully wrote to ${input.path}` 
      }],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [{ type: 'text', text: errorMessage }],
      isError: true,
    };
  }
}