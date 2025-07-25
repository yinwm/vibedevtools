import { statusManager } from '../utils/status-manager-impl.js';

export interface RequirementsConfirmedParams {
  session_id: string;
  feature_name: string;
}

export async function requirementsConfirmed(
  params: RequirementsConfirmedParams
): Promise<string> {
  const { session_id, feature_name } = params;
  console.error(`[MCP] Requirements confirmed for feature: ${feature_name}`);
  
  // Update spec status: complete requirements stage and move to design
  const timestamp = new Date().toISOString();
  
  // Load current status to preserve other stage information
  const currentStatus = await statusManager.loadSpecStatus(session_id);
  await statusManager.updateSpecStatus(session_id, {
    stage: 'design',
    updated: timestamp,
    stages: {
      ...currentStatus.stages,
      req: ['done', timestamp],
      design: ['active', timestamp],
      tasks: ['pending', '', 0, 0],
      exec: ['pending', '', 1]
    }
  });
  console.error(`[MCP] Updated spec status: requirements completed, moved to design stage`);
  
  return `# ✅ Requirements Gathering Completed

## Generated Requirements Document:
📄 ".vibedev/specs/${feature_name}/requirements.md"

The requirements document contains complete user stories and EARS-format acceptance criteria.

---

## Next Stage: Design Document (3/5)

### Workflow Progress:
- [x] 1. Goal Collection ✅
- [x] 2. **Requirements Gathering** ✅
- [ ] 3. **Design Document** ← Next Stage
- [ ] 4. Task Planning
- [ ] 5. Task Execution

Now please call \`vibedev_specs_design_start\` to begin the technical design stage.

**Session Information**:
- Session ID: \`${session_id}\`
- Feature Name: \`${feature_name}\`
- Requirements: ✅ Completed`;
}