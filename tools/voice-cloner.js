"use strict";
// Auto-generated boilerplate for voice-cloner
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetTaskSchema = exports.GenerateAudioSchema = exports.DeleteModelSchema = exports.GetModelSchema = exports.ListModelsSchema = exports.CreateModelSchema = void 0;
exports.activate = activate;
exports.onFileWrite = onFileWrite;
exports.onSessionStart = onSessionStart;
exports.onCommand = onCommand;
const zod_1 = require("zod");
const fs = __importStar(require("fs/promises"));
const fsSync = __importStar(require("fs"));
const path = __importStar(require("path"));
// Default voice characteristics
const DEFAULT_CHARACTERISTICS = {
    pitch: 50,
    speed: 50,
    clarity: 80,
    depth: 50,
    breathiness: 20,
    warmth: 60,
    emotion: 'neutral'
};
// Default voices directory
const VOICES_DIR = 'voices';
// Default audio output directory
const AUDIO_OUTPUT_DIR = 'generated-audio';
// Default voice library file
const VOICE_LIBRARY_FILE = 'voice-library.json';
// Default tasks file
const VOICE_TASKS_FILE = 'voice-tasks.json';
// Voice library
let voiceLibrary = {
    models: {},
    lastUpdated: Date.now()
};
// Voice tasks
let voiceTasks = {};
function activate() {
    console.log("[TOOL] voice-cloner activated");
    // Ensure directories exist
    if (!fsSync.existsSync(VOICES_DIR)) {
        fsSync.mkdirSync(VOICES_DIR, { recursive: true });
    }
    if (!fsSync.existsSync(AUDIO_OUTPUT_DIR)) {
        fsSync.mkdirSync(AUDIO_OUTPUT_DIR, { recursive: true });
    }
    // Load voice library
    loadVoiceLibrary();
    // Load voice tasks
    loadVoiceTasks();
}
/**
 * Load voice library from file
 */
function loadVoiceLibrary() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (fsSync.existsSync(VOICE_LIBRARY_FILE)) {
                const libraryData = yield fs.readFile(VOICE_LIBRARY_FILE, 'utf8');
                voiceLibrary = JSON.parse(libraryData);
                console.log(`[Voice Cloner] Loaded ${Object.keys(voiceLibrary.models).length} voice models`);
            }
            else {
                // Create default library file
                yield saveVoiceLibrary();
            }
        }
        catch (error) {
            console.error('[Voice Cloner] Error loading voice library:', error);
        }
    });
}
/**
 * Save voice library to file
 */
function saveVoiceLibrary() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            voiceLibrary.lastUpdated = Date.now();
            yield fs.writeFile(VOICE_LIBRARY_FILE, JSON.stringify(voiceLibrary, null, 2), 'utf8');
            console.log(`[Voice Cloner] Saved ${Object.keys(voiceLibrary.models).length} voice models`);
        }
        catch (error) {
            console.error('[Voice Cloner] Error saving voice library:', error);
        }
    });
}
/**
 * Load voice tasks from file
 */
function loadVoiceTasks() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (fsSync.existsSync(VOICE_TASKS_FILE)) {
                const tasksData = yield fs.readFile(VOICE_TASKS_FILE, 'utf8');
                voiceTasks = JSON.parse(tasksData);
                console.log(`[Voice Cloner] Loaded ${Object.keys(voiceTasks).length} voice tasks`);
            }
            else {
                // Create default tasks file
                yield saveVoiceTasks();
            }
        }
        catch (error) {
            console.error('[Voice Cloner] Error loading voice tasks:', error);
        }
    });
}
/**
 * Save voice tasks to file
 */
function saveVoiceTasks() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield fs.writeFile(VOICE_TASKS_FILE, JSON.stringify(voiceTasks, null, 2), 'utf8');
            console.log(`[Voice Cloner] Saved ${Object.keys(voiceTasks).length} voice tasks`);
        }
        catch (error) {
            console.error('[Voice Cloner] Error saving voice tasks:', error);
        }
    });
}
/**
 * Generate a unique ID
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
}
/**
 * Handle file write events
 */
function onFileWrite(event) {
    // Check if voice library file was modified
    if (path.basename(event.path) === path.basename(VOICE_LIBRARY_FILE)) {
        console.log(`[Voice Cloner] Voice library file changed: ${event.path}`);
        loadVoiceLibrary();
    }
    // Check if voice tasks file was modified
    if (path.basename(event.path) === path.basename(VOICE_TASKS_FILE)) {
        console.log(`[Voice Cloner] Voice tasks file changed: ${event.path}`);
        loadVoiceTasks();
    }
}
/**
 * Handles session start logic
 */
