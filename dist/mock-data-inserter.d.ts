import { z } from 'zod';
export declare function activate(): void;
/**
 * Handles file write events to detect parameters for data insertion
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
 * Handles mock-data-inserter commands
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
export declare const GenerateMockDataSchema: z.ZodObject<{
    type: z.ZodEnum<["user", "product", "post", "comment", "address", "transaction", "event", "task", "contact", "custom"]>;
    count: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    customSchema: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    locale: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    seed: z.ZodOptional<z.ZodString>;
    outputPath: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "custom" | "user" | "contact" | "event" | "product" | "post" | "comment" | "address" | "transaction" | "task";
    count: number;
    locale: string;
    outputPath?: string | undefined;
    seed?: string | undefined;
    customSchema?: Record<string, any> | undefined;
}, {
    type: "custom" | "user" | "contact" | "event" | "product" | "post" | "comment" | "address" | "transaction" | "task";
    outputPath?: string | undefined;
    seed?: string | undefined;
    count?: number | undefined;
    customSchema?: Record<string, any> | undefined;
    locale?: string | undefined;
}>;
export declare const InsertMockDataSchema: z.ZodObject<{
    path: z.ZodString;
    data: z.ZodOptional<z.ZodAny>;
    type: z.ZodOptional<z.ZodEnum<["user", "product", "post", "comment", "address", "transaction", "event", "task", "contact", "custom"]>>;
    count: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    format: z.ZodDefault<z.ZodOptional<z.ZodEnum<["json", "js", "ts"]>>>;
    variable: z.ZodOptional<z.ZodString>;
    customSchema: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    path: string;
    format: "json" | "js" | "ts";
    count: number;
    type?: "custom" | "user" | "contact" | "event" | "product" | "post" | "comment" | "address" | "transaction" | "task" | undefined;
    data?: any;
    customSchema?: Record<string, any> | undefined;
    variable?: string | undefined;
}, {
    path: string;
    type?: "custom" | "user" | "contact" | "event" | "product" | "post" | "comment" | "address" | "transaction" | "task" | undefined;
    format?: "json" | "js" | "ts" | undefined;
    data?: any;
    count?: number | undefined;
    customSchema?: Record<string, any> | undefined;
    variable?: string | undefined;
}>;
export declare const ListTemplatesSchema: z.ZodObject<{
    detailed: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    detailed: boolean;
}, {
    detailed?: boolean | undefined;
}>;
export declare const CustomizeMockDataSchema: z.ZodObject<{
    template: z.ZodEnum<["user", "product", "post", "comment", "address", "transaction", "event", "task", "contact", "custom"]>;
    overrides: z.ZodRecord<z.ZodString, z.ZodAny>;
    count: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    outputPath: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    template: "custom" | "user" | "contact" | "event" | "product" | "post" | "comment" | "address" | "transaction" | "task";
    count: number;
    overrides: Record<string, any>;
    outputPath?: string | undefined;
}, {
    template: "custom" | "user" | "contact" | "event" | "product" | "post" | "comment" | "address" | "transaction" | "task";
    overrides: Record<string, any>;
    outputPath?: string | undefined;
    count?: number | undefined;
}>;
