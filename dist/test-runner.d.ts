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
 * Handles test-runner commands
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
export declare const RunTestsSchema: z.ZodObject<{
    testPattern: z.ZodOptional<z.ZodString>;
    framework: z.ZodOptional<z.ZodEnum<["jest", "mocha", "vitest", "jasmine", "karma", "cypress", "playwright", "generic"]>>;
    options: z.ZodDefault<z.ZodOptional<z.ZodObject<{
        coverage: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        updateSnapshots: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        bail: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        verbose: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        ci: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        verbose: boolean;
        coverage: boolean;
        updateSnapshots: boolean;
        bail: boolean;
        ci: boolean;
    }, {
        verbose?: boolean | undefined;
        coverage?: boolean | undefined;
        updateSnapshots?: boolean | undefined;
        bail?: boolean | undefined;
        ci?: boolean | undefined;
    }>>>;
}, "strip", z.ZodTypeAny, {
    options: {
        verbose: boolean;
        coverage: boolean;
        updateSnapshots: boolean;
        bail: boolean;
        ci: boolean;
    };
    framework?: "jest" | "jasmine" | "karma" | "generic" | "mocha" | "vitest" | "cypress" | "playwright" | undefined;
    testPattern?: string | undefined;
}, {
    options?: {
        verbose?: boolean | undefined;
        coverage?: boolean | undefined;
        updateSnapshots?: boolean | undefined;
        bail?: boolean | undefined;
        ci?: boolean | undefined;
    } | undefined;
    framework?: "jest" | "jasmine" | "karma" | "generic" | "mocha" | "vitest" | "cypress" | "playwright" | undefined;
    testPattern?: string | undefined;
}>;
export declare const WatchTestsSchema: z.ZodObject<{
    testPattern: z.ZodOptional<z.ZodString>;
    framework: z.ZodOptional<z.ZodEnum<["jest", "mocha", "vitest", "jasmine", "karma", "cypress", "playwright", "generic"]>>;
}, "strip", z.ZodTypeAny, {
    framework?: "jest" | "jasmine" | "karma" | "generic" | "mocha" | "vitest" | "cypress" | "playwright" | undefined;
    testPattern?: string | undefined;
}, {
    framework?: "jest" | "jasmine" | "karma" | "generic" | "mocha" | "vitest" | "cypress" | "playwright" | undefined;
    testPattern?: string | undefined;
}>;
export declare const GetTestHistorySchema: z.ZodObject<{
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    status: z.ZodOptional<z.ZodEnum<["running", "completed", "failed"]>>;
    framework: z.ZodOptional<z.ZodEnum<["jest", "mocha", "vitest", "jasmine", "karma", "cypress", "playwright", "generic"]>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    status?: "running" | "completed" | "failed" | undefined;
    framework?: "jest" | "jasmine" | "karma" | "generic" | "mocha" | "vitest" | "cypress" | "playwright" | undefined;
}, {
    status?: "running" | "completed" | "failed" | undefined;
    limit?: number | undefined;
    framework?: "jest" | "jasmine" | "karma" | "generic" | "mocha" | "vitest" | "cypress" | "playwright" | undefined;
}>;
export declare const GetCoverageSchema: z.ZodObject<{
    testRunId: z.ZodOptional<z.ZodString>;
    generateReport: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    reportFormat: z.ZodDefault<z.ZodOptional<z.ZodEnum<["html", "text", "json"]>>>;
}, "strip", z.ZodTypeAny, {
    generateReport: boolean;
    reportFormat: "text" | "json" | "html";
    testRunId?: string | undefined;
}, {
    testRunId?: string | undefined;
    generateReport?: boolean | undefined;
    reportFormat?: "text" | "json" | "html" | undefined;
}>;
export declare const GetTestInfoSchema: z.ZodObject<{
    testPattern: z.ZodOptional<z.ZodString>;
    framework: z.ZodOptional<z.ZodEnum<["jest", "mocha", "vitest", "jasmine", "karma", "cypress", "playwright", "generic"]>>;
    detectOnly: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    detectOnly: boolean;
    framework?: "jest" | "jasmine" | "karma" | "generic" | "mocha" | "vitest" | "cypress" | "playwright" | undefined;
    testPattern?: string | undefined;
}, {
    framework?: "jest" | "jasmine" | "karma" | "generic" | "mocha" | "vitest" | "cypress" | "playwright" | undefined;
    testPattern?: string | undefined;
    detectOnly?: boolean | undefined;
}>;
