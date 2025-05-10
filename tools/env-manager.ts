// Auto-generated boilerplate for env-manager

import { z } from 'zod';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { execSync } from 'child_process';

// Check for dotenv and install if not present
try {
  require.resolve('dotenv');
} catch (e) {
  console.log('[Dependency] Installing dotenv...');
  execSync('npm install dotenv', { stdio: 'inherit' });
}

export function activate() {
  console.log("[TOOL] env-manager activated");
  
  // Cache environment variables from relevant files
  cacheEnvironmentVariables();
}

// Cache for environment variables
let environmentCache: Record<string, Record<string, string>> = {};

/**
 * Handles file write events to detect env file changes
 */
export function onFileWrite(event: { path: string; content: string }) {
  console.log(`[Env Manager] Watching file write: ${event.path}`);
  
  // Check if it's an environment file
  const filename = path.basename(event.path).toLowerCase();
  if (filename.includes('.env') || filename === 'environment.json' || filename === 'config.json') {
    console.log(`[Env Manager] Detected environment file update: ${event.path}`);
    cacheEnvironmentVariables();
  }
}

/**
 * Handles session start logic
 */
export function onSessionStart(session: { id: string; startTime: number }) {
  console.log(`[Env Manager] Session started: ${session.id}`);
  // Cache environment variables at the start of the session
  cacheEnvironmentVariables();
}

/**
 * Handles env-manager commands
 */
export async function onCommand(command: { name: string; args: any[] }) {
  switch (command.name) {
    case 'env-manager:get':
      console.log('[Env Manager] Getting environment variable...');
      return await handleGetEnvVar(command.args[0]);
    case 'env-manager:set':
      console.log('[Env Manager] Setting environment variable...');
      return await handleSetEnvVar(command.args[0]);
    case 'env-manager:list':
      console.log('[Env Manager] Listing environment variables...');
      return await handleListEnvVars(command.args[0]);
    case 'env-manager:validate':
      console.log('[Env Manager] Validating environment variables...');
      return await handleValidateEnvVars(command.args[0]);
    default:
      console.warn(`[Env Manager] Unknown command: ${command.name}`);
      return { error: `Unknown command: ${command.name}` };
  }
}

// Define schemas for Env Manager tool
export const GetEnvVarSchema = z.object({
  key: z.string(),
  envFile: z.string().optional(),
  defaultValue: z.string().optional(),
  required: z.boolean().optional().default(false),
});

export const SetEnvVarSchema = z.object({
  key: z.string(),
  value: z.string(),
  envFile: z.string().optional().default('.env'),
  createIfNotExists: z.boolean().optional().default(true),
  quote: z.boolean().optional().default(true),
  overwrite: z.boolean().optional().default(true),
  backup: z.boolean().optional().default(true),
});

export const ListEnvVarsSchema = z.object({
  envFile: z.string().optional(),
  mask: z.boolean().optional().default(true),
  filter: z.string().optional(),
  includeSystem: z.boolean().optional().default(false),
  format: z.enum(['json', 'text', 'table']).optional().default('json'),
});

export const ValidateEnvVarsSchema = z.object({
  envFile: z.string().optional(),
  schema: z.record(z.object({
    type: z.enum(['string', 'number', 'boolean', 'url', 'email', 'path']),
    required: z.boolean().optional().default(false),
    defaultValue: z.any().optional(),
    pattern: z.string().optional(),
  })).optional(),
  templateFile: z.string().optional(),
});

/**
 * Caches environment variables from .env files
 */
async function cacheEnvironmentVariables() {
  // Reset cache
  environmentCache = {};
  
  // List of common environment file names
  const envFiles = ['.env', '.env.local', '.env.development', '.env.production', '.env.test'];
  
  // Check each file in the current directory
  for (const envFile of envFiles) {
    try {
      const filePath = path.resolve(process.cwd(), envFile);
      if (fsSync.existsSync(filePath)) {
        const content = await fs.readFile(filePath, 'utf-8');
        const envVars = dotenv.parse(content);
        environmentCache[envFile] = envVars;
      }
    } catch (error) {
      console.error(`[Env Manager] Error reading ${envFile}:`, error);
    }
  }
}

