// Auto-generated boilerplate for build-runner

import { z } from 'zod';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';

// Promisified exec for running shell commands
const execAsync = promisify(exec);

export function activate() {
  console.log("[TOOL] build-runner activated");
}

/**
 * Handles file write events that might trigger builds
 */
export function onFileWrite(event: { path: string; content: string }) {
  console.log(`[Build Runner] Watching file write: ${event.path}`);
  
  const fileExt = path.extname(event.path);
  if (isBuildFile(event.path)) {
    console.log(`[Build Runner] Detected build file change: ${event.path}`);
    // Could trigger automated build
  }
}

/**
 * Handles session start logic
 */
export function onSessionStart(session: { id: string; startTime: number }) {
  console.log(`[Build Runner] Session started: ${session.id}`);
}

/**
 * Handles build-runner commands
 */
export async function onCommand(command: { name: string; args: any[] }) {
  switch (command.name) {
    case 'build-runner:run':
      console.log('[Build Runner] Running build...');
      return await handleRunBuild(command.args[0]);
    case 'build-runner:status':
      console.log('[Build Runner] Checking build status...');
      return await handleCheckBuildStatus(command.args[0]);
    case 'build-runner:deploy':
      console.log('[Build Runner] Deploying build...');
      return await handleDeployBuild(command.args[0]);
    case 'build-runner:history':
      console.log('[Build Runner] Getting build history...');
      return await handleGetBuildHistory(command.args[0]);
    default:
      console.warn(`[Build Runner] Unknown command: ${command.name}`);
      return { error: `Unknown command: ${command.name}` };
  }
}

// In-memory store for build processes
const buildProcesses: Record<string, {
  id: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  startTime: number;
  endTime?: number;
  command: string;
  logs: string[];
  exitCode?: number;
}> = {};

// Define schemas for Build Runner tool
export const RunBuildSchema = z.object({
  project: z.string(),
  command: z.string().optional(),
  env: z.record(z.string(), z.string()).optional(),
  workingDir: z.string().optional(),
  buildArgs: z.array(z.string()).optional(),
  buildType: z.enum(['production', 'development', 'staging', 'test']).optional().default('development'),
  timeout: z.number().optional().default(600000), // 10 minutes in ms
});

export const CheckBuildStatusSchema = z.object({
  buildId: z.string(),
});

export const DeployBuildSchema = z.object({
  buildId: z.string(),
  environment: z.enum(['production', 'development', 'staging', 'test']).default('production'),
  deployConfig: z.record(z.string(), z.any()).optional(),
});

export const GetBuildHistorySchema = z.object({
  project: z.string().optional(),
  limit: z.number().optional().default(10),
  status: z.enum(['all', 'success', 'failed', 'running', 'pending']).optional().default('all'),
});

/**
 * Checks if a file is related to builds
 */
function isBuildFile(filePath: string): boolean {
  const basename = path.basename(filePath).toLowerCase();
  return basename.includes('package.json') 
    || basename.includes('webpack')
    || basename.includes('tsconfig')
    || basename.includes('babel')
    || basename.includes('.github/workflows/')
    || basename.includes('dockerfile')
    || basename.includes('docker-compose');
}

/**
 * Runs a build process
 */
