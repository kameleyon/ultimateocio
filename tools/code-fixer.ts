// Auto-generated safe fallback for code-fixer

export function activate() {
  console.log("[TOOL] code-fixer activated (vigilant mode)");
  checkDependencies();
}

/**
 * Watches for file writes and analyzes for code issues
 */
export async function onFileWrite(event: { path: string; content: string }) {
  const language = getLanguageFromExtension(event.path);
  if (!language) return;

  console.log(`[Code Fixer] Watching file write: ${event.path}`);
  const issues = analyzeCode(event.content, language);

  if (issues.length > 0) {
    console.log(`[Code Fixer] Detected ${issues.length} issue(s) in ${event.path}`);
    // Optional auto-fix trigger
    // const result = fixCode(event.content, language, ['all']);
    // await fs.writeFile(event.path, result.fixedCode);
  }
}

/**
 * Handles session start logic
 */
export function onSessionStart(session: { id: string; startTime: number }) {
  console.log(`[Code Fixer] Session started: ${session.id}`);
  // Could load settings or prepare rule sets here
}

/**
 * Handles code-fixer commands
 */
export async function onCommand(command: { name: string; args: any[] }) {
  switch (command.name) {
    case 'code-fixer:analyze':
      console.log('[Code Fixer] Analyzing file...');
      // You would pass args[0] with path/content
      break;
    case 'code-fixer:fix':
      console.log('[Code Fixer] Fixing file...');
      // You would call fixCode here with proper params
      break;
    case 'code-fixer:report':
      console.log('[Code Fixer] Generating report...');
      break;
    default:
      console.warn(`[Code Fixer] Unknown command: ${command.name}`);
  }
}

/**
 * Automatically installs missing dependencies
 */
function checkDependencies() {
  const required = ['zod'];
  for (const pkg of required) {
    try {
      require.resolve(pkg);
    } catch {
      console.log(`[Dependency] Missing "${pkg}". Installing...`);
      try {
        execSync(`npm install ${pkg}`, { stdio: 'inherit' });
        console.log(`[Dependency] "${pkg}" installed successfully.`);
      } catch (err) {
        console.error(`[Dependency] Failed to install "${pkg}":`, err);
      }
    }
  }
}
import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';
import { exec, execSync } from 'child_process';
import { promisify } from 'util';
import { createReadStream } from 'fs';
import { createInterface } from 'readline';

// Promisify exec
const execAsync = promisify(exec);

// Configuration for resource management
const CONFIG = {
  CHUNK_SIZE: 1024 * 1024, // 1MB chunks for file processing
  MAX_CONCURRENT_FILES: 5, // Maximum number of files to process concurrently
  OPERATION_TIMEOUT: 30000, // 30 seconds timeout for operations
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB maximum file size
};

// Define schemas for CodeFixer tool
export const FixCodeSchema = z.object({
  path: z.string(),
  content: z.string().optional(),
  language: z.string().optional(),
  fixTypes: z.array(z.enum([
    'syntax',
    'formatting',
    'imports',
    'unused',
    'security',
    'performance',
    'accessibility',
    'all'
  ])).optional(),
});

export const AnalyzeCodeSchema = z.object({
  path: z.string(),
  content: z.string().optional(),
  language: z.string().optional(),
});

export const FixProjectSchema = z.object({
  directory: z.string(),
  recursive: z.boolean().optional(),
  extensions: z.array(z.string()).optional(),
  fixTypes: z.array(z.enum([
    'syntax',
    'formatting',
    'imports',
    'unused',
    'security',
    'performance',
    'accessibility',
    'all'
  ])).optional(),
});

// Default file extensions to analyze
const DEFAULT_EXTENSIONS = [
  // JavaScript/TypeScript
  '.js', '.jsx', '.ts', '.tsx',
  // Web frameworks
  '.vue', '.svelte',
  // Styling
  '.css', '.scss', '.less',
  // Markup/Data
  '.html', '.json',
  // Python
  '.py', '.pyx', '.pyi',
  // C/C++
  '.c', '.cpp', '.cc', '.h', '.hpp',
  // C#
  '.cs',
  // Java
  '.java',
  // Go
  '.go',
  // Ruby
  '.rb',
  // PHP
  '.php',
  // Swift
  '.swift',
  // Rust
  '.rs'
];

// Type for replacement function
type ReplacementFunction = (match: string, ...args: string[]) => string;

