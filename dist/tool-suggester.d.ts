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
 * Handles tool-suggester commands
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
export declare const SuggestToolsSchema: z.ZodObject<{
    task: z.ZodString;
    keywords: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    includeDisabled: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    includeExamples: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    task: string;
    includeExamples: boolean;
    includeDisabled: boolean;
    keywords?: string[] | undefined;
}, {
    task: string;
    limit?: number | undefined;
    includeExamples?: boolean | undefined;
    keywords?: string[] | undefined;
    includeDisabled?: boolean | undefined;
}>;
export declare const ListToolsSchema: z.ZodObject<{
    category: z.ZodDefault<z.ZodOptional<z.ZodEnum<["ui-generation", "code-tools", "testing-quality", "api-dependent", "database", "filesystem", "content", "auth", "meta", "project-planning", "internationalization", "extensibility", "validation", "logging", "automated-tools", "other", "all"]>>>;
    enabledOnly: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    includeCommands: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    includeCapabilities: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    enabledOnly: boolean;
    category: "validation" | "all" | "auth" | "content" | "other" | "database" | "ui-generation" | "code-tools" | "testing-quality" | "api-dependent" | "filesystem" | "meta" | "project-planning" | "internationalization" | "extensibility" | "logging" | "automated-tools";
    includeCommands: boolean;
    includeCapabilities: boolean;
}, {
    enabledOnly?: boolean | undefined;
    category?: "validation" | "all" | "auth" | "content" | "other" | "database" | "ui-generation" | "code-tools" | "testing-quality" | "api-dependent" | "filesystem" | "meta" | "project-planning" | "internationalization" | "extensibility" | "logging" | "automated-tools" | undefined;
    includeCommands?: boolean | undefined;
    includeCapabilities?: boolean | undefined;
}>;
export declare const GetToolInfoSchema: z.ZodObject<{
    name: z.ZodString;
    includeCommands: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    includeCapabilities: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    includeExamples: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    includeExamples: boolean;
    includeCommands: boolean;
    includeCapabilities: boolean;
}, {
    name: string;
    includeExamples?: boolean | undefined;
    includeCommands?: boolean | undefined;
    includeCapabilities?: boolean | undefined;
}>;
export declare const RegisterToolSchema: z.ZodObject<{
    name: z.ZodString;
    displayName: z.ZodString;
    category: z.ZodEnum<["ui-generation", "code-tools", "testing-quality", "api-dependent", "database", "filesystem", "content", "auth", "meta", "project-planning", "internationalization", "extensibility", "validation", "logging", "automated-tools", "other"]>;
    description: z.ZodString;
    capabilities: z.ZodArray<z.ZodString, "many">;
    commands: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        description: z.ZodString;
        parameters: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        description: string;
        parameters?: Record<string, string> | undefined;
    }, {
        name: string;
        description: string;
        parameters?: Record<string, string> | undefined;
    }>, "many">;
    examples: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    filePath: z.ZodOptional<z.ZodString>;
    enabled: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    weight: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    tags: z.ZodArray<z.ZodString, "many">;
    requiresSetup: z.ZodOptional<z.ZodBoolean>;
    setupInstructions: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    description: string;
    capabilities: string[];
    enabled: boolean;
    tags: string[];
    category: "validation" | "auth" | "content" | "other" | "database" | "ui-generation" | "code-tools" | "testing-quality" | "api-dependent" | "filesystem" | "meta" | "project-planning" | "internationalization" | "extensibility" | "logging" | "automated-tools";
    commands: {
        name: string;
        description: string;
        parameters?: Record<string, string> | undefined;
    }[];
    displayName: string;
    weight: number;
    filePath?: string | undefined;
    examples?: string[] | undefined;
    requiresSetup?: boolean | undefined;
    setupInstructions?: string | undefined;
}, {
    name: string;
    description: string;
    capabilities: string[];
    tags: string[];
    category: "validation" | "auth" | "content" | "other" | "database" | "ui-generation" | "code-tools" | "testing-quality" | "api-dependent" | "filesystem" | "meta" | "project-planning" | "internationalization" | "extensibility" | "logging" | "automated-tools";
    commands: {
        name: string;
        description: string;
        parameters?: Record<string, string> | undefined;
    }[];
    displayName: string;
    enabled?: boolean | undefined;
    filePath?: string | undefined;
    examples?: string[] | undefined;
    requiresSetup?: boolean | undefined;
    weight?: number | undefined;
    setupInstructions?: string | undefined;
}>;
export declare const GetCategoriesSchema: z.ZodObject<{
    includeTools: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    countOnly: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    includeTools: boolean;
    countOnly: boolean;
}, {
    includeTools?: boolean | undefined;
    countOnly?: boolean | undefined;
}>;
