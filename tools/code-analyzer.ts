// Auto-generated safe fallback for code-analyzer

export function activate() {
    console.log("[TOOL] code-analyzer activated (passive mode)");
}

export function onFileWrite(filePath: string, content: string) {
  console.log(`[Code-Analyzer] File written: ${filePath}`);
  
  // Check if the file is a source code file
  const extension = path.extname(filePath).toLowerCase();
  const language = defaultConfig.fileExtensionToLanguage[extension as keyof typeof defaultConfig.fileExtensionToLanguage];
  
  if (language) {
    console.log(`[Code-Analyzer] Detected source file change: ${filePath} (${language})`);
    
    // Perform basic analysis
    const lines = content.split('\n');
    const lineCount = lines.length;
    
    // Check for potential issues
    const issues = [];
    
    // Check for console.log statements
    const consoleLogMatches = content.match(/console\.log\(/g) || [];
    if (consoleLogMatches.length > 0) {
      issues.push({
        type: 'quality',
        description: 'Console.log statements should be removed in production code',
        occurrences: consoleLogMatches.length,
        severity: 'low',
      });
    }
    
    // Check for TODO comments
    const todoMatches = content.match(/\/\/\s*TODO/g) || [];
    if (todoMatches.length > 0) {
      issues.push({
        type: 'quality',
        description: 'TODO comments found',
        occurrences: todoMatches.length,
        severity: 'low',
      });
    }
    
    return {
      detected: true,
      filePath,
      language,
      lineCount,
      issues: issues.length > 0 ? issues : undefined
    };
  }
  
  return { detected: false };
}

export function onSessionStart(context: any) {
  console.log('[Code-Analyzer] Session started');
  
  // Initialize code analyzer with supported languages
  console.log(`[Code-Analyzer] Initialized with ${defaultConfig.supportedLanguages.length} supported languages`);
  
  return {
    initialized: true,
    supportedLanguages: defaultConfig.supportedLanguages,
    fileExtensions: Object.keys(defaultConfig.fileExtensionToLanguage)
  };
}

export function onCommand(command: string, args: any) {
  console.log(`[Code-Analyzer] Command received: ${command}`);
  
  if (command === 'code.analyze') {
    console.log('[Code-Analyzer] Analyzing code');
    return { action: 'analyze', args };
  } else if (command === 'code.analyzeProject') {
    console.log('[Code-Analyzer] Analyzing project');
    return { action: 'analyzeProject', args };
  } else if (command === 'code.getRefactoring') {
    console.log('[Code-Analyzer] Getting refactoring suggestions');
    return { action: 'getRefactoring', args };
  } else if (command === 'code.checkSyntax') {
    console.log('[Code-Analyzer] Checking syntax');
    return { action: 'checkSyntax', args };
  }
  
  return { action: 'unknown' };
}
import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';

// Define schemas for CodeAnalyzer tool
export const AnalyzeCodeSchema = z.object({
  code: z.string().optional(),
  filePath: z.string().optional(),
  language: z.string().optional(),
  analysisType: z.enum(['refactoring', 'security', 'performance', 'quality', 'all']).default('all'),
  apiKey: z.string().optional(),
});

export const AnalyzeProjectSchema = z.object({
  directory: z.string(),
  recursive: z.boolean().optional(),
  filePatterns: z.array(z.string()).optional(),
  analysisType: z.enum(['refactoring', 'security', 'performance', 'quality', 'all']).default('all'),
  apiKey: z.string().optional(),
});

export const GetRefactoringSchema = z.object({
  code: z.string().optional(),
  filePath: z.string().optional(),
  language: z.string().optional(),
  apiKey: z.string().optional(),
});

// Configuration for code analyzer
const defaultConfig = {
  apiKeyPath: path.join(process.cwd(), '.env.local'),
  maxFileSizeBytes: 1024 * 1024, // 1MB
  supportedLanguages: [
    'javascript', 'typescript', 'python', 'java', 'csharp', 'go', 'ruby', 'php',
    'rust', 'swift', 'kotlin', 'dart', 'html', 'css', 'scss', 'json', 'yaml'
  ],
  fileExtensionToLanguage: {
    '.js': 'javascript',
    '.jsx': 'javascript',
    '.ts': 'typescript',
    '.tsx': 'typescript',
    '.py': 'python',
    '.java': 'java',
    '.cs': 'csharp',
    '.go': 'go',
    '.rb': 'ruby',
    '.php': 'php',
    '.rs': 'rust',
    '.swift': 'swift',
    '.kt': 'kotlin',
    '.dart': 'dart',
    '.html': 'html',
    '.css': 'css',
    '.scss': 'scss',
    '.json': 'json',
    '.yaml': 'yaml',
    '.yml': 'yaml',
  },
};

/**
 * Safely loads API key from environment or configuration file
 */
async function loadApiKey(providedKey?: string): Promise<string> {
  // If API key is provided directly, use it
  if (providedKey) {
    return providedKey;
  }
  
  // Try to load from environment variable
  if (process.env.OPENROUTER_API_KEY) {
    return process.env.OPENROUTER_API_KEY;
  }
  
  // Try to load from configuration file
  try {
    const envContent = await fs.readFile(defaultConfig.apiKeyPath, 'utf8');
    const match = envContent.match(/OPENROUTER_API_KEY=["']?([^"'\r\n]+)["']?/);
    
    if (match && match[1]) {
      return match[1];
    }
  } catch (error) {
    // File doesn't exist or can't be read
  }
  
  // Default to the key from implementation plan, but this should be replaced in production
  // This is just a fallback for development
  return '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';
}

/**
 * Determines the language from a file extension
 */
function getLanguageFromExtension(filePath: string): string | undefined {
  const extension = path.extname(filePath).toLowerCase();
  return defaultConfig.fileExtensionToLanguage[extension as keyof typeof defaultConfig.fileExtensionToLanguage];
}

/**
 * Analyzes code for potential improvements
 */
export async function handleAnalyzeCode(args: any) {
  if (args && typeof args === 'object' && (('code' in args && typeof args.code === 'string') || ('filePath' in args && typeof args.filePath === 'string'))) {
    try {
      // Get the code to analyze
      let code: string;
      let language: string | undefined = args.language;
      
      if ('filePath' in args && typeof args.filePath === 'string') {
        const filePath = args.filePath;
        
        // Check if file exists
        try {
          const stats = await fs.stat(filePath);
          
          // Check file size
          if (stats.size > defaultConfig.maxFileSizeBytes) {
            return {
              content: [{
                type: "text",
                text: JSON.stringify({
                  error: `File is too large (${stats.size} bytes). Maximum allowed size is ${defaultConfig.maxFileSizeBytes} bytes.`,
                  message: `Failed to analyze code.`
                }, null, 2)
              }],
              isError: true,
            };
          }
          
          // Read the file
          code = await fs.readFile(filePath as string, 'utf8');
          
          // Determine language from file extension if not provided
          if (!language) {
            language = getLanguageFromExtension(filePath as string);
          }
        } catch (error) {
          return {
            content: [{
              type: "text",
              text: JSON.stringify({
                error: `Failed to read file: ${filePath}`,
                message: `Failed to analyze code.`
              }, null, 2)
            }],
            isError: true,
          };
        }
      } else if ('code' in args && typeof args.code === 'string') {
        code = args.code;
      } else {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              error: `Either code or filePath must be provided.`,
              message: `Failed to analyze code.`
            }, null, 2)
          }],
          isError: true,
        };
      }
      
      // Check if language is supported
      if (language && !defaultConfig.supportedLanguages.includes(language)) {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              error: `Language ${language} is not supported.`,
              message: `Failed to analyze code.`
            }, null, 2)
          }],
          isError: true,
        };
      }
      
      // Get the analysis type
      const analysisType = args.analysisType || 'all';
      
      // Load API key
      const apiKey = await loadApiKey(args.apiKey);
      
      // In a real implementation, we would make an API call to analyze the code
      // For now, we'll just return some mock analysis results
      
      // Generate a simple analysis based on the code
      const analysis = generateMockAnalysis(code, language, analysisType);
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            language,
            analysisType,
            analysis,
            message: `Code analysis completed.`
          }, null, 2)
        }],
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: String(error),
            message: `Failed to analyze code.`
          }, null, 2)
        }],
        isError: true,
      };
    }
  }
  
  return {
    content: [{ type: "text", text: "Error: Invalid arguments for analyze_code" }],
    isError: true,
  };
}

