import { z } from 'zod';
export declare function activate(): void;
/**
 * Handles file write events to detect changes in translation files
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
 * Handles i18n-loader commands
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
export declare const LoadLanguageSchema: z.ZodObject<{
    language: z.ZodString;
    path: z.ZodOptional<z.ZodString>;
    merge: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    language: string;
    merge: boolean;
    path?: string | undefined;
}, {
    language: string;
    path?: string | undefined;
    merge?: boolean | undefined;
}>;
export declare const TranslateSchema: z.ZodObject<{
    key: z.ZodString;
    language: z.ZodOptional<z.ZodString>;
    fallback: z.ZodOptional<z.ZodString>;
    interpolations: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    key: string;
    language?: string | undefined;
    fallback?: string | undefined;
    interpolations?: Record<string, string> | undefined;
}, {
    key: string;
    language?: string | undefined;
    fallback?: string | undefined;
    interpolations?: Record<string, string> | undefined;
}>;
export declare const ListLanguagesSchema: z.ZodObject<{
    path: z.ZodOptional<z.ZodString>;
    includeCompletionStats: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    includeCompletionStats: boolean;
    path?: string | undefined;
}, {
    path?: string | undefined;
    includeCompletionStats?: boolean | undefined;
}>;
export declare const SwitchLanguageSchema: z.ZodObject<{
    language: z.ZodString;
    savePreference: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    language: string;
    savePreference: boolean;
}, {
    language: string;
    savePreference?: boolean | undefined;
}>;
