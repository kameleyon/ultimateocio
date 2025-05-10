// Auto-generated boilerplate for tone-adjuster

import { z } from 'zod';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';

// Supported tone types
type ToneType = 
  'formal' | 
  'informal' | 
  'friendly' | 
  'professional' | 
  'technical' | 
  'simple' | 
  'persuasive' | 
  'empathetic' | 
  'enthusiastic' | 
  'neutral' | 
  'custom';

// Tone adjuster settings
interface ToneSettings {
  formality: number;       // 0-100 (casual to formal)
  complexity: number;      // 0-100 (simple to complex)
  emotion: number;         // 0-100 (neutral to emotional)
  confidence: number;      // 0-100 (uncertain to confident)
  personalization: number; // 0-100 (generic to personalized)
  enthusiasm: number;      // 0-100 (subdued to enthusiastic)
  technicality: number;    // 0-100 (simple to technical)
  wordiness: number;       // 0-100 (concise to verbose)
}

// Tone profile template
interface ToneProfile {
  name: string;
  type: ToneType;
  description: string;
  settings: ToneSettings;
  examples: string[];
  isDefault?: boolean;
  customRules?: string[];
}

// Replacement rule
interface ReplacementRule {
  pattern: string | RegExp;
  replacement: string;
  condition?: (text: string, settings: ToneSettings) => boolean;
}

// Default tone profiles
const DEFAULT_TONE_PROFILES: ToneProfile[] = [
  {
    name: 'Formal',
    type: 'formal',
    description: 'Professional, sophisticated language suitable for business or academic contexts',
    settings: {
      formality: 90,
      complexity: 70,
      emotion: 20,
      confidence: 80,
      personalization: 30,
      enthusiasm: 40,
      technicality: 70,
      wordiness: 60
    },
    examples: [
      'It would be greatly appreciated if you could provide the requested documentation at your earliest convenience.',
      'The analysis indicates that the proposed methodology demonstrates significant potential for addressing the identified issues.'
    ]
  },
  {
    name: 'Informal',
    type: 'informal',
    description: 'Casual, relaxed language for everyday conversations',
    settings: {
      formality: 20,
      complexity: 30,
      emotion: 60,
      confidence: 60,
      personalization: 70,
      enthusiasm: 70,
      technicality: 20,
      wordiness: 40
    },
    examples: [
      'Hey, could you send over that info when you get a chance?',
      'I think this idea could really work out well for fixing those problems we talked about.'
    ]
  },
  {
    name: 'Technical',
    type: 'technical',
    description: 'Precise, specialized language with domain-specific terminology',
    settings: {
      formality: 80,
      complexity: 90,
      emotion: 10,
      confidence: 90,
      personalization: 20,
      enthusiasm: 30,
      technicality: 95,
      wordiness: 70
    },
    examples: [
      'The implementation leverages a stateless microservice architecture with asynchronous message passing for inter-service communication.',
      "The algorithm's time complexity is O(n log n), making it suitable for processing large datasets efficiently."
    ]
  },
  {
    name: 'Simple',
    type: 'simple',
    description: "Clear, straightforward language that's easy to understand",
    settings: {
      formality: 40,
      complexity: 20,
      emotion: 30,
      confidence: 60,
      personalization: 50,
      enthusiasm: 40,
      technicality: 15,
      wordiness: 30
    },
    examples: [
      'Please send us your files as soon as you can.',
      'This method works well for solving these problems.'
    ],
    isDefault: true
  },
  {
    name: 'Friendly',
    type: 'friendly',
    description: 'Warm, conversational language that builds rapport',
    settings: {
      formality: 30,
      complexity: 30,
      emotion: 80,
      confidence: 70,
      personalization: 90,
      enthusiasm: 80,
      technicality: 20,
      wordiness: 50
    },
    examples: [
      "Hey there! I'd love to see those documents whenever you get a chance to send them over.",
      "I'm really excited about this approach – I think it could be a fantastic solution to the challenges we've been facing!"
    ]
  }
];

