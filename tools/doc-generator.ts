// Auto-generated boilerplate for doc-generator

import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as fsSync from 'fs';

export function activate() {
  console.log("[TOOL] doc-generator activated");
}

/**
 * Handles file write events to trigger documentation updates
 */
export function onFileWrite(event: { path: string; content: string }) {
  console.log(`[Doc Generator] Watching file write: ${event.path}`);
  
  // Check if it's a source code file
  const fileExt = path.extname(event.path).toLowerCase();
  if (['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.rb', '.go', '.cs', '.php'].includes(fileExt)) {
    console.log(`[Doc Generator] Detected source file change: ${event.path}`);
    // Could trigger automatic documentation updates
  }
}

/**
 * Handles session start logic
 */
export function onSessionStart(session: { id: string; startTime: number }) {
  console.log(`[Doc Generator] Session started: ${session.id}`);
  // Could load configuration settings
}

/**
 * Handles doc-generator commands
 */
export async function onCommand(command: { name: string; args: any[] }) {
  switch (command.name) {
    case 'doc-generator:generate':
      console.log('[Doc Generator] Generating documentation...');
      return await handleGenerateDoc(command.args[0]);
    case 'doc-generator:update':
      console.log('[Doc Generator] Updating documentation...');
      return await handleUpdateDoc(command.args[0]);
    case 'doc-generator:readme':
      console.log('[Doc Generator] Generating README...');
      return await handleGenerateReadme(command.args[0]);
    case 'doc-generator:analyze':
      console.log('[Doc Generator] Analyzing documentation...');
      return await handleAnalyzeDoc(command.args[0]);
    default:
      console.warn(`[Doc Generator] Unknown command: ${command.name}`);
      return { error: `Unknown command: ${command.name}` };
  }
}

// Define schemas for Doc Generator tool
export const GenerateDocSchema = z.object({
  path: z.string(),
  recursive: z.boolean().optional().default(true),
  output: z.string().optional(),
  format: z.enum(['markdown', 'html', 'json', 'text']).optional().default('markdown'),
  includePrivate: z.boolean().optional().default(false),
  customTemplate: z.string().optional(),
  includeTOC: z.boolean().optional().default(true),
});

export const UpdateDocSchema = z.object({
  path: z.string(),
  docPath: z.string(),
  updateMode: z.enum(['append', 'replace', 'merge']).optional().default('merge'),
  updateSections: z.array(z.string()).optional(),
});

export const GenerateReadmeSchema = z.object({
  projectPath: z.string(),
  output: z.string().optional(),
  sections: z.array(
    z.enum([
      'title', 
      'description', 
      'installation', 
      'usage', 
      'api', 
      'examples',
      'contributing', 
      'license', 
      'badges', 
      'screenshots',
      'testing',
      'roadmap',
      'faq',
      'acknowledgements',
      'contact'
    ])
  ).optional().default(['title', 'description', 'installation', 'usage', 'api', 'contributing', 'license']),
  detectFromPackageJson: z.boolean().optional().default(true),
  includeBadges: z.boolean().optional().default(true),
  badgeTypes: z.array(z.string()).optional(),
});

export const AnalyzeDocSchema = z.object({
  path: z.string(),
  checkCoverage: z.boolean().optional().default(true),
  checkQuality: z.boolean().optional().default(true),
  suggestImprovements: z.boolean().optional().default(true),
});

// Helper function to check if a file is documented
async function isFileDocumented(filePath: string): Promise<boolean> {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    
    // Check for documentation patterns based on file extension
    const fileExt = path.extname(filePath).toLowerCase();
    
    if (['.js', '.ts', '.jsx', '.tsx'].includes(fileExt)) {
      // Look for JSDoc comments
      return /\/\*\*[\s\S]*?\*\//.test(content);
    } else if (fileExt === '.py') {
      // Look for Python docstrings
      return /"""[\s\S]*?"""/.test(content);
    } else if (['.rb'].includes(fileExt)) {
      // Look for Ruby documentation
      return /=begin[\s\S]*?=end/.test(content);
    } else if (['.java', '.cs'].includes(fileExt)) {
      // Look for JavaDoc style comments
      return /\/\*\*[\s\S]*?\*\//.test(content);
    }
    
    // Default: check for any kind of comment blocks
    return /\/\*[\s\S]*?\*\/|\/\/.*|#.*/.test(content);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return false;
  }
}

/**
 * Generates documentation for a project
 */
