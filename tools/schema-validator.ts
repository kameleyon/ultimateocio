// Auto-generated boilerplate for schema-validator

import { z } from 'zod';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';

// Supported schema formats
type SchemaFormat = 'json' | 'yaml' | 'typescript' | 'graphql' | 'avro';

// Supported data formats
type DataFormat = 'json' | 'yaml' | 'csv' | 'txt';

// Validation result
interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

// Validation error
interface ValidationError {
  path: string;
  message: string;
  value?: any;
  expected?: string;
  received?: string;
  code?: string;
}

// Schema information
interface SchemaInfo {
  format: SchemaFormat;
  version?: string;
  path?: string;
  name: string;
  description?: string;
  properties?: number;
  required?: string[];
}

// Schema cache for performance
const schemasCache = new Map<string, any>();

// Cache of recent validations
const validationCache = new Map<string, ValidationResult>();

// Default validator options
const defaultValidatorOptions = {
  allowUnknownProperties: false,
  coerceTypes: false,
  removeAdditional: false,
  strictArrays: true,
  strictObjects: true
};

export function activate() {
  console.log("[TOOL] schema-validator activated");
  
  // Clear caches
  schemasCache.clear();
  validationCache.clear();
}

/**
 * Handles file write events
 */
export function onFileWrite(event: { path: string; content: string }) {
  // Check if file is a schema file
  if (isSchemaFile(event.path)) {
    console.log(`[Schema Validator] Schema file updated: ${event.path}`);
    
    // Remove from cache if it exists
    const normalizedPath = path.normalize(event.path);
    if (schemasCache.has(normalizedPath)) {
      schemasCache.delete(normalizedPath);
      console.log(`[Schema Validator] Removed schema from cache: ${normalizedPath}`);
    }
  }
  
  // Check if file is a data file that might need validation
  else if (isDataFile(event.path)) {
    console.log(`[Schema Validator] Data file updated: ${event.path}`);
    
    // Invalidate validation cache for this file
    const cacheKeys = Array.from(validationCache.keys());
    for (const key of cacheKeys) {
      if (key.includes(event.path)) {
        validationCache.delete(key);
      }
    }
  }
}

/**
 * Handles session start logic
 */
export function onSessionStart(session: { id: string; startTime: number }) {
  console.log(`[Schema Validator] Session started: ${session.id}`);
  
  // Clear caches on new session
  schemasCache.clear();
  validationCache.clear();
}

/**
 * Handles schema-validator commands
 */
export async function onCommand(command: { name: string; args: any[] }) {
  switch (command.name) {
    case 'schema-validator:validate':
      console.log('[Schema Validator] Validating data against schema...');
      return await handleValidateSchema(command.args[0]);
    case 'schema-validator:compile':
      console.log('[Schema Validator] Compiling schema...');
      return await handleCompileSchema(command.args[0]);
    case 'schema-validator:analyze':
      console.log('[Schema Validator] Analyzing schema...');
      return await handleAnalyzeSchema(command.args[0]);
    case 'schema-validator:generate':
      console.log('[Schema Validator] Generating schema from data...');
      return await handleGenerateSchema(command.args[0]);
    case 'schema-validator:convert':
      console.log('[Schema Validator] Converting schema format...');
      return await handleConvertSchema(command.args[0]);
    default:
      console.warn(`[Schema Validator] Unknown command: ${command.name}`);
      return { error: `Unknown command: ${command.name}` };
  }
}

// Define schemas for Schema Validator tool
export const ValidateSchemaSchema = z.object({
  schemaPath: z.string().optional(),
  schemaContent: z.string().optional(),
  schemaFormat: z.enum(['json', 'yaml', 'typescript', 'graphql', 'avro']).optional().default('json'),
  dataPath: z.string().optional(),
  dataContent: z.string().optional(),
  dataFormat: z.enum(['json', 'yaml', 'csv', 'txt']).optional().default('json'),
  options: z.object({
    allowUnknownProperties: z.boolean().optional(),
    coerceTypes: z.boolean().optional(),
    removeAdditional: z.boolean().optional(),
    strictArrays: z.boolean().optional(),
    strictObjects: z.boolean().optional(),
  }).optional().default({}),
}).refine(
  data => data.schemaPath !== undefined || data.schemaContent !== undefined,
  {
    message: 'Either schemaPath or schemaContent must be provided',
    path: ['schema'],
  }
).refine(
  data => data.dataPath !== undefined || data.dataContent !== undefined,
  {
    message: 'Either dataPath or dataContent must be provided',
    path: ['data'],
  }
);

