import { z } from 'zod';
export declare function activate(): void;
/**
 * Handles file write events
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
 * Handles refactor-tool commands
 */
export declare function onCommand(command: {
    name: string;
    args: any[];
}): Promise<{
    content: {
        type: string;
        text: string;
    }[];
} | {
    error: string;
}>;
export declare const RenameSymbolSchema: z.ZodObject<{
    filePath: z.ZodString;
    symbol: z.ZodString;
    newName: z.ZodString;
    isGlobal: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    dryRun: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    symbol: string;
    dryRun: boolean;
    filePath: string;
    newName: string;
    isGlobal: boolean;
}, {
    symbol: string;
    filePath: string;
    newName: string;
    dryRun?: boolean | undefined;
    isGlobal?: boolean | undefined;
}>;
export declare const ExtractMethodSchema: z.ZodObject<{
    filePath: z.ZodString;
    startLine: z.ZodNumber;
    endLine: z.ZodNumber;
    methodName: z.ZodString;
    visibility: z.ZodDefault<z.ZodOptional<z.ZodEnum<["public", "private", "protected"]>>>;
    returnType: z.ZodOptional<z.ZodString>;
    dryRun: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    dryRun: boolean;
    filePath: string;
    startLine: number;
    endLine: number;
    methodName: string;
    visibility: "public" | "private" | "protected";
    returnType?: string | undefined;
}, {
    filePath: string;
    startLine: number;
    endLine: number;
    methodName: string;
    dryRun?: boolean | undefined;
    visibility?: "public" | "private" | "protected" | undefined;
    returnType?: string | undefined;
}>;
export declare const ExtractInterfaceSchema: z.ZodObject<{
    filePath: z.ZodString;
    className: z.ZodString;
    interfaceName: z.ZodString;
    methods: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    properties: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    outputPath: z.ZodOptional<z.ZodString>;
    dryRun: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    dryRun: boolean;
    filePath: string;
    className: string;
    interfaceName: string;
    outputPath?: string | undefined;
    methods?: string[] | undefined;
    properties?: string[] | undefined;
}, {
    filePath: string;
    className: string;
    interfaceName: string;
    outputPath?: string | undefined;
    dryRun?: boolean | undefined;
    methods?: string[] | undefined;
    properties?: string[] | undefined;
}>;
export declare const MoveSymbolSchema: z.ZodObject<{
    sourcePath: z.ZodString;
    targetPath: z.ZodString;
    symbol: z.ZodString;
    updateImports: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    dryRun: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    symbol: string;
    dryRun: boolean;
    sourcePath: string;
    targetPath: string;
    updateImports: boolean;
}, {
    symbol: string;
    sourcePath: string;
    targetPath: string;
    dryRun?: boolean | undefined;
    updateImports?: boolean | undefined;
}>;
export declare const InlineCodeSchema: z.ZodObject<{
    filePath: z.ZodString;
    targetType: z.ZodEnum<["variable", "method", "function"]>;
    targetName: z.ZodString;
    dryRun: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    dryRun: boolean;
    filePath: string;
    targetType: "function" | "method" | "variable";
    targetName: string;
}, {
    filePath: string;
    targetType: "function" | "method" | "variable";
    targetName: string;
    dryRun?: boolean | undefined;
}>;
export declare const AnalyzeCodeSchema: z.ZodObject<{
    paths: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    path: z.ZodOptional<z.ZodString>;
    suggestionTypes: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodEnum<["unused", "duplicate", "long-methods", "complex-conditions", "large-classes"]>, "many">>>;
}, "strip", z.ZodTypeAny, {
    suggestionTypes: ("unused" | "duplicate" | "long-methods" | "complex-conditions" | "large-classes")[];
    path?: string | undefined;
    paths?: string[] | undefined;
}, {
    path?: string | undefined;
    paths?: string[] | undefined;
    suggestionTypes?: ("unused" | "duplicate" | "long-methods" | "complex-conditions" | "large-classes")[] | undefined;
}>;
