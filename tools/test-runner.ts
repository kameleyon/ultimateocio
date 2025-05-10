// Auto-generated boilerplate for test-runner

import { z } from 'zod';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// Types of test frameworks supported
type TestFramework = 'jest' | 'mocha' | 'vitest' | 'jasmine' | 'karma' | 'cypress' | 'playwright' | 'generic';

// Test result types
type TestResultStatus = 'passed' | 'failed' | 'skipped' | 'pending' | 'unknown';

// Test result interface
interface TestResult {
  name: string;
  fullName?: string;
  status: TestResultStatus;
  duration: number;
  errorMessage?: string;
  errorStack?: string;
  file?: string;
  line?: number;
  column?: number;
}

// Suite result interface
interface TestSuiteResult {
  name: string;
  path?: string;
  status: TestResultStatus;
  duration: number;
  tests: TestResult[];
  suites?: TestSuiteResult[];
  passed: number;
  failed: number;
  skipped: number;
}

// Test run info
interface TestRunInfo {
  id: string;
  framework: TestFramework;
  timestamp: number;
  duration: number;
  status: 'running' | 'completed' | 'failed';
  command: string;
  results?: {
    suites: TestSuiteResult[];
    summary: {
      total: number;
      passed: number;
      failed: number;
      skipped: number;
      duration: number;
      coverage?: {
        lines: number;
        statements: number;
        functions: number;
        branches: number;
      };
    };
  };
  logs: string[];
  error?: string;
}

// In-memory cache of test run history
const testRunHistory: TestRunInfo[] = [];

// Last detected test framework
let detectedFramework: TestFramework = 'generic';

// Test script cache - avoid re-scanning
const testScriptCache: { [key: string]: string } = {};

export function activate() {
  console.log("[TOOL] test-runner activated");
  
  // Auto-detect test framework
  detectTestFramework();
}

/**
 * Auto-detect the test framework used in the project
 */
function detectTestFramework(): TestFramework {
  try {
    // Look for package.json
    if (fsSync.existsSync('package.json')) {
      const packageJson = JSON.parse(fsSync.readFileSync('package.json', 'utf8'));
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      // Check for Jest
      if (dependencies.jest || packageJson.scripts?.test?.includes('jest')) {
        console.log('[Test Runner] Detected Jest framework');
        detectedFramework = 'jest';
        return 'jest';
      }
      
      // Check for Vitest
      if (dependencies.vitest || packageJson.scripts?.test?.includes('vitest')) {
        console.log('[Test Runner] Detected Vitest framework');
        detectedFramework = 'vitest';
        return 'vitest';
      }
      
      // Check for Mocha
      if (dependencies.mocha || packageJson.scripts?.test?.includes('mocha')) {
        console.log('[Test Runner] Detected Mocha framework');
        detectedFramework = 'mocha';
        return 'mocha';
      }
      
      // Check for Jasmine
      if (dependencies.jasmine || packageJson.scripts?.test?.includes('jasmine')) {
        console.log('[Test Runner] Detected Jasmine framework');
        detectedFramework = 'jasmine';
        return 'jasmine';
      }
      
      // Check for Karma
      if (dependencies.karma || packageJson.scripts?.test?.includes('karma')) {
        console.log('[Test Runner] Detected Karma framework');
        detectedFramework = 'karma';
        return 'karma';
      }
      
      // Check for Cypress
      if (dependencies.cypress || packageJson.scripts?.test?.includes('cypress')) {
        console.log('[Test Runner] Detected Cypress framework');
        detectedFramework = 'cypress';
        return 'cypress';
      }
      
      // Check for Playwright
      if (dependencies.playwright || packageJson.scripts?.test?.includes('playwright')) {
        console.log('[Test Runner] Detected Playwright framework');
        detectedFramework = 'playwright';
        return 'playwright';
      }
    }
    
    // Look for config files if no framework detected in package.json
    if (fsSync.existsSync('jest.config.js') || fsSync.existsSync('jest.config.json')) {
      console.log('[Test Runner] Detected Jest framework (config file)');
      detectedFramework = 'jest';
      return 'jest';
    }
    
    if (fsSync.existsSync('vitest.config.js') || fsSync.existsSync('vitest.config.ts')) {
      console.log('[Test Runner] Detected Vitest framework (config file)');
      detectedFramework = 'vitest';
      return 'vitest';
    }
    
    if (fsSync.existsSync('.mocharc.js') || fsSync.existsSync('.mocharc.json')) {
      console.log('[Test Runner] Detected Mocha framework (config file)');
      detectedFramework = 'mocha';
      return 'mocha';
    }
    
    if (fsSync.existsSync('karma.conf.js')) {
      console.log('[Test Runner] Detected Karma framework (config file)');
      detectedFramework = 'karma';
      return 'karma';
    }
    
    if (fsSync.existsSync('cypress.json') || fsSync.existsSync('cypress.config.js')) {
      console.log('[Test Runner] Detected Cypress framework (config file)');
      detectedFramework = 'cypress';
      return 'cypress';
    }
    
    if (fsSync.existsSync('playwright.config.js') || fsSync.existsSync('playwright.config.ts')) {
      console.log('[Test Runner] Detected Playwright framework (config file)');
      detectedFramework = 'playwright';
      return 'playwright';
    }
    
    // Check for npm test script
    if (fsSync.existsSync('package.json')) {
      const packageJson = JSON.parse(fsSync.readFileSync('package.json', 'utf8'));
      if (packageJson.scripts?.test) {
        console.log('[Test Runner] Detected custom test script:', packageJson.scripts.test);
        return 'generic';
      }
    }
    
    // No framework detected
    console.log('[Test Runner] No specific test framework detected, using generic');
    return 'generic';
  } catch (error) {
    console.error('[Test Runner] Error detecting test framework:', error);
    return 'generic';
  }
}

