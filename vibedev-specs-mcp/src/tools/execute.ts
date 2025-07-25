import { readTemplate } from '../utils/template.js';
import { statusManager } from '../utils/status-manager-impl.js';
import { SpecPaths } from '../utils/status-manager.js';

export interface ExecuteStartParams {
  session_id: string;
  feature_name: string;
  task_id?: string;
}

export async function executeStart(
  params: ExecuteStartParams
): Promise<string> {
  const { session_id, feature_name, task_id = 'next_uncompleted' } = params;
  console.error(`[MCP] Starting execution for feature: ${feature_name}, task: ${task_id}`);
  
  // Update spec status for execution stage
  let currentTask = 1;
  
  // If task_id is not provided, find the next uncompleted task
  if (task_id === 'next_uncompleted' || !task_id) {
    try {
      const tasksPath = SpecPaths.getTasksPath(feature_name);
      const taskProgress = await statusManager.parseTaskProgress(tasksPath);
      currentTask = taskProgress.completed + 1;
      console.error(`[MCP] Next uncompleted task: ${currentTask}/${taskProgress.total}`);
    } catch (error) {
      console.error(`[MCP] Could not determine next task, using default: 1`);
    }
  } else {
    // If specific task_id is provided, parse it
    const taskNumber = parseInt(task_id);
    if (!isNaN(taskNumber)) {
      currentTask = taskNumber;
    }
  }
  
  // Update execution stage status
  const timestamp = new Date().toISOString();
  
  // Load current status to preserve other stage information
  const currentStatus = await statusManager.loadSpecStatus(session_id);
  await statusManager.updateSpecStatus(session_id, {
    updated: timestamp,
    stages: {
      ...currentStatus.stages,
      exec: ['active', timestamp, currentTask]
    }
  });
  console.error(`[MCP] Updated spec status: execution stage, current task ${currentTask}`);
  
  // 使用 execute-task.md 模板
  const template = await readTemplate('execute-task.md', {
    feature_name,
    session_id,
    task_id
  });
  
  return `# ⚙️ Task Execution Stage (5/5)

## Feature: ${feature_name}

Congratulations! Now entering the final execution stage. Based on the completed requirements, design, and task planning, let's start executing development tasks one by one.

### Workflow Progress:
- [x] 1. Goal Collection ✅
- [x] 2. Requirements Gathering ✅
- [x] 3. Design Documentation ✅
- [x] 4. Task Planning ✅
- [x] 5. **Task Execution** ← Current Stage

---

${template}

---

**Session Information**:
- Session ID: \`${session_id}\`
- Feature Name: \`${feature_name}\`
- Current Task: \`${task_id}\`
- All Documents: ✅ Completed

Now please start executing the development tasks!`;
}