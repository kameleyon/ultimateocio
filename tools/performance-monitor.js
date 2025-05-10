"use strict";
// Auto-generated boilerplate for performance-monitor
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemMetricsSchema = exports.GetHistogramsSchema = exports.GetTracesSchema = exports.GetMetricsSchema = exports.RecordHistogramSchema = exports.EndTraceSchema = exports.StartTraceSchema = exports.RecordMetricSchema = void 0;
exports.activate = activate;
exports.onFileWrite = onFileWrite;
exports.onSessionStart = onSessionStart;
exports.onCommand = onCommand;
const zod_1 = require("zod");
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const perf_hooks_1 = require("perf_hooks");
// Performance monitoring state
const state = {
    metrics: [],
    activeTraces: new Map(),
    completedTraces: [],
    histograms: new Map(),
    startTime: Date.now(),
    isRecording: true,
    maxMetricsPerName: 1000,
    maxHistogramValues: 10000,
    maxCompletedTraces: 1000,
    lastSystemMetricsTime: 0,
    systemMetricsInterval: 60000, // 1 minute
};
function activate() {
    console.log("[TOOL] performance-monitor activated");
    // Initialize with system metrics
    recordSystemMetrics();
}
/**
 * Handles file write events to detect performance issues
 */
function onFileWrite(event) {
    // Record metric for file write operation
    recordMetric('file.write.size', Buffer.byteLength(event.content), 'bytes', {
        path: event.path,
        extension: path.extname(event.path)
    });
}
/**
 * Handles session start logic
 */
function onSessionStart(session) {
    console.log(`[Performance Monitor] Session started: ${session.id}`);
    // Reset state for new session
    state.metrics = [];
    state.activeTraces.clear();
    state.completedTraces = [];
    state.histograms.clear();
    state.startTime = Date.now();
    state.isRecording = true;
    // Record system metrics at session start
    recordSystemMetrics();
}
/**
 * Handles performance-monitor commands
 */
