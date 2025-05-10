import { z } from 'zod';
export declare function activate(): void;
/**
 * Handles file write events to extract metadata from new files
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
 * Handles metadata-reader commands
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
export declare const ReadMetadataSchema: z.ZodObject<{
    path: z.ZodString;
    type: z.ZodDefault<z.ZodOptional<z.ZodEnum<["auto", "file", "image", "audio", "video", "document", "code", "archive"]>>>;
    includeBasic: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    includeExtended: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    path: string;
    type: "code" | "file" | "image" | "audio" | "video" | "document" | "archive" | "auto";
    includeBasic: boolean;
    includeExtended: boolean;
}, {
    path: string;
    type?: "code" | "file" | "image" | "audio" | "video" | "document" | "archive" | "auto" | undefined;
    includeBasic?: boolean | undefined;
    includeExtended?: boolean | undefined;
}>;
export declare const ExtractMetadataSchema: z.ZodObject<{
    path: z.ZodString;
    options: z.ZodDefault<z.ZodOptional<z.ZodObject<{
        extractExif: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        extractContent: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        extractTags: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        extractDimensions: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        extractDuration: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        extractExif: boolean;
        extractContent: boolean;
        extractTags: boolean;
        extractDimensions: boolean;
        extractDuration: boolean;
    }, {
        extractExif?: boolean | undefined;
        extractContent?: boolean | undefined;
        extractTags?: boolean | undefined;
        extractDimensions?: boolean | undefined;
        extractDuration?: boolean | undefined;
    }>>>;
    useExternalTools: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    path: string;
    options: {
        extractExif: boolean;
        extractContent: boolean;
        extractTags: boolean;
        extractDimensions: boolean;
        extractDuration: boolean;
    };
    useExternalTools: boolean;
}, {
    path: string;
    options?: {
        extractExif?: boolean | undefined;
        extractContent?: boolean | undefined;
        extractTags?: boolean | undefined;
        extractDimensions?: boolean | undefined;
        extractDuration?: boolean | undefined;
    } | undefined;
    useExternalTools?: boolean | undefined;
}>;
export declare const BatchProcessSchema: z.ZodObject<{
    directory: z.ZodString;
    recursive: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    pattern: z.ZodOptional<z.ZodString>;
    outputFormat: z.ZodDefault<z.ZodOptional<z.ZodEnum<["json", "csv"]>>>;
    outputPath: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    directory: string;
    recursive: boolean;
    outputFormat: "json" | "csv";
    outputPath?: string | undefined;
    pattern?: string | undefined;
}, {
    directory: string;
    outputPath?: string | undefined;
    recursive?: boolean | undefined;
    pattern?: string | undefined;
    outputFormat?: "json" | "csv" | undefined;
}>;
export declare const ParseFileContentSchema: z.ZodObject<{
    path: z.ZodString;
    format: z.ZodDefault<z.ZodOptional<z.ZodEnum<["auto", "json", "yaml", "xml", "csv", "toml", "ini", "markdown"]>>>;
    extractStructure: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    extractLinks: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    extractHeadings: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    path: string;
    format: "json" | "markdown" | "csv" | "yaml" | "xml" | "auto" | "toml" | "ini";
    extractStructure: boolean;
    extractLinks: boolean;
    extractHeadings: boolean;
}, {
    path: string;
    format?: "json" | "markdown" | "csv" | "yaml" | "xml" | "auto" | "toml" | "ini" | undefined;
    extractStructure?: boolean | undefined;
    extractLinks?: boolean | undefined;
    extractHeadings?: boolean | undefined;
}>;
