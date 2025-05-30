"use strict";
// Auto-generated boilerplate for git-initializer
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
exports.SetupRemoteSchema = exports.SetupGitignoreSchema = exports.CheckStatusSchema = exports.InitRepoSchema = void 0;
exports.activate = activate;
exports.onFileWrite = onFileWrite;
exports.onSessionStart = onSessionStart;
exports.onCommand = onCommand;
const zod_1 = require("zod");
const fs = __importStar(require("fs/promises"));
const fsSync = __importStar(require("fs"));
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
const util_1 = require("util");
// Promisify exec
const execAsync = (0, util_1.promisify)(child_process_1.exec);
function activate() {
    console.error("[TOOL] git-initializer activated");
    // Check if git is available
    checkGitAvailability();
}
/**
 * Handles file write events (not used for git-initializer)
 */
function onFileWrite(event) {
    // Not used in this tool
}
/**
 * Handles session start logic
 */
function onSessionStart(session) {
    console.error(`[Git Initializer] Session started: ${session.id}`);
}
/**
 * Handles git-initializer commands
 */
async function onCommand(command) {
    switch (command.name) {
        case 'git-initializer:init':
            console.error('[Git Initializer] Initializing repository...');
            return await handleInitRepo(command.args[0]);
        case 'git-initializer:status':
            console.error('[Git Initializer] Checking repository status...');
            return await handleCheckStatus(command.args[0]);
        case 'git-initializer:setup-gitignore':
            console.error('[Git Initializer] Setting up gitignore...');
            return await handleSetupGitignore(command.args[0]);
        case 'git-initializer:setup-remote':
            console.error('[Git Initializer] Setting up remote...');
            return await handleSetupRemote(command.args[0]);
        default:
            console.warn(`[Git Initializer] Unknown command: ${command.name}`);
            return { error: `Unknown command: ${command.name}` };
    }
}
// Define schemas for Git Initializer tool
exports.InitRepoSchema = zod_1.z.object({
    path: zod_1.z.string().optional(),
    readme: zod_1.z.boolean().optional().default(true),
    license: zod_1.z.enum([
        'mit', 'apache-2.0', 'gpl-3.0', 'bsd-3-clause', 'unlicense',
        'bsd-2-clause', 'gpl-2.0', 'lgpl-2.1', 'none'
    ]).optional().default('none'),
    initialCommit: zod_1.z.boolean().optional().default(true),
    commitMessage: zod_1.z.string().optional().default('Initial commit'),
});
exports.CheckStatusSchema = zod_1.z.object({
    path: zod_1.z.string().optional(),
    showUntracked: zod_1.z.boolean().optional().default(true),
    checkRemote: zod_1.z.boolean().optional().default(true),
});
exports.SetupGitignoreSchema = zod_1.z.object({
    path: zod_1.z.string().optional(),
    templates: zod_1.z.array(zod_1.z.string()).optional(),
    custom: zod_1.z.array(zod_1.z.string()).optional(),
    overwrite: zod_1.z.boolean().optional().default(false),
});
exports.SetupRemoteSchema = zod_1.z.object({
    path: zod_1.z.string().optional(),
    name: zod_1.z.string().optional().default('origin'),
    url: zod_1.z.string(),
    createBranch: zod_1.z.boolean().optional().default(false),
    branch: zod_1.z.string().optional().default('main'),
    push: zod_1.z.boolean().optional().default(false),
});
/**
 * Check if git is available on the system
 */
async function checkGitAvailability() {
    try {
        const { stdout } = await execAsync('git --version');
        console.error(`[Git Initializer] Git detected: ${stdout.trim()}`);
        return true;
    }
    catch (error) {
        console.error('[Git Initializer] Git not found. This tool requires git to be installed.');
        return false;
    }
}
/**
 * Run a git command in the specified directory
 */
