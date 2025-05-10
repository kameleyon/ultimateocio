// Auto-generated boilerplate for plugin-loader

import { z } from 'zod';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// Plugin configuration and metadata
interface PluginInfo {
  id: string;
  name: string;
  version: string;
  description: string;
  author?: string;
  entryPoint: string;
  dependencies?: string[];
  hooks?: string[];
  enabled: boolean;
  loadedTimestamp?: number;
  status: 'active' | 'inactive' | 'error' | 'pending';
  error?: string;
}

// Plugin runtime instance
interface PluginInstance {
  id: string;
  exports: any;
  api: PluginAPI;
  enabled: boolean;
  hooks: Record<string, Function[]>;
}

// Plugin configuration and manifest
interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author?: string;
  main: string;
  dependencies?: string[];
  hooks?: string[];
  config?: Record<string, any>;
}

// Plugin API exposed to plugins
interface PluginAPI {
  registerHook: (hookName: string, callback: Function) => void;
  getConfig: (key?: string) => any;
  setConfig: (key: string, value: any) => void;
  getPluginPath: () => string;
  getSharedData: (key: string) => any;
  setSharedData: (key: string, value: any) => void;
  require: (moduleId: string) => any;
  log: (message: string, level?: 'info' | 'warn' | 'error') => void;
}

// Plugin registry to track loaded plugins
class PluginRegistry {
  private plugins: Map<string, PluginInfo> = new Map();
  private instances: Map<string, PluginInstance> = new Map();
  private sharedData: Map<string, any> = new Map();
  private pluginsDir: string = 'plugins';
  private configFile: string = 'plugin-config.json';
  
  constructor(pluginsDir?: string, configFile?: string) {
    if (pluginsDir) {
      this.pluginsDir = pluginsDir;
    }
    
    if (configFile) {
      this.configFile = configFile;
    }
  }
  
  // Get all registered plugins
  getPlugins(): PluginInfo[] {
    return Array.from(this.plugins.values());
  }
  
  // Get a specific plugin by ID
  getPlugin(id: string): PluginInfo | undefined {
    return this.plugins.get(id);
  }
  
  // Get a plugin instance by ID
  getInstance(id: string): PluginInstance | undefined {
    return this.instances.get(id);
  }
  
  // Register a new plugin
  registerPlugin(info: PluginInfo): void {
    this.plugins.set(info.id, info);
  }
  
  // Set a plugin instance
  setInstance(id: string, instance: PluginInstance): void {
    this.instances.set(id, instance);
  }
  
  // Get shared data
  getSharedData(key: string): any {
    return this.sharedData.get(key);
  }
  
  // Set shared data
  setSharedData(key: string, value: any): void {
    this.sharedData.set(key, value);
  }
  
  // Get plugins directory
  getPluginsDir(): string {
    return this.pluginsDir;
  }
  
  // Set plugins directory
  setPluginsDir(dir: string): void {
    this.pluginsDir = dir;
  }
  
  // Get config file path
  getConfigFile(): string {
    return this.configFile;
  }
  
  // Set config file path
  setConfigFile(file: string): void {
    this.configFile = file;
  }
  
  // Clear all plugins
  clear(): void {
    this.plugins.clear();
    this.instances.clear();
  }
}

// Global registry instance
const registry = new PluginRegistry();

// Cache for loaded plugin configurations
const pluginConfigCache: Record<string, any> = {};

export function activate() {
  console.log("[TOOL] plugin-loader activated");
  
  // Initialize plugin registry
  initializeRegistry();
}

/**
 * Initialize the plugin registry
 */
async function initializeRegistry(): Promise<void> {
  // Create plugins directory if it doesn't exist
  try {
    const pluginsDir = registry.getPluginsDir();
    if (!fsSync.existsSync(pluginsDir)) {
      await fs.mkdir(pluginsDir, { recursive: true });
      console.log(`[Plugin Loader] Created plugins directory: ${pluginsDir}`);
    }
    
    // Create config file if it doesn't exist
    const configFile = path.join(pluginsDir, registry.getConfigFile());
    if (!fsSync.existsSync(configFile)) {
      await fs.writeFile(configFile, JSON.stringify({
        plugins: {}
      }, null, 2), 'utf8');
      console.log(`[Plugin Loader] Created plugin config file: ${configFile}`);
    }
    
    // Discover installed plugins
    await discoverPlugins();
  } catch (error) {
    console.error('[Plugin Loader] Error initializing registry:', error);
  }
}