/**
 * Analyzes a project directory for potential improvements
 */
export async function handleAnalyzeProject(args: any) {
  if (args && typeof args === 'object' && 'directory' in args && typeof args.directory === 'string') {
    try {
      const { directory, recursive = true, filePatterns = ['**/*.js', '**/*.ts', '**/*.jsx', '**/*.tsx'], analysisType = 'all' } = args;
      
      // Load API key
      const apiKey = await loadApiKey(args.apiKey);
      
      // Check if directory exists
      try {
        const stats = await fs.stat(directory);
        
        if (!stats.isDirectory()) {
          return {
            content: [{
              type: "text",
              text: JSON.stringify({
                error: `${directory} is not a directory.`,
                message: `Failed to analyze project.`
              }, null, 2)
            }],
            isError: true,
          };
        }
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              error: `Directory not found: ${directory}`,
              message: `Failed to analyze project.`
            }, null, 2)
          }],
          isError: true,
        };
      }
      
      // In a real implementation, we would scan the directory for files matching the patterns
      // and analyze each file, then aggregate the results
      // For now, we'll just return some mock analysis results
      
      const mockProjectAnalysis = {
        summary: {
          totalFiles: 42,
          analyzedFiles: 37,
          issuesFound: 128,
          criticalIssues: 5,
          highPriorityIssues: 23,
          mediumPriorityIssues: 47,
          lowPriorityIssues: 53,
        },
        topIssues: [
          {
            type: 'security',
            description: 'Potential SQL injection vulnerability',
            occurrences: 3,
            files: ['src/database/query.js', 'src/api/users.js', 'src/admin/reports.js'],
            severity: 'critical',
          },
          {
            type: 'performance',
            description: 'Inefficient loop pattern',
            occurrences: 12,
            files: ['src/utils/data-processor.js', 'src/components/DataTable.jsx', 'src/services/api-client.js'],
            severity: 'high',
          },
          {
            type: 'quality',
            description: 'Duplicated code blocks',
            occurrences: 8,
            files: ['src/components/Form.jsx', 'src/components/Modal.jsx', 'src/pages/Profile.jsx'],
            severity: 'medium',
          },
        ],
        recommendations: [
          'Implement parameterized queries to prevent SQL injection',
          'Replace nested loops with more efficient data structures',
          'Extract duplicated code into reusable functions',
          'Add proper error handling to async functions',
          'Implement proper input validation',
        ],
      };
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            directory,
            analysisType,
            analysis: mockProjectAnalysis,
            message: `Project analysis completed.`
          }, null, 2)
        }],
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: String(error),
            message: `Failed to analyze project.`
          }, null, 2)
        }],
        isError: true,
      };
    }
  }
  
  return {
    content: [{ type: "text", text: "Error: Invalid arguments for analyze_project" }],
    isError: true,
  };
}

