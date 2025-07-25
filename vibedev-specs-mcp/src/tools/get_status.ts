import { statusManager } from '../utils/status-manager-impl.js';
import { SpecPaths } from '../utils/status-manager.js';
import { ContentType, createSuccessResponse, createErrorResponse } from '../utils/yaml-response.js';
import * as fs from 'fs/promises';

export interface GetStatusParams {
  session_id: string;
  feature_name?: string;
}

export async function getSpecStatus(params: GetStatusParams): Promise<string> {
  const { session_id, feature_name } = params;
  console.error(`[MCP] Getting spec status for session_id: ${session_id}${feature_name ? `, feature_name: ${feature_name}` : ''}`);
  
  try {
    // Load spec status
    const spec = await statusManager.loadSpecStatus(session_id);
    console.error(`[MCP] Loaded spec: ${spec.name}`);
    
    // If feature_name is provided, verify it matches
    if (feature_name && spec.name !== feature_name) {
      throw {
        message: `Session ID ${session_id} belongs to feature '${spec.name}', not '${feature_name}'`,
        code: 'FEATURE_MISMATCH',
        suggestion: `Use the correct feature name '${spec.name}' or omit the feature_name parameter`
      };
    }
    
    // Try to parse task progress if in execution stage
    let taskProgress;
    if (spec.stage === 'exec' || spec.stage === 'tasks') {
      try {
        const tasksPath = SpecPaths.getTasksPath(spec.name);
        taskProgress = await statusManager.parseTaskProgress(tasksPath);
        console.error(`[MCP] Task progress: ${taskProgress.completed}/${taskProgress.total} (${taskProgress.percentage}%)`);
      } catch (error) {
        console.error('[MCP] Could not parse task progress:', error);
      }
    }
    
    // Check file sizes for documents
    const docs = [
      { name: 'requirements.md', path: SpecPaths.getRequirementsPath(spec.name) },
      { name: 'design.md', path: SpecPaths.getDesignPath(spec.name) },
      { name: 'tasks.md', path: SpecPaths.getTasksPath(spec.name) }
    ];
    
    const fileSizes: Record<string, number> = {};
    for (const doc of docs) {
      try {
        const stats = await fs.stat(doc.path);
        fileSizes[doc.name] = stats.size;
        console.error(`[MCP] ${doc.name}: ${(stats.size / 1024).toFixed(1)} KB`);
      } catch {
        fileSizes[doc.name] = 0;
      }
    }
    
    // Return structured YAML data for CC to format
    return createSuccessResponse(
      ContentType.SPEC_DETAIL,
      {
        spec,
        taskProgress,
        fileSizes
      },
      session_id
    );
    
  } catch (error: any) {
    console.error('[MCP] Error getting spec status:', error);
    
    // Return structured YAML error response
    return createErrorResponse(
      error.message,
      error.code || 'GET_STATUS_ERROR',
      error.suggestion || `Check if the session ID is correct or use 'vibedev_specs_list' to see all specs`,
      undefined,
      session_id
    );
  }
}