// Common code issues and fixes by language
const codeFixers: Record<string, Array<{ pattern: RegExp; replacement: string | ReplacementFunction; description: string; type: string }>> = {
  // JavaScript fixers
  javascript: [
    {
      pattern: /([a-zA-Z0-9_$]+)\s*=\s*([a-zA-Z0-9_$]+)\s*==\s*([a-zA-Z0-9_$]+)/g,
      replacement: '$1 = $2 === $3',
      description: 'Replace == with === for strict equality comparison',
      type: 'syntax'
    },
    {
      pattern: /([a-zA-Z0-9_$]+)\s*=\s*([a-zA-Z0-9_$]+)\s*!=\s*([a-zA-Z0-9_$]+)/g,
      replacement: '$1 = $2 !== $3',
      description: 'Replace != with !== for strict inequality comparison',
      type: 'syntax'
    },
    {
      pattern: /console\.log\([^)]*\);?/g,
      replacement: '// $&',
      description: 'Comment out console.log statements',
      type: 'unused'
    },
    {
      pattern: /\/\/ *TODO:?/g,
      replacement: '// TODO:',
      description: 'Standardize TODO comments',
      type: 'formatting'
    },
    {
      pattern: /function\s*\(\s*\)\s*{\s*return\s+([^;]+);?\s*}/g,
      replacement: '() => $1',
      description: 'Convert simple functions to arrow functions',
      type: 'formatting'
    },
    {
      pattern: /new Array\(\)/g,
      replacement: '[]',
      description: 'Use array literal instead of constructor',
      type: 'performance'
    },
    {
      pattern: /new Object\(\)/g,
      replacement: '{}',
      description: 'Use object literal instead of constructor',
      type: 'performance'
    },
    {
      pattern: /document\.getElementById\('([^']+)'\)\.addEventListener\('click',\s*function\s*\(\s*\)\s*{\s*([^}]+)\s*}\);/g,
      replacement: "document.getElementById('$1').addEventListener('click', () => {\n  $2\n});",
      description: 'Convert anonymous functions to arrow functions in event listeners',
      type: 'formatting'
    },
    {
      pattern: /([a-zA-Z0-9_$]+)\.forEach\(function\s*\(([a-zA-Z0-9_$]+)\)\s*{\s*([^}]+)\s*}\);/g,
      replacement: '$1.forEach(($2) => {\n  $3\n});',
      description: 'Convert anonymous functions to arrow functions in forEach',
      type: 'formatting'
    },
    {
      pattern: /([a-zA-Z0-9_$]+)\.map\(function\s*\(([a-zA-Z0-9_$]+)\)\s*{\s*([^}]+)\s*}\);/g,
      replacement: '$1.map(($2) => {\n  $3\n});',
      description: 'Convert anonymous functions to arrow functions in map',
      type: 'formatting'
    },
    {
      pattern: /var\s+([a-zA-Z0-9_$]+)\s*=/g,
      replacement: 'const $1 =',
      description: 'Replace var with const for variable declarations',
      type: 'syntax'
    },
    {
      pattern: /([a-zA-Z0-9_$]+)\.indexOf\(([^)]+)\)\s*!==?\s*-1/g,
      replacement: '$1.includes($2)',
      description: 'Use includes() instead of indexOf() !== -1',
      type: 'syntax'
    },
    {
      pattern: /([a-zA-Z0-9_$]+)\.indexOf\(([^)]+)\)\s*===?\s*-1/g,
      replacement: '!$1.includes($2)',
      description: 'Use !includes() instead of indexOf() === -1',
      type: 'syntax'
    },
    {
      pattern: /for\s*\(\s*var\s+i\s*=\s*0;\s*i\s*<\s*([a-zA-Z0-9_$]+)\.length;\s*i\+\+\)\s*{/g,
      replacement: 'for (let i = 0; i < $1.length; i++) {',
      description: 'Replace var with let in for loops',
      type: 'syntax'
    },
    {
      pattern: /for\s*\(\s*var\s+i\s*=\s*0;\s*i\s*<\s*([a-zA-Z0-9_$]+)\.length;\s*i\+\+\)\s*{\s*([^}]+)\s*}/g,
      replacement: 'for (const item of $1) {\n  $2\n}',
      description: 'Convert for loops to for...of loops',
      type: 'syntax'
    },
  ],
  // TypeScript fixers
  typescript: [
    {
      pattern: /([a-zA-Z0-9_$]+)\s*=\s*([a-zA-Z0-9_$]+)\s*==\s*([a-zA-Z0-9_$]+)/g,
      replacement: '$1 = $2 === $3',
      description: 'Replace == with === for strict equality comparison',
      type: 'syntax'
    },
    {
      pattern: /([a-zA-Z0-9_$]+)\s*=\s*([a-zA-Z0-9_$]+)\s*!=\s*([a-zA-Z0-9_$]+)/g,
      replacement: '$1 = $2 !== $3',
      description: 'Replace != with !== for strict inequality comparison',
      type: 'syntax'
    },
    {
      pattern: /console\.log\([^)]*\);?/g,
      replacement: '// $&',
      description: 'Comment out console.log statements',
      type: 'unused'
    },
    {
      pattern: /\/\/ *TODO:?/g,
      replacement: '// TODO:',
      description: 'Standardize TODO comments',
      type: 'formatting'
    },
    {
      pattern: /function\s*\(\s*\)\s*{\s*return\s+([^;]+);?\s*}/g,
      replacement: '() => $1',
      description: 'Convert simple functions to arrow functions',
      type: 'formatting'
    },
    {
      pattern: /new Array\(\)/g,
      replacement: '[]',
      description: 'Use array literal instead of constructor',
      type: 'performance'
    },
    {
      pattern: /new Object\(\)/g,
      replacement: '{}',
      description: 'Use object literal instead of constructor',
      type: 'performance'
    },
    {
      pattern: /([a-zA-Z0-9_$]+)\.forEach\(function\s*\(([a-zA-Z0-9_$]+)\)\s*{\s*([^}]+)\s*}\);/g,
      replacement: '$1.forEach(($2) => {\n  $3\n});',
      description: 'Convert anonymous functions to arrow functions in forEach',
      type: 'formatting'
    },
    {
      pattern: /([a-zA-Z0-9_$]+)\.map\(function\s*\(([a-zA-Z0-9_$]+)\)\s*{\s*([^}]+)\s*}\);/g,
      replacement: '$1.map(($2) => {\n  $3\n});',
      description: 'Convert anonymous functions to arrow functions in map',
      type: 'formatting'
    },
    {
      pattern: /var\s+([a-zA-Z0-9_$]+)\s*=/g,
      replacement: 'const $1 =',
      description: 'Replace var with const for variable declarations',
      type: 'syntax'
    },
    {
      pattern: /([a-zA-Z0-9_$]+)\.indexOf\(([^)]+)\)\s*!==?\s*-1/g,
      replacement: '$1.includes($2)',
      description: 'Use includes() instead of indexOf() !== -1',
      type: 'syntax'
    },
    {
      pattern: /([a-zA-Z0-9_$]+)\.indexOf\(([^)]+)\)\s*===?\s*-1/g,
      replacement: '!$1.includes($2)',
      description: 'Use !includes() instead of indexOf() === -1',
      type: 'syntax'
    },
    {
      pattern: /for\s*\(\s*var\s+i\s*=\s*0;\s*i\s*<\s*([a-zA-Z0-9_$]+)\.length;\s*i\+\+\)\s*{/g,
      replacement: 'for (let i = 0; i < $1.length; i++) {',
      description: 'Replace var with let in for loops',
      type: 'syntax'
    },
    {
      pattern: /for\s*\(\s*var\s+i\s*=\s*0;\s*i\s*<\s*([a-zA-Z0-9_$]+)\.length;\s*i\+\+\)\s*{\s*([^}]+)\s*}/g,
      replacement: 'for (const item of $1) {\n  $2\n}',
      description: 'Convert for loops to for...of loops',
      type: 'syntax'
    },
    {
      pattern: /interface\s+([A-Za-z][A-Za-z0-9_]*)\s*{\s*([^}]*?)\s*}/g,
      replacement: (match: string, name: string, content: string) => {
        // Check if the interface has optional properties
        if (content.includes('?:')) {
          return match;
        }
        // Convert to type alias with Readonly
        return `type ${name} = Readonly<{\n  ${content}\n}>;`;
      },
      description: 'Convert interfaces to readonly type aliases for immutability',
      type: 'syntax'
    },
    {
      pattern: /([a-zA-Z0-9_$]+):\s*Array<([^>]+)>/g,
      replacement: '$1: $2[]',
      description: 'Use array shorthand notation instead of generic Array type',
      type: 'syntax'
    },
    {
      pattern: /([a-zA-Z0-9_$]+):\s*any/g,
      replacement: '$1: unknown',
      description: 'Replace any with unknown for better type safety',
      type: 'syntax'
    },
  ],
  // CSS fixers
  css: [
    {
      pattern: /([a-zA-Z0-9_\-]+)\s*:\s*([^;]+);/g,
      replacement: '$1: $2;',
      description: 'Standardize spacing around colons in CSS properties',
      type: 'formatting'
    },
    {
      pattern: /\s*!important/g,
      replacement: ' !important',
      description: 'Standardize spacing before !important',
      type: 'formatting'
    },
    {
      pattern: /rgb\((\d+),\s*(\d+),\s*(\d+)\)/g,
      replacement: (match: string, r: string, g: string, b: string) => {
        // Convert RGB to hexadecimal
        const hex = `#${Number(r).toString(16).padStart(2, '0')}${Number(g).toString(16).padStart(2, '0')}${Number(b).toString(16).padStart(2, '0')}`;
        return hex;
      },
      description: 'Convert RGB colors to hexadecimal',
      type: 'formatting'
    },
    {
      pattern: /margin-top:\s*(\d+)px;\s*margin-right:\s*(\d+)px;\s*margin-bottom:\s*(\d+)px;\s*margin-left:\s*(\d+)px;/g,
      replacement: 'margin: $1px $2px $3px $4px;',
      description: 'Combine margin properties into shorthand',
      type: 'formatting'
    },
    {
      pattern: /padding-top:\s*(\d+)px;\s*padding-right:\s*(\d+)px;\s*padding-bottom:\s*(\d+)px;\s*padding-left:\s*(\d+)px;/g,
      replacement: 'padding: $1px $2px $3px $4px;',
      description: 'Combine padding properties into shorthand',
      type: 'formatting'
    },
    {
      pattern: /border-width:\s*(\d+)px;\s*border-style:\s*([a-zA-Z]+);\s*border-color:\s*([#a-zA-Z0-9]+);/g,
      replacement: 'border: $1px $2 $3;',
      description: 'Combine border properties into shorthand',
      type: 'formatting'
    },
  ],
  // HTML fixers
  html: [
    {
      pattern: /<img([^>]*)>/g,
      replacement: (match: string, attributes: string) => {
        if (attributes.includes('alt=')) {
          return match;
        }
        return `<img${attributes} alt="">`;
      },
      description: 'Add alt attribute to img tags for accessibility',
      type: 'accessibility'
    },
    {
      pattern: /<a([^>]*)>/g,
      replacement: (match: string, attributes: string) => {
        if (attributes.includes('href=') && !attributes.includes('rel=')) {
          return `<a${attributes} rel="noopener noreferrer">`;
        }
        return match;
      },
      description: 'Add rel="noopener noreferrer" to external links for security',
      type: 'security'
    },
    {
      pattern: /<button([^>]*)>/g,
      replacement: (match: string, attributes: string) => {
        if (!attributes.includes('type=')) {
          return `<button${attributes} type="button">`;
        }
        return match;
      },
      description: 'Add type attribute to button tags',
      type: 'syntax'
    },
    {
      pattern: /<div([^>]*)>\s*<\/div>/g,
      replacement: '',
      description: 'Remove empty div tags',
      type: 'unused'
    },
    {
      pattern: /<!--[\s\S]*?-->/g,
      replacement: '',
      description: 'Remove HTML comments',
      type: 'unused'
    },
  ],
  // JSON fixers
  json: [
    {
      pattern: /,\s*}/g,
      replacement: ' }',
      description: 'Remove trailing commas in JSON objects',
      type: 'syntax'
    },
    {
      pattern: /,\s*]/g,
      replacement: ' ]',
      description: 'Remove trailing commas in JSON arrays',
      type: 'syntax'
    },
  ],
  
  // Python fixers
  python: [
    {
      pattern: /print\s+([^(].*?)$/gm,
      replacement: 'print($1)',
      description: 'Convert Python 2 print statements to Python 3 print function',
      type: 'syntax'
    },
    {
      pattern: /except\s+([A-Za-z0-9_]+)\s*,\s*([A-Za-z0-9_]+):/g,
      replacement: 'except $1 as $2:',
      description: 'Convert Python 2 except syntax to Python 3',
      type: 'syntax'
    },
    {
      pattern: /([a-zA-Z0-9_]+)\s*=\s*([a-zA-Z0-9_]+)\s*==\s*([a-zA-Z0-9_]+)/g,
      replacement: '$1 = $2 == $3',
      description: 'Fix spacing around equality operators',
      type: 'formatting'
    },
    {
      pattern: /([a-zA-Z0-9_]+)\s*=\s*([a-zA-Z0-9_]+)\s*!=\s*([a-zA-Z0-9_]+)/g,
      replacement: '$1 = $2 != $3',
      description: 'Fix spacing around inequality operators',
      type: 'formatting'
    },
    {
      pattern: /([a-zA-Z0-9_]+)\s+=\s+([a-zA-Z0-9_]+)\s+\+\s+([a-zA-Z0-9_]+)/g,
      replacement: '$1 = $2 + $3',
      description: 'Fix spacing around addition operators',
      type: 'formatting'
    },
    {
      pattern: /([a-zA-Z0-9_]+)\s+=\s+([a-zA-Z0-9_]+)\s+-\s+([a-zA-Z0-9_]+)/g,
      replacement: '$1 = $2 - $3',
      description: 'Fix spacing around subtraction operators',
      type: 'formatting'
    },
    {
      pattern: /([a-zA-Z0-9_]+)\s+=\s+([a-zA-Z0-9_]+)\s+\*\s+([a-zA-Z0-9_]+)/g,
      replacement: '$1 = $2 * $3',
      description: 'Fix spacing around multiplication operators',
      type: 'formatting'
    },
    {
      pattern: /([a-zA-Z0-9_]+)\s+=\s+([a-zA-Z0-9_]+)\s+\/\s+([a-zA-Z0-9_]+)/g,
      replacement: '$1 = $2 / $3',
      description: 'Fix spacing around division operators',
      type: 'formatting'
    },
    {
      pattern: /# TODO:?/g,
      replacement: '# TODO:',
      description: 'Standardize TODO comments',
      type: 'formatting'
    },
    {
      pattern: /\.has_key\(([^)]+)\)/g,
      replacement: '$1 in ',
      description: 'Replace deprecated has_key() method with "in" operator',
      type: 'syntax'
    },
    {
      pattern: /([a-zA-Z0-9_]+)\.iteritems\(\)/g,
      replacement: '$1.items()',
      description: 'Replace deprecated iteritems() with items()',
      type: 'syntax'
    },
    {
      pattern: /([a-zA-Z0-9_]+)\.iterkeys\(\)/g,
      replacement: '$1.keys()',
      description: 'Replace deprecated iterkeys() with keys()',
      type: 'syntax'
    },
    {
      pattern: /([a-zA-Z0-9_]+)\.itervalues\(\)/g,
      replacement: '$1.values()',
      description: 'Replace deprecated itervalues() with values()',
      type: 'syntax'
    }
  ],
  
  // C fixers
  c: [
    {
      pattern: /\/\/ *TODO:?/g,
      replacement: '// TODO:',
      description: 'Standardize TODO comments',
      type: 'formatting'
    },
    {
      pattern: /([a-zA-Z0-9_]+)\s*=\s*([a-zA-Z0-9_]+)\s*==\s*([a-zA-Z0-9_]+)/g,
      replacement: '$1 = $2 == $3',
      description: 'Fix spacing around equality operators',
      type: 'formatting'
    },
    {
      pattern: /([a-zA-Z0-9_]+)\s*=\s*([a-zA-Z0-9_]+)\s*!=\s*([a-zA-Z0-9_]+)/g,
      replacement: '$1 = $2 != $3',
      description: 'Fix spacing around inequality operators',
      type: 'formatting'
    },
    {
      pattern: /if\s*\(\s*([a-zA-Z0-9_]+)\s*=\s*([a-zA-Z0-9_]+)\s*\)/g,
      replacement: 'if ($1 == $2)',
      description: 'Fix assignment in if condition (likely a bug)',
      type: 'syntax'
    },
    {
      pattern: /while\s*\(\s*([a-zA-Z0-9_]+)\s*=\s*([a-zA-Z0-9_]+)\s*\)/g,
      replacement: 'while ($1 == $2)',
      description: 'Fix assignment in while condition (likely a bug)',
      type: 'syntax'
    },
    {
      pattern: /malloc\s*\(\s*sizeof\s*\(\s*([a-zA-Z0-9_]+)\s*\)\s*\)/g,
      replacement: 'malloc(sizeof($1))',
      description: 'Fix spacing in malloc calls',
      type: 'formatting'
    },
    {
      pattern: /free\s*\(\s*([a-zA-Z0-9_]+)\s*\)\s*;(?!\s*\1\s*=\s*NULL)/g,
      replacement: 'free($1);\n$1 = NULL;',
      description: 'Set pointer to NULL after free to prevent use-after-free bugs',
      type: 'security'
    }
  ],
  
  // C++ fixers
  cpp: [
    {
      pattern: /\/\/ *TODO:?/g,
      replacement: '// TODO:',
      description: 'Standardize TODO comments',
      type: 'formatting'
    },
    {
      pattern: /([a-zA-Z0-9_]+)\s*=\s*([a-zA-Z0-9_]+)\s*==\s*([a-zA-Z0-9_]+)/g,
      replacement: '$1 = $2 == $3',
      description: 'Fix spacing around equality operators',
      type: 'formatting'
    },
    {
      pattern: /([a-zA-Z0-9_]+)\s*=\s*([a-zA-Z0-9_]+)\s*!=\s*([a-zA-Z0-9_]+)/g,
      replacement: '$1 = $2 != $3',
      description: 'Fix spacing around inequality operators',
      type: 'formatting'
    },
    {
      pattern: /if\s*\(\s*([a-zA-Z0-9_]+)\s*=\s*([a-zA-Z0-9_]+)\s*\)/g,
      replacement: 'if ($1 == $2)',
      description: 'Fix assignment in if condition (likely a bug)',
      type: 'syntax'
    },
    {
      pattern: /while\s*\(\s*([a-zA-Z0-9_]+)\s*=\s*([a-zA-Z0-9_]+)\s*\)/g,
      replacement: 'while ($1 == $2)',
      description: 'Fix assignment in while condition (likely a bug)',
      type: 'syntax'
    },
    {
      pattern: /std::cout\s*<<\s*([^<]+?)\s*;/g,
      replacement: 'std::cout << $1 << std::endl;',
      description: 'Add std::endl to cout statements',
      type: 'syntax'
    },
    {
      pattern: /new\s+([a-zA-Z0-9_]+)\s*\[([^\]]+)\]/g,
      replacement: (match, type, size) => {
        return `new ${type}[${size}]`;
      },
      description: 'Fix spacing in new[] expressions',
      type: 'formatting'
    },
    {
      pattern: /delete\s+([a-zA-Z0-9_]+)\s*;(?!\s*\1\s*=\s*nullptr)/g,
      replacement: 'delete $1;\n$1 = nullptr;',
      description: 'Set pointer to nullptr after delete to prevent use-after-free bugs',
      type: 'security'
    },
    {
      pattern: /delete\[\]\s+([a-zA-Z0-9_]+)\s*;(?!\s*\1\s*=\s*nullptr)/g,
      replacement: 'delete[] $1;\n$1 = nullptr;',
      description: 'Set pointer to nullptr after delete[] to prevent use-after-free bugs',
      type: 'security'
    }
  ],
  
  // C# fixers
  csharp: [
    {
      pattern: /\/\/ *TODO:?/g,
      replacement: '// TODO:',
      description: 'Standardize TODO comments',
      type: 'formatting'
    },
    {
      pattern: /([a-zA-Z0-9_]+)\s*=\s*([a-zA-Z0-9_]+)\s*==\s*([a-zA-Z0-9_]+)/g,
      replacement: '$1 = $2 == $3',
      description: 'Fix spacing around equality operators',
      type: 'formatting'
    },
    {
      pattern: /([a-zA-Z0-9_]+)\s*=\s*([a-zA-Z0-9_]+)\s*!=\s*([a-zA-Z0-9_]+)/g,
      replacement: '$1 = $2 != $3',
      description: 'Fix spacing around inequality operators',
      type: 'formatting'
    },
    {
      pattern: /if\s*\(\s*([a-zA-Z0-9_]+)\s*=\s*([a-zA-Z0-9_]+)\s*\)/g,
      replacement: 'if ($1 == $2)',
      description: 'Fix assignment in if condition (likely a bug)',
      type: 'syntax'
    },
    {
      pattern: /Console\.Write\(/g,
      replacement: 'Console.WriteLine(',
      description: 'Use Console.WriteLine instead of Console.Write for better readability',
      type: 'syntax'
    },
    {
      pattern: /var\s+([a-zA-Z0-9_]+)\s*=\s*new\s+List<([a-zA-Z0-9_<>]+)>\(\);/g,
      replacement: 'List<$2> $1 = new();',
      description: 'Use C# 9.0+ new() syntax for better readability',
      type: 'syntax'
    }
  ],
  
  // Java fixers
  java: [
    {
      pattern: /\/\/ *TODO:?/g,
      replacement: '// TODO:',
      description: 'Standardize TODO comments',
      type: 'formatting'
    },
    {
      pattern: /([a-zA-Z0-9_]+)\s*=\s*([a-zA-Z0-9_]+)\s*==\s*([a-zA-Z0-9_]+)/g,
      replacement: '$1 = $2 == $3',
      description: 'Fix spacing around equality operators',
      type: 'formatting'
    },
    {
      pattern: /([a-zA-Z0-9_]+)\s*=\s*([a-zA-Z0-9_]+)\s*!=\s*([a-zA-Z0-9_]+)/g,
      replacement: '$1 = $2 != $3',
      description: 'Fix spacing around inequality operators',
      type: 'formatting'
    },
    {
      pattern: /if\s*\(\s*([a-zA-Z0-9_]+)\s*=\s*([a-zA-Z0-9_]+)\s*\)/g,
      replacement: 'if ($1 == $2)',
      description: 'Fix assignment in if condition (likely a bug)',
      type: 'syntax'
    },
    {
      pattern: /System\.out\.print\(/g,
      replacement: 'System.out.println(',
      description: 'Use println instead of print for better readability',
      type: 'syntax'
    },
    {
      pattern: /new\s+ArrayList<([a-zA-Z0-9_<>]+)>\(\)/g,
      replacement: 'new ArrayList<>()',
      description: 'Use diamond operator for better readability',
      type: 'syntax'
    },
    {
      pattern: /([a-zA-Z0-9_]+)\.equals\(null\)/g,
      replacement: 'null == $1',
      description: 'Prevent NullPointerException by checking null first',
      type: 'security'
    }
  ],
  
  // Go fixers
  go: [
    {
      pattern: /\/\/ *TODO:?/g,
      replacement: '// TODO:',
      description: 'Standardize TODO comments',
      type: 'formatting'
    },
    {
      pattern: /fmt\.Print\(/g,
      replacement: 'fmt.Println(',
      description: 'Use fmt.Println instead of fmt.Print for better readability',
      type: 'syntax'
    },
    {
      pattern: /if\s+err\s*:=\s*([^;]+);\s*err\s*!=\s*nil\s*{/g,
      replacement: 'if err := $1; err != nil {',
      description: 'Fix spacing in error checking',
      type: 'formatting'
    },
    {
      pattern: /for\s+i\s*:=\s*0;\s*i\s*<\s*len\(([a-zA-Z0-9_]+)\);\s*i\+\+\s*{/g,
      replacement: 'for i, _ := range $1 {',
      description: 'Use range instead of traditional for loop',
      type: 'syntax'
    }
  ],
  
  // Ruby fixers
  ruby: [
    {
      pattern: /# *TODO:?/g,
      replacement: '# TODO:',
      description: 'Standardize TODO comments',
      type: 'formatting'
    },
    {
      pattern: /puts\s+"([^"]+)"/g,
      replacement: 'puts "$1"',
      description: 'Use double quotes for string interpolation',
      type: 'syntax'
    },
    {
      pattern: /([a-zA-Z0-9_]+)\.each\s+do\s+\|([a-zA-Z0-9_]+)\|\s+([^e]+)\s+end/g,
      replacement: '$1.each { |$2| $3 }',
      description: 'Use block syntax for simple iterations',
      type: 'syntax'
    },
    {
      pattern: /for\s+([a-zA-Z0-9_]+)\s+in\s+([a-zA-Z0-9_]+)\s+do/g,
      replacement: '$2.each do |$1|',
      description: 'Use each instead of for loops',
      type: 'syntax'
    }
  ],
  
  // PHP fixers
  php: [
    {
      pattern: /\/\/ *TODO:?/g,
      replacement: '// TODO:',
      description: 'Standardize TODO comments',
      type: 'formatting'
    },
    {
      pattern: /echo\s+([^;]+);/g,
      replacement: 'echo $1 . PHP_EOL;',
      description: 'Add newline to echo statements',
      type: 'syntax'
    },
    {
      pattern: /([a-zA-Z0-9_]+)\s*=\s*([a-zA-Z0-9_]+)\s*==\s*([a-zA-Z0-9_]+)/g,
      replacement: '$1 = $2 === $3',
      description: 'Use strict equality (===) instead of loose equality (==)',
      type: 'syntax'
    },
    {
      pattern: /([a-zA-Z0-9_]+)\s*=\s*([a-zA-Z0-9_]+)\s*!=\s*([a-zA-Z0-9_]+)/g,
      replacement: '$1 = $2 !== $3',
      description: 'Use strict inequality (!==) instead of loose inequality (!=)',
      type: 'syntax'
    },
    {
      pattern: /mysql_/g,
      replacement: 'mysqli_',
      description: 'Use mysqli_ functions instead of deprecated mysql_ functions',
      type: 'security'
    }
  ],
  
  // Swift fixers
  swift: [
    {
      pattern: /\/\/ *TODO:?/g,
      replacement: '// TODO:',
      description: 'Standardize TODO comments',
      type: 'formatting'
    },
    {
      pattern: /print\(([^)]+)\)/g,
      replacement: 'print($1)',
      description: 'Fix spacing in print statements',
      type: 'formatting'
    },
    {
      pattern: /([a-zA-Z0-9_]+)\s*=\s*([a-zA-Z0-9_]+)\s*==\s*([a-zA-Z0-9_]+)/g,
      replacement: '$1 = $2 == $3',
      description: 'Fix spacing around equality operators',
      type: 'formatting'
    },
    {
      pattern: /([a-zA-Z0-9_]+)\s*=\s*([a-zA-Z0-9_]+)\s*!=\s*([a-zA-Z0-9_]+)/g,
      replacement: '$1 = $2 != $3',
      description: 'Fix spacing around inequality operators',
      type: 'formatting'
    },
    {
      pattern: /var\s+([a-zA-Z0-9_]+)\s*:\s*([a-zA-Z0-9_<>]+)\s*=\s*([a-zA-Z0-9_]+)/g,
      replacement: 'var $1: $2 = $3',
      description: 'Fix spacing in variable declarations',
      type: 'formatting'
    }
  ],
  
  // Rust fixers
  rust: [
    {
      pattern: /\/\/ *TODO:?/g,
      replacement: '// TODO:',
      description: 'Standardize TODO comments',
      type: 'formatting'
    },
    {
      pattern: /println!\s*\(\s*"([^"]+)"\s*\)/g,
      replacement: 'println!("$1")',
      description: 'Fix spacing in println! macro',
      type: 'formatting'
    },
    {
      pattern: /let\s+mut\s+([a-zA-Z0-9_]+)\s*:\s*([a-zA-Z0-9_<>]+)\s*=\s*([a-zA-Z0-9_]+)/g,
      replacement: 'let mut $1: $2 = $3',
      description: 'Fix spacing in mutable variable declarations',
      type: 'formatting'
    },
    {
      pattern: /let\s+([a-zA-Z0-9_]+)\s*:\s*([a-zA-Z0-9_<>]+)\s*=\s*([a-zA-Z0-9_]+)/g,
      replacement: 'let $1: $2 = $3',
      description: 'Fix spacing in immutable variable declarations',
      type: 'formatting'
    },
    {
      pattern: /fn\s+([a-zA-Z0-9_]+)\s*\(\s*([^)]*)\s*\)\s*->\s*([a-zA-Z0-9_<>]+)/g,
      replacement: 'fn $1($2) -> $3',
      description: 'Fix spacing in function declarations',
      type: 'formatting'
    }
  ]
};