function onSessionStart(session) {
    console.log(`[Voice Cloner] Session started: ${session.id}`);
    // Reload voice library on session start
    loadVoiceLibrary();
    // Reload voice tasks on session start
    loadVoiceTasks();
}
/**
 * Handles voice-cloner commands
 */
function onCommand(command) {
    return __awaiter(this, void 0, void 0, function* () {
        switch (command.name) {
            case 'voice-cloner:create-model':
                console.log('[Voice Cloner] Creating voice model...');
                return yield handleCreateModel(command.args[0]);
            case 'voice-cloner:list-models':
                console.log('[Voice Cloner] Listing voice models...');
                return yield handleListModels(command.args[0]);
            case 'voice-cloner:get-model':
                console.log('[Voice Cloner] Getting voice model...');
                return yield handleGetModel(command.args[0]);
            case 'voice-cloner:delete-model':
                console.log('[Voice Cloner] Deleting voice model...');
                return yield handleDeleteModel(command.args[0]);
            case 'voice-cloner:generate-audio':
                console.log('[Voice Cloner] Generating audio...');
                return yield handleGenerateAudio(command.args[0]);
            case 'voice-cloner:get-task':
                console.log('[Voice Cloner] Getting task...');
                return yield handleGetTask(command.args[0]);
            default:
                console.warn(`[Voice Cloner] Unknown command: ${command.name}`);
                return { error: `Unknown command: ${command.name}` };
        }
    });
}
// Define schemas for Voice Cloner tool
exports.CreateModelSchema = zod_1.z.object({
    name: zod_1.z.string(),
    type: zod_1.z.enum(['neural', 'parametric', 'unit-selection', 'formant', 'concatenative', 'custom']),
    sourceId: zod_1.z.string().optional(),
    sourceName: zod_1.z.string().optional(),
    characteristics: zod_1.z.object({
        pitch: zod_1.z.number().min(0).max(100).optional(),
        speed: zod_1.z.number().min(0).max(100).optional(),
        clarity: zod_1.z.number().min(0).max(100).optional(),
        depth: zod_1.z.number().min(0).max(100).optional(),
        breathiness: zod_1.z.number().min(0).max(100).optional(),
        warmth: zod_1.z.number().min(0).max(100).optional(),
        emotion: zod_1.z.string().optional()
    }).optional(),
    sampleRate: zod_1.z.number().min(8000).max(192000).optional().default(44100),
    bitDepth: zod_1.z.number().min(8).max(32).optional().default(16),
    filePath: zod_1.z.string().optional(),
    language: zod_1.z.string().optional().default('en'),
    tags: zod_1.z.array(zod_1.z.string()).optional().default([]),
    metadata: zod_1.z.record(zod_1.z.any()).optional().default({})
});
exports.ListModelsSchema = zod_1.z.object({
    type: zod_1.z.enum(['neural', 'parametric', 'unit-selection', 'formant', 'concatenative', 'custom', 'all']).optional().default('all'),
    language: zod_1.z.string().optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    limit: zod_1.z.number().min(1).max(100).optional().default(50),
    sortBy: zod_1.z.enum(['name', 'created', 'lastUsed']).optional().default('created'),
    sortDirection: zod_1.z.enum(['asc', 'desc']).optional().default('desc')
});
exports.GetModelSchema = zod_1.z.object({
    id: zod_1.z.string()
});
exports.DeleteModelSchema = zod_1.z.object({
    id: zod_1.z.string(),
    deleteFile: zod_1.z.boolean().optional().default(false)
});
exports.GenerateAudioSchema = zod_1.z.object({
    text: zod_1.z.string(),
    voiceId: zod_1.z.string(),
    adjustments: zod_1.z.object({
        pitch: zod_1.z.number().min(0).max(100).optional(),
        speed: zod_1.z.number().min(0).max(100).optional(),
        clarity: zod_1.z.number().min(0).max(100).optional(),
        depth: zod_1.z.number().min(0).max(100).optional(),
        breathiness: zod_1.z.number().min(0).max(100).optional(),
        warmth: zod_1.z.number().min(0).max(100).optional(),
        emotion: zod_1.z.string().optional()
    }).optional(),
    outputFileName: zod_1.z.string().optional(),
    format: zod_1.z.enum(['wav', 'mp3', 'ogg']).optional().default('mp3'),
    sampleRate: zod_1.z.number().min(8000).max(192000).optional(),
    bitDepth: zod_1.z.number().min(8).max(32).optional()
});
exports.GetTaskSchema = zod_1.z.object({
    id: zod_1.z.string()
});
/**
 * Handles creating a voice model
 */