/**
 * Masks sensitive values in environment variables
 */
function maskSensitiveValues(vars: Record<string, string>): Record<string, string> {
  const sensitiveKeys = ['key', 'secret', 'password', 'token', 'auth', 'credential', 'pwd'];
  const masked = { ...vars };
  
  for (const key of Object.keys(masked)) {
    const lowerKey = key.toLowerCase();
    if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
      masked[key] = '*'.repeat(4) + masked[key].slice(-4);
    }
  }
  
  return masked;
}

/**
 * Gets an environment variable
 */
async function handleGetEnvVar(args: any) {
  try {
    const result = GetEnvVarSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for getting environment variable"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const { key, envFile, defaultValue, required } = result.data;
    
    let value: string | undefined = undefined;
    
    // If envFile is specified, look for the variable there
    if (envFile) {
      try {
        const envFilePath = path.resolve(process.cwd(), envFile);
        
        // Check if the file exists
        if (fsSync.existsSync(envFilePath)) {
          // Parse the env file
          const content = await fs.readFile(envFilePath, 'utf-8');
          const envVars = dotenv.parse(content);
          value = envVars[key];
        }
      } catch (error) {
        console.error(`[Env Manager] Error reading ${envFile}:`, error);
      }
    } else {
      // Look for the variable in all cached env files
      for (const [file, vars] of Object.entries(environmentCache)) {
        if (key in vars) {
          value = vars[key];
          break;
        }
      }
      
      // If not found in cache, check process.env
      if (value === undefined) {
        value = process.env[key];
      }
    }
    
    // If value is still not found and required, return an error
    if (value === undefined && required) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: `Required environment variable '${key}' not found`,
            message: "Failed to get environment variable"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    // Use default value if provided and value is undefined
    if (value === undefined && defaultValue !== undefined) {
      value = defaultValue;
    }
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          key,
          value,
          source: envFile || 'process.env',
          exists: value !== undefined,
          message: value !== undefined
            ? `Successfully retrieved environment variable '${key}'`
            : `Environment variable '${key}' not found`
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to get environment variable"
        }, null, 2)
      }],
      isError: true
    };
  }
}

/**
 * Sets an environment variable in a .env file
 */
async function handleSetEnvVar(args: any) {
  try {
    const result = SetEnvVarSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for setting environment variable"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const { key, value, envFile, createIfNotExists, quote, overwrite, backup } = result.data;
    
    // Resolve the path to the .env file
    const envFilePath = path.resolve(process.cwd(), envFile);
    
    // Check if file exists
    const fileExists = fsSync.existsSync(envFilePath);
    
    if (!fileExists && !createIfNotExists) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: `Environment file '${envFile}' does not exist and createIfNotExists is false`,
            message: "Failed to set environment variable"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    // Create the file if it doesn't exist
    if (!fileExists) {
      // Create directory if it doesn't exist
      const dirPath = path.dirname(envFilePath);
      await fs.mkdir(dirPath, { recursive: true });
      
      // Create empty file
      await fs.writeFile(envFilePath, '');
    }
    
    // Backup the file if requested
    if (backup && fileExists) {
      await fs.copyFile(envFilePath, `${envFilePath}.bak`);
    }
    
    // Read the current content
    let content = '';
    if (fileExists) {
      content = await fs.readFile(envFilePath, 'utf-8');
    }
    
    // Format the value
    const formattedValue = quote ? `"${value}"` : value;
    
    // Check if the variable already exists
    const regexPattern = new RegExp(`^${key}=.*`, 'm');
    const keyExists = regexPattern.test(content);
    
    if (keyExists) {
      if (overwrite) {
        // Replace the existing value
        content = content.replace(regexPattern, `${key}=${formattedValue}`);
      } else {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              error: `Environment variable '${key}' already exists and overwrite is false`,
              message: "Failed to set environment variable"
            }, null, 2)
          }],
          isError: true
        };
      }
    } else {
      // Add the new variable to the end of the file
      const newLine = content && !content.endsWith('\n') ? '\n' : '';
      content += `${newLine}${key}=${formattedValue}\n`;
    }
    
    // Write the updated content
    await fs.writeFile(envFilePath, content);
    
    // Update the cache
    await cacheEnvironmentVariables();
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          key,
          value: '*'.repeat(Math.min(value.length, 8)), // Mask the value for security
          envFile,
          operation: keyExists ? 'updated' : 'added',
          message: `Successfully ${keyExists ? 'updated' : 'added'} environment variable '${key}' in ${envFile}`
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to set environment variable"
        }, null, 2)
      }],
      isError: true
    };
  }
}

