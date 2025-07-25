import { statusManager } from '../utils/status-manager-impl.js';
import { ContentType, createSuccessResponse, createErrorResponse } from '../utils/yaml-response.js';

export interface ArchiveParams {
  session_id: string;
  action: 'archive' | 'restore';
}

export async function archiveSpec(params: ArchiveParams): Promise<string> {
  const { session_id, action } = params;
  console.error(`[MCP] ${action === 'archive' ? 'Archiving' : 'Restoring'} spec with session_id: ${session_id}`);
  
  try {
    // Load current spec status
    const spec = await statusManager.loadSpecStatus(session_id);
    console.error(`[MCP] Current spec: ${spec.name}, status: ${spec.status}`);
    
    // Validate action
    if (action === 'archive' && spec.status === 'archived') {
      throw {
        message: `Spec '${spec.name}' is already archived`,
        code: 'ALREADY_ARCHIVED',
        suggestion: 'Use action: "restore" to reactivate this spec'
      };
    }
    
    if (action === 'restore' && spec.status !== 'archived') {
      throw {
        message: `Spec '${spec.name}' is not archived`,
        code: 'NOT_ARCHIVED',
        suggestion: 'Only archived specs can be restored'
      };
    }
    
    // Determine new status
    const newStatus = action === 'archive' ? 'archived' : 'in_progress';
    const timestamp = new Date().toISOString();
    
    // Update spec status
    const updates: any = {
      status: newStatus
    };
    
    // Add or remove archived_at timestamp
    if (action === 'archive') {
      updates.archived_at = timestamp;
    } else {
      updates.archived_at = null;
    }
    
    await statusManager.updateSpecStatus(session_id, updates);
    console.error(`[MCP] Successfully ${action}d spec`);
    
    // Build structured confirmation data
    const confirmationData = {
      action: action,
      spec: {
        name: spec.name,
        session_id: spec.sid,
        previous_status: spec.status,
        new_status: newStatus,
        stage: spec.stage
      },
      timestamp: timestamp,
      notes: action === 'archive' ? [
        'Archived specs are excluded from default list views',
        'Use status_filter: "archived" to see archived specs',
        'All documents and data are preserved',
        'You can restore this spec at any time'
      ] : [
        'The spec is now active again',
        'You can continue working from where you left off',
        `Current stage: ${spec.stage}`
      ]
    };
    
    // Return structured YAML confirmation
    return createSuccessResponse(
      ContentType.ARCHIVE_ACTION,
      confirmationData,
      session_id
    );
    
  } catch (error: any) {
    console.error('[MCP] Error archiving spec:', error);
    
    // Return structured YAML error response
    return createErrorResponse(
      error.message,
      error.code || 'ARCHIVE_ERROR',
      error.suggestion || 'Check if the session ID is correct',
      undefined,
      session_id
    );
  }
}