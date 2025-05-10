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
 * Handles component-builder commands
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
export declare const CreateComponentSchema: z.ZodObject<{
    name: z.ZodString;
    framework: z.ZodOptional<z.ZodEnum<["react", "vue", "angular", "svelte", "solid"]>>;
    type: z.ZodOptional<z.ZodEnum<["functional", "class", "hooks", "styled", "hoc"]>>;
    outputDir: z.ZodOptional<z.ZodString>;
    includeStyles: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    includeTests: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    includeStories: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    customTemplate: z.ZodOptional<z.ZodString>;
    customProps: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    includeStyles: boolean;
    includeTests: boolean;
    includeStories: boolean;
    type?: "functional" | "class" | "hooks" | "styled" | "hoc" | undefined;
    framework?: "vue" | "svelte" | "react" | "angular" | "solid" | undefined;
    outputDir?: string | undefined;
    customTemplate?: string | undefined;
    customProps?: Record<string, any> | undefined;
}, {
    name: string;
    type?: "functional" | "class" | "hooks" | "styled" | "hoc" | undefined;
    framework?: "vue" | "svelte" | "react" | "angular" | "solid" | undefined;
    outputDir?: string | undefined;
    includeStyles?: boolean | undefined;
    includeTests?: boolean | undefined;
    includeStories?: boolean | undefined;
    customTemplate?: string | undefined;
    customProps?: Record<string, any> | undefined;
}>;
export declare const ListTemplatesSchema: z.ZodObject<{
    framework: z.ZodOptional<z.ZodEnum<["react", "vue", "angular", "svelte", "solid"]>>;
    type: z.ZodOptional<z.ZodEnum<["functional", "class", "hooks", "styled", "hoc"]>>;
    includeDetails: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    includeDetails: boolean;
    type?: "functional" | "class" | "hooks" | "styled" | "hoc" | undefined;
    framework?: "vue" | "svelte" | "react" | "angular" | "solid" | undefined;
}, {
    type?: "functional" | "class" | "hooks" | "styled" | "hoc" | undefined;
    framework?: "vue" | "svelte" | "react" | "angular" | "solid" | undefined;
    includeDetails?: boolean | undefined;
}>;
export declare const AddComponentPartSchema: z.ZodObject<{
    componentPath: z.ZodString;
    part: z.ZodEnum<["styles", "tests", "stories", "types"]>;
    content: z.ZodOptional<z.ZodString>;
    overwrite: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    overwrite: boolean;
    componentPath: string;
    part: "styles" | "tests" | "stories" | "types";
    content?: string | undefined;
}, {
    componentPath: string;
    part: "styles" | "tests" | "stories" | "types";
    content?: string | undefined;
    overwrite?: boolean | undefined;
}>;
export declare const AnalyzeComponentSchema: z.ZodObject<{
    path: z.ZodString;
    detectDependencies: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    suggestImprovements: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    path: string;
    detectDependencies: boolean;
    suggestImprovements: boolean;
}, {
    path: string;
    detectDependencies?: boolean | undefined;
    suggestImprovements?: boolean | undefined;
}>;