function onCommand(command) {
    return __awaiter(this, void 0, void 0, function* () {
        switch (command.name) {
            case 'performance-monitor:record-metric':
                console.log('[Performance Monitor] Recording metric...');
                return yield handleRecordMetric(command.args[0]);
            case 'performance-monitor:start-trace':
                console.log('[Performance Monitor] Starting trace...');
                return yield handleStartTrace(command.args[0]);
            case 'performance-monitor:end-trace':
                console.log('[Performance Monitor] Ending trace...');
                return yield handleEndTrace(command.args[0]);
            case 'performance-monitor:record-histogram':
                console.log('[Performance Monitor] Recording histogram value...');
                return yield handleRecordHistogram(command.args[0]);
            case 'performance-monitor:get-metrics':
                console.log('[Performance Monitor] Getting metrics...');
                return yield handleGetMetrics(command.args[0]);
            case 'performance-monitor:get-traces':
                console.log('[Performance Monitor] Getting traces...');
                return yield handleGetTraces(command.args[0]);
            case 'performance-monitor:get-histograms':
                console.log('[Performance Monitor] Getting histogram data...');
                return yield handleGetHistograms(command.args[0]);
            case 'performance-monitor:system-metrics':
                console.log('[Performance Monitor] Getting system metrics...');
                return yield handleSystemMetrics(command.args[0]);
            default:
                console.warn(`[Performance Monitor] Unknown command: ${command.name}`);
                return { error: `Unknown command: ${command.name}` };
        }
    });
}
// Define schemas for Performance Monitor tool
exports.RecordMetricSchema = zod_1.z.object({
    name: zod_1.z.string(),
    value: zod_1.z.number(),
    unit: zod_1.z.string().optional().default('ms'),
    tags: zod_1.z.record(zod_1.z.string()).optional().default({}),
});
exports.StartTraceSchema = zod_1.z.object({
    name: zod_1.z.string(),
    id: zod_1.z.string().optional(),
    parentId: zod_1.z.string().optional(),
    tags: zod_1.z.record(zod_1.z.string()).optional().default({}),
});
exports.EndTraceSchema = zod_1.z.object({
    id: zod_1.z.string(),
    tags: zod_1.z.record(zod_1.z.string()).optional(),
});
exports.RecordHistogramSchema = zod_1.z.object({
    name: zod_1.z.string(),
    value: zod_1.z.number(),
    tags: zod_1.z.record(zod_1.z.string()).optional().default({}),
});
exports.GetMetricsSchema = zod_1.z.object({
    name: zod_1.z.string().optional(),
    startTime: zod_1.z.number().optional(),
    endTime: zod_1.z.number().optional(),
    tags: zod_1.z.record(zod_1.z.string()).optional(),
    limit: zod_1.z.number().optional().default(100),
    aggregation: zod_1.z.enum(['none', 'avg', 'min', 'max', 'sum', 'count']).optional().default('none'),
    groupBy: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.GetTracesSchema = zod_1.z.object({
    id: zod_1.z.string().optional(),
    name: zod_1.z.string().optional(),
    startTime: zod_1.z.number().optional(),
    endTime: zod_1.z.number().optional(),
    minDuration: zod_1.z.number().optional(),
    maxDuration: zod_1.z.number().optional(),
    limit: zod_1.z.number().optional().default(10),
    includeActive: zod_1.z.boolean().optional().default(false),
});
exports.GetHistogramsSchema = zod_1.z.object({
    name: zod_1.z.string().optional(),
    startTime: zod_1.z.number().optional(),
    endTime: zod_1.z.number().optional(),
    tags: zod_1.z.record(zod_1.z.string()).optional(),
    bucketCount: zod_1.z.number().optional().default(10),
});
exports.SystemMetricsSchema = zod_1.z.object({
    detailed: zod_1.z.boolean().optional().default(false),
});
/**
 * Generate a unique ID for a trace
 */
function generateId() {
    return Math.random().toString(36).substring(2, 15);
}
/**
 * Record a metric value
 */
function recordMetric(name, value, unit = 'ms', tags = {}) {
    const metric = {
        name,
        value,
        unit,
        timestamp: Date.now(),
        tags,
    };
    // Add to metrics array, limiting size per metric name
    const nameMetrics = state.metrics.filter(m => m.name === name);
    if (nameMetrics.length >= state.maxMetricsPerName) {
        // Remove oldest metric with this name
        const oldestIndex = state.metrics.findIndex(m => m.name === name);
        if (oldestIndex !== -1) {
            state.metrics.splice(oldestIndex, 1);
        }
    }
    state.metrics.push(metric);
    return metric;
}
/**
 * Start a trace span
 */
function startTrace(name, id = generateId(), parentId, tags = {}) {
    const trace = {
        id,
        name,
        startTime: perf_hooks_1.performance.now(),
        tags,
        children: [],
        parentId
    };
    // Add as child to parent if exists
    if (parentId && state.activeTraces.has(parentId)) {
        const parent = state.activeTraces.get(parentId);
        parent.children.push(trace);
    }
    state.activeTraces.set(id, trace);
    return trace;
}
/**
 * End a trace span
 */
function endTrace(id, additionalTags = {}) {
    if (!state.activeTraces.has(id)) {
        return null;
    }
    const trace = state.activeTraces.get(id);
    trace.endTime = perf_hooks_1.performance.now();
    trace.duration = trace.endTime - trace.startTime;
    // Merge additional tags
    trace.tags = Object.assign(Object.assign({}, trace.tags), additionalTags);
    // Remove from active traces
    state.activeTraces.delete(id);
    // Only add to completed traces if it's a root span
    if (!trace.parentId) {
        state.completedTraces.push(trace);
        // Limit number of completed traces
        if (state.completedTraces.length > state.maxCompletedTraces) {
            state.completedTraces.shift();
        }
        // Record duration as a metric
        recordMetric(`trace.${trace.name}.duration`, trace.duration, 'ms', trace.tags);
    }
    return trace;
}
/**
 * Record a value in a histogram
 */
function recordHistogramValue(name, value, tags = {}) {
    // Create histogram if it doesn't exist
    if (!state.histograms.has(name)) {
        state.histograms.set(name, []);
    }
    const values = state.histograms.get(name);
    // Add value to histogram
    values.push(value);
    // Limit size of histogram
    if (values.length > state.maxHistogramValues) {
        values.shift();
    }
    // Also record as a regular metric
    recordMetric(name, value, 'ms', tags);
}
/**
 * Calculate histogram data
 */
function calculateHistogram(values, bucketCount = 10) {
    if (values.length === 0) {
        return {
            min: 0,
            max: 0,
            mean: 0,
            median: 0,
            p95: 0,
            p99: 0,
            count: 0,
            buckets: {}
        };
    }
    // Sort values
    const sortedValues = [...values].sort((a, b) => a - b);
    // Calculate basic statistics
    const min = sortedValues[0];
    const max = sortedValues[sortedValues.length - 1];
    const mean = sortedValues.reduce((a, b) => a + b, 0) / sortedValues.length;
    const median = sortedValues[Math.floor(sortedValues.length / 2)];
    const p95 = sortedValues[Math.floor(sortedValues.length * 0.95)];
    const p99 = sortedValues[Math.floor(sortedValues.length * 0.99)];
    // Create buckets
    const buckets = {};
    const bucketSize = (max - min) / bucketCount;
    for (let i = 0; i < bucketCount; i++) {
        const bucketStart = min + i * bucketSize;
        const bucketEnd = bucketStart + bucketSize;
        const bucketKey = `${bucketStart.toFixed(2)}-${bucketEnd.toFixed(2)}`;
        buckets[bucketKey] = 0;
    }
    // Count values in each bucket
    for (const value of sortedValues) {
        const bucketIndex = Math.min(Math.floor((value - min) / bucketSize), bucketCount - 1);
        const bucketStart = min + bucketIndex * bucketSize;
        const bucketEnd = bucketStart + bucketSize;
        const bucketKey = `${bucketStart.toFixed(2)}-${bucketEnd.toFixed(2)}`;
        buckets[bucketKey]++;
    }
    return {
        min,
        max,
        mean,
        median,
        p95,
        p99,
        count: values.length,
        buckets
    };
}
/**
 * Record current system metrics
 */
function recordSystemMetrics() {
    const now = Date.now();
    // Only record system metrics every minute
    if (now - state.lastSystemMetricsTime < state.systemMetricsInterval) {
        return;
    }
    state.lastSystemMetricsTime = now;
    // CPU usage
    const cpus = os.cpus();
    const cpuUsage = cpus.map(cpu => {
        const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
        const idle = cpu.times.idle;
        return 100 - (idle / total * 100);
    });
    const avgCpuUsage = cpuUsage.reduce((a, b) => a + b, 0) / cpuUsage.length;
    recordMetric('system.cpu.usage', avgCpuUsage, 'percent');
    // Memory usage
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memUsagePercent = (usedMem / totalMem) * 100;
    recordMetric('system.memory.total', totalMem, 'bytes');
    recordMetric('system.memory.free', freeMem, 'bytes');
    recordMetric('system.memory.used', usedMem, 'bytes');
    recordMetric('system.memory.usage', memUsagePercent, 'percent');
    // Load average
    const loadAvg = os.loadavg();
    recordMetric('system.load.1m', loadAvg[0], 'load');
    recordMetric('system.load.5m', loadAvg[1], 'load');
    recordMetric('system.load.15m', loadAvg[2], 'load');
    // Uptime
    recordMetric('system.uptime', os.uptime(), 'seconds');
    // Process memory usage
    const processMemory = process.memoryUsage();
    recordMetric('process.memory.rss', processMemory.rss, 'bytes');
    recordMetric('process.memory.heapTotal', processMemory.heapTotal, 'bytes');
    recordMetric('process.memory.heapUsed', processMemory.heapUsed, 'bytes');
    recordMetric('process.memory.external', processMemory.external, 'bytes');
}
/**
 * Filter metrics based on criteria
 */
function filterMetrics(metrics, name, startTime, endTime, tags) {
    return metrics.filter(metric => {
        // Filter by name if provided
        if (name && metric.name !== name) {
            return false;
        }
        // Filter by time range if provided
        if (startTime && metric.timestamp < startTime) {
            return false;
        }
        if (endTime && metric.timestamp > endTime) {
            return false;
        }
        // Filter by tags if provided
        if (tags) {
            for (const [key, value] of Object.entries(tags)) {
                if (metric.tags[key] !== value) {
                    return false;
                }
            }
        }
        return true;
    });
}
/**
 * Aggregate metrics by group and function
 */
function aggregateMetrics(metrics, aggregation, groupBy) {
    if (aggregation === 'none' || metrics.length === 0) {
        return metrics;
    }
    // If no groupBy, aggregate all metrics together
    if (!groupBy || groupBy.length === 0) {
        let result;
        switch (aggregation) {
            case 'avg':
                result = metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length;
                break;
            case 'min':
                result = Math.min(...metrics.map(m => m.value));
                break;
            case 'max':
                result = Math.max(...metrics.map(m => m.value));
                break;
            case 'sum':
                result = metrics.reduce((sum, m) => sum + m.value, 0);
                break;
            case 'count':
                result = metrics.length;
                break;
            default:
                return metrics;
        }
        return {
            value: result,
            count: metrics.length,
            unit: metrics[0].unit
        };
    }
    // Group metrics by the groupBy fields
    const groups = new Map();
    for (const metric of metrics) {
        const groupKey = groupBy.map(key => {
            if (key === 'name') {
                return metric.name;
            }
            else if (key === 'unit') {
                return metric.unit;
            }
            else {
                return metric.tags[key] || 'null';
            }
        }).join(':');
        if (!groups.has(groupKey)) {
            groups.set(groupKey, []);
        }
        groups.get(groupKey).push(metric);
    }
    // Aggregate each group
    const results = [];
    for (const [key, groupMetrics] of groups.entries()) {
        let value;
        switch (aggregation) {
            case 'avg':
                value = groupMetrics.reduce((sum, m) => sum + m.value, 0) / groupMetrics.length;
                break;
            case 'min':
                value = Math.min(...groupMetrics.map(m => m.value));
                break;
            case 'max':
                value = Math.max(...groupMetrics.map(m => m.value));
                break;
            case 'sum':
                value = groupMetrics.reduce((sum, m) => sum + m.value, 0);
                break;
            case 'count':
                value = groupMetrics.length;
                break;
            default:
                continue;
        }
        const keyParts = key.split(':');
        const result = {
            value,
            count: groupMetrics.length,
            unit: groupMetrics[0].unit
        };
        // Add group fields
        groupBy.forEach((field, index) => {
            if (field === 'name') {
                result.name = keyParts[index];
            }
            else if (field === 'unit') {
                result.unit = keyParts[index];
            }
            else {
                if (!result.tags) {
                    result.tags = {};
                }
                result.tags[field] = keyParts[index];
            }
        });
        results.push(result);
    }
    return results;
}
/**
 * Handles recording a metric
 */
function handleRecordMetric(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = exports.RecordMetricSchema.safeParse(args);
            if (!result.success) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: result.error.format(),
                                message: "Invalid arguments for recording metric"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            const { name, value, unit, tags } = result.data;
            // Record metric
            const metric = recordMetric(name, value, unit, tags);
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            name,
                            value,
                            unit,
                            timestamp: metric.timestamp,
                            tags,
                            message: `Successfully recorded metric ${name}`
                        }, null, 2)
                    }]
            };
        }
        catch (error) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: String(error),
                            message: "Failed to record metric"
                        }, null, 2)
                    }],
                isError: true
            };
        }
    });
}
/**
 * Handles starting a trace
 */