/**
 * Lists environment variables
 */
async function handleListEnvVars(args: any) {
  try {
    const result = ListEnvVarsSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for listing environment variables"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const { envFile, mask, filter, includeSystem, format } = result.data;
    
    let vars: Record<string, string> = {};
    
    // If envFile is specified, get variables from that file
    if (envFile) {
      try {
        const envFilePath = path.resolve(process.cwd(), envFile);
        
        // Check if the file exists
        if (fsSync.existsSync(envFilePath)) {
          // Parse the env file
          const content = await fs.readFile(envFilePath, 'utf-8');
          vars = dotenv.parse(content);
        } else {
          return {
            content: [{
              type: "text",
              text: JSON.stringify({
                error: `Environment file '${envFile}' does not exist`,
                message: "Failed to list environment variables"
              }, null, 2)
            }],
            isError: true
          };
        }
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              error: String(error),
              message: "Failed to list environment variables"
            }, null, 2)
          }],
          isError: true
        };
      }
    } else {
      // Combine variables from all cached env files
      for (const fileVars of Object.values(environmentCache)) {
        vars = { ...vars, ...fileVars };
      }
      
      // Include system environment variables if requested
      if (includeSystem) {
        // Filter out undefined values from process.env
        const systemEnv: Record<string, string> = {};
        Object.entries(process.env).forEach(([key, value]) => {
          if (value !== undefined) {
            systemEnv[key] = value;
          }
        });
        vars = { ...vars, ...systemEnv };
      }
    }
    
    // Filter variables if a filter is provided
    if (filter) {
      const filtered: Record<string, string> = {};
      for (const [key, value] of Object.entries(vars)) {
        if (key.toLowerCase().includes(filter.toLowerCase())) {
          filtered[key] = value;
        }
      }
      vars = filtered;
    }
    
    // Mask sensitive values if requested
    if (mask) {
      vars = maskSensitiveValues(vars);
    }
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          source: envFile || 'all',
          count: Object.keys(vars).length,
          variables: vars,
          format,
          message: `Found ${Object.keys(vars).length} environment variables`
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to list environment variables"
        }, null, 2)
      }],
      isError: true
    };
  }
}

/**
 * Validates environment variables
 */