// Generic replacement rules
const GENERIC_REPLACEMENT_RULES: ReplacementRule[] = [
  // Formal replacements
  {
    pattern: /\bget\b/g,
    replacement: 'obtain',
    condition: (text, settings) => settings.formality > 70
  },
  {
    pattern: /\buse\b/g,
    replacement: 'utilize',
    condition: (text, settings) => settings.formality > 70
  },
  {
    pattern: /\bmake\b/g,
    replacement: 'create',
    condition: (text, settings) => settings.formality > 70
  },
  {
    pattern: /\bsee\b/g,
    replacement: 'observe',
    condition: (text, settings) => settings.formality > 70
  },
  {
    pattern: /\bbig\b/g,
    replacement: 'substantial',
    condition: (text, settings) => settings.formality > 70
  },
  {
    pattern: /\basks for\b/g,
    replacement: 'requests',
    condition: (text, settings) => settings.formality > 70
  },
  
  // Informal replacements
  {
    pattern: /\bobtain\b/g,
    replacement: 'get',
    condition: (text, settings) => settings.formality < 30
  },
  {
    pattern: /\butilize\b/g,
    replacement: 'use',
    condition: (text, settings) => settings.formality < 30
  },
  {
    pattern: /\bcreate\b/g,
    replacement: 'make',
    condition: (text, settings) => settings.formality < 30
  },
  {
    pattern: /\bobserve\b/g,
    replacement: 'see',
    condition: (text, settings) => settings.formality < 30
  },
  {
    pattern: /\bsubstantial\b/g,
    replacement: 'big',
    condition: (text, settings) => settings.formality < 30
  },
  {
    pattern: /\brequests\b/g,
    replacement: 'asks for',
    condition: (text, settings) => settings.formality < 30
  },
  
  // High enthusiasm replacements
  {
    pattern: /\bgood\b/g,
    replacement: 'great',
    condition: (text, settings) => settings.enthusiasm > 70
  },
  {
    pattern: /\bgreat\b/g,
    replacement: 'excellent',
    condition: (text, settings) => settings.enthusiasm > 80
  },
  {
    pattern: /\blike\b/g,
    replacement: 'love',
    condition: (text, settings) => settings.enthusiasm > 80
  },
  
  // Low enthusiasm replacements
  {
    pattern: /\bexcellent\b/g,
    replacement: 'satisfactory',
    condition: (text, settings) => settings.enthusiasm < 30
  },
  {
    pattern: /\bamazing\b/g,
    replacement: 'adequate',
    condition: (text, settings) => settings.enthusiasm < 30
  },
  
  // High technicality replacements
  {
    pattern: /\bstart\b/g,
    replacement: 'initialize',
    condition: (text, settings) => settings.technicality > 70
  },
  {
    pattern: /\bend\b/g,
    replacement: 'terminate',
    condition: (text, settings) => settings.technicality > 70
  },
  {
    pattern: /\bchange\b/g,
    replacement: 'modify',
    condition: (text, settings) => settings.technicality > 70
  },
  
  // Low technicality replacements
  {
    pattern: /\binitialize\b/g,
    replacement: 'start',
    condition: (text, settings) => settings.technicality < 30
  },
  {
    pattern: /\bterminate\b/g,
    replacement: 'end',
    condition: (text, settings) => settings.technicality < 30
  },
  {
    pattern: /\bmodify\b/g,
    replacement: 'change',
    condition: (text, settings) => settings.technicality < 30
  }
];

// Current tone profiles
let toneProfiles: ToneProfile[] = [...DEFAULT_TONE_PROFILES];

// Current active tone
let activeTone: string = DEFAULT_TONE_PROFILES.find(p => p.isDefault)?.name || 'Simple';

// Custom replacement rules
let customReplacementRules: ReplacementRule[] = [];

export function activate() {
  console.log("[TOOL] tone-adjuster activated");
  
  // Load any saved profiles
  loadProfiles();
}

/**
 * Load tone profiles from file
 */
