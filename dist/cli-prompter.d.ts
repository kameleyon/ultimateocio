import { z } from 'zod';
export declare function activate(): void;
/**
 * Handles file write events that might trigger CLI prompt updates
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
 * Handles cli-prompter commands
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
export declare const ShowPromptSchema: z.ZodObject<{
    prompt: z.ZodString;
    type: z.ZodDefault<z.ZodEnum<["input", "confirm", "select", "multiselect", "password"]>>;
    options: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    defaultValue: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodBoolean, z.ZodNumber]>>;
    validation: z.ZodOptional<z.ZodString>;
    timeout: z.ZodOptional<z.ZodNumber>;
    color: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "input" | "confirm" | "select" | "multiselect" | "password";
    prompt: string;
    options?: string[] | undefined;
    validation?: string | undefined;
    color?: string | undefined;
    timeout?: number | undefined;
    defaultValue?: string | number | boolean | undefined;
}, {
    prompt: string;
    options?: string[] | undefined;
    validation?: string | undefined;
    type?: "input" | "confirm" | "select" | "multiselect" | "password" | undefined;
    color?: string | undefined;
    timeout?: number | undefined;
    defaultValue?: string | number | boolean | undefined;
}>;
export declare const RunWizardSchema: z.ZodObject<{
    name: z.ZodString;
    steps: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        prompt: z.ZodString;
        type: z.ZodDefault<z.ZodEnum<["input", "confirm", "select", "multiselect", "password"]>>;
        options: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        defaultValue: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodBoolean, z.ZodNumber]>>;
        validation: z.ZodOptional<z.ZodString>;
        condition: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "input" | "confirm" | "select" | "multiselect" | "password";
        id: string;
        prompt: string;
        options?: string[] | undefined;
        validation?: string | undefined;
        defaultValue?: string | number | boolean | undefined;
        condition?: string | undefined;
    }, {
        id: string;
        prompt: string;
        options?: string[] | undefined;
        validation?: string | undefined;
        type?: "input" | "confirm" | "select" | "multiselect" | "password" | undefined;
        defaultValue?: string | number | boolean | undefined;
        condition?: string | undefined;
    }>, "many">;
    saveResultsTo: z.ZodOptional<z.ZodString>;
    onComplete: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    steps: {
        type: "input" | "confirm" | "select" | "multiselect" | "password";
        id: string;
        prompt: string;
        options?: string[] | undefined;
        validation?: string | undefined;
        defaultValue?: string | number | boolean | undefined;
        condition?: string | undefined;
    }[];
    saveResultsTo?: string | undefined;
    onComplete?: string | undefined;
}, {
    name: string;
    steps: {
        id: string;
        prompt: string;
        options?: string[] | undefined;
        validation?: string | undefined;
        type?: "input" | "confirm" | "select" | "multiselect" | "password" | undefined;
        defaultValue?: string | number | boolean | undefined;
        condition?: string | undefined;
    }[];
    saveResultsTo?: string | undefined;
    onComplete?: string | undefined;
}>;
export declare const GeneratePromptSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    type: z.ZodDefault<z.ZodEnum<["simple", "wizard", "menu", "form"]>>;
    outputFormat: z.ZodDefault<z.ZodEnum<["js", "json", "yaml", "cli-args"]>>;
    template: z.ZodOptional<z.ZodString>;
    fields: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        label: z.ZodString;
        type: z.ZodDefault<z.ZodEnum<["input", "confirm", "select", "multiselect", "password"]>>;
        options: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        defaultValue: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodBoolean, z.ZodNumber]>>;
        validation: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "input" | "confirm" | "select" | "multiselect" | "password";
        id: string;
        label: string;
        options?: string[] | undefined;
        validation?: string | undefined;
        defaultValue?: string | number | boolean | undefined;
    }, {
        id: string;
        label: string;
        options?: string[] | undefined;
        validation?: string | undefined;
        type?: "input" | "confirm" | "select" | "multiselect" | "password" | undefined;
        defaultValue?: string | number | boolean | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    name: string;
    type: "wizard" | "simple" | "menu" | "form";
    outputFormat: "json" | "js" | "yaml" | "cli-args";
    description?: string | undefined;
    template?: string | undefined;
    fields?: {
        type: "input" | "confirm" | "select" | "multiselect" | "password";
        id: string;
        label: string;
        options?: string[] | undefined;
        validation?: string | undefined;
        defaultValue?: string | number | boolean | undefined;
    }[] | undefined;
}, {
    name: string;
    type?: "wizard" | "simple" | "menu" | "form" | undefined;
    description?: string | undefined;
    outputFormat?: "json" | "js" | "yaml" | "cli-args" | undefined;
    template?: string | undefined;
    fields?: {
        id: string;
        label: string;
        options?: string[] | undefined;
        validation?: string | undefined;
        type?: "input" | "confirm" | "select" | "multiselect" | "password" | undefined;
        defaultValue?: string | number | boolean | undefined;
    }[] | undefined;
}>;
export declare const ValidateInputSchema: z.ZodObject<{
    input: z.ZodString;
    rules: z.ZodUnion<[z.ZodArray<z.ZodString, "many">, z.ZodRecord<z.ZodString, z.ZodString>]>;
    type: z.ZodDefault<z.ZodEnum<["string", "number", "email", "url", "ip", "date", "custom"]>>;
}, "strip", z.ZodTypeAny, {
    type: "string" | "number" | "date" | "custom" | "email" | "url" | "ip";
    input: string;
    rules: string[] | Record<string, string>;
}, {
    input: string;
    rules: string[] | Record<string, string>;
    type?: "string" | "number" | "date" | "custom" | "email" | "url" | "ip" | undefined;
}>;
