// Auto-generated boilerplate for db-migrator

import { z } from 'zod';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// Supported database types
type DatabaseType = 'postgres' | 'mysql' | 'sqlite' | 'mongodb' | 'generic';

// Migration types
type MigrationType = 'schema' | 'data' | 'seed' | 'rollback';

// Migration file format
interface MigrationFile {
  id: string;
  name: string;
  timestamp: number;
  type: MigrationType;
  database: DatabaseType;
  version: string;
  description: string;
  filePath: string;
  applied: boolean;
  appliedAt?: number;
}

// Database connection configuration
interface DatabaseConfig {
  type: DatabaseType;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database?: string;
  uri?: string;
  options?: Record<string, any>;
}

// Migration state tracking
interface MigrationState {
  lastRun: number;
  appliedMigrations: Record<string, { 
    timestamp: number;
    success: boolean;
  }>;
}

// Migration file template
const MIGRATION_TEMPLATES: Record<DatabaseType, Record<MigrationType, string>> = {
  postgres: {
    schema: `-- Migration: {{name}}
-- Created at: {{timestamp}}
-- Description: {{description}}

-- Up Migration
BEGIN;

-- Add your schema changes here
-- Example:
-- CREATE TABLE example (
--   id SERIAL PRIMARY KEY,
--   name VARCHAR(255) NOT NULL,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

COMMIT;

-- Down Migration
BEGIN;

-- Add your rollback logic here
-- Example:
-- DROP TABLE IF EXISTS example;

COMMIT;
`,
    data: `-- Migration: {{name}}
-- Created at: {{timestamp}}
-- Description: {{description}}

-- Up Migration
BEGIN;

-- Add your data changes here
-- Example:
-- INSERT INTO users (name, email, role) VALUES
--   ('Admin User', 'admin@example.com', 'admin'),
--   ('Test User', 'test@example.com', 'user');

COMMIT;

-- Down Migration
BEGIN;

-- Add your rollback logic here
-- Example:
-- DELETE FROM users WHERE email IN ('admin@example.com', 'test@example.com');

COMMIT;
`,
    seed: `-- Seed: {{name}}
-- Created at: {{timestamp}}
-- Description: {{description}}

BEGIN;

-- Add your seed data here
-- Example:
-- INSERT INTO categories (name, slug) VALUES
--   ('Technology', 'technology'),
--   ('Health', 'health'),
--   ('Finance', 'finance');

COMMIT;
`,
    rollback: `-- Rollback: {{name}}
-- Created at: {{timestamp}}
-- Description: {{description}}

BEGIN;

-- Add your rollback logic here
-- Example:
-- ALTER TABLE users DROP COLUMN IF EXISTS temp_column;
-- DROP TABLE IF EXISTS temporary_table;

COMMIT;
`
  },
  mysql: {
    schema: `-- Migration: {{name}}
-- Created at: {{timestamp}}
-- Description: {{description}}

-- Up Migration
START TRANSACTION;

-- Add your schema changes here
-- Example:
-- CREATE TABLE example (
--   id INT AUTO_INCREMENT PRIMARY KEY,
--   name VARCHAR(255) NOT NULL,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

COMMIT;

-- Down Migration
START TRANSACTION;

-- Add your rollback logic here
-- Example:
-- DROP TABLE IF EXISTS example;

COMMIT;
`,
    data: `-- Migration: {{name}}
-- Created at: {{timestamp}}
-- Description: {{description}}

-- Up Migration
START TRANSACTION;

-- Add your data changes here
-- Example:
-- INSERT INTO users (name, email, role) VALUES
--   ('Admin User', 'admin@example.com', 'admin'),
--   ('Test User', 'test@example.com', 'user');

COMMIT;

-- Down Migration
START TRANSACTION;

-- Add your rollback logic here
-- Example:
-- DELETE FROM users WHERE email IN ('admin@example.com', 'test@example.com');

COMMIT;
`,
    seed: `-- Seed: {{name}}
-- Created at: {{timestamp}}
-- Description: {{description}}

START TRANSACTION;

-- Add your seed data here
-- Example:
-- INSERT INTO categories (name, slug) VALUES
--   ('Technology', 'technology'),
--   ('Health', 'health'),
--   ('Finance', 'finance');

COMMIT;
`,
    rollback: `-- Rollback: {{name}}
-- Created at: {{timestamp}}
-- Description: {{description}}

START TRANSACTION;

-- Add your rollback logic here
-- Example:
-- ALTER TABLE users DROP COLUMN IF EXISTS temp_column;
-- DROP TABLE IF EXISTS temporary_table;

COMMIT;
`
  },
  sqlite: {
    schema: `-- Migration: {{name}}
-- Created at: {{timestamp}}
-- Description: {{description}}

-- Up Migration
PRAGMA foreign_keys=off;
BEGIN TRANSACTION;

-- Add your schema changes here
-- Example:
-- CREATE TABLE example (
--   id INTEGER PRIMARY KEY AUTOINCREMENT,
--   name TEXT NOT NULL,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

COMMIT;
PRAGMA foreign_keys=on;

-- Down Migration
PRAGMA foreign_keys=off;
BEGIN TRANSACTION;

-- Add your rollback logic here
-- Example:
-- DROP TABLE IF EXISTS example;

COMMIT;
PRAGMA foreign_keys=on;
`,
    data: `-- Migration: {{name}}
-- Created at: {{timestamp}}
-- Description: {{description}}

-- Up Migration
BEGIN TRANSACTION;

-- Add your data changes here
-- Example:
-- INSERT INTO users (name, email, role) VALUES
--   ('Admin User', 'admin@example.com', 'admin'),
--   ('Test User', 'test@example.com', 'user');

COMMIT;

-- Down Migration
BEGIN TRANSACTION;

-- Add your rollback logic here
-- Example:
-- DELETE FROM users WHERE email IN ('admin@example.com', 'test@example.com');

COMMIT;
`,
    seed: `-- Seed: {{name}}
-- Created at: {{timestamp}}
-- Description: {{description}}

BEGIN TRANSACTION;

-- Add your seed data here
-- Example:
-- INSERT INTO categories (name, slug) VALUES
--   ('Technology', 'technology'),
--   ('Health', 'health'),
--   ('Finance', 'finance');

COMMIT;
`,
    rollback: `-- Rollback: {{name}}
-- Created at: {{timestamp}}
-- Description: {{description}}

BEGIN TRANSACTION;

-- Add your rollback logic here
-- Example:
-- DROP TABLE IF EXISTS temporary_table;

COMMIT;
`
  },
  mongodb: {
    schema: `// Migration: {{name}}
// Created at: {{timestamp}}
// Description: {{description}}

// Up Migration
module.exports.up = async (db) => {
  // Add your schema changes here
  // Example:
  // await db.createCollection('examples', {
  //   validator: {
  //     $jsonSchema: {
  //       bsonType: 'object',
  //       required: ['name'],
  //       properties: {
  //         name: {
  //           bsonType: 'string',
  //           description: 'Name is required'
  //         },
  //         createdAt: {
  //           bsonType: 'date',
  //           description: 'Creation timestamp'
  //         }
  //       }
  //     }
  //   }
  // });
};

// Down Migration
module.exports.down = async (db) => {
  // Add your rollback logic here
  // Example:
  // await db.collection('examples').drop();
};
`,
    data: `// Migration: {{name}}
// Created at: {{timestamp}}
// Description: {{description}}

// Up Migration
module.exports.up = async (db) => {
  // Add your data changes here
  // Example:
  // await db.collection('users').insertMany([
  //   { name: 'Admin User', email: 'admin@example.com', role: 'admin' },
  //   { name: 'Test User', email: 'test@example.com', role: 'user' }
  // ]);
};

// Down Migration
module.exports.down = async (db) => {
  // Add your rollback logic here
  // Example:
  // await db.collection('users').deleteMany({
  //   email: { $in: ['admin@example.com', 'test@example.com'] }
  // });
};
`,
    seed: `// Seed: {{name}}
// Created at: {{timestamp}}
// Description: {{description}}

module.exports = async (db) => {
  // Add your seed data here
  // Example:
  // await db.collection('categories').insertMany([
  //   { name: 'Technology', slug: 'technology' },
  //   { name: 'Health', slug: 'health' },
  //   { name: 'Finance', slug: 'finance' }
  // ]);
};
`,
    rollback: `// Rollback: {{name}}
// Created at: {{timestamp}}
// Description: {{description}}

module.exports = async (db) => {
  // Add your rollback logic here
  // Example:
  // await db.collection('users').updateMany({}, { $unset: { tempField: "" } });
};
`
  },
  generic: {
    schema: `-- Migration: {{name}}
-- Created at: {{timestamp}}
-- Description: {{description}}

-- Up Migration
-- Add your schema changes here

-- Down Migration
-- Add your rollback logic here
`,
    data: `-- Migration: {{name}}
-- Created at: {{timestamp}}
-- Description: {{description}}

-- Up Migration
-- Add your data changes here

-- Down Migration
-- Add your rollback logic here
`,
    seed: `-- Seed: {{name}}
-- Created at: {{timestamp}}
-- Description: {{description}}

-- Add your seed data here
`,
    rollback: `-- Rollback: {{name}}
-- Created at: {{timestamp}}
-- Description: {{description}}

-- Add your rollback logic here
`
  }
};

