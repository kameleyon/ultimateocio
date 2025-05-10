"use strict";
// Auto-generated boilerplate for persona-loader
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
exports.ExportPersonaSchema = exports.ImportPersonaSchema = exports.UpdatePreferencesSchema = exports.ActivatePersonaSchema = exports.DeletePersonaSchema = exports.UpdatePersonaSchema = exports.CreatePersonaSchema = exports.GetPersonaSchema = exports.ListPersonasSchema = void 0;
exports.activate = activate;
exports.onFileWrite = onFileWrite;
exports.onSessionStart = onSessionStart;
exports.onCommand = onCommand;
const zod_1 = require("zod");
const fs = __importStar(require("fs/promises"));
const fsSync = __importStar(require("fs"));
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
// File paths
const PERSONAS_DIR = 'personas';
const PERSONAS_STATE_FILE = path.join(PERSONAS_DIR, 'personas-state.json');
const BACKUP_DIR = path.join(PERSONAS_DIR, 'backups');
// Default library state
const DEFAULT_LIBRARY_STATE = {
    personas: {},
    lastUpdated: Date.now(),
    preferences: {
        categorySorting: true,
        autoActivate: true,
        enableVersioning: true,
        backupPersonas: true
    }
};
// Current library state
let personaLibraryState = { ...DEFAULT_LIBRARY_STATE };
function activate() {
    console.error("[TOOL] persona-loader activated");
    // Ensure directories exist
    ensureDirectories();
    // Load library state
    loadLibraryState();
}
/**
 * Ensure required directories exist
 */
async function ensureDirectories() {
    if (!fsSync.existsSync(PERSONAS_DIR)) {
        fsSync.mkdirSync(PERSONAS_DIR, { recursive: true });
    }
    if (!fsSync.existsSync(BACKUP_DIR)) {
        fsSync.mkdirSync(BACKUP_DIR, { recursive: true });
    }
}
/**
 * Load library state from file
 */
async function loadLibraryState() {
    try {
        if (fsSync.existsSync(PERSONAS_STATE_FILE)) {
            const stateData = await fs.readFile(PERSONAS_STATE_FILE, 'utf8');
            personaLibraryState = JSON.parse(stateData);
            console.error(`[Persona Loader] Loaded ${Object.keys(personaLibraryState.personas).length} personas`);
            // Auto-activate default persona if enabled
            if (personaLibraryState.preferences.autoActivate && personaLibraryState.preferences.defaultPersona) {
                const defaultId = personaLibraryState.preferences.defaultPersona;
                if (personaLibraryState.personas[defaultId]) {
                    personaLibraryState.activePersona = defaultId;
                    console.error(`[Persona Loader] Auto-activated default persona: ${personaLibraryState.personas[defaultId].name}`);
                }
            }
        }
        else {
            // Create default state file
            await saveLibraryState();
            console.error(`[Persona Loader] Created default library state at ${PERSONAS_STATE_FILE}`);
            // Create example personas
            await createExamplePersonas();
        }
    }
    catch (error) {
        console.error('[Persona Loader] Error loading library state:', error);
    }
}
/**
 * Save library state to file
 */
async function saveLibraryState() {
    try {
        personaLibraryState.lastUpdated = Date.now();
        await fs.writeFile(PERSONAS_STATE_FILE, JSON.stringify(personaLibraryState, null, 2), 'utf8');
        console.error(`[Persona Loader] Saved library state with ${Object.keys(personaLibraryState.personas).length} personas`);
    }
    catch (error) {
        console.error('[Persona Loader] Error saving library state:', error);
    }
}
/**
 * Create example personas
 */
