"use strict";
// Auto-generated boilerplate for theme-switcher
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
exports.GenerateCssSchema = exports.SetAnimationsSchema = exports.GetConfigSchema = exports.AddLayoutSchema = exports.AddThemeSchema = exports.SetLayoutSchema = exports.SetThemeSchema = void 0;
exports.activate = activate;
exports.onFileWrite = onFileWrite;
exports.onSessionStart = onSessionStart;
exports.onCommand = onCommand;
const zod_1 = require("zod");
const fs = __importStar(require("fs/promises"));
const fsSync = __importStar(require("fs"));
const path = __importStar(require("path"));
// Default light theme colors
const DEFAULT_LIGHT_COLORS = {
    primary: '#0070f3',
    secondary: '#6c757d',
    success: '#28a745',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#17a2b8',
    background: '#ffffff',
    surface: '#f8f9fa',
    text: '#212529',
    border: '#dee2e6',
    outline: '#4dabf7',
};
// Default dark theme colors
const DEFAULT_DARK_COLORS = {
    primary: '#3390ff',
    secondary: '#848c94',
    success: '#48c15e',
    danger: '#e35d6a',
    warning: '#ffcf26',
    info: '#3fc8d7',
    background: '#171717',
    surface: '#242424',
    text: '#f8f9fa',
    border: '#495057',
    outline: '#76baff',
};
// Default config
const DEFAULT_CONFIG = {
    colorModes: [
        {
            name: 'light',
            type: 'light',
            colors: DEFAULT_LIGHT_COLORS,
            isDefault: true,
        },
        {
            name: 'dark',
            type: 'dark',
            colors: DEFAULT_DARK_COLORS,
        },
    ],
    layouts: [
        {
            name: 'default',
            type: 'default',
            settings: {
                spacing: 16,
                fontSize: 16,
                containerWidth: '1200px',
                sidebar: {
                    width: '250px',
                    position: 'left',
                },
                header: {
                    height: '64px',
                    fixed: true,
                },
                footer: {
                    height: '80px',
                    fixed: false,
                },
            },
            isDefault: true,
        },
        {
            name: 'compact',
            type: 'compact',
            settings: {
                spacing: 12,
                fontSize: 14,
                containerWidth: '1000px',
                sidebar: {
                    width: '200px',
                    position: 'left',
                },
                header: {
                    height: '48px',
                    fixed: true,
                },
                footer: {
                    height: '60px',
                    fixed: false,
                },
            },
        },
    ],
    activeColorMode: 'light',
    activeLayout: 'default',
    animations: {
        enabled: true,
        speed: 'normal',
    },
    fonts: {
        body: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        headings: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        code: 'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        sizes: {
            base: '16px',
            scale: 1.2,
        },
    },
};
// Default configuration file path
const CONFIG_FILE_PATH = 'theme-config.json';
// Current theme config
let currentConfig = Object.assign({}, DEFAULT_CONFIG);
function activate() {
    console.log("[TOOL] theme-switcher activated");
    // Load existing configuration
    loadConfig();
}
/**
 * Load theme configuration from file
 */
function loadConfig() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (fsSync.existsSync(CONFIG_FILE_PATH)) {
                const configData = yield fs.readFile(CONFIG_FILE_PATH, 'utf8');
                const loadedConfig = JSON.parse(configData);
                // Merge with default config to ensure all properties exist
                currentConfig = Object.assign(Object.assign(Object.assign({}, DEFAULT_CONFIG), loadedConfig), { colorModes: [
                        ...DEFAULT_CONFIG.colorModes,
                        ...(loadedConfig.colorModes || []),
                    ].filter((mode, index, self) => index === self.findIndex(m => m.name === mode.name)), layouts: [
                        ...DEFAULT_CONFIG.layouts,
                        ...(loadedConfig.layouts || []),
                    ].filter((layout, index, self) => index === self.findIndex(l => l.name === layout.name)) });
                console.log(`[Theme Switcher] Loaded configuration from ${CONFIG_FILE_PATH}`);
            }
            else {
                // Create default config file
                yield saveConfig();
                console.log(`[Theme Switcher] Created default configuration at ${CONFIG_FILE_PATH}`);
            }
        }
        catch (error) {
            console.error('[Theme Switcher] Error loading configuration:', error);
        }
    });
}
/**
 * Save theme configuration to file
 */
