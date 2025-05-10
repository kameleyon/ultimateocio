import { z } from 'zod';
export declare function activate(): void;
/**
 * Handles file write events to trigger API generation
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
 * Handles api-generator commands
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
export declare const CreateAPISchema: z.ZodObject<{
    name: z.ZodString;
    method: z.ZodEnum<["GET", "POST", "PUT", "DELETE", "PATCH"]>;
    path: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    requestSchema: z.ZodOptional<z.ZodAny>;
    responseSchema: z.ZodOptional<z.ZodAny>;
    authRequired: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    directory: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    path: string;
    authRequired: boolean;
    description?: string | undefined;
    requestSchema?: any;
    responseSchema?: any;
    directory?: string | undefined;
}, {
    name: string;
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    path: string;
    description?: string | undefined;
    requestSchema?: any;
    responseSchema?: any;
    authRequired?: boolean | undefined;
    directory?: string | undefined;
}>;
export declare const ListAPIsSchema: z.ZodObject<{
    directory: z.ZodOptional<z.ZodString>;
    includeSchema: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    includeSchema: boolean;
    directory?: string | undefined;
}, {
    directory?: string | undefined;
    includeSchema?: boolean | undefined;
}>;
export declare const DocumentAPISchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    directory: z.ZodOptional<z.ZodString>;
    format: z.ZodDefault<z.ZodOptional<z.ZodEnum<["json", "markdown", "html", "openapi"]>>>;
    outputPath: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    format: "json" | "markdown" | "html" | "openapi";
    name?: string | undefined;
    directory?: string | undefined;
    outputPath?: string | undefined;
}, {
    name?: string | undefined;
    directory?: string | undefined;
    format?: "json" | "markdown" | "html" | "openapi" | undefined;
    outputPath?: string | undefined;
}>;
