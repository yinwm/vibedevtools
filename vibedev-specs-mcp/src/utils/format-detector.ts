/**
 * Format Detection Utility for Claude Code
 * 
 * Detects and parses VibeSpec YAML responses from MCP tools.
 * Provides type-based formatter selection and graceful fallback handling.
 */

import * as yaml from 'js-yaml';
import { ContentType } from './yaml-response.js';

// Core interfaces for format detection and processing
export interface VibeSpecResponse {
  vibespec_format: 'v1';
  type: string;
  data: any;
  metadata?: {
    timestamp: string;
    session_id?: string;
  };
}

export interface FormatDetector {
  isVibeSpecFormat(response: string): boolean;
  parseResponse(response: string): VibeSpecResponse | null;
  getFormatter(type: string): OutputFormatter;
}

export interface OutputFormatter {
  format(data: any, metadata?: any): string;
  formatError(error: ErrorData): string;
}

export interface ErrorData {
  message: string;
  code: string;
  suggestion: string;
  context?: any;
}

// Detection result types
export interface DetectionResult {
  isVibeSpec: boolean;
  parsed?: VibeSpecResponse;
  error?: string;
  rawContent: string;
}

export class VibeSpecFormatDetector implements FormatDetector {
  private static readonly VIBESPEC_VERSION = 'v1';
  private static readonly DETECTION_TIMEOUT_MS = 50; // Fast detection for UX
  
  private formatters: Map<string, OutputFormatter> = new Map();

  constructor() {
    this.registerDefaultFormatters();
  }

  /**
   * Quick detection of VibeSpec format in response string
   */
  isVibeSpecFormat(response: string): boolean {
    try {
      // Quick string-based detection first (fastest)
      if (!response.includes('vibespec_format:') && !response.includes('vibespec_format')) {
        return false;
      }

      // Basic YAML structure check
      if (!response.includes('type:') || !response.includes('data:')) {
        return false;
      }

      // Try lightweight parsing with timeout protection
      const startTime = Date.now();
      const parsed = yaml.load(response) as any;
      
      if (Date.now() - startTime > VibeSpecFormatDetector.DETECTION_TIMEOUT_MS) {
        console.warn('[FormatDetector] Detection timeout, falling back to raw output');
        return false;
      }

      return (
        parsed &&
        typeof parsed === 'object' &&
        parsed.vibespec_format === VibeSpecFormatDetector.VIBESPEC_VERSION &&
        typeof parsed.type === 'string' &&
        parsed.data !== undefined
      );
    } catch (error) {
      // Silently fail detection - this is expected for non-YAML content
      return false;
    }
  }

  /**
   * Parse VibeSpec YAML response with comprehensive error handling
   */
  parseResponse(response: string): VibeSpecResponse | null {
    try {
      if (!this.isVibeSpecFormat(response)) {
        return null;
      }

      const parsed = yaml.load(response) as VibeSpecResponse;
      
      // Validate structure
      if (!this.validateResponseStructure(parsed)) {
        throw new Error('Invalid VibeSpec response structure');
      }

      return parsed;
    } catch (error) {
      console.warn('[FormatDetector] Failed to parse VibeSpec response:', error);
      return null;
    }
  }

  /**
   * Get appropriate formatter for content type
   */
  getFormatter(type: string): OutputFormatter {
    const formatter = this.formatters.get(type);
    if (!formatter) {
      console.warn(`[FormatDetector] No formatter found for type: ${type}, using fallback`);
      return this.formatters.get('fallback')!;
    }
    return formatter;
  }

  /**
   * Register a custom formatter for a content type
   */
  registerFormatter(type: string, formatter: OutputFormatter): void {
    this.formatters.set(type, formatter);
  }

  /**
   * Comprehensive detection and processing pipeline
   */
  processResponse(response: string): DetectionResult {
    const startTime = Date.now();
    
    try {
      const isVibeSpec = this.isVibeSpecFormat(response);
      
      if (!isVibeSpec) {
        return {
          isVibeSpec: false,
          rawContent: response
        };
      }

      const parsed = this.parseResponse(response);
      
      if (!parsed) {
        return {
          isVibeSpec: false,
          error: 'Failed to parse VibeSpec YAML',
          rawContent: response
        };
      }

      const processingTime = Date.now() - startTime;
      if (processingTime > 100) {
        console.warn(`[FormatDetector] Slow processing detected: ${processingTime}ms`);
      }

      return {
        isVibeSpec: true,
        parsed,
        rawContent: response
      };
    } catch (error) {
      return {
        isVibeSpec: false,
        error: error instanceof Error ? error.message : 'Unknown detection error',
        rawContent: response
      };
    }
  }

