// Auto-generated boilerplate for tool-suggester

import { z } from 'zod';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';

// Tool category types
type ToolCategory = 
  'ui-generation' | 
  'code-tools' | 
  'testing-quality' | 
  'api-dependent' | 
  'database' | 
  'filesystem' | 
  'content' | 
  'auth' | 
  'meta' | 
  'project-planning' | 
  'internationalization' | 
  'extensibility' | 
  'validation' | 
  'logging' | 
  'automated-tools' | 
  'other';

// Tool information
interface ToolInfo {
  name: string;
  displayName: string;
  category: ToolCategory;
  description: string;
  capabilities: string[];
  commands: {
    name: string;
    description: string;
    parameters?: Record<string, string>;
  }[];
  examples?: string[];
  filePath?: string;
  enabled: boolean;
  weight: number; // For sorting suggestions (higher = more prominent)
  tags: string[]; // For searching and categorization
  requiresSetup?: boolean;
  setupInstructions?: string;
}

// Suggested tool result
interface ToolSuggestion {
  tool: ToolInfo;
  relevanceScore: number;
  matchedKeywords: string[];
  matchedCapabilities: string[];
}

// Default tools information
const TOOLS_INFO: ToolInfo[] = [
  {
    name: 'component-builder',
    displayName: 'Component Builder',
    category: 'ui-generation',
    description: 'Creates UI components for various frameworks',
    capabilities: [
      'Generate React components',
      'Generate Vue components',
      'Generate Angular components',
      'Generate Svelte components',
      'Handle props and state',
      'Create styled components'
    ],
    commands: [
      {
        name: 'component-builder:create',
        description: 'Create a new component for a specified framework',
        parameters: {
          name: 'Component name',
          framework: 'React/Vue/Angular/Svelte',
          type: 'Functional/Class/Hook',
          withStyle: 'Boolean to include styles',
          withTests: 'Boolean to generate tests'
        }
      },
      {
        name: 'component-builder:list-templates',
        description: 'List available component templates'
      }
    ],
    enabled: true,
    weight: 80,
    tags: ['ui', 'component', 'frontend', 'react', 'vue', 'angular', 'svelte', 'generator']
  },
  {
    name: 'code-fixer',
    displayName: 'Code Fixer',
    category: 'code-tools',
    description: 'Automatically fixes common code issues and applies best practices',
    capabilities: [
      'Fix linting issues',
      'Apply code style standards',
      'Fix common syntax errors',
      'Update deprecated code',
      'Optimize imports'
    ],
    commands: [
      {
        name: 'code-fixer:fix',
        description: 'Fix issues in a file or directory',
        parameters: {
          path: 'File or directory path',
          fixType: 'Type of fixes to apply',
          dryRun: 'Preview fixes without applying'
        }
      },
      {
        name: 'code-fixer:check',
        description: 'Check for issues without fixing them'
      }
    ],
    enabled: true,
    weight: 85,
    tags: ['code', 'fix', 'lint', 'style', 'error', 'quality']
  },
  {
    name: 'refactor-tool',
    displayName: 'Refactor Tool',
    category: 'code-tools',
    description: 'Tools for code refactoring operations',
    capabilities: [
      'Rename variables, functions, and classes',
      'Extract methods from code blocks',
      'Extract interfaces from classes',
      'Move code between files',
      'Inline variables and functions'
    ],
    commands: [
      {
        name: 'refactor-tool:rename',
        description: 'Rename a symbol across files',
        parameters: {
          filePath: 'Starting file path',
          symbol: 'Symbol to rename',
          newName: 'New name for the symbol',
          isGlobal: 'Whether to look in all related files'
        }
      },
      {
        name: 'refactor-tool:extract-method',
        description: 'Extract a code block into a method',
        parameters: {
          filePath: 'File path',
          startLine: 'Start line of code block',
          endLine: 'End line of code block',
          methodName: 'Name for the new method'
        }
      }
    ],
    enabled: true,
    weight: 75,
    tags: ['code', 'refactor', 'rename', 'extract', 'move', 'inline']
  },
  {
    name: 'test-runner',
    displayName: 'Test Runner',
    category: 'testing-quality',
    description: 'Runs tests and provides coverage information',
    capabilities: [
      'Run unit tests',
      'Run integration tests',
      'Generate test coverage reports',
      'Watch for changes and run tests',
      'Filter tests by pattern'
    ],
    commands: [
      {
        name: 'test-runner:run',
        description: 'Run tests matching a pattern',
        parameters: {
          testPattern: 'Pattern to match test files',
          framework: 'Test framework to use',
          options: 'Additional options like coverage'
        }
      },
      {
        name: 'test-runner:watch',
        description: 'Watch for changes and run tests'
      }
    ],
    enabled: true,
    weight: 70,
    tags: ['test', 'unit test', 'integration test', 'coverage', 'quality']
  },
  {
    name: 'db-migrator',
    displayName: 'Database Migrator',
    category: 'database',
    description: 'Creates and runs database migrations',
    capabilities: [
      'Create migration scripts',
      'Apply migrations',
      'Rollback migrations',
      'Generate schema from code',
      'Support multiple database types'
    ],
    commands: [
      {
        name: 'db-migrator:create',
        description: 'Create a new migration',
        parameters: {
          name: 'Migration name',
          dbType: 'Database type'
        }
      },
      {
        name: 'db-migrator:run',
        description: 'Run pending migrations'
      }
    ],
    enabled: true,
    weight: 65,
    tags: ['database', 'migration', 'schema', 'sql', 'nosql']
  },
  {
    name: 'schema-validator',
    displayName: 'Schema Validator',
    category: 'validation',
    description: 'Validates data against schemas',
    capabilities: [
      'Validate JSON against JSON Schema',
      'Validate data against Zod schemas',
      'Generate schemas from data',
      'Convert between schema formats',
      'Validate API responses'
    ],
    commands: [
      {
        name: 'schema-validator:validate',
        description: 'Validate data against a schema',
        parameters: {
          data: 'Data to validate',
          schema: 'Schema to validate against',
          format: 'Schema format (jsonschema, zod, etc.)'
        }
      },
      {
        name: 'schema-validator:generate',
        description: 'Generate a schema from data'
      }
    ],
    enabled: true,
    weight: 60,
    tags: ['validation', 'schema', 'json', 'zod', 'typescript']
  },
  {
    name: 'token-refresher',
    displayName: 'Token Refresher',
    category: 'auth',
    description: 'Refreshes and validates authentication tokens',
    capabilities: [
      'Decode JWT tokens',
      'Refresh OAuth tokens',
      'Validate token signatures',
      'Store tokens securely',
      'Monitor token expiration'
    ],
    commands: [
      {
        name: 'token-refresher:decode',
        description: 'Decode a JWT token',
        parameters: {
          token: 'Token to decode'
        }
      },
      {
        name: 'token-refresher:refresh',
        description: 'Refresh an OAuth token',
        parameters: {
          tokenId: 'ID of token to refresh',
          refreshToken: 'Refresh token (optional)'
        }
      }
    ],
    enabled: true,
    weight: 50,
    tags: ['auth', 'jwt', 'oauth', 'token', 'security']
  },
  {
    name: 'theme-switcher',
    displayName: 'Theme Switcher',
    category: 'ui-generation',
    description: 'Manages UI themes and layouts',
    capabilities: [
      'Switch between light and dark themes',
      'Apply custom color themes',
      'Change layout configurations',
      'Generate CSS variables',
      'Apply animations'
    ],
    commands: [
      {
        name: 'theme-switcher:set-theme',
        description: 'Set the active theme',
        parameters: {
          themeName: 'Name of the theme to apply'
        }
      },
      {
        name: 'theme-switcher:get-config',
        description: 'Get current theme configuration'
      }
    ],
    enabled: true,
    weight: 55,
    tags: ['ui', 'theme', 'dark mode', 'light mode', 'layout', 'css']
  },
  {
    name: 'tone-adjuster',
    displayName: 'Tone Adjuster',
    category: 'content',
    description: 'Adjusts the tone of text content',
    capabilities: [
      'Adjust formality of text',
      'Change writing style',
      'Apply technical or simple language',
      'Customize emotional tone',
      'Apply different personas'
    ],
    commands: [
      {
        name: 'tone-adjuster:adjust',
        description: 'Adjust the tone of text',
        parameters: {
          text: 'Text to adjust',
          toneName: 'Name of tone profile to apply'
        }
      },
      {
        name: 'tone-adjuster:list-profiles',
        description: 'List available tone profiles'
      }
    ],
    enabled: true,
    weight: 45,
    tags: ['content', 'tone', 'writing', 'style', 'formality', 'language']
  },
  {
    name: 'plugin-loader',
    displayName: 'Plugin Loader',
    category: 'extensibility',
    description: 'Loads and manages plugins',
    capabilities: [
      'Load plugins from local filesystem',
      'Load plugins from npm packages',
      'Enable/disable plugins',
      'Manage plugin dependencies',
      'Handle plugin lifecycle'
    ],
    commands: [
      {
        name: 'plugin-loader:load',
        description: 'Load a plugin',
        parameters: {
          path: 'Path to plugin',
          name: 'Plugin name'
        }
      },
      {
        name: 'plugin-loader:list',
        description: 'List loaded plugins'
      }
    ],
    enabled: true,
    weight: 40,
    tags: ['plugin', 'extension', 'loader', 'npm', 'module']
  },
  {
    name: 'tool-suggester',
    displayName: 'Tool Suggester',
    category: 'meta',
    description: 'Suggests tools based on task descriptions',
    capabilities: [
      'List available tools',
      'Suggest tools for tasks',
      'Show tool capabilities',
      'Provide usage examples',
      'Find similar tools'
    ],
    commands: [
      {
        name: 'tool-suggester:suggest',
        description: 'Suggest tools for a task',
        parameters: {
          task: 'Description of the task',
          limit: 'Maximum number of suggestions'
        }
      },
      {
        name: 'tool-suggester:list',
        description: 'List all available tools',
        parameters: {
          category: 'Filter by category',
          enabled: 'Show only enabled tools'
        }
      }
    ],
    enabled: true,
    weight: 90,
    tags: ['tool', 'suggest', 'find', 'list', 'help', 'meta']
  }
];