function saveConfig() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield fs.writeFile(CONFIG_FILE_PATH, JSON.stringify(currentConfig, null, 2), 'utf8');
            console.log(`[Theme Switcher] Saved configuration to ${CONFIG_FILE_PATH}`);
        }
        catch (error) {
            console.error('[Theme Switcher] Error saving configuration:', error);
        }
    });
}
/**
 * Generate CSS variables from a color mode
 */
function generateCssVariables(colorMode) {
    let cssVars = ':root {\n';
    // Add all color variables
    for (const [key, value] of Object.entries(colorMode.colors)) {
        cssVars += `  --color-${key}: ${value};\n`;
    }
    // Add layout variables from current layout
    const layout = currentConfig.layouts.find(l => l.name === currentConfig.activeLayout);
    if (layout) {
        cssVars += `  --spacing-base: ${layout.settings.spacing}px;\n`;
        cssVars += `  --font-size-base: ${layout.settings.fontSize}px;\n`;
        cssVars += `  --container-width: ${layout.settings.containerWidth};\n`;
        if (layout.settings.sidebar) {
            cssVars += `  --sidebar-width: ${layout.settings.sidebar.width};\n`;
        }
        if (layout.settings.header) {
            cssVars += `  --header-height: ${layout.settings.header.height};\n`;
        }
        if (layout.settings.footer) {
            cssVars += `  --footer-height: ${layout.settings.footer.height};\n`;
        }
    }
    // Add animation variables
    cssVars += `  --animation-enabled: ${currentConfig.animations.enabled ? '1' : '0'};\n`;
    const animationSpeed = currentConfig.animations.speed === 'slow' ? '0.4s' :
        currentConfig.animations.speed === 'fast' ? '0.1s' : '0.2s';
    cssVars += `  --animation-duration: ${animationSpeed};\n`;
    // Add font variables
    cssVars += `  --font-family-body: ${currentConfig.fonts.body};\n`;
    cssVars += `  --font-family-headings: ${currentConfig.fonts.headings};\n`;
    cssVars += `  --font-family-code: ${currentConfig.fonts.code};\n`;
    cssVars += `  --font-size-base: ${currentConfig.fonts.sizes.base};\n`;
    cssVars += `  --font-scale: ${currentConfig.fonts.sizes.scale};\n`;
    cssVars += '}\n';
    return cssVars;
}
/**
 * Handles file write events
 */
function onFileWrite(event) {
    // Check if theme config file was modified
    if (path.basename(event.path) === path.basename(CONFIG_FILE_PATH)) {
        console.log(`[Theme Switcher] Theme configuration file changed: ${event.path}`);
        loadConfig();
    }
}
/**
 * Handles session start logic
 */
function onSessionStart(session) {
    console.log(`[Theme Switcher] Session started: ${session.id}`);
    // Reload configuration on session start
    loadConfig();
}
/**
 * Handles theme-switcher commands
 */