async function createExamplePersonas() {
    const timestamp = Date.now();
    // Example developer persona
    const developerPersona = {
        id: crypto.randomUUID(),
        name: "Technical Expert",
        description: "A software development expert focused on providing clear, accurate technical advice.",
        category: "technical",
        systemPrompt: "You are a senior software engineer with extensive experience across multiple programming languages and frameworks. Provide concise, accurate, and practical guidance to technical questions. Include code examples when helpful and explain complex concepts in accessible terms without oversimplifying.",
        traits: [
            "Knowledgeable",
            "Detail-oriented",
            "Practical",
            "Methodical",
            "Educational"
        ],
        skills: [
            "Programming",
            "System architecture",
            "Debugging",
            "Technical explanation",
            "Best practices"
        ],
        constraints: [
            "Stick to factual technical information",
            "Don't speculate on topics outside technical domain",
            "Acknowledge limitations in specific technologies when appropriate"
        ],
        metadata: {
            author: "System",
            version: "1.0.0",
            created: timestamp,
            updated: timestamp,
            modelCompatibility: ["all"],
            tags: ["programming", "technical", "software", "development", "engineering"]
        },
        examples: [
            {
                input: "What's the best way to handle authentication in a Node.js API?",
                output: "For Node.js API authentication, JSON Web Tokens (JWT) are widely used due to their stateless nature and security. Here's a basic implementation using Express and the jsonwebtoken package...",
                notes: "Includes code example and security considerations"
            }
        ],
        enabled: true
    };
    // Example creative persona
    const creativePersona = {
        id: crypto.randomUUID(),
        name: "Creative Assistant",
        description: "A creative writing assistant that helps with ideation and composition.",
        category: "creative",
        systemPrompt: "You are a creative writing assistant with a talent for storytelling, poetry, and creative content. Help users develop their ideas with vivid language, engaging narratives, and innovative perspectives. Offer constructive suggestions while respecting the user's creative vision and voice.",
        traits: [
            "Imaginative",
            "Supportive",
            "Articulate",
            "Perceptive",
            "Inspiring"
        ],
        skills: [
            "Storytelling",
            "Poetry composition",
            "Character development",
            "Dialogue writing",
            "Creative editing"
        ],
        constraints: [
            "Don't take over the user's creative process",
            "Avoid clichÃ©s and generic suggestions",
            "Respect the user's style and preferences"
        ],
        metadata: {
            author: "System",
            version: "1.0.0",
            created: timestamp,
            updated: timestamp,
            modelCompatibility: ["all"],
            tags: ["writing", "creative", "storytelling", "poetry", "ideation"]
        },
        examples: [
            {
                input: "I need a character for my story about a space colony.",
                output: "Consider a botanist who secretly experiments with blending Earth and alien flora, creating plants with unexpected properties. They're motivated by scientific curiosity but face ethical dilemmas when their creations have unforeseen effects on the colony's ecosystem. This character could drive plot through both their innovations and the consequences of playing with nature in an alien environment.",
                notes: "Provides specific, original character concept with built-in conflict"
            }
        ],
        enabled: true
    };
    // Add example personas to library
    personaLibraryState.personas[developerPersona.id] = developerPersona;
    personaLibraryState.personas[creativePersona.id] = creativePersona;
    // Set default persona
    personaLibraryState.preferences.defaultPersona = developerPersona.id;
    // Save library state
    await saveLibraryState();
    console.error('[Persona Loader] Created example personas');
}
/**
 * Create a backup of a persona
 */
async function backupPersona(id) {
    try {
        const persona = personaLibraryState.personas[id];
        if (!persona) {
            return null;
        }
        const timestamp = new Date().toISOString().replace(/:/g, '-');
        const backupFileName = `${persona.name.replace(/\s+/g, '_')}_${timestamp}.json`;
        const backupPath = path.join(BACKUP_DIR, backupFileName);
        await fs.writeFile(backupPath, JSON.stringify(persona, null, 2), 'utf8');
        console.error(`[Persona Loader] Created backup of persona '${persona.name}' at ${backupPath}`);
        return backupPath;
    }
    catch (error) {
        console.error(`[Persona Loader] Error backing up persona ${id}:`, error);
        return null;
    }
}
/**
 * Handles file write events
 */
function onFileWrite(event) {
    // Check if state file was modified
    if (path.basename(event.path) === path.basename(PERSONAS_STATE_FILE)) {
        console.error(`[Persona Loader] Library state file changed: ${event.path}`);
        loadLibraryState();
    }
    // Check if any persona file was modified
    if (event.path.startsWith(PERSONAS_DIR) && event.path.endsWith('.json') && path.basename(event.path) !== path.basename(PERSONAS_STATE_FILE)) {
        console.error(`[Persona Loader] Persona file changed: ${event.path}`);
        loadLibraryState();
    }
}
/**
 * Handles session start logic
 */
function onSessionStart(session) {
    console.error(`[Persona Loader] Session started: ${session.id}`);
    // Reload library state on session start
    loadLibraryState();
}
/**
 * Handles persona-loader commands
 */