// Current tools state
let tools: ToolInfo[] = [...TOOLS_INFO];

// Keywords to capability mappings for improved suggestion
const KEYWORD_MAPPINGS: Record<string, string[]> = {
  // UI related
  'ui': ['ui-generation', 'component', 'design', 'layout', 'frontend'],
  'component': ['component', 'ui', 'react', 'vue', 'angular', 'svelte'],
  'theme': ['theme', 'dark mode', 'light mode', 'color', 'style'],
  'css': ['css', 'style', 'theme', 'ui'],
  
  // Code related
  'code': ['code', 'refactor', 'fix', 'lint', 'optimize'],
  'refactor': ['refactor', 'rename', 'extract', 'move', 'inline'],
  'fix': ['fix', 'lint', 'error', 'warning', 'quality'],
  
  // Testing related
  'test': ['test', 'unit test', 'integration test', 'coverage'],
  'quality': ['quality', 'test', 'lint', 'coverage'],
  
  // Database related
  'database': ['database', 'migration', 'schema', 'sql', 'nosql'],
  'migration': ['migration', 'database', 'schema'],
  
  // Content related
  'content': ['content', 'text', 'tone', 'writing', 'language'],
  'tone': ['tone', 'formality', 'style', 'writing'],
  
  // Auth related
  'auth': ['auth', 'token', 'jwt', 'oauth', 'authentication'],
  'token': ['token', 'jwt', 'oauth', 'refresh', 'auth'],
  
  // Plugin related
  'plugin': ['plugin', 'extension', 'module', 'addon'],
  'extension': ['extension', 'plugin', 'addon', 'module']
};

