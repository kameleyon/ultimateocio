import { z } from 'zod';
export declare function activate(): void;
/**
 * Handles file write events that might trigger builds
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
 * Handles build-runner commands
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
export declare const RunBuildSchema: z.ZodObject<{
    project: z.ZodString;
    command: z.ZodOptional<z.ZodString>;
    env: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    workingDir: z.ZodOptional<z.ZodString>;
    buildArgs: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    buildType: z.ZodDefault<z.ZodOptional<z.ZodEnum<["production", "development", "staging", "test"]>>>;
    timeout: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    project: string;
    buildType: "production" | "development" | "staging" | "test";
    timeout: number;
    command?: string | undefined;
    env?: Record<string, string> | undefined;
    workingDir?: string | undefined;
    buildArgs?: string[] | undefined;
}, {
    project: string;
    command?: string | undefined;
    env?: Record<string, string> | undefined;
    workingDir?: string | undefined;
    buildArgs?: string[] | undefined;
    buildType?: "production" | "development" | "staging" | "test" | undefined;
    timeout?: number | undefined;
}>;
export declare const CheckBuildStatusSchema: z.ZodObject<{
    buildId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    buildId: string;
}, {
    buildId: string;
}>;
export declare const DeployBuildSchema: z.ZodObject<{
    buildId: z.ZodString;
    environment: z.ZodDefault<z.ZodEnum<["production", "development", "staging", "test"]>>;
    deployConfig: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    buildId: string;
    environment: "production" | "development" | "staging" | "test";
    deployConfig?: Record<string, any> | undefined;
}, {
    buildId: string;
    environment?: "production" | "development" | "staging" | "test" | undefined;
    deployConfig?: Record<string, any> | undefined;
}>;
export declare const GetBuildHistorySchema: z.ZodObject<{
    project: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    status: z.ZodDefault<z.ZodOptional<z.ZodEnum<["all", "success", "failed", "running", "pending"]>>>;
}, "strip", z.ZodTypeAny, {
    status: "all" | "pending" | "running" | "failed" | "success";
    limit: number;
    project?: string | undefined;
}, {
    status?: "all" | "pending" | "running" | "failed" | "success" | undefined;
    limit?: number | undefined;
    project?: string | undefined;
}>;