async function onCommand(command) {
    switch (command.name) {
        case 'persona-loader:list':
            console.error('[Persona Loader] Listing personas...');
            return await handleListPersonas(command.args[0]);
        case 'persona-loader:get':
            console.error('[Persona Loader] Getting persona...');
            return await handleGetPersona(command.args[0]);
        case 'persona-loader:create':
            console.error('[Persona Loader] Creating persona...');
            return await handleCreatePersona(command.args[0]);
        case 'persona-loader:update':
            console.error('[Persona Loader] Updating persona...');
            return await handleUpdatePersona(command.args[0]);
        case 'persona-loader:delete':
            console.error('[Persona Loader] Deleting persona...');
            return await handleDeletePersona(command.args[0]);
        case 'persona-loader:activate':
            console.error('[Persona Loader] Activating persona...');
            return await handleActivatePersona(command.args[0]);
        case 'persona-loader:get-active':
            console.error('[Persona Loader] Getting active persona...');
            return await handleGetActivePersona();
        case 'persona-loader:update-preferences':
            console.error('[Persona Loader] Updating preferences...');
            return await handleUpdatePreferences(command.args[0]);
        case 'persona-loader:import':
            console.error('[Persona Loader] Importing persona...');
            return await handleImportPersona(command.args[0]);
        case 'persona-loader:export':
            console.error('[Persona Loader] Exporting persona...');
            return await handleExportPersona(command.args[0]);
        default:
            console.warn(`[Persona Loader] Unknown command: ${command.name}`);
            return { error: `Unknown command: ${command.name}` };
    }
}
// Define schemas for Persona Loader tool
exports.ListPersonasSchema = zod_1.z.object({
    category: zod_1.z.enum([
        'generic',
        'professional',
        'creative',
        'technical',
        'educational',
        'specialized',
        'character',
        'custom',
        'all'
    ]).optional().default('all'),
    enabledOnly: zod_1.z.boolean().optional().default(false),
    includeSystemPrompt: zod_1.z.boolean().optional().default(false),
    includeExamples: zod_1.z.boolean().optional().default(false),
    sortBy: zod_1.z.enum(['name', 'category', 'created', 'updated']).optional().default('name')
});
exports.GetPersonaSchema = zod_1.z.object({
    id: zod_1.z.string()
});
exports.CreatePersonaSchema = zod_1.z.object({
    name: zod_1.z.string(),
    description: zod_1.z.string(),
    category: zod_1.z.enum([
        'generic',
        'professional',
        'creative',
        'technical',
        'educational',
        'specialized',
        'character',
        'custom'
    ]),
    systemPrompt: zod_1.z.string(),
    traits: zod_1.z.array(zod_1.z.string()),
    skills: zod_1.z.array(zod_1.z.string()),
    constraints: zod_1.z.array(zod_1.z.string()).optional(),
    metadata: zod_1.z.object({
        author: zod_1.z.string().optional(),
        version: zod_1.z.string().optional(),
        modelCompatibility: zod_1.z.array(zod_1.z.string()).optional(),
        tags: zod_1.z.array(zod_1.z.string()).optional(),
        customParameters: zod_1.z.record(zod_1.z.any()).optional()
    }).optional(),
    examples: zod_1.z.array(zod_1.z.object({
        input: zod_1.z.string(),
        output: zod_1.z.string(),
        notes: zod_1.z.string().optional()
    })).optional(),
    resources: zod_1.z.array(zod_1.z.object({
        name: zod_1.z.string(),
        url: zod_1.z.string(),
        description: zod_1.z.string().optional()
    })).optional(),
    enabled: zod_1.z.boolean().optional().default(true)
});
exports.UpdatePersonaSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    category: zod_1.z.enum([
        'generic',
        'professional',
        'creative',
        'technical',
        'educational',
        'specialized',
        'character',
        'custom'
    ]).optional(),
    systemPrompt: zod_1.z.string().optional(),
    traits: zod_1.z.array(zod_1.z.string()).optional(),
    skills: zod_1.z.array(zod_1.z.string()).optional(),
    constraints: zod_1.z.array(zod_1.z.string()).optional(),
    metadata: zod_1.z.object({
        author: zod_1.z.string().optional(),
        version: zod_1.z.string().optional(),
        modelCompatibility: zod_1.z.array(zod_1.z.string()).optional(),
        tags: zod_1.z.array(zod_1.z.string()).optional(),
        customParameters: zod_1.z.record(zod_1.z.any()).optional()
    }).optional(),
    examples: zod_1.z.array(zod_1.z.object({
        input: zod_1.z.string(),
        output: zod_1.z.string(),
        notes: zod_1.z.string().optional()
    })).optional(),
    resources: zod_1.z.array(zod_1.z.object({
        name: zod_1.z.string(),
        url: zod_1.z.string(),
        description: zod_1.z.string().optional()
    })).optional(),
    enabled: zod_1.z.boolean().optional(),
    createBackup: zod_1.z.boolean().optional().default(true)
});
exports.DeletePersonaSchema = zod_1.z.object({
    id: zod_1.z.string(),
    createBackup: zod_1.z.boolean().optional().default(true)
});
exports.ActivatePersonaSchema = zod_1.z.object({
    id: zod_1.z.string(),
    setAsDefault: zod_1.z.boolean().optional().default(false)
});
exports.UpdatePreferencesSchema = zod_1.z.object({
    defaultPersona: zod_1.z.string().optional(),
    categorySorting: zod_1.z.boolean().optional(),
    autoActivate: zod_1.z.boolean().optional(),
    enableVersioning: zod_1.z.boolean().optional(),
    backupPersonas: zod_1.z.boolean().optional()
});
exports.ImportPersonaSchema = zod_1.z.object({
    filePath: zod_1.z.string(),
    overwrite: zod_1.z.boolean().optional().default(false),
    activate: zod_1.z.boolean().optional().default(false)
});
exports.ExportPersonaSchema = zod_1.z.object({
    id: zod_1.z.string(),
    outputPath: zod_1.z.string().optional(),
    format: zod_1.z.enum(['json', 'yaml', 'md']).optional().default('json'),
    includeMetadata: zod_1.z.boolean().optional().default(true),
    includeExamples: zod_1.z.boolean().optional().default(true)
});
/**
 * Handles listing personas
 */