export function activate() {
  console.log("[TOOL] tool-suggester activated");
  
  // Load tool information if available
  loadToolsInfo();
}

/**
 * Load tools information from file
 */
async function loadToolsInfo(): Promise<void> {
  try {
    if (fsSync.existsSync('tools-info.json')) {
      const toolsData = await fs.readFile('tools-info.json', 'utf8');
      const loadedTools = JSON.parse(toolsData);
      
      if (Array.isArray(loadedTools) && loadedTools.length > 0) {
        // Merge with default tools, giving preference to loaded tools
        const mergedTools = [...TOOLS_INFO];
        
        for (const loadedTool of loadedTools) {
          const existingIndex = mergedTools.findIndex(t => t.name === loadedTool.name);
          if (existingIndex >= 0) {
            mergedTools[existingIndex] = {
              ...mergedTools[existingIndex],
              ...loadedTool
            };
          } else {
            mergedTools.push(loadedTool);
          }
        }
        
        tools = mergedTools;
        console.log(`[Tool Suggester] Loaded ${loadedTools.length} tool definitions`);
      }
    } else {
      // Create default tools info file
      await saveToolsInfo();
      console.log('[Tool Suggester] Created default tools information');
    }
  } catch (error) {
    console.error('[Tool Suggester] Error loading tools information:', error);
  }
}

