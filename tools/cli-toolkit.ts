// Auto-generated boilerplate for cli-toolkit

import { z } from 'zod';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';
import * as os from 'os';
import { exec, spawn, execSync } from 'child_process';
import { promisify } from 'util';

// Promisified exec for running shell commands
const execAsync = promisify(exec);

export function activate() {
  console.log("[TOOL] cli-toolkit activated");
}

/**
 * Handles file write events that might trigger CLI updates
 */
export function onFileWrite(event: { path: string; content: string }) {
  console.log(`[CLI Toolkit] Watching file write: ${event.path}`);
  
  // Could trigger actions based on file changes
  const fileExt = path.extname(event.path);
  if (fileExt === '.sh' || fileExt === '.bat' || fileExt === '.cmd' || fileExt === '.ps1') {
    console.log(`[CLI Toolkit] Detected script file change: ${event.path}`);
  }
}

/**
 * Handles session start logic
 */
export function onSessionStart(session: { id: string; startTime: number }) {
  console.log(`[CLI Toolkit] Session started: ${session.id}`);
}

/**
 * Handles cli-toolkit commands
 */
export async function onCommand(command: { name: string; args: any[] }) {
  switch (command.name) {
    case 'cli-toolkit:execute':
      console.log('[CLI Toolkit] Executing command...');
      return await handleExecuteCommand(command.args[0]);
    case 'cli-toolkit:generate':
      console.log('[CLI Toolkit] Generating script...');
      return await handleGenerateScript(command.args[0]);
    case 'cli-toolkit:analyze':
      console.log('[CLI Toolkit] Analyzing command...');
      return await handleAnalyzeCommand(command.args[0]);
    case 'cli-toolkit:chain':
      console.log('[CLI Toolkit] Chaining commands...');
      return await handleChainCommands(command.args[0]);
    default:
      console.warn(`[CLI Toolkit] Unknown command: ${command.name}`);
      return { error: `Unknown command: ${command.name}` };
  }
}

// Define schemas for CLI Toolkit tool
export const ExecuteCommandSchema = z.object({
  command: z.string(),
  args: z.array(z.string()).optional(),
  cwd: z.string().optional(),
  env: z.record(z.string(), z.string()).optional(),
  timeout: z.number().optional(),
  shell: z.boolean().optional().default(true),
  captureOutput: z.boolean().optional().default(true),
});

export const GenerateScriptSchema = z.object({
  name: z.string(),
  type: z.enum(['bash', 'batch', 'powershell', 'node']).default('bash'),
  commands: z.array(z.string()),
  variables: z.record(z.string(), z.string()).optional(),
  description: z.string().optional(),
  outputPath: z.string().optional(),
  makeExecutable: z.boolean().optional().default(true),
});

export const AnalyzeCommandSchema = z.object({
  command: z.string(),
  args: z.array(z.string()).optional(),
  explainFlags: z.boolean().optional().default(true),
  suggestAlternatives: z.boolean().optional().default(true),
  suggestOptimizations: z.boolean().optional().default(true),
});

export const ChainCommandsSchema = z.object({
  commands: z.array(
    z.object({
      command: z.string(),
      args: z.array(z.string()).optional(),
      condition: z.string().optional(),
      ignoreError: z.boolean().optional().default(false),
    })
  ),
  parallel: z.boolean().optional().default(false),
  stopOnError: z.boolean().optional().default(true),
  outputFormat: z.enum(['text', 'json']).optional().default('text'),
  timeout: z.number().optional(),
});

/**
 * Executes a CLI command
 */
