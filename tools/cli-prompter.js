"use strict";
// Auto-generated boilerplate for cli-prompter
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
exports.ValidateInputSchema = exports.GeneratePromptSchema = exports.RunWizardSchema = exports.ShowPromptSchema = void 0;
exports.activate = activate;
exports.onFileWrite = onFileWrite;
exports.onSessionStart = onSessionStart;
exports.onCommand = onCommand;
const zod_1 = require("zod");
const path = __importStar(require("path"));
const child_process_1 = require("child_process");
const util_1 = require("util");
// Promisified exec for running shell commands
const execAsync = (0, util_1.promisify)(child_process_1.exec);
function activate() {
    console.log("[TOOL] cli-prompter activated");
}
/**
 * Handles file write events that might trigger CLI prompt updates
 */
function onFileWrite(event) {
    console.log(`[CLI Prompter] Watching file write: ${event.path}`);
    // Check if it's a wizard configuration file
    if (path.basename(event.path).includes('wizard') || path.basename(event.path).includes('prompt')) {
        console.log(`[CLI Prompter] Detected wizard config file change: ${event.path}`);
        // Could update wizard configurations
    }
}
/**
 * Handles session start logic
 */
function onSessionStart(session) {
    console.log(`[CLI Prompter] Session started: ${session.id}`);
}
/**
 * Handles cli-prompter commands
 */
function onCommand(command) {
    return __awaiter(this, void 0, void 0, function* () {
        switch (command.name) {
            case 'cli-prompter:prompt':
                console.log('[CLI Prompter] Showing prompt...');
                return yield handleShowPrompt(command.args[0]);
            case 'cli-prompter:wizard':
                console.log('[CLI Prompter] Running wizard...');
                return yield handleRunWizard(command.args[0]);
            case 'cli-prompter:generate':
                console.log('[CLI Prompter] Generating CLI prompt...');
                return yield handleGeneratePrompt(command.args[0]);
            case 'cli-prompter:validate':
                console.log('[CLI Prompter] Validating input...');
                return yield handleValidateInput(command.args[0]);
            default:
                console.warn(`[CLI Prompter] Unknown command: ${command.name}`);
                return { error: `Unknown command: ${command.name}` };
        }
    });
}
// Store active wizards
const activeWizards = {};
// Define schemas for CLI Prompter tool
exports.ShowPromptSchema = zod_1.z.object({
    prompt: zod_1.z.string(),
    type: zod_1.z.enum(['input', 'confirm', 'select', 'multiselect', 'password']).default('input'),
    options: zod_1.z.array(zod_1.z.string()).optional(),
    defaultValue: zod_1.z.union([zod_1.z.string(), zod_1.z.boolean(), zod_1.z.number()]).optional(),
    validation: zod_1.z.string().optional(),
    timeout: zod_1.z.number().optional(),
    color: zod_1.z.string().optional(),
});
exports.RunWizardSchema = zod_1.z.object({
    name: zod_1.z.string(),
    steps: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        prompt: zod_1.z.string(),
        type: zod_1.z.enum(['input', 'confirm', 'select', 'multiselect', 'password']).default('input'),
        options: zod_1.z.array(zod_1.z.string()).optional(),
        defaultValue: zod_1.z.union([zod_1.z.string(), zod_1.z.boolean(), zod_1.z.number()]).optional(),
        validation: zod_1.z.string().optional(),
        condition: zod_1.z.string().optional(),
    })),
    saveResultsTo: zod_1.z.string().optional(),
    onComplete: zod_1.z.string().optional(),
});
exports.GeneratePromptSchema = zod_1.z.object({
    name: zod_1.z.string(),
    description: zod_1.z.string().optional(),
    type: zod_1.z.enum(['simple', 'wizard', 'menu', 'form']).default('simple'),
    outputFormat: zod_1.z.enum(['js', 'json', 'yaml', 'cli-args']).default('js'),
    template: zod_1.z.string().optional(),
    fields: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        label: zod_1.z.string(),
        type: zod_1.z.enum(['input', 'confirm', 'select', 'multiselect', 'password']).default('input'),
        options: zod_1.z.array(zod_1.z.string()).optional(),
        defaultValue: zod_1.z.union([zod_1.z.string(), zod_1.z.boolean(), zod_1.z.number()]).optional(),
        validation: zod_1.z.string().optional(),
    })).optional(),
});
exports.ValidateInputSchema = zod_1.z.object({
    input: zod_1.z.string(),
    rules: zod_1.z.array(zod_1.z.string()).or(zod_1.z.record(zod_1.z.string(), zod_1.z.string())),
    type: zod_1.z.enum(['string', 'number', 'email', 'url', 'ip', 'date', 'custom']).default('string'),
});
/**
 * Shows a CLI prompt and returns the user's response
 */