/**
 * Fixes code issues in a file
 */
export async function handleFixCode(args: any) {
  if (args && typeof args === 'object' && ('path' in args || 'content' in args)) {
    try {
      // Get the file content
      let content: string;
      let filePath: string = '';
      
      if ('path' in args && typeof args.path === 'string') {
        filePath = args.path;
        
        // Check if path is a directory
        try {
          const stats = await fs.stat(filePath);
          if (stats.isDirectory()) {
            return {
              content: [{
                type: "text",
                text: `Error: The provided path '${filePath}' is a directory. Please provide a file path instead.`
              }],
              isError: true,
            };
          }
        } catch (statError: unknown) {
          // If stat fails, we'll let the readFile attempt handle the error
        }
        
        content = await fs.readFile(filePath, 'utf8');
      } else if ('content' in args && typeof args.content === 'string') {
        content = args.content;
      } else {
        return {
          content: [{ type: "text", text: "Error: Either path or content must be provided" }],
          isError: true,
        };
      }
      
      // Determine the language
      let language = args.language;
      if (!language && filePath) {
        language = getLanguageFromExtension(filePath);
      }
      
      if (!language) {
        return {
          content: [{ type: "text", text: "Error: Could not determine language. Please provide a language." }],
          isError: true,
        };
      }
      
      // Get the fix types
      const fixTypes = args.fixTypes || ['all'];
      
      // Fix the code
      const result = fixCode(content, language, fixTypes);
      
      // If a file path was provided, write the fixed code back to the file
      if (filePath) {
        await fs.writeFile(filePath, result.fixedCode);
      }
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            language,
            fixTypes,
            fixes: result.fixes,
            fixedCode: result.fixedCode,
            message: `Fixed ${result.fixes.length} issues in the code.`
          }, null, 2)
        }],
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: String(error),
            message: `Failed to fix code.`
          }, null, 2)
        }],
        isError: true,
      };
    }
  }
  
  return {
    content: [{ type: "text", text: "Error: Invalid arguments for fix_code" }],
    isError: true,
  };
}