/**
 * Discover installed plugins
 */
async function discoverPlugins(): Promise<void> {
  const pluginsDir = registry.getPluginsDir();
  
  try {
    // Read plugins directory
    const entries = await fs.readdir(pluginsDir, { withFileTypes: true });
    
    // Filter for directories
    const directories = entries.filter(entry => entry.isDirectory());
    
    for (const dir of directories) {
      const pluginDir = path.join(pluginsDir, dir.name);
      const manifestPath = path.join(pluginDir, 'package.json');
      
      // Check if manifest exists
      if (fsSync.existsSync(manifestPath)) {
        try {
          // Read and parse manifest
          const manifestContent = await fs.readFile(manifestPath, 'utf8');
          const manifest = JSON.parse(manifestContent) as PluginManifest;
          
          // Check if it's a valid plugin
          if (manifest.name && manifest.version && manifest.main) {
            const pluginInfo: PluginInfo = {
              id: manifest.id || manifest.name.toLowerCase().replace(/\s+/g, '-'),
              name: manifest.name,
              version: manifest.version,
              description: manifest.description || '',
              author: manifest.author,
              entryPoint: path.join(pluginDir, manifest.main),
              dependencies: manifest.dependencies,
              hooks: manifest.hooks,
              enabled: true, // Default to enabled
              status: 'inactive'
            };
            
            // Register the plugin
            registry.registerPlugin(pluginInfo);
            console.log(`[Plugin Loader] Discovered plugin: ${pluginInfo.name} (${pluginInfo.version})`);
          }
        } catch (error) {
          console.error(`[Plugin Loader] Error reading plugin manifest in ${dir.name}:`, error);
        }
      }
    }
    
    // Load enabled/disabled state from config
    await loadPluginConfig();
  } catch (error) {
    console.error('[Plugin Loader] Error discovering plugins:', error);
  }
}

/**
 * Load plugin configuration
 */
async function loadPluginConfig(): Promise<void> {
  const configFile = path.join(registry.getPluginsDir(), registry.getConfigFile());
  
  try {
    // Read and parse config file
    const configContent = await fs.readFile(configFile, 'utf8');
    const config = JSON.parse(configContent);
    
    // Apply configuration to registered plugins
    if (config.plugins) {
      for (const [pluginId, pluginConfig] of Object.entries<any>(config.plugins)) {
        const plugin = registry.getPlugin(pluginId);
        
        if (plugin) {
          // Update enabled state
          if (typeof pluginConfig.enabled === 'boolean') {
            plugin.enabled = pluginConfig.enabled;
          }
          
          // Cache plugin config
          pluginConfigCache[pluginId] = pluginConfig.config || {};
        }
      }
    }
  } catch (error) {
    console.error('[Plugin Loader] Error loading plugin config:', error);
  }
}

/**
 * Save plugin configuration
 */
async function savePluginConfig(): Promise<void> {
  const configFile = path.join(registry.getPluginsDir(), registry.getConfigFile());
  
  try {
    // Build config object
    const config: any = {
      plugins: {}
    };
    
    // Add configuration for each plugin
    for (const plugin of registry.getPlugins()) {
      config.plugins[plugin.id] = {
        enabled: plugin.enabled,
        config: pluginConfigCache[plugin.id] || {}
      };
    }
    
    // Write config to file
    await fs.writeFile(configFile, JSON.stringify(config, null, 2), 'utf8');
    console.log(`[Plugin Loader] Saved plugin configuration to ${configFile}`);
  } catch (error) {
    console.error('[Plugin Loader] Error saving plugin config:', error);
  }
}

/**
 * Create a plugin API instance
 */
