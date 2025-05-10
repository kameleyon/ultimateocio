"use strict";
// Auto-generated boilerplate for assistant-router
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
exports.UpdateConfigSchema = exports.GetHistorySchema = exports.ListRulesSchema = exports.ListAssistantsSchema = exports.AddRuleSchema = exports.AddAssistantSchema = exports.RouteRequestSchema = void 0;
exports.activate = activate;
exports.onFileWrite = onFileWrite;
exports.onSessionStart = onSessionStart;
exports.onCommand = onCommand;
const zod_1 = require("zod");
const fs = __importStar(require("fs/promises"));
const fsSync = __importStar(require("fs"));
const path = __importStar(require("path"));
// Default router state
const DEFAULT_ROUTER_STATE = {
    assistants: {},
    rules: {},
    history: [],
    config: {
        defaultAssistantId: '',
        maxHistoryEntries: 100,
        requireAllConditions: true,
        enableLogging: true,
        logLevel: 'info',
        analysisMode: false
    },
    lastUpdated: Date.now()
};
// Default config file path
const CONFIG_FILE_PATH = 'assistant-router-config.json';
// Current router state
let routerState = { ...DEFAULT_ROUTER_STATE };
function activate() {
    console.error("[TOOL] assistant-router activated");
    // Load configuration
    loadConfig();
}
/**
 * Load configuration from file
 */
async function loadConfig() {
    try {
        if (fsSync.existsSync(CONFIG_FILE_PATH)) {
            const configData = await fs.readFile(CONFIG_FILE_PATH, 'utf8');
            routerState = JSON.parse(configData);
            console.error(`[Assistant Router] Loaded configuration with ${Object.keys(routerState.assistants).length} assistants and ${Object.keys(routerState.rules).length} rules`);
        }
        else {
            // Create default config file
            await saveConfig();
            console.error(`[Assistant Router] Created default configuration at ${CONFIG_FILE_PATH}`);
        }
    }
    catch (error) {
        console.error('[Assistant Router] Error loading configuration:', error);
    }
}
/**
 * Save configuration to file
 */
async function saveConfig() {
    try {
        routerState.lastUpdated = Date.now();
        await fs.writeFile(CONFIG_FILE_PATH, JSON.stringify(routerState, null, 2), 'utf8');
        console.error(`[Assistant Router] Saved configuration with ${Object.keys(routerState.assistants).length} assistants and ${Object.keys(routerState.rules).length} rules`);
    }
    catch (error) {
        console.error('[Assistant Router] Error saving configuration:', error);
    }
}
/**
 * Generate a unique ID
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
}
/**
 * Prune history to maintain max entries
 */
function pruneHistory() {
    if (routerState.history.length > routerState.config.maxHistoryEntries) {
        routerState.history = routerState.history.slice(-routerState.config.maxHistoryEntries);
    }
}
/**
 * Check if a value matches a condition
 */
function checkCondition(condition, value) {
    // Handle missing value
    if (value === undefined || value === null) {
        return condition.operator === 'exists' ? false : false;
    }
    // Handle exists operator
    if (condition.operator === 'exists') {
        return true;
    }
    // Convert values to strings for easier comparison
    const strValue = String(value);
    const strConditionValue = condition.value !== undefined ? String(condition.value) : '';
    // Check condition based on operator
    switch (condition.operator) {
        case 'equals':
            return strValue === strConditionValue;
        case 'contains':
            return strValue.includes(strConditionValue);
        case 'startsWith':
            return strValue.startsWith(strConditionValue);
        case 'endsWith':
            return strValue.endsWith(strConditionValue);
        case 'matches':
            try {
                return new RegExp(strConditionValue).test(strValue);
            }
            catch (e) {
                console.error(`[Assistant Router] Invalid regex in condition: ${strConditionValue}`);
                return false;
            }
        default:
            return false;
    }
}
/**
 * Route a request to an assistant
 */