async function handleValidateEnvVars(args: any) {
  try {
    const result = ValidateEnvVarsSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for validating environment variables"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const { envFile, schema, templateFile } = result.data;
    
    // Get the environment variables
    let vars: Record<string, string> = {};
    let validationSchema: Record<string, any> = {};
    let envFilePath: string;
    
    // Load the env file
    if (envFile) {
      envFilePath = path.resolve(process.cwd(), envFile);
      if (!fsSync.existsSync(envFilePath)) {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              error: `Environment file '${envFile}' does not exist`,
              message: "Failed to validate environment variables"
            }, null, 2)
          }],
          isError: true
        };
      }
      
      // Parse the env file
      const content = await fs.readFile(envFilePath, 'utf-8');
      vars = dotenv.parse(content);
    } else {
      // Use process.env variables
      // Filter out undefined values
      Object.entries(process.env).forEach(([key, value]) => {
        if (value !== undefined) {
          vars[key] = value;
        }
      });
    }
    
    // Get the validation schema
    if (schema) {
      // Use provided schema
      validationSchema = schema;
    } else if (templateFile) {
      // Load schema from template file
      const templatePath = path.resolve(process.cwd(), templateFile);
      if (!fsSync.existsSync(templatePath)) {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              error: `Template file '${templateFile}' does not exist`,
              message: "Failed to validate environment variables"
            }, null, 2)
          }],
          isError: true
        };
      }
      
      // Parse the template file
      const content = await fs.readFile(templatePath, 'utf-8');
      
      // Check if it's a JSON file
      if (templateFile.endsWith('.json')) {
        validationSchema = JSON.parse(content);
      } else {
        // Assume it's a .env.example or similar file
        const templateVars = dotenv.parse(content);
        
        // Create a basic schema from the template
        for (const key of Object.keys(templateVars)) {
          validationSchema[key] = {
            type: 'string',
            required: true
          };
        }
      }
    } else {
      // Use a default schema based on existing variables
      for (const key of Object.keys(vars)) {
        validationSchema[key] = {
          type: 'string',
          required: true
        };
      }
    }
    
    // Validate the variables
    const issues = [];
    const valid: Record<string, boolean> = {};
    
    for (const [key, schemaItem] of Object.entries(validationSchema)) {
      valid[key] = true;
      
      // Check if required and exists
      if (schemaItem.required && !(key in vars)) {
        valid[key] = false;
        issues.push({
          key,
          issue: 'Required variable is missing',
          severity: 'error'
        });
        continue;
      }
      
      // Skip if it doesn't exist and not required
      if (!(key in vars)) {
        continue;
      }
      
      const value = vars[key];
      
      // Type validation
      switch (schemaItem.type) {
        case 'number':
          if (isNaN(Number(value))) {
            valid[key] = false;
            issues.push({
              key,
              issue: 'Value is not a number',
              severity: 'error'
            });
          }
          break;
        case 'boolean':
          if (!['true', 'false', '0', '1'].includes(value.toLowerCase())) {
            valid[key] = false;
            issues.push({
              key,
              issue: 'Value is not a boolean',
              severity: 'error'
            });
          }
          break;
        case 'url':
          try {
            new URL(value);
          } catch {
            valid[key] = false;
            issues.push({
              key,
              issue: 'Value is not a valid URL',
              severity: 'error'
            });
          }
          break;
        case 'email':
          if (!value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            valid[key] = false;
            issues.push({
              key,
              issue: 'Value is not a valid email',
              severity: 'error'
            });
          }
          break;
        case 'path':
          if (!value.match(/^[\/\\]?[^\/\\]+([\/\\][^\/\\]+)*[\/\\]?$/)) {
            valid[key] = false;
            issues.push({
              key,
              issue: 'Value is not a valid path',
              severity: 'error'
            });
          }
          break;
      }
      
      // Pattern validation
      if (schemaItem.pattern && value) {
        const regex = new RegExp(schemaItem.pattern);
        if (!regex.test(value)) {
          valid[key] = false;
          issues.push({
            key,
            issue: `Value doesn't match pattern: ${schemaItem.pattern}`,
            severity: 'error'
          });
        }
      }
    }
    
    // Check for extra variables
    for (const key of Object.keys(vars)) {
      if (!(key in validationSchema)) {
        issues.push({
          key,
          issue: 'Variable not defined in schema',
          severity: 'warning'
        });
      }
    }
    
    const allValid = issues.every(issue => issue.severity !== 'error');
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          source: envFile || 'process.env',
          valid: allValid,
          issues,
          schema: Object.keys(validationSchema).length,
          variables: Object.keys(vars).length,
          message: allValid
            ? `All environment variables are valid`
            : `Found ${issues.filter(i => i.severity === 'error').length} validation errors`
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to validate environment variables"
        }, null, 2)
      }],
      isError: true
    };
  }
}