// State tracking file
const STATE_FILE = 'migration-state.json';

// Default migration settings
const DEFAULT_SETTINGS = {
  migrationsDir: 'migrations',
  dbType: 'postgres' as DatabaseType,
  nameSeparator: '_',
  filenameFormat: '{timestamp}_{name}_{type}.sql',
  createSubdirectories: true,
};

// Current settings
let currentSettings = { ...DEFAULT_SETTINGS };

// Initialize migration state
let migrationState: MigrationState = {
  lastRun: 0,
  appliedMigrations: {}
};

export function activate() {
  console.log("[TOOL] db-migrator activated");
  
  // Load settings and state
  loadSettingsAndState();
}

/**
 * Load settings and migration state
 */
function loadSettingsAndState() {
  try {
    // Load custom settings if they exist
    if (fsSync.existsSync('db-migrator.json')) {
      const settings = JSON.parse(fsSync.readFileSync('db-migrator.json', 'utf8'));
      currentSettings = { ...DEFAULT_SETTINGS, ...settings };
      console.log('[DB Migrator] Loaded custom settings');
    }
    
    // Create migrations directory if it doesn't exist
    const migrationsDir = currentSettings.migrationsDir;
    if (!fsSync.existsSync(migrationsDir)) {
      fsSync.mkdirSync(migrationsDir, { recursive: true });
      console.log(`[DB Migrator] Created migrations directory: ${migrationsDir}`);
    }
    
    // Load state if it exists
    const stateFilePath = path.join(migrationsDir, STATE_FILE);
    if (fsSync.existsSync(stateFilePath)) {
      migrationState = JSON.parse(fsSync.readFileSync(stateFilePath, 'utf8'));
      console.log('[DB Migrator] Loaded migration state');
    } else {
      // Initialize state file
      saveState();
      console.log('[DB Migrator] Initialized migration state');
    }
  } catch (error) {
    console.error('[DB Migrator] Error loading settings and state:', error);
  }
}