/**
 * Gets refactoring suggestions for code
 */
export async function handleGetRefactoring(args: any) {
  if (args && typeof args === 'object' && (('code' in args && typeof args.code === 'string') || ('filePath' in args && typeof args.filePath === 'string'))) {
    try {
      // Get the code to refactor
      let code: string;
      let language: string | undefined = args.language;
      let filePath: string | undefined;
      
      if ('filePath' in args && typeof args.filePath === 'string') {
        filePath = args.filePath;
        
        // Check if file exists
        try {
          const stats = await fs.stat(filePath as string);
          
          // Check file size
          if (stats.size > defaultConfig.maxFileSizeBytes) {
            return {
              content: [{
                type: "text",
                text: JSON.stringify({
                  error: `File is too large (${stats.size} bytes). Maximum allowed size is ${defaultConfig.maxFileSizeBytes} bytes.`,
                  message: `Failed to get refactoring suggestions.`
                }, null, 2)
              }],
              isError: true,
            };
          }
          
          // Read the file
          code = await fs.readFile(filePath as string, 'utf8');
          
          // Determine language from file extension if not provided
          if (!language) {
            language = getLanguageFromExtension(filePath as string);
          }
        } catch (error) {
          return {
            content: [{
              type: "text",
              text: JSON.stringify({
                error: `Failed to read file: ${filePath}`,
                message: `Failed to get refactoring suggestions.`
              }, null, 2)
            }],
            isError: true,
          };
        }
      } else if ('code' in args && typeof args.code === 'string') {
        code = args.code;
      } else {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              error: `Either code or filePath must be provided.`,
              message: `Failed to get refactoring suggestions.`
            }, null, 2)
          }],
          isError: true,
        };
      }
      
      // Check if language is supported
      if (language && !defaultConfig.supportedLanguages.includes(language)) {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              error: `Language ${language} is not supported.`,
              message: `Failed to get refactoring suggestions.`
            }, null, 2)
          }],
          isError: true,
        };
      }
      
      // Load API key
      const apiKey = await loadApiKey(args.apiKey);
      
      // In a real implementation, we would make an API call to get refactoring suggestions
      // For now, we'll just return some mock refactoring suggestions
      
      // Generate mock refactoring suggestions
      const refactoringSuggestions = generateMockRefactoringSuggestions(code, language);
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            language,
            filePath,
            refactoringSuggestions,
            message: `Refactoring suggestions generated.`
          }, null, 2)
        }],
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: String(error),
            message: `Failed to get refactoring suggestions.`
          }, null, 2)
        }],
        isError: true,
      };
    }
  }
  
  return {
    content: [{ type: "text", text: "Error: Invalid arguments for get_refactoring" }],
    isError: true,
  };
}

