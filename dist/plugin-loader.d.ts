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
 * Handles plugin-loader commands
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
export declare const InstallPluginSchema: z.ZodObject<{
    source: z.ZodString;
    sourceType: z.ZodDefault<z.ZodEnum<["npm", "git", "dir", "zip"]>>;
    options: z.ZodDefault<z.ZodOptional<z.ZodObject<{
        force: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        skipDependencies: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        enabled: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        force: boolean;
        skipDependencies: boolean;
    }, {
        enabled?: boolean | undefined;
        force?: boolean | undefined;
        skipDependencies?: boolean | undefined;
    }>>>;
}, "strip", z.ZodTypeAny, {
    options: {
        enabled: boolean;
        force: boolean;
        skipDependencies: boolean;
    };
    source: string;
    sourceType: "git" | "npm" | "dir" | "zip";
}, {
    source: string;
    options?: {
        enabled?: boolean | undefined;
        force?: boolean | undefined;
        skipDependencies?: boolean | undefined;
    } | undefined;
    sourceType?: "git" | "npm" | "dir" | "zip" | undefined;
}>;
export declare const UninstallPluginSchema: z.ZodObject<{
    pluginId: z.ZodString;
    options: z.ZodDefault<z.ZodOptional<z.ZodObject<{
        removeData: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        force: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        force: boolean;
        removeData: boolean;
    }, {
        force?: boolean | undefined;
        removeData?: boolean | undefined;
    }>>>;
}, "strip", z.ZodTypeAny, {
    options: {
        force: boolean;
        removeData: boolean;
    };
    pluginId: string;
}, {
    pluginId: string;
    options?: {
        force?: boolean | undefined;
        removeData?: boolean | undefined;
    } | undefined;
}>;
export declare const EnableDisablePluginSchema: z.ZodObject<{
    pluginId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    pluginId: string;
}, {
    pluginId: string;
}>;
export declare const ListPluginsSchema: z.ZodObject<{
    filter: z.ZodDefault<z.ZodOptional<z.ZodEnum<["all", "enabled", "disabled", "active", "inactive", "error"]>>>;
    detailed: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    filter: "error" | "enabled" | "all" | "active" | "inactive" | "disabled";
    detailed: boolean;
}, {
    filter?: "error" | "enabled" | "all" | "active" | "inactive" | "disabled" | undefined;
    detailed?: boolean | undefined;
}>;
export declare const GetPluginInfoSchema: z.ZodObject<{
    pluginId: z.ZodString;
    includeConfig: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    includeHooks: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    pluginId: string;
    includeConfig: boolean;
    includeHooks: boolean;
}, {
    pluginId: string;
    includeConfig?: boolean | undefined;
    includeHooks?: boolean | undefined;
}>;
