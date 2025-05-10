"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPathAllowed = isPathAllowed;
exports.resolvePath = resolvePath;
exports.pathExists = pathExists;
const path = __importStar(require("path"));
const fs = __importStar(require("fs/promises"));
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
async function isPathAllowed(targetPath) {
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
async function resolvePath(targetPath) {
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
    }
    catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error(`Failed to resolve path "${targetPath}": ${error}`);
    }
}
/**
 * Check if a path exists
 */
async function pathExists(targetPath) {
    try {
        if (DEBUG_PATH_VALIDATION) {
            console.error(`[PATH_VALIDATION] Checking if path exists: ${targetPath}`);
        }
        await fs.access(targetPath);
        if (DEBUG_PATH_VALIDATION) {
            console.error(`[PATH_VALIDATION] Path exists: ${targetPath}`);
        }
        return true;
    }
    catch (error) {
        if (DEBUG_PATH_VALIDATION) {
            console.error(`[PATH_VALIDATION] Path does not exist: ${targetPath}`, error);
        }
        return false;
    }
}