/**
 * Get the test script from package.json
 */
function getTestScript(): string | null {
  try {
    if (fsSync.existsSync('package.json')) {
      const packageJson = JSON.parse(fsSync.readFileSync('package.json', 'utf8'));
      if (packageJson.scripts?.test) {
        return packageJson.scripts.test;
      }
    }
    return null;
  } catch (error) {
    console.error('[Test Runner] Error reading package.json:', error);
    return null;
  }
}

/**
 * Handles file write events
 */
export function onFileWrite(event: { path: string; content: string }) {
  // Check if file is a test file
  if (isTestFile(event.path)) {
    console.log(`[Test Runner] Detected changes to test file: ${event.path}`);
    // Could implement automatic test running here
  }
}

/**
 * Check if a file is a test file
 */
function isTestFile(filePath: string): boolean {
  const filename = path.basename(filePath);
  return (
    filename.includes('.test.') ||
    filename.includes('.spec.') ||
    filename.endsWith('Test.js') ||
    filename.endsWith('Test.ts') ||
    filename.endsWith('Tests.js') ||
    filename.endsWith('Tests.ts') ||
    filename.endsWith('Spec.js') ||
    filename.endsWith('Spec.ts') ||
    /__(tests|specs)__/.test(filePath)
  );
}

/**
 * Handles session start logic
 */
export function onSessionStart(session: { id: string; startTime: number }) {
  console.log(`[Test Runner] Session started: ${session.id}`);
  
  // Re-detect framework on session start
  detectTestFramework();
}

/**
 * Handles test-runner commands
 */