function handleCreateModel(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = exports.CreateModelSchema.safeParse(args);
            if (!result.success) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: result.error.format(),
                                message: "Invalid arguments for creating voice model"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            const { name, type, sourceId, sourceName, characteristics, sampleRate, bitDepth, filePath, language, tags, metadata } = result.data;
            // Generate a unique ID
            const id = generateId();
            // Combine with default characteristics
            const voiceCharacteristics = Object.assign(Object.assign({}, DEFAULT_CHARACTERISTICS), characteristics);
            // Generate file path if not provided
            let modelFilePath = filePath;
            const fileExists = filePath && fsSync.existsSync(filePath);
            if (!modelFilePath || !fileExists) {
                // In a real implementation, this would be the path to the generated voice model file
                modelFilePath = path.join(VOICES_DIR, `${id}.bin`);
                // Since this is a boilerplate, we'll just create an empty file
                if (!fileExists) {
                    yield fs.writeFile(modelFilePath, '', 'utf8');
                }
            }
            // Create voice model
            const voiceModel = {
                id,
                name,
                type,
                sourceId,
                sourceName,
                characteristics: voiceCharacteristics,
                sampleRate,
                bitDepth,
                created: Date.now(),
                metadata,
                filePath: modelFilePath,
                fileSize: fileExists ? fsSync.statSync(modelFilePath).size : 0,
                duration: 0, // This would be calculated in a real implementation
                language,
                tags
            };
            // Add to library
            voiceLibrary.models[id] = voiceModel;
            // Save library
            yield saveVoiceLibrary();
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            id,
                            name,
                            type,
                            characteristics: voiceCharacteristics,
                            filePath: modelFilePath,
                            language,
                            tags,
                            message: `Successfully created ${type} voice model '${name}'`
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
                            message: "Failed to create voice model"
                        }, null, 2)
                    }],
                isError: true
            };
        }
    });
}
/**
 * Handles listing voice models
 */
function handleListModels(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = exports.ListModelsSchema.safeParse(args);
            if (!result.success) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: result.error.format(),
                                message: "Invalid arguments for listing voice models"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            const { type, language, tags, limit, sortBy, sortDirection } = result.data;
            // Filter models
            let filteredModels = Object.values(voiceLibrary.models);
            if (type !== 'all') {
                filteredModels = filteredModels.filter(model => model.type === type);
            }
            if (language) {
                filteredModels = filteredModels.filter(model => model.language === language);
            }
            if (tags && tags.length > 0) {
                filteredModels = filteredModels.filter(model => tags.every(tag => model.tags.includes(tag)));
            }
            // Sort models
            filteredModels.sort((a, b) => {
                let valueA;
                let valueB;
                switch (sortBy) {
                    case 'name':
                        valueA = a.name;
                        valueB = b.name;
                        break;
                    case 'created':
                        valueA = a.created;
                        valueB = b.created;
                        break;
                    case 'lastUsed':
                        valueA = a.lastUsed || 0;
                        valueB = b.lastUsed || 0;
                        break;
                    default:
                        valueA = a.created;
                        valueB = b.created;
                }
                // Handle string comparison
                if (typeof valueA === 'string' && typeof valueB === 'string') {
                    return sortDirection === 'asc'
                        ? valueA.localeCompare(valueB)
                        : valueB.localeCompare(valueA);
                }
                // Handle number comparison
                return sortDirection === 'asc'
                    ? valueA - valueB
                    : valueB - valueA;
            });
            // Apply limit
            const limitedModels = filteredModels.slice(0, limit);
            // Format models for response
            const formattedModels = limitedModels.map(model => ({
                id: model.id,
                name: model.name,
                type: model.type,
                characteristics: model.characteristics,
                language: model.language,
                tags: model.tags,
                created: model.created,
                lastUsed: model.lastUsed,
                duration: model.duration
            }));
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            models: formattedModels,
                            count: formattedModels.length,
                            total: filteredModels.length,
                            message: `Found ${formattedModels.length} voice models`
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
                            message: "Failed to list voice models"
                        }, null, 2)
                    }],
                isError: true
            };
        }
    });
}
/**
 * Handles getting a voice model
 */