export const CompileSchemaSchema = z.object({
  schemaPath: z.string().optional(),
  schemaContent: z.string().optional(),
  schemaFormat: z.enum(['json', 'yaml', 'typescript', 'graphql', 'avro']).optional().default('json'),
  outputFormat: z.enum(['json', 'typescript']).optional().default('json'),
  outputPath: z.string().optional(),
}).refine(
  data => data.schemaPath !== undefined || data.schemaContent !== undefined,
  {
    message: 'Either schemaPath or schemaContent must be provided',
    path: ['schema'],
  }
);

export const AnalyzeSchemaSchema = z.object({
  schemaPath: z.string().optional(),
  schemaContent: z.string().optional(),
  schemaFormat: z.enum(['json', 'yaml', 'typescript', 'graphql', 'avro']).optional().default('json'),
  includeStats: z.boolean().optional().default(true),
  includeValidation: z.boolean().optional().default(true),
}).refine(
  data => data.schemaPath !== undefined || data.schemaContent !== undefined,
  {
    message: 'Either schemaPath or schemaContent must be provided',
    path: ['schema'],
  }
);

export const GenerateSchemaSchema = z.object({
  dataPath: z.string().optional(),
  dataContent: z.string().optional(),
  dataFormat: z.enum(['json', 'yaml', 'csv', 'txt']).optional().default('json'),
  outputFormat: z.enum(['json', 'typescript']).optional().default('json'),
  outputPath: z.string().optional(),
  options: z.object({
    required: z.boolean().optional().default(false),
    examples: z.boolean().optional().default(true),
    descriptions: z.boolean().optional().default(true),
  }).optional().default({}),
}).refine(
  data => data.dataPath !== undefined || data.dataContent !== undefined,
  {
    message: 'Either dataPath or dataContent must be provided',
    path: ['data'],
  }
);

export const ConvertSchemaSchema = z.object({
  schemaPath: z.string().optional(),
  schemaContent: z.string().optional(),
  sourceFormat: z.enum(['json', 'yaml', 'typescript', 'graphql', 'avro']).optional().default('json'),
  targetFormat: z.enum(['json', 'typescript']).default('json'),
  outputPath: z.string().optional(),
}).refine(
  data => data.schemaPath !== undefined || data.schemaContent !== undefined,
  {
    message: 'Either schemaPath or schemaContent must be provided',
    path: ['schema'],
  }
);

/**
 * Check if a file is likely a schema file
 */
function isSchemaFile(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  const fileName = path.basename(filePath).toLowerCase();
  
  return ext === '.json' && (
    fileName.includes('schema') ||
    fileName.includes('swagger') ||
    fileName.includes('openapi') ||
    fileName.endsWith('.schema.json')
  ) || ext === '.graphql' ||
    ext === '.gql' ||
    ext === '.avsc' ||
    fileName.endsWith('.d.ts') ||
    fileName.includes('schema') ||
    fileName.includes('type');
}

/**
 * Check if a file is a data file that might need validation
 */
function isDataFile(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  return ext === '.json' || ext === '.yaml' || ext === '.yml' || ext === '.csv' || ext === '.txt';
}

/**
 * Parse schema based on its format
 */