async function runGitCommand(command, cwd = process.cwd()) {
    try {
        const { stdout, stderr } = await execAsync(`git ${command.join(' ')}`, { cwd });
        return {
            success: true,
            output: stdout.trim()
        };
    }
    catch (error) {
        return {
            success: false,
            output: error?.stdout || '',
            error: error?.stderr || String(error)
        };
    }
}
/**
 * Generate a basic README.md file
 */
function generateReadme(projectName) {
    return `# ${projectName}

A brief description of what this project does and who it's for.

## Installation

\`\`\`bash
npm install
\`\`\`

## Usage

\`\`\`javascript
// Example usage
\`\`\`

## License

[MIT](https://choosealicense.com/licenses/mit/)
`;
}
/**
 * Generate common .gitignore entries
 */
function generateGitignore(templates) {
    const snippets = {
        node: [
            'node_modules/',
            'npm-debug.log',
            'yarn-debug.log',
            'yarn-error.log',
            '.pnpm-debug.log',
            '.env',
            '.env.local',
            '.env.development.local',
            '.env.test.local',
            '.env.production.local',
            'coverage/',
            '.nyc_output/',
            'dist/',
            'build/'
        ],
        python: [
            '__pycache__/',
            '*.py[cod]',
            '*$py.class',
            '.env',
            '.venv',
            'env/',
            'venv/',
            'ENV/',
            'env.bak/',
            'venv.bak/',
            '.coverage',
            'htmlcov/',
            '.pytest_cache/',
            '*.so',
            '.Python',
            'build/',
            'develop-eggs/',
            'dist/',
            'downloads/',
            'eggs/',
            'parts/',
            'sdist/',
            'var/',
            '*.egg-info/',
            '.installed.cfg',
            '*.egg'
        ],
        java: [
            '*.class',
            '*.log',
            '*.ctxt',
            '.mtj.tmp/',
            '*.jar',
            '*.war',
            '*.nar',
            '*.ear',
            '*.zip',
            '*.tar.gz',
            '*.rar',
            'hs_err_pid*',
            'target/',
            '.classpath',
            '.project',
            '.settings/'
        ],
        vscode: [
            '.vscode/*',
            '!.vscode/settings.json',
            '!.vscode/tasks.json',
            '!.vscode/launch.json',
            '!.vscode/extensions.json',
            '*.code-workspace',
            '.history/'
        ],
        jetbrains: [
            '.idea/',
            '*.iml',
            '*.iws',
            '*.ipr',
            'out/',
            '.idea_modules/'
        ],
        macos: [
            '.DS_Store',
            '.AppleDouble',
            '.LSOverride',
            'Icon',
            '._*',
            '.DocumentRevisions-V100',
            '.fseventsd',
            '.Spotlight-V100',
            '.TemporaryItems',
            '.Trashes',
            '.VolumeIcon.icns',
            '.com.apple.timemachine.donotpresent'
        ],
        windows: [
            'Thumbs.db',
            'Thumbs.db:encryptable',
            'ehthumbs.db',
            'ehthumbs_vista.db',
            '*.stackdump',
            '[Dd]esktop.ini',
            '$RECYCLE.BIN/',
            '*.cab',
            '*.msi',
            '*.msix',
            '*.msm',
            '*.msp',
            '*.lnk'
        ]
    };
    const lines = [
        '# Generated .gitignore file',
        ''
    ];
    for (const template of templates) {
        if (snippets[template]) {
            lines.push(`# ${template.charAt(0).toUpperCase() + template.slice(1)}`);
            lines.push(...snippets[template], '');
        }
    }
    return lines.join('\n');
}
/**
 * Initializes a new git repository
 */