function onCommand(command) {
    return __awaiter(this, void 0, void 0, function* () {
        switch (command.name) {
            case 'theme-switcher:set-theme':
                console.log('[Theme Switcher] Setting theme...');
                return yield handleSetTheme(command.args[0]);
            case 'theme-switcher:set-layout':
                console.log('[Theme Switcher] Setting layout...');
                return yield handleSetLayout(command.args[0]);
            case 'theme-switcher:add-theme':
                console.log('[Theme Switcher] Adding theme...');
                return yield handleAddTheme(command.args[0]);
            case 'theme-switcher:add-layout':
                console.log('[Theme Switcher] Adding layout...');
                return yield handleAddLayout(command.args[0]);
            case 'theme-switcher:get-config':
                console.log('[Theme Switcher] Getting configuration...');
                return yield handleGetConfig(command.args[0]);
            case 'theme-switcher:set-animations':
                console.log('[Theme Switcher] Setting animations...');
                return yield handleSetAnimations(command.args[0]);
            case 'theme-switcher:generate-css':
                console.log('[Theme Switcher] Generating CSS...');
                return yield handleGenerateCss(command.args[0]);
            default:
                console.warn(`[Theme Switcher] Unknown command: ${command.name}`);
                return { error: `Unknown command: ${command.name}` };
        }
    });
}
// Define schemas for Theme Switcher tool
exports.SetThemeSchema = zod_1.z.object({
    themeName: zod_1.z.string(),
    persist: zod_1.z.boolean().optional().default(true),
});
exports.SetLayoutSchema = zod_1.z.object({
    layoutName: zod_1.z.string(),
    persist: zod_1.z.boolean().optional().default(true),
});
exports.AddThemeSchema = zod_1.z.object({
    name: zod_1.z.string(),
    type: zod_1.z.enum(['light', 'dark', 'system', 'custom']),
    colors: zod_1.z.record(zod_1.z.string(), zod_1.z.string()),
    isDefault: zod_1.z.boolean().optional().default(false),
});
exports.AddLayoutSchema = zod_1.z.object({
    name: zod_1.z.string(),
    type: zod_1.z.enum(['default', 'compact', 'comfortable', 'wide', 'narrow', 'custom']),
    settings: zod_1.z.object({
        spacing: zod_1.z.number(),
        fontSize: zod_1.z.number(),
        containerWidth: zod_1.z.string(),
        sidebar: zod_1.z.object({
            width: zod_1.z.string(),
            position: zod_1.z.enum(['left', 'right']),
            collapsed: zod_1.z.boolean().optional(),
        }).optional(),
        header: zod_1.z.object({
            height: zod_1.z.string(),
            fixed: zod_1.z.boolean(),
        }).optional(),
        footer: zod_1.z.object({
            height: zod_1.z.string(),
            fixed: zod_1.z.boolean(),
        }).optional(),
    }),
    isDefault: zod_1.z.boolean().optional().default(false),
});
exports.GetConfigSchema = zod_1.z.object({
    includeCss: zod_1.z.boolean().optional().default(false),
});
exports.SetAnimationsSchema = zod_1.z.object({
    enabled: zod_1.z.boolean(),
    speed: zod_1.z.enum(['slow', 'normal', 'fast']).optional(),
});
exports.GenerateCssSchema = zod_1.z.object({
    outputPath: zod_1.z.string().optional(),
    includeCustomProperties: zod_1.z.boolean().optional().default(true),
    minify: zod_1.z.boolean().optional().default(false),
});
/**
 * Handles setting the active theme
 */
function handleSetTheme(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = exports.SetThemeSchema.safeParse(args);
            if (!result.success) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: result.error.format(),
                                message: "Invalid arguments for setting theme"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            const { themeName, persist } = result.data;
            // Check if theme exists
            const theme = currentConfig.colorModes.find(mode => mode.name === themeName);
            if (!theme) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: `Theme '${themeName}' not found`,
                                message: "Failed to set theme",
                                availableThemes: currentConfig.colorModes.map(mode => mode.name)
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            // Update active theme
            currentConfig.activeColorMode = themeName;
            // Persist changes if requested
            if (persist) {
                yield saveConfig();
            }
            // Generate CSS variables
            const css = generateCssVariables(theme);
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            themeName,
                            themeType: theme.type,
                            persist,
                            css: css.substring(0, 500) + (css.length > 500 ? '...' : ''),
                            message: `Successfully set theme to '${themeName}'`
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
                            message: "Failed to set theme"
                        }, null, 2)
                    }],
                isError: true
            };
        }
    });
}
/**
 * Handles setting the active layout
 */