/**
 * Save migration state
 */
async function saveState() {
  try {
    const stateFilePath = path.join(currentSettings.migrationsDir, STATE_FILE);
    await fs.writeFile(stateFilePath, JSON.stringify(migrationState, null, 2), 'utf8');
  } catch (error) {
    console.error('[DB Migrator] Error saving state:', error);
  }
}

/**
 * Handles file write events
 */
export function onFileWrite(event: { path: string; content: string }) {
  // Check if file is a migration file
  if (event.path.includes(currentSettings.migrationsDir) && !event.path.endsWith(STATE_FILE)) {
    console.log(`[DB Migrator] Detected changes to migration file: ${event.path}`);
  }
}

/**
 * Handles session start logic
 */
export function onSessionStart(session: { id: string; startTime: number }) {
  console.log(`[DB Migrator] Session started: ${session.id}`);
  
  // Reload settings and state
  loadSettingsAndState();
}

/**
 * Handles db-migrator commands
 */
export async function onCommand(command: { name: string; args: any[] }) {
  switch (command.name) {
    case 'db-migrator:create':
      console.log('[DB Migrator] Creating migration...');
      return await handleCreateMigration(command.args[0]);
    case 'db-migrator:run':
      console.log('[DB Migrator] Running migrations...');
      return await handleRunMigrations(command.args[0]);
    case 'db-migrator:status':
      console.log('[DB Migrator] Checking migration status...');
      return await handleMigrationStatus(command.args[0]);
    case 'db-migrator:rollback':
      console.log('[DB Migrator] Rolling back migrations...');
      return await handleRollbackMigration(command.args[0]);
    case 'db-migrator:configure':
      console.log('[DB Migrator] Configuring migrator...');
      return await handleConfigureMigrator(command.args[0]);
    default:
      console.warn(`[DB Migrator] Unknown command: ${command.name}`);
      return { error: `Unknown command: ${command.name}` };
  }
}

