import { z } from 'zod';
export declare function activate(): void;
/**
 * Handles file write events to potentially trigger backups
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
 * Handles backup-creator commands
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
export declare const CreateBackupSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    directory: z.ZodString;
    includePatterns: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    excludePatterns: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    compress: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    includeMetadata: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    directory: string;
    compress: boolean;
    includeMetadata: boolean;
    name?: string | undefined;
    includePatterns?: string[] | undefined;
    excludePatterns?: string[] | undefined;
}, {
    directory: string;
    name?: string | undefined;
    includePatterns?: string[] | undefined;
    excludePatterns?: string[] | undefined;
    compress?: boolean | undefined;
    includeMetadata?: boolean | undefined;
}>;
export declare const RestoreBackupSchema: z.ZodObject<{
    backupId: z.ZodString;
    targetDirectory: z.ZodOptional<z.ZodString>;
    overwrite: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    validateChecksum: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    backupId: string;
    overwrite: boolean;
    validateChecksum: boolean;
    targetDirectory?: string | undefined;
}, {
    backupId: string;
    targetDirectory?: string | undefined;
    overwrite?: boolean | undefined;
    validateChecksum?: boolean | undefined;
}>;
export declare const ListBackupsSchema: z.ZodObject<{
    directory: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    sortBy: z.ZodDefault<z.ZodOptional<z.ZodEnum<["date", "name", "size"]>>>;
    order: z.ZodDefault<z.ZodOptional<z.ZodEnum<["asc", "desc"]>>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    sortBy: "name" | "date" | "size";
    order: "asc" | "desc";
    directory?: string | undefined;
}, {
    directory?: string | undefined;
    limit?: number | undefined;
    sortBy?: "name" | "date" | "size" | undefined;
    order?: "asc" | "desc" | undefined;
}>;
export declare const DeleteBackupSchema: z.ZodObject<{
    backupId: z.ZodString;
    force: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    backupId: string;
    force: boolean;
}, {
    backupId: string;
    force?: boolean | undefined;
}>;