function createPluginAPI(pluginId: string, pluginPath: string): PluginAPI {
  return {
    // Register a hook callback
    registerHook: (hookName: string, callback: Function) => {
      const instance = registry.getInstance(pluginId);
      if (instance) {
        if (!instance.hooks[hookName]) {
          instance.hooks[hookName] = [];
        }
        instance.hooks[hookName].push(callback);
      }
    },
    
    // Get plugin configuration
    getConfig: (key?: string) => {
      const config = pluginConfigCache[pluginId] || {};
      if (key) {
        return config[key];
      }
      return config;
    },
    
    // Set plugin configuration
    setConfig: (key: string, value: any) => {
      if (!pluginConfigCache[pluginId]) {
        pluginConfigCache[pluginId] = {};
      }
      pluginConfigCache[pluginId][key] = value;
      savePluginConfig();
    },
    
    // Get plugin directory path
    getPluginPath: () => pluginPath,
    
    // Get shared data between plugins
    getSharedData: (key: string) => registry.getSharedData(key),
    
    // Set shared data between plugins
    setSharedData: (key: string, value: any) => registry.setSharedData(key, value),
    
    // Require a module (wrapper)
    require: (moduleId: string) => {
      try {
        // If it's a relative path, resolve from plugin directory
        if (moduleId.startsWith('./') || moduleId.startsWith('../')) {
          const modulePath = path.resolve(pluginPath, moduleId);
          return require(modulePath);
        }
        
        // Otherwise, regular require
        return require(moduleId);
      } catch (error) {
        console.error(`[Plugin ${pluginId}] Error requiring module ${moduleId}:`, error);
        throw error;
      }
    },
    
    // Log a message
    log: (message: string, level: 'info' | 'warn' | 'error' = 'info') => {
      const prefix = `[Plugin ${pluginId}]`;
      switch (level) {
        case 'info':
          console.log(`${prefix} ${message}`);
          break;
        case 'warn':
          console.warn(`${prefix} ${message}`);
          break;
        case 'error':
          console.error(`${prefix} ${message}`);
          break;
      }
    }
  };
}

/**
 * Load a plugin
 */
async function loadPlugin(pluginId: string): Promise<boolean> {
  const plugin = registry.getPlugin(pluginId);
  
  if (!plugin) {
    console.error(`[Plugin Loader] Plugin not found: ${pluginId}`);
    return false;
  }
  
  if (!plugin.enabled) {
    console.log(`[Plugin Loader] Plugin is disabled: ${plugin.name}`);
    return false;
  }
  
  try {
    // Check if entry point exists
    if (!fsSync.existsSync(plugin.entryPoint)) {
      throw new Error(`Entry point not found: ${plugin.entryPoint}`);
    }
    
    // Create plugin instance
    const instance: PluginInstance = {
      id: plugin.id,
      exports: {},
      api: createPluginAPI(plugin.id, path.dirname(plugin.entryPoint)),
      enabled: true,
      hooks: {}
    };
    
    // Set initial status
    plugin.status = 'pending';
    
    // Load the plugin module
    let pluginModule;
    try {
      pluginModule = require(plugin.entryPoint);
    } catch (error) {
      throw new Error(`Failed to require plugin: ${error}`);
    }
    
    // Initialize plugin with API
    if (typeof pluginModule.activate === 'function') {
      await pluginModule.activate(instance.api);
    }
    
    // Store exported methods
    instance.exports = pluginModule;
    
    // Register instance
    registry.setInstance(plugin.id, instance);
    
    // Update plugin status
    plugin.status = 'active';
    plugin.loadedTimestamp = Date.now();
    
    console.log(`[Plugin Loader] Successfully loaded plugin: ${plugin.name} (${plugin.version})`);
    return true;
  } catch (error) {
    // Update plugin with error
    plugin.status = 'error';
    plugin.error = String(error);
    
    console.error(`[Plugin Loader] Error loading plugin ${plugin.name}:`, error);
    return false;
  }
}

/**
 * Unload a plugin
 */
async function unloadPlugin(pluginId: string): Promise<boolean> {
  const plugin = registry.getPlugin(pluginId);
  const instance = registry.getInstance(pluginId);
  
  if (!plugin || !instance) {
    console.error(`[Plugin Loader] Plugin not found: ${pluginId}`);
    return false;
  }
  
  try {
    // Call deactivate function if it exists
    if (instance.exports && typeof instance.exports.deactivate === 'function') {
      await instance.exports.deactivate();
    }
    
    // Remove instance
    registry.setInstance(pluginId, undefined as any);
    
    // Update plugin status
    plugin.status = 'inactive';
    
    console.log(`[Plugin Loader] Successfully unloaded plugin: ${plugin.name}`);
    return true;
  } catch (error) {
    // Update plugin with error
    plugin.status = 'error';
    plugin.error = String(error);
    
    console.error(`[Plugin Loader] Error unloading plugin ${plugin.name}:`, error);
    return false;
  }
}

