import { z } from 'zod';
export declare function activate(): void;
/**
 * Handles file write events to detect env file changes
 */
export declare function onFileWrite(event: {
    path: string;
    content: string;
}): void;
/**
 * Handles session start logic
 */
export declare function onSessionStart(session: {
    id: string;
    startTime: number;
}): void;
/**
 * Handles env-manager commands
 */
export declare function onCommand(command: {
    name: string;
    args: any[];
}): Promise<{
    content: {
        type: string;
        text: string;
    }[];
    isError: boolean;
} | {
    content: {
        type: string;
        text: string;
    }[];
    isError?: undefined;
} | {
    error: string;
}>;
export declare const GetEnvVarSchema: z.ZodObject<{
    key: z.ZodString;
    envFile: z.ZodOptional<z.ZodString>;
    defaultValue: z.ZodOptional<z.ZodString>;
    required: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    required: boolean;
    key: string;
    defaultValue?: string | undefined;
    envFile?: string | undefined;
}, {
    key: string;
    defaultValue?: string | undefined;
    required?: boolean | undefined;
    envFile?: string | undefined;
}>;
export declare const SetEnvVarSchema: z.ZodObject<{
    key: z.ZodString;
    value: z.ZodString;
    envFile: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    createIfNotExists: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    quote: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    overwrite: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    backup: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    value: string;
    overwrite: boolean;
    key: string;
    backup: boolean;
    envFile: string;
    createIfNotExists: boolean;
    quote: boolean;
}, {
    value: string;
    key: string;
    overwrite?: boolean | undefined;
    backup?: boolean | undefined;
    envFile?: string | undefined;
    createIfNotExists?: boolean | undefined;
    quote?: boolean | undefined;
}>;
export declare const ListEnvVarsSchema: z.ZodObject<{
    envFile: z.ZodOptional<z.ZodString>;
    mask: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    filter: z.ZodOptional<z.ZodString>;
    includeSystem: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    format: z.ZodDefault<z.ZodOptional<z.ZodEnum<["json", "text", "table"]>>>;
}, "strip", z.ZodTypeAny, {
    format: "text" | "json" | "table";
    includeSystem: boolean;
    mask: boolean;
    filter?: string | undefined;
    envFile?: string | undefined;
}, {
    filter?: string | undefined;
    format?: "text" | "json" | "table" | undefined;
    includeSystem?: boolean | undefined;
    envFile?: string | undefined;
    mask?: boolean | undefined;
}>;
export declare const ValidateEnvVarsSchema: z.ZodObject<{
    envFile: z.ZodOptional<z.ZodString>;
    schema: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        type: z.ZodEnum<["string", "number", "boolean", "url", "email", "path"]>;
        required: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        defaultValue: z.ZodOptional<z.ZodAny>;
        pattern: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "string" | "number" | "boolean" | "path" | "email" | "url";
        required: boolean;
        pattern?: string | undefined;
        defaultValue?: any;
    }, {
        type: "string" | "number" | "boolean" | "path" | "email" | "url";
        pattern?: string | undefined;
        defaultValue?: any;
        required?: boolean | undefined;
    }>>>;
    templateFile: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    schema?: Record<string, {
        type: "string" | "number" | "boolean" | "path" | "email" | "url";
        required: boolean;
        pattern?: string | undefined;
        defaultValue?: any;
    }> | undefined;
    envFile?: string | undefined;
    templateFile?: string | undefined;
}, {
    schema?: Record<string, {
        type: "string" | "number" | "boolean" | "path" | "email" | "url";
        pattern?: string | undefined;
        defaultValue?: any;
        required?: boolean | undefined;
    }> | undefined;
    envFile?: string | undefined;
    templateFile?: string | undefined;
}>;