// Define schemas for DB Migrator tool
export const CreateMigrationSchema = z.object({
  name: z.string(),
  type: z.enum(['schema', 'data', 'seed', 'rollback']).default('schema'),
  database: z.enum(['postgres', 'mysql', 'sqlite', 'mongodb', 'generic']).optional(),
  description: z.string().optional(),
  timestamp: z.number().optional(),
  customContent: z.string().optional(),
});

export const RunMigrationsSchema = z.object({
  target: z.string().optional(), // Can be a specific migration ID or 'latest'
  types: z.array(z.enum(['schema', 'data', 'seed'])).optional(),
  dryRun: z.boolean().optional().default(false),
  connection: z.object({
    type: z.enum(['postgres', 'mysql', 'sqlite', 'mongodb']),
    host: z.string().optional(),
    port: z.number().optional(),
    username: z.string().optional(),
    password: z.string().optional(),
    database: z.string().optional(),
    uri: z.string().optional(),
    options: z.record(z.any()).optional(),
  }).optional(),
});

export const MigrationStatusSchema = z.object({
  detailed: z.boolean().optional().default(false),
  types: z.array(z.enum(['schema', 'data', 'seed', 'rollback'])).optional(),
});

export const RollbackMigrationSchema = z.object({
  migration: z.string().optional(), // Migration ID to roll back to
  steps: z.number().optional().default(1), // Number of migrations to roll back
  dryRun: z.boolean().optional().default(false),
  connection: z.object({
    type: z.enum(['postgres', 'mysql', 'sqlite', 'mongodb']),
    host: z.string().optional(),
    port: z.number().optional(),
    username: z.string().optional(),
    password: z.string().optional(),
    database: z.string().optional(),
    uri: z.string().optional(),
    options: z.record(z.any()).optional(),
  }).optional(),
});

export const ConfigureMigratorSchema = z.object({
  migrationsDir: z.string().optional(),
  dbType: z.enum(['postgres', 'mysql', 'sqlite', 'mongodb', 'generic']).optional(),
  nameSeparator: z.string().optional(),
  filenameFormat: z.string().optional(),
  createSubdirectories: z.boolean().optional(),
});

/**
 * Generate a timestamp for migration filenames
 */
function generateTimestamp(): number {
  return Date.now();
}

/**
 * Generate a migration ID
 */
function generateMigrationId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

/**
 * Process template with replacements
 */