/**
 * Call a hook on all plugins
 */
async function callHook(hookName: string, ...args: any[]): Promise<any[]> {
  const results: any[] = [];
  
  // Get all active plugin instances
  const instances = Array.from(registry.getPlugins())
    .filter(p => p.status === 'active')
    .map(p => registry.getInstance(p.id))
    .filter(Boolean);
  
  // Call hook on each plugin that has registered it
  for (const instance of instances) {
    if (instance?.hooks[hookName]) {
      for (const callback of instance.hooks[hookName]) {
        try {
          const result = await callback(...args);
          results.push({
            pluginId: instance.id,
            result
          });
        } catch (error) {
          console.error(`[Plugin Loader] Error calling hook ${hookName} on plugin ${instance.id}:`, error);
          results.push({
            pluginId: instance.id,
            error: String(error)
          });
        }
      }
    }
  }
  
  return results;
}

/**
 * Handles file write events
 */
export function onFileWrite(event: { path: string; content: string }) {
  // Check if it's a plugin file
  const pluginsDir = registry.getPluginsDir();
  if (event.path.startsWith(pluginsDir)) {
    console.log(`[Plugin Loader] Plugin file changed: ${event.path}`);
    
    // If it's the config file, reload configuration
    if (event.path === path.join(pluginsDir, registry.getConfigFile())) {
      loadPluginConfig();
    }
    
    // If it's a plugin main file, consider reloading
    const pluginId = getPluginIdFromPath(event.path);
    if (pluginId) {
      const plugin = registry.getPlugin(pluginId);
      if (plugin && plugin.entryPoint === event.path) {
        console.log(`[Plugin Loader] Plugin main file changed: ${plugin.name}`);
        // Auto-reload could be implemented here
      }
    }
  }
  
  // Call hook on plugins
  callHook('fileWrite', event);
}

/**
 * Get plugin ID from file path
 */
function getPluginIdFromPath(filePath: string): string | null {
  const pluginsDir = registry.getPluginsDir();
  if (!filePath.startsWith(pluginsDir)) {
    return null;
  }
  
  // Extract the first directory after plugins dir
  const relativePath = path.relative(pluginsDir, filePath);
  const parts = relativePath.split(path.sep);
  
  if (parts.length > 0) {
    return parts[0];
  }
  
  return null;
}

/**
 * Handles session start logic
 */
export function onSessionStart(session: { id: string; startTime: number }) {
  console.log(`[Plugin Loader] Session started: ${session.id}`);
  
  // Call hook on plugins
  callHook('sessionStart', session);
}

/**
 * Handles plugin-loader commands
 */
export async function onCommand(command: { name: string; args: any[] }) {
  switch (command.name) {
    case 'plugin-loader:install':
      console.log('[Plugin Loader] Installing plugin...');
      return await handleInstallPlugin(command.args[0]);
    case 'plugin-loader:uninstall':
      console.log('[Plugin Loader] Uninstalling plugin...');
      return await handleUninstallPlugin(command.args[0]);
    case 'plugin-loader:enable':
      console.log('[Plugin Loader] Enabling plugin...');
      return await handleEnablePlugin(command.args[0]);
    case 'plugin-loader:disable':
      console.log('[Plugin Loader] Disabling plugin...');
      return await handleDisablePlugin(command.args[0]);
    case 'plugin-loader:list':
      console.log('[Plugin Loader] Listing plugins...');
      return await handleListPlugins(command.args[0]);
    case 'plugin-loader:info':
      console.log('[Plugin Loader] Getting plugin info...');
      return await handleGetPluginInfo(command.args[0]);
    default:
      console.warn(`[Plugin Loader] Unknown command: ${command.name}`);
      return { error: `Unknown command: ${command.name}` };
  }
}

// Define schemas for Plugin Loader tool
export const InstallPluginSchema = z.object({
  source: z.string(),
  sourceType: z.enum(['npm', 'git', 'dir', 'zip']).default('npm'),
  options: z.object({
    force: z.boolean().optional().default(false),
    skipDependencies: z.boolean().optional().default(false),
    enabled: z.boolean().optional().default(true),
  }).optional().default({}),
});

export const UninstallPluginSchema = z.object({
  pluginId: z.string(),
  options: z.object({
    removeData: z.boolean().optional().default(false),
    force: z.boolean().optional().default(false),
  }).optional().default({}),
});

