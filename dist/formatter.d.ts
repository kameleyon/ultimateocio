import { z } from 'zod';
export declare function activate(): void;
/**
 * Handles file write events to auto-format
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
 * Handles formatter commands
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
export declare const FormatContentSchema: z.ZodObject<{
    content: z.ZodString;
    language: z.ZodEnum<["json", "javascript", "typescript", "html", "css", "markdown", "yaml", "xml", "sql", "graphql", "python", "java", "c", "cpp", "csharp", "go", "rust", "php", "ruby", "swift"]>;
    options: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    prettier: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    content: string;
    language: "json" | "markdown" | "html" | "yaml" | "javascript" | "typescript" | "python" | "java" | "csharp" | "go" | "ruby" | "php" | "rust" | "swift" | "css" | "c" | "cpp" | "xml" | "sql" | "graphql";
    prettier: boolean;
    options?: Record<string, any> | undefined;
}, {
    content: string;
    language: "json" | "markdown" | "html" | "yaml" | "javascript" | "typescript" | "python" | "java" | "csharp" | "go" | "ruby" | "php" | "rust" | "swift" | "css" | "c" | "cpp" | "xml" | "sql" | "graphql";
    options?: Record<string, any> | undefined;
    prettier?: boolean | undefined;
}>;
export declare const FormatFileSchema: z.ZodObject<{
    path: z.ZodString;
    language: z.ZodOptional<z.ZodEnum<["json", "javascript", "typescript", "html", "css", "markdown", "yaml", "xml", "sql", "graphql", "python", "java", "c", "cpp", "csharp", "go", "rust", "php", "ruby", "swift"]>>;
    options: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    prettier: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    write: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    path: string;
    prettier: boolean;
    write: boolean;
    options?: Record<string, any> | undefined;
    language?: "json" | "markdown" | "html" | "yaml" | "javascript" | "typescript" | "python" | "java" | "csharp" | "go" | "ruby" | "php" | "rust" | "swift" | "css" | "c" | "cpp" | "xml" | "sql" | "graphql" | undefined;
}, {
    path: string;
    options?: Record<string, any> | undefined;
    language?: "json" | "markdown" | "html" | "yaml" | "javascript" | "typescript" | "python" | "java" | "csharp" | "go" | "ruby" | "php" | "rust" | "swift" | "css" | "c" | "cpp" | "xml" | "sql" | "graphql" | undefined;
    prettier?: boolean | undefined;
    write?: boolean | undefined;
}>;
export declare const DetectFormatSchema: z.ZodObject<{
    content: z.ZodOptional<z.ZodString>;
    path: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    path?: string | undefined;
    content?: string | undefined;
}, {
    path?: string | undefined;
    content?: string | undefined;
}>;
export declare const ConvertFormatSchema: z.ZodObject<{
    content: z.ZodOptional<z.ZodString>;
    path: z.ZodOptional<z.ZodString>;
    fromFormat: z.ZodEnum<["json", "yaml", "xml", "csv", "html", "markdown"]>;
    toFormat: z.ZodEnum<["json", "yaml", "xml", "csv", "html", "markdown"]>;
    options: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    write: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    outputPath: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    write: boolean;
    fromFormat: "json" | "markdown" | "html" | "csv" | "yaml" | "xml";
    toFormat: "json" | "markdown" | "html" | "csv" | "yaml" | "xml";
    path?: string | undefined;
    options?: Record<string, any> | undefined;
    outputPath?: string | undefined;
    content?: string | undefined;
}, {
    fromFormat: "json" | "markdown" | "html" | "csv" | "yaml" | "xml";
    toFormat: "json" | "markdown" | "html" | "csv" | "yaml" | "xml";
    path?: string | undefined;
    options?: Record<string, any> | undefined;
    outputPath?: string | undefined;
    content?: string | undefined;
    write?: boolean | undefined;
}>;
