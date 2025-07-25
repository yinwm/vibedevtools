import { statusManager } from '../utils/status-manager-impl.js';
import { outputFormatter } from '../utils/output-formatter.js';
import { SpecOverallStatus, StageName } from '../utils/status-manager.js';

export interface UpdateStatusParams {
  session_id: string;
  status?: 'in_progress' | 'completed' | 'archived' | 'paused';
  stage?: string;
  task_completed?: number;
  notes?: string;
}

export async function updateSpecStatus(params: UpdateStatusParams): Promise<string> {
  const { session_id, status, stage, task_completed, notes } = params;
  console.error(`[MCP] Updating spec status for session_id: ${session_id}`, params);
  
  try {
    // Validate parameters
    if (!status && !stage && task_completed === undefined && !notes) {
      throw {
        message: 'At least one field must be provided to update',
        code: 'INVALID_PARAMETERS',
        suggestion: 'Provide status, stage, task_completed, or notes to update'
      };
    }
    
    // Load current spec status
    const currentSpec = await statusManager.loadSpecStatus(session_id);
    console.error(`[MCP] Current spec: ${currentSpec.name}, stage: ${currentSpec.stage}, status: ${currentSpec.status}`);
    
    // Build update object
    const updates: any = {};
    
    // Update overall status if provided
    if (status) {
      updates.status = status as SpecOverallStatus;
    }
    
    // Update stage if provided
    if (stage) {
      const validStages: StageName[] = ['goal', 'req', 'design', 'tasks', 'exec'];
      const stageName = stage as StageName;
      
      if (!validStages.includes(stageName)) {
        throw {
          message: `Invalid stage: ${stage}`,
          code: 'INVALID_STAGE',
          suggestion: `Valid stages are: ${validStages.join(', ')}`
        };
      }
      
      updates.stage = stageName;
      
      // Update stage status to active
      const now = new Date().toISOString();
      updates.stages = { ...currentSpec.stages };
      if (stageName === 'tasks' && currentSpec.stages.tasks.length === 4) {
        updates.stages[stageName] = ['active', now, currentSpec.stages.tasks[2], currentSpec.stages.tasks[3]];
      } else if (stageName === 'exec' && currentSpec.stages.exec.length === 3) {
        updates.stages[stageName] = ['active', now, currentSpec.stages.exec[2]];
      } else {
        updates.stages[stageName] = ['active', now];
      }
    }
    
    // Update task completion count if provided
    if (task_completed !== undefined) {
      updates.stages = updates.stages || { ...currentSpec.stages };
      const total = currentSpec.stages.tasks[2] || 0;
      
      if (task_completed < 0 || task_completed > total) {
        throw {
          message: `Invalid task_completed value: ${task_completed}`,
          code: 'INVALID_TASK_COUNT',
          suggestion: `Value must be between 0 and ${total}`
        };
      }
      
      // Update tasks stage
      updates.stages.tasks = [
        currentSpec.stages.tasks[0],
        currentSpec.stages.tasks[1],
        total,
        task_completed
      ];
      
      // If in exec stage, update current task
      if (currentSpec.stage === 'exec') {
        updates.stages.exec = [
          currentSpec.stages.exec[0],
          currentSpec.stages.exec[1],
          task_completed + 1 // Current task is next uncompleted
        ];
      }
    }
    
    // Update notes if provided
    if (notes !== undefined) {
      updates.notes = notes;
    }
    
    // Apply updates
    await statusManager.updateSpecStatus(session_id, updates);
    console.error(`[MCP] Successfully updated spec status`);
    
    // Load updated spec to show confirmation
    const updatedSpec = await statusManager.loadSpecStatus(session_id);
    
    // Format confirmation message
    const lines: string[] = [
      '# ✅ Spec Status Updated',
      '',
      `## Updated Spec: ${updatedSpec.name}`,
      '',
      '### Changes Applied:'
    ];
    
    if (status) {
      lines.push(`- Status: **${status}**`);
    }
    if (stage) {
      lines.push(`- Stage: **${stage}**`);
    }
    if (task_completed !== undefined) {
      lines.push(`- Tasks Completed: **${task_completed}/${currentSpec.stages.tasks[2]}**`);
    }
    if (notes !== undefined) {
      lines.push(`- Notes: **${notes || '(cleared)'}**`);
    }
    
    lines.push('', '### Current Status:');
    lines.push(`- Session ID: \`${updatedSpec.sid}\``);
    lines.push(`- Feature: \`${updatedSpec.name}\``);
    lines.push(`- Status: \`${updatedSpec.status}\``);
    lines.push(`- Stage: \`${updatedSpec.stage}\``);
    lines.push(`- Updated: \`${new Date(updatedSpec.updated).toLocaleString()}\``);
    
    if (updatedSpec.notes) {
      lines.push(`- Notes: ${updatedSpec.notes}`);
    }
    
    return lines.join('\n');
    
  } catch (error: any) {
    console.error('[MCP] Error updating spec status:', error);
    
    // Format error response
    const errorWithDetails = {
      ...error,
      code: error.code || 'UPDATE_ERROR',
      suggestion: error.suggestion || 'Check the parameters and try again'
    };
    
    return outputFormatter.formatError(errorWithDetails);
  }
}