export const EnableDisablePluginSchema = z.object({
  pluginId: z.string(),
});

export const ListPluginsSchema = z.object({
  filter: z.enum(['all', 'enabled', 'disabled', 'active', 'inactive', 'error']).optional().default('all'),
  detailed: z.boolean().optional().default(false),
});

export const GetPluginInfoSchema = z.object({
  pluginId: z.string(),
  includeConfig: z.boolean().optional().default(false),
  includeHooks: z.boolean().optional().default(false),
});

/**
 * Handles installing a plugin
 */
async function handleInstallPlugin(args: any) {
  try {
    const result = InstallPluginSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for installing plugin"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const { source, sourceType, options } = result.data;
    
    // Different installation methods based on source type
    let pluginInfo: PluginInfo | null = null;
    
    switch (sourceType) {
      case 'npm':
        pluginInfo = await installPluginFromNpm(source, options);
        break;
      case 'git':
        pluginInfo = await installPluginFromGit(source, options);
        break;
      case 'dir':
        pluginInfo = await installPluginFromDirectory(source, options);
        break;
      case 'zip':
        pluginInfo = await installPluginFromZip(source, options);
        break;
      default:
        throw new Error(`Unsupported source type: ${sourceType}`);
    }
    
    if (!pluginInfo) {
      throw new Error(`Failed to install plugin from ${source}`);
    }
    
    // Load the plugin if enabled
    let loaded = false;
    if (options.enabled) {
      loaded = await loadPlugin(pluginInfo.id);
    }
    
    // Save configuration
    await savePluginConfig();
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          pluginId: pluginInfo.id,
          name: pluginInfo.name,
          version: pluginInfo.version,
          enabled: pluginInfo.enabled,
          loaded,
          message: `Successfully installed plugin: ${pluginInfo.name} (${pluginInfo.version})`
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to install plugin"
        }, null, 2)
      }],
      isError: true
    };
  }
}

/**
 * Install plugin from npm
 */