async function loadProfiles(): Promise<void> {
  try {
    if (fsSync.existsSync('tone-profiles.json')) {
      const profilesData = await fs.readFile('tone-profiles.json', 'utf8');
      const loadedProfiles = JSON.parse(profilesData);
      
      if (Array.isArray(loadedProfiles)) {
        // Merge with default profiles, giving preference to loaded profiles
        const mergedProfiles = [...DEFAULT_TONE_PROFILES];
        
        for (const loadedProfile of loadedProfiles) {
          const existingIndex = mergedProfiles.findIndex(p => p.name === loadedProfile.name);
          if (existingIndex >= 0) {
            mergedProfiles[existingIndex] = loadedProfile;
          } else {
            mergedProfiles.push(loadedProfile);
          }
        }
        
        toneProfiles = mergedProfiles;
        console.log(`[Tone Adjuster] Loaded ${loadedProfiles.length} tone profiles`);
      }
      
      // Load active tone
      if (fsSync.existsSync('active-tone.json')) {
        const activeToneData = await fs.readFile('active-tone.json', 'utf8');
        const { active } = JSON.parse(activeToneData);
        if (active && toneProfiles.some(p => p.name === active)) {
          activeTone = active;
          console.log(`[Tone Adjuster] Active tone: ${activeTone}`);
        }
      }
    } else {
      // Create default profiles file
      await saveProfiles();
      console.log(`[Tone Adjuster] Created default tone profiles`);
    }
  } catch (error) {
    console.error('[Tone Adjuster] Error loading tone profiles:', error);
  }
}

/**
 * Save tone profiles to file
 */
async function saveProfiles(): Promise<void> {
  try {
    await fs.writeFile('tone-profiles.json', JSON.stringify(toneProfiles, null, 2), 'utf8');
    console.log(`[Tone Adjuster] Saved ${toneProfiles.length} tone profiles`);
    
    // Save active tone
    await fs.writeFile('active-tone.json', JSON.stringify({ active: activeTone }, null, 2), 'utf8');
    console.log(`[Tone Adjuster] Saved active tone: ${activeTone}`);
  } catch (error) {
    console.error('[Tone Adjuster] Error saving tone profiles:', error);
  }
}

/**
 * Get tone settings by tone name
 */
function getToneSettings(toneName: string): ToneSettings | null {
  const profile = toneProfiles.find(p => p.name === toneName);
  return profile ? profile.settings : null;
}

/**
 * Adjust text based on tone settings
 */
function adjustText(text: string, settings: ToneSettings): string {
  let adjustedText = text;
  
  // Apply generic replacement rules
  for (const rule of GENERIC_REPLACEMENT_RULES) {
    if (!rule.condition || rule.condition(adjustedText, settings)) {
      adjustedText = adjustedText.replace(rule.pattern, rule.replacement);
    }
  }
  
  // Apply custom replacement rules
  for (const rule of customReplacementRules) {
    if (!rule.condition || rule.condition(adjustedText, settings)) {
      adjustedText = adjustedText.replace(rule.pattern, rule.replacement);
    }
  }
  
  return adjustedText;
}

/**
 * Handles file write events
 */
export function onFileWrite(event: { path: string; content: string }) {
  // Check if tone profiles file was modified
  if (path.basename(event.path) === 'tone-profiles.json') {
    console.log(`[Tone Adjuster] Tone profiles file changed: ${event.path}`);
    loadProfiles();
  }
  
  // Check if active tone file was modified
  if (path.basename(event.path) === 'active-tone.json') {
    console.log(`[Tone Adjuster] Active tone file changed: ${event.path}`);
    loadProfiles();
  }
}

/**
 * Handles session start logic
 */
export function onSessionStart(session: { id: string; startTime: number }) {
  console.log(`[Tone Adjuster] Session started: ${session.id}`);
  
  // Reload profiles on session start
  loadProfiles();
}

/**
 * Handles tone-adjuster commands
 */
export async function onCommand(command: { name: string; args: any[] }) {
  switch (command.name) {
    case 'tone-adjuster:adjust':
      console.log('[Tone Adjuster] Adjusting text tone...');
      return await handleAdjustText(command.args[0]);
    case 'tone-adjuster:create-profile':
      console.log('[Tone Adjuster] Creating tone profile...');
      return await handleCreateProfile(command.args[0]);
    case 'tone-adjuster:list-profiles':
      console.log('[Tone Adjuster] Listing tone profiles...');
      return await handleListProfiles(command.args[0]);
    case 'tone-adjuster:set-active':
      console.log('[Tone Adjuster] Setting active tone...');
      return await handleSetActiveTone(command.args[0]);
    case 'tone-adjuster:get-active':
      console.log('[Tone Adjuster] Getting active tone...');
      return await handleGetActiveTone(command.args[0]);
    case 'tone-adjuster:delete-profile':
      console.log('[Tone Adjuster] Deleting tone profile...');
      return await handleDeleteProfile(command.args[0]);
    case 'tone-adjuster:add-rule':
      console.log('[Tone Adjuster] Adding replacement rule...');
      return await handleAddReplacementRule(command.args[0]);
    default:
      console.warn(`[Tone Adjuster] Unknown command: ${command.name}`);
      return { error: `Unknown command: ${command.name}` };
  }
}

