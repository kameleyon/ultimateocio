import { z } from 'zod';
export declare function activate(): void;
/**
 * Handle file write events
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
 * Handles voice-cloner commands
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
export declare const CreateModelSchema: z.ZodObject<{
    name: z.ZodString;
    type: z.ZodEnum<["neural", "parametric", "unit-selection", "formant", "concatenative", "custom"]>;
    sourceId: z.ZodOptional<z.ZodString>;
    sourceName: z.ZodOptional<z.ZodString>;
    characteristics: z.ZodOptional<z.ZodObject<{
        pitch: z.ZodOptional<z.ZodNumber>;
        speed: z.ZodOptional<z.ZodNumber>;
        clarity: z.ZodOptional<z.ZodNumber>;
        depth: z.ZodOptional<z.ZodNumber>;
        breathiness: z.ZodOptional<z.ZodNumber>;
        warmth: z.ZodOptional<z.ZodNumber>;
        emotion: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        emotion?: string | undefined;
        speed?: number | undefined;
        pitch?: number | undefined;
        clarity?: number | undefined;
        depth?: number | undefined;
        breathiness?: number | undefined;
        warmth?: number | undefined;
    }, {
        emotion?: string | undefined;
        speed?: number | undefined;
        pitch?: number | undefined;
        clarity?: number | undefined;
        depth?: number | undefined;
        breathiness?: number | undefined;
        warmth?: number | undefined;
    }>>;
    sampleRate: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    bitDepth: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    filePath: z.ZodOptional<z.ZodString>;
    language: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    tags: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString, "many">>>;
    metadata: z.ZodDefault<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    type: "custom" | "neural" | "parametric" | "unit-selection" | "formant" | "concatenative";
    metadata: Record<string, any>;
    tags: string[];
    language: string;
    sampleRate: number;
    bitDepth: number;
    filePath?: string | undefined;
    sourceId?: string | undefined;
    sourceName?: string | undefined;
    characteristics?: {
        emotion?: string | undefined;
        speed?: number | undefined;
        pitch?: number | undefined;
        clarity?: number | undefined;
        depth?: number | undefined;
        breathiness?: number | undefined;
        warmth?: number | undefined;
    } | undefined;
}, {
    name: string;
    type: "custom" | "neural" | "parametric" | "unit-selection" | "formant" | "concatenative";
    metadata?: Record<string, any> | undefined;
    tags?: string[] | undefined;
    filePath?: string | undefined;
    language?: string | undefined;
    sourceId?: string | undefined;
    sourceName?: string | undefined;
    characteristics?: {
        emotion?: string | undefined;
        speed?: number | undefined;
        pitch?: number | undefined;
        clarity?: number | undefined;
        depth?: number | undefined;
        breathiness?: number | undefined;
        warmth?: number | undefined;
    } | undefined;
    sampleRate?: number | undefined;
    bitDepth?: number | undefined;
}>;
export declare const ListModelsSchema: z.ZodObject<{
    type: z.ZodDefault<z.ZodOptional<z.ZodEnum<["neural", "parametric", "unit-selection", "formant", "concatenative", "custom", "all"]>>>;
    language: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    sortBy: z.ZodDefault<z.ZodOptional<z.ZodEnum<["name", "created", "lastUsed"]>>>;
    sortDirection: z.ZodDefault<z.ZodOptional<z.ZodEnum<["asc", "desc"]>>>;
}, "strip", z.ZodTypeAny, {
    type: "custom" | "all" | "neural" | "parametric" | "unit-selection" | "formant" | "concatenative";
    limit: number;
    sortBy: "name" | "created" | "lastUsed";
    sortDirection: "asc" | "desc";
    tags?: string[] | undefined;
    language?: string | undefined;
}, {
    type?: "custom" | "all" | "neural" | "parametric" | "unit-selection" | "formant" | "concatenative" | undefined;
    limit?: number | undefined;
    sortBy?: "name" | "created" | "lastUsed" | undefined;
    tags?: string[] | undefined;
    sortDirection?: "asc" | "desc" | undefined;
    language?: string | undefined;
}>;
export declare const GetModelSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const DeleteModelSchema: z.ZodObject<{
    id: z.ZodString;
    deleteFile: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    deleteFile: boolean;
}, {
    id: string;
    deleteFile?: boolean | undefined;
}>;
export declare const GenerateAudioSchema: z.ZodObject<{
    text: z.ZodString;
    voiceId: z.ZodString;
    adjustments: z.ZodOptional<z.ZodObject<{
        pitch: z.ZodOptional<z.ZodNumber>;
        speed: z.ZodOptional<z.ZodNumber>;
        clarity: z.ZodOptional<z.ZodNumber>;
        depth: z.ZodOptional<z.ZodNumber>;
        breathiness: z.ZodOptional<z.ZodNumber>;
        warmth: z.ZodOptional<z.ZodNumber>;
        emotion: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        emotion?: string | undefined;
        speed?: number | undefined;
        pitch?: number | undefined;
        clarity?: number | undefined;
        depth?: number | undefined;
        breathiness?: number | undefined;
        warmth?: number | undefined;
    }, {
        emotion?: string | undefined;
        speed?: number | undefined;
        pitch?: number | undefined;
        clarity?: number | undefined;
        depth?: number | undefined;
        breathiness?: number | undefined;
        warmth?: number | undefined;
    }>>;
    outputFileName: z.ZodOptional<z.ZodString>;
    format: z.ZodDefault<z.ZodOptional<z.ZodEnum<["wav", "mp3", "ogg"]>>>;
    sampleRate: z.ZodOptional<z.ZodNumber>;
    bitDepth: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    text: string;
    format: "wav" | "mp3" | "ogg";
    voiceId: string;
    sampleRate?: number | undefined;
    bitDepth?: number | undefined;
    adjustments?: {
        emotion?: string | undefined;
        speed?: number | undefined;
        pitch?: number | undefined;
        clarity?: number | undefined;
        depth?: number | undefined;
        breathiness?: number | undefined;
        warmth?: number | undefined;
    } | undefined;
    outputFileName?: string | undefined;
}, {
    text: string;
    voiceId: string;
    format?: "wav" | "mp3" | "ogg" | undefined;
    sampleRate?: number | undefined;
    bitDepth?: number | undefined;
    adjustments?: {
        emotion?: string | undefined;
        speed?: number | undefined;
        pitch?: number | undefined;
        clarity?: number | undefined;
        depth?: number | undefined;
        breathiness?: number | undefined;
        warmth?: number | undefined;
    } | undefined;
    outputFileName?: string | undefined;
}>;
export declare const GetTaskSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
