"use strict";
// Auto-generated boilerplate for i18n-loader
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
exports.SwitchLanguageSchema = exports.ListLanguagesSchema = exports.TranslateSchema = exports.LoadLanguageSchema = void 0;
exports.activate = activate;
exports.onFileWrite = onFileWrite;
exports.onSessionStart = onSessionStart;
exports.onCommand = onCommand;
const zod_1 = require("zod");
const fs = __importStar(require("fs/promises"));
const fsSync = __importStar(require("fs"));
const path = __importStar(require("path"));
// Default supported languages
const DEFAULT_LANGUAGES = ['en', 'es', 'fr', 'de', 'ja', 'zh'];
const DEFAULT_LANGUAGE = 'en';
// In-memory cache for translations
const translationCache = {};
let currentLanguage = DEFAULT_LANGUAGE;
function activate() {
    console.log("[TOOL] i18n-loader activated");
    // Initialize with default language
    loadLanguage(DEFAULT_LANGUAGE);
}
/**
 * Handles file write events to detect changes in translation files
 */
function onFileWrite(event) {
    // Check if it's a translation file
    if (event.path.includes('/locales/') || event.path.includes('/translations/')) {
        console.log(`[i18n Loader] Translation file changed: ${event.path}`);
        // Extract language from path
        const pathParts = event.path.split('/');
        const fileName = pathParts[pathParts.length - 1];
        const match = fileName.match(/^([a-z]{2})(-[A-Z]{2})?\.json$/);
        if (match) {
            const lang = match[1];
            console.log(`[i18n Loader] Reloading language: ${lang}`);
            // Reload language
            loadLanguageFromContent(lang, event.content);
        }
    }
}
/**
 * Handles session start logic
 */
function onSessionStart(session) {
    console.log(`[i18n Loader] Session started: ${session.id}`);
    // Reset to default language at session start
    currentLanguage = DEFAULT_LANGUAGE;
}
/**
 * Handles i18n-loader commands
 */
function onCommand(command) {
    return __awaiter(this, void 0, void 0, function* () {
        switch (command.name) {
            case 'i18n-loader:load':
                console.log('[i18n Loader] Loading language...');
                return yield handleLoadLanguage(command.args[0]);
            case 'i18n-loader:translate':
                console.log('[i18n Loader] Translating text...');
                return yield handleTranslate(command.args[0]);
            case 'i18n-loader:list-languages':
                console.log('[i18n Loader] Listing available languages...');
                return yield handleListLanguages(command.args[0]);
            case 'i18n-loader:switch':
                console.log('[i18n Loader] Switching language...');
                return yield handleSwitchLanguage(command.args[0]);
            default:
                console.warn(`[i18n Loader] Unknown command: ${command.name}`);
                return { error: `Unknown command: ${command.name}` };
        }
    });
}
// Define schemas for i18n Loader tool
exports.LoadLanguageSchema = zod_1.z.object({
    language: zod_1.z.string(),
    path: zod_1.z.string().optional(),
    merge: zod_1.z.boolean().optional().default(false),
});
exports.TranslateSchema = zod_1.z.object({
    key: zod_1.z.string(),
    language: zod_1.z.string().optional(),
    fallback: zod_1.z.string().optional(),
    interpolations: zod_1.z.record(zod_1.z.string()).optional(),
});
exports.ListLanguagesSchema = zod_1.z.object({
    path: zod_1.z.string().optional(),
    includeCompletionStats: zod_1.z.boolean().optional().default(false),
});
exports.SwitchLanguageSchema = zod_1.z.object({
    language: zod_1.z.string(),
    savePreference: zod_1.z.boolean().optional().default(true),
});
/**
 * Loads language translations from content
 */
function loadLanguageFromContent(language, content) {
    try {
        const translations = JSON.parse(content);
        // Store in cache
        translationCache[language] = Object.assign(Object.assign({}, (translationCache[language] || {})), transformToFlatObject(translations));
        return true;
    }
    catch (error) {
        console.error(`[i18n Loader] Failed to load translations for ${language} from content:`, error);
        return false;
    }
}
/**
 * Loads language translations from file path
 */
