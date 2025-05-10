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
 * Handles persona-loader commands
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
export declare const ListPersonasSchema: z.ZodObject<{
    category: z.ZodDefault<z.ZodOptional<z.ZodEnum<["generic", "professional", "creative", "technical", "educational", "specialized", "character", "custom", "all"]>>>;
    enabledOnly: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    includeSystemPrompt: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    includeExamples: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    sortBy: z.ZodDefault<z.ZodOptional<z.ZodEnum<["name", "category", "created", "updated"]>>>;
}, "strip", z.ZodTypeAny, {
    enabledOnly: boolean;
    includeSystemPrompt: boolean;
    sortBy: "name" | "category" | "created" | "updated";
    category: "custom" | "all" | "generic" | "professional" | "creative" | "technical" | "educational" | "specialized" | "character";
    includeExamples: boolean;
}, {
    enabledOnly?: boolean | undefined;
    includeSystemPrompt?: boolean | undefined;
    sortBy?: "name" | "category" | "created" | "updated" | undefined;
    category?: "custom" | "all" | "generic" | "professional" | "creative" | "technical" | "educational" | "specialized" | "character" | undefined;
    includeExamples?: boolean | undefined;
}>;
export declare const GetPersonaSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const CreatePersonaSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodString;
    category: z.ZodEnum<["generic", "professional", "creative", "technical", "educational", "specialized", "character", "custom"]>;
    systemPrompt: z.ZodString;
    traits: z.ZodArray<z.ZodString, "many">;
    skills: z.ZodArray<z.ZodString, "many">;
    constraints: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    metadata: z.ZodOptional<z.ZodObject<{
        author: z.ZodOptional<z.ZodString>;
        version: z.ZodOptional<z.ZodString>;
        modelCompatibility: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        customParameters: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        tags?: string[] | undefined;
        author?: string | undefined;
        version?: string | undefined;
        modelCompatibility?: string[] | undefined;
        customParameters?: Record<string, any> | undefined;
    }, {
        tags?: string[] | undefined;
        author?: string | undefined;
        version?: string | undefined;
        modelCompatibility?: string[] | undefined;
        customParameters?: Record<string, any> | undefined;
    }>>;
    examples: z.ZodOptional<z.ZodArray<z.ZodObject<{
        input: z.ZodString;
        output: z.ZodString;
        notes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        input: string;
        output: string;
        notes?: string | undefined;
    }, {
        input: string;
        output: string;
        notes?: string | undefined;
    }>, "many">>;
    resources: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        url: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        url: string;
        description?: string | undefined;
    }, {
        name: string;
        url: string;
        description?: string | undefined;
    }>, "many">>;
    enabled: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    description: string;
    systemPrompt: string;
    enabled: boolean;
    category: "custom" | "generic" | "professional" | "creative" | "technical" | "educational" | "specialized" | "character";
    traits: string[];
    skills: string[];
    metadata?: {
        tags?: string[] | undefined;
        author?: string | undefined;
        version?: string | undefined;
        modelCompatibility?: string[] | undefined;
        customParameters?: Record<string, any> | undefined;
    } | undefined;
    examples?: {
        input: string;
        output: string;
        notes?: string | undefined;
    }[] | undefined;
    constraints?: string[] | undefined;
    resources?: {
        name: string;
        url: string;
        description?: string | undefined;
    }[] | undefined;
}, {
    name: string;
    description: string;
    systemPrompt: string;
    category: "custom" | "generic" | "professional" | "creative" | "technical" | "educational" | "specialized" | "character";
    traits: string[];
    skills: string[];
    enabled?: boolean | undefined;
    metadata?: {
        tags?: string[] | undefined;
        author?: string | undefined;
        version?: string | undefined;
        modelCompatibility?: string[] | undefined;
        customParameters?: Record<string, any> | undefined;
    } | undefined;
    examples?: {
        input: string;
        output: string;
        notes?: string | undefined;
    }[] | undefined;
    constraints?: string[] | undefined;
    resources?: {
        name: string;
        url: string;
        description?: string | undefined;
    }[] | undefined;
}>;
export declare const UpdatePersonaSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodEnum<["generic", "professional", "creative", "technical", "educational", "specialized", "character", "custom"]>>;
    systemPrompt: z.ZodOptional<z.ZodString>;
    traits: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    skills: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    constraints: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    metadata: z.ZodOptional<z.ZodObject<{
        author: z.ZodOptional<z.ZodString>;
        version: z.ZodOptional<z.ZodString>;
        modelCompatibility: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        customParameters: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        tags?: string[] | undefined;
        author?: string | undefined;
        version?: string | undefined;
        modelCompatibility?: string[] | undefined;
        customParameters?: Record<string, any> | undefined;
    }, {
        tags?: string[] | undefined;
        author?: string | undefined;
        version?: string | undefined;
        modelCompatibility?: string[] | undefined;
        customParameters?: Record<string, any> | undefined;
    }>>;
    examples: z.ZodOptional<z.ZodArray<z.ZodObject<{
        input: z.ZodString;
        output: z.ZodString;
        notes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        input: string;
        output: string;
        notes?: string | undefined;
    }, {
        input: string;
        output: string;
        notes?: string | undefined;
    }>, "many">>;
    resources: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        url: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        url: string;
        description?: string | undefined;
    }, {
        name: string;
        url: string;
        description?: string | undefined;
    }>, "many">>;
    enabled: z.ZodOptional<z.ZodBoolean>;
    createBackup: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    createBackup: boolean;
    name?: string | undefined;
    description?: string | undefined;
    systemPrompt?: string | undefined;
    enabled?: boolean | undefined;
    metadata?: {
        tags?: string[] | undefined;
        author?: string | undefined;
        version?: string | undefined;
        modelCompatibility?: string[] | undefined;
        customParameters?: Record<string, any> | undefined;
    } | undefined;
    category?: "custom" | "generic" | "professional" | "creative" | "technical" | "educational" | "specialized" | "character" | undefined;
    examples?: {
        input: string;
        output: string;
        notes?: string | undefined;
    }[] | undefined;
    traits?: string[] | undefined;
    skills?: string[] | undefined;
    constraints?: string[] | undefined;
    resources?: {
        name: string;
        url: string;
        description?: string | undefined;
    }[] | undefined;
}, {
    id: string;
    name?: string | undefined;
    description?: string | undefined;
    systemPrompt?: string | undefined;
    enabled?: boolean | undefined;
    metadata?: {
        tags?: string[] | undefined;
        author?: string | undefined;
        version?: string | undefined;
        modelCompatibility?: string[] | undefined;
        customParameters?: Record<string, any> | undefined;
    } | undefined;
    category?: "custom" | "generic" | "professional" | "creative" | "technical" | "educational" | "specialized" | "character" | undefined;
    examples?: {
        input: string;
        output: string;
        notes?: string | undefined;
    }[] | undefined;
    traits?: string[] | undefined;
    skills?: string[] | undefined;
    constraints?: string[] | undefined;
    resources?: {
        name: string;
        url: string;
        description?: string | undefined;
    }[] | undefined;
    createBackup?: boolean | undefined;
}>;
export declare const DeletePersonaSchema: z.ZodObject<{
    id: z.ZodString;
    createBackup: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    createBackup: boolean;
}, {
    id: string;
    createBackup?: boolean | undefined;
}>;
export declare const ActivatePersonaSchema: z.ZodObject<{
    id: z.ZodString;
    setAsDefault: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    setAsDefault: boolean;
}, {
    id: string;
    setAsDefault?: boolean | undefined;
}>;
export declare const UpdatePreferencesSchema: z.ZodObject<{
    defaultPersona: z.ZodOptional<z.ZodString>;
    categorySorting: z.ZodOptional<z.ZodBoolean>;
    autoActivate: z.ZodOptional<z.ZodBoolean>;
    enableVersioning: z.ZodOptional<z.ZodBoolean>;
    backupPersonas: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    defaultPersona?: string | undefined;
    categorySorting?: boolean | undefined;
    autoActivate?: boolean | undefined;
    enableVersioning?: boolean | undefined;
    backupPersonas?: boolean | undefined;
}, {
    defaultPersona?: string | undefined;
    categorySorting?: boolean | undefined;
    autoActivate?: boolean | undefined;
    enableVersioning?: boolean | undefined;
    backupPersonas?: boolean | undefined;
}>;
export declare const ImportPersonaSchema: z.ZodObject<{
    filePath: z.ZodString;
    overwrite: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    activate: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    overwrite: boolean;
    filePath: string;
    activate: boolean;
}, {
    filePath: string;
    overwrite?: boolean | undefined;
    activate?: boolean | undefined;
}>;
export declare const ExportPersonaSchema: z.ZodObject<{
    id: z.ZodString;
    outputPath: z.ZodOptional<z.ZodString>;
    format: z.ZodDefault<z.ZodOptional<z.ZodEnum<["json", "yaml", "md"]>>>;
    includeMetadata: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    includeExamples: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    format: "json" | "yaml" | "md";
    id: string;
    includeMetadata: boolean;
    includeExamples: boolean;
    outputPath?: string | undefined;
}, {
    id: string;
    format?: "json" | "yaml" | "md" | undefined;
    outputPath?: string | undefined;
    includeMetadata?: boolean | undefined;
    includeExamples?: boolean | undefined;
}>;