async function handleGenerateDoc(args: any) {
  try {
    const result = GenerateDocSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for generating documentation"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const { path: projectPath, recursive, output, format, includePrivate, customTemplate, includeTOC } = result.data;
    
    // Check if path exists
    try {
      const stats = await fs.stat(projectPath);
      if (!stats.isDirectory()) {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              error: `Path is not a directory: ${projectPath}`,
              message: "Failed to generate documentation"
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
            error: `Invalid path: ${projectPath}`,
            message: "Failed to generate documentation"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    // In a real implementation, this would generate documentation
    // For now, we'll just return a mock success response
    
    const outputPath = output || path.join(projectPath, 'docs');
    
    // Mock generated documentation stats
    const generatedDocs = {
      totalFiles: 42,
      documentedFiles: 37,
      undocumentedFiles: 5,
      coveragePercentage: 88.1,
      generatedFiles: [
        { 
          path: path.join(outputPath, 'index.md'),
          size: 15420,
          status: 'created'
        },
        { 
          path: path.join(outputPath, 'api.md'),
          size: 32650,
          status: 'created'
        },
        { 
          path: path.join(outputPath, 'modules.md'),
          size: 8760,
          status: 'created'
        }
      ]
    };
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          projectPath,
          outputPath,
          format,
          stats: {
            totalFiles: generatedDocs.totalFiles,
            documentedFiles: generatedDocs.documentedFiles,
            undocumentedFiles: generatedDocs.undocumentedFiles,
            coveragePercentage: generatedDocs.coveragePercentage
          },
          generatedFiles: generatedDocs.generatedFiles.map(file => ({
            path: file.path,
            size: file.size,
            status: file.status
          })),
          message: `Documentation generated successfully. Coverage: ${generatedDocs.coveragePercentage}%`
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to generate documentation"
        }, null, 2)
      }],
      isError: true
    };
  }
}

/**
 * Updates existing documentation
 */
async function handleUpdateDoc(args: any) {
  try {
    const result = UpdateDocSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for updating documentation"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const { path: filePath, docPath, updateMode, updateSections } = result.data;
    
    // Check if files exist
    try {
      await fs.access(filePath);
      await fs.access(docPath);
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: `One or more files not found: ${filePath}, ${docPath}`,
            message: "Failed to update documentation"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    // In a real implementation, this would update the documentation
    // For now, we'll just return a mock success response
    
    // Mock updated sections
    const updatedSections = updateSections || ['API', 'Usage', 'Examples'];
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          filePath,
          docPath,
          updateMode,
          updatedSections,
          message: `Documentation updated successfully. Updated sections: ${updatedSections.join(', ')}`
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to update documentation"
        }, null, 2)
      }],
      isError: true
    };
  }
}

/**
 * Generates a README file for a project
 */
