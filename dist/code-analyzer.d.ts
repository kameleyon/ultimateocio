export declare function activate(): void;
export declare function onFileWrite(filePath: string, content: string): {
    detected: boolean;
    filePath: string;
    language: string;
    lineCount: number;
    issues: {
        type: string;
        description: string;
        occurrences: number;
        severity: string;
    }[] | undefined;
} | {
    detected: boolean;
    filePath?: undefined;
    language?: undefined;
    lineCount?: undefined;
    issues?: undefined;
};
export declare function onSessionStart(context: any): {
    initialized: boolean;
    supportedLanguages: string[];
    fileExtensions: string[];
};
export declare function onCommand(command: string, args: any): {
    action: string;
    args: any;
} | {
    action: string;
    args?: undefined;
};
import { z } from 'zod';
export declare const AnalyzeCodeSchema: z.ZodObject<{
    code: z.ZodOptional<z.ZodString>;
    filePath: z.ZodOptional<z.ZodString>;
    language: z.ZodOptional<z.ZodString>;
    analysisType: z.ZodDefault<z.ZodEnum<["refactoring", "security", "performance", "quality", "all"]>>;
    apiKey: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    analysisType: "all" | "quality" | "refactoring" | "security" | "performance";
    code?: string | undefined;
    filePath?: string | undefined;
    language?: string | undefined;
    apiKey?: string | undefined;
}, {
    code?: string | undefined;
    filePath?: string | undefined;
    language?: string | undefined;
    analysisType?: "all" | "quality" | "refactoring" | "security" | "performance" | undefined;
    apiKey?: string | undefined;
}>;
export declare const AnalyzeProjectSchema: z.ZodObject<{
    directory: z.ZodString;
    recursive: z.ZodOptional<z.ZodBoolean>;
    filePatterns: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    analysisType: z.ZodDefault<z.ZodEnum<["refactoring", "security", "performance", "quality", "all"]>>;
    apiKey: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    directory: string;
    analysisType: "all" | "quality" | "refactoring" | "security" | "performance";
    recursive?: boolean | undefined;
    apiKey?: string | undefined;
    filePatterns?: string[] | undefined;
}, {
    directory: string;
    recursive?: boolean | undefined;
    analysisType?: "all" | "quality" | "refactoring" | "security" | "performance" | undefined;
    apiKey?: string | undefined;
    filePatterns?: string[] | undefined;
}>;
export declare const GetRefactoringSchema: z.ZodObject<{
    code: z.ZodOptional<z.ZodString>;
    filePath: z.ZodOptional<z.ZodString>;
    language: z.ZodOptional<z.ZodString>;
    apiKey: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    code?: string | undefined;
    filePath?: string | undefined;
    language?: string | undefined;
    apiKey?: string | undefined;
}, {
    code?: string | undefined;
    filePath?: string | undefined;
    language?: string | undefined;
    apiKey?: string | undefined;
}>;
/**
 * Analyzes code for potential improvements
 */
export declare function handleAnalyzeCode(args: any): Promise<{
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
}>;
/**
 * Analyzes a project directory for potential improvements
 */
export declare function handleAnalyzeProject(args: any): Promise<{
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
}>;
/**
 * Gets refactoring suggestions for code
 */
export declare function handleGetRefactoring(args: any): Promise<{
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
}>;
