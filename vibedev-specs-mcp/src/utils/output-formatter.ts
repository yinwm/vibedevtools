// Output Formatter Module - Handles terminal formatting with box-drawing characters and emojis

import { SpecStatus, SpecMetadata, TaskProgress, StageName, SpecOverallStatus } from './status-manager.js';

// Box drawing characters
export const BOX_CHARS = {
  // Corners
  TL: '╔',    // Top Left
  TR: '╗',    // Top Right
  BL: '╚',    // Bottom Left
  BR: '╝',    // Bottom Right
  
  // Lines
  H: '═',     // Horizontal
  V: '║',     // Vertical
  
  // Junctions
  ML: '╠',    // Middle Left
  MR: '╣',    // Middle Right
  MT: '╦',    // Middle Top
  MB: '╩',    // Middle Bottom
  MC: '╬',    // Middle Cross
  
  // Single line versions
  SH: '─',    // Single Horizontal
  SV: '│',    // Single Vertical
  STL: '┌',   // Single Top Left
  STR: '┐',   // Single Top Right
  SBL: '└',   // Single Bottom Left
  SBR: '┘',   // Single Bottom Right
  SML: '├',   // Single Middle Left
  SMR: '┤',   // Single Middle Right
  SMT: '┬',   // Single Middle Top
  SMB: '┴',   // Single Middle Bottom
  
  // Mixed
  DIVIDER: '╟',
  DIVIDER_R: '╢'
};

// Emoji mappings
export const EMOJI = {
  // Status indicators
  IN_PROGRESS: '🔷',
  COMPLETED: '✅',
  ARCHIVED: '📦',
  PAUSED: '⏸️',
  
  // Stage indicators
  GOAL: '🎯',
  REQUIREMENTS: '📋',
  DESIGN: '📐',
  TASKS: '✅',
  EXECUTION: '🚀',
  
  // Other indicators
  STALE: '🕐',
  CURRENT: '🔄',
  PENDING: '⏳',
  ERROR: '❌',
  WARNING: '⚠️',
  INFO: 'ℹ️',
  SUCCESS: '✨',
  
  // UI elements
  FOLDER: '📁',
  FILE: '📄',
  PROGRESS: '📊',
  PIN: '📌',
  PACKAGE: '📦',
  CALENDAR: '📅'
};

// Stage display names
const STAGE_NAMES: Record<StageName, string> = {
  goal: 'Goal Collection',
  req: 'Requirements',
  design: 'Design',
  tasks: 'Task Planning',
  exec: 'Execution'
};

// Status display names
const STATUS_NAMES: Record<SpecOverallStatus, string> = {
  in_progress: 'In Progress',
  completed: 'Completed',
  archived: 'Archived',
  paused: 'Paused'
};

export class OutputFormatter {
  // Format a list of specs as a beautiful box table
  formatSpecList(specs: SpecMetadata[]): string {
    if (specs.length === 0) {
      return this.formatEmptyList();
    }
    
    const lines: string[] = [];
    const width = 75;
    
    // Header
    lines.push(BOX_CHARS.TL + BOX_CHARS.H.repeat(width) + BOX_CHARS.TR);
    lines.push(this.centerText('📋 VibeSpecs Overview', width));
    lines.push(BOX_CHARS.ML + BOX_CHARS.H.repeat(width) + BOX_CHARS.MR);
    lines.push(BOX_CHARS.V + ' '.repeat(width) + BOX_CHARS.V);
    
    // Specs
    for (const spec of specs) {
      lines.push(...this.formatSpecRow(spec, width));
    }
    
    // Summary
    lines.push(BOX_CHARS.DIVIDER + BOX_CHARS.SH.repeat(width) + BOX_CHARS.DIVIDER_R);
    const summary = this.formatSummary(specs);
    lines.push(BOX_CHARS.V + ' ' + summary.padEnd(width - 1) + BOX_CHARS.V);
    
    // Footer
    lines.push(BOX_CHARS.BL + BOX_CHARS.H.repeat(width) + BOX_CHARS.BR);
    
    return lines.join('\n');
  }
  