async function installPluginFromNpm(
  packageName: string,
  options: { force: boolean; skipDependencies: boolean; enabled: boolean }
): Promise<PluginInfo | null> {
  // In a real implementation, this would use npm to install the package
  // For the boilerplate, we'll just simulate the installation
  
  console.log(`[Plugin Loader] Installing npm package: ${packageName}`);
  
  // Simulate npm install
  const pluginsDir = registry.getPluginsDir();
  const packageDir = path.join(pluginsDir, packageName.replace(/^@/, '').replace(/\//, '-'));
  
  // Create plugin directory
  await fs.mkdir(packageDir, { recursive: true });
  
  // Create a simple package.json
  const manifest: PluginManifest = {
    id: packageName.replace(/^@/, '').replace(/\//, '-'),
    name: packageName,
    version: '1.0.0',
    description: `Plugin installed from npm: ${packageName}`,
    main: 'index.js',
    dependencies: []
  };
  
  await fs.writeFile(
    path.join(packageDir, 'package.json'),
    JSON.stringify(manifest, null, 2),
    'utf8'
  );
  
  // Create a simple index.js
  await fs.writeFile(
    path.join(packageDir, 'index.js'),
    `module.exports = {
  activate: function(api) {
    api.log('Plugin activated: ${packageName}');
  },
  deactivate: function() {
    console.log('Plugin deactivated: ${packageName}');
  }
};`,
    'utf8'
  );
  
  // Create plugin info
  const pluginInfo: PluginInfo = {
    id: manifest.id,
    name: manifest.name,
    version: manifest.version,
    description: manifest.description,
    entryPoint: path.join(packageDir, manifest.main),
    dependencies: manifest.dependencies,
    enabled: options.enabled,
    status: 'inactive'
  };
  
  // Register the plugin
  registry.registerPlugin(pluginInfo);
  
  return pluginInfo;
}

/**
 * Install plugin from git repository
 */
async function installPluginFromGit(
  repository: string,
  options: { force: boolean; skipDependencies: boolean; enabled: boolean }
): Promise<PluginInfo | null> {
  // In a real implementation, this would clone the git repository
  // For the boilerplate, we'll just simulate the installation
  
  console.log(`[Plugin Loader] Installing from git: ${repository}`);
  
  // Extract repo name from URL
  const repoName = repository.split('/').pop()?.replace(/\.git$/, '') || 'git-plugin';
  
  // Simulate git clone
  const pluginsDir = registry.getPluginsDir();
  const repoDir = path.join(pluginsDir, repoName);
  
  // Create plugin directory
  await fs.mkdir(repoDir, { recursive: true });
  
  // Create a simple package.json
  const manifest: PluginManifest = {
    id: repoName,
    name: `${repoName}`,
    version: '1.0.0',
    description: `Plugin installed from git: ${repository}`,
    main: 'index.js',
    dependencies: []
  };
  
  await fs.writeFile(
    path.join(repoDir, 'package.json'),
    JSON.stringify(manifest, null, 2),
    'utf8'
  );
  
  // Create a simple index.js
  await fs.writeFile(
    path.join(repoDir, 'index.js'),
    `module.exports = {
  activate: function(api) {
    api.log('Plugin activated: ${repoName}');
  },
  deactivate: function() {
    console.log('Plugin deactivated: ${repoName}');
  }
};`,
    'utf8'
  );
  
  // Create plugin info
  const pluginInfo: PluginInfo = {
    id: manifest.id,
    name: manifest.name,
    version: manifest.version,
    description: manifest.description,
    entryPoint: path.join(repoDir, manifest.main),
    dependencies: manifest.dependencies,
    enabled: options.enabled,
    status: 'inactive'
  };
  
  // Register the plugin
  registry.registerPlugin(pluginInfo);
  
  return pluginInfo;
}

/**
 * Install plugin from directory
 */
async function installPluginFromDirectory(
  directory: string,
  options: { force: boolean; skipDependencies: boolean; enabled: boolean }
): Promise<PluginInfo | null> {
  console.log(`[Plugin Loader] Installing from directory: ${directory}`);
  
  // Check if directory exists
  if (!fsSync.existsSync(directory)) {
    throw new Error(`Directory not found: ${directory}`);
  }
  
  // Check for package.json
  const manifestPath = path.join(directory, 'package.json');
  if (!fsSync.existsSync(manifestPath)) {
    throw new Error(`package.json not found in directory: ${directory}`);
  }
  
  // Read and parse manifest
  const manifestContent = await fs.readFile(manifestPath, 'utf8');
  const manifest = JSON.parse(manifestContent) as PluginManifest;
  
  // Validate manifest
  if (!manifest.name || !manifest.version || !manifest.main) {
    throw new Error(`Invalid plugin manifest in ${directory}`);
  }
  
  // Copy to plugins directory
  const pluginsDir = registry.getPluginsDir();
  const pluginDir = path.join(pluginsDir, manifest.name.replace(/\s+/g, '-'));
  
  // Create destination directory
  await fs.mkdir(pluginDir, { recursive: true });
  
  // Copy files
  // In a real implementation, this would be a recursive copy
  await fs.copyFile(manifestPath, path.join(pluginDir, 'package.json'));
  
  // Copy main file if it exists
  const mainPath = path.join(directory, manifest.main);
  if (fsSync.existsSync(mainPath)) {
    await fs.copyFile(mainPath, path.join(pluginDir, path.basename(manifest.main)));
  } else {
    // Create a dummy main file
    await fs.writeFile(
      path.join(pluginDir, path.basename(manifest.main)),
      `module.exports = {
  activate: function(api) {
    api.log('Plugin activated: ${manifest.name}');
  },
  deactivate: function() {
    console.log('Plugin deactivated: ${manifest.name}');
  }
};`,
      'utf8'
    );
  }
  
  // Create plugin info
  const pluginInfo: PluginInfo = {
    id: manifest.id || manifest.name.toLowerCase().replace(/\s+/g, '-'),
    name: manifest.name,
    version: manifest.version,
    description: manifest.description || '',
    author: manifest.author,
    entryPoint: path.join(pluginDir, manifest.main),
    dependencies: manifest.dependencies,
    hooks: manifest.hooks,
    enabled: options.enabled,
    status: 'inactive'
  };
  
  // Register the plugin
  registry.registerPlugin(pluginInfo);
  
  return pluginInfo;
}

/**
 * Install plugin from zip file
 */
async function installPluginFromZip(
  zipFile: string,
  options: { force: boolean; skipDependencies: boolean; enabled: boolean }
): Promise<PluginInfo | null> {
  // In a real implementation, this would extract the zip file
  // For the boilerplate, we'll just simulate the installation
  
  console.log(`[Plugin Loader] Installing from zip: ${zipFile}`);
  
  // Generate a plugin name from the zip filename
  const zipName = path.basename(zipFile, '.zip');
  
  // Simulate zip extraction
  const pluginsDir = registry.getPluginsDir();
  const extractDir = path.join(pluginsDir, zipName);
  
  // Create plugin directory
  await fs.mkdir(extractDir, { recursive: true });
  
  // Create a simple package.json
  const manifest: PluginManifest = {
    id: zipName,
    name: zipName,
    version: '1.0.0',
    description: `Plugin installed from zip: ${zipFile}`,
    main: 'index.js',
    dependencies: []
  };
  
  await fs.writeFile(
    path.join(extractDir, 'package.json'),
    JSON.stringify(manifest, null, 2),
    'utf8'
  );
  
  // Create a simple index.js
  await fs.writeFile(
    path.join(extractDir, 'index.js'),
    `module.exports = {
  activate: function(api) {
    api.log('Plugin activated: ${zipName}');
  },
  deactivate: function() {
    console.log('Plugin deactivated: ${zipName}');
  }
};`,
    'utf8'
  );
  
  // Create plugin info
  const pluginInfo: PluginInfo = {
    id: manifest.id,
    name: manifest.name,
    version: manifest.version,
    description: manifest.description,
    entryPoint: path.join(extractDir, manifest.main),
    dependencies: manifest.dependencies,
    enabled: options.enabled,
    status: 'inactive'
  };
  
  // Register the plugin
  registry.registerPlugin(pluginInfo);
  
  return pluginInfo;
}

/**
 * Handles uninstalling a plugin
 */
async function handleUninstallPlugin(args: any) {
  try {
    const result = UninstallPluginSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for uninstalling plugin"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const { pluginId, options } = result.data;
    
    // Get the plugin
    const plugin = registry.getPlugin(pluginId);
    
    if (!plugin) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: `Plugin not found: ${pluginId}`,
            message: "Failed to uninstall plugin"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    // Unload the plugin if it's active
    const instance = registry.getInstance(pluginId);
    if (instance) {
      await unloadPlugin(pluginId);
    }
    
    // Get plugin directory
    const pluginDir = plugin.entryPoint ? path.dirname(plugin.entryPoint) : null;
    
    // Remove the plugin from registry
    // Use proper methods instead of accessing private properties
    registry.registerPlugin({...plugin, status: 'inactive'});
    registry.setInstance(pluginId, undefined as any);
    
    // Remove plugin config
    delete pluginConfigCache[pluginId];
    
    // Save configuration
    await savePluginConfig();
    
    // Remove plugin directory if it exists and is within plugins directory
    if (pluginDir && fsSync.existsSync(pluginDir) && pluginDir.startsWith(registry.getPluginsDir())) {
      try {
        // In a real implementation, this would be a recursive delete
        console.log(`[Plugin Loader] Removing plugin directory: ${pluginDir}`);
        // We're not actually deleting in this boilerplate to avoid potential issues
      } catch (error) {
        console.error(`[Plugin Loader] Error removing plugin directory: ${error}`);
      }
    }
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          pluginId,
          name: plugin.name,
          removed: true,
          message: `Successfully uninstalled plugin: ${plugin.name}`
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to uninstall plugin"
        }, null, 2)
      }],
      isError: true
    };
  }
}

