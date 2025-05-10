import { z } from 'zod';
export declare function activate(): void;
/**
 * Handles file write events to detect issues that might need notifications
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
 * Handles notification-sender commands
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
export declare const SendNotificationSchema: z.ZodObject<{
    message: z.ZodString;
    level: z.ZodDefault<z.ZodEnum<["info", "warning", "error", "critical"]>>;
    channel: z.ZodDefault<z.ZodEnum<["console", "desktop", "file", "webhook"]>>;
    userId: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    title: z.ZodOptional<z.ZodString>;
    icon: z.ZodOptional<z.ZodString>;
    webhookUrl: z.ZodOptional<z.ZodString>;
    filePath: z.ZodOptional<z.ZodString>;
    throttle: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    message: string;
    level: "error" | "info" | "critical" | "warning";
    channel: "file" | "console" | "desktop" | "webhook";
    throttle: boolean;
    metadata?: Record<string, any> | undefined;
    userId?: string | undefined;
    title?: string | undefined;
    filePath?: string | undefined;
    icon?: string | undefined;
    webhookUrl?: string | undefined;
}, {
    message: string;
    metadata?: Record<string, any> | undefined;
    userId?: string | undefined;
    title?: string | undefined;
    filePath?: string | undefined;
    level?: "error" | "info" | "critical" | "warning" | undefined;
    channel?: "file" | "console" | "desktop" | "webhook" | undefined;
    icon?: string | undefined;
    webhookUrl?: string | undefined;
    throttle?: boolean | undefined;
}>;
export declare const ConfigureThresholdsSchema: z.ZodObject<{
    level: z.ZodEnum<["info", "warning", "error", "critical"]>;
    windowSizeMs: z.ZodOptional<z.ZodNumber>;
    maxNotifications: z.ZodOptional<z.ZodNumber>;
    cooldownPeriodMs: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    level: "error" | "info" | "critical" | "warning";
    windowSizeMs?: number | undefined;
    maxNotifications?: number | undefined;
    cooldownPeriodMs?: number | undefined;
}, {
    level: "error" | "info" | "critical" | "warning";
    windowSizeMs?: number | undefined;
    maxNotifications?: number | undefined;
    cooldownPeriodMs?: number | undefined;
}>;
export declare const GetHistorySchema: z.ZodObject<{
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    level: z.ZodOptional<z.ZodEnum<["info", "warning", "error", "critical"]>>;
    channel: z.ZodOptional<z.ZodEnum<["console", "desktop", "file", "webhook"]>>;
    userId: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["pending", "delivered", "failed"]>>;
    since: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    status?: "pending" | "failed" | "delivered" | undefined;
    userId?: string | undefined;
    level?: "error" | "info" | "critical" | "warning" | undefined;
    since?: number | undefined;
    channel?: "file" | "console" | "desktop" | "webhook" | undefined;
}, {
    status?: "pending" | "failed" | "delivered" | undefined;
    limit?: number | undefined;
    userId?: string | undefined;
    level?: "error" | "info" | "critical" | "warning" | undefined;
    since?: number | undefined;
    channel?: "file" | "console" | "desktop" | "webhook" | undefined;
}>;
export declare const TestChannelsSchema: z.ZodObject<{
    channels: z.ZodDefault<z.ZodArray<z.ZodEnum<["console", "desktop", "file", "webhook"]>, "many">>;
    message: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    webhookUrl: z.ZodOptional<z.ZodString>;
    filePath: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    message: string;
    channels: ("file" | "console" | "desktop" | "webhook")[];
    filePath?: string | undefined;
    webhookUrl?: string | undefined;
}, {
    message?: string | undefined;
    filePath?: string | undefined;
    webhookUrl?: string | undefined;
    channels?: ("file" | "console" | "desktop" | "webhook")[] | undefined;
}>;