function loadLanguage(language, basePath) {
    return __awaiter(this, void 0, void 0, function* () {
        // Default paths to check for translation files
        const paths = [
            path.join(basePath || process.cwd(), 'locales', `${language}.json`),
            path.join(basePath || process.cwd(), 'translations', `${language}.json`),
            path.join(basePath || process.cwd(), 'i18n', `${language}.json`),
            path.join(basePath || process.cwd(), 'src', 'locales', `${language}.json`),
            path.join(basePath || process.cwd(), 'src', 'translations', `${language}.json`),
            path.join(basePath || process.cwd(), 'src', 'i18n', `${language}.json`),
        ];
        // Try each path
        for (const filePath of paths) {
            try {
                if (fsSync.existsSync(filePath)) {
                    const content = yield fs.readFile(filePath, 'utf8');
                    const success = loadLanguageFromContent(language, content);
                    if (success) {
                        return true;
                    }
                }
            }
            catch (error) {
                console.error(`[i18n Loader] Failed to load translations from ${filePath}:`, error);
            }
        }
        return false;
    });
}
/**
 * Transforms nested translation object into flat key-value pairs
 */
function transformToFlatObject(obj, prefix = '') {
    const result = {};
    for (const key in obj) {
        const newKey = prefix ? `${prefix}.${key}` : key;
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
            // Recursively flatten nested objects
            Object.assign(result, transformToFlatObject(obj[key], newKey));
        }
        else {
            // Convert arrays to string if necessary
            const value = Array.isArray(obj[key]) ? obj[key].join(', ') : obj[key];
            // Only include string values
            if (typeof value === 'string') {
                result[newKey] = value;
            }
        }
    }
    return result;
}
/**
 * Interpolates variables into translation text
 */
function interpolate(text, variables) {
    if (!variables) {
        return text;
    }
    // Replace {{variableName}} patterns
    return text.replace(/\{\{([^}]+)\}\}/g, (match, variable) => {
        return variables[variable] !== undefined ? variables[variable] : match;
    });
}
/**
 * Handles loading a language
 */
function handleLoadLanguage(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = exports.LoadLanguageSchema.safeParse(args);
            if (!result.success) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: result.error.format(),
                                message: "Invalid arguments for loading language"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            const { language, path: basePath, merge } = result.data;
            // Check if language is already loaded
            const isLanguageLoaded = !!translationCache[language];
            if (isLanguageLoaded && !merge) {
                // Clear existing translations if not merging
                delete translationCache[language];
            }
            // Load language
            const success = yield loadLanguage(language, basePath);
            if (!success && !isLanguageLoaded) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: `Failed to load translations for language ${language}`,
                                message: `Could not find translation files for ${language}`
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            // Count translations
            const translationCount = translationCache[language] ? Object.keys(translationCache[language]).length : 0;
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            language,
                            loaded: true,
                            entryCount: translationCount,
                            merged: isLanguageLoaded && merge,
                            message: `Successfully loaded ${translationCount} translations for ${language}`
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
                            message: "Failed to load language"
                        }, null, 2)
                    }],
                isError: true
            };
        }
    });
}
/**
 * Handles translating text
 */
function handleTranslate(args) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const result = exports.TranslateSchema.safeParse(args);
            if (!result.success) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: result.error.format(),
                                message: "Invalid arguments for translation"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            const { key, language = currentLanguage, fallback, interpolations } = result.data;
            // Check if language is loaded
            if (!translationCache[language]) {
                // Try to load the language
                const success = yield loadLanguage(language);
                if (!success) {
                    return {
                        content: [{
                                type: "text",
                                text: JSON.stringify({
                                    error: `Language ${language} is not loaded`,
                                    message: "Failed to translate text"
                                }, null, 2)
                            }],
                        isError: true
                    };
                }
            }
            // Get translation
            const translation = (_a = translationCache[language]) === null || _a === void 0 ? void 0 : _a[key];
            // Use fallback if translation not found
            if (translation === undefined) {
                if (fallback !== undefined) {
                    // Return fallback with interpolations
                    return {
                        content: [{
                                type: "text",
                                text: JSON.stringify({
                                    key,
                                    language,
                                    found: false,
                                    usedFallback: true,
                                    text: interpolate(fallback, interpolations),
                                    message: `Translation not found for ${key}, using fallback`
                                }, null, 2)
                            }]
                    };
                }
                else {
                    // Return key as fallback
                    return {
                        content: [{
                                type: "text",
                                text: JSON.stringify({
                                    key,
                                    language,
                                    found: false,
                                    usedFallback: false,
                                    text: key,
                                    message: `Translation not found for ${key}`
                                }, null, 2)
                            }],
                        isError: true
                    };
                }
            }
            // Return translation with interpolations
            const translatedText = interpolate(translation, interpolations);
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            key,
                            language,
                            found: true,
                            text: translatedText,
                            message: `Successfully translated ${key}`
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
                            message: "Failed to translate text"
                        }, null, 2)
                    }],
                isError: true
            };
        }
    });
}
/**
 * Handles listing available languages
 */