async function handleListPersonas(args) {
    try {
        const result = exports.ListPersonasSchema.safeParse(args);
        if (!result.success) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: result.error.format(),
                            message: "Invalid arguments for listing personas"
                        }, null, 2)
                    }],
                isError: true
            };
        }
        const { category, enabledOnly, includeSystemPrompt, includeExamples, sortBy } = result.data;
        // Filter personas
        let filteredPersonas = Object.values(personaLibraryState.personas);
        if (category !== 'all') {
            filteredPersonas = filteredPersonas.filter(persona => persona.category === category);
        }
        if (enabledOnly) {
            filteredPersonas = filteredPersonas.filter(persona => persona.enabled);
        }
        // Sort personas
        filteredPersonas.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'category':
                    return a.category.localeCompare(b.category) || a.name.localeCompare(b.name);
                case 'created':
                    return a.metadata.created - b.metadata.created;
                case 'updated':
                    return a.metadata.updated - b.metadata.updated;
                default:
                    return a.name.localeCompare(b.name);
            }
        });
        // Format personas for response
        const formattedPersonas = filteredPersonas.map(persona => {
            const formatted = {
                id: persona.id,
                name: persona.name,
                description: persona.description,
                category: persona.category,
                traits: persona.traits,
                skills: persona.skills,
                constraints: persona.constraints,
                enabled: persona.enabled,
                isActive: persona.id === personaLibraryState.activePersona,
                isDefault: persona.id === personaLibraryState.preferences.defaultPersona,
                metadata: {
                    author: persona.metadata.author,
                    version: persona.metadata.version,
                    created: persona.metadata.created,
                    updated: persona.metadata.updated,
                    tags: persona.metadata.tags
                }
            };
            if (includeSystemPrompt) {
                formatted.systemPrompt = persona.systemPrompt;
            }
            if (includeExamples && persona.examples) {
                formatted.examples = persona.examples;
            }
            return formatted;
        });
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        personas: formattedPersonas,
                        count: formattedPersonas.length,
                        activePersonaId: personaLibraryState.activePersona,
                        defaultPersonaId: personaLibraryState.preferences.defaultPersona,
                        message: category === 'all'
                            ? `Found ${formattedPersonas.length} personas`
                            : `Found ${formattedPersonas.length} personas in category '${category}'`
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
                        message: "Failed to list personas"
                    }, null, 2)
                }],
            isError: true
        };
    }
}
/**
 * Handles getting a persona
 */
async function handleGetPersona(args) {
    try {
        const result = exports.GetPersonaSchema.safeParse(args);
        if (!result.success) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: result.error.format(),
                            message: "Invalid arguments for getting persona"
                        }, null, 2)
                    }],
                isError: true
            };
        }
        const { id } = result.data;
        // Check if persona exists
        if (!personaLibraryState.personas[id]) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: `Persona with ID '${id}' not found`,
                            message: "Failed to get persona",
                            availablePersonas: Object.keys(personaLibraryState.personas).map(id => ({
                                id,
                                name: personaLibraryState.personas[id].name
                            }))
                        }, null, 2)
                    }],
                isError: true
            };
        }
        const persona = personaLibraryState.personas[id];
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        persona,
                        isActive: persona.id === personaLibraryState.activePersona,
                        isDefault: persona.id === personaLibraryState.preferences.defaultPersona,
                        message: `Retrieved persona '${persona.name}'`
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
                        message: "Failed to get persona"
                    }, null, 2)
                }],
            isError: true
        };
    }
}
/**
 * Handles creating a persona
 */
