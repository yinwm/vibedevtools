import { statusManager } from '../utils/status-manager-impl.js';

export interface DesignConfirmedParams {
  session_id: string;
  feature_name: string;
}

export async function designConfirmed(
  params: DesignConfirmedParams
): Promise<string> {
  const { session_id, feature_name } = params;
  console.error(`[MCP] Design confirmed for feature: ${feature_name}`);
  
  // Update spec status: complete design stage and move to tasks
  const timestamp = new Date().toISOString();
  
  // Load current status to preserve other stage information
  const currentStatus = await statusManager.loadSpecStatus(session_id);
  await statusManager.updateSpecStatus(session_id, {
    stage: 'tasks',
    updated: timestamp,
    stages: {
      ...currentStatus.stages,
      design: ['done', timestamp],
      tasks: ['active', timestamp, 0, 0],
      exec: ['pending', '', 1]
    }
  });
  console.error(`[MCP] Updated spec status: design completed, moved to tasks stage`);
  
  return `# ✅ Design Document Completed

## Generated Design Document:
📄 ".vibedev/specs/${feature_name}/design.md"

The design document contains the complete technical architecture, component design, and implementation plan.

---

## Next Stage: Task Planning (4/5)

### Workflow Progress:
- [x] 1. Goal Collection ✅
- [x] 2. Requirements Gathering ✅
- [x] 3. **Design Document** ✅
- [ ] 4. **Task Planning** ← Next Stage
- [ ] 5. Task Execution

Now please call \`vibedev_specs_tasks_start\` to begin the task planning stage.

**Session Information**:
- Session ID: \`${session_id}\`
- Feature Name: \`${feature_name}\`
- Requirements: ✅ Completed
- Design: ✅ Completed`;
}