  // Format detailed spec status
  formatSpecDetail(spec: SpecStatus, taskProgress?: TaskProgress): string {
    const lines: string[] = [];
    const width = 75;
    
    // Header
    lines.push(BOX_CHARS.TL + BOX_CHARS.H.repeat(width) + BOX_CHARS.TR);
    lines.push(this.centerText(`🎯 Spec Details: ${spec.name}`, width));
    lines.push(BOX_CHARS.ML + BOX_CHARS.H.repeat(width) + BOX_CHARS.MR);
    lines.push(BOX_CHARS.V + ' '.repeat(width) + BOX_CHARS.V);
    
    // Basic info
    lines.push(this.padLine(`${EMOJI.PIN} Session ID: ${spec.sid}`, width));
    lines.push(this.padLine(`${EMOJI.PACKAGE} Feature: ${spec.name}`, width));
    lines.push(this.padLine(`${EMOJI.CALENDAR} Created: ${this.formatDate(spec.created)} • Updated: ${this.formatDate(spec.updated)}`, width));
    lines.push(BOX_CHARS.V + ' '.repeat(width) + BOX_CHARS.V);
    
    // Workflow progress
    lines.push(BOX_CHARS.DIVIDER + BOX_CHARS.SH.repeat(width) + BOX_CHARS.DIVIDER_R);
    lines.push(this.centerText('🔄 Workflow Progress', width));
    lines.push(BOX_CHARS.DIVIDER + BOX_CHARS.SH.repeat(width) + BOX_CHARS.DIVIDER_R);
    lines.push(BOX_CHARS.V + ' '.repeat(width) + BOX_CHARS.V);
    
    // Stages
    lines.push(...this.formatStages(spec, width));
    
    // Documents
    lines.push(BOX_CHARS.DIVIDER + BOX_CHARS.SH.repeat(width) + BOX_CHARS.DIVIDER_R);
    lines.push(this.centerText('📄 Documents', width));
    lines.push(BOX_CHARS.DIVIDER + BOX_CHARS.SH.repeat(width) + BOX_CHARS.DIVIDER_R);
    lines.push(BOX_CHARS.V + ' '.repeat(width) + BOX_CHARS.V);
    lines.push(...this.formatDocuments(spec, width));
    
    // Task progress if available
    if (taskProgress && spec.stage === 'exec') {
      lines.push(BOX_CHARS.DIVIDER + BOX_CHARS.SH.repeat(width) + BOX_CHARS.DIVIDER_R);
      lines.push(this.centerText('📊 Task Progress', width));
      lines.push(BOX_CHARS.DIVIDER + BOX_CHARS.SH.repeat(width) + BOX_CHARS.DIVIDER_R);
      lines.push(BOX_CHARS.V + ' '.repeat(width) + BOX_CHARS.V);
      lines.push(...this.formatTaskProgress(taskProgress, width));
    }
    
    // Footer
    lines.push(BOX_CHARS.BL + BOX_CHARS.H.repeat(width) + BOX_CHARS.BR);
    
    return lines.join('\n');
  }
  
  // Format progress bar
  formatProgressBar(current: number, total: number): string {
    if (total === 0) return '░░░░░░░░░░ 0%';
    
    const percentage = Math.round((current / total) * 100);
    const filled = Math.round(percentage / 10);
    const empty = 10 - filled;
    
    return '█'.repeat(filled) + '░'.repeat(empty) + ` ${percentage}%`;
  }
  
  // Format error message
  formatError(error: Error & { code?: string; suggestion?: string }): string {
    const lines: string[] = [];
    const width = 60;
    
    lines.push(BOX_CHARS.TL + BOX_CHARS.H.repeat(width) + BOX_CHARS.TR);
    lines.push(this.centerText(`${EMOJI.ERROR} Error`, width));
    lines.push(BOX_CHARS.ML + BOX_CHARS.H.repeat(width) + BOX_CHARS.MR);
    lines.push(BOX_CHARS.V + ' '.repeat(width) + BOX_CHARS.V);
    
    // Error message
    const errorLines = this.wrapText(error.message, width - 4);
    for (const line of errorLines) {
      lines.push(this.padLine('  ' + line, width));
    }
    
    if (error.code) {
      lines.push(BOX_CHARS.V + ' '.repeat(width) + BOX_CHARS.V);
      lines.push(this.padLine(`  Code: ${error.code}`, width));
    }
    
    if (error.suggestion) {
      lines.push(BOX_CHARS.V + ' '.repeat(width) + BOX_CHARS.V);
      lines.push(this.padLine(`  ${EMOJI.INFO} Suggestion:`, width));
      const suggestionLines = this.wrapText(error.suggestion, width - 4);
      for (const line of suggestionLines) {
        lines.push(this.padLine('  ' + line, width));
      }
    }
    
    lines.push(BOX_CHARS.V + ' '.repeat(width) + BOX_CHARS.V);
    lines.push(BOX_CHARS.BL + BOX_CHARS.H.repeat(width) + BOX_CHARS.BR);
    
    return lines.join('\n');
  }
  