async function parseSchema(
  schemaPath: string | undefined,
  schemaContent: string | undefined,
  schemaFormat: SchemaFormat
): Promise<any> {
  // Check if schema is already cached
  if (schemaPath) {
    const normalizedPath = path.normalize(schemaPath);
    if (schemasCache.has(normalizedPath)) {
      return schemasCache.get(normalizedPath);
    }
  }
  
  // Get schema content
  let content: string;
  if (schemaContent) {
    content = schemaContent;
  } else if (schemaPath) {
    try {
      content = await fs.readFile(schemaPath, 'utf8');
    } catch (error) {
      throw new Error(`Failed to read schema file: ${error}`);
    }
  } else {
    throw new Error('Either schemaPath or schemaContent must be provided');
  }
  
  // Parse based on format
  let parsed: any;
  
  switch (schemaFormat) {
    case 'json':
      try {
        parsed = JSON.parse(content);
      } catch (error) {
        throw new Error(`Failed to parse JSON schema: ${error}`);
      }
      break;
      
    case 'yaml':
      try {
        // In a real implementation, this would use a YAML parser
        throw new Error('YAML schema parsing not implemented in boilerplate');
      } catch (error) {
        throw new Error(`Failed to parse YAML schema: ${error}`);
      }
      
    case 'typescript':
      // For boilerplate, we'll use a simple approach that doesn't actually parse TypeScript
      try {
        // Extract interface or type properties
        const typeRegex = /(?:interface|type)\s+(\w+)\s*(?:extends\s+\w+\s*)?\{([^}]+)\}/g;
        const matches = content.matchAll(typeRegex);
        
        parsed = {};
        
        for (const match of matches) {
          const typeName = match[1];
          const typeBody = match[2];
          
          // Extract properties
          const propertyRegex = /(\w+)(?:\?)?:\s*([^;\n]+)/g;
          const properties: any = {};
          
          let propertyMatch;
          while ((propertyMatch = propertyRegex.exec(typeBody)) !== null) {
            const propName = propertyMatch[1];
            const propType = propertyMatch[2].trim();
            
            properties[propName] = {
              type: convertTsTypeToJsonSchemaType(propType)
            };
          }
          
          parsed[typeName] = {
            type: 'object',
            properties
          };
        }
      } catch (error) {
        throw new Error(`Failed to parse TypeScript schema: ${error}`);
      }
      break;
      
    case 'graphql':
      // For boilerplate, we'll use a simple approach that doesn't actually parse GraphQL
      try {
        // Extract type definitions
        const typeRegex = /type\s+(\w+)\s*\{([^}]+)\}/g;
        const matches = content.matchAll(typeRegex);
        
        parsed = { types: {} };
        
        for (const match of matches) {
          const typeName = match[1];
          const typeBody = match[2];
          
          // Extract fields
          const fieldRegex = /(\w+)(?:\(.*\))?\s*:\s*([^!\n]+)(!)?/g;
          const fields: any = {};
          
          let fieldMatch;
          while ((fieldMatch = fieldRegex.exec(typeBody)) !== null) {
            const fieldName = fieldMatch[1];
            const fieldType = fieldMatch[2].trim();
            const required = fieldMatch[3] === '!';
            
            fields[fieldName] = {
              type: convertGraphQLTypeToJsonSchemaType(fieldType),
              required
            };
          }
          
          parsed.types[typeName] = {
            type: 'object',
            properties: fields
          };
        }
      } catch (error) {
        throw new Error(`Failed to parse GraphQL schema: ${error}`);
      }
      break;
      
    case 'avro':
      try {
        // Assume Avro schema is in JSON format
        parsed = JSON.parse(content);
      } catch (error) {
        throw new Error(`Failed to parse Avro schema: ${error}`);
      }
      break;
      
    default:
      throw new Error(`Unsupported schema format: ${schemaFormat}`);
  }
  
  // Cache parsed schema if path is provided
  if (schemaPath) {
    const normalizedPath = path.normalize(schemaPath);
    schemasCache.set(normalizedPath, parsed);
  }
  
  return parsed;
}

/**
 * Convert TypeScript type to JSON Schema type
 */
function convertTsTypeToJsonSchemaType(tsType: string): any {
  if (tsType.includes('string')) {
    return { type: 'string' };
  } else if (tsType.includes('number')) {
    return { type: 'number' };
  } else if (tsType.includes('boolean')) {
    return { type: 'boolean' };
  } else if (tsType.includes('Date')) {
    return { type: 'string', format: 'date-time' };
  } else if (tsType.includes('Array') || tsType.includes('[]')) {
    // Extract inner type for arrays
    const innerTypeMatch = tsType.match(/Array<([^>]+)>|(\w+)\[\]/);
    const innerType = innerTypeMatch ? innerTypeMatch[1] || innerTypeMatch[2] : 'any';
    
    return {
      type: 'array',
      items: convertTsTypeToJsonSchemaType(innerType)
    };
  } else if (tsType.includes('Record') || tsType.includes('object')) {
    return {
      type: 'object',
      additionalProperties: true
    };
  } else if (tsType.includes('|')) {
    // Handle union types
    const unionTypes = tsType.split('|').map(t => t.trim());
    return {
      oneOf: unionTypes.map(convertTsTypeToJsonSchemaType)
    };
  } else {
    // Assume it's a reference to another type
    return { $ref: `#/definitions/${tsType}` };
  }
}

/**
 * Convert GraphQL type to JSON Schema type
 */
function convertGraphQLTypeToJsonSchemaType(graphQLType: string): any {
  if (graphQLType.includes('String')) {
    return { type: 'string' };
  } else if (graphQLType.includes('Int')) {
    return { type: 'integer' };
  } else if (graphQLType.includes('Float')) {
    return { type: 'number' };
  } else if (graphQLType.includes('Boolean')) {
    return { type: 'boolean' };
  } else if (graphQLType.includes('ID')) {
    return { type: 'string' };
  } else if (graphQLType.includes('[') && graphQLType.includes(']')) {
    // Extract inner type for arrays
    const innerTypeMatch = graphQLType.match(/\[(\w+)\]/);
    const innerType = innerTypeMatch ? innerTypeMatch[1] : 'String';
    
    return {
      type: 'array',
      items: convertGraphQLTypeToJsonSchemaType(innerType)
    };
  } else {
    // Assume it's a reference to another type
    return { $ref: `#/definitions/${graphQLType}` };
  }
}

