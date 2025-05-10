import { z } from 'zod';
export declare function activate(): void;
/**
 * Handles file write events (not used for git-initializer)
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
 * Handles git-initializer commands
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
export declare const InitRepoSchema: z.ZodObject<{
    path: z.ZodOptional<z.ZodString>;
    readme: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    license: z.ZodDefault<z.ZodOptional<z.ZodEnum<["mit", "apache-2.0", "gpl-3.0", "bsd-3-clause", "unlicense", "bsd-2-clause", "gpl-2.0", "lgpl-2.1", "none"]>>>;
    initialCommit: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    commitMessage: z.ZodDefault<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    license: "mit" | "apache-2.0" | "gpl-3.0" | "bsd-3-clause" | "unlicense" | "bsd-2-clause" | "gpl-2.0" | "lgpl-2.1" | "none";
    readme: boolean;
    initialCommit: boolean;
    commitMessage: string;
    path?: string | undefined;
}, {
    path?: string | undefined;
    license?: "mit" | "apache-2.0" | "gpl-3.0" | "bsd-3-clause" | "unlicense" | "bsd-2-clause" | "gpl-2.0" | "lgpl-2.1" | "none" | undefined;
    readme?: boolean | undefined;
    initialCommit?: boolean | undefined;
    commitMessage?: string | undefined;
}>;
export declare const CheckStatusSchema: z.ZodObject<{
    path: z.ZodOptional<z.ZodString>;
    showUntracked: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    checkRemote: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    showUntracked: boolean;
    checkRemote: boolean;
    path?: string | undefined;
}, {
    path?: string | undefined;
    showUntracked?: boolean | undefined;
    checkRemote?: boolean | undefined;
}>;
export declare const SetupGitignoreSchema: z.ZodObject<{
    path: z.ZodOptional<z.ZodString>;
    templates: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    custom: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    overwrite: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    overwrite: boolean;
    path?: string | undefined;
    custom?: string[] | undefined;
    templates?: string[] | undefined;
}, {
    path?: string | undefined;
    custom?: string[] | undefined;
    overwrite?: boolean | undefined;
    templates?: string[] | undefined;
}>;
export declare const SetupRemoteSchema: z.ZodObject<{
    path: z.ZodOptional<z.ZodString>;
    name: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    url: z.ZodString;
    createBranch: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    branch: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    push: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    push: boolean;
    url: string;
    createBranch: boolean;
    branch: string;
    path?: string | undefined;
}, {
    url: string;
    name?: string | undefined;
    push?: boolean | undefined;
    path?: string | undefined;
    createBranch?: boolean | undefined;
    branch?: string | undefined;
}>;
