import { z } from 'zod';
export declare function activate(): void;
/**
 * We don't handle file writes directly in the file-watcher
 * as it's the watcher itself
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
 * Handles file-watcher commands
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
export declare const WatchPathSchema: z.ZodObject<{
    path: z.ZodString;
    recursive: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    filter: z.ZodOptional<z.ZodString>;
    ignorePatterns: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    debounceMs: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    persistent: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    path: string;
    recursive: boolean;
    debounceMs: number;
    persistent: boolean;
    filter?: string | undefined;
    ignorePatterns?: string[] | undefined;
}, {
    path: string;
    filter?: string | undefined;
    recursive?: boolean | undefined;
    ignorePatterns?: string[] | undefined;
    debounceMs?: number | undefined;
    persistent?: boolean | undefined;
}>;
export declare const UnwatchPathSchema: z.ZodObject<{
    path: z.ZodString;
}, "strip", z.ZodTypeAny, {
    path: string;
}, {
    path: string;
}>;
export declare const ListWatchesSchema: z.ZodObject<{
    includeStats: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    includeStats: boolean;
}, {
    includeStats?: boolean | undefined;
}>;
export declare const GetEventsSchema: z.ZodObject<{
    path: z.ZodOptional<z.ZodString>;
    eventTypes: z.ZodOptional<z.ZodArray<z.ZodEnum<["add", "change", "unlink"]>, "many">>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    since: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    path?: string | undefined;
    eventTypes?: ("add" | "change" | "unlink")[] | undefined;
    since?: number | undefined;
}, {
    path?: string | undefined;
    limit?: number | undefined;
    eventTypes?: ("add" | "change" | "unlink")[] | undefined;
    since?: number | undefined;
}>;