/**
 * Save tools information to file
 */
async function saveToolsInfo(): Promise<void> {
  try {
    await fs.writeFile('tools-info.json', JSON.stringify(tools, null, 2), 'utf8');
    console.log(`[Tool Suggester] Saved ${tools.length} tool definitions`);
  } catch (error) {
    console.error('[Tool Suggester] Error saving tools information:', error);
  }
}

/**
 * Register a new tool
 */
async function registerTool(tool: ToolInfo): Promise<boolean> {
  // Check if tool already exists
  const existingIndex = tools.findIndex(t => t.name === tool.name);
  
  if (existingIndex >= 0) {
    // Update existing tool
    tools[existingIndex] = {
      ...tools[existingIndex],
      ...tool
    };
  } else {
    // Add new tool
    tools.push(tool);
  }
  
  // Save updated tools
  await saveToolsInfo();
  
  return true;
}

/**
 * Find tools matching keywords
 */
function findToolsByKeywords(keywords: string[], limit: number = 5): ToolSuggestion[] {
  // Normalize keywords (lowercase, remove duplicates)
  const normalizedKeywords = keywords
    .map(k => k.toLowerCase())
    .filter((k, i, arr) => arr.indexOf(k) === i);
  
  // Expand keywords using mappings
  const expandedKeywords = new Set<string>();
  
  for (const keyword of normalizedKeywords) {
    expandedKeywords.add(keyword);
    
    // Add mapped keywords
    if (KEYWORD_MAPPINGS[keyword]) {
      for (const mappedKeyword of KEYWORD_MAPPINGS[keyword]) {
        expandedKeywords.add(mappedKeyword);
      }
    }
  }
  
  // Score each tool based on keyword matches
  const toolScores: ToolSuggestion[] = tools
    .filter(tool => tool.enabled) // Only consider enabled tools
    .map(tool => {
      let score = 0;
      const matchedKeywords: string[] = [];
      const matchedCapabilities: string[] = [];
      
      // Check name and display name
      for (const keyword of expandedKeywords) {
        if (tool.name.toLowerCase().includes(keyword) || 
            tool.displayName.toLowerCase().includes(keyword)) {
          score += 10;
          matchedKeywords.push(keyword);
        }
      }
      
      // Check description
      for (const keyword of expandedKeywords) {
        if (tool.description.toLowerCase().includes(keyword)) {
          score += 5;
          matchedKeywords.push(keyword);
        }
      }
      
      // Check capabilities
      for (const capability of tool.capabilities) {
        for (const keyword of expandedKeywords) {
          if (capability.toLowerCase().includes(keyword)) {
            score += 8;
            matchedKeywords.push(keyword);
            matchedCapabilities.push(capability);
          }
        }
      }
      
      // Check tags
      for (const tag of tool.tags) {
        for (const keyword of expandedKeywords) {
          if (tag.toLowerCase().includes(keyword) || keyword.includes(tag.toLowerCase())) {
            score += 7;
            matchedKeywords.push(tag);
          }
        }
      }
      
      // Apply tool weight to the score
      score = score * (tool.weight / 50);
      
      // Remove duplicates from matched items
      const uniqueKeywords = [...new Set(matchedKeywords)];
      const uniqueCapabilities = [...new Set(matchedCapabilities)];
      
      return {
        tool,
        relevanceScore: score,
        matchedKeywords: uniqueKeywords,
        matchedCapabilities: uniqueCapabilities
      };
    })
    .filter(suggestion => suggestion.relevanceScore > 0) // Only keep matches
    .sort((a, b) => b.relevanceScore - a.relevanceScore) // Sort by score (highest first)
    .slice(0, limit); // Apply limit
  
  return toolScores;
}