async function handleRunBuild(args: any) {
  try {
    const result = RunBuildSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for running build"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const { project, command, env, workingDir, buildArgs, buildType, timeout } = result.data;
    
    // Generate a unique build ID
    const buildId = `build_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Determine the build command to run
    let buildCommand = command;
    if (!buildCommand) {
      // If no command provided, infer from project type
      buildCommand = inferBuildCommand(project, buildType);
    }
    
    // Create build process record
    buildProcesses[buildId] = {
      id: buildId,
      status: 'pending',
      startTime: Date.now(),
      command: buildCommand,
      logs: [],
    };
    
    // In a real implementation, this would run the build process
    // For now, we'll just return a mock success response
    
    // Simulate a successful build
    buildProcesses[buildId].status = 'success';
    buildProcesses[buildId].endTime = Date.now();
    buildProcesses[buildId].exitCode = 0;
    buildProcesses[buildId].logs.push('[INFO] Build started');
    buildProcesses[buildId].logs.push(`[INFO] Running command: ${buildCommand}`);
    buildProcesses[buildId].logs.push('[INFO] Installing dependencies...');
    buildProcesses[buildId].logs.push('[INFO] Building project...');
    buildProcesses[buildId].logs.push('[INFO] Build completed successfully');
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          buildId,
          project,
          buildType,
          command: buildCommand,
          status: 'success',
          duration: buildProcesses[buildId].endTime! - buildProcesses[buildId].startTime,
          logs: buildProcesses[buildId].logs,
          message: `Build completed successfully in ${Math.round((buildProcesses[buildId].endTime! - buildProcesses[buildId].startTime) / 1000)} seconds`
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to run build"
        }, null, 2)
      }],
      isError: true
    };
  }
}

/**
 * Infers the build command based on project type
 */
function inferBuildCommand(project: string, buildType: string): string {
  // Try to detect project type
  let command = '';
  
  // Check if package.json exists
  const packageJsonPath = path.join(project, 'package.json');
  try {
    const stats = fsSync.statSync(packageJsonPath);
    if (stats.isFile()) {
      // It's a node.js project
      if (buildType === 'production') {
        command = 'npm run build';
      } else if (buildType === 'development') {
        command = 'npm run dev';
      } else if (buildType === 'test') {
        command = 'npm test';
      } else {
        command = 'npm run build';
      }
    }
  } catch (error) {
    // package.json not found
  }
  
  // If command is still empty, check for other project types
  if (!command) {
    const hasDocker = fsSync.existsSync(path.join(project, 'Dockerfile')) || fsSync.existsSync(path.join(project, 'docker-compose.yml'));
    const hasMakefile = fsSync.existsSync(path.join(project, 'Makefile'));
    const hasMvn = fsSync.existsSync(path.join(project, 'pom.xml'));
    const hasGradle = fsSync.existsSync(path.join(project, 'build.gradle'));
    
    if (hasDocker) {
      command = 'docker-compose build';
    } else if (hasMakefile) {
      command = 'make build';
    } else if (hasMvn) {
      command = 'mvn clean package';
    } else if (hasGradle) {
      command = './gradlew build';
    } else {
      // Default fallback
      command = 'npm run build';
    }
  }
  
  return command;
}

/**
 * Checks the status of a build
 */
async function handleCheckBuildStatus(args: any) {
  try {
    const result = CheckBuildStatusSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for checking build status"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const { buildId } = result.data;
    
    // Get the build from store
    const build = buildProcesses[buildId];
    
    if (!build) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: `Build ID ${buildId} not found`,
            message: "Failed to get build status"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          buildId,
          status: build.status,
          startTime: new Date(build.startTime).toISOString(),
          endTime: build.endTime ? new Date(build.endTime).toISOString() : undefined,
          duration: build.endTime ? build.endTime - build.startTime : Date.now() - build.startTime,
          exitCode: build.exitCode,
          logs: build.logs,
          message: `Build status: ${build.status}`
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to check build status"
        }, null, 2)
      }],
      isError: true
    };
  }
}

/**
 * Deploys a build to specified environment
 */
async function handleDeployBuild(args: any) {
  try {
    const result = DeployBuildSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for deploying build"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const { buildId, environment, deployConfig } = result.data;
    
    // Get the build from store
    const build = buildProcesses[buildId];
    
    if (!build) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: `Build ID ${buildId} not found`,
            message: "Failed to deploy build"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    // Check if build was successful
    if (build.status !== 'success') {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: `Cannot deploy build with status ${build.status}`,
            message: "Failed to deploy build"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    // In a real implementation, this would deploy the build
    // For now, we'll just return a mock success response
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          buildId,
          environment,
          deploymentId: `deploy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          status: 'success',
          timestamp: new Date().toISOString(),
          message: `Build ${buildId} deployed successfully to ${environment} environment`
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to deploy build"
        }, null, 2)
      }],
      isError: true
    };
  }
}

/**
 * Gets build history for a project
 */
async function handleGetBuildHistory(args: any) {
  try {
    const result = GetBuildHistorySchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for getting build history"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const { project, limit, status } = result.data;
    
    // Filter builds by project and status
    const builds = Object.values(buildProcesses)
      .filter(build => !project || build.command.includes(project))
      .filter(build => status === 'all' || build.status === status)
      .sort((a, b) => b.startTime - a.startTime)
      .slice(0, limit)
      .map(build => ({
        buildId: build.id,
        status: build.status,
        startTime: new Date(build.startTime).toISOString(),
        endTime: build.endTime ? new Date(build.endTime).toISOString() : undefined,
        duration: build.endTime ? build.endTime - build.startTime : undefined,
        command: build.command,
        exitCode: build.exitCode
      }));
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          builds,
          count: builds.length,
          message: `Found ${builds.length} builds in history`
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to get build history"
        }, null, 2)
      }],
      isError: true
    };
  }
}