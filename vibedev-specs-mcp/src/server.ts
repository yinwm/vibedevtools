import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { workflowStart } from './tools/workflow.js';
import { goalConfirmed } from './tools/goal.js';
import { requirementsStart } from './tools/requirements.js';
import { requirementsConfirmed } from './tools/requirements_confirmed.js';
import { designStart } from './tools/design.js';
import { designConfirmed } from './tools/design_confirmed.js';
import { tasksStart } from './tools/tasks.js';
import { tasksConfirmed } from './tools/tasks_confirmed.js';
import { executeStart } from './tools/execute.js';
import { listSpecs } from './tools/list.js';
import { getSpecStatus } from './tools/get_status.js';
import { updateSpecStatus } from './tools/update_status.js';
import { archiveSpec } from './tools/archive.js';

export function createServer(): Server {
  const server = new Server(
    { 
      name: 'vibedev-specs-mcp',
      version: '1.0.0'
    },
    { 
      capabilities: { tools: {} }
    }
  );

  // Tool definitions
  const tools = [
    {
      name: 'vibedev_specs_workflow_start',
      description: 'Start the specs workflow and begin the goal collection phase',
      inputSchema: {
        type: 'object',
        properties: {},
        required: []
      }
    },
    {
      name: 'vibedev_specs_goal_confirmed',
      description: 'Confirm the completion of the feature goal, set the feature_name, and proceed to the requirements collection phase',
      inputSchema: {
        type: 'object',
        properties: {
          session_id: { 
            type: 'string', 
            description: 'Session identifier' 
          },
          feature_name: { 
            type: 'string', 
            description: 'Feature name generated based on the goal (e.g., user-auth)' 
          },
          goal_summary: {
            type: 'string',
            description: 'Brief description of the feature goal'
          }
        },
        required: ['session_id', 'feature_name', 'goal_summary']
      }
    },
    {
      name: 'vibedev_specs_requirements_start',
      description: 'Start the requirements collection phase and provide guidance for requirements gathering',
      inputSchema: {
        type: 'object',
        properties: {
          session_id: { 
            type: 'string', 
            description: 'Session identifier' 
          },
          feature_name: { 
            type: 'string', 
            description: 'Feature name' 
          }
        },
        required: ['session_id', 'feature_name']
      }
    },
    {
      name: 'vibedev_specs_requirements_confirmed',
      description: 'Confirm the completion of requirements collection and proceed to the design phase',
      inputSchema: {
        type: 'object',
        properties: {
          session_id: { 
            type: 'string', 
            description: 'Session identifier' 
          },
          feature_name: { 
            type: 'string', 
            description: 'Feature name' 
          }
        },
        required: ['session_id', 'feature_name']
      }
    },
    {
      name: 'vibedev_specs_design_start',
      description: 'Start the design documentation phase and provide guidance for creating design documents',
      inputSchema: {
        type: 'object',
        properties: {
          session_id: { 
            type: 'string', 
            description: 'Session identifier' 
          },
          feature_name: { 
            type: 'string', 
            description: 'Feature name' 
          }
        },
        required: ['session_id', 'feature_name']
      }
    },
    {
      name: 'vibedev_specs_design_confirmed',
      description: 'Confirm the completion of the design document and proceed to the task planning phase',
      inputSchema: {
        type: 'object',
        properties: {
          session_id: { 
            type: 'string', 
            description: 'Session identifier' 
          },
          feature_name: { 
            type: 'string', 
            description: 'Feature name' 
          }
        },
        required: ['session_id', 'feature_name']
      }
    },
    {
      name: 'vibedev_specs_tasks_start',
      description: 'Start the task planning phase and provide guidance for creating the task list',
      inputSchema: {
        type: 'object',
        properties: {
          session_id: { 
            type: 'string', 
            description: 'Session identifier' 
          },
          feature_name: { 
            type: 'string', 
            description: 'Feature name' 
          }
        },
        required: ['session_id', 'feature_name']
      }
    },
    {
      name: 'vibedev_specs_tasks_confirmed',
      description: 'Confirm the completion of task planning and proceed to the execution phase',
      inputSchema: {
        type: 'object',
        properties: {
          session_id: { 
            type: 'string', 
            description: 'Session identifier' 
          },
          feature_name: { 
            type: 'string', 
            description: 'Feature name' 
          }
        },
        required: ['session_id', 'feature_name']
      }
    },
    {
      name: 'vibedev_specs_execute_start',
      description: 'Start the task execution phase and provide guidance for task execution',
      inputSchema: {
        type: 'object',
        properties: {
          session_id: { 
            type: 'string', 
            description: 'Session identifier' 
          },
          feature_name: { 
            type: 'string', 
            description: 'Feature name' 
          },
          task_id: { 
            type: 'string', 
            description: 'Optional: Specify the task ID to execute; if not specified, the next unfinished task will be executed' 
          }
        },
        required: ['session_id', 'feature_name']
      }
    },
    {
      name: 'vibedev_specs_list',
      description: 'List all specs with optional status filtering',
      inputSchema: {
        type: 'object',
        properties: {
          status_filter: {
            type: 'string',
            enum: ['all', 'in_progress', 'completed', 'archived', 'paused'],
            description: 'Filter specs by status (default: all)'
          }
        },
        required: []
      }
    },
    {
      name: 'vibedev_specs_get_status',
      description: 'Get detailed status of a specific spec',
      inputSchema: {
        type: 'object',
        properties: {
          session_id: {
            type: 'string',
            description: 'Session identifier'
          },
          feature_name: {
            type: 'string',
            description: 'Feature name (optional, can be derived from session_id)'
          }
        },
        required: ['session_id']
      }
    },
    {
      name: 'vibedev_specs_update_status',
      description: 'Update the status of a spec',
      inputSchema: {
        type: 'object',
        properties: {
          session_id: {
            type: 'string',
            description: 'Session identifier'
          },
          status: {
            type: 'string',
            enum: ['in_progress', 'completed', 'archived', 'paused'],
            description: 'Overall spec status'
          },
          stage: {
            type: 'string',
            enum: ['goal', 'req', 'design', 'tasks', 'exec'],
            description: 'Current workflow stage'
          },
          task_completed: {
            type: 'number',
            description: 'Number of completed tasks'
          },
          notes: {
            type: 'string',
            description: 'Custom notes or comments'
          }
        },
        required: ['session_id']
      }
    },
    {
      name: 'vibedev_specs_archive',
      description: 'Archive or restore a spec',
      inputSchema: {
        type: 'object',
        properties: {
          session_id: {
            type: 'string',
            description: 'Session identifier'
          },
          action: {
            type: 'string',
            enum: ['archive', 'restore'],
            description: 'Action to perform: archive or restore'
          }
        },
        required: ['session_id', 'action']
      }
    }
  ];

  // Register the handler for listing tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    console.error('[MCP] Handling list tools request');
    return { tools };
  });

  // Register the handler for tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    console.error(`[MCP] Handling tool call: ${name}`, args);

    try {
      let result: any;

      switch (name) {
        case 'vibedev_specs_workflow_start':
          result = await workflowStart();
          break;
        
        case 'vibedev_specs_goal_confirmed':
          result = await goalConfirmed(args as any);
          break;
        
        case 'vibedev_specs_requirements_start':
          result = await requirementsStart(args as any);
          break;
        
        case 'vibedev_specs_requirements_confirmed':
          result = await requirementsConfirmed(args as any);
          break;
        
        case 'vibedev_specs_design_start':
          result = await designStart(args as any);
          break;
        
        case 'vibedev_specs_design_confirmed':
          result = await designConfirmed(args as any);
          break;
        
        case 'vibedev_specs_tasks_start':
          result = await tasksStart(args as any);
          break;
        
        case 'vibedev_specs_tasks_confirmed':
          result = await tasksConfirmed(args as any);
          break;
        
        case 'vibedev_specs_execute_start':
          result = await executeStart(args as any);
          break;
        
        case 'vibedev_specs_list':
          result = await listSpecs(args as any);
          break;
        
        case 'vibedev_specs_get_status':
          result = await getSpecStatus(args as any);
          break;
        
        case 'vibedev_specs_update_status':
          result = await updateSpecStatus(args as any);
          break;
        
        case 'vibedev_specs_archive':
          result = await archiveSpec(args as any);
          break;
        
        default:
          throw new Error(`Unknown tool: ${name}`);
      }

      console.error(`[MCP] Tool ${name} completed successfully`);
      
      return {
        content: [{
          type: 'text',
          text: result
        }]
      };
    } catch (error: any) {
      console.error(`[MCP] Tool ${name} failed:`, error);
      return {
        content: [{
          type: 'text',
          text: `Error: ${error.message}`
        }],
        isError: true
      };
    }
  });

  return server;
}