/**
 * Parse data based on its format
 */
async function parseData(
  dataPath: string | undefined,
  dataContent: string | undefined,
  dataFormat: DataFormat
): Promise<any> {
  // Get data content
  let content: string;
  if (dataContent) {
    content = dataContent;
  } else if (dataPath) {
    try {
      content = await fs.readFile(dataPath, 'utf8');
    } catch (error) {
      throw new Error(`Failed to read data file: ${error}`);
    }
  } else {
    throw new Error('Either dataPath or dataContent must be provided');
  }
  
  // Parse based on format
  switch (dataFormat) {
    case 'json':
      try {
        return JSON.parse(content);
      } catch (error) {
        throw new Error(`Failed to parse JSON data: ${error}`);
      }
      
    case 'yaml':
      try {
        // In a real implementation, this would use a YAML parser
        throw new Error('YAML data parsing not implemented in boilerplate');
      } catch (error) {
        throw new Error(`Failed to parse YAML data: ${error}`);
      }
      
    case 'csv':
      try {
        // In a real implementation, this would use a CSV parser
        // For now, just do a simple parse of CSV to objects
        const lines = content.split('\n').filter(line => line.trim().length > 0);
        if (lines.length === 0) {
          return [];
        }
        
        const headers = lines[0].split(',').map(h => h.trim());
        const result = [];
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          const obj: Record<string, string> = {};
          
          for (let j = 0; j < headers.length && j < values.length; j++) {
            obj[headers[j]] = values[j];
          }
          
          result.push(obj);
        }
        
        return result;
      } catch (error) {
        throw new Error(`Failed to parse CSV data: ${error}`);
      }
      
    case 'txt':
      // Treat as plain text - return as is
      return content;
      
    default:
      throw new Error(`Unsupported data format: ${dataFormat}`);
  }
}

/**
 * Validate data against a schema
 */
