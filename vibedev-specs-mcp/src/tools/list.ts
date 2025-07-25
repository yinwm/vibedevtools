import { statusManager } from '../utils/status-manager-impl.js';
import { outputFormatter } from '../utils/output-formatter.js';
import { SpecOverallStatus } from '../utils/status-manager.js';

export interface ListToolParams {
  status_filter?: 'all' | 'in_progress' | 'completed' | 'archived' | 'paused';
}

export async function listSpecs(params: ListToolParams = {}): Promise<string> {
  const { status_filter = 'all' } = params;
  console.error(`[MCP] Listing specs with filter: ${status_filter}`);
  
  try {
    // Ensure metadata index exists
    await statusManager.ensureMetadataIndex();
    
    // Load all specs
    let specs = await statusManager.loadAllSpecs();
    console.error(`[MCP] Found ${specs.length} total specs`);
    
    // Apply status filter if not 'all'
    if (status_filter !== 'all') {
      specs = specs.filter(spec => spec.status === status_filter);
      console.error(`[MCP] After filtering: ${specs.length} specs with status '${status_filter}'`);
    }
    
    // Format and return the list
    return outputFormatter.formatSpecList(specs);
    
  } catch (error: any) {
    console.error('[MCP] Error listing specs:', error);
    
    // Format error response
    const errorWithDetails = {
      ...error,
      code: error.code || 'LIST_ERROR',
      suggestion: error.suggestion || 'Check if the .vibedev/specs directory exists and has proper permissions'
    };
    
    return outputFormatter.formatError(errorWithDetails);
  }
}