function handleSetLayout(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = exports.SetLayoutSchema.safeParse(args);
            if (!result.success) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: result.error.format(),
                                message: "Invalid arguments for setting layout"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            const { layoutName, persist } = result.data;
            // Check if layout exists
            const layout = currentConfig.layouts.find(l => l.name === layoutName);
            if (!layout) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: `Layout '${layoutName}' not found`,
                                message: "Failed to set layout",
                                availableLayouts: currentConfig.layouts.map(l => l.name)
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            // Update active layout
            currentConfig.activeLayout = layoutName;
            // Persist changes if requested
            if (persist) {
                yield saveConfig();
            }
            // Get active theme to regenerate CSS with new layout
            const theme = currentConfig.colorModes.find(mode => mode.name === currentConfig.activeColorMode);
            const css = theme ? generateCssVariables(theme) : '';
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            layoutName,
                            layoutType: layout.type,
                            persist,
                            layoutSettings: layout.settings,
                            css: css.substring(0, 500) + (css.length > 500 ? '...' : ''),
                            message: `Successfully set layout to '${layoutName}'`
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
                            message: "Failed to set layout"
                        }, null, 2)
                    }],
                isError: true
            };
        }
    });
}
/**
 * Handles adding a new theme
 */
function handleAddTheme(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = exports.AddThemeSchema.safeParse(args);
            if (!result.success) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: result.error.format(),
                                message: "Invalid arguments for adding theme"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            const { name, type, colors, isDefault } = result.data;
            // Check if theme with this name already exists
            const existingTheme = currentConfig.colorModes.find(mode => mode.name === name);
            if (existingTheme) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: `Theme with name '${name}' already exists`,
                                message: "Failed to add theme"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            // Create new theme
            const newTheme = {
                name,
                type,
                colors,
                isDefault
            };
            // If this is default, update other themes
            if (isDefault) {
                currentConfig.colorModes = currentConfig.colorModes.map(mode => (Object.assign(Object.assign({}, mode), { isDefault: false })));
                // Also set as active
                currentConfig.activeColorMode = name;
            }
            // Add to config
            currentConfig.colorModes.push(newTheme);
            // Save changes
            yield saveConfig();
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            name,
                            type,
                            colorCount: Object.keys(colors).length,
                            isDefault,
                            isActive: currentConfig.activeColorMode === name,
                            message: `Successfully added theme '${name}'`
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
                            message: "Failed to add theme"
                        }, null, 2)
                    }],
                isError: true
            };
        }
    });
}
/**
 * Handles adding a new layout
 */
function handleAddLayout(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = exports.AddLayoutSchema.safeParse(args);
            if (!result.success) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: result.error.format(),
                                message: "Invalid arguments for adding layout"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            const { name, type, settings, isDefault } = result.data;
            // Check if layout with this name already exists
            const existingLayout = currentConfig.layouts.find(l => l.name === name);
            if (existingLayout) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: `Layout with name '${name}' already exists`,
                                message: "Failed to add layout"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            // Create new layout
            const newLayout = {
                name,
                type,
                settings,
                isDefault
            };
            // If this is default, update other layouts
            if (isDefault) {
                currentConfig.layouts = currentConfig.layouts.map(layout => (Object.assign(Object.assign({}, layout), { isDefault: false })));
                // Also set as active
                currentConfig.activeLayout = name;
            }
            // Add to config
            currentConfig.layouts.push(newLayout);
            // Save changes
            yield saveConfig();
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            name,
                            type,
                            settings,
                            isDefault,
                            isActive: currentConfig.activeLayout === name,
                            message: `Successfully added layout '${name}'`
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
                            message: "Failed to add layout"
                        }, null, 2)
                    }],
                isError: true
            };
        }
    });
}
/**
 * Handles getting the current configuration
 */