function routeRequest(input) {
    const startTime = Date.now();
    // Get all enabled rules, sorted by priority (higher first)
    const enabledRules = Object.values(routerState.rules)
        .filter(rule => rule.enabled)
        .sort((a, b) => b.priority - a.priority);
    // Find matching rule
    let matchedRule = null;
    for (const rule of enabledRules) {
        const conditionResults = rule.conditions.map(condition => {
            const fieldValue = input[condition.field];
            return checkCondition(condition, fieldValue);
        });
        const allConditionsMet = conditionResults.every(result => result === true);
        const anyConditionMet = conditionResults.some(result => result === true);
        if ((routerState.config.requireAllConditions && allConditionsMet) ||
            (!routerState.config.requireAllConditions && anyConditionMet)) {
            matchedRule = rule;
            break;
        }
    }
    // Determine target assistant
    let targetAssistantId = routerState.config.defaultAssistantId;
    let success = false;
    if (matchedRule) {
        targetAssistantId = matchedRule.targetAssistantId;
        // Check if target assistant exists and is enabled
        const targetAssistant = routerState.assistants[targetAssistantId];
        if (!targetAssistant || !targetAssistant.enabled) {
            // Use fallback if available
            if (matchedRule.fallbackAssistantId &&
                routerState.assistants[matchedRule.fallbackAssistantId] &&
                routerState.assistants[matchedRule.fallbackAssistantId].enabled) {
                targetAssistantId = matchedRule.fallbackAssistantId;
                success = true;
            }
            else {
                // Fall back to default
                targetAssistantId = routerState.config.defaultAssistantId;
                success = routerState.assistants[targetAssistantId] ? true : false;
            }
        }
        else {
            success = true;
        }
    }
    else {
        // No rule matched, use default assistant
        success = routerState.assistants[targetAssistantId] ? true : false;
    }
    // Get target assistant
    const targetAssistant = routerState.assistants[targetAssistantId] || null;
    // Record in history
    const historyEntry = {
        id: generateId(),
        requestId: generateId(),
        timestamp: Date.now(),
        input,
        matchedRuleId: matchedRule?.id,
        targetAssistantId,
        success,
        duration: Date.now() - startTime
    };
    routerState.history.push(historyEntry);
    pruneHistory();
    // Save updated state
    saveConfig();
    return {
        assistantId: targetAssistantId,
        assistant: targetAssistant,
        matchedRule,
        success
    };
}
/**
 * Handles file write events
 */
function onFileWrite(event) {
    // Check if config file was modified
    if (path.basename(event.path) === path.basename(CONFIG_FILE_PATH)) {
        console.error(`[Assistant Router] Configuration file changed: ${event.path}`);
        loadConfig();
    }
}
/**
 * Handles session start logic
 */
function onSessionStart(session) {
    console.error(`[Assistant Router] Session started: ${session.id}`);
    // Reload configuration on session start
    loadConfig();
}
/**
 * Handles assistant-router commands
 */