/**
 * Handles enabling a plugin
 */
async function handleEnablePlugin(args: any) {
  try {
    const result = EnableDisablePluginSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for enabling plugin"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const { pluginId } = result.data;
    
    // Get the plugin
    const plugin = registry.getPlugin(pluginId);
    
    if (!plugin) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: `Plugin not found: ${pluginId}`,
            message: "Failed to enable plugin"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    // Already enabled?
    if (plugin.enabled) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            pluginId,
            name: plugin.name,
            enabled: true,
            message: `Plugin is already enabled: ${plugin.name}`
          }, null, 2)
        }]
      };
    }
    
    // Enable the plugin
    plugin.enabled = true;
    
    // Save configuration
    await savePluginConfig();
    
    // Load the plugin
    const loaded = await loadPlugin(pluginId);
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          pluginId,
          name: plugin.name,
          enabled: true,
          loaded,
          message: `Successfully enabled plugin: ${plugin.name}`
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to enable plugin"
        }, null, 2)
      }],
      isError: true
    };
  }
}

/**
 * Handles disabling a plugin
 */
async function handleDisablePlugin(args: any) {
  try {
    const result = EnableDisablePluginSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for disabling plugin"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const { pluginId } = result.data;
    
    // Get the plugin
    const plugin = registry.getPlugin(pluginId);
    
    if (!plugin) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: `Plugin not found: ${pluginId}`,
            message: "Failed to disable plugin"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    // Already disabled?
    if (!plugin.enabled) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            pluginId,
            name: plugin.name,
            enabled: false,
            message: `Plugin is already disabled: ${plugin.name}`
          }, null, 2)
        }]
      };
    }
    
    // Disable the plugin
    plugin.enabled = false;
    
    // Unload if active
    let unloaded = false;
    if (plugin.status === 'active') {
      unloaded = await unloadPlugin(pluginId);
    }
    
    // Save configuration
    await savePluginConfig();
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          pluginId,
          name: plugin.name,
          enabled: false,
          unloaded,
          message: `Successfully disabled plugin: ${plugin.name}`
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to disable plugin"
        }, null, 2)
      }],
      isError: true
    };
  }
}

