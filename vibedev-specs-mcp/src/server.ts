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

export function createServer() {
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
      description: '启动 specs 工作流，开始目标收集阶段',
      inputSchema: {
        type: 'object',
        properties: {},
        required: []
      }
    },
    {
      name: 'vibedev_specs_goal_confirmed',
      description: '确认功能目标完成，设置 feature_name，推进到需求收集阶段',
      inputSchema: {
        type: 'object',
        properties: {
          session_id: { 
            type: 'string', 
            description: '会话标识符' 
          },
          feature_name: { 
            type: 'string', 
            description: '基于目标生成的功能名称（如 user-auth）' 
          },
          goal_summary: {
            type: 'string',
            description: '功能目标的简要描述'
          }
        },
        required: ['session_id', 'feature_name', 'goal_summary']
      }
    },
    {
      name: 'vibedev_specs_requirements_start',
      description: '开始需求收集阶段，提供需求收集的指导',
      inputSchema: {
        type: 'object',
        properties: {
          session_id: { 
            type: 'string', 
            description: '会话标识符' 
          },
          feature_name: { 
            type: 'string', 
            description: '功能名称' 
          }
        },
        required: ['session_id', 'feature_name']
      }
    },
    {
      name: 'vibedev_specs_requirements_confirmed',
      description: '确认需求收集完成，推进到设计阶段',
      inputSchema: {
        type: 'object',
        properties: {
          session_id: { 
            type: 'string', 
            description: '会话标识符' 
          },
          feature_name: { 
            type: 'string', 
            description: '功能名称' 
          }
        },
        required: ['session_id', 'feature_name']
      }
    },
    {
      name: 'vibedev_specs_design_start',
      description: '开始设计文档阶段，提供设计文档创建的指导',
      inputSchema: {
        type: 'object',
        properties: {
          session_id: { 
            type: 'string', 
            description: '会话标识符' 
          },
          feature_name: { 
            type: 'string', 
            description: '功能名称' 
          }
        },
        required: ['session_id', 'feature_name']
      }
    },
    {
      name: 'vibedev_specs_design_confirmed',
      description: '确认设计文档完成，推进到任务规划阶段',
      inputSchema: {
        type: 'object',
        properties: {
          session_id: { 
            type: 'string', 
            description: '会话标识符' 
          },
          feature_name: { 
            type: 'string', 
            description: '功能名称' 
          }
        },
        required: ['session_id', 'feature_name']
      }
    },
    {
      name: 'vibedev_specs_tasks_start',
      description: '开始任务规划阶段，提供任务列表创建的指导',
      inputSchema: {
        type: 'object',
        properties: {
          session_id: { 
            type: 'string', 
            description: '会话标识符' 
          },
          feature_name: { 
            type: 'string', 
            description: '功能名称' 
          }
        },
        required: ['session_id', 'feature_name']
      }
    },
    {
      name: 'vibedev_specs_tasks_confirmed',
      description: '确认任务规划完成，推进到执行阶段',
      inputSchema: {
        type: 'object',
        properties: {
          session_id: { 
            type: 'string', 
            description: '会话标识符' 
          },
          feature_name: { 
            type: 'string', 
            description: '功能名称' 
          }
        },
        required: ['session_id', 'feature_name']
      }
    },
    {
      name: 'vibedev_specs_execute_start',
      description: '开始任务执行阶段，提供任务执行的指导',
      inputSchema: {
        type: 'object',
        properties: {
          session_id: { 
            type: 'string', 
            description: '会话标识符' 
          },
          feature_name: { 
            type: 'string', 
            description: '功能名称' 
          },
          task_id: { 
            type: 'string', 
            description: '可选：指定要执行的任务ID，不指定则执行下一个未完成任务' 
          }
        },
        required: ['session_id', 'feature_name']
      }
    }
  ];

  // Register tools list handler
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    console.error('[MCP] Handling list tools request');
    return { tools };
  });

  // Register tool call handler
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