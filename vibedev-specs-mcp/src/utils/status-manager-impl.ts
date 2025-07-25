import * as fs from 'fs/promises';
import * as path from 'path';
import * as yaml from 'js-yaml';
import {
  StatusManager,
  SpecStatus,
  SpecMetadata,
  MetadataIndex,
  TaskProgress,
  SpecPaths,
  ErrorCode,
  ErrorResponse,
  SpecStatusUpdate,
  StageStatus,
  StageName,
  SpecOverallStatus
} from './status-manager.js';

export class StatusManagerImpl implements StatusManager {
  // Atomic write operation for YAML files
  private async atomicWriteYaml(filePath: string, data: any): Promise<void> {
    const tempPath = `${filePath}.tmp`;
    const dirPath = path.dirname(filePath);
    
    try {
      // Ensure directory exists
      await fs.mkdir(dirPath, { recursive: true });
      
      // Convert to YAML
      const yamlContent = yaml.dump(data, {
        flowLevel: 2,
        noRefs: true,
        sortKeys: false
      });
      
      // Write to temp file first
      await fs.writeFile(tempPath, yamlContent, 'utf8');
      
      // Atomic rename
      await fs.rename(tempPath, filePath);
    } catch (error) {
      // Clean up temp file if it exists
      try {
        await fs.unlink(tempPath);
      } catch {
        // Ignore cleanup errors
      }
      
      throw this.createError(
        'Failed to write YAML file',
        ErrorCode.FILE_WRITE_ERROR,
        'Check file permissions and disk space',
        { filePath, error: error instanceof Error ? error.message : error }
      );
    }
  }

  // Read YAML file with error handling
  private async readYaml<T>(filePath: string): Promise<T> {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      return yaml.load(content) as T;
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        throw this.createError(
          'File not found',
          ErrorCode.SPEC_NOT_FOUND,
          `Check if the file exists at: ${filePath}`,
          { filePath }
        );
      }
      
      if (error instanceof yaml.YAMLException) {
        throw this.createError(
          'Invalid YAML format',
          ErrorCode.YAML_PARSE_ERROR,
          'Check YAML syntax in the file',
          { filePath, error: error.message }
        );
      }
      