async function onCommand(command) {
    switch (command.name) {
        case 'assistant-router:route':
            console.error('[Assistant Router] Routing request...');
            return await handleRouteRequest(command.args[0]);
        case 'assistant-router:add-assistant':
            console.error('[Assistant Router] Adding assistant...');
            return await handleAddAssistant(command.args[0]);
        case 'assistant-router:add-rule':
            console.error('[Assistant Router] Adding rule...');
            return await handleAddRule(command.args[0]);
        case 'assistant-router:list-assistants':
            console.error('[Assistant Router] Listing assistants...');
            return await handleListAssistants(command.args[0]);
        case 'assistant-router:list-rules':
            console.error('[Assistant Router] Listing rules...');
            return await handleListRules(command.args[0]);
        case 'assistant-router:get-history':
            console.error('[Assistant Router] Getting history...');
            return await handleGetHistory(command.args[0]);
        case 'assistant-router:update-config':
            console.error('[Assistant Router] Updating configuration...');
            return await handleUpdateConfig(command.args[0]);
        default:
            console.warn(`[Assistant Router] Unknown command: ${command.name}`);
            return { error: `Unknown command: ${command.name}` };
    }
}
// Define schemas for Assistant Router tool
exports.RouteRequestSchema = zod_1.z.object({
    input: zod_1.z.record(zod_1.z.any()),
    analyzeOnly: zod_1.z.boolean().optional().default(false),
});
exports.AddAssistantSchema = zod_1.z.object({
    name: zod_1.z.string(),
    type: zod_1.z.enum(['coder', 'writer', 'researcher', 'analyst', 'designer', 'planner', 'teacher', 'expert', 'custom']),
    description: zod_1.z.string(),
    capabilities: zod_1.z.array(zod_1.z.string()),
    parameters: zod_1.z.record(zod_1.z.any()).optional().default({}),
    model: zod_1.z.string().optional(),
    contextLimit: zod_1.z.number().positive().optional(),
    temperature: zod_1.z.number().min(0).max(2).optional(),
    systemPrompt: zod_1.z.string().optional(),
    requiredFields: zod_1.z.array(zod_1.z.string()).optional(),
    enabled: zod_1.z.boolean().optional().default(true)
});
exports.AddRuleSchema = zod_1.z.object({
    name: zod_1.z.string(),
    description: zod_1.z.string(),
    priority: zod_1.z.number().int().min(1).max(100),
    conditions: zod_1.z.array(zod_1.z.object({
        field: zod_1.z.string(),
        operator: zod_1.z.enum(['equals', 'contains', 'startsWith', 'endsWith', 'matches', 'exists']),
        value: zod_1.z.union([zod_1.z.string(), zod_1.z.number(), zod_1.z.boolean()]).optional(),
        valueList: zod_1.z.array(zod_1.z.union([zod_1.z.string(), zod_1.z.number(), zod_1.z.boolean()])).optional()
    })).min(1),
    targetAssistantId: zod_1.z.string(),
    fallbackAssistantId: zod_1.z.string().optional(),
    enabled: zod_1.z.boolean().optional().default(true),
    metadata: zod_1.z.record(zod_1.z.any()).optional()
});
exports.ListAssistantsSchema = zod_1.z.object({
    type: zod_1.z.enum(['coder', 'writer', 'researcher', 'analyst', 'designer', 'planner', 'teacher', 'expert', 'custom', 'all']).optional().default('all'),
    enabledOnly: zod_1.z.boolean().optional().default(false),
    includeSystemPrompt: zod_1.z.boolean().optional().default(false)
});
exports.ListRulesSchema = zod_1.z.object({
    enabledOnly: zod_1.z.boolean().optional().default(false),
    targetAssistantId: zod_1.z.string().optional(),
    includeConditions: zod_1.z.boolean().optional().default(true),
    sortByPriority: zod_1.z.boolean().optional().default(true)
});
exports.GetHistorySchema = zod_1.z.object({
    limit: zod_1.z.number().optional().default(10),
    offset: zod_1.z.number().optional().default(0),
    assistantId: zod_1.z.string().optional(),
    ruleId: zod_1.z.string().optional(),
    successOnly: zod_1.z.boolean().optional(),
    includeInputs: zod_1.z.boolean().optional().default(false)
});
exports.UpdateConfigSchema = zod_1.z.object({
    defaultAssistantId: zod_1.z.string().optional(),
    maxHistoryEntries: zod_1.z.number().positive().optional(),
    requireAllConditions: zod_1.z.boolean().optional(),
    enableLogging: zod_1.z.boolean().optional(),
    logLevel: zod_1.z.enum(['debug', 'info', 'warn', 'error']).optional(),
    analysisMode: zod_1.z.boolean().optional()
});
/**
 * Handles routing a request
 */
