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
 * Handles token-refresher commands
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
export declare const DecodeTokenSchema: z.ZodObject<{
    token: z.ZodString;
    storeResult: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    token: string;
    storeResult: boolean;
    name?: string | undefined;
    description?: string | undefined;
}, {
    token: string;
    name?: string | undefined;
    description?: string | undefined;
    storeResult?: boolean | undefined;
}>;
export declare const RefreshTokenSchema: z.ZodEffects<z.ZodObject<{
    tokenId: z.ZodOptional<z.ZodString>;
    token: z.ZodOptional<z.ZodString>;
    refreshToken: z.ZodOptional<z.ZodString>;
    clientId: z.ZodOptional<z.ZodString>;
    clientSecret: z.ZodOptional<z.ZodString>;
    refreshUrl: z.ZodOptional<z.ZodString>;
    headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    token?: string | undefined;
    data?: Record<string, any> | undefined;
    clientId?: string | undefined;
    tokenId?: string | undefined;
    refreshToken?: string | undefined;
    clientSecret?: string | undefined;
    refreshUrl?: string | undefined;
    headers?: Record<string, string> | undefined;
}, {
    token?: string | undefined;
    data?: Record<string, any> | undefined;
    clientId?: string | undefined;
    tokenId?: string | undefined;
    refreshToken?: string | undefined;
    clientSecret?: string | undefined;
    refreshUrl?: string | undefined;
    headers?: Record<string, string> | undefined;
}>, {
    token?: string | undefined;
    data?: Record<string, any> | undefined;
    clientId?: string | undefined;
    tokenId?: string | undefined;
    refreshToken?: string | undefined;
    clientSecret?: string | undefined;
    refreshUrl?: string | undefined;
    headers?: Record<string, string> | undefined;
}, {
    token?: string | undefined;
    data?: Record<string, any> | undefined;
    clientId?: string | undefined;
    tokenId?: string | undefined;
    refreshToken?: string | undefined;
    clientSecret?: string | undefined;
    refreshUrl?: string | undefined;
    headers?: Record<string, string> | undefined;
}>;
export declare const StoreTokenSchema: z.ZodObject<{
    token: z.ZodString;
    name: z.ZodString;
    type: z.ZodDefault<z.ZodEnum<["jwt", "oauth", "apikey", "custom"]>>;
    description: z.ZodOptional<z.ZodString>;
    refreshToken: z.ZodOptional<z.ZodString>;
    refreshUrl: z.ZodOptional<z.ZodString>;
    refreshHeaders: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    refreshData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    expiresAt: z.ZodOptional<z.ZodNumber>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    type: "custom" | "jwt" | "oauth" | "apikey";
    token: string;
    description?: string | undefined;
    metadata?: Record<string, any> | undefined;
    expiresAt?: number | undefined;
    refreshToken?: string | undefined;
    refreshUrl?: string | undefined;
    refreshHeaders?: Record<string, string> | undefined;
    refreshData?: Record<string, any> | undefined;
}, {
    name: string;
    token: string;
    type?: "custom" | "jwt" | "oauth" | "apikey" | undefined;
    description?: string | undefined;
    metadata?: Record<string, any> | undefined;
    expiresAt?: number | undefined;
    refreshToken?: string | undefined;
    refreshUrl?: string | undefined;
    refreshHeaders?: Record<string, string> | undefined;
    refreshData?: Record<string, any> | undefined;
}>;
export declare const ValidateTokenSchema: z.ZodEffects<z.ZodObject<{
    tokenId: z.ZodOptional<z.ZodString>;
    token: z.ZodOptional<z.ZodString>;
    jwksUrl: z.ZodOptional<z.ZodString>;
    issuer: z.ZodOptional<z.ZodString>;
    audience: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    token?: string | undefined;
    audience?: string | undefined;
    issuer?: string | undefined;
    tokenId?: string | undefined;
    jwksUrl?: string | undefined;
}, {
    token?: string | undefined;
    audience?: string | undefined;
    issuer?: string | undefined;
    tokenId?: string | undefined;
    jwksUrl?: string | undefined;
}>, {
    token?: string | undefined;
    audience?: string | undefined;
    issuer?: string | undefined;
    tokenId?: string | undefined;
    jwksUrl?: string | undefined;
}, {
    token?: string | undefined;
    audience?: string | undefined;
    issuer?: string | undefined;
    tokenId?: string | undefined;
    jwksUrl?: string | undefined;
}>;
export declare const ListTokensSchema: z.ZodObject<{
    type: z.ZodDefault<z.ZodOptional<z.ZodEnum<["jwt", "oauth", "apikey", "custom", "all"]>>>;
    includeDecoded: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    includeExpired: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    filter: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "custom" | "all" | "jwt" | "oauth" | "apikey";
    includeDecoded: boolean;
    includeExpired: boolean;
    filter?: string | undefined;
}, {
    filter?: string | undefined;
    type?: "custom" | "all" | "jwt" | "oauth" | "apikey" | undefined;
    includeDecoded?: boolean | undefined;
    includeExpired?: boolean | undefined;
}>;
export declare const GetTokenSchema: z.ZodObject<{
    tokenId: z.ZodString;
    includeDecoded: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    includeRefreshToken: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    tokenId: string;
    includeDecoded: boolean;
    includeRefreshToken: boolean;
}, {
    tokenId: string;
    includeDecoded?: boolean | undefined;
    includeRefreshToken?: boolean | undefined;
}>;
export declare const DeleteTokenSchema: z.ZodObject<{
    tokenId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    tokenId: string;
}, {
    tokenId: string;
}>;