  /**
   * Format detected VibeSpec response using appropriate formatter
   */
  formatResponse(response: string): string {
    const result = this.processResponse(response);
    
    if (!result.isVibeSpec || !result.parsed) {
      // Fallback to raw output
      return result.error ? 
        `[Format Detection Error: ${result.error}]\n\n${result.rawContent}` :
        result.rawContent;
    }

    try {
      const formatter = this.getFormatter(result.parsed.type);
      return formatter.format(result.parsed.data, result.parsed.metadata);
    } catch (error) {
      console.error('[FormatDetector] Formatting error:', error);
      // Graceful degradation
      return `[Formatting Error: ${error instanceof Error ? error.message : 'Unknown error'}]\n\n${result.rawContent}`;
    }
  }

  // Private methods

  private validateResponseStructure(parsed: any): parsed is VibeSpecResponse {
    return (
      parsed &&
      typeof parsed === 'object' &&
      parsed.vibespec_format === VibeSpecFormatDetector.VIBESPEC_VERSION &&
      typeof parsed.type === 'string' &&
      parsed.data !== undefined &&
      (!parsed.metadata || typeof parsed.metadata === 'object')
    );
  }

  private registerDefaultFormatters(): void {
    // Register built-in formatters
    this.formatters.set(ContentType.SPEC_LIST, new SpecListFormatter());
    this.formatters.set(ContentType.SPEC_DETAIL, new SpecDetailFormatter()); 
    this.formatters.set(ContentType.STATUS_UPDATE, new StatusUpdateFormatter());
    this.formatters.set(ContentType.ARCHIVE_ACTION, new ArchiveActionFormatter());
    this.formatters.set(ContentType.ERROR, new ErrorFormatter());
    this.formatters.set('fallback', new FallbackFormatter());
  }
}

// Built-in formatter implementations

class SpecListFormatter implements OutputFormatter {
  format(data: any, metadata?: any): string {
    if (!data.specs || !Array.isArray(data.specs)) {
      return 'Invalid spec list data';
    }

    const lines: string[] = [];
    lines.push('📋 VibeSpecs Overview\n');
    
    if (data.specs.length === 0) {
      lines.push('No specs found yet!');
      lines.push('Start a new spec with: vibedev_specs_workflow_start');
      return lines.join('\n');
    }

    // Format each spec
    for (const spec of data.specs) {
      const emoji = this.getStatusEmoji(spec.status);
      const updated = this.formatRelativeTime(spec.updated);
      lines.push(`• ${emoji} ${spec.name} (${this.getStatusText(spec.status)}) - Updated ${updated}`);
    }

    // Add summary if available
    if (data.summary) {
      const { total, active, completed, archived, paused } = data.summary;
      lines.push('');
      lines.push(`📊 Summary: ${total} specs • ${active} active • ${completed} completed${archived > 0 ? ` • ${archived} archived` : ''}${paused > 0 ? ` • ${paused} paused` : ''}`);
    }

    return lines.join('\n');
  }

  formatError(error: ErrorData): string {
    return `❌ ${error.message}\n💡 ${error.suggestion}`;
  }

  private getStatusEmoji(status: string): string {
    const emojiMap: Record<string, string> = {
      'in_progress': '🔷',
      'completed': '✅', 
      'archived': '📦',
      'paused': '⏸️'
    };
    return emojiMap[status] || '🔷';
  }

  private getStatusText(status: string): string {
    const textMap: Record<string, string> = {
      'in_progress': 'In Progress',
      'completed': 'Completed',
      'archived': 'Archived', 
      'paused': 'Paused'
    };
    return textMap[status] || status;
  }