async function handleRouteRequest(args) {
    try {
        const result = exports.RouteRequestSchema.safeParse(args);
        if (!result.success) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: result.error.format(),
                            message: "Invalid arguments for routing request"
                        }, null, 2)
                    }],
                isError: true
            };
        }
        const { input, analyzeOnly } = result.data;
        // If analyze only, don't actually route, just show what would happen
        if (analyzeOnly || routerState.config.analysisMode) {
            // Get all rules
            const enabledRules = Object.values(routerState.rules)
                .filter(rule => rule.enabled)
                .sort((a, b) => b.priority - a.priority);
            // Check all rules
            const ruleAnalysis = enabledRules.map(rule => {
                const conditionResults = rule.conditions.map(condition => {
                    const fieldValue = input[condition.field];
                    const result = checkCondition(condition, fieldValue);
                    return {
                        field: condition.field,
                        operator: condition.operator,
                        expectedValue: condition.value,
                        actualValue: fieldValue,
                        matches: result
                    };
                });
                const allMatch = conditionResults.every(r => r.matches);
                const anyMatch = conditionResults.some(r => r.matches);
                return {
                    ruleId: rule.id,
                    ruleName: rule.name,
                    priority: rule.priority,
                    conditions: conditionResults,
                    allConditionsMatch: allMatch,
                    anyConditionMatches: anyMatch,
                    wouldMatch: (routerState.config.requireAllConditions && allMatch) ||
                        (!routerState.config.requireAllConditions && anyMatch),
                    targetAssistantId: rule.targetAssistantId,
                    targetAssistantName: routerState.assistants[rule.targetAssistantId]?.name || 'Unknown'
                };
            });
            // Determine which rule would be selected
            const matchingRules = ruleAnalysis.filter(r => r.wouldMatch);
            const selectedRule = matchingRules.length > 0 ? matchingRules[0] : null;
            // Determine which assistant would be used
            let targetAssistantId = '';
            let targetAssistantName = '';
            if (selectedRule) {
                targetAssistantId = selectedRule.targetAssistantId;
                // Check if target assistant exists and is enabled
                const targetAssistant = routerState.assistants[targetAssistantId];
                if (!targetAssistant || !targetAssistant.enabled) {
                    // Use fallback if available
                    const rule = routerState.rules[selectedRule.ruleId];
                    if (rule.fallbackAssistantId &&
                        routerState.assistants[rule.fallbackAssistantId] &&
                        routerState.assistants[rule.fallbackAssistantId].enabled) {
                        targetAssistantId = rule.fallbackAssistantId;
                        targetAssistantName = routerState.assistants[targetAssistantId].name;
                    }
                    else {
                        // Fall back to default
                        targetAssistantId = routerState.config.defaultAssistantId;
                        targetAssistantName = routerState.assistants[targetAssistantId]?.name || 'Unknown default';
                    }
                }
                else {
                    targetAssistantName = targetAssistant.name;
                }
            }
            else {
                // No rule matched, use default assistant
                targetAssistantId = routerState.config.defaultAssistantId;
                targetAssistantName = routerState.assistants[targetAssistantId]?.name || 'Unknown default';
            }
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            analysis: {
                                ruleCount: enabledRules.length,
                                matchingRuleCount: matchingRules.length,
                                selectedRuleId: selectedRule?.ruleId,
                                selectedRuleName: selectedRule?.ruleName,
                                targetAssistantId,
                                targetAssistantName,
                                requireAllConditions: routerState.config.requireAllConditions,
                                rules: ruleAnalysis
                            },
                            input,
                            message: matchingRules.length > 0
                                ? `Input would route to '${targetAssistantName}' assistant via rule '${selectedRule?.ruleName}'`
                                : `Input would route to default assistant '${targetAssistantName}'`
                        }, null, 2)
                    }]
            };
        }
        // Actually route the request
        const routeResult = routeRequest(input);
        if (!routeResult.success) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: "Routing failed",
                            assistantId: routeResult.assistantId,
                            matchedRuleId: routeResult.matchedRule?.id,
                            message: "Failed to route request to valid assistant"
                        }, null, 2)
                    }],
                isError: true
            };
        }
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        assistantId: routeResult.assistantId,
                        assistantName: routeResult.assistant?.name,
                        assistantType: routeResult.assistant?.type,
                        matchedRuleId: routeResult.matchedRule?.id,
                        matchedRuleName: routeResult.matchedRule?.name,
                        message: routeResult.matchedRule
                            ? `Routed to '${routeResult.assistant?.name}' assistant via rule '${routeResult.matchedRule.name}'`
                            : `Routed to default assistant '${routeResult.assistant?.name}'`
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
                        message: "Failed to route request"
                    }, null, 2)
                }],
            isError: true
        };
    }
}
/**
 * Handles adding an assistant
 */