export async function onCommand(command: { name: string; args: any[] }) {
  switch (command.name) {
    case 'test-runner:run':
      console.log('[Test Runner] Running tests...');
      return await handleRunTests(command.args[0]);
    case 'test-runner:watch':
      console.log('[Test Runner] Starting test watch mode...');
      return await handleWatchTests(command.args[0]);
    case 'test-runner:history':
      console.log('[Test Runner] Getting test run history...');
      return await handleGetTestHistory(command.args[0]);
    case 'test-runner:coverage':
      console.log('[Test Runner] Getting test coverage...');
      return await handleGetCoverage(command.args[0]);
    case 'test-runner:info':
      console.log('[Test Runner] Getting test info...');
      return await handleGetTestInfo(command.args[0]);
    default:
      console.warn(`[Test Runner] Unknown command: ${command.name}`);
      return { error: `Unknown command: ${command.name}` };
  }
}

// Define schemas for Test Runner tool
export const RunTestsSchema = z.object({
  testPattern: z.string().optional(),
  framework: z.enum(['jest', 'mocha', 'vitest', 'jasmine', 'karma', 'cypress', 'playwright', 'generic']).optional(),
  options: z.object({
    coverage: z.boolean().optional().default(false),
    updateSnapshots: z.boolean().optional().default(false),
    bail: z.boolean().optional().default(false),
    verbose: z.boolean().optional().default(false),
    ci: z.boolean().optional().default(false),
  }).optional().default({}),
});

export const WatchTestsSchema = z.object({
  testPattern: z.string().optional(),
  framework: z.enum(['jest', 'mocha', 'vitest', 'jasmine', 'karma', 'cypress', 'playwright', 'generic']).optional(),
});

export const GetTestHistorySchema = z.object({
  limit: z.number().optional().default(10),
  status: z.enum(['running', 'completed', 'failed']).optional(),
  framework: z.enum(['jest', 'mocha', 'vitest', 'jasmine', 'karma', 'cypress', 'playwright', 'generic']).optional(),
});

export const GetCoverageSchema = z.object({
  testRunId: z.string().optional(),
  generateReport: z.boolean().optional().default(false),
  reportFormat: z.enum(['html', 'text', 'json']).optional().default('text'),
});

export const GetTestInfoSchema = z.object({
  testPattern: z.string().optional(),
  framework: z.enum(['jest', 'mocha', 'vitest', 'jasmine', 'karma', 'cypress', 'playwright', 'generic']).optional(),
  detectOnly: z.boolean().optional().default(false),
});

/**
 * Generate a test run ID
 */
function generateTestRunId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
}

/**
 * Parse test output into structured results
 */
function parseTestOutput(output: string, framework: TestFramework): TestSuiteResult[] {
  // This is a simplified parsing implementation
  // A real implementation would properly parse the output based on the framework
  const suites: TestSuiteResult[] = [];
  
  // Simple heuristic to extract basic test results
  const passedMatch = output.match(/(\d+) passing/i);
  const failedMatch = output.match(/(\d+) failing/i);
  const skippedMatch = output.match(/(\d+) skipped/i) || output.match(/(\d+) pending/i);
  
  const passed = passedMatch ? parseInt(passedMatch[1], 10) : 0;
  const failed = failedMatch ? parseInt(failedMatch[1], 10) : 0;
  const skipped = skippedMatch ? parseInt(skippedMatch[1], 10) : 0;
  
  // Create a root suite
  const rootSuite: TestSuiteResult = {
    name: 'Root Test Suite',
    status: failed > 0 ? 'failed' : 'passed',
    duration: 0, // Unknown from simple parsing
    tests: [],
    passed,
    failed,
    skipped
  };
  
  // For Jest and some others, try to parse individual test results
  const testResults: TestResult[] = [];
  
  // Extract individual test results if possible
  const testLines = output.split('\n');
  for (const line of testLines) {
    const passedLineMatch = line.match(/✓\s+(.+?)(?:\s+\((.+)\))?$/);
    const failedLineMatch = line.match(/✕\s+(.+?)(?:\s+\((.+)\))?$/);
    const skippedLineMatch = line.match(/◯\s+(.+?)(?:\s+\((.+)\))?$/);
    
    if (passedLineMatch) {
      testResults.push({
        name: passedLineMatch[1].trim(),
        status: 'passed',
        duration: passedLineMatch[2] ? parseFloat(passedLineMatch[2]) : 0
      });
    } else if (failedLineMatch) {
      testResults.push({
        name: failedLineMatch[1].trim(),
        status: 'failed',
        duration: failedLineMatch[2] ? parseFloat(failedLineMatch[2]) : 0
      });
    } else if (skippedLineMatch) {
      testResults.push({
        name: skippedLineMatch[1].trim(),
        status: 'skipped',
        duration: 0
      });
    }
  }
  
  // Add parsed tests to the root suite
  rootSuite.tests = testResults;
  
  suites.push(rootSuite);
  return suites;
}

