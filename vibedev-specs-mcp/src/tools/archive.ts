import { statusManager } from '../utils/status-manager-impl.js';
import { outputFormatter } from '../utils/output-formatter.js';

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
    
    // Format confirmation message
    const emoji = action === 'archive' ? '📦' : '🔄';
    const actionText = action === 'archive' ? 'Archived' : 'Restored';
    
    const lines: string[] = [
      `# ${emoji} Spec ${actionText}`,
      '',
      `## ${actionText} Spec: ${spec.name}`,
      '',
      '### Details:'
    ];
    
    lines.push(`- Session ID: \`${spec.sid}\``);
    lines.push(`- Feature: \`${spec.name}\``);
    lines.push(`- Previous Status: \`${spec.status}\``);
    lines.push(`- New Status: \`${newStatus}\``);
    lines.push(`- ${actionText} At: \`${new Date(timestamp).toLocaleString()}\``);
    
    if (action === 'archive') {
      lines.push('', '### Note:');
      lines.push('- Archived specs are excluded from default list views');
      lines.push('- Use `status_filter: "archived"` to see archived specs');
      lines.push('- All documents and data are preserved');
      lines.push('- You can restore this spec at any time');
    } else {
      lines.push('', '### Note:');
      lines.push('- The spec is now active again');
      lines.push('- You can continue working from where you left off');
      lines.push(`- Current stage: \`${spec.stage}\``);
    }
    
    return lines.join('\n');
    
  } catch (error: any) {
    console.error('[MCP] Error archiving spec:', error);
    
    // Format error response
    const errorWithDetails = {
      ...error,
      code: error.code || 'ARCHIVE_ERROR',
      suggestion: error.suggestion || 'Check if the session ID is correct'
    };
    
    return outputFormatter.formatError(errorWithDetails);
  }
}