function handleStartTrace(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = exports.StartTraceSchema.safeParse(args);
            if (!result.success) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: result.error.format(),
                                message: "Invalid arguments for starting trace"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            const { name, id, parentId, tags } = result.data;
            // Start trace
            const trace = startTrace(name, id, parentId, tags);
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            id: trace.id,
                            name,
                            startTime: trace.startTime,
                            parentId: trace.parentId,
                            tags,
                            message: `Successfully started trace ${name}`
                        }, null, 2)
                    }]
            };
        }
        catch (error) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: String(error),
                            message: "Failed to start trace"
                        }, null, 2)
                    }],
                isError: true
            };
        }
    });
}
/**
 * Handles ending a trace
 */
function handleEndTrace(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = exports.EndTraceSchema.safeParse(args);
            if (!result.success) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: result.error.format(),
                                message: "Invalid arguments for ending trace"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            const { id, tags } = result.data;
            // End trace
            const trace = endTrace(id, tags);
            if (!trace) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: `Trace with ID ${id} not found`,
                                message: "Failed to end trace"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            id: trace.id,
                            name: trace.name,
                            startTime: trace.startTime,
                            endTime: trace.endTime,
                            duration: trace.duration,
                            parentId: trace.parentId,
                            childCount: trace.children.length,
                            tags: trace.tags,
                            message: `Successfully ended trace ${trace.name}`
                        }, null, 2)
                    }]
            };
        }
        catch (error) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: String(error),
                            message: "Failed to end trace"
                        }, null, 2)
                    }],
                isError: true
            };
        }
    });
}
/**
 * Handles recording a histogram value
 */