function handleGetModel(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = exports.GetModelSchema.safeParse(args);
            if (!result.success) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: result.error.format(),
                                message: "Invalid arguments for getting voice model"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            const { id } = result.data;
            // Check if model exists
            if (!voiceLibrary.models[id]) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: `Voice model with ID '${id}' not found`,
                                message: "Failed to get voice model"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            // Get model
            const model = voiceLibrary.models[id];
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            model,
                            message: `Retrieved voice model '${model.name}'`
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
                            message: "Failed to get voice model"
                        }, null, 2)
                    }],
                isError: true
            };
        }
    });
}
/**
 * Handles deleting a voice model
 */
function handleDeleteModel(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = exports.DeleteModelSchema.safeParse(args);
            if (!result.success) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: result.error.format(),
                                message: "Invalid arguments for deleting voice model"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            const { id, deleteFile } = result.data;
            // Check if model exists
            if (!voiceLibrary.models[id]) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: `Voice model with ID '${id}' not found`,
                                message: "Failed to delete voice model"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            // Get model
            const model = voiceLibrary.models[id];
            // Delete file if requested
            if (deleteFile && fsSync.existsSync(model.filePath)) {
                yield fs.unlink(model.filePath);
            }
            // Remove from library
            delete voiceLibrary.models[id];
            // Save library
            yield saveVoiceLibrary();
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            id,
                            name: model.name,
                            fileDeleted: deleteFile && fsSync.existsSync(model.filePath),
                            message: `Successfully deleted voice model '${model.name}'`
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
                            message: "Failed to delete voice model"
                        }, null, 2)
                    }],
                isError: true
            };
        }
    });
}
/**
 * Handles generating audio from text
 */
function handleGenerateAudio(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = exports.GenerateAudioSchema.safeParse(args);
            if (!result.success) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: result.error.format(),
                                message: "Invalid arguments for generating audio"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            const { text, voiceId, adjustments, outputFileName, format, sampleRate, bitDepth } = result.data;
            // Check if voice model exists
            if (!voiceLibrary.models[voiceId]) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: `Voice model with ID '${voiceId}' not found`,
                                message: "Failed to generate audio"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            // Get voice model
            const voice = voiceLibrary.models[voiceId];
            // Generate a unique task ID
            const taskId = generateId();
            // Create file name
            const fileName = outputFileName || `${taskId}.${format}`;
            const outputPath = path.join(AUDIO_OUTPUT_DIR, fileName);
            // Create task
            const task = {
                id: taskId,
                text,
                voiceId,
                status: 'pending',
                created: Date.now(),
                outputPath,
                adjustments
            };
            // Add to tasks
            voiceTasks[taskId] = task;
            // Save tasks
            yield saveVoiceTasks();
            // In a real implementation, this would send the request to a voice synthesis service
            // For the boilerplate, we'll simulate the process with a simple file creation
            // Simulate task processing
            task.status = 'processing';
            yield saveVoiceTasks();
            // Create an empty output file to simulate audio generation
            yield fs.writeFile(outputPath, '', 'utf8');
            // Simulate completion
            const completionTime = Date.now();
            const duration = Math.ceil(text.length / 20); // Rough estimate: 1 second per 20 characters
            task.status = 'completed';
            task.completed = completionTime;
            task.outputDuration = duration;
            // Update voice model last used time
            voice.lastUsed = completionTime;
            yield saveVoiceLibrary();
            // Save tasks
            yield saveVoiceTasks();
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            taskId,
                            voiceId,
                            voiceName: voice.name,
                            text,
                            status: 'completed',
                            outputPath,
                            duration,
                            format,
                            message: `Successfully generated audio for text using voice '${voice.name}'`
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
                            message: "Failed to generate audio"
                        }, null, 2)
                    }],
                isError: true
            };
        }
    });
}
/**
 * Handles getting task status/details
 */
function handleGetTask(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = exports.GetTaskSchema.safeParse(args);
            if (!result.success) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: result.error.format(),
                                message: "Invalid arguments for getting task"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            const { id } = result.data;
            // Check if task exists
            if (!voiceTasks[id]) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: `Task with ID '${id}' not found`,
                                message: "Failed to get task"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            // Get task
            const task = voiceTasks[id];
            // Get voice model
            const voice = voiceLibrary.models[task.voiceId];
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            task,
                            voice: voice ? {
                                id: voice.id,
                                name: voice.name,
                                type: voice.type
                            } : null,
                            outputExists: task.outputPath ? fsSync.existsSync(task.outputPath) : false,
                            message: `Retrieved task '${id}' with status '${task.status}'`
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
                            message: "Failed to get task"
                        }, null, 2)
                    }],
                isError: true
            };
        }
    });
}