async function handleGenerateReadme(args: any) {
  try {
    const result = GenerateReadmeSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for generating README"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const { 
      projectPath, 
      output, 
      sections, 
      detectFromPackageJson, 
      includeBadges, 
      badgeTypes 
    } = result.data;
    
    // Check if project path exists
    try {
      const stats = await fs.stat(projectPath);
      if (!stats.isDirectory()) {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              error: `Project path is not a directory: ${projectPath}`,
              message: "Failed to generate README"
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
            error: `Invalid project path: ${projectPath}`,
            message: "Failed to generate README"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    // In a real implementation, this would generate a README file
    // For now, we'll just return a mock success response
    
    let projectInfo: any = {
      name: path.basename(projectPath),
      description: "A project description would be detected automatically",
      version: "1.0.0",
      license: "MIT"
    };
    
    // Mock reading from package.json
    if (detectFromPackageJson) {
      const packageJsonPath = path.join(projectPath, 'package.json');
      if (fsSync.existsSync(packageJsonPath)) {
        try {
          const packageJsonContent = await fs.readFile(packageJsonPath, 'utf8');
          const packageJson = JSON.parse(packageJsonContent);
          projectInfo = {
            ...projectInfo,
            name: packageJson.name || projectInfo.name,
            description: packageJson.description || projectInfo.description,
            version: packageJson.version || projectInfo.version,
            license: packageJson.license || projectInfo.license,
            author: packageJson.author,
            repository: packageJson.repository?.url || packageJson.repository,
            dependencies: Object.keys(packageJson.dependencies || {}).length,
            devDependencies: Object.keys(packageJson.devDependencies || {}).length
          };
        } catch (e) {
          console.warn(`Couldn't read package.json: ${e}`);
        }
      }
    }
    
    // Determine output path
    const readmePath = output || path.join(projectPath, 'README.md');
    
    // Build a mock README content based on sections
    const readmeSections: Record<string, string> = {
      title: `# ${projectInfo.name}\n\n`,
      description: `${projectInfo.description}\n\n`,
      badges: includeBadges ? '![Version](https://img.shields.io/badge/version-' + projectInfo.version + '-blue.svg?cacheSeconds=2592000)\n' +
              '![License: ' + projectInfo.license + '](https://img.shields.io/badge/License-' + projectInfo.license + '-yellow.svg)\n\n' : '',
      installation: '## Installation\n\n```bash\nnpm install\n```\n\n',
      usage: '## Usage\n\n```bash\nnpm start\n```\n\n',
      api: '## API Reference\n\n*API documentation would be automatically generated from your code*\n\n',
      examples: '## Examples\n\n*Examples would be extracted from your code*\n\n',
      contributing: '## Contributing\n\nContributions, issues and feature requests are welcome!\n\n',
      license: `## License\n\nThis project is [${projectInfo.license}](LICENSE) licensed.\n\n`,
      testing: '## Testing\n\n```bash\nnpm test\n```\n\n',
      roadmap: '## Roadmap\n\n- Feature 1\n- Feature 2\n\n',
      faq: '## FAQ\n\n*Frequently asked questions would be generated based on documentation*\n\n',
      acknowledgements: '## Acknowledgements\n\n*Acknowledgements would be generated based on repository and contributors*\n\n',
      contact: '## Contact\n\n*Contact information would be extracted from package.json and git config*\n\n',
      screenshots: '## Screenshots\n\n*Screenshots would be detected from your project*\n\n'
    };
    
    // Combine selected sections
    const readmeContent = sections.map(section => readmeSections[section] || '').join('');
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          projectPath,
          readmePath,
          projectInfo,
          includedSections: sections,
          content: readmeContent.substring(0, 500) + '... (content truncated for preview)',
          message: `README.md generated successfully at ${readmePath}`
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to generate README"
        }, null, 2)
      }],
      isError: true
    };
  }
}

/**
 * Analyzes documentation quality and coverage
 */
async function handleAnalyzeDoc(args: any) {
  try {
    const result = AnalyzeDocSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for analyzing documentation"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const { path: projectPath, checkCoverage, checkQuality, suggestImprovements } = result.data;
    
    // Check if path exists
    try {
      const stats = await fs.stat(projectPath);
      if (!stats.isDirectory() && !stats.isFile()) {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              error: `Invalid path: ${projectPath}`,
              message: "Failed to analyze documentation"
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
            error: `Invalid path: ${projectPath}`,
            message: "Failed to analyze documentation"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    // In a real implementation, this would analyze the documentation
    // For now, we'll just return a mock analysis report
    
    // Mock analysis results
    const results = {
      coverage: checkCoverage ? {
        filesAnalyzed: 42,
        documentedFiles: 36,
        undocumentedFiles: 6,
        coveragePercentage: 85.7,
        filesNeedingDocumentation: [
          'src/components/UndocumentedComponent.js',
          'src/utils/helpers.js',
          'src/services/api.js',
          'src/hooks/useAuth.js',
          'src/context/AppContext.js',
          'src/utils/validation.js'
        ]
      } : undefined,
      
      quality: checkQuality ? {
        overallScore: 78,
        metrics: {
          completeness: 82,
          clarity: 75,
          consistency: 80,
          examples: 65,
          upToDate: 90
        },
        issues: [
          { severity: 'high', message: 'Missing parameter descriptions in 12 functions', files: ['src/utils/formatter.js', 'src/services/data.js'] },
          { severity: 'medium', message: 'Outdated documentation for API endpoints', files: ['src/api/endpoints.js'] },
          { severity: 'medium', message: 'Missing examples in utility functions', files: ['src/utils/transforms.js'] },
          { severity: 'low', message: 'Inconsistent documentation style', files: ['src/components/Button.js', 'src/components/Input.js'] },
        ]
      } : undefined,
      
      improvements: suggestImprovements ? [
        'Add JSDoc comments to all undocumented files',
        'Include examples in utility function documentation',
        'Update API endpoint documentation to match current implementation',
        'Standardize documentation style across components',
        'Add return type documentation to functions',
        'Include error handling documentation for async functions',
        'Create a documentation style guide for the project'
      ] : undefined
    };
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          projectPath,
          results,
          message: `Documentation analysis completed. Coverage: ${results.coverage?.coveragePercentage}%, Quality score: ${results.quality?.overallScore}/100`
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to analyze documentation"
        }, null, 2)
      }],
      isError: true
    };
  }
}