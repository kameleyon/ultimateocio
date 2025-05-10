// File mover tool implementation

import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';

export const toolName = 'file-mover';
export const toolDescription = 'Move or rename files and directories';

// Schema for moving a file
export const MoveFileSchema = z.object({
  source: z.string().describe('Source path of the file or directory to move'),
  destination: z.string().describe('Destination path where the file or directory will be moved to'),
});

// Input schema for the tool
export const inputSchema = MoveFileSchema;

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
 * Check if a path exists
 */
async function pathExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Move a file or directory
 */
async function moveFile(sourcePath: string, destinationPath: string): Promise<void> {
  try {
    // Check if source exists
    if (!(await pathExists(sourcePath))) {
      throw new Error(`Source path does not exist: ${sourcePath}`);
    }
    
    // Check if destination already exists
    if (await pathExists(destinationPath)) {
      throw new Error(`Destination path already exists: ${destinationPath}`);
    }
    
    // Ensure the destination directory exists
    const destinationDir = path.dirname(destinationPath);
    if (!(await pathExists(destinationDir))) {
      await fs.mkdir(destinationDir, { recursive: true });
    }
    
    // Move the file or directory
    await fs.rename(sourcePath, destinationPath);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to move ${sourcePath} to ${destinationPath}: ${errorMessage}`);
  }
}

/**
 * Execute the file mover tool
 */
export async function execute(input: z.infer<typeof inputSchema>) {
  try {
    await moveFile(input.source, input.destination);
    
    return {
      content: [{ 
        type: 'text', 
        text: `Successfully moved ${input.source} to ${input.destination}` 
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