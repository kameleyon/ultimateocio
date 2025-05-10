import { z } from 'zod';
export declare function activate(): void;
/**
 * Handles file write events to detect performance issues
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
 * Handles performance-monitor commands
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
export declare const RecordMetricSchema: z.ZodObject<{
    name: z.ZodString;
    value: z.ZodNumber;
    unit: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    tags: z.ZodDefault<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    value: number;
    tags: Record<string, string>;
    unit: string;
}, {
    name: string;
    value: number;
    tags?: Record<string, string> | undefined;
    unit?: string | undefined;
}>;
export declare const StartTraceSchema: z.ZodObject<{
    name: z.ZodString;
    id: z.ZodOptional<z.ZodString>;
    parentId: z.ZodOptional<z.ZodString>;
    tags: z.ZodDefault<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    tags: Record<string, string>;
    id?: string | undefined;
    parentId?: string | undefined;
}, {
    name: string;
    id?: string | undefined;
    tags?: Record<string, string> | undefined;
    parentId?: string | undefined;
}>;
export declare const EndTraceSchema: z.ZodObject<{
    id: z.ZodString;
    tags: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    tags?: Record<string, string> | undefined;
}, {
    id: string;
    tags?: Record<string, string> | undefined;
}>;
export declare const RecordHistogramSchema: z.ZodObject<{
    name: z.ZodString;
    value: z.ZodNumber;
    tags: z.ZodDefault<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    value: number;
    tags: Record<string, string>;
}, {
    name: string;
    value: number;
    tags?: Record<string, string> | undefined;
}>;
export declare const GetMetricsSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    startTime: z.ZodOptional<z.ZodNumber>;
    endTime: z.ZodOptional<z.ZodNumber>;
    tags: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    aggregation: z.ZodDefault<z.ZodOptional<z.ZodEnum<["none", "avg", "min", "max", "sum", "count"]>>>;
    groupBy: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    aggregation: "min" | "max" | "none" | "count" | "avg" | "sum";
    name?: string | undefined;
    groupBy?: string[] | undefined;
    tags?: Record<string, string> | undefined;
    startTime?: number | undefined;
    endTime?: number | undefined;
}, {
    name?: string | undefined;
    limit?: number | undefined;
    groupBy?: string[] | undefined;
    tags?: Record<string, string> | undefined;
    startTime?: number | undefined;
    endTime?: number | undefined;
    aggregation?: "min" | "max" | "none" | "count" | "avg" | "sum" | undefined;
}>;
export declare const GetTracesSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    startTime: z.ZodOptional<z.ZodNumber>;
    endTime: z.ZodOptional<z.ZodNumber>;
    minDuration: z.ZodOptional<z.ZodNumber>;
    maxDuration: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    includeActive: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    includeActive: boolean;
    name?: string | undefined;
    id?: string | undefined;
    startTime?: number | undefined;
    endTime?: number | undefined;
    minDuration?: number | undefined;
    maxDuration?: number | undefined;
}, {
    name?: string | undefined;
    id?: string | undefined;
    limit?: number | undefined;
    startTime?: number | undefined;
    endTime?: number | undefined;
    minDuration?: number | undefined;
    maxDuration?: number | undefined;
    includeActive?: boolean | undefined;
}>;
export declare const GetHistogramsSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    startTime: z.ZodOptional<z.ZodNumber>;
    endTime: z.ZodOptional<z.ZodNumber>;
    tags: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    bucketCount: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    bucketCount: number;
    name?: string | undefined;
    tags?: Record<string, string> | undefined;
    startTime?: number | undefined;
    endTime?: number | undefined;
}, {
    name?: string | undefined;
    tags?: Record<string, string> | undefined;
    startTime?: number | undefined;
    endTime?: number | undefined;
    bucketCount?: number | undefined;
}>;
export declare const SystemMetricsSchema: z.ZodObject<{
    detailed: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    detailed: boolean;
}, {
    detailed?: boolean | undefined;
}>;