/**
 * Build test command based on framework and options
 */
function buildTestCommand(
  framework: TestFramework,
  testPattern?: string,
  options: {
    coverage?: boolean;
    updateSnapshots?: boolean;
    bail?: boolean;
    verbose?: boolean;
    ci?: boolean;
  } = {}
): string {
  const { coverage, updateSnapshots, bail, verbose, ci } = options;
  let command = '';
  
  switch (framework) {
    case 'jest':
      command = 'npx jest';
      if (testPattern) command += ` ${testPattern}`;
      if (coverage) command += ' --coverage';
      if (updateSnapshots) command += ' --updateSnapshot';
      if (bail) command += ' --bail';
      if (verbose) command += ' --verbose';
      if (ci) command += ' --ci';
      break;
      
    case 'vitest':
      command = 'npx vitest run';
      if (testPattern) command += ` ${testPattern}`;
      if (coverage) command += ' --coverage';
      if (updateSnapshots) command += ' --update';
      if (bail) command += ' --bail';
      if (verbose) command += ' --verbose';
      break;
      
    case 'mocha':
      command = 'npx mocha';
      if (testPattern) command += ` ${testPattern}`;
      if (bail) command += ' --bail';
      // Mocha doesn't have built-in coverage - would need to use nyc/istanbul
      if (coverage) command = 'npx nyc ' + command;
      break;
      
    case 'jasmine':
      command = 'npx jasmine';
      if (testPattern) command += ` ${testPattern}`;
      break;
      
    case 'karma':
      command = 'npx karma start';
      if (testPattern) command += ` --files="${testPattern}"`;
      if (ci) command += ' --single-run';
      break;
      
    case 'cypress':
      command = 'npx cypress run';
      if (testPattern) command += ` --spec "${testPattern}"`;
      break;
      
    case 'playwright':
      command = 'npx playwright test';
      if (testPattern) command += ` ${testPattern}`;
      if (updateSnapshots) command += ' --update-snapshots';
      break;
      
    case 'generic':
    default:
      // Try to use the test script from package.json
      const testScript = getTestScript();
      if (testScript) {
        command = `npm test`;
        if (testPattern) command += ` -- ${testPattern}`;
      } else {
        command = 'echo "No test command found"';
      }
      break;
  }
  
  return command;
}

/**
 * Handles running tests
 */