/**
 * Analyzes code for issues
 */
export async function handleAnalyzeCode(args: any) {
  if (args && typeof args === 'object' && ('path' in args || 'content' in args)) {
    try {
      // Get the file content
      let content: string;
      let filePath: string = '';
      
      if ('path' in args && typeof args.path === 'string') {
        filePath = args.path;
        
        // Check if path is a directory
        try {
          const stats = await fs.stat(filePath);
          if (stats.isDirectory()) {
            return {
              content: [{
                type: "text",
                text: `Error: The provided path '${filePath}' is a directory. Please provide a file path instead.`
              }],
              isError: true,
            };
          }
        } catch (statError: unknown) {
          // If stat fails, we'll let the readFile attempt handle the error
        }
        
        content = await fs.readFile(filePath, 'utf8');
      } else if ('content' in args && typeof args.content === 'string') {
        content = args.content;
      } else {
        return {
          content: [{ type: "text", text: "Error: Either path or content must be provided" }],
          isError: true,
        };
      }
      
      // Determine the language
      let language = args.language;
      if (!language && filePath) {
        language = getLanguageFromExtension(filePath);
      }
      
      if (!language) {
        return {
          content: [{ type: "text", text: "Error: Could not determine language. Please provide a language." }],
          isError: true,
        };
      }
      
      // Analyze the code
      const issues = analyzeCode(content, language);
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            language,
            issues,
            message: `Found ${issues.length} issues in the code.`
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
 * Fixes code issues in a project directory
 */
export async function handleFixProject(args: any) {
  if (args && typeof args === 'object' && 'directory' in args && typeof args.directory === 'string') {
    try {
      const { directory } = args;
      
      // Check if directory exists and is actually a directory
      try {
        const stats = await fs.stat(directory);
        if (!stats.isDirectory()) {
          return {
            content: [{
              type: "text",
              text: `Error: The provided path '${directory}' is not a directory.`
            }],
            isError: true,
          };
        }
      } catch (statError: unknown) {
        const errorMessage = statError instanceof Error
          ? statError.message
          : String(statError);
          
        return {
          content: [{
            type: "text",
            text: `Error: Could not access directory '${directory}': ${errorMessage}`
          }],
          isError: true,
        };
      }
      
      const recursive = args.recursive !== false; // Default to true
      const extensions = args.extensions || DEFAULT_EXTENSIONS;
      const fixTypes = args.fixTypes || ['all'];
      
      // Get all files in the directory
      const files = await getFilesInDirectory(directory, recursive, extensions);
      
      // Process files in batches to limit concurrency
      const results = [];
      const batchSize = CONFIG.MAX_CONCURRENT_FILES;
      
      for (let i = 0; i < files.length; i += batchSize) {
        const batch = files.slice(i, i + batchSize);
        
        // Add a small delay between batches to prevent resource exhaustion
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        const batchResults = await Promise.all(
          batch.map(async (filePath) => {
            try {
              // Check file size before processing
              const stats = await fs.stat(filePath);
              if (stats.size > CONFIG.MAX_FILE_SIZE) {
                return {
                  path: filePath,
                  error: 'File too large',
                  message: `Skipped file: ${filePath} (${Math.round(stats.size / 1024 / 1024)}MB exceeds limit)`
                };
              }
              
              // Set a timeout for the operation
              const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error(`Operation timed out for ${filePath}`)), CONFIG.OPERATION_TIMEOUT);
              });
              
              // Process the file with timeout
              const processingPromise = processFile(filePath, fixTypes);
              
              // Race between processing and timeout
              const result = await Promise.race([processingPromise, timeoutPromise]);
              return result;
            } catch (error) {
              return {
                path: filePath,
                error: String(error),
                message: `Failed to fix file: ${filePath}`
              };
            }
          })
        );
        
        results.push(...batchResults);
      }
      
      // Count the total number of fixes
      const totalFixes = results.reduce((total, result) => {
        if ('fixes' in result && Array.isArray(result.fixes)) {
          return total + result.fixes.length;
        }
        return total;
      }, 0);
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            directory,
            fixTypes,
            totalFiles: results.length,
            totalFixes,
            results,
            message: `Fixed ${totalFixes} issues in ${results.length} files.`
          }, null, 2)
        }],
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            directory: args.directory,
            error: String(error),
            message: `Failed to fix project directory: ${args.directory}`
          }, null, 2)
        }],
        isError: true,
      };
    }
  }
  
  return {
    content: [{ type: "text", text: "Error: Invalid arguments for fix_project" }],
    isError: true,
  };
}