function handleRecordHistogram(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = exports.RecordHistogramSchema.safeParse(args);
            if (!result.success) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: result.error.format(),
                                message: "Invalid arguments for recording histogram value"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            const { name, value, tags } = result.data;
            // Record histogram value
            recordHistogramValue(name, value, tags);
            // Get current histogram data
            const histogramValues = state.histograms.get(name) || [];
            const histogram = calculateHistogram(histogramValues);
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            name,
                            value,
                            count: histogram.count,
                            min: histogram.min,
                            max: histogram.max,
                            mean: histogram.mean,
                            p95: histogram.p95,
                            tags,
                            message: `Successfully recorded histogram value for ${name}`
                        }, null, 2)
                    }]
            };
        }
        catch (error) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: String(error),
                            message: "Failed to record histogram value"
                        }, null, 2)
                    }],
                isError: true
            };
        }
    });
}
/**
 * Handles getting metrics
 */
function handleGetMetrics(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = exports.GetMetricsSchema.safeParse(args);
            if (!result.success) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: result.error.format(),
                                message: "Invalid arguments for getting metrics"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            const { name, startTime, endTime, tags, limit, aggregation, groupBy } = result.data;
            // Filter metrics
            let filteredMetrics = filterMetrics(state.metrics, name, startTime, endTime, tags);
            // Apply limit
            if (aggregation === 'none') {
                filteredMetrics = filteredMetrics.slice(-limit);
            }
            // Aggregate metrics
            const aggregatedMetrics = aggregateMetrics(filteredMetrics, aggregation, groupBy);
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            metrics: aggregatedMetrics,
                            count: Array.isArray(aggregatedMetrics) ? aggregatedMetrics.length : 1,
                            totalCount: filteredMetrics.length,
                            aggregation,
                            groupBy,
                            message: `Retrieved ${Array.isArray(aggregatedMetrics) ? aggregatedMetrics.length : 1} metrics`
                        }, null, 2)
                    }]
            };
        }
        catch (error) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: String(error),
                            message: "Failed to get metrics"
                        }, null, 2)
                    }],
                isError: true
            };
        }
    });
}
/**
 * Handles getting traces
 */