function validateAgainstSchema(
  schema: any,
  data: any,
  options: {
    allowUnknownProperties: boolean;
    coerceTypes: boolean;
    removeAdditional: boolean;
    strictArrays: boolean;
    strictObjects: boolean;
  } = defaultValidatorOptions
): ValidationResult {
  // For boilerplate, we'll implement a very basic validator
  // In a real implementation, this would use a proper JSON Schema validator
  
  const errors: ValidationError[] = [];
  
  // Recursive validation function
  function validate(schemaNode: any, dataNode: any, path: string = ''): boolean {
    // Handle null or undefined
    if (dataNode === null || dataNode === undefined) {
      if (schemaNode.required) {
        errors.push({
          path,
          message: 'Required value is missing',
          expected: schemaNode.type,
          received: 'null'
        });
        return false;
      }
      return true;
    }
    
    // Handle type validation
    if (schemaNode.type) {
      const dataType = Array.isArray(dataNode) ? 'array' : typeof dataNode;
      
      // Check if type matches
      if (
        (schemaNode.type === 'string' && dataType !== 'string') ||
        (schemaNode.type === 'number' && dataType !== 'number') ||
        (schemaNode.type === 'integer' && (dataType !== 'number' || !Number.isInteger(dataNode))) ||
        (schemaNode.type === 'boolean' && dataType !== 'boolean') ||
        (schemaNode.type === 'array' && dataType !== 'array') ||
        (schemaNode.type === 'object' && dataType !== 'object')
      ) {
        errors.push({
          path,
          message: `Type mismatch at ${path}`,
          expected: schemaNode.type,
          received: dataType,
          value: dataNode
        });
        return false;
      }
      
      // Additional type-specific validations
      if (schemaNode.type === 'string') {
        if (schemaNode.minLength !== undefined && dataNode.length < schemaNode.minLength) {
          errors.push({
            path,
            message: `String is too short at ${path}`,
            expected: `minLength ${schemaNode.minLength}`,
            received: `length ${dataNode.length}`,
            value: dataNode
          });
          return false;
        }
        
        if (schemaNode.maxLength !== undefined && dataNode.length > schemaNode.maxLength) {
          errors.push({
            path,
            message: `String is too long at ${path}`,
            expected: `maxLength ${schemaNode.maxLength}`,
            received: `length ${dataNode.length}`,
            value: dataNode
          });
          return false;
        }
        
        if (schemaNode.pattern && !new RegExp(schemaNode.pattern).test(dataNode)) {
          errors.push({
            path,
            message: `String does not match pattern at ${path}`,
            expected: schemaNode.pattern,
            value: dataNode
          });
          return false;
        }
      }
      
      if (schemaNode.type === 'number' || schemaNode.type === 'integer') {
        if (schemaNode.minimum !== undefined && dataNode < schemaNode.minimum) {
          errors.push({
            path,
            message: `Number is too small at ${path}`,
            expected: `minimum ${schemaNode.minimum}`,
            received: dataNode,
            value: dataNode
          });
          return false;
        }
        
        if (schemaNode.maximum !== undefined && dataNode > schemaNode.maximum) {
          errors.push({
            path,
            message: `Number is too large at ${path}`,
            expected: `maximum ${schemaNode.maximum}`,
            received: dataNode,
            value: dataNode
          });
          return false;
        }
      }
      
      if (schemaNode.type === 'array') {
        if (schemaNode.minItems !== undefined && dataNode.length < schemaNode.minItems) {
          errors.push({
            path,
            message: `Array is too short at ${path}`,
            expected: `minItems ${schemaNode.minItems}`,
            received: `length ${dataNode.length}`,
            value: dataNode
          });
          return false;
        }
        
        if (schemaNode.maxItems !== undefined && dataNode.length > schemaNode.maxItems) {
          errors.push({
            path,
            message: `Array is too long at ${path}`,
            expected: `maxItems ${schemaNode.maxItems}`,
            received: `length ${dataNode.length}`,
            value: dataNode
          });
          return false;
        }
        
        // Validate items
        if (schemaNode.items) {
          let allValid = true;
          for (let i = 0; i < dataNode.length; i++) {
            const itemPath = `${path}[${i}]`;
            const isValid = validate(schemaNode.items, dataNode[i], itemPath);
            allValid = allValid && isValid;
          }
          return allValid;
        }
      }
      
      if (schemaNode.type === 'object') {
        let allValid = true;
        
        // Check required properties
        if (schemaNode.required) {
          for (const required of schemaNode.required) {
            if (!(required in dataNode)) {
              errors.push({
                path: `${path}${path ? '.' : ''}${required}`,
                message: `Required property '${required}' is missing`,
                expected: 'property to exist',
                received: 'undefined'
              });
              allValid = false;
            }
          }
        }
        
        // Check properties
        if (schemaNode.properties) {
          for (const [propName, propSchema] of Object.entries<any>(schemaNode.properties)) {
            if (propName in dataNode) {
              const propPath = `${path}${path ? '.' : ''}${propName}`;
              const isValid = validate(propSchema, dataNode[propName], propPath);
              allValid = allValid && isValid;
            }
          }
        }
        
        // Check for additional properties
        if (!options.allowUnknownProperties && schemaNode.additionalProperties === false) {
          for (const propName of Object.keys(dataNode)) {
            if (!schemaNode.properties || !(propName in schemaNode.properties)) {
              errors.push({
                path: `${path}${path ? '.' : ''}${propName}`,
                message: `Additional property '${propName}' is not allowed`,
                value: dataNode[propName]
              });
              allValid = false;
            }
          }
        }
        
        return allValid;
      }
    }
    
    // If we got here, default to valid
    return true;
  }
  
  // Start validation with the root
  const isValid = validate(schema, data);
  
  return {
    valid: isValid,
    errors
  };
}

/**
 * Get information about a schema
 */
function getSchemaInfo(schema: any, format: SchemaFormat): SchemaInfo {
  const info: SchemaInfo = {
    format,
    name: schema.title || schema.$id || 'Unnamed Schema',
    properties: 0,
    required: []
  };
  
  if (schema.description) {
    info.description = schema.description;
  }
  
  if (schema.version) {
    info.version = schema.version;
  }
  
  if (schema.type === 'object' && schema.properties) {
    info.properties = Object.keys(schema.properties).length;
    info.required = schema.required || [];
  }
  
  return info;
}

/**
 * Generate a basic JSON schema from data samples
 */
function generateSchemaFromData(
  data: any, 
  options: { 
    required: boolean;
    examples: boolean;
    descriptions: boolean;
  }
): any {
  // Handle arrays
  if (Array.isArray(data)) {
    // Empty array
    if (data.length === 0) {
      return {
        type: 'array',
        items: {}
      };
    }
    
    // For an array, infer schema from the first item
    // In a proper implementation, we would examine all items
    const itemSchema = generateSchemaFromData(data[0], options);
    
    return {
      type: 'array',
      items: itemSchema
    };
  }
  
  // Handle null
  if (data === null) {
    return { type: 'null' };
  }
  
  // Handle primitives
  if (typeof data !== 'object') {
    const schema: any = { type: typeof data };
    
    if (options.examples) {
      schema.examples = [data];
    }
    
    return schema;
  }
  
  // Handle objects
  const properties: Record<string, any> = {};
  const required: string[] = [];
  
  for (const [key, value] of Object.entries(data)) {
    properties[key] = generateSchemaFromData(value, options);
    
    // Add to required if option is enabled
    if (options.required && value !== null && value !== undefined) {
      required.push(key);
    }
  }
  
  const schema: any = {
    type: 'object',
    properties
  };
  
  if (required.length > 0) {
    schema.required = required;
  }
  
  if (options.descriptions) {
    schema.description = 'Generated schema from data sample';
  }
  
  return schema;
}

