import { z } from 'zod';
export declare function activate(): void;
/**
 * Handles file write events for cache tracking
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
 * Handles cache-cleaner commands
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
export declare const CleanCacheSchema: z.ZodObject<{
    directories: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    recursive: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    ageThreshold: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    sizeThreshold: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    dryRun: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    skipPatterns: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    recursive: boolean;
    ageThreshold: number;
    sizeThreshold: number;
    dryRun: boolean;
    directories?: string[] | undefined;
    skipPatterns?: string[] | undefined;
}, {
    recursive?: boolean | undefined;
    directories?: string[] | undefined;
    ageThreshold?: number | undefined;
    sizeThreshold?: number | undefined;
    dryRun?: boolean | undefined;
    skipPatterns?: string[] | undefined;
}>;
export declare const AnalyzeCacheSchema: z.ZodObject<{
    directories: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    recursive: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    includeDetails: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    groupBy: z.ZodDefault<z.ZodOptional<z.ZodEnum<["directory", "age", "type", "size"]>>>;
}, "strip", z.ZodTypeAny, {
    recursive: boolean;
    includeDetails: boolean;
    groupBy: "type" | "directory" | "size" | "age";
    directories?: string[] | undefined;
}, {
    recursive?: boolean | undefined;
    directories?: string[] | undefined;
    includeDetails?: boolean | undefined;
    groupBy?: "type" | "directory" | "size" | "age" | undefined;
}>;
export declare const OptimizeMemorySchema: z.ZodObject<{
    target: z.ZodDefault<z.ZodOptional<z.ZodEnum<["heap", "processes", "disk", "all"]>>>;
    aggressive: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    logLevel: z.ZodDefault<z.ZodOptional<z.ZodEnum<["silent", "normal", "verbose"]>>>;
}, "strip", z.ZodTypeAny, {
    logLevel: "silent" | "normal" | "verbose";
    target: "all" | "heap" | "processes" | "disk";
    aggressive: boolean;
}, {
    logLevel?: "silent" | "normal" | "verbose" | undefined;
    target?: "all" | "heap" | "processes" | "disk" | undefined;
    aggressive?: boolean | undefined;
}>;
export declare const CacheStatusSchema: z.ZodObject<{
    directories: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    includeSystem: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    includeSystem: boolean;
    directories?: string[] | undefined;
}, {
    directories?: string[] | undefined;
    includeSystem?: boolean | undefined;
}>;
