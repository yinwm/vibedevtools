import { statusManager } from '../utils/status-manager-impl.js';
import { SpecPaths } from '../utils/status-manager.js';

export interface TasksConfirmedParams {
  session_id: string;
  feature_name: string;
}

export async function tasksConfirmed(
  params: TasksConfirmedParams
): Promise<string> {
  const { session_id, feature_name } = params;
  console.error(`[MCP] Tasks confirmed for feature: ${feature_name}`);
  
  // Parse task count from tasks.md file
  let taskCount = 0;
  try {
    const tasksPath = SpecPaths.getTasksPath(feature_name);
    const taskProgress = await statusManager.parseTaskProgress(tasksPath);
    taskCount = taskProgress.total;
    console.error(`[MCP] Parsed ${taskCount} tasks from tasks document`);
  } catch (error) {
    console.error(`[MCP] Could not parse task count, using default: 0`);
  }
  
  // Update spec status: complete tasks stage and move to execution
  const timestamp = new Date().toISOString();
  
  // Load current status to preserve other stage information
  const currentStatus = await statusManager.loadSpecStatus(session_id);
  await statusManager.updateSpecStatus(session_id, {
    stage: 'exec',
    updated: timestamp,
    stages: {
      ...currentStatus.stages,
      tasks: ['done', timestamp, taskCount, 0],
      exec: ['active', timestamp, 1]
    }
  });
  console.error(`[MCP] Updated spec status: tasks completed, moved to execution stage`);
  
  return `# ✅ Task Planning Completed

## Generated Tasks Document:
📄 ".vibedev/specs/${feature_name}/tasks.md"

The tasks document contains a detailed list of development tasks, each with clear descriptions, acceptance criteria, and execution order.

---

## Next Stage: Task Execution (5/5)

### Workflow Progress:
- [x] 1. Goal Collection ✅
- [x] 2. Requirements Gathering ✅
- [x] 3. Design Document ✅
- [x] 4. **Task Planning** ✅
- [ ] 5. **Task Execution** ← Final Stage

Now please call \`vibedev_specs_execute_start\` to begin the task execution stage.

**Session Information**:
- Session ID: \`${session_id}\`
- Feature Name: \`${feature_name}\`
- Requirements: ✅ Completed
- Design: ✅ Completed
- Tasks: ✅ Completed`;
}