/**
 * Fixes code issues
 */
function fixCode(content: string, language: string, fixTypes: string[]): { fixedCode: string; fixes: any[] } {
  let fixedCode = content;
  const fixes = [];
  
  // Get the fixers for the language
  const fixers = codeFixers[language] || [];
  
  // Apply each fixer with a limit on iterations to prevent infinite loops
  const maxIterations = 100;
  let iterations = 0;
  
  for (const fixer of fixers) {
    // Skip if the fix type is not included
    if (!fixTypes.includes('all') && !fixTypes.includes(fixer.type)) {
      continue;
    }
    
    // Apply the fix
    const originalCode = fixedCode;
    
    try {
      // Handle both string and function replacements with a safety limit
      if (typeof fixer.replacement === 'string') {
        // Limit replacements to prevent excessive memory usage
        fixedCode = safeReplace(fixedCode, fixer.pattern, fixer.replacement);
      } else if (typeof fixer.replacement === 'function') {
        fixedCode = safeReplace(fixedCode, fixer.pattern, fixer.replacement as any);
      }
      
      // Check if the code was changed
      if (originalCode !== fixedCode) {
        fixes.push({
          type: fixer.type,
          description: fixer.description,
        });
      }
    } catch (error) {
      console.error(`Error applying fixer ${fixer.description}: ${error}`);
      // Continue with the next fixer
    }
    
    // Safety check to prevent infinite loops
    iterations++;
    if (iterations > maxIterations) {
      console.warn(`Reached maximum iterations (${maxIterations}) when fixing code. Some fixes may not have been applied.`);
      break;
    }
  }
  
  return { fixedCode, fixes };
}

