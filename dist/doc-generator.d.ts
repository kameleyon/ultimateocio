import { z } from 'zod';
export declare function activate(): void;
/**
 * Handles file write events to trigger documentation updates
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
 * Handles doc-generator commands
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
export declare const GenerateDocSchema: z.ZodObject<{
    path: z.ZodString;
    recursive: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    output: z.ZodOptional<z.ZodString>;
    format: z.ZodDefault<z.ZodOptional<z.ZodEnum<["markdown", "html", "json", "text"]>>>;
    includePrivate: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    customTemplate: z.ZodOptional<z.ZodString>;
    includeTOC: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    path: string;
    format: "text" | "json" | "markdown" | "html";
    recursive: boolean;
    includePrivate: boolean;
    includeTOC: boolean;
    customTemplate?: string | undefined;
    output?: string | undefined;
}, {
    path: string;
    format?: "text" | "json" | "markdown" | "html" | undefined;
    recursive?: boolean | undefined;
    customTemplate?: string | undefined;
    output?: string | undefined;
    includePrivate?: boolean | undefined;
    includeTOC?: boolean | undefined;
}>;
export declare const UpdateDocSchema: z.ZodObject<{
    path: z.ZodString;
    docPath: z.ZodString;
    updateMode: z.ZodDefault<z.ZodOptional<z.ZodEnum<["append", "replace", "merge"]>>>;
    updateSections: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    path: string;
    docPath: string;
    updateMode: "replace" | "append" | "merge";
    updateSections?: string[] | undefined;
}, {
    path: string;
    docPath: string;
    updateMode?: "replace" | "append" | "merge" | undefined;
    updateSections?: string[] | undefined;
}>;
export declare const GenerateReadmeSchema: z.ZodObject<{
    projectPath: z.ZodString;
    output: z.ZodOptional<z.ZodString>;
    sections: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodEnum<["title", "description", "installation", "usage", "api", "examples", "contributing", "license", "badges", "screenshots", "testing", "roadmap", "faq", "acknowledgements", "contact"]>, "many">>>;
    detectFromPackageJson: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    includeBadges: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    badgeTypes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    projectPath: string;
    sections: ("api" | "description" | "title" | "testing" | "installation" | "usage" | "examples" | "contributing" | "license" | "badges" | "screenshots" | "roadmap" | "faq" | "acknowledgements" | "contact")[];
    detectFromPackageJson: boolean;
    includeBadges: boolean;
    output?: string | undefined;
    badgeTypes?: string[] | undefined;
}, {
    projectPath: string;
    output?: string | undefined;
    sections?: ("api" | "description" | "title" | "testing" | "installation" | "usage" | "examples" | "contributing" | "license" | "badges" | "screenshots" | "roadmap" | "faq" | "acknowledgements" | "contact")[] | undefined;
    detectFromPackageJson?: boolean | undefined;
    includeBadges?: boolean | undefined;
    badgeTypes?: string[] | undefined;
}>;
export declare const AnalyzeDocSchema: z.ZodObject<{
    path: z.ZodString;
    checkCoverage: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    checkQuality: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    suggestImprovements: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    path: string;
    suggestImprovements: boolean;
    checkCoverage: boolean;
    checkQuality: boolean;
}, {
    path: string;
    suggestImprovements?: boolean | undefined;
    checkCoverage?: boolean | undefined;
    checkQuality?: boolean | undefined;
}>;