async function handleRunTests(args: any) {
  try {
    const result = RunTestsSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for running tests"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const { testPattern, framework = detectedFramework, options } = result.data;
    
    // Generate a test run ID
    const testRunId = generateTestRunId();
    
    // Build test command
    const command = buildTestCommand(framework, testPattern, options);
    
    // Create test run info
    const testRun: TestRunInfo = {
      id: testRunId,
      framework,
      timestamp: Date.now(),
      duration: 0,
      status: 'running',
      command,
      logs: [],
    };
    
    // Add to history
    testRunHistory.unshift(testRun);
    
    try {
      // Run tests
      console.log(`[Test Runner] Running command: ${command}`);
      const startTime = Date.now();
      
      const output = execSync(command, { 
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
        maxBuffer: 10 * 1024 * 1024 // 10 MB
      });
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Update test run info
      testRun.status = 'completed';
      testRun.duration = duration;
      testRun.logs.push(output);
      
      // Parse test results
      const suites = parseTestOutput(output, framework);
      
      // Calculate summary
      const summary = {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        duration
      };
      
      for (const suite of suites) {
        summary.passed += suite.passed;
        summary.failed += suite.failed;
        summary.skipped += suite.skipped;
        summary.total += suite.passed + suite.failed + suite.skipped;
      }
      
      testRun.results = {
        suites,
        summary
      };
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            testRunId,
            command,
            duration,
            framework,
            summary,
            message: summary.failed > 0
              ? `Tests completed with ${summary.failed} failures`
              : `All tests passed (${summary.passed} passing, ${summary.skipped} skipped)`
          }, null, 2)
        }]
      };
    } catch (error: any) {
      // Update test run info with error
      testRun.status = 'failed';
      testRun.duration = Date.now() - testRun.timestamp;
      testRun.error = error.message;
      
      if (error.stdout) {
        testRun.logs.push(error.stdout);
      }
      if (error.stderr) {
        testRun.logs.push(error.stderr);
      }
      
      // Try to parse results even from failure output
      if (error.stdout) {
        const suites = parseTestOutput(error.stdout, framework);
        
        // Calculate summary
        const summary = {
          total: 0,
          passed: 0,
          failed: 0,
          skipped: 0,
          duration: testRun.duration
        };
        
        for (const suite of suites) {
          summary.passed += suite.passed;
          summary.failed += suite.failed;
          summary.skipped += suite.skipped;
          summary.total += suite.passed + suite.failed + suite.skipped;
        }
        
        testRun.results = {
          suites,
          summary
        };
      }
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            testRunId,
            command,
            error: error.message,
            output: error.stdout || error.stderr || 'No output',
            framework,
            summary: testRun.results?.summary,
            message: `Tests failed: ${error.message}`
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
          message: "Failed to run tests"
        }, null, 2)
      }],
      isError: true
    };
  }
}

/**
 * Handles watching tests
 */
async function handleWatchTests(args: any) {
  try {
    const result = WatchTestsSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for watching tests"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const { testPattern, framework = detectedFramework } = result.data;
    
    // Build watch command based on framework
    let command = '';
    
    switch (framework) {
      case 'jest':
        command = 'npx jest --watch';
        if (testPattern) command += ` ${testPattern}`;
        break;
        
      case 'vitest':
        command = 'npx vitest';
        if (testPattern) command += ` ${testPattern}`;
        break;
        
      case 'mocha':
        command = 'npx mocha --watch';
        if (testPattern) command += ` ${testPattern}`;
        break;
        
      case 'cypress':
        command = 'npx cypress open';
        if (testPattern) command += ` --spec "${testPattern}"`;
        break;
        
      default:
        // Fall back to npm test -- --watch if available
        command = 'npm test -- --watch';
        if (testPattern) command += ` ${testPattern}`;
        break;
    }
    
    // Return the command for execution
    // This will typically be executed by the client in a terminal
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          command,
          framework,
          testPattern,
          message: `Starting test watch mode with command: ${command}`
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to start test watch mode"
        }, null, 2)
      }],
      isError: true
    };
  }
}

/**
 * Handles getting test run history
 */
async function handleGetTestHistory(args: any) {
  try {
    const result = GetTestHistorySchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for getting test history"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const { limit, status, framework } = result.data;
    
    // Filter test runs
    let filteredRuns = [...testRunHistory];
    
    if (status) {
      filteredRuns = filteredRuns.filter(run => run.status === status);
    }
    
    if (framework) {
      filteredRuns = filteredRuns.filter(run => run.framework === framework);
    }
    
    // Apply limit
    filteredRuns = filteredRuns.slice(0, limit);
    
    // Format output
    const formattedRuns = filteredRuns.map(run => ({
      id: run.id,
      timestamp: new Date(run.timestamp).toISOString(),
      framework: run.framework,
      status: run.status,
      duration: run.duration,
      command: run.command,
      summary: run.results?.summary || null,
      error: run.error || null
    }));
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          runs: formattedRuns,
          count: formattedRuns.length,
          totalRuns: testRunHistory.length,
          message: formattedRuns.length > 0
            ? `Found ${formattedRuns.length} test runs`
            : 'No test runs found matching criteria'
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to get test history"
        }, null, 2)
      }],
      isError: true
    };
  }
}

