import { z } from 'zod';
export declare enum LogLevel {
    DEBUG = "debug",
    INFO = "info",
    WARN = "warn",
    ERROR = "error",
    FATAL = "fatal"
}
export declare function activate(): void;
/**
 * Handles file write events to detect errors and log them
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
 * Handles error-logger commands
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
export declare const LogSchema: z.ZodObject<{
    level: z.ZodDefault<z.ZodEnum<["debug", "info", "warn", "error", "fatal"]>>;
    message: z.ZodString;
    error: z.ZodOptional<z.ZodAny>;
    source: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    details: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    timestamp: z.ZodOptional<z.ZodNumber>;
    file: z.ZodOptional<z.ZodString>;
    sessionId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    message: string;
    level: "error" | "debug" | "info" | "warn" | "fatal";
    error?: any;
    sessionId?: string | undefined;
    tags?: string[] | undefined;
    timestamp?: number | undefined;
    file?: string | undefined;
    source?: string | undefined;
    details?: Record<string, any> | undefined;
}, {
    message: string;
    error?: any;
    sessionId?: string | undefined;
    tags?: string[] | undefined;
    timestamp?: number | undefined;
    file?: string | undefined;
    level?: "error" | "debug" | "info" | "warn" | "fatal" | undefined;
    source?: string | undefined;
    details?: Record<string, any> | undefined;
}>;
export declare const ConfigureSchema: z.ZodObject<{
    logDir: z.ZodOptional<z.ZodString>;
    logFile: z.ZodOptional<z.ZodString>;
    maxLogSize: z.ZodOptional<z.ZodNumber>;
    console: z.ZodOptional<z.ZodBoolean>;
    level: z.ZodOptional<z.ZodEnum<["debug", "info", "warn", "error", "fatal"]>>;
    format: z.ZodOptional<z.ZodEnum<["json", "text", "csv"]>>;
}, "strip", z.ZodTypeAny, {
    format?: "text" | "json" | "csv" | undefined;
    level?: "error" | "debug" | "info" | "warn" | "fatal" | undefined;
    logDir?: string | undefined;
    logFile?: string | undefined;
    maxLogSize?: number | undefined;
    console?: boolean | undefined;
}, {
    format?: "text" | "json" | "csv" | undefined;
    level?: "error" | "debug" | "info" | "warn" | "fatal" | undefined;
    logDir?: string | undefined;
    logFile?: string | undefined;
    maxLogSize?: number | undefined;
    console?: boolean | undefined;
}>;
export declare const QuerySchema: z.ZodObject<{
    level: z.ZodOptional<z.ZodEnum<["debug", "info", "warn", "error", "fatal"]>>;
    source: z.ZodOptional<z.ZodString>;
    tag: z.ZodOptional<z.ZodString>;
    from: z.ZodOptional<z.ZodNumber>;
    to: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    search: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    search?: string | undefined;
    level?: "error" | "debug" | "info" | "warn" | "fatal" | undefined;
    source?: string | undefined;
    tag?: string | undefined;
    from?: number | undefined;
    to?: number | undefined;
}, {
    search?: string | undefined;
    limit?: number | undefined;
    level?: "error" | "debug" | "info" | "warn" | "fatal" | undefined;
    source?: string | undefined;
    tag?: string | undefined;
    from?: number | undefined;
    to?: number | undefined;
}>;
export declare const RotateSchema: z.ZodObject<{
    maxFiles: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    compress: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    compress: boolean;
    maxFiles: number;
}, {
    compress?: boolean | undefined;
    maxFiles?: number | undefined;
}>;
/**
 * Logs a message to the log file
 */
export declare function log(entry: z.infer<typeof LogSchema>): Promise<void>;