  // Private helper methods
  
  private formatEmptyList(): string {
    const width = 60;
    const lines: string[] = [];
    
    lines.push(BOX_CHARS.TL + BOX_CHARS.H.repeat(width) + BOX_CHARS.TR);
    lines.push(this.centerText('📋 VibeSpecs Overview', width));
    lines.push(BOX_CHARS.ML + BOX_CHARS.H.repeat(width) + BOX_CHARS.MR);
    lines.push(BOX_CHARS.V + ' '.repeat(width) + BOX_CHARS.V);
    lines.push(this.centerText('No specs found yet!', width));
    lines.push(BOX_CHARS.V + ' '.repeat(width) + BOX_CHARS.V);
    lines.push(this.centerText('Start a new spec with:', width));
    lines.push(this.centerText('vibedev_specs_workflow_start', width));
    lines.push(BOX_CHARS.V + ' '.repeat(width) + BOX_CHARS.V);
    lines.push(BOX_CHARS.BL + BOX_CHARS.H.repeat(width) + BOX_CHARS.BR);
    
    return lines.join('\n');
  }
  
  private formatSpecRow(spec: SpecMetadata, width: number): string[] {
    const lines: string[] = [];
    const emoji = this.getStatusEmoji(spec.status);
    const isStale = this.isStale(spec.updated);
    const staleIcon = isStale ? ` ${EMOJI.STALE}` : '';
    
    // Format dates
    const updated = this.formatRelativeTime(spec.updated);
    
    // First line: name and status
    const nameLine = `  ${emoji} ${spec.name}${staleIcon}`;
    const statusLine = `${this.getStatusText(spec.status)}`;
    const padding = width - nameLine.length - statusLine.length - 3;
    lines.push(BOX_CHARS.V + nameLine + ' '.repeat(Math.max(1, padding)) + statusLine + ' ' + BOX_CHARS.V);
    
    // Second line: session ID and update time
    const sessionLine = `     Session: ${spec.sid.substring(0, 12)}...`;
    const updateLine = `Updated: ${updated}`;
    const padding2 = width - sessionLine.length - updateLine.length - 2;
    lines.push(BOX_CHARS.V + sessionLine + ' '.repeat(Math.max(1, padding2)) + updateLine + ' ' + BOX_CHARS.V);
    
    lines.push(BOX_CHARS.V + ' '.repeat(width) + BOX_CHARS.V);
    
    return lines;
  }
  
  private formatStages(spec: SpecStatus, width: number): string[] {
    const lines: string[] = [];
    const stages: StageName[] = ['goal', 'req', 'design', 'tasks', 'exec'];
    
    for (const stage of stages) {
      const stageInfo = spec.stages[stage];
      const status = stageInfo[0];
      const timestamp = stageInfo[1];
      const emoji = this.getStageEmoji(stage);
      const statusIcon = this.getStageStatusIcon(status);
      const stageName = STAGE_NAMES[stage];
      
      let progressBar = '';
      let extraInfo = '';
      
      if (stage === 'tasks' && stageInfo.length === 4) {
        const [, , total, completed] = stageInfo;
        progressBar = this.formatProgressBar(completed, total);
        extraInfo = `${completed}/${total}`;
      } else if (stage === 'exec' && stageInfo.length === 3) {
        const [, , currentTask] = stageInfo;
        if (spec.stages.tasks.length === 4) {
          const [, , total, completed] = spec.stages.tasks;
          progressBar = this.formatProgressBar(completed, total);
          extraInfo = `Task ${currentTask}/${total}`;
        }
      } else {
        progressBar = status === 'done' ? '██████████ Complete' : 
                      status === 'active' ? '████░░░░░░ Active' : 
                      '░░░░░░░░░░ Pending';
      }
      
      const timePart = timestamp ? this.formatTime(timestamp) : '';
      const line = `  ${statusIcon} ${stageName.padEnd(20)} ${progressBar}  ${extraInfo.padEnd(10)} ${timePart}`;
      lines.push(this.padLine(line, width));
    }
    
    lines.push(BOX_CHARS.V + ' '.repeat(width) + BOX_CHARS.V);
    
    return lines;
  }
  