// Define schemas for Tone Adjuster tool
export const AdjustTextSchema = z.object({
  text: z.string(),
  toneName: z.string().optional(),
  settings: z.object({
    formality: z.number().min(0).max(100).optional(),
    complexity: z.number().min(0).max(100).optional(),
    emotion: z.number().min(0).max(100).optional(),
    confidence: z.number().min(0).max(100).optional(),
    personalization: z.number().min(0).max(100).optional(),
    enthusiasm: z.number().min(0).max(100).optional(),
    technicality: z.number().min(0).max(100).optional(),
    wordiness: z.number().min(0).max(100).optional()
  }).optional(),
  preserveCasing: z.boolean().optional().default(true),
  preserveFormatting: z.boolean().optional().default(true),
});

export const CreateProfileSchema = z.object({
  name: z.string(),
  type: z.enum([
    'formal', 
    'informal', 
    'friendly', 
    'professional', 
    'technical', 
    'simple', 
    'persuasive', 
    'empathetic', 
    'enthusiastic', 
    'neutral', 
    'custom'
  ]),
  description: z.string(),
  settings: z.object({
    formality: z.number().min(0).max(100),
    complexity: z.number().min(0).max(100),
    emotion: z.number().min(0).max(100),
    confidence: z.number().min(0).max(100),
    personalization: z.number().min(0).max(100),
    enthusiasm: z.number().min(0).max(100),
    technicality: z.number().min(0).max(100),
    wordiness: z.number().min(0).max(100)
  }),
  examples: z.array(z.string()).min(1),
  isDefault: z.boolean().optional(),
  customRules: z.array(z.string()).optional(),
});

export const ListProfilesSchema = z.object({
  includeSettings: z.boolean().optional().default(false),
  includeExamples: z.boolean().optional().default(false),
  type: z.enum([
    'formal', 
    'informal', 
    'friendly', 
    'professional', 
    'technical', 
    'simple', 
    'persuasive', 
    'empathetic', 
    'enthusiastic', 
    'neutral', 
    'custom',
    'all'
  ]).optional().default('all'),
});

export const SetActiveToneSchema = z.object({
  toneName: z.string(),
});

export const GetActiveToneSchema = z.object({
  includeSettings: z.boolean().optional().default(true),
  includeExamples: z.boolean().optional().default(false),
});

export const DeleteProfileSchema = z.object({
  profileName: z.string(),
  force: z.boolean().optional().default(false),
});

export const AddReplacementRuleSchema = z.object({
  pattern: z.string(),
  replacement: z.string(),
  isRegex: z.boolean().optional().default(false),
  caseSensitive: z.boolean().optional().default(true),
  condition: z.object({
    setting: z.enum([
      'formality',
      'complexity',
      'emotion',
      'confidence',
      'personalization',
      'enthusiasm',
      'technicality',
      'wordiness'
    ]),
    operator: z.enum(['>', '<', '>=', '<=', '==']),
    value: z.number().min(0).max(100)
  }).optional(),
});

/**
 * Handles adjusting text tone
 */