async function handleAddAssistant(args) {
    try {
        const result = exports.AddAssistantSchema.safeParse(args);
        if (!result.success) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: result.error.format(),
                            message: "Invalid arguments for adding assistant"
                        }, null, 2)
                    }],
                isError: true
            };
        }
        const { name, type, description, capabilities, parameters, model, contextLimit, temperature, systemPrompt, requiredFields, enabled } = result.data;
        // Generate ID
        const id = generateId();
        const timestamp = Date.now();
        // Create assistant
        const assistant = {
            id,
            name,
            type,
            description,
            capabilities,
            parameters,
            model,
            contextLimit,
            temperature,
            systemPrompt,
            requiredFields,
            createdAt: timestamp,
            updatedAt: timestamp,
            enabled
        };
        // Add to assistants
        routerState.assistants[id] = assistant;
        // If this is the first assistant, set as default
        if (Object.keys(routerState.assistants).length === 1 && !routerState.config.defaultAssistantId) {
            routerState.config.defaultAssistantId = id;
        }
        // Save configuration
        await saveConfig();
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        id,
                        name,
                        type,
                        isDefault: routerState.config.defaultAssistantId === id,
                        message: `Successfully added ${type} assistant '${name}'`
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
                        message: "Failed to add assistant"
                    }, null, 2)
                }],
            isError: true
        };
    }
}
/**
 * Handles adding a routing rule
 */
async function handleAddRule(args) {
    try {
        const result = exports.AddRuleSchema.safeParse(args);
        if (!result.success) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: result.error.format(),
                            message: "Invalid arguments for adding rule"
                        }, null, 2)
                    }],
                isError: true
            };
        }
        const { name, description, priority, conditions, targetAssistantId, fallbackAssistantId, enabled, metadata } = result.data;
        // Check if target assistant exists
        if (!routerState.assistants[targetAssistantId]) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: `Target assistant with ID '${targetAssistantId}' not found`,
                            message: "Failed to add rule",
                            availableAssistants: Object.keys(routerState.assistants).map(id => ({
                                id,
                                name: routerState.assistants[id].name
                            }))
                        }, null, 2)
                    }],
                isError: true
            };
        }
        // Check if fallback assistant exists if provided
        if (fallbackAssistantId && !routerState.assistants[fallbackAssistantId]) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: `Fallback assistant with ID '${fallbackAssistantId}' not found`,
                            message: "Failed to add rule",
                            availableAssistants: Object.keys(routerState.assistants).map(id => ({
                                id,
                                name: routerState.assistants[id].name
                            }))
                        }, null, 2)
                    }],
                isError: true
            };
        }
        // Generate ID
        const id = generateId();
        const timestamp = Date.now();
        // Create rule
        const rule = {
            id,
            name,
            description,
            priority,
            conditions,
            targetAssistantId,
            fallbackAssistantId,
            createdAt: timestamp,
            updatedAt: timestamp,
            enabled,
            metadata
        };
        // Add to rules
        routerState.rules[id] = rule;
        // Save configuration
        await saveConfig();
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        id,
                        name,
                        priority,
                        targetAssistantName: routerState.assistants[targetAssistantId].name,
                        conditionCount: conditions.length,
                        message: `Successfully added rule '${name}' with priority ${priority}`
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
                        message: "Failed to add rule"
                    }, null, 2)
                }],
            isError: true
        };
    }
}
/**
 * Handles listing assistants
 */