  private formatDocuments(spec: SpecStatus, width: number): string[] {
    const lines: string[] = [];
    const docs = [
      { name: 'requirements.md', emoji: EMOJI.REQUIREMENTS },
      { name: 'design.md', emoji: EMOJI.DESIGN },
      { name: 'tasks.md', emoji: EMOJI.TASKS }
    ];
    
    for (const doc of docs) {
      const path = `.vibedev/specs/${spec.name}/${doc.name}`;
      lines.push(this.padLine(`  ${doc.emoji} ${doc.name.padEnd(20)} ${path}`, width));
    }
    
    lines.push(BOX_CHARS.V + ' '.repeat(width) + BOX_CHARS.V);
    
    return lines;
  }
  
  private formatTaskProgress(progress: TaskProgress, width: number): string[] {
    const lines: string[] = [];
    
    const progressLine = `  Progress: ${this.formatProgressBar(progress.completed, progress.total)}  (${progress.completed}/${progress.total} tasks)`;
    lines.push(this.padLine(progressLine, width));
    
    if (progress.currentTask) {
      lines.push(this.padLine(`  Current Task: #${progress.currentTask}`, width));
    }
    
    lines.push(BOX_CHARS.V + ' '.repeat(width) + BOX_CHARS.V);
    
    return lines;
  }
  
  private formatSummary(specs: SpecMetadata[]): string {
    const total = specs.length;
    const active = specs.filter(s => s.status === 'in_progress').length;
    const completed = specs.filter(s => s.status === 'completed').length;
    const archived = specs.filter(s => s.status === 'archived').length;
    
    return `${EMOJI.PROGRESS} Summary: ${total} specs • ${active} active • ${completed} completed${archived > 0 ? ` • ${archived} archived` : ''}`;
  }
  
  private getStatusEmoji(status: SpecOverallStatus): string {
    return {
      in_progress: EMOJI.IN_PROGRESS,
      completed: EMOJI.COMPLETED,
      archived: EMOJI.ARCHIVED,
      paused: EMOJI.PAUSED
    }[status];
  }
  
  private getStageEmoji(stage: StageName): string {
    return {
      goal: EMOJI.GOAL,
      req: EMOJI.REQUIREMENTS,
      design: EMOJI.DESIGN,
      tasks: EMOJI.TASKS,
      exec: EMOJI.EXECUTION
    }[stage];
  }
  
  private getStageStatusIcon(status: string): string {
    return status === 'done' ? EMOJI.COMPLETED :
           status === 'active' ? EMOJI.CURRENT :
           EMOJI.PENDING;
  }
  
  private getStatusText(status: SpecOverallStatus): string {
    const emoji = this.getStatusEmoji(status);
    const text = STATUS_NAMES[status];
    return `${emoji} ${text}`;
  }
  
  private centerText(text: string, width: number): string {
    const padding = Math.max(0, width - text.length);
    const leftPad = Math.floor(padding / 2);
    const rightPad = Math.ceil(padding / 2);
    return BOX_CHARS.V + ' '.repeat(leftPad) + text + ' '.repeat(rightPad) + BOX_CHARS.V;
  }
  
  private padLine(text: string, width: number): string {
    return BOX_CHARS.V + text.padEnd(width) + BOX_CHARS.V;
  }
  
  private wrapText(text: string | undefined, maxWidth: number): string[] {
    if (!text) {
      return [''];
    }
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    
    for (const word of words) {
      if (currentLine.length + word.length + 1 > maxWidth) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = currentLine ? `${currentLine} ${word}` : word;
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines;
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
  
  private isStale(iso: string): boolean {
    const now = new Date();
    const date = new Date(iso);
    const diff = now.getTime() - date.getTime();
    const days = diff / 86400000;
    return days > 30;
  }
}

// Export singleton instance
export const outputFormatter = new OutputFormatter();