/**
 * Get tools by category
 */
function getToolsByCategory(category: ToolCategory | 'all', enabledOnly: boolean = true): ToolInfo[] {
  return tools
    .filter(tool => 
      (category === 'all' || tool.category === category) && 
      (!enabledOnly || tool.enabled)
    )
    .sort((a, b) => b.weight - a.weight);
}

/**
 * Get tool by name
 */
function getToolByName(name: string): ToolInfo | undefined {
  return tools.find(tool => tool.name === name);
}

/**
 * Handles file write events
 */
export function onFileWrite(event: { path: string; content: string }) {
  // Check if tools info file was modified
  if (path.basename(event.path) === 'tools-info.json') {
    console.log(`[Tool Suggester] Tools information file changed: ${event.path}`);
    loadToolsInfo();
  }
}

/**
 * Handles session start logic
 */
export function onSessionStart(session: { id: string; startTime: number }) {
  console.log(`[Tool Suggester] Session started: ${session.id}`);
  
  // Reload tools info on session start
  loadToolsInfo();
}

/**
 * Handles tool-suggester commands
 */
export async function onCommand(command: { name: string; args: any[] }) {
  switch (command.name) {
    case 'tool-suggester:suggest':
      console.log('[Tool Suggester] Suggesting tools...');
      return await handleSuggestTools(command.args[0]);
    case 'tool-suggester:list':
      console.log('[Tool Suggester] Listing tools...');
      return await handleListTools(command.args[0]);
    case 'tool-suggester:get':
      console.log('[Tool Suggester] Getting tool info...');
      return await handleGetToolInfo(command.args[0]);
    case 'tool-suggester:register':
      console.log('[Tool Suggester] Registering tool...');
      return await handleRegisterTool(command.args[0]);
    case 'tool-suggester:categories':
      console.log('[Tool Suggester] Getting categories...');
      return await handleGetCategories(command.args[0]);
    default:
      console.warn(`[Tool Suggester] Unknown command: ${command.name}`);
      return { error: `Unknown command: ${command.name}` };
  }
}

// Define schemas for Tool Suggester tool
export const SuggestToolsSchema = z.object({
  task: z.string(),
  keywords: z.array(z.string()).optional(),
  limit: z.number().min(1).max(20).optional().default(5),
  includeDisabled: z.boolean().optional().default(false),
  includeExamples: z.boolean().optional().default(true),
});

export const ListToolsSchema = z.object({
  category: z.enum([
    'ui-generation',
    'code-tools',
    'testing-quality',
    'api-dependent',
    'database',
    'filesystem',
    'content',
    'auth',
    'meta',
    'project-planning',
    'internationalization',
    'extensibility',
    'validation',
    'logging',
    'automated-tools',
    'other',
    'all'
  ]).optional().default('all'),
  enabledOnly: z.boolean().optional().default(true),
  includeCommands: z.boolean().optional().default(false),
  includeCapabilities: z.boolean().optional().default(true),
});

export const GetToolInfoSchema = z.object({
  name: z.string(),
  includeCommands: z.boolean().optional().default(true),
  includeCapabilities: z.boolean().optional().default(true),
  includeExamples: z.boolean().optional().default(true),
});