/**
 * Safely replace text with a limit on the number of replacements
 */
function safeReplace(text: string, pattern: RegExp, replacement: string | Function): string {
  const maxReplacements = 1000; // Limit to prevent excessive replacements
  let result = text;
  let count = 0;
  
  // Create a new RegExp with the global flag to ensure we can count matches
  const globalPattern = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g');
  
  // Count potential matches
  const matches = text.match(globalPattern);
  if (matches && matches.length > maxReplacements) {
    console.warn(`Too many potential replacements (${matches.length}). Limiting to ${maxReplacements}.`);
    
    // For excessive matches, use a different approach with a counter
    result = text.replace(globalPattern, (match, ...args) => {
      if (count++ < maxReplacements) {
        return typeof replacement === 'string' ? replacement : replacement(match, ...args);
      }
      return match; // Skip replacement after reaching the limit
    });
  } else {
    // Normal replacement for reasonable number of matches
    result = text.replace(pattern, replacement as any);
  }
  
  return result;
}

/**
 * Process a file by reading it in chunks, fixing the code, and writing it back
 */
async function processFile(filePath: string, fixTypes: string[]): Promise<any> {
  try {
    // Determine the language
    const language = getLanguageFromExtension(filePath);
    
    if (!language) {
      return {
        path: filePath,
        error: 'Could not determine language',
        message: `Skipped file: ${filePath}`
      };
    }
    
    // Read the file content
    const content = await fs.readFile(filePath, 'utf8');
    
    // Fix the code
    const result = fixCode(content, language, fixTypes);
    
    // Write the fixed code back to the file
    await fs.writeFile(filePath, result.fixedCode);
    
    return {
      path: filePath,
      language,
      fixes: result.fixes,
      message: `Fixed ${result.fixes.length} issues in ${filePath}`
    };
  } catch (error) {
    throw new Error(`Error processing file ${filePath}: ${error}`);
  }
}

