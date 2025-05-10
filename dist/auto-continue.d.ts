import { z } from 'zod';
export declare function activate(): void;
/**
 * Handles file write events for continuation management
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
 * Handles auto-continue commands
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
export declare const RegisterContinuationSchema: z.ZodObject<{
    operationId: z.ZodOptional<z.ZodString>;
    type: z.ZodString;
    data: z.ZodAny;
    autoResume: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    checkpointInterval: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    sessionId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: string;
    autoResume: boolean;
    checkpointInterval: number;
    operationId?: string | undefined;
    data?: any;
    sessionId?: string | undefined;
}, {
    type: string;
    operationId?: string | undefined;
    data?: any;
    autoResume?: boolean | undefined;
    checkpointInterval?: number | undefined;
    sessionId?: string | undefined;
}>;
export declare const CheckContinuationSchema: z.ZodObject<{
    operationId: z.ZodString;
    sessionId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    operationId: string;
    sessionId?: string | undefined;
}, {
    operationId: string;
    sessionId?: string | undefined;
}>;
export declare const ResumeContinuationSchema: z.ZodObject<{
    operationId: z.ZodString;
    sessionId: z.ZodOptional<z.ZodString>;
    customData: z.ZodOptional<z.ZodAny>;
}, "strip", z.ZodTypeAny, {
    operationId: string;
    sessionId?: string | undefined;
    customData?: any;
}, {
    operationId: string;
    sessionId?: string | undefined;
    customData?: any;
}>;
export declare const CancelContinuationSchema: z.ZodObject<{
    operationId: z.ZodString;
    sessionId: z.ZodOptional<z.ZodString>;
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    operationId: string;
    sessionId?: string | undefined;
    reason?: string | undefined;
}, {
    operationId: string;
    sessionId?: string | undefined;
    reason?: string | undefined;
}>;