export const RegisterToolSchema = z.object({
  name: z.string(),
  displayName: z.string(),
  category: z.enum([
    'ui-generation',
    'code-tools',
    'testing-quality',
    'api-dependent',
    'database',
    'filesystem',
    'content',
    'auth',
    'meta',
    'project-planning',
    'internationalization',
    'extensibility',
    'validation',
    'logging',
    'automated-tools',
    'other'
  ]),
  description: z.string(),
  capabilities: z.array(z.string()),
  commands: z.array(z.object({
    name: z.string(),
    description: z.string(),
    parameters: z.record(z.string()).optional()
  })),
  examples: z.array(z.string()).optional(),
  filePath: z.string().optional(),
  enabled: z.boolean().optional().default(true),
  weight: z.number().min(1).max(100).optional().default(50),
  tags: z.array(z.string()),
  requiresSetup: z.boolean().optional(),
  setupInstructions: z.string().optional(),
});

export const GetCategoriesSchema = z.object({
  includeTools: z.boolean().optional().default(false),
  countOnly: z.boolean().optional().default(false),
});

/**
 * Handles suggesting tools for a task
 */
async function handleSuggestTools(args: any) {
  try {
    const result = SuggestToolsSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for suggesting tools"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const { task, keywords, limit, includeDisabled, includeExamples } = result.data;
    
    // Extract keywords from task description if not provided
    const searchKeywords = keywords || extractKeywords(task);
    
    // Get tool suggestions
    const suggestions = findToolsByKeywords(searchKeywords, limit);
    
    // Filter out disabled tools if needed
    const filteredSuggestions = includeDisabled 
      ? suggestions 
      : suggestions.filter(suggestion => suggestion.tool.enabled);
    
    // Format suggestions for response
    const formattedSuggestions = filteredSuggestions.map(suggestion => {
      const { tool, relevanceScore, matchedKeywords, matchedCapabilities } = suggestion;
      
      const formatted: any = {
        name: tool.name,
        displayName: tool.displayName,
        category: tool.category,
        description: tool.description,
        score: relevanceScore,
        matchedKeywords,
        matchedCapabilities,
        commands: tool.commands.map(cmd => cmd.name),
        capabilities: tool.capabilities,
        enabled: tool.enabled
      };
      
      if (includeExamples && tool.examples) {
        formatted.examples = tool.examples;
      }
      
      return formatted;
    });
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          task,
          keywords: searchKeywords,
          suggestions: formattedSuggestions,
          message: formattedSuggestions.length > 0
            ? `Found ${formattedSuggestions.length} tools matching "${task}"`
            : `No tools found matching "${task}"`
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to suggest tools"
        }, null, 2)
      }],
      isError: true
    };
  }
}

/**
 * Extract keywords from text
 */
function extractKeywords(text: string): string[] {
  // Split text into words
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
    .split(/\s+/) // Split on whitespace
    .filter(word => word.length > 2); // Filter out short words
  
  // Filter out common stop words
  const stopWords = new Set([
    'the', 'and', 'for', 'with', 'that', 'this', 'can', 'you', 'will', 'your',
    'have', 'from', 'one', 'are', 'would', 'could', 'should', 'not'
  ]);
  
  // Count word frequency
  const wordFrequency: Record<string, number> = {};
  
  for (const word of words) {
    if (!stopWords.has(word)) {
      wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    }
  }
  
  // Sort by frequency
  const sortedWords = Object.entries(wordFrequency)
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0])
    .slice(0, 10); // Take top 10 keywords
  
  // Add any direct matches to known tool names or categories
  const toolNames = tools.map(tool => tool.name.toLowerCase());
  const toolCategories = tools.map(tool => tool.category.toLowerCase());
  const directMatches = words.filter(word => 
    toolNames.includes(word) || toolCategories.includes(word) || KEYWORD_MAPPINGS[word]
  );
  
  // Merge and deduplicate
  const allKeywords = [...new Set([...directMatches, ...sortedWords])];
  
  return allKeywords;
}

/**
 * Handles listing tools
 */