async function handleListAssistants(args) {
    try {
        const result = exports.ListAssistantsSchema.safeParse(args);
        if (!result.success) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: result.error.format(),
                            message: "Invalid arguments for listing assistants"
                        }, null, 2)
                    }],
                isError: true
            };
        }
        const { type, enabledOnly, includeSystemPrompt } = result.data;
        // Filter assistants
        let filteredAssistants = Object.values(routerState.assistants);
        if (type !== 'all') {
            filteredAssistants = filteredAssistants.filter(assistant => assistant.type === type);
        }
        if (enabledOnly) {
            filteredAssistants = filteredAssistants.filter(assistant => assistant.enabled);
        }
        // Format assistants for response
        const formattedAssistants = filteredAssistants.map(assistant => {
            const formatted = {
                id: assistant.id,
                name: assistant.name,
                type: assistant.type,
                description: assistant.description,
                capabilities: assistant.capabilities,
                enabled: assistant.enabled,
                isDefault: assistant.id === routerState.config.defaultAssistantId,
                model: assistant.model,
                contextLimit: assistant.contextLimit,
                temperature: assistant.temperature,
                parameters: assistant.parameters,
                requiredFields: assistant.requiredFields,
            };
            if (includeSystemPrompt && assistant.systemPrompt) {
                formatted.systemPrompt = assistant.systemPrompt;
            }
            return formatted;
        });
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        assistants: formattedAssistants,
                        count: formattedAssistants.length,
                        defaultAssistantId: routerState.config.defaultAssistantId,
                        message: `Found ${formattedAssistants.length} assistants`
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
                        message: "Failed to list assistants"
                    }, null, 2)
                }],
            isError: true
        };
    }
}
/**
 * Handles listing rules
 */
async function handleListRules(args) {
    try {
        const result = exports.ListRulesSchema.safeParse(args);
        if (!result.success) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: result.error.format(),
                            message: "Invalid arguments for listing rules"
                        }, null, 2)
                    }],
                isError: true
            };
        }
        const { enabledOnly, targetAssistantId, includeConditions, sortByPriority } = result.data;
        // Filter rules
        let filteredRules = Object.values(routerState.rules);
        if (enabledOnly) {
            filteredRules = filteredRules.filter(rule => rule.enabled);
        }
        if (targetAssistantId) {
            filteredRules = filteredRules.filter(rule => rule.targetAssistantId === targetAssistantId ||
                rule.fallbackAssistantId === targetAssistantId);
        }
        // Sort rules
        if (sortByPriority) {
            filteredRules.sort((a, b) => b.priority - a.priority);
        }
        // Format rules for response
        const formattedRules = filteredRules.map(rule => {
            const formatted = {
                id: rule.id,
                name: rule.name,
                description: rule.description,
                priority: rule.priority,
                targetAssistantId: rule.targetAssistantId,
                targetAssistantName: routerState.assistants[rule.targetAssistantId]?.name || 'Unknown',
                fallbackAssistantId: rule.fallbackAssistantId,
                fallbackAssistantName: rule.fallbackAssistantId
                    ? routerState.assistants[rule.fallbackAssistantId]?.name || 'Unknown'
                    : undefined,
                enabled: rule.enabled,
                createdAt: rule.createdAt,
                updatedAt: rule.updatedAt
            };
            if (includeConditions) {
                formatted.conditions = rule.conditions;
                formatted.conditionCount = rule.conditions.length;
                formatted.requireAllConditions = routerState.config.requireAllConditions;
            }
            return formatted;
        });
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        rules: formattedRules,
                        count: formattedRules.length,
                        message: `Found ${formattedRules.length} rules`
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
                        message: "Failed to list rules"
                    }, null, 2)
                }],
            isError: true
        };
    }
}
/**
 * Handles getting routing history
 */
