import { z } from 'zod';
export declare function activate(): void;
/**
 * Handles file write events to detect potential duplicates
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
 * Handles duplicate-finder commands
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
export declare const FindDuplicatesSchema: z.ZodObject<{
    directories: z.ZodArray<z.ZodString, "many">;
    compareBy: z.ZodDefault<z.ZodOptional<z.ZodEnum<["content", "name", "hash", "all"]>>>;
    recursive: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    minSize: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    maxSize: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    includePatterns: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    excludePatterns: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    similarityThreshold: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    compareContent: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    recursive: boolean;
    directories: string[];
    compareBy: "name" | "all" | "content" | "hash";
    minSize: number;
    maxSize: number;
    similarityThreshold: number;
    compareContent: boolean;
    includePatterns?: string[] | undefined;
    excludePatterns?: string[] | undefined;
}, {
    directories: string[];
    recursive?: boolean | undefined;
    includePatterns?: string[] | undefined;
    excludePatterns?: string[] | undefined;
    compareBy?: "name" | "all" | "content" | "hash" | undefined;
    minSize?: number | undefined;
    maxSize?: number | undefined;
    similarityThreshold?: number | undefined;
    compareContent?: boolean | undefined;
}>;
export declare const ScanProjectSchema: z.ZodObject<{
    projectPath: z.ZodString;
    scanType: z.ZodDefault<z.ZodOptional<z.ZodEnum<["code", "assets", "all"]>>>;
    reportLevel: z.ZodDefault<z.ZodOptional<z.ZodEnum<["summary", "detailed", "full"]>>>;
    outputPath: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    projectPath: string;
    scanType: "code" | "all" | "assets";
    reportLevel: "summary" | "detailed" | "full";
    outputPath?: string | undefined;
}, {
    projectPath: string;
    outputPath?: string | undefined;
    scanType?: "code" | "all" | "assets" | undefined;
    reportLevel?: "summary" | "detailed" | "full" | undefined;
}>;
export declare const AnalyzeFileSchema: z.ZodObject<{
    filePath: z.ZodString;
    compareAgainst: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    checkTypes: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodEnum<["exact", "fuzzy", "code-similarity", "refactored", "partial"]>, "many">>>;
}, "strip", z.ZodTypeAny, {
    filePath: string;
    checkTypes: ("exact" | "fuzzy" | "code-similarity" | "refactored" | "partial")[];
    compareAgainst?: string[] | undefined;
}, {
    filePath: string;
    compareAgainst?: string[] | undefined;
    checkTypes?: ("exact" | "fuzzy" | "code-similarity" | "refactored" | "partial")[] | undefined;
}>;
export declare const CleanupDuplicatesSchema: z.ZodObject<{
    duplicatesReport: z.ZodOptional<z.ZodString>;
    directories: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    action: z.ZodDefault<z.ZodOptional<z.ZodEnum<["delete", "move", "symlink", "report"]>>>;
    targetDirectory: z.ZodOptional<z.ZodString>;
    skipConfirmation: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    preserveNewest: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    action: "delete" | "move" | "symlink" | "report";
    skipConfirmation: boolean;
    preserveNewest: boolean;
    targetDirectory?: string | undefined;
    directories?: string[] | undefined;
    duplicatesReport?: string | undefined;
}, {
    targetDirectory?: string | undefined;
    directories?: string[] | undefined;
    duplicatesReport?: string | undefined;
    action?: "delete" | "move" | "symlink" | "report" | undefined;
    skipConfirmation?: boolean | undefined;
    preserveNewest?: boolean | undefined;
}>;
