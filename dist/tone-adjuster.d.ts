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
 * Handles tone-adjuster commands
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
export declare const AdjustTextSchema: z.ZodObject<{
    text: z.ZodString;
    toneName: z.ZodOptional<z.ZodString>;
    settings: z.ZodOptional<z.ZodObject<{
        formality: z.ZodOptional<z.ZodNumber>;
        complexity: z.ZodOptional<z.ZodNumber>;
        emotion: z.ZodOptional<z.ZodNumber>;
        confidence: z.ZodOptional<z.ZodNumber>;
        personalization: z.ZodOptional<z.ZodNumber>;
        enthusiasm: z.ZodOptional<z.ZodNumber>;
        technicality: z.ZodOptional<z.ZodNumber>;
        wordiness: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        emotion?: number | undefined;
        formality?: number | undefined;
        complexity?: number | undefined;
        confidence?: number | undefined;
        personalization?: number | undefined;
        enthusiasm?: number | undefined;
        technicality?: number | undefined;
        wordiness?: number | undefined;
    }, {
        emotion?: number | undefined;
        formality?: number | undefined;
        complexity?: number | undefined;
        confidence?: number | undefined;
        personalization?: number | undefined;
        enthusiasm?: number | undefined;
        technicality?: number | undefined;
        wordiness?: number | undefined;
    }>>;
    preserveCasing: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    preserveFormatting: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    text: string;
    preserveCasing: boolean;
    preserveFormatting: boolean;
    settings?: {
        emotion?: number | undefined;
        formality?: number | undefined;
        complexity?: number | undefined;
        confidence?: number | undefined;
        personalization?: number | undefined;
        enthusiasm?: number | undefined;
        technicality?: number | undefined;
        wordiness?: number | undefined;
    } | undefined;
    toneName?: string | undefined;
}, {
    text: string;
    settings?: {
        emotion?: number | undefined;
        formality?: number | undefined;
        complexity?: number | undefined;
        confidence?: number | undefined;
        personalization?: number | undefined;
        enthusiasm?: number | undefined;
        technicality?: number | undefined;
        wordiness?: number | undefined;
    } | undefined;
    toneName?: string | undefined;
    preserveCasing?: boolean | undefined;
    preserveFormatting?: boolean | undefined;
}>;
export declare const CreateProfileSchema: z.ZodObject<{
    name: z.ZodString;
    type: z.ZodEnum<["formal", "informal", "friendly", "professional", "technical", "simple", "persuasive", "empathetic", "enthusiastic", "neutral", "custom"]>;
    description: z.ZodString;
    settings: z.ZodObject<{
        formality: z.ZodNumber;
        complexity: z.ZodNumber;
        emotion: z.ZodNumber;
        confidence: z.ZodNumber;
        personalization: z.ZodNumber;
        enthusiasm: z.ZodNumber;
        technicality: z.ZodNumber;
        wordiness: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        emotion: number;
        formality: number;
        complexity: number;
        confidence: number;
        personalization: number;
        enthusiasm: number;
        technicality: number;
        wordiness: number;
    }, {
        emotion: number;
        formality: number;
        complexity: number;
        confidence: number;
        personalization: number;
        enthusiasm: number;
        technicality: number;
        wordiness: number;
    }>;
    examples: z.ZodArray<z.ZodString, "many">;
    isDefault: z.ZodOptional<z.ZodBoolean>;
    customRules: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    name: string;
    type: "custom" | "simple" | "professional" | "technical" | "formal" | "informal" | "friendly" | "persuasive" | "empathetic" | "enthusiastic" | "neutral";
    description: string;
    settings: {
        emotion: number;
        formality: number;
        complexity: number;
        confidence: number;
        personalization: number;
        enthusiasm: number;
        technicality: number;
        wordiness: number;
    };
    examples: string[];
    isDefault?: boolean | undefined;
    customRules?: string[] | undefined;
}, {
    name: string;
    type: "custom" | "simple" | "professional" | "technical" | "formal" | "informal" | "friendly" | "persuasive" | "empathetic" | "enthusiastic" | "neutral";
    description: string;
    settings: {
        emotion: number;
        formality: number;
        complexity: number;
        confidence: number;
        personalization: number;
        enthusiasm: number;
        technicality: number;
        wordiness: number;
    };
    examples: string[];
    isDefault?: boolean | undefined;
    customRules?: string[] | undefined;
}>;
export declare const ListProfilesSchema: z.ZodObject<{
    includeSettings: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    includeExamples: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    type: z.ZodDefault<z.ZodOptional<z.ZodEnum<["formal", "informal", "friendly", "professional", "technical", "simple", "persuasive", "empathetic", "enthusiastic", "neutral", "custom", "all"]>>>;
}, "strip", z.ZodTypeAny, {
    type: "custom" | "all" | "simple" | "professional" | "technical" | "formal" | "informal" | "friendly" | "persuasive" | "empathetic" | "enthusiastic" | "neutral";
    includeExamples: boolean;
    includeSettings: boolean;
}, {
    type?: "custom" | "all" | "simple" | "professional" | "technical" | "formal" | "informal" | "friendly" | "persuasive" | "empathetic" | "enthusiastic" | "neutral" | undefined;
    includeExamples?: boolean | undefined;
    includeSettings?: boolean | undefined;
}>;
export declare const SetActiveToneSchema: z.ZodObject<{
    toneName: z.ZodString;
}, "strip", z.ZodTypeAny, {
    toneName: string;
}, {
    toneName: string;
}>;
export declare const GetActiveToneSchema: z.ZodObject<{
    includeSettings: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    includeExamples: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    includeExamples: boolean;
    includeSettings: boolean;
}, {
    includeExamples?: boolean | undefined;
    includeSettings?: boolean | undefined;
}>;
export declare const DeleteProfileSchema: z.ZodObject<{
    profileName: z.ZodString;
    force: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    force: boolean;
    profileName: string;
}, {
    profileName: string;
    force?: boolean | undefined;
}>;
export declare const AddReplacementRuleSchema: z.ZodObject<{
    pattern: z.ZodString;
    replacement: z.ZodString;
    isRegex: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    caseSensitive: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    condition: z.ZodOptional<z.ZodObject<{
        setting: z.ZodEnum<["formality", "complexity", "emotion", "confidence", "personalization", "enthusiasm", "technicality", "wordiness"]>;
        operator: z.ZodEnum<[">", "<", ">=", "<=", "=="]>;
        value: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        value: number;
        operator: ">" | "<" | ">=" | "<=" | "==";
        setting: "emotion" | "formality" | "complexity" | "confidence" | "personalization" | "enthusiasm" | "technicality" | "wordiness";
    }, {
        value: number;
        operator: ">" | "<" | ">=" | "<=" | "==";
        setting: "emotion" | "formality" | "complexity" | "confidence" | "personalization" | "enthusiasm" | "technicality" | "wordiness";
    }>>;
}, "strip", z.ZodTypeAny, {
    pattern: string;
    caseSensitive: boolean;
    replacement: string;
    isRegex: boolean;
    condition?: {
        value: number;
        operator: ">" | "<" | ">=" | "<=" | "==";
        setting: "emotion" | "formality" | "complexity" | "confidence" | "personalization" | "enthusiasm" | "technicality" | "wordiness";
    } | undefined;
}, {
    pattern: string;
    replacement: string;
    condition?: {
        value: number;
        operator: ">" | "<" | ">=" | "<=" | "==";
        setting: "emotion" | "formality" | "complexity" | "confidence" | "personalization" | "enthusiasm" | "technicality" | "wordiness";
    } | undefined;
    caseSensitive?: boolean | undefined;
    isRegex?: boolean | undefined;
}>;
