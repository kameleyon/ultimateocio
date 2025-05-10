// File searcher tool implementation

import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';
import { minimatch } from 'minimatch';

export const toolName = 'file-searcher';
export const toolDescription = 'Search for files and directories with pattern matching';

// Schema for searching files
export const SearchFilesSchema = z.object({
  path: z.string().describe('Starting directory path for the search'),
  pattern: z.string().describe('Search pattern to match against file and directory names'),
  excludePatterns: z.array(z.string()).optional().default([]).describe('Patterns to exclude from search results'),
});

// Input schema for the tool
export const inputSchema = SearchFilesSchema;

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
 * Check if a path should be excluded based on patterns
 */
function shouldExclude(relativePath: string, excludePatterns: string[]): boolean {
  return excludePatterns.some(pattern => {
    const globPattern = pattern.includes('*') ? pattern : `**/${pattern}/**`;
    return minimatch(relativePath, globPattern, { dot: true });
  });
}

/**
 * Search for files and directories
 */
async function searchFiles(
  rootPath: string,
  pattern: string,
  excludePatterns: string[] = []
): Promise<string[]> {
  const results: string[] = [];

  async function search(currentPath: string) {
    try {
      const entries = await fs.readdir(currentPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name);
        
        // Check if path matches any exclude pattern
        const relativePath = path.relative(rootPath, fullPath);
        if (shouldExclude(relativePath, excludePatterns)) {
          continue;
        }

        // Check if the entry name matches the pattern
        if (entry.name.toLowerCase().includes(pattern.toLowerCase())) {
          results.push(fullPath);
        }

        // Recursively search directories
        if (entry.isDirectory()) {
          await search(fullPath);
        }
      }
    } catch (error) {
      // Skip directories we can't access
      console.error(`Error accessing ${currentPath}: ${error}`);
    }
  }

  await search(rootPath);
  return results;
}

/**
 * Execute the file searcher tool
 */
export async function execute(input: z.infer<typeof inputSchema>) {
  try {
    const results = await searchFiles(input.path, input.pattern, input.excludePatterns);
    
    if (results.length === 0) {
      return {
        content: [{ type: 'text', text: 'No matches found' }],
      };
    }
    
    return {
      content: [{ 
        type: 'text', 
        text: results.join('\n') 
      }],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [{ type: 'text', text: `Error searching files: ${errorMessage}` }],
      isError: true,
    };
  }
}