  private formatRelativeTime(iso: string): string {
    const now = new Date();
    const date = new Date(iso);
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) return `${minutes} min${minutes !== 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  }
}

class SpecDetailFormatter implements OutputFormatter {
  format(data: any, metadata?: any): string {
    if (!data.spec) {
      return 'Invalid spec detail data';
    }

    const lines: string[] = [];
    const spec = data.spec;
    
    lines.push(`🎯 ${spec.name}`);
    lines.push(`📌 Session: ${spec.sid}`);
    lines.push(`📅 Created: ${this.formatDate(spec.created)} • Updated: ${this.formatDate(spec.updated)}`);
    lines.push('');

    // Workflow progress
    lines.push('🔄 Workflow Progress:');
    const stages = ['goal', 'req', 'design', 'tasks', 'exec'];
    const stageNames: Record<string, string> = {
      goal: 'Goal Collection',
      req: 'Requirements', 
      design: 'Design',
      tasks: 'Task Planning',
      exec: 'Execution'
    };

    for (const stage of stages) {
      const stageInfo = spec.stages[stage];
      const status = stageInfo[0];
      const timestamp = stageInfo[1];
      const emoji = status === 'done' ? '✅' : status === 'active' ? '🔄' : '⏳';
      const stageName = stageNames[stage];
      const time = timestamp ? this.formatTime(timestamp) : '';
      
      lines.push(`  ${emoji} ${stageName} ${time}`);
    }

    // Task progress if available  
    if (data.taskProgress && spec.stage === 'exec') {
      lines.push('');
      lines.push('📊 Task Progress:');
      const tp = data.taskProgress;
      lines.push(`  Progress: ${tp.completed}/${tp.total} (${tp.percentage}%)`);
      
      if (tp.currentTaskDetails) {
        lines.push(`  Current: ${tp.currentTaskDetails.text} [${tp.currentTaskDetails.priority}]`);
      }
      
      if (tp.nextTasks && tp.nextTasks.length > 0) {
        lines.push(`  Next: ${tp.nextTasks[0].text}`);
      }
    }

    // File sizes if available
    if (data.fileSizes) {
      lines.push('');
      lines.push('📄 Documents:');
      for (const [filename, size] of Object.entries(data.fileSizes)) {
        const sizeKB = Math.round((size as number) / 1024 * 10) / 10;
        lines.push(`  📄 ${filename} (${sizeKB} KB)`);
      }
    }

    return lines.join('\n');
  }

  formatError(error: ErrorData): string {
    return `❌ ${error.message}\n💡 ${error.suggestion}`;
  }

  private formatDate(iso: string): string {
    const date = new Date(iso);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }

  private formatTime(iso: string): string {
    if (!iso) return '';
    const date = new Date(iso);
    return date.toLocaleTimeString();
  }
}

class StatusUpdateFormatter implements OutputFormatter {
  format(data: any, metadata?: any): string {
    if (!data.action) {
      return 'Invalid status update data';
    }

    const lines: string[] = [];
    lines.push(`✅ Status Updated: ${data.spec?.name || 'Unknown'}`);
    
    if (data.changes_applied && data.changes_applied.length > 0) {
      lines.push('');
      lines.push('📝 Changes Applied:');
      for (const change of data.changes_applied) {
        lines.push(`  • ${change}`);
      }
    }

    if (data.notes) {
      lines.push('');
      lines.push(`📋 Notes: ${data.notes}`);
    }

    return lines.join('\n');
  }

  formatError(error: ErrorData): string {
    return `❌ ${error.message}\n💡 ${error.suggestion}`;
  }
}

class ArchiveActionFormatter implements OutputFormatter {
  format(data: any, metadata?: any): string {
    if (!data.action) {
      return 'Invalid archive action data';
    }

    const emoji = data.action === 'archived' ? '📦' : '🔄';
    const actionText = data.action === 'archived' ? 'Archived' : 'Restored';
    
    const lines: string[] = [];
    lines.push(`${emoji} ${actionText}: ${data.spec?.name || 'Unknown'}`);
    
    if (data.guidance_notes) {
      lines.push('');
      lines.push(`💡 ${data.guidance_notes}`);
    }

    return lines.join('\n');
  }

  formatError(error: ErrorData): string {
    return `❌ ${error.message}\n💡 ${error.suggestion}`;
  }
}

class ErrorFormatter implements OutputFormatter {
  format(data: any, metadata?: any): string {
    return this.formatError(data);
  }

  formatError(error: ErrorData): string {
    const lines: string[] = [];
    lines.push(`❌ Error: ${error.message}`);
    
    if (error.code) {
      lines.push(`🔍 Code: ${error.code}`);
    }
    
    if (error.suggestion) {
      lines.push(`💡 Suggestion: ${error.suggestion}`);
    }

    return lines.join('\n');
  }
}

class FallbackFormatter implements OutputFormatter {
  format(data: any, metadata?: any): string {
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  }

  formatError(error: ErrorData): string {
    return `❌ ${error.message}\n💡 ${error.suggestion}`;
  }
}

// Export singleton instance
export const formatDetector = new VibeSpecFormatDetector();