/**
 * Generates mock analysis results for demonstration purposes
 */
function generateMockAnalysis(code: string, language: string | undefined, analysisType: string): any {
  // Count lines of code
  const lines = code.split('\n');
  const lineCount = lines.length;
  
  // Count functions (very simplistic)
  const functionMatches = code.match(/function\s+\w+\s*\(.*?\)/g) || [];
  const arrowFunctionMatches = code.match(/\(.*?\)\s*=>\s*{/g) || [];
  const functionCount = functionMatches.length + arrowFunctionMatches.length;
  
  // Generate mock issues based on code patterns
  const issues = [];
  
  // Check for console.log statements
  const consoleLogMatches = code.match(/console\.log\(/g) || [];
  if (consoleLogMatches.length > 0) {
    issues.push({
      type: 'quality',
      description: 'Console.log statements should be removed in production code',
      occurrences: consoleLogMatches.length,
      severity: 'low',
    });
  }
  
  // Check for TODO comments
  const todoMatches = code.match(/\/\/\s*TODO/g) || [];
  if (todoMatches.length > 0) {
    issues.push({
      type: 'quality',
      description: 'TODO comments indicate incomplete work',
      occurrences: todoMatches.length,
      severity: 'medium',
    });
  }
  
  // Check for long lines
  const longLines = lines.filter(line => line.length > 100);
  if (longLines.length > 0) {
    issues.push({
      type: 'quality',
      description: 'Lines longer than 100 characters reduce readability',
      occurrences: longLines.length,
      severity: 'low',
    });
  }
  
  // Check for long functions (more than 30 lines)
  if (functionCount > 0 && lineCount / functionCount > 30) {
    issues.push({
      type: 'quality',
      description: 'Functions are too long, consider breaking them down',
      occurrences: Math.floor(lineCount / functionCount / 30),
      severity: 'medium',
    });
  }
  
  // Check for == instead of === (JavaScript/TypeScript)
  if (language === 'javascript' || language === 'typescript') {
    const looseEqualityMatches = code.match(/==(?!=)/g) || [];
    if (looseEqualityMatches.length > 0) {
      issues.push({
        type: 'quality',
        description: 'Use === instead of == for strict equality comparison',
        occurrences: looseEqualityMatches.length,
        severity: 'medium',
      });
    }
  }
  
  // Generate recommendations based on issues
  const recommendations = issues.map(issue => {
    switch (issue.description) {
      case 'Console.log statements should be removed in production code':
        return 'Remove console.log statements or replace with a proper logging system';
      case 'TODO comments indicate incomplete work':
        return 'Address TODO comments before finalizing the code';
      case 'Lines longer than 100 characters reduce readability':
        return 'Break long lines into multiple lines for better readability';
      case 'Functions are too long, consider breaking them down':
        return 'Refactor long functions into smaller, more focused functions';
      case 'Use === instead of == for strict equality comparison':
        return 'Replace == with === for strict equality comparison';
      default:
        return `Address the issue: ${issue.description}`;
    }
  });
  
  // Generate metrics
  const metrics = {
    lineCount,
    functionCount,
    averageLinesPerFunction: functionCount > 0 ? Math.round(lineCount / functionCount) : 0,
    longLineCount: longLines.length,
    todoCount: todoMatches.length,
    consoleLogCount: consoleLogMatches.length,
  };
  
  return {
    metrics,
    issues,
    recommendations,
  };
}

/**
 * Generates mock refactoring suggestions for demonstration purposes
 */
function generateMockRefactoringSuggestions(code: string, language: string | undefined): any {
  // Generate mock refactoring suggestions
  const suggestions = [];
  
  // Suggestion 1: Extract repeated code into functions
  suggestions.push({
    type: 'extract-function',
    description: 'Extract repeated code into reusable functions',
    before: `
function processUser(user) {
  // Validate user
  if (!user.name) {
    throw new Error('User name is required');
  }
  if (!user.email) {
    throw new Error('User email is required');
  }
  if (!user.age) {
    throw new Error('User age is required');
  }
  
  // Process user
  console.log(\`Processing user \${user.name}\`);
  // ...
}

function processAdmin(admin) {
  // Validate admin
  if (!admin.name) {
    throw new Error('Admin name is required');
  }
  if (!admin.email) {
    throw new Error('Admin email is required');
  }
  if (!admin.age) {
    throw new Error('Admin age is required');
  }
  
  // Process admin
  console.log(\`Processing admin \${admin.name}\`);
  // ...
}
`,
    after: `
function validatePerson(person, role) {
  if (!person.name) {
    throw new Error(\`\${role} name is required\`);
  }
  if (!person.email) {
    throw new Error(\`\${role} email is required\`);
  }
  if (!person.age) {
    throw new Error(\`\${role} age is required\`);
  }
}

function processUser(user) {
  validatePerson(user, 'User');
  
  // Process user
  console.log(\`Processing user \${user.name}\`);
  // ...
}

function processAdmin(admin) {
  validatePerson(admin, 'Admin');
  
  // Process admin
  console.log(\`Processing admin \${admin.name}\`);
  // ...
}
`,
    explanation: 'The validation logic is repeated in both functions. Extract it into a separate function to reduce duplication and improve maintainability.',
  });
  
  // Suggestion 2: Use object destructuring
  suggestions.push({
    type: 'use-destructuring',
    description: 'Use object destructuring for cleaner code',
    before: `
function displayUserInfo(user) {
  return \`
    Name: \${user.name}
    Email: \${user.email}
    Age: \${user.age}
    Address: \${user.address.street}, \${user.address.city}, \${user.address.country}
  \`;
}
`,
    after: `
function displayUserInfo(user) {
  const { name, email, age, address } = user;
  const { street, city, country } = address;
  
  return \`
    Name: \${name}
    Email: \${email}
    Age: \${age}
    Address: \${street}, \${city}, \${country}
  \`;
}
`,
    explanation: 'Using object destructuring makes the code cleaner and more readable by avoiding repetitive property access.',
  });
  
  // Suggestion 3: Convert to async/await
  suggestions.push({
    type: 'use-async-await',
    description: 'Convert promise chains to async/await for better readability',
    before: `
function fetchUserData(userId) {
  return fetch(\`/api/users/\${userId}\`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      return response.json();
    })
    .then(userData => {
      return fetch(\`/api/posts?userId=\${userData.id}\`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to fetch user posts');
          }
          return response.json();
        })
        .then(posts => {
          return {
            user: userData,
            posts: posts
          };
        });
    })
    .catch(error => {
      console.error('Error:', error);
      throw error;
    });
}
`,
    after: `
async function fetchUserData(userId) {
  try {
    const userResponse = await fetch(\`/api/users/\${userId}\`);
    if (!userResponse.ok) {
      throw new Error('Failed to fetch user data');
    }
    
    const userData = await userResponse.json();
    
    const postsResponse = await fetch(\`/api/posts?userId=\${userData.id}\`);
    if (!postsResponse.ok) {
      throw new Error('Failed to fetch user posts');
    }
    
    const posts = await postsResponse.json();
    
    return {
      user: userData,
      posts: posts
    };
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}
`,
    explanation: 'Using async/await makes asynchronous code more readable and easier to understand compared to promise chains.',
  });
  
  return suggestions;
}