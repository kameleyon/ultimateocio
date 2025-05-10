// Auto-generated boilerplate for i18n-loader

import { z } from 'zod';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';

// Default supported languages
const DEFAULT_LANGUAGES = ['en', 'es', 'fr', 'de', 'ja', 'zh'];
const DEFAULT_LANGUAGE = 'en';

// In-memory cache for translations
const translationCache: Record<string, Record<string, string>> = {};
let currentLanguage = DEFAULT_LANGUAGE;

export function activate() {
  console.log("[TOOL] i18n-loader activated");
  
  // Initialize with default language
  loadLanguage(DEFAULT_LANGUAGE);
}

/**
 * Handles file write events to detect changes in translation files
 */
export function onFileWrite(event: { path: string; content: string }) {
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
export function onSessionStart(session: { id: string; startTime: number }) {
  console.log(`[i18n Loader] Session started: ${session.id}`);
  
  // Reset to default language at session start
  currentLanguage = DEFAULT_LANGUAGE;
}

/**
 * Handles i18n-loader commands
 */
export async function onCommand(command: { name: string; args: any[] }) {
  switch (command.name) {
    case 'i18n-loader:load':
      console.log('[i18n Loader] Loading language...');
      return await handleLoadLanguage(command.args[0]);
    case 'i18n-loader:translate':
      console.log('[i18n Loader] Translating text...');
      return await handleTranslate(command.args[0]);
    case 'i18n-loader:list-languages':
      console.log('[i18n Loader] Listing available languages...');
      return await handleListLanguages(command.args[0]);
    case 'i18n-loader:switch':
      console.log('[i18n Loader] Switching language...');
      return await handleSwitchLanguage(command.args[0]);
    default:
      console.warn(`[i18n Loader] Unknown command: ${command.name}`);
      return { error: `Unknown command: ${command.name}` };
  }
}

// Define schemas for i18n Loader tool
export const LoadLanguageSchema = z.object({
  language: z.string(),
  path: z.string().optional(),
  merge: z.boolean().optional().default(false),
});

export const TranslateSchema = z.object({
  key: z.string(),
  language: z.string().optional(),
  fallback: z.string().optional(),
  interpolations: z.record(z.string()).optional(),
});

export const ListLanguagesSchema = z.object({
  path: z.string().optional(),
  includeCompletionStats: z.boolean().optional().default(false),
});

export const SwitchLanguageSchema = z.object({
  language: z.string(),
  savePreference: z.boolean().optional().default(true),
});

/**
 * Loads language translations from content
 */
function loadLanguageFromContent(language: string, content: string): boolean {
  try {
    const translations = JSON.parse(content);
    
    // Store in cache
    translationCache[language] = {
      ...(translationCache[language] || {}),
      ...transformToFlatObject(translations)
    };
    
    return true;
  } catch (error) {
    console.error(`[i18n Loader] Failed to load translations for ${language} from content:`, error);
    return false;
  }
}

/**
 * Loads language translations from file path
 */
async function loadLanguage(language: string, basePath?: string): Promise<boolean> {
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
        const content = await fs.readFile(filePath, 'utf8');
        const success = loadLanguageFromContent(language, content);
        
        if (success) {
          return true;
        }
      }
    } catch (error) {
      console.error(`[i18n Loader] Failed to load translations from ${filePath}:`, error);
    }
  }
  
  return false;
}

/**
 * Transforms nested translation object into flat key-value pairs
 */
function transformToFlatObject(obj: Record<string, any>, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {};
  
  for (const key in obj) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      // Recursively flatten nested objects
      Object.assign(result, transformToFlatObject(obj[key], newKey));
    } else {
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
function interpolate(text: string, variables?: Record<string, string>): string {
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
async function handleLoadLanguage(args: any) {
  try {
    const result = LoadLanguageSchema.safeParse(args);
    
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
    const success = await loadLanguage(language, basePath);
    
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
  } catch (error) {
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
}

/**
 * Handles translating text
 */
async function handleTranslate(args: any) {
  try {
    const result = TranslateSchema.safeParse(args);
    
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
      const success = await loadLanguage(language);
      
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
    const translation = translationCache[language]?.[key];
    
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
      } else {
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
  } catch (error) {
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
}

/**
 * Handles listing available languages
 */
async function handleListLanguages(args: any) {
  try {
    const result = ListLanguagesSchema.safeParse(args);
    
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
    
    const availableLanguages = new Set<string>();
    
    // Add cached languages
    Object.keys(translationCache).forEach(lang => availableLanguages.add(lang));
    
    // Check file system for language files
    for (const dir of baseDirectories) {
      try {
        if (fsSync.existsSync(dir)) {
          const files = await fs.readdir(dir);
          
          for (const file of files) {
            const match = file.match(/^([a-z]{2})(-[A-Z]{2})?\.json$/);
            if (match) {
              availableLanguages.add(match[1]);
            }
          }
        }
      } catch (error) {
        console.error(`[i18n Loader] Failed to read directory ${dir}:`, error);
      }
    }
    
    // Build language stats
    const languages = Array.from(availableLanguages).map(lang => {
      const result: any = {
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
      const referenceLanguage = languages.find(lang => lang.loaded && lang.entriesCount > 0)?.code || languages[0].code;
      
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
  } catch (error) {
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
}

/**
 * Gets language name from ISO code
 */
function getLanguageName(code: string): string {
  const languageNames: Record<string, string> = {
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
async function handleSwitchLanguage(args: any) {
  try {
    const result = SwitchLanguageSchema.safeParse(args);
    
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
      const success = await loadLanguage(language);
      
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
  } catch (error) {
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
}