/**
 * Handles validating data against a schema
 */
async function handleValidateSchema(args: any) {
  try {
    const result = ValidateSchemaSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for validating schema"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const {
      schemaPath,
      schemaContent,
      schemaFormat,
      dataPath,
      dataContent,
      dataFormat,
      options
    } = result.data;
    
    // Create cache key
    const cacheKey = JSON.stringify({
      schemaPath,
      schemaContent,
      schemaFormat,
      dataPath,
      dataContent,
      dataFormat,
      options
    });
    
    // Check cache
    if (validationCache.has(cacheKey)) {
      const cachedResult = validationCache.get(cacheKey)!;
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            valid: cachedResult.valid,
            errors: cachedResult.errors,
            cached: true,
            message: cachedResult.valid 
              ? 'Data is valid against schema (cached result)' 
              : `Data is invalid against schema with ${cachedResult.errors.length} errors (cached result)`
          }, null, 2)
        }]
      };
    }
    
    // Parse schema and data
    const schema = await parseSchema(schemaPath, schemaContent, schemaFormat);
    const data = await parseData(dataPath, dataContent, dataFormat);
    
    // Merge options with defaults
    const validationOptions = {
      ...defaultValidatorOptions,
      ...options
    };
    
    // Validate data against schema
    const validationResult = validateAgainstSchema(schema, data, validationOptions);
    
    // Cache the result
    validationCache.set(cacheKey, validationResult);
    
    // Prepare response
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          valid: validationResult.valid,
          errors: validationResult.errors,
          message: validationResult.valid 
            ? 'Data is valid against schema' 
            : `Data is invalid against schema with ${validationResult.errors.length} errors`
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to validate schema"
        }, null, 2)
      }],
      isError: true
    };
  }
}

/**
 * Handles compiling a schema
 */
async function handleCompileSchema(args: any) {
  try {
    const result = CompileSchemaSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for compiling schema"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const {
      schemaPath,
      schemaContent,
      schemaFormat,
      outputFormat,
      outputPath
    } = result.data;
    
    // Parse schema
    const schema = await parseSchema(schemaPath, schemaContent, schemaFormat);
    
    let compiledSchema: string;
    
    // Compile schema to target format
    if (outputFormat === 'json') {
      compiledSchema = JSON.stringify(schema, null, 2);
    } else if (outputFormat === 'typescript') {
      compiledSchema = generateTypeScriptFromSchema(schema);
    } else {
      throw new Error(`Unsupported output format: ${outputFormat}`);
    }
    
    // Write to file if output path is provided
    if (outputPath) {
      try {
        // Create directory if it doesn't exist
        const dir = path.dirname(outputPath);
        if (!fsSync.existsSync(dir)) {
          await fs.mkdir(dir, { recursive: true });
        }
        
        await fs.writeFile(outputPath, compiledSchema, 'utf8');
      } catch (error) {
        throw new Error(`Failed to write compiled schema to file: ${error}`);
      }
    }
    
    // Prepare response
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          format: outputFormat,
          schema: compiledSchema,
          outputPath,
          message: `Successfully compiled schema to ${outputFormat}${outputPath ? ` and saved to ${outputPath}` : ''}`
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to compile schema"
        }, null, 2)
      }],
      isError: true
    };
  }
}

/**
 * Generate TypeScript types from JSON Schema
 */
