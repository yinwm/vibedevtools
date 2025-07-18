export interface DesignConfirmedParams {
  session_id: string;
  feature_name: string;
}

export async function designConfirmed(
  params: DesignConfirmedParams
): Promise<string> {
  const { session_id, feature_name } = params;
  console.error(`[MCP] Design confirmed for feature: ${feature_name}`);
  
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