async function handleInitRepo(args) {
    try {
        const result = exports.InitRepoSchema.safeParse(args);
        if (!result.success) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: result.error.format(),
                            message: "Invalid arguments for initializing repository"
                        }, null, 2)
                    }],
                isError: true
            };
        }
        const { path: repoPath, readme, license, initialCommit, commitMessage } = result.data;
        // Use provided path or current directory
        const targetPath = repoPath || process.cwd();
        const projectName = path.basename(targetPath);
        // Check if directory exists
        try {
            const stats = await fs.stat(targetPath);
            if (!stats.isDirectory()) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: `Path is not a directory: ${targetPath}`,
                                message: "Failed to initialize repository"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
        }
        catch (error) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: `Directory does not exist: ${targetPath}`,
                            message: "Failed to initialize repository"
                        }, null, 2)
                    }],
                isError: true
            };
        }
        // Check if .git directory already exists
        const gitDirExists = fsSync.existsSync(path.join(targetPath, '.git'));
        let initOutput = '';
        if (!gitDirExists) {
            // Initialize git repository
            const initResult = await runGitCommand(['init'], targetPath);
            if (!initResult.success) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: initResult.error,
                                message: "Failed to initialize git repository"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            initOutput = initResult.output;
        }
        else {
            console.error(`[Git Initializer] Repository already exists in ${targetPath}`);
        }
        // Create README.md if requested
        if (readme && !fsSync.existsSync(path.join(targetPath, 'README.md'))) {
            const readmeContent = generateReadme(projectName);
            await fs.writeFile(path.join(targetPath, 'README.md'), readmeContent);
        }
        // Add license file if requested
        if (license !== 'none') {
            // In a real implementation, this would fetch the appropriate license text
            // For now, we'll just create a placeholder
            await fs.writeFile(path.join(targetPath, 'LICENSE'), `This project is licensed under the ${license.toUpperCase()} License - see https://choosealicense.com/licenses/${license}/`);
        }
        // Make initial commit if requested
        let commitOutput = '';
        if (initialCommit) {
            await runGitCommand(['add', '.'], targetPath);
            const commitResult = await runGitCommand(['commit', '-m', commitMessage], targetPath);
            if (!commitResult.success) {
                // Set Git identity if needed
                if (commitResult.error && commitResult.error.includes('Please tell me who you are')) {
                    await runGitCommand(['config', 'user.email', 'user@example.com'], targetPath);
                    await runGitCommand(['config', 'user.name', 'Example User'], targetPath);
                    // Try commit again
                    const retryCommit = await runGitCommand(['commit', '-m', commitMessage], targetPath);
                    commitOutput = retryCommit.success ? retryCommit.output : 'Failed to make initial commit. Please configure Git identity.';
                }
                else {
                    commitOutput = 'No changes to commit';
                }
            }
            else {
                commitOutput = commitResult.output;
            }
        }
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        path: targetPath,
                        alreadyInitialized: gitDirExists,
                        initOutput: !gitDirExists ? initOutput : 'Already initialized',
                        readmeCreated: readme && !fsSync.existsSync(path.join(targetPath, 'README.md')),
                        licenseCreated: license !== 'none',
                        licenseType: license !== 'none' ? license : undefined,
                        initialCommitCreated: initialCommit,
                        commitOutput: commitOutput,
                        message: gitDirExists
                            ? `Repository in ${targetPath} was already initialized`
                            : `Repository successfully initialized in ${targetPath}`
                    }, null, 2)
                }]
        };
    }
    catch (error) {
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        error: String(error),
                        message: "Failed to initialize repository"
                    }, null, 2)
                }],
            isError: true
        };
    }
}
/**
 * Checks the status of a git repository
 */