/**
 * Analyzes code for issues
 */
function analyzeCode(content: string, language: string): any[] {
  const issues = [];
  
  // Get the fixers for the language
  const fixers = codeFixers[language] || [];
  
  // Check for each issue
  for (const fixer of fixers) {
    // Find all matches
    const matches = content.match(fixer.pattern);
    
    if (matches) {
      for (const match of matches) {
        issues.push({
          type: fixer.type,
          description: fixer.description,
          match,
        });
      }
    }
  }
  
  return issues;
}

/**
 * Gets the language from a file extension
 */
function getLanguageFromExtension(filePath: string): string {
  const extension = path.extname(filePath).toLowerCase();
  
  switch (extension) {
    // JavaScript/TypeScript
    case '.js':
    case '.jsx':
      return 'javascript';
    case '.ts':
    case '.tsx':
      return 'typescript';
    
    // Web frameworks
    case '.vue':
      return 'vue';
    case '.svelte':
      return 'svelte';
    
    // Styling
    case '.css':
    case '.scss':
    case '.less':
      return 'css';
    
    // Markup/Data
    case '.html':
    case '.htm':
      return 'html';
    case '.json':
      return 'json';
    
    // Python
    case '.py':
    case '.pyx':
    case '.pyi':
      return 'python';
    
    // C/C++
    case '.c':
    case '.h':
      return 'c';
    case '.cpp':
    case '.cc':
    case '.hpp':
      return 'cpp';
    
    // C#
    case '.cs':
      return 'csharp';
    
    // Java
    case '.java':
      return 'java';
    
    // Go
    case '.go':
      return 'go';
    
    // Ruby
    case '.rb':
      return 'ruby';
    
    // PHP
    case '.php':
      return 'php';
    
    // Swift
    case '.swift':
      return 'swift';
    
    // Rust
    case '.rs':
      return 'rust';
    
    default:
      return '';
  }
}