async function handleCreatePersona(args) {
    try {
        const result = exports.CreatePersonaSchema.safeParse(args);
        if (!result.success) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: result.error.format(),
                            message: "Invalid arguments for creating persona"
                        }, null, 2)
                    }],
                isError: true
            };
        }
        const { name, description, category, systemPrompt, traits, skills, constraints = [], metadata = {}, examples = [], resources = [], enabled = true } = result.data;
        // Generate ID
        const id = crypto.randomUUID();
        const timestamp = Date.now();
        // Create persona
        const persona = {
            id,
            name,
            description,
            category,
            systemPrompt,
            traits,
            skills,
            constraints,
            metadata: {
                ...metadata,
                created: timestamp,
                updated: timestamp
            },
            examples,
            resources,
            enabled
        };
        // Add to library
        personaLibraryState.personas[id] = persona;
        // If this is the first persona, set as default and active
        if (Object.keys(personaLibraryState.personas).length === 1) {
            personaLibraryState.preferences.defaultPersona = id;
            personaLibraryState.activePersona = id;
        }
        // Save library state
        await saveLibraryState();
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        id,
                        name,
                        category,
                        isActive: persona.id === personaLibraryState.activePersona,
                        isDefault: persona.id === personaLibraryState.preferences.defaultPersona,
                        message: `Successfully created ${category} persona '${name}'`
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
                        message: "Failed to create persona"
                    }, null, 2)
                }],
            isError: true
        };
    }
}
/**
 * Handles updating a persona
 */
async function handleUpdatePersona(args) {
    try {
        const result = exports.UpdatePersonaSchema.safeParse(args);
        if (!result.success) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: result.error.format(),
                            message: "Invalid arguments for updating persona"
                        }, null, 2)
                    }],
                isError: true
            };
        }
        const { id, createBackup = true, ...updates } = result.data;
        // Check if persona exists
        if (!personaLibraryState.personas[id]) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: `Persona with ID '${id}' not found`,
                            message: "Failed to update persona",
                            availablePersonas: Object.keys(personaLibraryState.personas).map(id => ({
                                id,
                                name: personaLibraryState.personas[id].name
                            }))
                        }, null, 2)
                    }],
                isError: true
            };
        }
        // Create backup if requested and enabled in preferences
        let backupPath = null;
        if (createBackup && personaLibraryState.preferences.backupPersonas) {
            backupPath = await backupPersona(id);
        }
        // Get existing persona
        const persona = personaLibraryState.personas[id];
        // Update metadata
        const metadata = {
            ...persona.metadata,
            ...updates.metadata || {},
            updated: Date.now()
        };
        // If version is being updated and versioning is enabled, handle it
        if (updates.metadata?.version && personaLibraryState.preferences.enableVersioning) {
            metadata.version = updates.metadata.version;
        }
        // Update persona
        personaLibraryState.personas[id] = {
            ...persona,
            ...updates,
            metadata
        };
        // Save library state
        await saveLibraryState();
        const updatedPersona = personaLibraryState.personas[id];
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        id,
                        name: updatedPersona.name,
                        category: updatedPersona.category,
                        backupCreated: backupPath !== null,
                        backupPath,
                        isActive: updatedPersona.id === personaLibraryState.activePersona,
                        isDefault: updatedPersona.id === personaLibraryState.preferences.defaultPersona,
                        message: `Successfully updated persona '${updatedPersona.name}'`
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
                        message: "Failed to update persona"
                    }, null, 2)
                }],
            isError: true
        };
    }
}
/**
 * Handles deleting a persona
 */