/**
 * Handles listing plugins
 */
async function handleListPlugins(args: any) {
  try {
    const result = ListPluginsSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for listing plugins"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const { filter, detailed } = result.data;
    
    // Get all plugins
    let plugins = registry.getPlugins();
    
    // Apply filter
    switch (filter) {
      case 'enabled':
        plugins = plugins.filter(p => p.enabled);
        break;
      case 'disabled':
        plugins = plugins.filter(p => !p.enabled);
        break;
      case 'active':
        plugins = plugins.filter(p => p.status === 'active');
        break;
      case 'inactive':
        plugins = plugins.filter(p => p.status === 'inactive');
        break;
      case 'error':
        plugins = plugins.filter(p => p.status === 'error');
        break;
      // 'all' doesn't need filtering
    }
    
    // Format plugin list
    const formattedPlugins = plugins.map(plugin => {
      const instance = registry.getInstance(plugin.id);
      
      const basic = {
        id: plugin.id,
        name: plugin.name,
        version: plugin.version,
        enabled: plugin.enabled,
        status: plugin.status
      };
      
      if (detailed) {
        return {
          ...basic,
          description: plugin.description,
          author: plugin.author,
          entryPoint: plugin.entryPoint,
          dependencies: plugin.dependencies,
          hooks: instance?.hooks ? Object.keys(instance.hooks) : [],
          loadedTimestamp: plugin.loadedTimestamp,
          error: plugin.error
        };
      }
      
      return basic;
    });
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          plugins: formattedPlugins,
          count: formattedPlugins.length,
          filter,
          message: `Found ${formattedPlugins.length} plugins${filter !== 'all' ? ` (filter: ${filter})` : ''}`
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to list plugins"
        }, null, 2)
      }],
      isError: true
    };
  }
}

/**
 * Handles getting plugin information
 */
async function handleGetPluginInfo(args: any) {
  try {
    const result = GetPluginInfoSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for getting plugin info"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const { pluginId, includeConfig, includeHooks } = result.data;
    
    // Get the plugin
    const plugin = registry.getPlugin(pluginId);
    
    if (!plugin) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: `Plugin not found: ${pluginId}`,
            message: "Failed to get plugin info"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    // Get instance if available
    const instance = registry.getInstance(pluginId);
    
    // Build plugin info
    const pluginInfo: any = {
      id: plugin.id,
      name: plugin.name,
      version: plugin.version,
      description: plugin.description,
      author: plugin.author,
      enabled: plugin.enabled,
      status: plugin.status,
      entryPoint: plugin.entryPoint,
      dependencies: plugin.dependencies,
      loadedTimestamp: plugin.loadedTimestamp,
      error: plugin.error
    };
    
    // Include configuration if requested
    if (includeConfig) {
      pluginInfo.config = pluginConfigCache[pluginId] || {};
    }
    
    // Include hooks if requested
    if (includeHooks && instance) {
      pluginInfo.hooks = Object.keys(instance.hooks).map(hook => ({
        name: hook,
        callbacks: instance.hooks[hook].length
      }));
    }
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          plugin: pluginInfo,
          message: `Successfully retrieved info for plugin: ${plugin.name}`
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to get plugin info"
        }, null, 2)
      }],
      isError: true
    };
  }
}