async function handleGetHistory(args) {
    try {
        const result = exports.GetHistorySchema.safeParse(args);
        if (!result.success) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: result.error.format(),
                            message: "Invalid arguments for getting history"
                        }, null, 2)
                    }],
                isError: true
            };
        }
        const { limit, offset, assistantId, ruleId, successOnly, includeInputs } = result.data;
        // Get all history entries, sorted by timestamp (newest first)
        let historyEntries = [...routerState.history].sort((a, b) => b.timestamp - a.timestamp);
        // Apply filters
        if (assistantId) {
            historyEntries = historyEntries.filter(entry => entry.targetAssistantId === assistantId);
        }
        if (ruleId) {
            historyEntries = historyEntries.filter(entry => entry.matchedRuleId === ruleId);
        }
        if (successOnly !== undefined) {
            historyEntries = historyEntries.filter(entry => entry.success === successOnly);
        }
        // Apply pagination
        const paginatedEntries = historyEntries.slice(offset, offset + limit);
        // Format entries for response
        const formattedEntries = paginatedEntries.map(entry => {
            const formatted = {
                id: entry.id,
                requestId: entry.requestId,
                timestamp: entry.timestamp,
                matchedRuleId: entry.matchedRuleId,
                matchedRuleName: entry.matchedRuleId ? routerState.rules[entry.matchedRuleId]?.name : null,
                targetAssistantId: entry.targetAssistantId,
                targetAssistantName: routerState.assistants[entry.targetAssistantId]?.name || 'Unknown',
                success: entry.success,
                duration: entry.duration
            };
            if (includeInputs) {
                formatted.input = entry.input;
            }
            return formatted;
        });
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        history: formattedEntries,
                        count: formattedEntries.length,
                        total: historyEntries.length,
                        hasMore: offset + limit < historyEntries.length,
                        message: `Retrieved ${formattedEntries.length} history entries`
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
                        message: "Failed to get history"
                    }, null, 2)
                }],
            isError: true
        };
    }
}
/**
 * Handles updating router configuration
 */
async function handleUpdateConfig(args) {
    try {
        const result = exports.UpdateConfigSchema.safeParse(args);
        if (!result.success) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: result.error.format(),
                            message: "Invalid arguments for updating configuration"
                        }, null, 2)
                    }],
                isError: true
            };
        }
        const { defaultAssistantId, maxHistoryEntries, requireAllConditions, enableLogging, logLevel, analysisMode } = result.data;
        // Update configuration
        const updatedFields = [];
        if (defaultAssistantId !== undefined) {
            // Check if assistant exists
            if (!routerState.assistants[defaultAssistantId]) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: `Assistant with ID '${defaultAssistantId}' not found`,
                                message: "Failed to update configuration",
                                availableAssistants: Object.keys(routerState.assistants).map(id => ({
                                    id,
                                    name: routerState.assistants[id].name
                                }))
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            routerState.config.defaultAssistantId = defaultAssistantId;
            updatedFields.push('defaultAssistantId');
        }
        if (maxHistoryEntries !== undefined) {
            routerState.config.maxHistoryEntries = maxHistoryEntries;
            updatedFields.push('maxHistoryEntries');
            // Prune history if needed
            pruneHistory();
        }
        if (requireAllConditions !== undefined) {
            routerState.config.requireAllConditions = requireAllConditions;
            updatedFields.push('requireAllConditions');
        }
        if (enableLogging !== undefined) {
            routerState.config.enableLogging = enableLogging;
            updatedFields.push('enableLogging');
        }
        if (logLevel !== undefined) {
            routerState.config.logLevel = logLevel;
            updatedFields.push('logLevel');
        }
        if (analysisMode !== undefined) {
            routerState.config.analysisMode = analysisMode;
            updatedFields.push('analysisMode');
        }
        // Save configuration
        await saveConfig();
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        config: routerState.config,
                        updatedFields,
                        message: `Successfully updated router configuration (${updatedFields.join(', ')})`
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
                        message: "Failed to update configuration"
                    }, null, 2)
                }],
            isError: true
        };
    }
}