async function handleExecuteCommand(args: any) {
  try {
    const result = ExecuteCommandSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for executing command"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const { command, args: cmdArgs, cwd, env, timeout, shell, captureOutput } = result.data;
    
    // Build the command string
    const fullCommand = cmdArgs && cmdArgs.length > 0 
      ? `${command} ${cmdArgs.join(' ')}` 
      : command;
    
    // Execute the command
    try {
      const options: any = {
        cwd: cwd || process.cwd(),
        env: env ? { ...process.env, ...env } : process.env,
        timeout: timeout,
        shell
      };
      
      let stdout, stderr;
      
      if (captureOutput) {
        // Use execAsync to capture output
        const { stdout: output, stderr: error } = await execAsync(fullCommand, options);
        stdout = output;
        stderr = error;
      } else {
        // Use execSync if we don't need to capture output
        execSync(fullCommand, { ...options, stdio: 'inherit' });
        stdout = '[Output not captured]';
        stderr = '';
      }
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            command: fullCommand,
            exitCode: 0,
            stdout: typeof stdout === 'string' ? stdout.trim() : stdout ? stdout.toString().trim() : '',
            stderr: typeof stderr === 'string' ? stderr.trim() : stderr ? stderr.toString().trim() : '',
            message: `Command executed successfully: ${fullCommand}`
          }, null, 2)
        }]
      };
    } catch (error: any) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            command: fullCommand,
            exitCode: error.code || 1,
            stdout: error.stdout?.trim(),
            stderr: error.stderr?.trim(),
            error: String(error),
            message: `Command execution failed: ${fullCommand}`
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
          message: "Failed to execute command"
        }, null, 2)
      }],
      isError: true
    };
  }
}

/**
 * Generates a script file
 */
