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
 * Handles schema-validator commands
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
export declare const ValidateSchemaSchema: z.ZodEffects<z.ZodEffects<z.ZodObject<{
    schemaPath: z.ZodOptional<z.ZodString>;
    schemaContent: z.ZodOptional<z.ZodString>;
    schemaFormat: z.ZodDefault<z.ZodOptional<z.ZodEnum<["json", "yaml", "typescript", "graphql", "avro"]>>>;
    dataPath: z.ZodOptional<z.ZodString>;
    dataContent: z.ZodOptional<z.ZodString>;
    dataFormat: z.ZodDefault<z.ZodOptional<z.ZodEnum<["json", "yaml", "csv", "txt"]>>>;
    options: z.ZodDefault<z.ZodOptional<z.ZodObject<{
        allowUnknownProperties: z.ZodOptional<z.ZodBoolean>;
        coerceTypes: z.ZodOptional<z.ZodBoolean>;
        removeAdditional: z.ZodOptional<z.ZodBoolean>;
        strictArrays: z.ZodOptional<z.ZodBoolean>;
        strictObjects: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        allowUnknownProperties?: boolean | undefined;
        coerceTypes?: boolean | undefined;
        removeAdditional?: boolean | undefined;
        strictArrays?: boolean | undefined;
        strictObjects?: boolean | undefined;
    }, {
        allowUnknownProperties?: boolean | undefined;
        coerceTypes?: boolean | undefined;
        removeAdditional?: boolean | undefined;
        strictArrays?: boolean | undefined;
        strictObjects?: boolean | undefined;
    }>>>;
}, "strip", z.ZodTypeAny, {
    options: {
        allowUnknownProperties?: boolean | undefined;
        coerceTypes?: boolean | undefined;
        removeAdditional?: boolean | undefined;
        strictArrays?: boolean | undefined;
        strictObjects?: boolean | undefined;
    };
    schemaFormat: "json" | "yaml" | "typescript" | "graphql" | "avro";
    dataFormat: "json" | "csv" | "yaml" | "txt";
    schemaPath?: string | undefined;
    schemaContent?: string | undefined;
    dataPath?: string | undefined;
    dataContent?: string | undefined;
}, {
    options?: {
        allowUnknownProperties?: boolean | undefined;
        coerceTypes?: boolean | undefined;
        removeAdditional?: boolean | undefined;
        strictArrays?: boolean | undefined;
        strictObjects?: boolean | undefined;
    } | undefined;
    schemaPath?: string | undefined;
    schemaContent?: string | undefined;
    schemaFormat?: "json" | "yaml" | "typescript" | "graphql" | "avro" | undefined;
    dataPath?: string | undefined;
    dataContent?: string | undefined;
    dataFormat?: "json" | "csv" | "yaml" | "txt" | undefined;
}>, {
    options: {
        allowUnknownProperties?: boolean | undefined;
        coerceTypes?: boolean | undefined;
        removeAdditional?: boolean | undefined;
        strictArrays?: boolean | undefined;
        strictObjects?: boolean | undefined;
    };
    schemaFormat: "json" | "yaml" | "typescript" | "graphql" | "avro";
    dataFormat: "json" | "csv" | "yaml" | "txt";
    schemaPath?: string | undefined;
    schemaContent?: string | undefined;
    dataPath?: string | undefined;
    dataContent?: string | undefined;
}, {
    options?: {
        allowUnknownProperties?: boolean | undefined;
        coerceTypes?: boolean | undefined;
        removeAdditional?: boolean | undefined;
        strictArrays?: boolean | undefined;
        strictObjects?: boolean | undefined;
    } | undefined;
    schemaPath?: string | undefined;
    schemaContent?: string | undefined;
    schemaFormat?: "json" | "yaml" | "typescript" | "graphql" | "avro" | undefined;
    dataPath?: string | undefined;
    dataContent?: string | undefined;
    dataFormat?: "json" | "csv" | "yaml" | "txt" | undefined;
}>, {
    options: {
        allowUnknownProperties?: boolean | undefined;
        coerceTypes?: boolean | undefined;
        removeAdditional?: boolean | undefined;
        strictArrays?: boolean | undefined;
        strictObjects?: boolean | undefined;
    };
    schemaFormat: "json" | "yaml" | "typescript" | "graphql" | "avro";
    dataFormat: "json" | "csv" | "yaml" | "txt";
    schemaPath?: string | undefined;
    schemaContent?: string | undefined;
    dataPath?: string | undefined;
    dataContent?: string | undefined;
}, {
    options?: {
        allowUnknownProperties?: boolean | undefined;
        coerceTypes?: boolean | undefined;
        removeAdditional?: boolean | undefined;
        strictArrays?: boolean | undefined;
        strictObjects?: boolean | undefined;
    } | undefined;
    schemaPath?: string | undefined;
    schemaContent?: string | undefined;
    schemaFormat?: "json" | "yaml" | "typescript" | "graphql" | "avro" | undefined;
    dataPath?: string | undefined;
    dataContent?: string | undefined;
    dataFormat?: "json" | "csv" | "yaml" | "txt" | undefined;
}>;
export declare const CompileSchemaSchema: z.ZodEffects<z.ZodObject<{
    schemaPath: z.ZodOptional<z.ZodString>;
    schemaContent: z.ZodOptional<z.ZodString>;
    schemaFormat: z.ZodDefault<z.ZodOptional<z.ZodEnum<["json", "yaml", "typescript", "graphql", "avro"]>>>;
    outputFormat: z.ZodDefault<z.ZodOptional<z.ZodEnum<["json", "typescript"]>>>;
    outputPath: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    outputFormat: "json" | "typescript";
    schemaFormat: "json" | "yaml" | "typescript" | "graphql" | "avro";
    outputPath?: string | undefined;
    schemaPath?: string | undefined;
    schemaContent?: string | undefined;
}, {
    outputPath?: string | undefined;
    outputFormat?: "json" | "typescript" | undefined;
    schemaPath?: string | undefined;
    schemaContent?: string | undefined;
    schemaFormat?: "json" | "yaml" | "typescript" | "graphql" | "avro" | undefined;
}>, {
    outputFormat: "json" | "typescript";
    schemaFormat: "json" | "yaml" | "typescript" | "graphql" | "avro";
    outputPath?: string | undefined;
    schemaPath?: string | undefined;
    schemaContent?: string | undefined;
}, {
    outputPath?: string | undefined;
    outputFormat?: "json" | "typescript" | undefined;
    schemaPath?: string | undefined;
    schemaContent?: string | undefined;
    schemaFormat?: "json" | "yaml" | "typescript" | "graphql" | "avro" | undefined;
}>;
export declare const AnalyzeSchemaSchema: z.ZodEffects<z.ZodObject<{
    schemaPath: z.ZodOptional<z.ZodString>;
    schemaContent: z.ZodOptional<z.ZodString>;
    schemaFormat: z.ZodDefault<z.ZodOptional<z.ZodEnum<["json", "yaml", "typescript", "graphql", "avro"]>>>;
    includeStats: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    includeValidation: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    includeStats: boolean;
    schemaFormat: "json" | "yaml" | "typescript" | "graphql" | "avro";
    includeValidation: boolean;
    schemaPath?: string | undefined;
    schemaContent?: string | undefined;
}, {
    includeStats?: boolean | undefined;
    schemaPath?: string | undefined;
    schemaContent?: string | undefined;
    schemaFormat?: "json" | "yaml" | "typescript" | "graphql" | "avro" | undefined;
    includeValidation?: boolean | undefined;
}>, {
    includeStats: boolean;
    schemaFormat: "json" | "yaml" | "typescript" | "graphql" | "avro";
    includeValidation: boolean;
    schemaPath?: string | undefined;
    schemaContent?: string | undefined;
}, {
    includeStats?: boolean | undefined;
    schemaPath?: string | undefined;
    schemaContent?: string | undefined;
    schemaFormat?: "json" | "yaml" | "typescript" | "graphql" | "avro" | undefined;
    includeValidation?: boolean | undefined;
}>;
export declare const GenerateSchemaSchema: z.ZodEffects<z.ZodObject<{
    dataPath: z.ZodOptional<z.ZodString>;
    dataContent: z.ZodOptional<z.ZodString>;
    dataFormat: z.ZodDefault<z.ZodOptional<z.ZodEnum<["json", "yaml", "csv", "txt"]>>>;
    outputFormat: z.ZodDefault<z.ZodOptional<z.ZodEnum<["json", "typescript"]>>>;
    outputPath: z.ZodOptional<z.ZodString>;
    options: z.ZodDefault<z.ZodOptional<z.ZodObject<{
        required: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        examples: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        descriptions: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        required: boolean;
        examples: boolean;
        descriptions: boolean;
    }, {
        required?: boolean | undefined;
        examples?: boolean | undefined;
        descriptions?: boolean | undefined;
    }>>>;
}, "strip", z.ZodTypeAny, {
    options: {
        required: boolean;
        examples: boolean;
        descriptions: boolean;
    };
    outputFormat: "json" | "typescript";
    dataFormat: "json" | "csv" | "yaml" | "txt";
    outputPath?: string | undefined;
    dataPath?: string | undefined;
    dataContent?: string | undefined;
}, {
    options?: {
        required?: boolean | undefined;
        examples?: boolean | undefined;
        descriptions?: boolean | undefined;
    } | undefined;
    outputPath?: string | undefined;
    outputFormat?: "json" | "typescript" | undefined;
    dataPath?: string | undefined;
    dataContent?: string | undefined;
    dataFormat?: "json" | "csv" | "yaml" | "txt" | undefined;
}>, {
    options: {
        required: boolean;
        examples: boolean;
        descriptions: boolean;
    };
    outputFormat: "json" | "typescript";
    dataFormat: "json" | "csv" | "yaml" | "txt";
    outputPath?: string | undefined;
    dataPath?: string | undefined;
    dataContent?: string | undefined;
}, {
    options?: {
        required?: boolean | undefined;
        examples?: boolean | undefined;
        descriptions?: boolean | undefined;
    } | undefined;
    outputPath?: string | undefined;
    outputFormat?: "json" | "typescript" | undefined;
    dataPath?: string | undefined;
    dataContent?: string | undefined;
    dataFormat?: "json" | "csv" | "yaml" | "txt" | undefined;
}>;
export declare const ConvertSchemaSchema: z.ZodEffects<z.ZodObject<{
    schemaPath: z.ZodOptional<z.ZodString>;
    schemaContent: z.ZodOptional<z.ZodString>;
    sourceFormat: z.ZodDefault<z.ZodOptional<z.ZodEnum<["json", "yaml", "typescript", "graphql", "avro"]>>>;
    targetFormat: z.ZodDefault<z.ZodEnum<["json", "typescript"]>>;
    outputPath: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    sourceFormat: "json" | "yaml" | "typescript" | "graphql" | "avro";
    targetFormat: "json" | "typescript";
    outputPath?: string | undefined;
    schemaPath?: string | undefined;
    schemaContent?: string | undefined;
}, {
    outputPath?: string | undefined;
    schemaPath?: string | undefined;
    schemaContent?: string | undefined;
    sourceFormat?: "json" | "yaml" | "typescript" | "graphql" | "avro" | undefined;
    targetFormat?: "json" | "typescript" | undefined;
}>, {
    sourceFormat: "json" | "yaml" | "typescript" | "graphql" | "avro";
    targetFormat: "json" | "typescript";
    outputPath?: string | undefined;
    schemaPath?: string | undefined;
    schemaContent?: string | undefined;
}, {
    outputPath?: string | undefined;
    schemaPath?: string | undefined;
    schemaContent?: string | undefined;
    sourceFormat?: "json" | "yaml" | "typescript" | "graphql" | "avro" | undefined;
    targetFormat?: "json" | "typescript" | undefined;
}>;
