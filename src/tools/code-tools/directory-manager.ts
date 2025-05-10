// Directory manager tool implementation

import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';
import { resolvePath, pathExists } from '../../utils/pathUtils';

export const toolName = 'directory-manager';
export const toolDescription = 'Manage directories with create, list, and tree operations';

// Schema for creating a directory
export const CreateDirectorySchema = z.object({
  path: z.string().describe('Path to the directory to create'),
});

// Schema for listing a directory
export const ListDirectorySchema = z.object({
  path: z.string().describe('Path to the directory to list'),
});

// Schema for getting a directory tree
export const DirectoryTreeSchema = z.object({
  path: z.string().describe('Path to the directory to get tree for'),
});

// Input schema for the tool
export const inputSchema = z.discriminatedUnion('operation', [
  z.object({
    operation: z.literal('create_directory'),
    params: CreateDirectorySchema,
  }),
  z.object({
    operation: z.literal('list_directory'),
    params: ListDirectorySchema,
  }),
  z.object({
    operation: z.literal('directory_tree'),
    params: DirectoryTreeSchema,
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
 * Create a directory
 */
async function createDirectory(dirPath: string): Promise<string> {
  try {
    if (!dirPath) {
      throw new Error("Directory path is required");
    }
    
    console.error(`[DIRECTORY_MANAGER] Creating directory: ${dirPath}`);
    
    // Resolve and validate the path
    const resolvedPath = await resolvePath(dirPath);
    console.error(`[DIRECTORY_MANAGER] Resolved path: ${resolvedPath}`);
    
    await fs.mkdir(resolvedPath, { recursive: true });
    return `Successfully created directory ${dirPath} (resolved to ${resolvedPath})`;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[DIRECTORY_MANAGER] Error creating directory: ${errorMessage}`);
    throw new Error(`Failed to create directory ${dirPath}: ${errorMessage}`);
  }
}

/**
 * List a directory
 */
async function listDirectory(dirPath: string): Promise<string> {
  try {
    if (!dirPath) {
      throw new Error("Directory path is required");
    }
    
    console.error(`[DIRECTORY_MANAGER] Listing directory: ${dirPath}`);
    
    // Resolve and validate the path
    const resolvedPath = await resolvePath(dirPath);
    console.error(`[DIRECTORY_MANAGER] Resolved path: ${resolvedPath}`);
    
    // Check if path exists
    if (!(await pathExists(resolvedPath))) {
      throw new Error(`Directory does not exist: ${dirPath} (resolved to ${resolvedPath})`);
    }
    
    const entries = await fs.readdir(resolvedPath, { withFileTypes: true });
    console.error(`[DIRECTORY_MANAGER] Found ${entries.length} entries in ${resolvedPath}`);
    
    const formatted = entries
      .map((entry) => `${entry.isDirectory() ? "[DIR]" : "[FILE]"} ${entry.name}`)
      .join("\n");
    
    return formatted || "Directory is empty";
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[DIRECTORY_MANAGER] Error listing directory: ${errorMessage}`);
    throw new Error(`Failed to list directory ${dirPath}: ${errorMessage}`);
  }
}

/**
 * Get a directory tree
 */
async function getDirectoryTree(dirPath: string): Promise<string> {
  interface TreeEntry {
    name: string;
    type: 'file' | 'directory';
    children?: TreeEntry[];
  }

  async function buildTree(currentPath: string): Promise<TreeEntry[]> {
    // Resolve and validate the path
    const resolvedPath = await resolvePath(currentPath);
    
    const entries = await fs.readdir(resolvedPath, { withFileTypes: true });
    const result: TreeEntry[] = [];

    for (const entry of entries) {
      const entryData: TreeEntry = {
        name: entry.name,
        type: entry.isDirectory() ? 'directory' : 'file'
      };

      if (entry.isDirectory()) {
        const subPath = path.join(currentPath, entry.name);
        try {
          entryData.children = await buildTree(subPath);
        } catch (error) {
          // Skip directories we can't access
          console.error(`[ERROR][DIRECTORY_TREE] Failed to access ${subPath}: ${error}`);
          entryData.children = [];
        }
      }

      result.push(entryData);
    }

    return result;
  }

  try {
    // Resolve and validate the path
    const resolvedPath = await resolvePath(dirPath);
    
    // Check if path exists
    if (!(await pathExists(resolvedPath))) {
      throw new Error(`Directory does not exist: ${dirPath}`);
    }
    
    const treeData = await buildTree(resolvedPath);
    return JSON.stringify(treeData, null, 2);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to get directory tree for ${dirPath}: ${errorMessage}`);
  }
}

/**
 * Execute the directory manager tool
 */
export async function execute(input: z.infer<typeof inputSchema>) {
  try {
    switch (input.operation) {
      case 'create_directory': {
        const result = await createDirectory(input.params.path);
        return {
          content: [{ type: 'text', text: result }],
        };
      }
      
      case 'list_directory': {
        const result = await listDirectory(input.params.path);
        return {
          content: [{ type: 'text', text: result }],
        };
      }
      
      case 'directory_tree': {
        const result = await getDirectoryTree(input.params.path);
        return {
          content: [{ type: 'text', text: result }],
        };
      }
      
      default:
        throw new Error(`Unknown operation: ${(input as any).operation}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[DIRECTORY_MANAGER] Error executing operation ${input.operation}: ${errorMessage}`);
    
    // Provide more detailed error message
    let detailedMessage = errorMessage;
    
    // Add specific guidance for common errors
    if (errorMessage.includes('Access to path') || errorMessage.includes('does not exist')) {
      detailedMessage += `\n\nPlease check:
1. The path exists and is accessible
2. The path is within allowed directories
3. The correct operation is being used`;
    }
    
    return {
      content: [{ type: 'text', text: detailedMessage }],
      isError: true,
    };
  }
}