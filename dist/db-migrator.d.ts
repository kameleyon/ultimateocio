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
 * Handles db-migrator commands
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
export declare const CreateMigrationSchema: z.ZodObject<{
    name: z.ZodString;
    type: z.ZodDefault<z.ZodEnum<["schema", "data", "seed", "rollback"]>>;
    database: z.ZodOptional<z.ZodEnum<["postgres", "mysql", "sqlite", "mongodb", "generic"]>>;
    description: z.ZodOptional<z.ZodString>;
    timestamp: z.ZodOptional<z.ZodNumber>;
    customContent: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    type: "data" | "schema" | "seed" | "rollback";
    description?: string | undefined;
    timestamp?: number | undefined;
    database?: "postgres" | "mysql" | "sqlite" | "mongodb" | "generic" | undefined;
    customContent?: string | undefined;
}, {
    name: string;
    type?: "data" | "schema" | "seed" | "rollback" | undefined;
    description?: string | undefined;
    timestamp?: number | undefined;
    database?: "postgres" | "mysql" | "sqlite" | "mongodb" | "generic" | undefined;
    customContent?: string | undefined;
}>;
export declare const RunMigrationsSchema: z.ZodObject<{
    target: z.ZodOptional<z.ZodString>;
    types: z.ZodOptional<z.ZodArray<z.ZodEnum<["schema", "data", "seed"]>, "many">>;
    dryRun: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    connection: z.ZodOptional<z.ZodObject<{
        type: z.ZodEnum<["postgres", "mysql", "sqlite", "mongodb"]>;
        host: z.ZodOptional<z.ZodString>;
        port: z.ZodOptional<z.ZodNumber>;
        username: z.ZodOptional<z.ZodString>;
        password: z.ZodOptional<z.ZodString>;
        database: z.ZodOptional<z.ZodString>;
        uri: z.ZodOptional<z.ZodString>;
        options: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        type: "postgres" | "mysql" | "sqlite" | "mongodb";
        options?: Record<string, any> | undefined;
        password?: string | undefined;
        database?: string | undefined;
        host?: string | undefined;
        port?: number | undefined;
        username?: string | undefined;
        uri?: string | undefined;
    }, {
        type: "postgres" | "mysql" | "sqlite" | "mongodb";
        options?: Record<string, any> | undefined;
        password?: string | undefined;
        database?: string | undefined;
        host?: string | undefined;
        port?: number | undefined;
        username?: string | undefined;
        uri?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    dryRun: boolean;
    target?: string | undefined;
    types?: ("data" | "schema" | "seed")[] | undefined;
    connection?: {
        type: "postgres" | "mysql" | "sqlite" | "mongodb";
        options?: Record<string, any> | undefined;
        password?: string | undefined;
        database?: string | undefined;
        host?: string | undefined;
        port?: number | undefined;
        username?: string | undefined;
        uri?: string | undefined;
    } | undefined;
}, {
    dryRun?: boolean | undefined;
    target?: string | undefined;
    types?: ("data" | "schema" | "seed")[] | undefined;
    connection?: {
        type: "postgres" | "mysql" | "sqlite" | "mongodb";
        options?: Record<string, any> | undefined;
        password?: string | undefined;
        database?: string | undefined;
        host?: string | undefined;
        port?: number | undefined;
        username?: string | undefined;
        uri?: string | undefined;
    } | undefined;
}>;
export declare const MigrationStatusSchema: z.ZodObject<{
    detailed: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    types: z.ZodOptional<z.ZodArray<z.ZodEnum<["schema", "data", "seed", "rollback"]>, "many">>;
}, "strip", z.ZodTypeAny, {
    detailed: boolean;
    types?: ("data" | "schema" | "seed" | "rollback")[] | undefined;
}, {
    types?: ("data" | "schema" | "seed" | "rollback")[] | undefined;
    detailed?: boolean | undefined;
}>;
export declare const RollbackMigrationSchema: z.ZodObject<{
    migration: z.ZodOptional<z.ZodString>;
    steps: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    dryRun: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    connection: z.ZodOptional<z.ZodObject<{
        type: z.ZodEnum<["postgres", "mysql", "sqlite", "mongodb"]>;
        host: z.ZodOptional<z.ZodString>;
        port: z.ZodOptional<z.ZodNumber>;
        username: z.ZodOptional<z.ZodString>;
        password: z.ZodOptional<z.ZodString>;
        database: z.ZodOptional<z.ZodString>;
        uri: z.ZodOptional<z.ZodString>;
        options: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        type: "postgres" | "mysql" | "sqlite" | "mongodb";
        options?: Record<string, any> | undefined;
        password?: string | undefined;
        database?: string | undefined;
        host?: string | undefined;
        port?: number | undefined;
        username?: string | undefined;
        uri?: string | undefined;
    }, {
        type: "postgres" | "mysql" | "sqlite" | "mongodb";
        options?: Record<string, any> | undefined;
        password?: string | undefined;
        database?: string | undefined;
        host?: string | undefined;
        port?: number | undefined;
        username?: string | undefined;
        uri?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    dryRun: boolean;
    steps: number;
    connection?: {
        type: "postgres" | "mysql" | "sqlite" | "mongodb";
        options?: Record<string, any> | undefined;
        password?: string | undefined;
        database?: string | undefined;
        host?: string | undefined;
        port?: number | undefined;
        username?: string | undefined;
        uri?: string | undefined;
    } | undefined;
    migration?: string | undefined;
}, {
    dryRun?: boolean | undefined;
    steps?: number | undefined;
    connection?: {
        type: "postgres" | "mysql" | "sqlite" | "mongodb";
        options?: Record<string, any> | undefined;
        password?: string | undefined;
        database?: string | undefined;
        host?: string | undefined;
        port?: number | undefined;
        username?: string | undefined;
        uri?: string | undefined;
    } | undefined;
    migration?: string | undefined;
}>;
export declare const ConfigureMigratorSchema: z.ZodObject<{
    migrationsDir: z.ZodOptional<z.ZodString>;
    dbType: z.ZodOptional<z.ZodEnum<["postgres", "mysql", "sqlite", "mongodb", "generic"]>>;
    nameSeparator: z.ZodOptional<z.ZodString>;
    filenameFormat: z.ZodOptional<z.ZodString>;
    createSubdirectories: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    migrationsDir?: string | undefined;
    dbType?: "postgres" | "mysql" | "sqlite" | "mongodb" | "generic" | undefined;
    nameSeparator?: string | undefined;
    filenameFormat?: string | undefined;
    createSubdirectories?: boolean | undefined;
}, {
    migrationsDir?: string | undefined;
    dbType?: "postgres" | "mysql" | "sqlite" | "mongodb" | "generic" | undefined;
    nameSeparator?: string | undefined;
    filenameFormat?: string | undefined;
    createSubdirectories?: boolean | undefined;
}>;