/**
 * Gets all files in a directory
 */
async function getFilesInDirectory(directory: string, recursive: boolean, extensions: string[]): Promise<string[]> {
  const files: string[] = [];
  const maxFilesToProcess = 1000; // Safety limit
  
  try {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    
    for (const entry of entries) {
      // Check if we've reached the file limit
      if (files.length >= maxFilesToProcess) {
        console.warn(`Reached maximum file limit (${maxFilesToProcess}). Some files will not be processed.`);
        break;
      }
      
      const entryPath = path.join(directory, entry.name);
      
      if (entry.isDirectory() && recursive) {
        const subFiles = await getFilesInDirectory(entryPath, recursive, extensions);
        
        // Only add files up to the limit
        const remainingSlots = maxFilesToProcess - files.length;
        if (remainingSlots > 0) {
          files.push(...subFiles.slice(0, remainingSlots));
        }
      } else if (entry.isFile() && extensions.includes(path.extname(entry.name).toLowerCase())) {
        files.push(entryPath);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${directory}: ${error}`);
  }
  
  return files;
}

/**
 * Process a file in chunks to reduce memory usage
 * Note: This is a more memory-efficient approach but not used in the current implementation
 * as it adds complexity and may not be necessary for most files
 */
async function processLargeFile(filePath: string, language: string, fixTypes: string[]): Promise<{ fixedCode: string; fixes: any[] }> {
  return new Promise((resolve, reject) => {
    const chunks: string[] = [];
    const fixes: any[] = [];
    const readStream = createReadStream(filePath, { encoding: 'utf8', highWaterMark: CONFIG.CHUNK_SIZE });
    
    readStream.on('data', (chunk) => {
      try {
        // Ensure chunk is a string
        const chunkStr = typeof chunk === 'string' ? chunk : chunk.toString('utf8');
        const result = fixCode(chunkStr, language, fixTypes);
        chunks.push(result.fixedCode);
        fixes.push(...result.fixes);
      } catch (error) {
        readStream.destroy();
        reject(new Error(`Error processing chunk: ${error}`));
      }
    });
    
    readStream.on('end', () => {
      resolve({
        fixedCode: chunks.join(''),
        fixes
      });
    });
    
    readStream.on('error', (error) => {
      reject(new Error(`Error reading file: ${error}`));
    });
  });
}