function handleGetConfig(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = exports.GetConfigSchema.safeParse(args);
            if (!result.success) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: result.error.format(),
                                message: "Invalid arguments for getting configuration"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            const { includeCss } = result.data;
            // Get current theme
            const currentTheme = currentConfig.colorModes.find(mode => mode.name === currentConfig.activeColorMode);
            const currentLayout = currentConfig.layouts.find(l => l.name === currentConfig.activeLayout);
            const response = {
                activeTheme: currentConfig.activeColorMode,
                activeLayout: currentConfig.activeLayout,
                themes: currentConfig.colorModes.map(mode => ({
                    name: mode.name,
                    type: mode.type,
                    isDefault: mode.isDefault || false,
                    colorCount: Object.keys(mode.colors).length
                })),
                layouts: currentConfig.layouts.map(layout => ({
                    name: layout.name,
                    type: layout.type,
                    isDefault: layout.isDefault || false
                })),
                animations: currentConfig.animations,
                fonts: currentConfig.fonts
            };
            // Include current theme and layout details
            if (currentTheme) {
                response.currentTheme = Object.assign(Object.assign({}, currentTheme), { colors: currentTheme.colors });
            }
            if (currentLayout) {
                response.currentLayout = currentLayout;
            }
            // Include CSS if requested
            if (includeCss && currentTheme) {
                response.css = generateCssVariables(currentTheme);
            }
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify(Object.assign(Object.assign({}, response), { message: `Retrieved theme configuration: ${currentConfig.activeColorMode} theme, ${currentConfig.activeLayout} layout` }), null, 2)
                    }]
            };
        }
        catch (error) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: String(error),
                            message: "Failed to get theme configuration"
                        }, null, 2)
                    }],
                isError: true
            };
        }
    });
}
/**
 * Handles setting animation settings
 */
function handleSetAnimations(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = exports.SetAnimationsSchema.safeParse(args);
            if (!result.success) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: result.error.format(),
                                message: "Invalid arguments for setting animations"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            const { enabled, speed } = result.data;
            // Update animation settings
            currentConfig.animations.enabled = enabled;
            if (speed) {
                currentConfig.animations.speed = speed;
            }
            // Save changes
            yield saveConfig();
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            animations: currentConfig.animations,
                            message: `Successfully ${enabled ? 'enabled' : 'disabled'} animations${speed ? ` with ${speed} speed` : ''}`
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
                            message: "Failed to set animations"
                        }, null, 2)
                    }],
                isError: true
            };
        }
    });
}
/**
 * Handles generating CSS from the current theme
 */
function handleGenerateCss(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = exports.GenerateCssSchema.safeParse(args);
            if (!result.success) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: result.error.format(),
                                message: "Invalid arguments for generating CSS"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            const { outputPath, includeCustomProperties, minify } = result.data;
            // Get current theme
            const currentTheme = currentConfig.colorModes.find(mode => mode.name === currentConfig.activeColorMode);
            if (!currentTheme) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: `Current theme '${currentConfig.activeColorMode}' not found`,
                                message: "Failed to generate CSS"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            // Generate CSS
            let css = '';
            // Add CSS variables if requested
            if (includeCustomProperties) {
                css += generateCssVariables(currentTheme);
            }
            // Generate utility classes based on theme
            css += generateUtilityClasses(currentTheme);
            // Generate layout classes
            css += generateLayoutClasses();
            // Minify if requested
            if (minify) {
                css = minifyCss(css);
            }
            // Write to file if specified
            if (outputPath) {
                // Create directory if it doesn't exist
                const dir = path.dirname(outputPath);
                if (!fsSync.existsSync(dir)) {
                    yield fs.mkdir(dir, { recursive: true });
                }
                yield fs.writeFile(outputPath, css, 'utf8');
            }
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            themeName: currentTheme.name,
                            themeType: currentTheme.type,
                            layoutName: currentConfig.activeLayout,
                            css: css.substring(0, 1000) + (css.length > 1000 ? '...' : ''),
                            outputPath,
                            minified: minify,
                            message: outputPath
                                ? `Generated CSS file at ${outputPath}`
                                : 'Generated CSS from current theme'
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
                            message: "Failed to generate CSS"
                        }, null, 2)
                    }],
                isError: true
            };
        }
    });
}
/**
 * Generate utility classes based on theme
 */
