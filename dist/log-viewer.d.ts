import { z } from 'zod';
export declare function activate(): void;
/**
 * Handles file write events to detect log updates
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
 * Handles log-viewer commands
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
export declare const ViewLogSchema: z.ZodObject<{
    path: z.ZodString;
    lines: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    startLine: z.ZodOptional<z.ZodNumber>;
    endLine: z.ZodOptional<z.ZodNumber>;
    parseJson: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    filterLevel: z.ZodOptional<z.ZodString>;
    filterText: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    path: string;
    lines: number;
    parseJson: boolean;
    startLine?: number | undefined;
    endLine?: number | undefined;
    filterLevel?: string | undefined;
    filterText?: string | undefined;
}, {
    path: string;
    lines?: number | undefined;
    startLine?: number | undefined;
    endLine?: number | undefined;
    parseJson?: boolean | undefined;
    filterLevel?: string | undefined;
    filterText?: string | undefined;
}>;
export declare const ListLogsSchema: z.ZodObject<{
    directory: z.ZodOptional<z.ZodString>;
    recursive: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    includeMetadata: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    sortBy: z.ZodDefault<z.ZodOptional<z.ZodEnum<["name", "size", "modified"]>>>;
    sortDirection: z.ZodDefault<z.ZodOptional<z.ZodEnum<["asc", "desc"]>>>;
}, "strip", z.ZodTypeAny, {
    recursive: boolean;
    includeMetadata: boolean;
    sortBy: "name" | "modified" | "size";
    sortDirection: "asc" | "desc";
    directory?: string | undefined;
}, {
    directory?: string | undefined;
    recursive?: boolean | undefined;
    includeMetadata?: boolean | undefined;
    sortBy?: "name" | "modified" | "size" | undefined;
    sortDirection?: "asc" | "desc" | undefined;
}>;
export declare const SearchLogsSchema: z.ZodObject<{
    paths: z.ZodUnion<[z.ZodArray<z.ZodString, "many">, z.ZodString]>;
    query: z.ZodString;
    caseSensitive: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    includeContext: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    contextLines: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    query: string;
    paths: string | string[];
    caseSensitive: boolean;
    includeContext: boolean;
    contextLines: number;
}, {
    query: string;
    paths: string | string[];
    limit?: number | undefined;
    caseSensitive?: boolean | undefined;
    includeContext?: boolean | undefined;
    contextLines?: number | undefined;
}>;
export declare const TailLogSchema: z.ZodObject<{
    path: z.ZodString;
    lines: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    parseJson: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    path: string;
    lines: number;
    parseJson: boolean;
}, {
    path: string;
    lines?: number | undefined;
    parseJson?: boolean | undefined;
}>;