/**
 * Handles getting test coverage
 */
async function handleGetCoverage(args: any) {
  try {
    const result = GetCoverageSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for getting coverage"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const { testRunId, generateReport, reportFormat } = result.data;
    
    // If test run ID provided, get coverage from that run
    if (testRunId) {
      const testRun = testRunHistory.find(run => run.id === testRunId);
      
      if (!testRun) {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              error: `Test run with ID ${testRunId} not found`,
              message: "Failed to get coverage"
            }, null, 2)
          }],
          isError: true
        };
      }
      
      // Return coverage if available
      if (testRun.results?.summary?.coverage) {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              testRunId,
              coverage: testRun.results.summary.coverage,
              message: `Retrieved coverage information for test run ${testRunId}`
            }, null, 2)
          }]
        };
      } else {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              testRunId,
              error: 'No coverage information available for this test run',
              message: 'Coverage information not available'
            }, null, 2)
          }],
          isError: true
        };
      }
    }
    
    // Otherwise, generate a new coverage report
    if (generateReport) {
      // Determine command based on detected framework
      let command = '';
      
      switch (detectedFramework) {
        case 'jest':
          command = `npx jest --coverage --coverageReporters=${reportFormat}`;
          break;
          
        case 'vitest':
          command = `npx vitest run --coverage --reporter=${reportFormat}`;
          break;
          
        case 'mocha':
          command = `npx nyc --reporter=${reportFormat} mocha`;
          break;
          
        default:
          return {
            content: [{
              type: "text",
              text: JSON.stringify({
                error: `Coverage reports not supported for framework: ${detectedFramework}`,
                message: "Failed to generate coverage report"
              }, null, 2)
            }],
            isError: true
          };
      }
      
      try {
        // Run coverage command
        console.log(`[Test Runner] Running coverage command: ${command}`);
        const output = execSync(command, { 
          encoding: 'utf8',
          stdio: ['ignore', 'pipe', 'pipe'],
          maxBuffer: 10 * 1024 * 1024 // 10 MB
        });
        
        // Parse coverage information (simplified)
        const lines = output.match(/Lines\s*:\s*(\d+\.?\d*)%/);
        const statements = output.match(/Statements\s*:\s*(\d+\.?\d*)%/);
        const functions = output.match(/Functions\s*:\s*(\d+\.?\d*)%/);
        const branches = output.match(/Branches\s*:\s*(\d+\.?\d*)%/);
        
        const coverage = {
          lines: lines ? parseFloat(lines[1]) : 0,
          statements: statements ? parseFloat(statements[1]) : 0,
          functions: functions ? parseFloat(functions[1]) : 0,
          branches: branches ? parseFloat(branches[1]) : 0,
        };
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              coverage,
              output: output.substring(0, 1000) + (output.length > 1000 ? '...' : ''),
              reportFormat,
              message: `Generated coverage report in ${reportFormat} format`
            }, null, 2)
          }]
        };
      } catch (error: any) {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              error: error.message,
              output: error.stdout || error.stderr || 'No output',
              message: "Failed to generate coverage report"
            }, null, 2)
          }],
          isError: true
        };
      }
    }
    
    // If no test run ID or generate report option, return an error
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: 'Either testRunId or generateReport must be provided',
          message: "Invalid request for coverage information"
        }, null, 2)
      }],
      isError: true
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to get coverage information"
        }, null, 2)
      }],
      isError: true
    };
  }
}

/**
 * Find test files in a directory
 */