function generateUtilityClasses(theme) {
    let css = '\n/* Utility classes */\n';
    // Color utilities
    for (const [key, value] of Object.entries(theme.colors)) {
        css += `.text-${key} { color: var(--color-${key}); }\n`;
        css += `.bg-${key} { background-color: var(--color-${key}); }\n`;
        css += `.border-${key} { border-color: var(--color-${key}); }\n`;
    }
    // Current layout
    const layout = currentConfig.layouts.find(l => l.name === currentConfig.activeLayout);
    if (layout) {
        // Spacing utilities
        css += '\n/* Spacing utilities */\n';
        for (let i = 0; i <= 5; i++) {
            const value = layout.settings.spacing * i;
            css += `.p-${i} { padding: ${value}px; }\n`;
            css += `.pt-${i} { padding-top: ${value}px; }\n`;
            css += `.pr-${i} { padding-right: ${value}px; }\n`;
            css += `.pb-${i} { padding-bottom: ${value}px; }\n`;
            css += `.pl-${i} { padding-left: ${value}px; }\n`;
            css += `.px-${i} { padding-left: ${value}px; padding-right: ${value}px; }\n`;
            css += `.py-${i} { padding-top: ${value}px; padding-bottom: ${value}px; }\n`;
            css += `.m-${i} { margin: ${value}px; }\n`;
            css += `.mt-${i} { margin-top: ${value}px; }\n`;
            css += `.mr-${i} { margin-right: ${value}px; }\n`;
            css += `.mb-${i} { margin-bottom: ${value}px; }\n`;
            css += `.ml-${i} { margin-left: ${value}px; }\n`;
            css += `.mx-${i} { margin-left: ${value}px; margin-right: ${value}px; }\n`;
            css += `.my-${i} { margin-top: ${value}px; margin-bottom: ${value}px; }\n`;
        }
        // Font size utilities
        css += '\n/* Font size utilities */\n';
        // Base font size
        css += `.text-base { font-size: var(--font-size-base); }\n`;
        // Smaller sizes
        css += `.text-xs { font-size: calc(var(--font-size-base) / var(--font-scale) / var(--font-scale)); }\n`;
        css += `.text-sm { font-size: calc(var(--font-size-base) / var(--font-scale)); }\n`;
        // Larger sizes
        css += `.text-lg { font-size: calc(var(--font-size-base) * var(--font-scale)); }\n`;
        css += `.text-xl { font-size: calc(var(--font-size-base) * var(--font-scale) * var(--font-scale)); }\n`;
        css += `.text-2xl { font-size: calc(var(--font-size-base) * var(--font-scale) * var(--font-scale) * var(--font-scale)); }\n`;
    }
    return css;
}
/**
 * Generate layout classes
 */