async function handleCheckStatus(args) {
    try {
        const result = exports.CheckStatusSchema.safeParse(args);
        if (!result.success) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: result.error.format(),
                            message: "Invalid arguments for checking repository status"
                        }, null, 2)
                    }],
                isError: true
            };
        }
        const { path: repoPath, showUntracked, checkRemote } = result.data;
        // Use provided path or current directory
        const targetPath = repoPath || process.cwd();
        // Check if directory exists
        try {
            const stats = await fs.stat(targetPath);
            if (!stats.isDirectory()) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: `Path is not a directory: ${targetPath}`,
                                message: "Failed to check repository status"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
        }
        catch (error) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: `Directory does not exist: ${targetPath}`,
                            message: "Failed to check repository status"
                        }, null, 2)
                    }],
                isError: true
            };
        }
        // Check if it's a git repository
        const gitDirExists = fsSync.existsSync(path.join(targetPath, '.git'));
        if (!gitDirExists) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: `Not a git repository: ${targetPath}`,
                            message: "Failed to check repository status"
                        }, null, 2)
                    }],
                isError: true
            };
        }
        // Get current branch
        const branchResult = await runGitCommand(['branch', '--show-current'], targetPath);
        const currentBranch = branchResult.success ? branchResult.output : 'unknown';
        // Get status
        const statusArgs = ['status', '--porcelain'];
        if (showUntracked) {
            statusArgs.push('--untracked-files=all');
        }
        else {
            statusArgs.push('--untracked-files=no');
        }
        const statusResult = await runGitCommand(statusArgs, targetPath);
        const changes = statusResult.success
            ? statusResult.output.split('\n').filter(line => line.trim() !== '')
            : [];
        // Check remote status
        let remoteInfo;
        if (checkRemote) {
            const remoteResult = await runGitCommand(['remote', '-v'], targetPath);
            const remotes = remoteResult.success
                ? remoteResult.output.split('\n').filter(line => line.trim() !== '')
                : [];
            if (remotes.length > 0 && currentBranch !== 'unknown') {
                // Check if branch is tracking a remote
                const trackingResult = await runGitCommand(['rev-parse', '--abbrev-ref', `${currentBranch}@{upstream}`], targetPath);
                if (trackingResult.success) {
                    const remoteBranch = trackingResult.output;
                    // Get ahead/behind info
                    const aheadBehindResult = await runGitCommand(['rev-list', '--left-right', '--count', `${currentBranch}...${remoteBranch}`], targetPath);
                    if (aheadBehindResult.success) {
                        const [ahead, behind] = aheadBehindResult.output.split('\t').map(Number);
                        remoteInfo = {
                            tracking: remoteBranch,
                            ahead,
                            behind
                        };
                    }
                }
            }
        }
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        path: targetPath,
                        isGitRepo: true,
                        currentBranch,
                        changes,
                        hasChanges: changes.length > 0,
                        remote: remoteInfo,
                        message: changes.length > 0
                            ? `Repository has ${changes.length} changes`
                            : 'Repository is clean'
                    }, null, 2)
                }]
        };
    }
    catch (error) {
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        error: String(error),
                        message: "Failed to check repository status"
                    }, null, 2)
                }],
            isError: true
        };
    }
}
/**
 * Sets up a .gitignore file
 */
async function handleSetupGitignore(args) {
    try {
        const result = exports.SetupGitignoreSchema.safeParse(args);
        if (!result.success) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: result.error.format(),
                            message: "Invalid arguments for setting up gitignore"
                        }, null, 2)
                    }],
                isError: true
            };
        }
        const { path: repoPath, templates = [], custom = [], overwrite } = result.data;
        // Use provided path or current directory
        const targetPath = repoPath || process.cwd();
        const gitignorePath = path.join(targetPath, '.gitignore');
        // Check if directory exists
        try {
            const stats = await fs.stat(targetPath);
            if (!stats.isDirectory()) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: `Path is not a directory: ${targetPath}`,
                                message: "Failed to set up gitignore"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
        }
        catch (error) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: `Directory does not exist: ${targetPath}`,
                            message: "Failed to set up gitignore"
                        }, null, 2)
                    }],
                isError: true
            };
        }
        // Check if .gitignore already exists
        const gitignoreExists = fsSync.existsSync(gitignorePath);
        if (gitignoreExists && !overwrite) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: `.gitignore already exists in ${targetPath}`,
                            message: "Failed to set up gitignore (already exists)"
                        }, null, 2)
                    }],
                isError: true
            };
        }
        // Generate gitignore content
        let content = generateGitignore(templates);
        // Add custom patterns
        if (custom.length > 0) {
            content += '\n# Custom patterns\n' + custom.join('\n') + '\n';
        }
        // Write the file
        await fs.writeFile(gitignorePath, content);
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        path: gitignorePath,
                        templates,
                        custom,
                        overwritten: gitignoreExists,
                        message: gitignoreExists
                            ? `.gitignore updated in ${targetPath}`
                            : `.gitignore created in ${targetPath}`
                    }, null, 2)
                }]
        };
    }
    catch (error) {
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        error: String(error),
                        message: "Failed to set up gitignore"
                    }, null, 2)
                }],
            isError: true
        };
    }
}
/**
 * Sets up a remote repository
 */