function handleGetTraces(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = exports.GetTracesSchema.safeParse(args);
            if (!result.success) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: result.error.format(),
                                message: "Invalid arguments for getting traces"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            const { id, name, startTime, endTime, minDuration, maxDuration, limit, includeActive } = result.data;
            // If querying by ID
            if (id) {
                // Check active traces first
                if (state.activeTraces.has(id)) {
                    const trace = state.activeTraces.get(id);
                    return {
                        content: [{
                                type: "text",
                                text: JSON.stringify({
                                    traces: [trace],
                                    count: 1,
                                    active: true,
                                    message: `Found active trace with ID ${id}`
                                }, null, 2)
                            }]
                    };
                }
                // Then check completed traces
                const trace = state.completedTraces.find(t => t.id === id);
                if (trace) {
                    return {
                        content: [{
                                type: "text",
                                text: JSON.stringify({
                                    traces: [trace],
                                    count: 1,
                                    active: false,
                                    message: `Found completed trace with ID ${id}`
                                }, null, 2)
                            }]
                    };
                }
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: `Trace with ID ${id} not found`,
                                message: "Failed to get trace"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            // Filter completed traces
            let filteredTraces = [...state.completedTraces];
            if (name) {
                filteredTraces = filteredTraces.filter(t => t.name === name);
            }
            if (startTime) {
                filteredTraces = filteredTraces.filter(t => t.startTime >= startTime);
            }
            if (endTime) {
                filteredTraces = filteredTraces.filter(t => t.startTime <= endTime);
            }
            if (minDuration !== undefined) {
                filteredTraces = filteredTraces.filter(t => (t.duration || 0) >= minDuration);
            }
            if (maxDuration !== undefined) {
                filteredTraces = filteredTraces.filter(t => (t.duration || 0) <= maxDuration);
            }
            // Include active traces if requested
            let activeTracesList = [];
            if (includeActive) {
                activeTracesList = Array.from(state.activeTraces.values());
                if (name) {
                    activeTracesList = activeTracesList.filter(t => t.name === name);
                }
                if (startTime) {
                    activeTracesList = activeTracesList.filter(t => t.startTime >= startTime);
                }
                if (endTime) {
                    activeTracesList = activeTracesList.filter(t => t.startTime <= endTime);
                }
                // Add active traces to the list
                filteredTraces = [...activeTracesList, ...filteredTraces];
            }
            // Sort by start time (newest first)
            filteredTraces.sort((a, b) => b.startTime - a.startTime);
            // Apply limit
            filteredTraces = filteredTraces.slice(0, limit);
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            traces: filteredTraces,
                            count: filteredTraces.length,
                            activeCount: activeTracesList.length,
                            totalCount: state.completedTraces.length + state.activeTraces.size,
                            message: `Retrieved ${filteredTraces.length} traces`
                        }, null, 2)
                    }]
            };
        }
        catch (error) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: String(error),
                            message: "Failed to get traces"
                        }, null, 2)
                    }],
                isError: true
            };
        }
    });
}
/**
 * Handles getting histogram data
 */
