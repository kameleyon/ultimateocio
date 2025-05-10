import * as path from 'path';
import * as fs from 'fs/promises';

// List of allowed root directories
const ALLOWED_ROOTS = [
  'C:\\Users\\Administrator',
  // Add other allowed roots as needed
];

/**
 * Check if a path is within allowed directories
 */
export async function isPathAllowed(targetPath: string): Promise<boolean> {
  const normalizedPath = path.normalize(targetPath);
  
  return ALLOWED_ROOTS.some(root => normalizedPath.startsWith(root));
}

/**
 * Safely resolve a path, ensuring it's within allowed directories
 */
export async function resolvePath(targetPath: string): Promise<string> {
  const normalizedPath = path.normalize(targetPath);
  
  if (await isPathAllowed(normalizedPath)) {
    return normalizedPath;
  }
  
  throw new Error(`Access to path "${targetPath}" is not allowed`);
}

/**
 * Check if a path exists
 */
export async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}