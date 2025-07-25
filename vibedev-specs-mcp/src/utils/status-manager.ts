// Status Manager Module - Handles all spec status persistence operations

// Type definitions for stage status
export type StageStatus = 'pending' | 'active' | 'done';

// Type for basic stage information: [status, timestamp]
export type StageInfo = [StageStatus, string];

// Type for task stage information: [status, timestamp, total, completed]
export type TaskStageInfo = [StageStatus, string, number, number];

// Type for execution stage information: [status, timestamp, current_task]
export type ExecStageInfo = [StageStatus, string, number];

// Overall spec status types
export type SpecOverallStatus = 'in_progress' | 'completed' | 'archived' | 'paused';

// Stage names
export type StageName = 'goal' | 'req' | 'design' | 'tasks' | 'exec';

// Complete spec status structure
export interface SpecStatus {
  sid: string;                    // Session ID
  name: string;                   // Feature name
  created: string;                // ISO timestamp
  updated: string;                // ISO timestamp
  stage: StageName;               // Current stage
  status: SpecOverallStatus;      // Overall status
  notes?: string;                 // Optional notes
  stages: {
    goal: StageInfo;
    req: StageInfo;
    design: StageInfo;
    tasks: TaskStageInfo;
    exec: ExecStageInfo;
  };
}

// Metadata for quick spec discovery
export interface SpecMetadata {
  sid: string;
  name: string;
  status: SpecOverallStatus;
  updated: string;
  archived_at?: string | null;
}

// Global metadata index structure
export interface MetadataIndex {
  specs: SpecMetadata[];
}

// Task progress information
export interface TaskProgress {
  total: number;
  completed: number;
  percentage: number;
  currentTask?: number;
}

// Update options for partial spec updates
export interface SpecStatusUpdate {
  status?: SpecOverallStatus;
  stage?: StageName;
  notes?: string;
  task_completed?: number;
  current_task?: number;
}

// Error response structure
export interface ErrorResponse {
  error: string;
  code: string;
  suggestion: string;
  details?: any;
}

// Status Manager interface
export interface StatusManager {
  // Read operations
  loadSpecStatus(sessionId: string): Promise<SpecStatus>;
  loadAllSpecs(): Promise<SpecMetadata[]>;
  
  // Write operations
  updateSpecStatus(sessionId: string, updates: Partial<SpecStatus>): Promise<void>;
  createSpecStatus(sessionId: string, featureName: string): Promise<void>;
  
  // Utility operations
  ensureMetadataIndex(): Promise<void>;
  parseTaskProgress(taskFile: string): Promise<TaskProgress>;
}

// File paths helper
export class SpecPaths {
  static readonly SPECS_DIR = '.vibedev/specs';
  static readonly METADATA_FILE = '_metadata.yaml';
  static readonly STATUS_FILE = '.status.yaml';
  
  static getSpecDir(featureName: string): string {
    return `${this.SPECS_DIR}/${featureName}`;
  }
  
  static getStatusPath(featureName: string): string {
    return `${this.getSpecDir(featureName)}/${this.STATUS_FILE}`;
  }
  
  static getMetadataPath(): string {
    return `${this.SPECS_DIR}/${this.METADATA_FILE}`;
  }
  
  static getTasksPath(featureName: string): string {
    return `${this.getSpecDir(featureName)}/tasks.md`;
  }
  
  static getRequirementsPath(featureName: string): string {
    return `${this.getSpecDir(featureName)}/requirements.md`;
  }
  
  static getDesignPath(featureName: string): string {
    return `${this.getSpecDir(featureName)}/design.md`;
  }
}

// Error codes
export enum ErrorCode {
  SPEC_NOT_FOUND = 'SPEC_NOT_FOUND',
  INVALID_STATUS = 'INVALID_STATUS',
  YAML_PARSE_ERROR = 'YAML_PARSE_ERROR',
  FILE_WRITE_ERROR = 'FILE_WRITE_ERROR',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  INVALID_PARAMETERS = 'INVALID_PARAMETERS'
}