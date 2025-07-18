export interface TasksConfirmedParams {
  session_id: string;
  feature_name: string;
}

export async function tasksConfirmed(
  params: TasksConfirmedParams
): Promise<string> {
  const { session_id, feature_name } = params;
  console.error(`[MCP] Tasks confirmed for feature: ${feature_name}`);
  
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