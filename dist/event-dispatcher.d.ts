import { z } from 'zod';
export declare function activate(): void;
/**
 * Handles file write events to dispatch file change events
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
 * Handles event-dispatcher commands
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
export declare const DispatchEventSchema: z.ZodObject<{
    event: z.ZodString;
    data: z.ZodAny;
    sync: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    delay: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    event: string;
    sync: boolean;
    data?: any;
    delay?: number | undefined;
}, {
    event: string;
    data?: any;
    sync?: boolean | undefined;
    delay?: number | undefined;
}>;
export declare const SubscribeEventSchema: z.ZodObject<{
    event: z.ZodString;
    callback: z.ZodOptional<z.ZodString>;
    once: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    filter: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    event: string;
    once: boolean;
    filter?: Record<string, any> | undefined;
    callback?: string | undefined;
}, {
    event: string;
    filter?: Record<string, any> | undefined;
    callback?: string | undefined;
    once?: boolean | undefined;
}>;
export declare const RegisterEventSchema: z.ZodObject<{
    event: z.ZodString;
    description: z.ZodString;
    schema: z.ZodOptional<z.ZodAny>;
    overwrite: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    description: string;
    overwrite: boolean;
    event: string;
    schema?: any;
}, {
    description: string;
    event: string;
    overwrite?: boolean | undefined;
    schema?: any;
}>;
export declare const ListEventsSchema: z.ZodObject<{
    includeHistory: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    filter: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    includeHistory: boolean;
    filter?: string | undefined;
}, {
    filter?: string | undefined;
    limit?: number | undefined;
    includeHistory?: boolean | undefined;
}>;
