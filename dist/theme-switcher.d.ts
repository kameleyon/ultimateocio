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
 * Handles theme-switcher commands
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
export declare const SetThemeSchema: z.ZodObject<{
    themeName: z.ZodString;
    persist: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    themeName: string;
    persist: boolean;
}, {
    themeName: string;
    persist?: boolean | undefined;
}>;
export declare const SetLayoutSchema: z.ZodObject<{
    layoutName: z.ZodString;
    persist: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    persist: boolean;
    layoutName: string;
}, {
    layoutName: string;
    persist?: boolean | undefined;
}>;
export declare const AddThemeSchema: z.ZodObject<{
    name: z.ZodString;
    type: z.ZodEnum<["light", "dark", "system", "custom"]>;
    colors: z.ZodRecord<z.ZodString, z.ZodString>;
    isDefault: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    type: "custom" | "system" | "light" | "dark";
    colors: Record<string, string>;
    isDefault: boolean;
}, {
    name: string;
    type: "custom" | "system" | "light" | "dark";
    colors: Record<string, string>;
    isDefault?: boolean | undefined;
}>;
export declare const AddLayoutSchema: z.ZodObject<{
    name: z.ZodString;
    type: z.ZodEnum<["default", "compact", "comfortable", "wide", "narrow", "custom"]>;
    settings: z.ZodObject<{
        spacing: z.ZodNumber;
        fontSize: z.ZodNumber;
        containerWidth: z.ZodString;
        sidebar: z.ZodOptional<z.ZodObject<{
            width: z.ZodString;
            position: z.ZodEnum<["left", "right"]>;
            collapsed: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            width: string;
            position: "left" | "right";
            collapsed?: boolean | undefined;
        }, {
            width: string;
            position: "left" | "right";
            collapsed?: boolean | undefined;
        }>>;
        header: z.ZodOptional<z.ZodObject<{
            height: z.ZodString;
            fixed: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            fixed: boolean;
            height: string;
        }, {
            fixed: boolean;
            height: string;
        }>>;
        footer: z.ZodOptional<z.ZodObject<{
            height: z.ZodString;
            fixed: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            fixed: boolean;
            height: string;
        }, {
            fixed: boolean;
            height: string;
        }>>;
    }, "strip", z.ZodTypeAny, {
        spacing: number;
        fontSize: number;
        containerWidth: string;
        header?: {
            fixed: boolean;
            height: string;
        } | undefined;
        sidebar?: {
            width: string;
            position: "left" | "right";
            collapsed?: boolean | undefined;
        } | undefined;
        footer?: {
            fixed: boolean;
            height: string;
        } | undefined;
    }, {
        spacing: number;
        fontSize: number;
        containerWidth: string;
        header?: {
            fixed: boolean;
            height: string;
        } | undefined;
        sidebar?: {
            width: string;
            position: "left" | "right";
            collapsed?: boolean | undefined;
        } | undefined;
        footer?: {
            fixed: boolean;
            height: string;
        } | undefined;
    }>;
    isDefault: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    type: "custom" | "default" | "compact" | "comfortable" | "wide" | "narrow";
    settings: {
        spacing: number;
        fontSize: number;
        containerWidth: string;
        header?: {
            fixed: boolean;
            height: string;
        } | undefined;
        sidebar?: {
            width: string;
            position: "left" | "right";
            collapsed?: boolean | undefined;
        } | undefined;
        footer?: {
            fixed: boolean;
            height: string;
        } | undefined;
    };
    isDefault: boolean;
}, {
    name: string;
    type: "custom" | "default" | "compact" | "comfortable" | "wide" | "narrow";
    settings: {
        spacing: number;
        fontSize: number;
        containerWidth: string;
        header?: {
            fixed: boolean;
            height: string;
        } | undefined;
        sidebar?: {
            width: string;
            position: "left" | "right";
            collapsed?: boolean | undefined;
        } | undefined;
        footer?: {
            fixed: boolean;
            height: string;
        } | undefined;
    };
    isDefault?: boolean | undefined;
}>;
export declare const GetConfigSchema: z.ZodObject<{
    includeCss: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    includeCss: boolean;
}, {
    includeCss?: boolean | undefined;
}>;
export declare const SetAnimationsSchema: z.ZodObject<{
    enabled: z.ZodBoolean;
    speed: z.ZodOptional<z.ZodEnum<["slow", "normal", "fast"]>>;
}, "strip", z.ZodTypeAny, {
    enabled: boolean;
    speed?: "normal" | "slow" | "fast" | undefined;
}, {
    enabled: boolean;
    speed?: "normal" | "slow" | "fast" | undefined;
}>;
export declare const GenerateCssSchema: z.ZodObject<{
    outputPath: z.ZodOptional<z.ZodString>;
    includeCustomProperties: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    minify: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    includeCustomProperties: boolean;
    minify: boolean;
    outputPath?: string | undefined;
}, {
    outputPath?: string | undefined;
    includeCustomProperties?: boolean | undefined;
    minify?: boolean | undefined;
}>;