async function handleSetupRemote(args) {
    try {
        const result = exports.SetupRemoteSchema.safeParse(args);
        if (!result.success) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: result.error.format(),
                            message: "Invalid arguments for setting up remote"
                        }, null, 2)
                    }],
                isError: true
            };
        }
        const { path: repoPath, name, url, createBranch, branch, push } = result.data;
        // Use provided path or current directory
        const targetPath = repoPath || process.cwd();
        // Check if directory exists and it's a git repository
        try {
            const stats = await fs.stat(targetPath);
            if (!stats.isDirectory()) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: `Path is not a directory: ${targetPath}`,
                                message: "Failed to set up remote"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            const gitDirExists = fsSync.existsSync(path.join(targetPath, '.git'));
            if (!gitDirExists) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: `Not a git repository: ${targetPath}`,
                                message: "Failed to set up remote"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
        }
        catch (error) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: `Invalid repository path: ${targetPath}`,
                            message: "Failed to set up remote"
                        }, null, 2)
                    }],
                isError: true
            };
        }
        // Check if remote already exists
        const remoteResult = await runGitCommand(['remote', 'get-url', name], targetPath);
        const remoteExists = remoteResult.success;
        let remoteOutput = '';
        if (remoteExists) {
            // Update the remote URL
            const updateResult = await runGitCommand(['remote', 'set-url', name, url], targetPath);
            if (updateResult.success) {
                remoteOutput = `Remote '${name}' updated with URL: ${url}`;
            }
            else {
                remoteOutput = `Failed to update remote: ${updateResult.error}`;
            }
        }
        else {
            // Add the remote
            const addResult = await runGitCommand(['remote', 'add', name, url], targetPath);
            if (addResult.success) {
                remoteOutput = `Remote '${name}' added with URL: ${url}`;
            }
            else {
                remoteOutput = `Failed to add remote: ${addResult.error}`;
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: remoteOutput,
                                message: "Failed to set up remote"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
        }
        // Create and checkout the branch if requested
        let branchOutput = '';
        if (createBranch) {
            // Check if branch exists
            const branchResult = await runGitCommand(['rev-parse', '--verify', branch], targetPath);
            const branchExists = branchResult.success;
            if (!branchExists) {
                // Create the branch
                const createResult = await runGitCommand(['checkout', '-b', branch], targetPath);
                if (createResult.success) {
                    branchOutput = `Branch '${branch}' created and checked out`;
                }
                else {
                    branchOutput = `Failed to create branch: ${createResult.error}`;
                }
            }
            else {
                // Checkout the branch
                const checkoutResult = await runGitCommand(['checkout', branch], targetPath);
                if (checkoutResult.success) {
                    branchOutput = `Branch '${branch}' checked out`;
                }
                else {
                    branchOutput = `Failed to checkout branch: ${checkoutResult.error}`;
                }
            }
        }
        // Push to remote if requested
        let pushOutput = '';
        if (push) {
            // Push to remote
            const pushResult = await runGitCommand(['push', '-u', name, branch], targetPath);
            if (pushResult.success) {
                pushOutput = `Pushed to ${name}/${branch}`;
            }
            else {
                pushOutput = `Failed to push to remote: ${pushResult.error}`;
            }
        }
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        path: targetPath,
                        name,
                        url,
                        remoteExists,
                        remoteOutput,
                        branch,
                        branchOutput,
                        pushOutput,
                        message: `Remote '${name}' setup complete`
                    }, null, 2)
                }]
        };
    }
    catch (error) {
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        error: String(error),
                        message: "Failed to set up remote"
                    }, null, 2)
                }],
            isError: true
        };
    }
}