function processTemplate(template: string, replacements: Record<string, string>): string {
  let result = template;
  
  for (const [key, value] of Object.entries(replacements)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  
  return result;
}

/**
 * Create a migration file
 */
async function createMigrationFile(options: {
  name: string;
  type: MigrationType;
  database: DatabaseType;
  description?: string;
  timestamp?: number;
  customContent?: string;
}): Promise<MigrationFile> {
  const timestamp = options.timestamp || generateTimestamp();
  const id = generateMigrationId();
  const description = options.description || `${options.type} migration for ${options.name}`;
  
  // Create subdirectory if enabled
  let migrationsDir = currentSettings.migrationsDir;
  if (currentSettings.createSubdirectories) {
    migrationsDir = path.join(migrationsDir, options.type);
    if (!fsSync.existsSync(migrationsDir)) {
      await fs.mkdir(migrationsDir, { recursive: true });
    }
  }
  
  // Format the filename
  const formattedName = options.name.replace(/\s+/g, currentSettings.nameSeparator);
  const filename = currentSettings.filenameFormat
    .replace('{timestamp}', timestamp.toString())
    .replace('{name}', formattedName)
    .replace('{type}', options.type);
  
  const filePath = path.join(migrationsDir, filename);
  
  // Generate content using template
  let content: string;
  
  if (options.customContent) {
    content = options.customContent;
  } else {
    const template = MIGRATION_TEMPLATES[options.database][options.type];
    content = processTemplate(template, {
      name: options.name,
      timestamp: new Date(timestamp).toISOString(),
      description
    });
  }
  
  // Write the migration file
  await fs.writeFile(filePath, content, 'utf8');
  
  // Create migration record
  const migration: MigrationFile = {
    id,
    name: options.name,
    timestamp,
    type: options.type,
    database: options.database,
    version: '1.0',
    description,
    filePath,
    applied: false
  };
  
  return migration;
}

/**
 * Get all migration files
 */
async function getMigrationFiles(): Promise<MigrationFile[]> {
  const migrations: MigrationFile[] = [];
  
  // Determine search paths based on subdirectory setting
  const searchPaths = currentSettings.createSubdirectories
    ? ['schema', 'data', 'seed', 'rollback'].map(type => path.join(currentSettings.migrationsDir, type))
    : [currentSettings.migrationsDir];
  
  for (const searchPath of searchPaths) {
    if (!fsSync.existsSync(searchPath)) {
      continue;
    }
    
    const files = await fs.readdir(searchPath);
    
    for (const file of files) {
      if (file === STATE_FILE || !file.includes('_')) {
        continue;
      }
      
      const filePath = path.join(searchPath, file);
      const fileStat = await fs.stat(filePath);
      
      if (!fileStat.isFile()) {
        continue;
      }
      
      try {
        // Extract information from filename
        const filenameParts = path.basename(file, path.extname(file)).split('_');
        if (filenameParts.length < 3) {
          continue; // Not a valid migration filename
        }
        
        const timestampStr = filenameParts[0];
        const type = filenameParts[filenameParts.length - 1] as MigrationType;
        const name = filenameParts.slice(1, -1).join('_');
        
        if (!['schema', 'data', 'seed', 'rollback'].includes(type)) {
          continue; // Not a valid migration type
        }
        
        const timestamp = parseInt(timestampStr, 10);
        if (isNaN(timestamp)) {
          continue; // Not a valid timestamp
        }
        
        // Read file content to extract description
        const content = await fs.readFile(filePath, 'utf8');
        const descriptionMatch = content.match(/-- Description: (.*)$/m) || 
                                content.match(/\/\/ Description: (.*)$/m);
        const description = descriptionMatch ? descriptionMatch[1].trim() : '';
        
        // Determine database type
        let database: DatabaseType = currentSettings.dbType;
        if (content.includes('BEGIN TRANSACTION') && content.includes('COMMIT')) {
          database = 'sqlite';
        } else if (content.includes('START TRANSACTION') && content.includes('COMMIT')) {
          database = 'mysql';
        } else if (content.includes('BEGIN;') && content.includes('COMMIT;')) {
          database = 'postgres';
        } else if (content.includes('module.exports')) {
          database = 'mongodb';
        }
        
        // Create migration record
        const id = generateMigrationId(); // Would be better to have consistent IDs
        
        const migration: MigrationFile = {
          id,
          name,
          timestamp,
          type,
          database,
          version: '1.0',
          description,
          filePath,
          applied: migrationState.appliedMigrations[filePath] ? true : false,
          appliedAt: migrationState.appliedMigrations[filePath]?.timestamp
        };
        
        migrations.push(migration);
      } catch (error) {
        console.error(`[DB Migrator] Error processing migration file ${file}:`, error);
      }
    }
  }
  
  // Sort migrations by timestamp
  migrations.sort((a, b) => a.timestamp - b.timestamp);
  
  return migrations;
}

/**
 * Handles creating a migration
 */
async function handleCreateMigration(args: any) {
  try {
    const result = CreateMigrationSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for creating migration"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const {
      name,
      type,
      database = currentSettings.dbType,
      description,
      timestamp,
      customContent
    } = result.data;
    
    // Create the migration file
    const migration = await createMigrationFile({
      name,
      type,
      database,
      description,
      timestamp,
      customContent
    });
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          id: migration.id,
          name: migration.name,
          type: migration.type,
          database: migration.database,
          filePath: migration.filePath,
          timestamp: migration.timestamp,
          message: `Successfully created ${type} migration: ${name}`
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to create migration"
        }, null, 2)
      }],
      isError: true
    };
  }
}