function handleGetHistograms(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = exports.GetHistogramsSchema.safeParse(args);
            if (!result.success) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: result.error.format(),
                                message: "Invalid arguments for getting histograms"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            const { name, bucketCount } = result.data;
            // If querying by name
            if (name) {
                if (!state.histograms.has(name)) {
                    return {
                        content: [{
                                type: "text",
                                text: JSON.stringify({
                                    error: `Histogram with name ${name} not found`,
                                    message: "Failed to get histogram"
                                }, null, 2)
                            }],
                        isError: true
                    };
                }
                const values = state.histograms.get(name);
                const histogram = calculateHistogram(values, bucketCount);
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                name,
                                histogram,
                                message: `Retrieved histogram data for ${name}`
                            }, null, 2)
                        }]
                };
            }
            // Otherwise, return all histograms
            const histograms = {};
            for (const [histName, values] of state.histograms.entries()) {
                histograms[histName] = calculateHistogram(values, bucketCount);
            }
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            histograms,
                            count: Object.keys(histograms).length,
                            message: `Retrieved data for ${Object.keys(histograms).length} histograms`
                        }, null, 2)
                    }]
            };
        }
        catch (error) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: String(error),
                            message: "Failed to get histograms"
                        }, null, 2)
                    }],
                isError: true
            };
        }
    });
}
/**
 * Handles getting system metrics
 */
function handleSystemMetrics(args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = exports.SystemMetricsSchema.safeParse(args);
            if (!result.success) {
                return {
                    content: [{
                            type: "text",
                            text: JSON.stringify({
                                error: result.error.format(),
                                message: "Invalid arguments for getting system metrics"
                            }, null, 2)
                        }],
                    isError: true
                };
            }
            const { detailed } = result.data;
            // Force update system metrics
            recordSystemMetrics();
            // Get system metrics
            const systemMetrics = state.metrics.filter(m => m.name.startsWith('system.') || m.name.startsWith('process.'));
            // Group by name
            const metricsByName = {};
            for (const metric of systemMetrics) {
                if (!metricsByName[metric.name]) {
                    metricsByName[metric.name] = [];
                }
                metricsByName[metric.name].push(metric);
            }
            // Get latest value for each metric
            const latestMetrics = {};
            for (const [name, metrics] of Object.entries(metricsByName)) {
                metrics.sort((a, b) => b.timestamp - a.timestamp);
                const latest = metrics[0];
                latestMetrics[name] = {
                    value: latest.value,
                    unit: latest.unit,
                    timestamp: latest.timestamp
                };
                if (detailed) {
                    latestMetrics[name].history = metrics.map(m => ({
                        value: m.value,
                        timestamp: m.timestamp
                    }));
                }
            }
            // Add CPU count
            latestMetrics['system.cpu.count'] = {
                value: os.cpus().length,
                unit: 'count',
                timestamp: Date.now()
            };
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            metrics: latestMetrics,
                            uptime: process.uptime(),
                            count: Object.keys(latestMetrics).length,
                            message: `Retrieved system metrics successfully`
                        }, null, 2)
                    }]
            };
        }
        catch (error) {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({
                            error: String(error),
                            message: "Failed to get system metrics"
                        }, null, 2)
                    }],
                isError: true
            };
        }
    });
}
