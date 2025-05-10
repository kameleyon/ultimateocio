// Auto-generated boilerplate for performance-monitor

import { z } from 'zod';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';
import * as os from 'os';
import { performance } from 'perf_hooks';

// Performance metrics storage
interface MetricRecord {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  tags: Record<string, string>;
}

// Histogram data for latency distribution
interface HistogramData {
  min: number;
  max: number;
  mean: number;
  median: number;
  p95: number;
  p99: number;
  count: number;
  buckets: { [key: string]: number };
}

// Trace information
interface TraceSpan {
  id: string;
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  parentId?: string;
  tags: Record<string, string>;
  children: TraceSpan[];
}

// Performance monitoring state
const state = {
  metrics: [] as MetricRecord[],
  activeTraces: new Map<string, TraceSpan>(),
  completedTraces: [] as TraceSpan[],
  histograms: new Map<string, number[]>(),
  startTime: Date.now(),
  isRecording: true,
  maxMetricsPerName: 1000,
  maxHistogramValues: 10000,
  maxCompletedTraces: 1000,
  lastSystemMetricsTime: 0,
  systemMetricsInterval: 60000, // 1 minute
};

export function activate() {
  console.log("[TOOL] performance-monitor activated");
  
  // Initialize with system metrics
  recordSystemMetrics();
}

/**
 * Handles file write events to detect performance issues
 */
export function onFileWrite(event: { path: string; content: string }) {
  // Record metric for file write operation
  recordMetric('file.write.size', Buffer.byteLength(event.content), 'bytes', {
    path: event.path,
    extension: path.extname(event.path)
  });
}

/**
 * Handles session start logic
 */
export function onSessionStart(session: { id: string; startTime: number }) {
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
export async function onCommand(command: { name: string; args: any[] }) {
  switch (command.name) {
    case 'performance-monitor:record-metric':
      console.log('[Performance Monitor] Recording metric...');
      return await handleRecordMetric(command.args[0]);
    case 'performance-monitor:start-trace':
      console.log('[Performance Monitor] Starting trace...');
      return await handleStartTrace(command.args[0]);
    case 'performance-monitor:end-trace':
      console.log('[Performance Monitor] Ending trace...');
      return await handleEndTrace(command.args[0]);
    case 'performance-monitor:record-histogram':
      console.log('[Performance Monitor] Recording histogram value...');
      return await handleRecordHistogram(command.args[0]);
    case 'performance-monitor:get-metrics':
      console.log('[Performance Monitor] Getting metrics...');
      return await handleGetMetrics(command.args[0]);
    case 'performance-monitor:get-traces':
      console.log('[Performance Monitor] Getting traces...');
      return await handleGetTraces(command.args[0]);
    case 'performance-monitor:get-histograms':
      console.log('[Performance Monitor] Getting histogram data...');
      return await handleGetHistograms(command.args[0]);
    case 'performance-monitor:system-metrics':
      console.log('[Performance Monitor] Getting system metrics...');
      return await handleSystemMetrics(command.args[0]);
    default:
      console.warn(`[Performance Monitor] Unknown command: ${command.name}`);
      return { error: `Unknown command: ${command.name}` };
  }
}

// Define schemas for Performance Monitor tool
export const RecordMetricSchema = z.object({
  name: z.string(),
  value: z.number(),
  unit: z.string().optional().default('ms'),
  tags: z.record(z.string()).optional().default({}),
});

export const StartTraceSchema = z.object({
  name: z.string(),
  id: z.string().optional(),
  parentId: z.string().optional(),
  tags: z.record(z.string()).optional().default({}),
});

export const EndTraceSchema = z.object({
  id: z.string(),
  tags: z.record(z.string()).optional(),
});

export const RecordHistogramSchema = z.object({
  name: z.string(),
  value: z.number(),
  tags: z.record(z.string()).optional().default({}),
});

export const GetMetricsSchema = z.object({
  name: z.string().optional(),
  startTime: z.number().optional(),
  endTime: z.number().optional(),
  tags: z.record(z.string()).optional(),
  limit: z.number().optional().default(100),
  aggregation: z.enum(['none', 'avg', 'min', 'max', 'sum', 'count']).optional().default('none'),
  groupBy: z.array(z.string()).optional(),
});

export const GetTracesSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  startTime: z.number().optional(),
  endTime: z.number().optional(),
  minDuration: z.number().optional(),
  maxDuration: z.number().optional(),
  limit: z.number().optional().default(10),
  includeActive: z.boolean().optional().default(false),
});

export const GetHistogramsSchema = z.object({
  name: z.string().optional(),
  startTime: z.number().optional(),
  endTime: z.number().optional(),
  tags: z.record(z.string()).optional(),
  bucketCount: z.number().optional().default(10),
});

export const SystemMetricsSchema = z.object({
  detailed: z.boolean().optional().default(false),
});

/**
 * Generate a unique ID for a trace
 */
function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

/**
 * Record a metric value
 */
