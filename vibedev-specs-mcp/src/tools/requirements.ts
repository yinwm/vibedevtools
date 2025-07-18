import { readTemplate } from '../utils/template.js';

export interface RequirementsStartParams {
  session_id: string;
  feature_name: string;
}

export async function requirementsStart(
  params: RequirementsStartParams
): Promise<string> {
  const { session_id, feature_name } = params;
  console.error(`[MCP] Starting requirements collection for feature: ${feature_name}`);
  
  // Use gen-req.md template
  const template = await readTemplate('gen-req.md', {
    feature_name,
    session_id
  });
  
  return `# 📋 Requirements Gathering Stage (2/5)

## Feature: ${feature_name}

### Workflow Progress:
- [x] 1. Goal Collection ✅
- [x] 2. **Requirements Gathering** ← Current Stage
- [ ] 3. Design Documentation
- [ ] 4. Task Planning
- [ ] 5. Task Execution

---

${template}

---

**Important**:
- Please generate requirements document according to the above guidelines
- **Only when you explicitly confirm the requirements are complete can you call** \`vibedev_specs_requirements_confirmed\` tool
- **Never** call the next stage tool before the user **explicitly confirms the requirements**

**Session Information**:
- Session ID: \`${session_id}\`
- Feature Name: \`${feature_name}\``;
}