async function handleDeletePersona(args) {
    try {
        const result = exports.DeletePersonaSchema.safeParse(args);
        if (!result.success) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: result.error.format(),
                            message: "Invalid arguments for deleting persona"
                        }, null, 2)
                    }],
                isError: true
            };
        }
        const { id, createBackup } = result.data;
        // Check if persona exists
        if (!personaLibraryState.personas[id]) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: `Persona with ID '${id}' not found`,
                            message: "Failed to delete persona",
                            availablePersonas: Object.keys(personaLibraryState.personas).map(id => ({
                                id,
                                name: personaLibraryState.personas[id].name
                            }))
                        }, null, 2)
                    }],
                isError: true
            };
        }
        // Create backup if requested and enabled in preferences
        let backupPath = null;
        if (createBackup && personaLibraryState.preferences.backupPersonas) {
            backupPath = await backupPersona(id);
        }
        // Get persona info before deletion
        const personaName = personaLibraryState.personas[id].name;
        const wasActive = personaLibraryState.activePersona === id;
        const wasDefault = personaLibraryState.preferences.defaultPersona === id;
        // Delete persona
        delete personaLibraryState.personas[id];
        // Update default persona if needed
        if (wasDefault) {
            const personaIds = Object.keys(personaLibraryState.personas);
            if (personaIds.length > 0) {
                personaLibraryState.preferences.defaultPersona = personaIds[0];
            }
            else {
                delete personaLibraryState.preferences.defaultPersona;
            }
        }
        // Update active persona if needed
        if (wasActive) {
            if (personaLibraryState.preferences.defaultPersona) {
                personaLibraryState.activePersona = personaLibraryState.preferences.defaultPersona;
            }
            else {
                delete personaLibraryState.activePersona;
            }
        }
        // Save library state
        await saveLibraryState();
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        id,
                        name: personaName,
                        wasActive,
                        wasDefault,
                        backupCreated: backupPath !== null,
                        backupPath,
                        newDefault: personaLibraryState.preferences.defaultPersona,
                        newActive: personaLibraryState.activePersona,
                        message: `Successfully deleted persona '${personaName}'`
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
                        message: "Failed to delete persona"
                    }, null, 2)
                }],
            isError: true
        };
    }
}
/**
 * Handles activating a persona
 */
async function handleActivatePersona(args) {
    try {
        const result = exports.ActivatePersonaSchema.safeParse(args);
        if (!result.success) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: result.error.format(),
                            message: "Invalid arguments for activating persona"
                        }, null, 2)
                    }],
                isError: true
            };
        }
        const { id, setAsDefault } = result.data;
        // Check if persona exists
        if (!personaLibraryState.personas[id]) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: `Persona with ID '${id}' not found`,
                            message: "Failed to activate persona",
                            availablePersonas: Object.keys(personaLibraryState.personas).map(id => ({
                                id,
                                name: personaLibraryState.personas[id].name
                            }))
                        }, null, 2)
                    }],
                isError: true
            };
        }
        // Check if persona is enabled
        if (!personaLibraryState.personas[id].enabled) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: `Persona '${personaLibraryState.personas[id].name}' is disabled`,
                            message: "Failed to activate persona",
                            persona: {
                                id,
                                name: personaLibraryState.personas[id].name,
                                enabled: false
                            }
                        }, null, 2)
                    }],
                isError: true
            };
        }
        // Get old active persona
        const oldActiveId = personaLibraryState.activePersona;
        const oldActiveName = oldActiveId ? personaLibraryState.personas[oldActiveId]?.name : null;
        // Set as active
        personaLibraryState.activePersona = id;
        // Set as default if requested
        if (setAsDefault) {
            personaLibraryState.preferences.defaultPersona = id;
        }
        // Save library state
        await saveLibraryState();
        const persona = personaLibraryState.personas[id];
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        id,
                        name: persona.name,
                        category: persona.category,
                        previousActiveId: oldActiveId,
                        previousActiveName: oldActiveName,
                        setAsDefault,
                        isDefault: persona.id === personaLibraryState.preferences.defaultPersona,
                        message: `Successfully activated persona '${persona.name}'`
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
                        message: "Failed to activate persona"
                    }, null, 2)
                }],
            isError: true
        };
    }
}
/**
 * Handles getting the active persona
 */
async function handleGetActivePersona() {
    try {
        // Check if there's an active persona
        if (!personaLibraryState.activePersona) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            active: false,
                            message: "No active persona set"
                        }, null, 2)
                    }]
            };
        }
        const id = personaLibraryState.activePersona;
        // Check if persona exists
        if (!personaLibraryState.personas[id]) {
            // This shouldn't happen, but handle it gracefully
            delete personaLibraryState.activePersona;
            await saveLibraryState();
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: `Active persona with ID '${id}' not found`,
                            message: "Failed to get active persona",
                            reset: true
                        }, null, 2)
                    }],
                isError: true
            };
        }
        const persona = personaLibraryState.personas[id];
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        persona,
                        active: true,
                        isDefault: persona.id === personaLibraryState.preferences.defaultPersona,
                        message: `Retrieved active persona '${persona.name}'`
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
                        message: "Failed to get active persona"
                    }, null, 2)
                }],
            isError: true
        };
    }
}
/**
 * Handles updating preferences
 */
