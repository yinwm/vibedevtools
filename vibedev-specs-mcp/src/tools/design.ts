import { readTemplate } from '../utils/template.js';

export interface DesignStartParams {
  session_id: string;
  feature_name: string;
}

export async function designStart(
  params: DesignStartParams
): Promise<string> {
  const { session_id, feature_name } = params;
  console.error(`[MCP] Starting design phase for feature: ${feature_name}`);
  
  // Use gen-design.md template
  const template = await readTemplate('gen-design.md', {
    feature_name,
    session_id
  });
  
  return `# 📝 Design Documentation Stage (3/5)

## Feature: ${feature_name}

### Workflow Progress:
- [x] 1. Goal Collection ✅
- [x] 2. Requirements Gathering ✅
- [x] 3. **Design Documentation** ← Current Stage
- [ ] 4. Task Planning
- [ ] 5. Task Execution

---

${template}

---

**Important**:
- Please create design document according to the above guidelines
- **Only when you explicitly confirm the design is complete can you call** \`vibedev_specs_design_confirmed\` tool
- **Never** call the next stage tool before the user **explicitly confirms the design**

**Session Information**:
- Session ID: \`${session_id}\`
- Feature Name: \`${feature_name}\`
- Requirements: \`.vibedev/specs/${feature_name}/requirements.md\``;
}