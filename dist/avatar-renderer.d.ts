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
 * Handles avatar-renderer commands
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
export declare const RenderAvatarSchema: z.ZodObject<{
    type: z.ZodEnum<["initials", "gravatar", "identicon", "pixelart", "photo", "svg", "emoji", "custom"]>;
    input: z.ZodString;
    size: z.ZodOptional<z.ZodObject<{
        width: z.ZodNumber;
        height: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        width: number;
        height: number;
    }, {
        width: number;
        height: number;
    }>>;
    colors: z.ZodOptional<z.ZodObject<{
        background: z.ZodString;
        foreground: z.ZodString;
        accent: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        background: string;
        foreground: string;
        accent?: string | undefined;
    }, {
        background: string;
        foreground: string;
        accent?: string | undefined;
    }>>;
    roundedCorners: z.ZodOptional<z.ZodBoolean>;
    border: z.ZodOptional<z.ZodObject<{
        width: z.ZodNumber;
        color: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        width: number;
        color: string;
    }, {
        width: number;
        color: string;
    }>>;
    shadow: z.ZodOptional<z.ZodObject<{
        blur: z.ZodNumber;
        offset: z.ZodObject<{
            x: z.ZodNumber;
            y: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            x: number;
            y: number;
        }, {
            x: number;
            y: number;
        }>;
        color: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        offset: {
            x: number;
            y: number;
        };
        color: string;
        blur: number;
    }, {
        offset: {
            x: number;
            y: number;
        };
        color: string;
        blur: number;
    }>>;
    cacheEnabled: z.ZodOptional<z.ZodBoolean>;
    userId: z.ZodOptional<z.ZodString>;
    userName: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "custom" | "initials" | "gravatar" | "identicon" | "pixelart" | "photo" | "svg" | "emoji";
    input: string;
    size?: {
        width: number;
        height: number;
    } | undefined;
    colors?: {
        background: string;
        foreground: string;
        accent?: string | undefined;
    } | undefined;
    roundedCorners?: boolean | undefined;
    border?: {
        width: number;
        color: string;
    } | undefined;
    shadow?: {
        offset: {
            x: number;
            y: number;
        };
        color: string;
        blur: number;
    } | undefined;
    cacheEnabled?: boolean | undefined;
    userId?: string | undefined;
    userName?: string | undefined;
}, {
    type: "custom" | "initials" | "gravatar" | "identicon" | "pixelart" | "photo" | "svg" | "emoji";
    input: string;
    size?: {
        width: number;
        height: number;
    } | undefined;
    colors?: {
        background: string;
        foreground: string;
        accent?: string | undefined;
    } | undefined;
    roundedCorners?: boolean | undefined;
    border?: {
        width: number;
        color: string;
    } | undefined;
    shadow?: {
        offset: {
            x: number;
            y: number;
        };
        color: string;
        blur: number;
    } | undefined;
    cacheEnabled?: boolean | undefined;
    userId?: string | undefined;
    userName?: string | undefined;
}>;
export declare const GetAvatarSchema: z.ZodEffects<z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    userId: z.ZodOptional<z.ZodString>;
    userName: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<["initials", "gravatar", "identicon", "pixelart", "photo", "svg", "emoji", "custom"]>>;
    returnDataUrl: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    returnDataUrl: boolean;
    type?: "custom" | "initials" | "gravatar" | "identicon" | "pixelart" | "photo" | "svg" | "emoji" | undefined;
    id?: string | undefined;
    userId?: string | undefined;
    userName?: string | undefined;
}, {
    type?: "custom" | "initials" | "gravatar" | "identicon" | "pixelart" | "photo" | "svg" | "emoji" | undefined;
    id?: string | undefined;
    userId?: string | undefined;
    userName?: string | undefined;
    returnDataUrl?: boolean | undefined;
}>, {
    returnDataUrl: boolean;
    type?: "custom" | "initials" | "gravatar" | "identicon" | "pixelart" | "photo" | "svg" | "emoji" | undefined;
    id?: string | undefined;
    userId?: string | undefined;
    userName?: string | undefined;
}, {
    type?: "custom" | "initials" | "gravatar" | "identicon" | "pixelart" | "photo" | "svg" | "emoji" | undefined;
    id?: string | undefined;
    userId?: string | undefined;
    userName?: string | undefined;
    returnDataUrl?: boolean | undefined;
}>;
export declare const ListAvatarsSchema: z.ZodObject<{
    type: z.ZodDefault<z.ZodOptional<z.ZodEnum<["initials", "gravatar", "identicon", "pixelart", "photo", "svg", "emoji", "custom", "all"]>>>;
    userId: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    includeDataUrl: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    type: "custom" | "all" | "initials" | "gravatar" | "identicon" | "pixelart" | "photo" | "svg" | "emoji";
    limit: number;
    includeDataUrl: boolean;
    userId?: string | undefined;
}, {
    type?: "custom" | "all" | "initials" | "gravatar" | "identicon" | "pixelart" | "photo" | "svg" | "emoji" | undefined;
    limit?: number | undefined;
    userId?: string | undefined;
    includeDataUrl?: boolean | undefined;
}>;
export declare const DeleteAvatarSchema: z.ZodObject<{
    id: z.ZodString;
    deleteFile: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    deleteFile: boolean;
}, {
    id: string;
    deleteFile?: boolean | undefined;
}>;
export declare const GetSettingsSchema: z.ZodObject<{
    type: z.ZodDefault<z.ZodOptional<z.ZodEnum<["initials", "gravatar", "identicon", "pixelart", "photo", "svg", "emoji", "custom", "all"]>>>;
}, "strip", z.ZodTypeAny, {
    type: "custom" | "all" | "initials" | "gravatar" | "identicon" | "pixelart" | "photo" | "svg" | "emoji";
}, {
    type?: "custom" | "all" | "initials" | "gravatar" | "identicon" | "pixelart" | "photo" | "svg" | "emoji" | undefined;
}>;