async function handleListTools(args: any) {
  try {
    const result = ListToolsSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for listing tools"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const { category, enabledOnly, includeCommands, includeCapabilities } = result.data;
    
    // Get tools by category
    const categoryTools = getToolsByCategory(category, enabledOnly);
    
    // Format tools for response
    const formattedTools = categoryTools.map(tool => {
      const formatted: any = {
        name: tool.name,
        displayName: tool.displayName,
        category: tool.category,
        description: tool.description,
        enabled: tool.enabled
      };
      
      if (includeCommands) {
        formatted.commands = tool.commands;
      }
      
      if (includeCapabilities) {
        formatted.capabilities = tool.capabilities;
      }
      
      return formatted;
    });
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          category,
          tools: formattedTools,
          count: formattedTools.length,
          message: category === 'all'
            ? `Found ${formattedTools.length} tools`
            : `Found ${formattedTools.length} tools in category '${category}'`
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to list tools"
        }, null, 2)
      }],
      isError: true
    };
  }
}

/**
 * Handles getting tool info
 */
async function handleGetToolInfo(args: any) {
  try {
    const result = GetToolInfoSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for getting tool info"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const { name, includeCommands, includeCapabilities, includeExamples } = result.data;
    
    // Get tool by name
    const tool = getToolByName(name);
    
    if (!tool) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: `Tool with name '${name}' not found`,
            message: "Failed to get tool info",
            availableTools: tools.map(t => t.name)
          }, null, 2)
        }],
        isError: true
      };
    }
    
    // Format tool for response
    const formattedTool: any = {
      name: tool.name,
      displayName: tool.displayName,
      category: tool.category,
      description: tool.description,
      enabled: tool.enabled,
      weight: tool.weight,
      tags: tool.tags
    };
    
    if (includeCommands) {
      formattedTool.commands = tool.commands;
    }
    
    if (includeCapabilities) {
      formattedTool.capabilities = tool.capabilities;
    }
    
    if (includeExamples && tool.examples) {
      formattedTool.examples = tool.examples;
    }
    
    if (tool.requiresSetup) {
      formattedTool.requiresSetup = tool.requiresSetup;
      formattedTool.setupInstructions = tool.setupInstructions;
    }
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          tool: formattedTool,
          message: `Retrieved information for tool '${tool.displayName}'`
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to get tool info"
        }, null, 2)
      }],
      isError: true
    };
  }
}

/**
 * Handles registering a tool
 */
async function handleRegisterTool(args: any) {
  try {
    const result = RegisterToolSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for registering tool"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    // Register the tool
    const success = await registerTool(result.data);
    
    if (!success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: "Failed to register tool",
            message: "Unknown error occurred while registering tool"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          name: result.data.name,
          displayName: result.data.displayName,
          category: result.data.category,
          enabled: result.data.enabled,
          message: `Successfully registered tool '${result.data.displayName}'`
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to register tool"
        }, null, 2)
      }],
      isError: true
    };
  }
}

/**
 * Handles getting tool categories
 */
async function handleGetCategories(args: any) {
  try {
    const result = GetCategoriesSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for getting categories"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const { includeTools, countOnly } = result.data;
    
    // Get unique categories
    const categories = [...new Set(tools.map(tool => tool.category))];
    
    // Sort alphabetically
    categories.sort();
    
    // Format response
    const formattedCategories = categories.map(category => {
      const categoryTools = tools.filter(tool => tool.category === category);
      
      if (countOnly) {
        return {
          name: category,
          count: categoryTools.length
        };
      }
      
      const formatted: any = {
        name: category,
        count: categoryTools.length
      };
      
      if (includeTools) {
        formatted.tools = categoryTools.map(tool => ({
          name: tool.name,
          displayName: tool.displayName,
          description: tool.description,
          enabled: tool.enabled
        }));
      }
      
      return formatted;
    });
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          categories: formattedCategories,
          count: formattedCategories.length,
          totalTools: tools.length,
          message: `Found ${formattedCategories.length} tool categories`
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to get tool categories"
        }, null, 2)
      }],
      isError: true
    };
  }
}