function generateTypeScriptFromSchema(schema: any): string {
  // For boilerplate, we'll implement a very basic converter
  // In a real implementation, this would be much more sophisticated
  
  let output = '// Generated TypeScript types\n\n';
  
  // Helper function to convert schema type to TypeScript type
  function getTypeFromSchema(propSchema: any): string {
    if (!propSchema || !propSchema.type) {
      return 'any';
    }
    
    switch (propSchema.type) {
      case 'string':
        return 'string';
      case 'number':
      case 'integer':
        return 'number';
      case 'boolean':
        return 'boolean';
      case 'array':
        if (propSchema.items) {
          return `${getTypeFromSchema(propSchema.items)}[]`;
        }
        return 'any[]';
      case 'object':
        // For objects, we could recurse or use Record
        return 'Record<string, any>';
      case 'null':
        return 'null';
      default:
        return 'any';
    }
  }
  
  // Generate interface if schema is an object
  if (schema.type === 'object' && schema.properties) {
    const title = schema.title ? pascal(schema.title) : 'Root';
    output += `interface ${title} {\n`;
    
    // Add properties
    for (const [propName, propSchema] of Object.entries<any>(schema.properties)) {
      // Add description if available
      if (propSchema.description) {
        output += `  /**\n   * ${propSchema.description}\n   */\n`;
      }
      
      // Determine if property is required
      const isRequired = schema.required && schema.required.includes(propName);
      
      // Add property
      output += `  ${propName}${isRequired ? '' : '?'}: ${getTypeFromSchema(propSchema)};\n`;
    }
    
    output += '}\n';
  }
  
  return output;
}

/**
 * Convert string to pascal case
 */
function pascal(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .split(' ')
    .map(s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
    .join('');
}

/**
 * Handles analyzing a schema
 */
async function handleAnalyzeSchema(args: any) {
  try {
    const result = AnalyzeSchemaSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for analyzing schema"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const {
      schemaPath,
      schemaContent,
      schemaFormat,
      includeStats,
      includeValidation
    } = result.data;
    
    // Parse schema
    const schema = await parseSchema(schemaPath, schemaContent, schemaFormat);
    
    // Get schema info
    const info = getSchemaInfo(schema, schemaFormat);
    
    // Prepare analysis
    const analysis: any = {
      info
    };
    
    // Include statistics if requested
    if (includeStats) {
      // Count properties, nested objects, enums, etc.
      analysis.stats = analyzeSchemaStats(schema);
    }
    
    // Include schema validation if requested
    if (includeValidation) {
      // Validate the schema itself (not data against the schema)
      analysis.validation = validateSchema(schema);
    }
    
    // Prepare response
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          analysis,
          message: `Successfully analyzed ${info.name} schema`
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to analyze schema"
        }, null, 2)
      }],
      isError: true
    };
  }
}

/**
 * Analyze statistics for a schema
 */
function analyzeSchemaStats(schema: any): any {
  // For boilerplate, we'll implement basic stats
  const stats: any = {
    depth: 0,
    propertyCount: 0,
    requiredCount: 0,
    objectCount: 0,
    arrayCount: 0,
    enumCount: 0,
    primitiveCount: 0
  };
  
  // Recursive function to analyze schema
  function analyze(node: any, depth: number = 0) {
    if (!node) return;
    
    // Update max depth
    stats.depth = Math.max(stats.depth, depth);
    
    // Handle object type
    if (node.type === 'object' && node.properties) {
      stats.objectCount++;
      
      // Count required properties
      if (node.required) {
        stats.requiredCount += node.required.length;
      }
      
      // Count properties
      const propCount = Object.keys(node.properties).length;
      stats.propertyCount += propCount;
      
      // Analyze each property
      for (const propSchema of Object.values<any>(node.properties)) {
        analyze(propSchema, depth + 1);
      }
    }
    
    // Handle array type
    else if (node.type === 'array' && node.items) {
      stats.arrayCount++;
      analyze(node.items, depth + 1);
    }
    
    // Handle enum
    else if (node.enum) {
      stats.enumCount++;
    }
    
    // Handle primitive types
    else if (['string', 'number', 'integer', 'boolean', 'null'].includes(node.type)) {
      stats.primitiveCount++;
    }
  }
  
  // Start analysis
  analyze(schema);
  
  return stats;
}

/**
 * Validate a schema itself (not data against the schema)
 */
function validateSchema(schema: any): any {
  // For boilerplate, we'll implement basic schema validation
  const issues: any[] = [];
  
  // Check if schema has a type
  if (!schema.type) {
    issues.push({
      path: '',
      message: 'Schema root does not specify a type',
      severity: 'warning'
    });
  }
  
  // Check for missing descriptions
  if (!schema.description) {
    issues.push({
      path: '',
      message: 'Schema does not have a description',
      severity: 'info'
    });
  }
  
  // Check for object schemas
  if (schema.type === 'object') {
    // Check if properties are defined
    if (!schema.properties) {
      issues.push({
        path: '',
        message: 'Object schema does not define properties',
        severity: 'warning'
      });
    } else {
      // Check each property
      for (const [propName, propSchema] of Object.entries<any>(schema.properties)) {
        const propPath = `.properties.${propName}`;
        
        // Check if property has a type
        if (!propSchema.type) {
          issues.push({
            path: propPath,
            message: `Property '${propName}' does not specify a type`,
            severity: 'warning'
          });
        }
        
        // Check if property has a description
        if (!propSchema.description) {
          issues.push({
            path: propPath,
            message: `Property '${propName}' does not have a description`,
            severity: 'info'
          });
        }
      }
    }
    
    // Check required array
    if (schema.required) {
      if (!Array.isArray(schema.required)) {
        issues.push({
          path: '.required',
          message: 'Required field must be an array',
          severity: 'error'
        });
      } else {
        // Check if all required properties exist
        for (const requiredProp of schema.required) {
          if (!schema.properties || !(requiredProp in schema.properties)) {
            issues.push({
              path: `.required[${schema.required.indexOf(requiredProp)}]`,
              message: `Required property '${requiredProp}' is not defined in properties`,
              severity: 'error'
            });
          }
        }
      }
    }
  }
  
  // Check for array schemas
  if (schema.type === 'array' && !schema.items) {
    issues.push({
      path: '',
      message: 'Array schema does not define items',
      severity: 'warning'
    });
  }
  
  return {
    valid: issues.filter(i => i.severity === 'error').length === 0,
    issues
  };
}

