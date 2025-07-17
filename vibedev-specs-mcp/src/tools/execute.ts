import { readTemplate } from '../utils/template.js';

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