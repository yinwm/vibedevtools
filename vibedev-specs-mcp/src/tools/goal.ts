export interface GoalConfirmedParams {
  session_id: string;
  feature_name: string;
  goal_summary: string;
}

export async function goalConfirmed(params: GoalConfirmedParams): Promise<string> {
  const { session_id, feature_name, goal_summary } = params;
  console.error(`[MCP] Goal confirmed for session ${session_id} with feature: ${feature_name}`);
  
  return `# ✅ Feature Goal Confirmed

## Confirmed Feature Goal:
- **Feature Name**: \`${feature_name}\`
- **Feature Description**: ${goal_summary}
- **Project Directory**: \`.vibedev/specs/${feature_name}/\`

---

## Next Stage: Requirements Gathering (2/5)

### Workflow Progress:
- [x] 1. **Goal Collection** ✅
- [ ] 2. **Requirements Gathering** ← Next Stage
- [ ] 3. Design Documentation
- [ ] 4. Task Planning
- [ ] 5. Task Execution

Now please call \`vibedev_specs_requirements_start\` to begin detailed requirements gathering.

**Session Information**:
- Session ID: \`${session_id}\`
- Feature Name: \`${feature_name}\``;
}