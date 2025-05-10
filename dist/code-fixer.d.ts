export declare function activate(): void;
/**
 * Watches for file writes and analyzes for code issues
 */
export declare function onFileWrite(event: {
    path: string;
    content: string;
}): Promise<void>;
/**
 * Handles session start logic
 */
export declare function onSessionStart(session: {
    id: string;
    startTime: number;
}): void;
/**
 * Handles code-fixer commands
 */
export declare function onCommand(command: {
    name: string;
    args: any[];
}): Promise<void>;
import { z } from 'zod';
export declare const FixCodeSchema: z.ZodObject<{
    path: z.ZodString;
    content: z.ZodOptional<z.ZodString>;
    language: z.ZodOptional<z.ZodString>;
    fixTypes: z.ZodOptional<z.ZodArray<z.ZodEnum<["syntax", "formatting", "imports", "unused", "security", "performance", "accessibility", "all"]>, "many">>;
}, "strip", z.ZodTypeAny, {
    path: string;
    content?: string | undefined;
    language?: string | undefined;
    fixTypes?: ("all" | "security" | "performance" | "syntax" | "formatting" | "imports" | "unused" | "accessibility")[] | undefined;
}, {
    path: string;
    content?: string | undefined;
    language?: string | undefined;
    fixTypes?: ("all" | "security" | "performance" | "syntax" | "formatting" | "imports" | "unused" | "accessibility")[] | undefined;
}>;
export declare const AnalyzeCodeSchema: z.ZodObject<{
    path: z.ZodString;
    content: z.ZodOptional<z.ZodString>;
    language: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    path: string;
    content?: string | undefined;
    language?: string | undefined;
}, {
    path: string;
    content?: string | undefined;
    language?: string | undefined;
}>;
export declare const FixProjectSchema: z.ZodObject<{
    directory: z.ZodString;
    recursive: z.ZodOptional<z.ZodBoolean>;
    extensions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    fixTypes: z.ZodOptional<z.ZodArray<z.ZodEnum<["syntax", "formatting", "imports", "unused", "security", "performance", "accessibility", "all"]>, "many">>;
}, "strip", z.ZodTypeAny, {
    directory: string;
    recursive?: boolean | undefined;
    fixTypes?: ("all" | "security" | "performance" | "syntax" | "formatting" | "imports" | "unused" | "accessibility")[] | undefined;
    extensions?: string[] | undefined;
}, {
    directory: string;
    recursive?: boolean | undefined;
    fixTypes?: ("all" | "security" | "performance" | "syntax" | "formatting" | "imports" | "unused" | "accessibility")[] | undefined;
    extensions?: string[] | undefined;
}>;
/**
 * Fixes code issues in a file
 */
export declare function handleFixCode(args: any): Promise<{
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
}>;
/**
 * Analyzes code for issues
 */
export declare function handleAnalyzeCode(args: any): Promise<{
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
}>;
/**
 * Fixes code issues in a project directory
 */
export declare function handleFixProject(args: any): Promise<{
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
}>;