async function handleAdjustText(args: any) {
  try {
    const result = AdjustTextSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for adjusting text"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const { text, toneName, settings, preserveCasing, preserveFormatting } = result.data;
    
    // Get tone settings
    let toneSettings: ToneSettings;
    
    if (settings) {
      // Use provided settings
      toneSettings = {
        formality: settings.formality ?? 50,
        complexity: settings.complexity ?? 50,
        emotion: settings.emotion ?? 50,
        confidence: settings.confidence ?? 50,
        personalization: settings.personalization ?? 50,
        enthusiasm: settings.enthusiasm ?? 50,
        technicality: settings.technicality ?? 50,
        wordiness: settings.wordiness ?? 50
      };
    } else if (toneName) {
      // Use named tone profile
      const profileSettings = getToneSettings(toneName);
      
      if (!profileSettings) {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              error: `Tone profile '${toneName}' not found`,
              message: "Failed to adjust text tone",
              availableProfiles: toneProfiles.map(p => p.name)
            }, null, 2)
          }],
          isError: true
        };
      }
      
      toneSettings = profileSettings;
    } else {
      // Use active tone
      const activeSettings = getToneSettings(activeTone);
      
      if (!activeSettings) {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              error: `Active tone profile '${activeTone}' not found`,
              message: "Failed to adjust text tone"
            }, null, 2)
          }],
          isError: true
        };
      }
      
      toneSettings = activeSettings;
    }
    
    // Adjust the text based on tone settings
    const originalCasing = text;
    
    // Convert to lowercase for processing if preserveCasing is false
    const processText = preserveCasing ? text : text.toLowerCase();
    
    // Adjust the text
    const adjustedText = adjustText(processText, toneSettings);
    
    // Create response
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          original: text,
          adjusted: adjustedText,
          toneSettings,
          toneName: toneName || activeTone,
          message: `Successfully adjusted text using the '${toneName || activeTone}' tone`
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to adjust text tone"
        }, null, 2)
      }],
      isError: true
    };
  }
}

/**
 * Handles creating a tone profile
 */
async function handleCreateProfile(args: any) {
  try {
    const result = CreateProfileSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for creating tone profile"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const { name, type, description, settings, examples, isDefault, customRules } = result.data;
    
    // Check if profile with this name already exists
    const existingProfile = toneProfiles.find(p => p.name === name);
    
    if (existingProfile) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: `Tone profile with name '${name}' already exists`,
            message: "Failed to create tone profile"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    // Create new profile
    const newProfile: ToneProfile = {
      name,
      type,
      description,
      settings,
      examples,
      isDefault,
      customRules
    };
    
    // If this is default, update other profiles
    if (isDefault) {
      toneProfiles = toneProfiles.map(profile => ({
        ...profile,
        isDefault: false
      }));
      
      // Also set as active tone
      activeTone = name;
    }
    
    // Add to profiles
    toneProfiles.push(newProfile);
    
    // Save profiles
    await saveProfiles();
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          name,
          type,
          description,
          isDefault,
          isActive: activeTone === name,
          message: `Successfully created tone profile '${name}'`
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to create tone profile"
        }, null, 2)
      }],
      isError: true
    };
  }
}

/**
 * Handles listing tone profiles
 */
async function handleListProfiles(args: any) {
  try {
    const result = ListProfilesSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for listing tone profiles"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const { includeSettings, includeExamples, type } = result.data;
    
    // Filter profiles by type
    let filteredProfiles = toneProfiles;
    
    if (type !== 'all') {
      filteredProfiles = toneProfiles.filter(profile => profile.type === type);
    }
    
    // Format profiles for response
    const formattedProfiles = filteredProfiles.map(profile => {
      const formatted: any = {
        name: profile.name,
        type: profile.type,
        description: profile.description,
        isDefault: profile.isDefault || false,
        isActive: profile.name === activeTone
      };
      
      if (includeSettings) {
        formatted.settings = profile.settings;
      }
      
      if (includeExamples) {
        formatted.examples = profile.examples;
      }
      
      return formatted;
    });
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          profiles: formattedProfiles,
          count: formattedProfiles.length,
          activeTone,
          message: `Found ${formattedProfiles.length} tone profiles`
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to list tone profiles"
        }, null, 2)
      }],
      isError: true
    };
  }
}

/**
 * Handles setting the active tone
 */
async function handleSetActiveTone(args: any) {
  try {
    const result = SetActiveToneSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for setting active tone"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const { toneName } = result.data;
    
    // Check if profile with this name exists
    const existingProfile = toneProfiles.find(p => p.name === toneName);
    
    if (!existingProfile) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: `Tone profile with name '${toneName}' not found`,
            message: "Failed to set active tone",
            availableProfiles: toneProfiles.map(p => p.name)
          }, null, 2)
        }],
        isError: true
      };
    }
    
    // Set active tone
    activeTone = toneName;
    
    // Save profiles
    await saveProfiles();
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          toneName,
          type: existingProfile.type,
          message: `Successfully set active tone to '${toneName}'`
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to set active tone"
        }, null, 2)
      }],
      isError: true
    };
  }
}