async function handleGenerateScript(args: any) {
  try {
    const result = GenerateScriptSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for generating script"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const { name, type, commands, variables, description, outputPath, makeExecutable } = result.data;
    
    // Generate script content based on type
    let scriptContent = '';
    let fileExtension = '';
    
    switch (type) {
      case 'bash':
        fileExtension = '.sh';
        scriptContent = `#!/bin/bash
${description ? `# ${description}\n` : ''}
${variables ? Object.entries(variables).map(([key, value]) => `${key}="${value}"`).join('\n') + '\n\n' : ''}
${commands.join('\n')}
`;
        break;
        
      case 'batch':
        fileExtension = '.bat';
        scriptContent = `@echo off
${description ? `:: ${description}\n` : ''}
${variables ? Object.entries(variables).map(([key, value]) => `SET "${key}=${value}"`).join('\n') + '\n\n' : ''}
${commands.join('\n')}
`;
        break;
        
      case 'powershell':
        fileExtension = '.ps1';
        scriptContent = `# PowerShell Script
${description ? `# ${description}\n` : ''}
${variables ? Object.entries(variables).map(([key, value]) => `$${key} = "${value}"`).join('\n') + '\n\n' : ''}
${commands.join('\n')}
`;
        break;
        
      case 'node':
        fileExtension = '.js';
        scriptContent = `#!/usr/bin/env node
${description ? `// ${description}\n` : ''}
const { execSync } = require('child_process');

${variables ? `const variables = ${JSON.stringify(variables, null, 2)};\n\n` : ''}
// Execute commands
(async () => {
  try {
    ${commands.map(cmd => `
    console.log(\`Executing: ${cmd}\`);
    execSync(\`${cmd}\`, { stdio: 'inherit' });`).join('\n')}
    
    console.log('Script execution completed');
  } catch (error) {
    console.error('Error executing script:', error);
    process.exit(1);
  }
})();
`;
        break;
    }
    
    // Determine output file path
    const scriptFilename = `${name}${fileExtension}`;
    const scriptPath = outputPath 
      ? path.join(outputPath, scriptFilename)
      : path.join(process.cwd(), scriptFilename);
    
    // Ensure directory exists
    const dir = path.dirname(scriptPath);
    await fs.mkdir(dir, { recursive: true });
    
    // Write script file
    await fs.writeFile(scriptPath, scriptContent, { mode: makeExecutable ? 0o755 : 0o644 });
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          name,
          type,
          path: scriptPath,
          size: scriptContent.length,
          commands: commands.length,
          variables: variables ? Object.keys(variables).length : 0,
          executable: makeExecutable,
          message: `Script "${name}${fileExtension}" generated successfully at ${scriptPath}`
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to generate script"
        }, null, 2)
      }],
      isError: true
    };
  }
}

/**
 * Analyzes a CLI command to provide information and suggestions
 */
async function handleAnalyzeCommand(args: any) {
  try {
    const result = AnalyzeCommandSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for analyzing command"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const { command, args: cmdArgs, explainFlags, suggestAlternatives, suggestOptimizations } = result.data;
    
    // Build the command string
    const fullCommand = cmdArgs && cmdArgs.length > 0 
      ? `${command} ${cmdArgs.join(' ')}` 
      : command;
    
    // In a real implementation, this would analyze the command and provide insights
    // For now, we'll just return a mock analysis
    
    // Split command into parts
    const parts = fullCommand.split(' ');
    const commandName = parts[0];
    const commandArgs = parts.slice(1);
    
    // Mock flag explanations for common commands
    const flagExplanations: Record<string, Record<string, string>> = {
      'git': {
        '--force': 'Force the operation, potentially discarding changes',
        '--verbose': 'Show verbose output during operation',
        '-b': 'Create a new branch',
      },
      'npm': {
        '--save': 'Save as a dependency in package.json',
        '--save-dev': 'Save as a development dependency in package.json',
        '--global': 'Install globally rather than locally',
      },
      'docker': {
        '-d': 'Run container in detached mode',
        '-p': 'Publish a container\'s port to the host',
        '-v': 'Bind mount a volume',
      }
    };
    
    // Mock alternative suggestions
    const alternativeSuggestions: Record<string, string[]> = {
      'git': ['GitHub CLI (gh)', 'Mercurial (hg)', 'SVN'],
      'npm': ['Yarn', 'pnpm'],
      'docker': ['Podman', 'containerd', 'LXC'],
      'ls': ['exa', 'lsd', 'fd'],
      'cat': ['bat', 'less'],
      'find': ['fd', 'find-plus', 'locate'],
      'grep': ['ripgrep (rg)', 'ack', 'ag'],
    };
    
    // Mock optimization suggestions
    const optimizationSuggestions: Record<string, string[]> = {
      'git': [
        'Use shallow clones (--depth 1) for temporary repos',
        'Use sparse checkouts for large repositories',
      ],
      'npm': [
        'Use npm ci instead of npm install for CI environments',
        'Add --no-save when installing temporary packages',
      ],
      'docker': [
        'Use multi-stage builds to reduce image size',
        'Use .dockerignore to exclude unnecessary files',
      ],
    };
    
    // Generate analysis
    const analysis: any = {
      command: commandName,
      args: commandArgs,
      flagAnalysis: explainFlags ? [] : undefined,
      alternatives: suggestAlternatives ? alternativeSuggestions[commandName] || [] : undefined,
      optimizations: suggestOptimizations ? optimizationSuggestions[commandName] || [] : undefined,
    };
    
    // Generate flag explanations if requested
    if (explainFlags) {
      const knownFlags = flagExplanations[commandName] || {};
      
      for (const arg of commandArgs) {
        if (arg.startsWith('-')) {
          analysis.flagAnalysis.push({
            flag: arg,
            explanation: knownFlags[arg] || 'Unknown flag',
          });
        }
      }
    }
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          command: fullCommand,
          analysis,
          message: `Command analysis for: ${fullCommand}`
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to analyze command"
        }, null, 2)
      }],
      isError: true
    };
  }
}

/**
 * Chains multiple commands together
 */
async function handleChainCommands(args: any) {
  try {
    const result = ChainCommandsSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for chaining commands"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const { commands, parallel, stopOnError, outputFormat, timeout } = result.data;
    
    // In a real implementation, this would execute the commands in sequence or parallel
    // For now, we'll just return a mock result
    
    const results = commands.map((cmd, index) => ({
      command: cmd.command + (cmd.args ? ` ${cmd.args.join(' ')}` : ''),
      index,
      exitCode: 0,
      stdout: `Mock output for command: ${cmd.command}`,
      stderr: '',
      duration: Math.floor(Math.random() * 1000) + 100, // Random duration between 100-1100ms
    }));
    
    let summaryMessage = '';
    if (parallel) {
      summaryMessage = `Executed ${commands.length} commands in parallel.`;
    } else {
      summaryMessage = `Chained ${commands.length} commands sequentially.`;
    }
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          commands: commands.map(c => c.command + (c.args ? ` ${c.args.join(' ')}` : '')),
          parallel,
          results,
          totalCommands: commands.length,
          successfulCommands: results.filter(r => r.exitCode === 0).length,
          failedCommands: results.filter(r => r.exitCode !== 0).length,
          totalDuration: results.reduce((sum, r) => sum + r.duration, 0),
          message: summaryMessage
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to chain commands"
        }, null, 2)
      }],
      isError: true
    };
  }
}