async function findTestFiles(directory: string): Promise<string[]> {
  const testFiles: string[] = [];
  
  async function scanDir(dir: string) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        // Skip node_modules and hidden directories
        if (entry.name !== 'node_modules' && !entry.name.startsWith('.')) {
          await scanDir(fullPath);
        }
      } else if (entry.isFile() && isTestFile(fullPath)) {
        testFiles.push(fullPath);
      }
    }
  }
  
  await scanDir(directory);
  return testFiles;
}

/**
 * Handles getting test info
 */
async function handleGetTestInfo(args: any) {
  try {
    const result = GetTestInfoSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for getting test info"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const { testPattern, framework = detectedFramework, detectOnly } = result.data;
    
    // If detectOnly is true, we only want to check for .only tests
    if (detectOnly) {
      let command = '';
      
      switch (framework) {
        case 'jest':
          command = 'npx jest --findRelatedTests';
          if (testPattern) command += ` ${testPattern}`;
          command += ' --listTests';
          break;
          
        case 'mocha':
          command = 'npx mocha --grep ".only"';
          if (testPattern) command += ` ${testPattern}`;
          command += ' --dry-run';
          break;
          
        default:
          // Grep through test files manually
          try {
            const testFiles = await findTestFiles(testPattern || '.');
            const onlyTests: { file: string; line: number; match: string }[] = [];
            
            for (const file of testFiles) {
              const content = await fs.readFile(file, 'utf8');
              const lines = content.split('\n');
              
              for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                // Look for .only in tests
                if (line.includes('.only(')) {
                  onlyTests.push({
                    file,
                    line: i + 1,
                    match: line.trim()
                  });
                }
              }
            }
            
            return {
              content: [{
                type: "text",
                text: JSON.stringify({
                  onlyTests,
                  count: onlyTests.length,
                  message: onlyTests.length > 0
                    ? `Found ${onlyTests.length} focused tests (.only)`
                    : 'No focused tests found'
                }, null, 2)
              }]
            };
          } catch (error) {
            return {
              content: [{
                type: "text",
                text: JSON.stringify({
                  error: String(error),
                  message: "Failed to detect .only tests"
                }, null, 2)
              }],
              isError: true
            };
          }
      }
      
      try {
        // Execute command to find .only tests
        const output = execSync(command, { encoding: 'utf8' });
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              command,
              output,
              message: 'Ran command to detect focused tests'
            }, null, 2)
          }]
        };
      } catch (error: any) {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              error: error.message,
              output: error.stdout || error.stderr || 'No output',
              message: "Failed to detect focused tests"
            }, null, 2)
          }],
          isError: true
        };
      }
    }
    
    // Otherwise, get general test info
    let testInfo: any = {
      framework,
      testScript: getTestScript() || null
    };
    
    // Find test files
    try {
      const testFiles = await findTestFiles(testPattern || '.');
      testInfo.testFiles = testFiles;
      testInfo.testFileCount = testFiles.length;
    } catch (error) {
      console.error('[Test Runner] Error finding test files:', error);
      testInfo.error = String(error);
    }
    
    // Check for test configuration
    testInfo.configuration = {};
    
    if (fsSync.existsSync('jest.config.js') || fsSync.existsSync('jest.config.json')) {
      testInfo.configuration.jest = true;
    }
    
    if (fsSync.existsSync('vitest.config.js') || fsSync.existsSync('vitest.config.ts')) {
      testInfo.configuration.vitest = true;
    }
    
    if (fsSync.existsSync('.mocharc.js') || fsSync.existsSync('.mocharc.json')) {
      testInfo.configuration.mocha = true;
    }
    
    if (fsSync.existsSync('karma.conf.js')) {
      testInfo.configuration.karma = true;
    }
    
    if (fsSync.existsSync('cypress.json') || fsSync.existsSync('cypress.config.js')) {
      testInfo.configuration.cypress = true;
    }
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          ...testInfo,
          message: `Found ${testInfo.testFileCount || 0} test files for ${framework} framework`
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to get test info"
        }, null, 2)
      }],
      isError: true
    };
  }
}