/**
 * Handles running migrations
 */
async function handleRunMigrations(args: any) {
  try {
    const result = RunMigrationsSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for running migrations"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const {
      target,
      types = ['schema', 'data', 'seed'],
      dryRun,
      connection
    } = result.data;
    
    // Get all migration files
    const allMigrations = await getMigrationFiles();
    
    // Filter migrations by type
    const filteredMigrations = allMigrations.filter(m =>
      types.includes(m.type as 'schema' | 'data' | 'seed') && !m.applied
    );
    
    // Determine which migrations to run
    let migrationsToRun = filteredMigrations;
    
    if (target === 'latest') {
      // Already filtered to pending migrations
    } else if (target) {
      // Find the target migration
      const targetIndex = allMigrations.findIndex(m => m.id === target || m.filePath.includes(target));
      if (targetIndex === -1) {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              error: `Target migration not found: ${target}`,
              message: "Failed to run migrations"
            }, null, 2)
          }],
          isError: true
        };
      }
      
      // Get all migrations up to and including the target
      const targetMigrations = allMigrations.slice(0, targetIndex + 1);
      
      // Filter to only pending migrations that are in our target set
      migrationsToRun = filteredMigrations.filter(m => 
        targetMigrations.some(tm => tm.id === m.id)
      );
    }
    
    // Simulate running migrations in dry run mode
    if (dryRun) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            migrations: migrationsToRun.map(m => ({
              id: m.id,
              name: m.name,
              type: m.type,
              filePath: m.filePath
            })),
            count: migrationsToRun.length,
            dryRun: true,
            message: `Would run ${migrationsToRun.length} migrations (dry run)`
          }, null, 2)
        }]
      };
    }
    
    // In a real implementation, this would connect to the database and execute migrations
    // For the boilerplate, we'll just simulate running the migrations
    
    const results = [];
    const now = Date.now();
    
    for (const migration of migrationsToRun) {
      // Simulate running the migration
      console.log(`[DB Migrator] Running migration: ${migration.name}`);
      
      // Mark as applied in the state
      migrationState.appliedMigrations[migration.filePath] = {
        timestamp: now,
        success: true
      };
      
      // Update last run timestamp
      migrationState.lastRun = now;
      
      results.push({
        id: migration.id,
        name: migration.name,
        type: migration.type,
        filePath: migration.filePath,
        success: true
      });
    }
    
    // Save the updated state
    await saveState();
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          migrations: results,
          count: results.length,
          timestamp: now,
          message: `Successfully ran ${results.length} migrations`
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to run migrations"
        }, null, 2)
      }],
      isError: true
    };
  }
}

/**
 * Handles checking migration status
 */
async function handleMigrationStatus(args: any) {
  try {
    const result = MigrationStatusSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for checking migration status"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const { detailed, types } = result.data;
    
    // Get all migration files
    const allMigrations = await getMigrationFiles();
    
    // Filter by type if specified
    const filteredMigrations = types
      ? allMigrations.filter(m => types.includes(m.type))
      : allMigrations;
    
    // Calculate status summary
    const pending = filteredMigrations.filter(m => !m.applied);
    const applied = filteredMigrations.filter(m => m.applied);
    
    const typeCounts = filteredMigrations.reduce((acc, m) => {
      acc[m.type] = (acc[m.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Create status report
    const status: {
      total: number;
      applied: number;
      pending: number;
      lastRun: string | null;
      types: Record<string, number>;
      migrations?: any[];
      pendingMigrations?: string[];
    } = {
      total: filteredMigrations.length,
      applied: applied.length,
      pending: pending.length,
      lastRun: migrationState.lastRun > 0 ? new Date(migrationState.lastRun).toISOString() : null,
      types: typeCounts
    };
    
    // Add detailed information if requested
    if (detailed) {
      status.migrations = filteredMigrations.map(m => ({
        id: m.id,
        name: m.name,
        type: m.type,
        timestamp: m.timestamp,
        filePath: m.filePath,
        applied: m.applied,
        appliedAt: m.appliedAt ? new Date(m.appliedAt).toISOString() : null
      }));
    } else {
      status.pendingMigrations = pending.map(m => m.name);
    }
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          status,
          message: `${applied.length} of ${filteredMigrations.length} migrations applied, ${pending.length} pending`
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to check migration status"
        }, null, 2)
      }],
      isError: true
    };
  }
}