function handleListLanguages(args) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const result = exports.ListLanguagesSchema.safeParse(args);
            if (!result.success) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: result.error.format(),
                                message: "Invalid arguments for listing languages"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            const { path: basePath, includeCompletionStats } = result.data;
            // Default paths to check for translation files
            const baseDirectories = [
                path.join(basePath || process.cwd(), 'locales'),
                path.join(basePath || process.cwd(), 'translations'),
                path.join(basePath || process.cwd(), 'i18n'),
                path.join(basePath || process.cwd(), 'src', 'locales'),
                path.join(basePath || process.cwd(), 'src', 'translations'),
                path.join(basePath || process.cwd(), 'src', 'i18n'),
            ];
            const availableLanguages = new Set();
            // Add cached languages
            Object.keys(translationCache).forEach(lang => availableLanguages.add(lang));
            // Check file system for language files
            for (const dir of baseDirectories) {
                try {
                    if (fsSync.existsSync(dir)) {
                        const files = yield fs.readdir(dir);
                        for (const file of files) {
                            const match = file.match(/^([a-z]{2})(-[A-Z]{2})?\.json$/);
                            if (match) {
                                availableLanguages.add(match[1]);
                            }
                        }
                    }
                }
                catch (error) {
                    console.error(`[i18n Loader] Failed to read directory ${dir}:`, error);
                }
            }
            // Build language stats
            const languages = Array.from(availableLanguages).map(lang => {
                const result = {
                    code: lang,
                    name: getLanguageName(lang),
                    loaded: !!translationCache[lang],
                };
                if (translationCache[lang]) {
                    result.entriesCount = Object.keys(translationCache[lang]).length;
                }
                return result;
            });
            // Include completion stats if requested
            if (includeCompletionStats && languages.length > 1) {
                // Use first language with translations as reference
                const referenceLanguage = ((_a = languages.find(lang => lang.loaded && lang.entriesCount > 0)) === null || _a === void 0 ? void 0 : _a.code) || languages[0].code;
                if (translationCache[referenceLanguage]) {
                    const referenceKeys = Object.keys(translationCache[referenceLanguage]);
                    // Calculate completion percentage
                    languages.forEach(lang => {
                        if (lang.code !== referenceLanguage && translationCache[lang.code]) {
                            const langKeys = Object.keys(translationCache[lang.code]);
                            const common = referenceKeys.filter(key => langKeys.includes(key));
                            lang.completionPercentage = Math.round((common.length / referenceKeys.length) * 100);
                            lang.missingKeys = referenceKeys.length - common.length;
                        }
                    });
                }
            }
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            languages,
                            currentLanguage,
                            count: languages.length,
                            message: `Found ${languages.length} languages`
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
                            message: "Failed to list languages"
                        }, null, 2)
                    }],
                isError: true
            };
        }
    });
}
/**
 * Gets language name from ISO code
 */
function getLanguageName(code) {
    const languageNames = {
        'en': 'English',
        'es': 'Spanish',
        'fr': 'French',
        'de': 'German',
        'it': 'Italian',
        'pt': 'Portuguese',
        'nl': 'Dutch',
        'ru': 'Russian',
        'zh': 'Chinese',
        'ja': 'Japanese',
        'ko': 'Korean',
        'ar': 'Arabic',
        'hi': 'Hindi',
        'tr': 'Turkish',
        'pl': 'Polish',
        'sv': 'Swedish',
        'fi': 'Finnish',
        'no': 'Norwegian',
        'da': 'Danish',
        'cs': 'Czech',
        'hu': 'Hungarian',
        'el': 'Greek',
        'he': 'Hebrew',
        'th': 'Thai',
        'vi': 'Vietnamese'
    };
    return languageNames[code] || `Language (${code})`;
}
/**
 * Handles switching language
 */
function handleSwitchLanguage(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = exports.SwitchLanguageSchema.safeParse(args);
            if (!result.success) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: result.error.format(),
                                message: "Invalid arguments for switching language"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            const { language, savePreference } = result.data;
            // Check if language exists in cache
            if (!translationCache[language]) {
                // Try to load the language
                const success = yield loadLanguage(language);
                if (!success) {
                    return {
                        content: [{
                                type: "text",
                                text: JSON.stringify({
                                    error: `Language ${language} is not available`,
                                    message: "Failed to switch language"
                                }, null, 2)
                            }],
                        isError: true
                    };
                }
            }
            // Switch language
            const previousLanguage = currentLanguage;
            currentLanguage = language;
            // TODO: Save preference if requested
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            language,
                            previousLanguage,
                            entriesCount: translationCache[language] ? Object.keys(translationCache[language]).length : 0,
                            savePreference,
                            message: `Successfully switched language from ${previousLanguage} to ${language}`
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
                            message: "Failed to switch language"
                        }, null, 2)
                    }],
                isError: true
            };
        }
    });
}