function recordMetric(
  name: string,
  value: number,
  unit: string = 'ms',
  tags: Record<string, string> = {}
): MetricRecord {
  const metric: MetricRecord = {
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
function startTrace(
  name: string,
  id: string = generateId(),
  parentId?: string,
  tags: Record<string, string> = {}
): TraceSpan {
  const trace: TraceSpan = {
    id,
    name,
    startTime: performance.now(),
    tags,
    children: [],
    parentId
  };
  
  // Add as child to parent if exists
  if (parentId && state.activeTraces.has(parentId)) {
    const parent = state.activeTraces.get(parentId)!;
    parent.children.push(trace);
  }
  
  state.activeTraces.set(id, trace);
  return trace;
}

/**
 * End a trace span
 */
function endTrace(id: string, additionalTags: Record<string, string> = {}): TraceSpan | null {
  if (!state.activeTraces.has(id)) {
    return null;
  }
  
  const trace = state.activeTraces.get(id)!;
  trace.endTime = performance.now();
  trace.duration = trace.endTime - trace.startTime;
  
  // Merge additional tags
  trace.tags = { ...trace.tags, ...additionalTags };
  
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
function recordHistogramValue(name: string, value: number, tags: Record<string, string> = {}): void {
  // Create histogram if it doesn't exist
  if (!state.histograms.has(name)) {
    state.histograms.set(name, []);
  }
  
  const values = state.histograms.get(name)!;
  
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
function calculateHistogram(values: number[], bucketCount: number = 10): HistogramData {
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
  const buckets: { [key: string]: number } = {};
  const bucketSize = (max - min) / bucketCount;
  
  for (let i = 0; i < bucketCount; i++) {
    const bucketStart = min + i * bucketSize;
    const bucketEnd = bucketStart + bucketSize;
    const bucketKey = `${bucketStart.toFixed(2)}-${bucketEnd.toFixed(2)}`;
    buckets[bucketKey] = 0;
  }
  
  // Count values in each bucket
  for (const value of sortedValues) {
    const bucketIndex = Math.min(
      Math.floor((value - min) / bucketSize),
      bucketCount - 1
    );
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
function recordSystemMetrics(): void {
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
function filterMetrics(
  metrics: MetricRecord[],
  name?: string,
  startTime?: number,
  endTime?: number,
  tags?: Record<string, string>
): MetricRecord[] {
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
function aggregateMetrics(
  metrics: MetricRecord[],
  aggregation: 'none' | 'avg' | 'min' | 'max' | 'sum' | 'count',
  groupBy?: string[]
): any {
  if (aggregation === 'none' || metrics.length === 0) {
    return metrics;
  }
  
  // If no groupBy, aggregate all metrics together
  if (!groupBy || groupBy.length === 0) {
    let result: number;
    
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
  const groups = new Map<string, MetricRecord[]>();
  
  for (const metric of metrics) {
    const groupKey = groupBy.map(key => {
      if (key === 'name') {
        return metric.name;
      } else if (key === 'unit') {
        return metric.unit;
      } else {
        return metric.tags[key] || 'null';
      }
    }).join(':');
    
    if (!groups.has(groupKey)) {
      groups.set(groupKey, []);
    }
    
    groups.get(groupKey)!.push(metric);
  }
  
  // Aggregate each group
  const results: any[] = [];
  
  for (const [key, groupMetrics] of groups.entries()) {
    let value: number;
    
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
    const result: any = {
      value,
      count: groupMetrics.length,
      unit: groupMetrics[0].unit
    };
    
    // Add group fields
    groupBy.forEach((field, index) => {
      if (field === 'name') {
        result.name = keyParts[index];
      } else if (field === 'unit') {
        result.unit = keyParts[index];
      } else {
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
async function handleRecordMetric(args: any) {
  try {
    const result = RecordMetricSchema.safeParse(args);
    
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
  } catch (error) {
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
}

/**
 * Handles starting a trace
 */
async function handleStartTrace(args: any) {
  try {
    const result = StartTraceSchema.safeParse(args);
    
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
  } catch (error) {
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
}

/**
 * Handles ending a trace
 */
async function handleEndTrace(args: any) {
  try {
    const result = EndTraceSchema.safeParse(args);
    
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
  } catch (error) {
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
}

/**
 * Handles recording a histogram value
 */
async function handleRecordHistogram(args: any) {
  try {
    const result = RecordHistogramSchema.safeParse(args);
    
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
  } catch (error) {
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
}

/**
 * Handles getting metrics
 */
async function handleGetMetrics(args: any) {
  try {
    const result = GetMetricsSchema.safeParse(args);
    
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
  } catch (error) {
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
}

/**
 * Handles getting traces
 */
async function handleGetTraces(args: any) {
  try {
    const result = GetTracesSchema.safeParse(args);
    
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
        const trace = state.activeTraces.get(id)!;
        
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
    let activeTracesList: TraceSpan[] = [];
    
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
  } catch (error) {
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
}

/**
 * Handles getting histogram data
 */
async function handleGetHistograms(args: any) {
  try {
    const result = GetHistogramsSchema.safeParse(args);
    
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
      
      const values = state.histograms.get(name)!;
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
    const histograms: Record<string, HistogramData> = {};
    
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
  } catch (error) {
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
}

/**
 * Handles getting system metrics
 */
async function handleSystemMetrics(args: any) {
  try {
    const result = SystemMetricsSchema.safeParse(args);
    
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
    const systemMetrics = state.metrics.filter(m => 
      m.name.startsWith('system.') || m.name.startsWith('process.')
    );
    
    // Group by name
    const metricsByName: Record<string, MetricRecord[]> = {};
    
    for (const metric of systemMetrics) {
      if (!metricsByName[metric.name]) {
        metricsByName[metric.name] = [];
      }
      
      metricsByName[metric.name].push(metric);
    }
    
    // Get latest value for each metric
    const latestMetrics: Record<string, any> = {};
    
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
  } catch (error) {
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
}