/**
 * Handles rolling back migrations
 */
async function handleRollbackMigration(args: any) {
  try {
    const result = RollbackMigrationSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for rolling back migrations"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const {
      migration,
      steps,
      dryRun,
      connection
    } = result.data;
    
    // Get all migration files
    const allMigrations = await getMigrationFiles();
    
    // Filter to only applied migrations and sort in reverse chronological order
    const appliedMigrations = allMigrations
      .filter(m => m.applied)
      .sort((a, b) => b.timestamp - a.timestamp);
    
    // Determine which migrations to roll back
    let migrationsToRollback: MigrationFile[] = [];
    
    if (migration) {
      // Find the target migration
      const targetIndex = allMigrations.findIndex(m => 
        m.id === migration || m.filePath.includes(migration)
      );
      
      if (targetIndex === -1) {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              error: `Target migration not found: ${migration}`,
              message: "Failed to roll back migrations"
            }, null, 2)
          }],
          isError: true
        };
      }
      
      // Get all migrations after the target
      migrationsToRollback = appliedMigrations.filter(m => {
        const index = allMigrations.findIndex(am => am.id === m.id);
        return index > targetIndex;
      });
    } else {
      // Roll back the specified number of migrations
      migrationsToRollback = appliedMigrations.slice(0, steps);
    }
    
    // Simulate rolling back in dry run mode
    if (dryRun) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            migrations: migrationsToRollback.map(m => ({
              id: m.id,
              name: m.name,
              type: m.type,
              filePath: m.filePath
            })),
            count: migrationsToRollback.length,
            dryRun: true,
            message: `Would roll back ${migrationsToRollback.length} migrations (dry run)`
          }, null, 2)
        }]
      };
    }
    
    // In a real implementation, this would connect to the database and execute rollbacks
    // For the boilerplate, we'll just simulate rolling back
    
    const results = [];
    
    for (const migration of migrationsToRollback) {
      // Simulate rolling back the migration
      console.log(`[DB Migrator] Rolling back migration: ${migration.name}`);
      
      // Remove from applied migrations
      if (migrationState.appliedMigrations[migration.filePath]) {
        delete migrationState.appliedMigrations[migration.filePath];
      }
      
      results.push({
        id: migration.id,
        name: migration.name,
        type: migration.type,
        filePath: migration.filePath,
        success: true
      });
    }
    
    // Save the updated state
    await saveState();
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          migrations: results,
          count: results.length,
          message: `Successfully rolled back ${results.length} migrations`
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to roll back migrations"
        }, null, 2)
      }],
      isError: true
    };
  }
}

/**
 * Handles configuring the migrator
 */
async function handleConfigureMigrator(args: any) {
  try {
    const result = ConfigureMigratorSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for configuring migrator"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    // Get current settings
    const oldSettings = { ...currentSettings };
    
    // Update settings with provided values
    currentSettings = {
      ...currentSettings,
      ...result.data
    };
    
    // Save settings to file
    await fs.writeFile('db-migrator.json', JSON.stringify(currentSettings, null, 2), 'utf8');
    
    // Create migrations directory if it doesn't exist
    if (currentSettings.migrationsDir !== oldSettings.migrationsDir) {
      if (!fsSync.existsSync(currentSettings.migrationsDir)) {
        fsSync.mkdirSync(currentSettings.migrationsDir, { recursive: true });
        console.log(`[DB Migrator] Created migrations directory: ${currentSettings.migrationsDir}`);
      }
      
      // Move state file if it exists
      const oldStatePath = path.join(oldSettings.migrationsDir, STATE_FILE);
      const newStatePath = path.join(currentSettings.migrationsDir, STATE_FILE);
      
      if (fsSync.existsSync(oldStatePath)) {
        fsSync.copyFileSync(oldStatePath, newStatePath);
        console.log(`[DB Migrator] Moved state file to new directory`);
      }
    }
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          oldSettings,
          newSettings: currentSettings,
          message: "Successfully configured DB Migrator"
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to configure migrator"
        }, null, 2)
      }],
      isError: true
    };
  }
}