/**
 * Handles generating a schema from data
 */
async function handleGenerateSchema(args: any) {
  try {
    const result = GenerateSchemaSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for generating schema"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const {
      dataPath,
      dataContent,
      dataFormat,
      outputFormat,
      outputPath,
      options
    } = result.data;
    
    // Parse data
    const data = await parseData(dataPath, dataContent, dataFormat);
    
    // Generate schema from data
    const schema = generateSchemaFromData(data, options);
    
    // Add metadata
    schema.title = dataPath 
      ? path.basename(dataPath, path.extname(dataPath))
      : 'Generated Schema';
    
    schema.description = `Schema generated from ${dataPath || 'provided data'} on ${new Date().toISOString()}`;
    schema.$schema = 'http://json-schema.org/draft-07/schema#';
    
    let outputContent: string;
    
    // Format output
    if (outputFormat === 'json') {
      outputContent = JSON.stringify(schema, null, 2);
    } else if (outputFormat === 'typescript') {
      outputContent = generateTypeScriptFromSchema(schema);
    } else {
      throw new Error(`Unsupported output format: ${outputFormat}`);
    }
    
    // Write to file if output path is provided
    if (outputPath) {
      try {
        // Create directory if it doesn't exist
        const dir = path.dirname(outputPath);
        if (!fsSync.existsSync(dir)) {
          await fs.mkdir(dir, { recursive: true });
        }
        
        await fs.writeFile(outputPath, outputContent, 'utf8');
      } catch (error) {
        throw new Error(`Failed to write generated schema to file: ${error}`);
      }
    }
    
    // Prepare response
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          format: outputFormat,
          schema: outputContent,
          outputPath,
          message: `Successfully generated schema from data${outputPath ? ` and saved to ${outputPath}` : ''}`
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to generate schema"
        }, null, 2)
      }],
      isError: true
    };
  }
}

/**
 * Handles converting a schema format
 */
async function handleConvertSchema(args: any) {
  try {
    const result = ConvertSchemaSchema.safeParse(args);
    
    if (!result.success) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: result.error.format(),
            message: "Invalid arguments for converting schema"
          }, null, 2)
        }],
        isError: true
      };
    }
    
    const {
      schemaPath,
      schemaContent,
      sourceFormat,
      targetFormat,
      outputPath
    } = result.data;
    
    // Parse schema
    const schema = await parseSchema(schemaPath, schemaContent, sourceFormat);
    
    let convertedSchema: string;
    
    // Convert schema to target format
    if (targetFormat === 'json') {
      convertedSchema = JSON.stringify(schema, null, 2);
    } else if (targetFormat === 'typescript') {
      convertedSchema = generateTypeScriptFromSchema(schema);
    } else {
      throw new Error(`Unsupported target format: ${targetFormat}`);
    }
    
    // Write to file if output path is provided
    if (outputPath) {
      try {
        // Create directory if it doesn't exist
        const dir = path.dirname(outputPath);
        if (!fsSync.existsSync(dir)) {
          await fs.mkdir(dir, { recursive: true });
        }
        
        await fs.writeFile(outputPath, convertedSchema, 'utf8');
      } catch (error) {
        throw new Error(`Failed to write converted schema to file: ${error}`);
      }
    }
    
    // Prepare response
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          sourceFormat,
          targetFormat,
          schema: convertedSchema,
          outputPath,
          message: `Successfully converted schema from ${sourceFormat} to ${targetFormat}${outputPath ? ` and saved to ${outputPath}` : ''}`
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          error: String(error),
          message: "Failed to convert schema"
        }, null, 2)
      }],
      isError: true
    };
  }
}