/**
 * Handles getting the active tone
 */
async function handleGetActiveTone(args: any) {
  try {
    const result = GetActiveToneSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for getting active tone"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const { includeSettings, includeExamples } = result.data;
    
    // Find active tone profile
    const activeProfile = toneProfiles.find(p => p.name === activeTone);
    
    if (!activeProfile) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: `Active tone profile '${activeTone}' not found`,
            message: "Failed to get active tone"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    // Format profile for response
    const formattedProfile: any = {
      name: activeProfile.name,
      type: activeProfile.type,
      description: activeProfile.description
    };
    
    if (includeSettings) {
      formattedProfile.settings = activeProfile.settings;
    }
    
    if (includeExamples) {
      formattedProfile.examples = activeProfile.examples;
    }
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          profile: formattedProfile,
          message: `Active tone is '${activeTone}'`
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to get active tone"
        }, null, 2)
      }],
      isError: true
    };
  }
}

/**
 * Handles deleting a tone profile
 */
async function handleDeleteProfile(args: any) {
  try {
    const result = DeleteProfileSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for deleting tone profile"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const { profileName, force } = result.data;
    
    // Check if profile exists
    const profileIndex = toneProfiles.findIndex(p => p.name === profileName);
    
    if (profileIndex === -1) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: `Tone profile with name '${profileName}' not found`,
            message: "Failed to delete tone profile",
            availableProfiles: toneProfiles.map(p => p.name)
          }, null, 2)
        }],
        isError: true
      };
    }
    
    // Check if it's a default profile and force is not enabled
    if (!force && DEFAULT_TONE_PROFILES.some(p => p.name === profileName)) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: `'${profileName}' is a default tone profile and cannot be deleted. Use force: true to override.`,
            message: "Failed to delete tone profile"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    // Check if it's the active tone
    if (activeTone === profileName) {
      // Find a new active tone (first default one)
      const newActiveTone = toneProfiles.find(p => p.name !== profileName && p.isDefault);
      
      if (newActiveTone) {
        activeTone = newActiveTone.name;
      } else if (toneProfiles.length > 1) {
        // Just pick another one
        activeTone = toneProfiles.find(p => p.name !== profileName)?.name || 'Simple';
      } else {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              error: `Cannot delete the only tone profile`,
              message: "Failed to delete tone profile"
            }, null, 2)
          }],
          isError: true
        };
      }
    }
    
    // Delete the profile
    toneProfiles.splice(profileIndex, 1);
    
    // Save profiles
    await saveProfiles();
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          profileName,
          newActiveTone: activeTone,
          message: `Successfully deleted tone profile '${profileName}'`
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to delete tone profile"
        }, null, 2)
      }],
      isError: true
    };
  }
}

/**
 * Handles adding a replacement rule
 */
async function handleAddReplacementRule(args: any) {
  try {
    const result = AddReplacementRuleSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for adding replacement rule"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const { pattern, replacement, isRegex, caseSensitive, condition } = result.data;
    
    // Create replacement rule
    const rule: ReplacementRule = {
      pattern: isRegex 
        ? new RegExp(pattern, caseSensitive ? 'g' : 'gi') 
        : pattern,
      replacement
    };
    
    // Add condition if provided
    if (condition) {
      // Create condition function
      const { setting, operator, value } = condition;
      
      rule.condition = (text: string, settings: ToneSettings) => {
        switch (operator) {
          case '>':
            return settings[setting] > value;
          case '<':
            return settings[setting] < value;
          case '>=':
            return settings[setting] >= value;
          case '<=':
            return settings[setting] <= value;
          case '==':
            return settings[setting] === value;
          default:
            return false;
        }
      };
    }
    
    // Add the rule
    customReplacementRules.push(rule);
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          pattern: isRegex ? pattern : rule.pattern,
          replacement,
          isRegex,
          caseSensitive,
          condition: condition ? `${condition.setting} ${condition.operator} ${condition.value}` : null,
          ruleCount: customReplacementRules.length,
          message: `Successfully added replacement rule`
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to add replacement rule"
        }, null, 2)
      }],
      isError: true
    };
  }
}