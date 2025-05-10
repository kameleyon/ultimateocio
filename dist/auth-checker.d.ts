import { z } from 'zod';
export declare function activate(): void;
/**
 * Handles file write events to validate security aspects
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
 * Handles auth-checker commands
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
export declare const ValidateTokenSchema: z.ZodObject<{
    token: z.ZodString;
    type: z.ZodDefault<z.ZodOptional<z.ZodEnum<["JWT", "OAuth", "Basic", "API_Key", "Session"]>>>;
    secret: z.ZodOptional<z.ZodString>;
    audience: z.ZodOptional<z.ZodString>;
    issuer: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "JWT" | "OAuth" | "Basic" | "API_Key" | "Session";
    token: string;
    secret?: string | undefined;
    audience?: string | undefined;
    issuer?: string | undefined;
}, {
    token: string;
    type?: "JWT" | "OAuth" | "Basic" | "API_Key" | "Session" | undefined;
    secret?: string | undefined;
    audience?: string | undefined;
    issuer?: string | undefined;
}>;
export declare const AnalyzeAuthFlowSchema: z.ZodObject<{
    directory: z.ZodString;
    recursive: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    framework: z.ZodOptional<z.ZodEnum<["Express", "Next.js", "React", "Angular", "Vue", "Django", "Flask", "Rails", "Spring", "ASP.NET"]>>;
}, "strip", z.ZodTypeAny, {
    directory: string;
    recursive: boolean;
    framework?: "Express" | "Next.js" | "React" | "Angular" | "Vue" | "Django" | "Flask" | "Rails" | "Spring" | "ASP.NET" | undefined;
}, {
    directory: string;
    recursive?: boolean | undefined;
    framework?: "Express" | "Next.js" | "React" | "Angular" | "Vue" | "Django" | "Flask" | "Rails" | "Spring" | "ASP.NET" | undefined;
}>;
export declare const SecureEndpointsSchema: z.ZodObject<{
    directory: z.ZodString;
    pattern: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    authType: z.ZodDefault<z.ZodOptional<z.ZodEnum<["JWT", "OAuth", "Basic", "API_Key", "Session"]>>>;
    generateMiddleware: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    directory: string;
    pattern: string;
    authType: "JWT" | "OAuth" | "Basic" | "API_Key" | "Session";
    generateMiddleware: boolean;
}, {
    directory: string;
    pattern?: string | undefined;
    authType?: "JWT" | "OAuth" | "Basic" | "API_Key" | "Session" | undefined;
    generateMiddleware?: boolean | undefined;
}>;