      throw this.createError(
        'Failed to read file',
        ErrorCode.PERMISSION_DENIED,
        'Check file permissions',
        { filePath, error: error.message }
      );
    }
  }

  // Load spec status
  async loadSpecStatus(sessionId: string): Promise<SpecStatus> {
    // First, try to find the spec by session ID in metadata
    const metadata = await this.loadAllSpecs();
    const specMeta = metadata.find(spec => spec.sid === sessionId);
    
    if (!specMeta) {
      throw this.createError(
        'Spec not found',
        ErrorCode.SPEC_NOT_FOUND,
        "Use 'vibedev_specs_list' to see all available specs",
        { sessionId }
      );
    }
    
    const statusPath = SpecPaths.getStatusPath(specMeta.name);
    
    try {
      return await this.readYaml<SpecStatus>(statusPath);
    } catch (error: any) {
      // If status file doesn't exist, try to infer from existing files
      if (error.code === ErrorCode.SPEC_NOT_FOUND) {
        return await this.inferStatusFromFiles(sessionId, specMeta.name);
      }
      throw error;
    }
  }

  // Load all specs from metadata index
  async loadAllSpecs(): Promise<SpecMetadata[]> {
    const metadataPath = SpecPaths.getMetadataPath();
    
    try {
      const index = await this.readYaml<MetadataIndex>(metadataPath);
      // Sort by updated date (most recent first)
      return index.specs.sort((a, b) => 
        new Date(b.updated).getTime() - new Date(a.updated).getTime()
      );
    } catch (error: any) {
      if (error.code === ErrorCode.SPEC_NOT_FOUND) {
        // No metadata file yet, return empty array
        return [];
      }
      throw error;
    }
  }

  // Update spec status
  async updateSpecStatus(sessionId: string, updates: Partial<SpecStatus>): Promise<void> {
    const currentStatus = await this.loadSpecStatus(sessionId);
    
    // Merge updates with current status
    const updatedStatus: SpecStatus = {
      ...currentStatus,
      ...updates,
      updated: new Date().toISOString()
    };
    
    // Write status file
    const statusPath = SpecPaths.getStatusPath(updatedStatus.name);
    await this.atomicWriteYaml(statusPath, updatedStatus);
    
    // Update metadata index
    await this.updateMetadataIndex(updatedStatus);
  }

  // Initialize spec with provided status
  async initializeSpec(sessionId: string, status: SpecStatus): Promise<void> {
    console.error(`[StatusManager] Initializing spec: ${sessionId} -> ${status.name}`);
    
    const specDir = SpecPaths.getSpecDir(status.name);
    await fs.mkdir(specDir, { recursive: true });
    
    const statusPath = SpecPaths.getStatusPath(status.name);
    await this.atomicWriteYaml(statusPath, status);
    
    // Update metadata index
    await this.updateMetadataIndex(status);
  }

  // Create new spec status
  async createSpecStatus(sessionId: string, featureName: string): Promise<void> {
    const now = new Date().toISOString();
    
    const newStatus: SpecStatus = {
      sid: sessionId,
      name: featureName,
      created: now,
      updated: now,
      stage: 'goal',
      status: 'in_progress',
      stages: {
        goal: ['active', now],
        req: ['pending', ''],
        design: ['pending', ''],
        tasks: ['pending', '', 0, 0],
        exec: ['pending', '', 0]
      }
    };
    
    // Write status file
    const statusPath = SpecPaths.getStatusPath(featureName);
    await this.atomicWriteYaml(statusPath, newStatus);
    
    // Update metadata index
    await this.updateMetadataIndex(newStatus);
  }

  // Ensure metadata index exists
  async ensureMetadataIndex(): Promise<void> {
    const metadataPath = SpecPaths.getMetadataPath();
    
    try {
      await fs.access(metadataPath);
    } catch {
      // Create initial metadata file
      const initialIndex: MetadataIndex = { specs: [] };
      await this.atomicWriteYaml(metadataPath, initialIndex);
    }
  }

  // Parse task progress from tasks.md file
  async parseTaskProgress(taskFile: string): Promise<TaskProgress> {
    try {
      const content = await fs.readFile(taskFile, 'utf8');
      
      // Count total tasks (lines starting with "- [ ]" or "- [x]")
      const taskRegex = /^- \[([ x])\]/gm;
      const matches: RegExpExecArray[] = [];
      let match;
      while ((match = taskRegex.exec(content)) !== null) {
        matches.push(match);
      }
      
      const total = matches.length;
      const completed = matches.filter(match => match[1] === 'x').length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      // Try to find current task (first uncompleted task)
      let currentTask: number | undefined;
      for (let i = 0; i < matches.length; i++) {
        if (matches[i][1] === ' ') {
          currentTask = i + 1;
          break;
        }
      }
      
      return { total, completed, percentage, currentTask };
    } catch (error) {
      throw this.createError(
        'Failed to parse tasks file',
        ErrorCode.SPEC_NOT_FOUND,
        'Check if tasks.md exists',
        { taskFile, error: error instanceof Error ? error.message : error }
      );
    }
  }

  // Private helper methods

  private async inferStatusFromFiles(sessionId: string, featureName: string): Promise<SpecStatus> {
    const now = new Date().toISOString();
    const specDir = SpecPaths.getSpecDir(featureName);
    
    // Check which files exist
    const hasRequirements = await this.fileExists(SpecPaths.getRequirementsPath(featureName));
    const hasDesign = await this.fileExists(SpecPaths.getDesignPath(featureName));
    const hasTasks = await this.fileExists(SpecPaths.getTasksPath(featureName));
    
    // Determine current stage based on existing files
    let stage: StageName = 'goal';
    let status: SpecOverallStatus = 'in_progress';
    
    if (hasTasks) {
      stage = 'exec';
      const taskProgress = await this.parseTaskProgress(SpecPaths.getTasksPath(featureName));
      if (taskProgress.percentage === 100) {
        status = 'completed';
      }
    } else if (hasDesign) {
      stage = 'tasks';
    } else if (hasRequirements) {
      stage = 'design';
    } else {
      stage = 'req';
    }
    
    // Create inferred status
    const inferredStatus: SpecStatus = {
      sid: sessionId,
      name: featureName,
      created: now,
      updated: now,
      stage,
      status,
      notes: 'Status inferred from existing files',
      stages: {
        goal: ['done', now],
        req: hasRequirements ? ['done', now] : ['pending', ''],
        design: hasDesign ? ['done', now] : ['pending', ''],
        tasks: hasTasks ? ['done', now, 0, 0] : ['pending', '', 0, 0],
        exec: stage === 'exec' ? ['active', now, 1] : ['pending', '', 0]
      }
    };
    
    // Save the inferred status
    await this.atomicWriteYaml(SpecPaths.getStatusPath(featureName), inferredStatus);
    await this.updateMetadataIndex(inferredStatus);
    
    return inferredStatus;
  }

  private async updateMetadataIndex(status: SpecStatus): Promise<void> {
    await this.ensureMetadataIndex();
    
    const metadataPath = SpecPaths.getMetadataPath();
    const index = await this.readYaml<MetadataIndex>(metadataPath);
    
    // Find existing entry or create new one
    const existingIndex = index.specs.findIndex(spec => spec.sid === status.sid);
    const metadata: SpecMetadata = {
      sid: status.sid,
      name: status.name,
      status: status.status,
      updated: status.updated,
      archived_at: status.status === 'archived' ? new Date().toISOString() : null
    };
    
    if (existingIndex >= 0) {
      index.specs[existingIndex] = metadata;
    } else {
      index.specs.push(metadata);
    }
    
    await this.atomicWriteYaml(metadataPath, index);
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  private createError(
    error: string,
    code: ErrorCode,
    suggestion: string,
    details?: any
  ): ErrorResponse & Error {
    const errorResponse: ErrorResponse = { error, code, suggestion, details };
    const err = new Error(error) as ErrorResponse & Error;
    Object.assign(err, errorResponse);
    return err;
  }
}

// Export singleton instance
export const statusManager = new StatusManagerImpl();