function generateLayoutClasses() {
    let css = '\n/* Layout classes */\n';
    // Container
    css += `.container {\n`;
    css += `  width: 100%;\n`;
    css += `  max-width: var(--container-width);\n`;
    css += `  margin-left: auto;\n`;
    css += `  margin-right: auto;\n`;
    css += `  padding-left: var(--spacing-base);\n`;
    css += `  padding-right: var(--spacing-base);\n`;
    css += `}\n`;
    // Body and typography
    css += `body {\n`;
    css += `  font-family: var(--font-family-body);\n`;
    css += `  font-size: var(--font-size-base);\n`;
    css += `  line-height: 1.5;\n`;
    css += `  color: var(--color-text);\n`;
    css += `  background-color: var(--color-background);\n`;
    css += `}\n`;
    css += `h1, h2, h3, h4, h5, h6 {\n`;
    css += `  font-family: var(--font-family-headings);\n`;
    css += `  margin-top: 0;\n`;
    css += `  margin-bottom: var(--spacing-base);\n`;
    css += `  line-height: 1.2;\n`;
    css += `}\n`;
    css += `code, pre {\n`;
    css += `  font-family: var(--font-family-code);\n`;
    css += `}\n`;
    // Animation utilities
    css += `*[data-animate] {\n`;
    css += `  transition-duration: var(--animation-duration);\n`;
    css += `  transition-property: opacity, transform;\n`;
    css += `  transition-timing-function: ease-in-out;\n`;
    css += `}\n`;
    css += `*[data-animate="fade"] {\n`;
    css += `  opacity: 0;\n`;
    css += `}\n`;
    css += `*[data-animate="fade"].in-view {\n`;
    css += `  opacity: 1;\n`;
    css += `}\n`;
    css += `*[data-animate="slide-up"] {\n`;
    css += `  opacity: 0;\n`;
    css += `  transform: translateY(20px);\n`;
    css += `}\n`;
    css += `*[data-animate="slide-up"].in-view {\n`;
    css += `  opacity: 1;\n`;
    css += `  transform: translateY(0);\n`;
    css += `}\n`;
    // Layout specific classes
    const layout = currentConfig.layouts.find(l => l.name === currentConfig.activeLayout);
    if (layout) {
        if (layout.settings.sidebar) {
            css += `.sidebar {\n`;
            css += `  width: var(--sidebar-width);\n`;
            css += `  position: fixed;\n`;
            css += `  top: 0;\n`;
            css += `  ${layout.settings.sidebar.position}: 0;\n`;
            css += `  bottom: 0;\n`;
            css += `  z-index: 1000;\n`;
            css += `  overflow-y: auto;\n`;
            css += `  background-color: var(--color-surface);\n`;
            css += `  border-${layout.settings.sidebar.position === 'left' ? 'right' : 'left'}: 1px solid var(--color-border);\n`;
            css += `}\n`;
            if (layout.settings.sidebar.collapsed) {
                css += `.sidebar.collapsed {\n`;
                css += `  width: 60px;\n`;
                css += `}\n`;
            }
            // Main content with sidebar
            css += `.main-content {\n`;
            css += `  margin-${layout.settings.sidebar.position}: var(--sidebar-width);\n`;
            css += `}\n`;
            if (layout.settings.sidebar.collapsed) {
                css += `.main-content.sidebar-collapsed {\n`;
                css += `  margin-${layout.settings.sidebar.position}: 60px;\n`;
                css += `}\n`;
            }
        }
        if (layout.settings.header) {
            css += `.header {\n`;
            css += `  height: var(--header-height);\n`;
            css += `  ${layout.settings.header.fixed ? 'position: fixed;' : ''}\n`;
            css += `  ${layout.settings.header.fixed ? 'top: 0;' : ''}\n`;
            css += `  ${layout.settings.header.fixed ? 'left: 0;' : ''}\n`;
            css += `  ${layout.settings.header.fixed ? 'right: 0;' : ''}\n`;
            css += `  ${layout.settings.header.fixed ? 'z-index: 1000;' : ''}\n`;
            css += `  background-color: var(--color-surface);\n`;
            css += `  border-bottom: 1px solid var(--color-border);\n`;
            css += `}\n`;
            if (layout.settings.header.fixed) {
                css += `body {\n`;
                css += `  padding-top: var(--header-height);\n`;
                css += `}\n`;
            }
        }
        if (layout.settings.footer) {
            css += `.footer {\n`;
            css += `  height: var(--footer-height);\n`;
            css += `  ${layout.settings.footer.fixed ? 'position: fixed;' : ''}\n`;
            css += `  ${layout.settings.footer.fixed ? 'bottom: 0;' : ''}\n`;
            css += `  ${layout.settings.footer.fixed ? 'left: 0;' : ''}\n`;
            css += `  ${layout.settings.footer.fixed ? 'right: 0;' : ''}\n`;
            css += `  ${layout.settings.footer.fixed ? 'z-index: 1000;' : ''}\n`;
            css += `  background-color: var(--color-surface);\n`;
            css += `  border-top: 1px solid var(--color-border);\n`;
            css += `}\n`;
            if (layout.settings.footer.fixed) {
                css += `body {\n`;
                css += `  padding-bottom: var(--footer-height);\n`;
                css += `}\n`;
            }
        }
    }
    return css;
}
/**
 * Very basic CSS minifier
 */
function minifyCss(css) {
    // Remove comments
    css = css.replace(/\/\*[\s\S]*?\*\//g, '');
    // Remove unnecessary whitespace
    css = css.replace(/\s+/g, ' ');
    css = css.replace(/\s*([:;{}])\s*/g, '$1');
    css = css.replace(/;}/g, '}');
    // Remove trailing semicolons
    css = css.replace(/;\}/g, '}');
    // Remove extra spaces
    css = css.trim();
    return css;
}
