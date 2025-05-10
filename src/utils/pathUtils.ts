import * as path from 'path';
import * as fs from 'fs/promises';

// List of allowed root directories
const ALLOWED_ROOTS = [
  'C:\\Users\\Administrator',
  'C:\\Users',
  'C:\\',
  process.cwd(),
  path.resolve(process.cwd()),
  path.resolve('.'),
  path.resolve('./'),
  // Add other allowed roots as needed
];

// Debug logging for path validation
const DEBUG_PATH_VALIDATION = true;

/**
 * Check if a path is within allowed directories
 */
export async function isPathAllowed(targetPath: string): Promise<boolean> {
  // Handle both Windows and Unix-style paths
  const normalizedPath = path.normalize(targetPath).replace(/\//g, '\\');
  
  // For debugging
  if (DEBUG_PATH_VALIDATION) {
    console.error(`[PATH_VALIDATION] Checking if path is allowed: ${targetPath}`);
    console.error(`[PATH_VALIDATION] Normalized path: ${normalizedPath}`);
    console.error(`[PATH_VALIDATION] Allowed roots: ${ALLOWED_ROOTS.join(', ')}`);
  }
  
  const isAllowed = ALLOWED_ROOTS.some(root => {
    const normalizedRoot = path.normalize(root).replace(/\//g, '\\');
    const startsWith = normalizedPath.startsWith(normalizedRoot);
    
    if (DEBUG_PATH_VALIDATION) {
      console.error(`[PATH_VALIDATION] Checking against root: ${normalizedRoot} => ${startsWith ? 'ALLOWED' : 'DENIED'}`);
    }
    
    return startsWith;
  });
  
  if (DEBUG_PATH_VALIDATION) {
    console.error(`[PATH_VALIDATION] Final result for ${normalizedPath}: ${isAllowed ? 'ALLOWED' : 'DENIED'}`);
  }
  
  return isAllowed;
}

/**
 * Safely resolve a path, ensuring it's within allowed directories
 */
export async function resolvePath(targetPath: string): Promise<string> {
  try {
    // Handle relative paths
    let resolvedPath = targetPath;
    if (!path.isAbsolute(targetPath)) {
      resolvedPath = path.resolve(process.cwd(), targetPath);
      
      if (DEBUG_PATH_VALIDATION) {
        console.error(`[PATH_VALIDATION] Resolved relative path "${targetPath}" to "${resolvedPath}"`);
      }
    }
    
    // Normalize the path
    const normalizedPath = path.normalize(resolvedPath).replace(/\//g, '\\');
    
    if (await isPathAllowed(normalizedPath)) {
      return normalizedPath;
    }
    
    throw new Error(`Access to path "${targetPath}" is not allowed. Normalized path: ${normalizedPath}`);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to resolve path "${targetPath}": ${error}`);
  }
}

/**
 * Check if a path exists
 */
export async function pathExists(targetPath: string): Promise<boolean> {
  try {
    if (DEBUG_PATH_VALIDATION) {
      console.error(`[PATH_VALIDATION] Checking if path exists: ${targetPath}`);
    }
    
    await fs.access(targetPath);
    
    if (DEBUG_PATH_VALIDATION) {
      console.error(`[PATH_VALIDATION] Path exists: ${targetPath}`);
    }
    
    return true;
  } catch (error) {
    if (DEBUG_PATH_VALIDATION) {
      console.error(`[PATH_VALIDATION] Path does not exist: ${targetPath}`, error);
    }
    
    return false;
  }
}