function handleShowPrompt(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = exports.ShowPromptSchema.safeParse(args);
            if (!result.success) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: result.error.format(),
                                message: "Invalid arguments for showing prompt"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            const { prompt, type, options, defaultValue, validation, timeout, color } = result.data;
            // In a real implementation, this would show a prompt in the CLI
            // For now, we'll just return a mock success response
            // Simulate user input based on prompt type
            let response;
            switch (type) {
                case 'confirm':
                    response = true;
                    break;
                case 'select':
                    response = options && options.length > 0 ? options[0] : null;
                    break;
                case 'multiselect':
                    response = options && options.length > 0 ? [options[0]] : [];
                    break;
                case 'password':
                    response = '********';
                    break;
                case 'input':
                default:
                    response = defaultValue || 'User input';
                    break;
            }
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            prompt,
                            type,
                            response,
                            timestamp: new Date().toISOString(),
                            message: `User responded to prompt: ${prompt}`
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
                            message: "Failed to show prompt"
                        }, null, 2)
                    }],
                isError: true
            };
        }
    });
}
/**
 * Runs a multi-step wizard interface
 */
function handleRunWizard(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = exports.RunWizardSchema.safeParse(args);
            if (!result.success) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: result.error.format(),
                                message: "Invalid arguments for running wizard"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            const { name, steps, saveResultsTo, onComplete } = result.data;
            // Generate a unique wizard ID
            const wizardId = `wizard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            // Create a new wizard record
            activeWizards[wizardId] = {
                id: wizardId,
                name,
                steps,
                currentStep: 0,
                answers: {},
                startTime: Date.now(),
                lastUpdateTime: Date.now()
            };
            // In a real implementation, this would run the wizard interactively
            // For now, we'll just return a mock completion response
            // Simulate completing all wizard steps
            for (const step of steps) {
                // Generate a mock answer based on step type
                let answer;
                switch (step.type) {
                    case 'confirm':
                        answer = true;
                        break;
                    case 'select':
                        answer = step.options && step.options.length > 0 ? step.options[0] : null;
                        break;
                    case 'multiselect':
                        answer = step.options && step.options.length > 0 ? [step.options[0]] : [];
                        break;
                    case 'password':
                        answer = '********';
                        break;
                    case 'input':
                    default:
                        answer = step.defaultValue || `Answer for ${step.id}`;
                        break;
                }
                activeWizards[wizardId].answers[step.id] = answer;
                activeWizards[wizardId].currentStep++;
                activeWizards[wizardId].lastUpdateTime = Date.now();
            }
            // Save results if requested
            if (saveResultsTo) {
                // In a real implementation, this would save the results to a file
                console.log(`[CLI Prompter] Would save wizard results to: ${saveResultsTo}`);
            }
            // Execute completion callback if provided
            if (onComplete) {
                // In a real implementation, this would execute the completion callback
                console.log(`[CLI Prompter] Would execute completion callback: ${onComplete}`);
            }
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            wizardId,
                            name,
                            totalSteps: steps.length,
                            completedSteps: steps.length,
                            answers: activeWizards[wizardId].answers,
                            duration: Date.now() - activeWizards[wizardId].startTime,
                            message: `Wizard "${name}" completed successfully with ${steps.length} steps`
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
                            message: "Failed to run wizard"
                        }, null, 2)
                    }],
                isError: true
            };
        }
    });
}
/**
 * Generates a CLI prompt interface
 */
function handleGeneratePrompt(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = exports.GeneratePromptSchema.safeParse(args);
            if (!result.success) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: result.error.format(),
                                message: "Invalid arguments for generating prompt"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            const { name, description, type, outputFormat, template, fields } = result.data;
            // In a real implementation, this would generate prompt code
            // For now, we'll just return a mock response with fake code
            let generatedCode = '';
            switch (outputFormat) {
                case 'js':
                    generatedCode = `
const inquirer = require('inquirer');

async function ${name.replace(/[^a-zA-Z0-9]/g, '_')}() {
  console.log('${description || name}');
  
  ${type === 'wizard' ? 'const answers = {};' : ''}
  ${(fields || []).map(field => {
                        if (type === 'wizard') {
                            return `
  // Step: ${field.label}
  const ${field.id} = await inquirer.prompt([{
    type: '${field.type}',
    name: '${field.id}',
    message: '${field.label}',
    ${field.options ? `choices: ${JSON.stringify(field.options)},` : ''}
    ${field.defaultValue !== undefined ? `default: ${JSON.stringify(field.defaultValue)},` : ''}
  }]);
  answers.${field.id} = ${field.id}.${field.id};
      `;
                        }
                        else {
                            return '';
                        }
                    }).join('\n')}
  
  ${type === 'wizard' ? 'return answers;' : ''}
}

module.exports = ${name.replace(/[^a-zA-Z0-9]/g, '_')};
`;
                    break;
                case 'json':
                    generatedCode = JSON.stringify({
                        name,
                        description,
                        type,
                        fields: fields || [],
                    }, null, 2);
                    break;
                case 'yaml':
                    generatedCode = `name: ${name}
description: ${description || ''}
type: ${type}
fields:
${(fields || []).map(field => `  - id: ${field.id}
    label: ${field.label}
    type: ${field.type}
    ${field.options ? `options: ${field.options.join(', ')}` : ''}
    ${field.defaultValue !== undefined ? `defaultValue: ${field.defaultValue}` : ''}
    ${field.validation ? `validation: ${field.validation}` : ''}`).join('\n')}
`;
                    break;
                case 'cli-args':
                    generatedCode = `#!/usr/bin/env node
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

yargs(hideBin(process.argv))
  .usage('$0 <cmd> [args]')
  .command('${name}', '${description || name}', (yargs) => {
    ${(fields || []).map(field => `yargs.option('${field.id}', {
      type: '${field.type === 'confirm' ? 'boolean' : 'string'}',
      describe: '${field.label}',
      ${field.defaultValue !== undefined ? `default: ${JSON.stringify(field.defaultValue)},` : ''}
      ${field.options ? `choices: ${JSON.stringify(field.options)},` : ''}
    })`).join(';\n    ')}
  }, (argv) => {
    console.log('Running with options:', argv);
    // Implementation here
  })
  .help()
  .argv;
`;
                    break;
            }
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            name,
                            type,
                            outputFormat,
                            generatedCode,
                            message: `Generated ${outputFormat} code for ${type} prompt "${name}"`
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
                            message: "Failed to generate prompt"
                        }, null, 2)
                    }],
                isError: true
            };
        }
    });
}
/**
 * Validates user input against specified rules
 */
function handleValidateInput(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = exports.ValidateInputSchema.safeParse(args);
            if (!result.success) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: result.error.format(),
                                message: "Invalid arguments for validating input"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            const { input, rules, type } = result.data;
            // Define validators for different types
            const validators = {
                string: (input) => typeof input === 'string',
                number: (input) => !isNaN(Number(input)),
                email: (input) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input),
                url: (input) => /^https?:\/\/\S+$/.test(input),
                ip: (input) => /^(\d{1,3}\.){3}\d{1,3}$/.test(input),
                date: (input) => !isNaN(Date.parse(input)),
                custom: (input) => true, // Custom rules are handled separately
            };
            // Check if input matches the specified type
            const isValidType = validators[type] ? validators[type](input) : false;
            // Process individual rules
            const validationResults = [];
            if (Array.isArray(rules)) {
                for (const rule of rules) {
                    // Parse rule (e.g., "minLength:5", "pattern:^[a-z]+$")
                    const [ruleName, ruleValue] = rule.split(':');
                    let isValid = false;
                    switch (ruleName) {
                        case 'required':
                            isValid = input.length > 0;
                            break;
                        case 'minLength':
                            isValid = input.length >= parseInt(ruleValue);
                            break;
                        case 'maxLength':
                            isValid = input.length <= parseInt(ruleValue);
                            break;
                        case 'pattern':
                            isValid = new RegExp(ruleValue).test(input);
                            break;
                        case 'equals':
                            isValid = input === ruleValue;
                            break;
                        case 'oneOf':
                            isValid = ruleValue.split(',').includes(input);
                            break;
                        default:
                            isValid = false;
                            break;
                    }
                    validationResults.push({
                        rule,
                        isValid,
                        message: isValid ? `Passed rule: ${rule}` : `Failed rule: ${rule}`
                    });
                }
            }
            else {
                // Handle object format rules
                for (const [ruleName, ruleValue] of Object.entries(rules)) {
                    let isValid = false;
                    switch (ruleName) {
                        case 'required':
                            isValid = input.length > 0;
                            break;
                        case 'minLength':
                            isValid = input.length >= parseInt(ruleValue);
                            break;
                        case 'maxLength':
                            isValid = input.length <= parseInt(ruleValue);
                            break;
                        case 'pattern':
                            isValid = new RegExp(ruleValue).test(input);
                            break;
                        case 'equals':
                            isValid = input === ruleValue;
                            break;
                        case 'oneOf':
                            isValid = ruleValue.split(',').includes(input);
                            break;
                        default:
                            isValid = false;
                            break;
                    }
                    validationResults.push({
                        rule: `${ruleName}:${ruleValue}`,
                        isValid,
                        message: isValid ? `Passed rule: ${ruleName}` : `Failed rule: ${ruleName}`
                    });
                }
            }
            // Overall validation result
            const isValid = isValidType && validationResults.every(r => r.isValid);
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            input,
                            type,
                            isValid,
                            typeCheck: {
                                isValid: isValidType,
                                message: isValidType ? `Input is a valid ${type}` : `Input is not a valid ${type}`
                            },
                            ruleResults: validationResults,
                            message: isValid ? `Input validation passed all checks` : `Input validation failed`
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
                            message: "Failed to validate input"
                        }, null, 2)
                    }],
                isError: true
            };
        }
    });
}