async function handleUpdatePreferences(args) {
    try {
        const result = exports.UpdatePreferencesSchema.safeParse(args);
        if (!result.success) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: result.error.format(),
                            message: "Invalid arguments for updating preferences"
                        }, null, 2)
                    }],
                isError: true
            };
        }
        const { defaultPersona, categorySorting, autoActivate, enableVersioning, backupPersonas } = result.data;
        // Update defaultPersona if provided
        if (defaultPersona !== undefined) {
            // Check if persona exists
            if (!personaLibraryState.personas[defaultPersona]) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: `Persona with ID '${defaultPersona}' not found`,
                                message: "Failed to update preferences",
                                availablePersonas: Object.keys(personaLibraryState.personas).map(id => ({
                                    id,
                                    name: personaLibraryState.personas[id].name
                                }))
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            personaLibraryState.preferences.defaultPersona = defaultPersona;
        }
        // Update other preferences if provided
        if (categorySorting !== undefined) {
            personaLibraryState.preferences.categorySorting = categorySorting;
        }
        if (autoActivate !== undefined) {
            personaLibraryState.preferences.autoActivate = autoActivate;
        }
        if (enableVersioning !== undefined) {
            personaLibraryState.preferences.enableVersioning = enableVersioning;
        }
        if (backupPersonas !== undefined) {
            personaLibraryState.preferences.backupPersonas = backupPersonas;
        }
        // Save library state
        await saveLibraryState();
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        preferences: personaLibraryState.preferences,
                        message: "Successfully updated preferences"
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
                        message: "Failed to update preferences"
                    }, null, 2)
                }],
            isError: true
        };
    }
}
/**
 * Handles importing a persona
 */
async function handleImportPersona(args) {
    try {
        const result = exports.ImportPersonaSchema.safeParse(args);
        if (!result.success) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: result.error.format(),
                            message: "Invalid arguments for importing persona"
                        }, null, 2)
                    }],
                isError: true
            };
        }
        const { filePath, overwrite, activate } = result.data;
        // Check if file exists
        if (!fsSync.existsSync(filePath)) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: `File '${filePath}' not found`,
                            message: "Failed to import persona"
                        }, null, 2)
                    }],
                isError: true
            };
        }
        // Read file
        const fileData = await fs.readFile(filePath, 'utf8');
        let persona;
        try {
            persona = JSON.parse(fileData);
        }
        catch (error) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: `Invalid JSON in file '${filePath}'`,
                            message: "Failed to import persona"
                        }, null, 2)
                    }],
                isError: true
            };
        }
        // Validate persona structure
        if (!persona.id || !persona.name || !persona.systemPrompt) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: "Invalid persona structure: missing required fields",
                            message: "Failed to import persona",
                            requiredFields: ['id', 'name', 'systemPrompt']
                        }, null, 2)
                    }],
                isError: true
            };
        }
        // Check if persona already exists
        const existingPersona = personaLibraryState.personas[persona.id];
        if (existingPersona && !overwrite) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: `Persona with ID '${persona.id}' already exists`,
                            message: "Failed to import persona",
                            existingPersona: {
                                id: existingPersona.id,
                                name: existingPersona.name
                            },
                            tip: "Set 'overwrite' to true to replace the existing persona"
                        }, null, 2)
                    }],
                isError: true
            };
        }
        // Create backup of existing persona if needed
        let backupPath = null;
        if (existingPersona && personaLibraryState.preferences.backupPersonas) {
            backupPath = await backupPersona(persona.id);
        }
        // Update metadata
        persona.metadata = {
            ...persona.metadata,
            updated: Date.now()
        };
        // Add to library
        personaLibraryState.personas[persona.id] = persona;
        // Activate if requested
        if (activate) {
            personaLibraryState.activePersona = persona.id;
        }
        // Save library state
        await saveLibraryState();
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        id: persona.id,
                        name: persona.name,
                        category: persona.category,
                        overwritten: Boolean(existingPersona),
                        backupCreated: backupPath !== null,
                        backupPath,
                        activated: activate,
                        message: existingPersona
                            ? `Successfully overwritten persona '${persona.name}'`
                            : `Successfully imported persona '${persona.name}'`
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
                        message: "Failed to import persona"
                    }, null, 2)
                }],
            isError: true
        };
    }
}
/**
 * Handles exporting a persona
 */
