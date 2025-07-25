import { statusManager } from '../utils/status-manager-impl.js';
import { SpecOverallStatus, SpecMetadata } from '../utils/status-manager.js';
import { ContentType, createSuccessResponse, createErrorResponse } from '../utils/yaml-response.js';

export interface ListToolParams {
  status_filter?: 'all' | 'in_progress' | 'completed' | 'archived' | 'paused';
}

// Summary statistics interface
interface SpecSummary {
  total: number;
  active: number;
  completed: number;
  archived: number;
  paused: number;
}

// Calculate summary statistics from specs list
function calculateSummary(specs: SpecMetadata[]): SpecSummary {
  return {
    total: specs.length,
    active: specs.filter(spec => spec.status === 'in_progress').length,
    completed: specs.filter(spec => spec.status === 'completed').length,
    archived: specs.filter(spec => spec.status === 'archived').length,
    paused: specs.filter(spec => spec.status === 'paused').length
  };
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
    
    // Calculate summary statistics
    const summary = calculateSummary(specs);
    
    // Return structured YAML data for CC to format
    return createSuccessResponse(
      ContentType.SPEC_LIST,
      {
        specs,
        filter: status_filter,
        count: specs.length,
        summary
      }
    );
    
  } catch (error: any) {
    console.error('[MCP] Error listing specs:', error);
    
    // Return structured YAML error response
    return createErrorResponse(
      error.message,
      error.code || 'LIST_ERROR',
      error.suggestion || 'Check if the .vibedev/specs directory exists and has proper permissions'
    );
  }
}