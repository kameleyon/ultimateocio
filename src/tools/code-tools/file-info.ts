// File info tool implementation

import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';

export const toolName = 'file-info';
export const toolDescription = 'Get detailed metadata about files and directories';

// Schema for getting file info
export const GetFileInfoSchema = z.object({
  path: z.string().describe('Path to the file or directory to get info for'),
});

// Input schema for the tool
export const inputSchema = GetFileInfoSchema;

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
 * Get file or directory stats
 */
async function getFileStats(filePath: string): Promise<{
  size: number;
  created: Date;
  modified: Date;
  accessed: Date;
  isDirectory: boolean;
  isFile: boolean;
  permissions: string;
}> {
  const stats = await fs.stat(filePath);
  
  return {
    size: stats.size,
    created: stats.birthtime,
    modified: stats.mtime,
    accessed: stats.atime,
    isDirectory: stats.isDirectory(),
    isFile: stats.isFile(),
    permissions: stats.mode.toString(8).slice(-3),
  };
}

/**
 * Format file stats into a readable string
 */
function formatFileStats(stats: ReturnType<typeof getFileStats> extends Promise<infer T> ? T : never): string {
  return Object.entries(stats)
    .map(([key, value]) => {
      if (value instanceof Date) {
        return `${key}: ${value.toISOString()}`;
      }
      return `${key}: ${value}`;
    })
    .join('\n');
}

/**
 * Execute the file info tool
 */
export async function execute(input: z.infer<typeof inputSchema>) {
  try {
    const stats = await getFileStats(input.path);
    const formattedStats = formatFileStats(stats);
    
    return {
      content: [{ 
        type: 'text', 
        text: formattedStats
      }],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [{ type: 'text', text: `Error getting file info: ${errorMessage}` }],
      isError: true,
    };
  }
}