async function handleExportPersona(args) {
    try {
        const result = exports.ExportPersonaSchema.safeParse(args);
        if (!result.success) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: result.error.format(),
                            message: "Invalid arguments for exporting persona"
                        }, null, 2)
                    }],
                isError: true
            };
        }
        const { id, outputPath, format, includeMetadata, includeExamples } = result.data;
        // Check if persona exists
        if (!personaLibraryState.personas[id]) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: `Persona with ID '${id}' not found`,
                            message: "Failed to export persona",
                            availablePersonas: Object.keys(personaLibraryState.personas).map(id => ({
                                id,
                                name: personaLibraryState.personas[id].name
                            }))
                        }, null, 2)
                    }],
                isError: true
            };
        }
        const persona = personaLibraryState.personas[id];
        // Create export data (deep clone to avoid modifying original)
        const exportData = JSON.parse(JSON.stringify(persona));
        // Remove metadata if not requested
        if (!includeMetadata) {
            delete exportData.metadata;
        }
        // Remove examples if not requested
        if (!includeExamples) {
            delete exportData.examples;
        }
        // Format export data
        let formattedContent = '';
        switch (format) {
            case 'json':
                formattedContent = JSON.stringify(exportData, null, 2);
                break;
            case 'yaml':
                // Simple YAML conversion (in a real implementation, would use a proper YAML library)
                formattedContent = jsonToYaml(exportData);
                break;
            case 'md':
                formattedContent = `# ${exportData.name}\n\n`;
                formattedContent += `**Category:** ${exportData.category}\n\n`;
                formattedContent += `**Description:** ${exportData.description}\n\n`;
                formattedContent += `## System Prompt\n\n${exportData.systemPrompt}\n\n`;
                formattedContent += `## Traits\n\n`;
                exportData.traits.forEach((trait) => {
                    formattedContent += `- ${trait}\n`;
                });
                formattedContent += '\n';
                formattedContent += `## Skills\n\n`;
                exportData.skills.forEach((skill) => {
                    formattedContent += `- ${skill}\n`;
                });
                formattedContent += '\n';
                if (exportData.constraints && exportData.constraints.length > 0) {
                    formattedContent += `## Constraints\n\n`;
                    exportData.constraints.forEach((constraint) => {
                        formattedContent += `- ${constraint}\n`;
                    });
                    formattedContent += '\n';
                }
                if (includeMetadata && exportData.metadata) {
                    formattedContent += `## Metadata\n\n`;
                    Object.entries(exportData.metadata).forEach(([key, value]) => {
                        if (key === 'customParameters')
                            return;
                        formattedContent += `- **${key}**: ${value}\n`;
                    });
                    formattedContent += '\n';
                }
                if (includeExamples && exportData.examples && exportData.examples.length > 0) {
                    formattedContent += `## Examples\n\n`;
                    exportData.examples.forEach((example, index) => {
                        formattedContent += `### Example ${index + 1}\n\n`;
                        formattedContent += `**Input:**\n\n\`\`\`\n${example.input}\n\`\`\`\n\n`;
                        formattedContent += `**Output:**\n\n\`\`\`\n${example.output}\n\`\`\`\n\n`;
                        if (example.notes) {
                            formattedContent += `**Notes:** ${example.notes}\n\n`;
                        }
                    });
                }
                if (exportData.resources && exportData.resources.length > 0) {
                    formattedContent += `## Resources\n\n`;
                    exportData.resources.forEach((resource) => {
                        formattedContent += `- [${resource.name}](${resource.url})`;
                        if (resource.description) {
                            formattedContent += ` - ${resource.description}`;
                        }
                        formattedContent += '\n';
                    });
                }
                break;
        }
        // Save to file if output path is provided
        if (outputPath) {
            const dirPath = path.dirname(outputPath);
            // Create directory if it doesn't exist
            if (!fsSync.existsSync(dirPath)) {
                fsSync.mkdirSync(dirPath, { recursive: true });
            }
            await fs.writeFile(outputPath, formattedContent, 'utf8');
        }
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        id: persona.id,
                        name: persona.name,
                        format,
                        outputPath,
                        content: outputPath ? undefined : formattedContent,
                        message: `Successfully exported persona '${persona.name}' in ${format} format`
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
                        message: "Failed to export persona"
                    }, null, 2)
                }],
            isError: true
        };
    }
}
/**
 * Simple JSON to YAML conversion
 * This is a simplified implementation, a real one would use a proper YAML library
 */
function jsonToYaml(obj, indent = 0) {
    const spaces = ' '.repeat(indent);
    let yaml = '';
    if (Array.isArray(obj)) {
        for (const item of obj) {
            if (typeof item === 'object' && item !== null) {
                yaml += `${spaces}- \n${jsonToYaml(item, indent + 2)}`;
            }
            else {
                yaml += `${spaces}- ${String(item)}\n`;
            }
        }
    }
    else if (typeof obj === 'object' && obj !== null) {
        for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'object' && value !== null) {
                yaml += `${spaces}${key}:\n${jsonToYaml(value, indent + 2)}`;
            }
            else {
                yaml += `${spaces}${key}: ${String(value)}\n`;
            }
        }
    }
    else {
        yaml += `${spaces}${String(obj)}\n`;
    }
    return yaml;
}
