import { readTemplate } from '../utils/template.js';

export interface TasksStartParams {
  session_id: string;
  feature_name: string;
}

export async function tasksStart(
  params: TasksStartParams
): Promise<string> {
  const { session_id, feature_name } = params;
  console.error(`[MCP] Starting tasks planning for feature: ${feature_name}`);
  
  // Use gen-tasks.md template
  const template = await readTemplate('gen-tasks.md', {
    feature_name,
    session_id
  });
  
  return `# 📋 Task Planning Stage (4/5)

## Feature: ${feature_name}

### Workflow Progress:
- [x] 1. Goal Collection ✅
- [x] 2. Requirements Gathering ✅
- [x] 3. Design Documentation ✅
- [x] 4. **Task Planning** ← Current Stage
- [ ] 5. Task Execution

---

${template}

---

**Important**:
- Please create task list according to the above guidelines
- **Only when you explicitly confirm the task planning is complete can you call** \`vibedev_specs_tasks_confirmed\` tool
- **Never** call the next stage tool before the user **explicitly confirms the tasks**

**Session Information**:
- Session ID: \`${session_id}\`
- Feature Name: \`${feature_name}\`
- Requirements: \`.vibedev/specs/${feature_name}/requirements.md\`
- Design: \`.vibedev/specs/${feature_name}/design.md\``;
}