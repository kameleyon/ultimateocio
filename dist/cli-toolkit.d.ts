import { z } from 'zod';
export declare function activate(): void;
/**
 * Handles file write events that might trigger CLI updates
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
 * Handles cli-toolkit commands
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
export declare const ExecuteCommandSchema: z.ZodObject<{
    command: z.ZodString;
    args: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    cwd: z.ZodOptional<z.ZodString>;
    env: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    timeout: z.ZodOptional<z.ZodNumber>;
    shell: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    captureOutput: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    command: string;
    shell: boolean;
    captureOutput: boolean;
    env?: Record<string, string> | undefined;
    timeout?: number | undefined;
    args?: string[] | undefined;
    cwd?: string | undefined;
}, {
    command: string;
    env?: Record<string, string> | undefined;
    timeout?: number | undefined;
    args?: string[] | undefined;
    cwd?: string | undefined;
    shell?: boolean | undefined;
    captureOutput?: boolean | undefined;
}>;
export declare const GenerateScriptSchema: z.ZodObject<{
    name: z.ZodString;
    type: z.ZodDefault<z.ZodEnum<["bash", "batch", "powershell", "node"]>>;
    commands: z.ZodArray<z.ZodString, "many">;
    variables: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    description: z.ZodOptional<z.ZodString>;
    outputPath: z.ZodOptional<z.ZodString>;
    makeExecutable: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    type: "bash" | "batch" | "powershell" | "node";
    commands: string[];
    makeExecutable: boolean;
    description?: string | undefined;
    outputPath?: string | undefined;
    variables?: Record<string, string> | undefined;
}, {
    name: string;
    commands: string[];
    type?: "bash" | "batch" | "powershell" | "node" | undefined;
    description?: string | undefined;
    outputPath?: string | undefined;
    variables?: Record<string, string> | undefined;
    makeExecutable?: boolean | undefined;
}>;
export declare const AnalyzeCommandSchema: z.ZodObject<{
    command: z.ZodString;
    args: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    explainFlags: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    suggestAlternatives: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    suggestOptimizations: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    command: string;
    explainFlags: boolean;
    suggestAlternatives: boolean;
    suggestOptimizations: boolean;
    args?: string[] | undefined;
}, {
    command: string;
    args?: string[] | undefined;
    explainFlags?: boolean | undefined;
    suggestAlternatives?: boolean | undefined;
    suggestOptimizations?: boolean | undefined;
}>;
export declare const ChainCommandsSchema: z.ZodObject<{
    commands: z.ZodArray<z.ZodObject<{
        command: z.ZodString;
        args: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        condition: z.ZodOptional<z.ZodString>;
        ignoreError: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        command: string;
        ignoreError: boolean;
        condition?: string | undefined;
        args?: string[] | undefined;
    }, {
        command: string;
        condition?: string | undefined;
        args?: string[] | undefined;
        ignoreError?: boolean | undefined;
    }>, "many">;
    parallel: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    stopOnError: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    outputFormat: z.ZodDefault<z.ZodOptional<z.ZodEnum<["text", "json"]>>>;
    timeout: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    outputFormat: "text" | "json";
    commands: {
        command: string;
        ignoreError: boolean;
        condition?: string | undefined;
        args?: string[] | undefined;
    }[];
    parallel: boolean;
    stopOnError: boolean;
    timeout?: number | undefined;
}, {
    commands: {
        command: string;
        condition?: string | undefined;
        args?: string[] | undefined;
        ignoreError?: boolean | undefined;
    }[];
    timeout?: number | undefined;
    outputFormat?: "text" | "json" | undefined;
    parallel?: boolean | undefined;
    stopOnError?: boolean | undefined;
}>;
