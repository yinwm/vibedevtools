import { customAlphabet } from 'nanoid';
import { readTemplate } from '../utils/template.js';
import { statusManager } from '../utils/status-manager-impl.js';

const generateSessionId = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 12);

export async function workflowStart(): Promise<string> {
  const session_id = generateSessionId();
  console.error(`[MCP] Starting workflow with session_id: ${session_id}`);
  
  // Initialize spec status in goal stage
  const timestamp = new Date().toISOString();
  await statusManager.initializeSpec(session_id, {
    sid: session_id,
    name: 'new-spec', // Will be updated when goal is confirmed
    created: timestamp,
    updated: timestamp,
    stage: 'goal',
    status: 'in_progress',
    stages: {
      goal: ['active', timestamp],
      req: ['pending', ''],
      design: ['pending', ''], 
      tasks: ['pending', '', 0, 0],
      exec: ['pending', '', 1]
    }
  });
  console.error(`[MCP] Initialized spec status for session ${session_id}`);
  
  // Use ask-goal.md template
  const template = await readTemplate('ask-goal.md', {
    session_id
  });
  
  return `# 🚀 VibeSpecs Development Workflow Started

## Current Stage: Goal Collection (1/5)

Welcome to the VibeSpecs development workflow! I'll help you complete the entire development process from requirements to code.

### Workflow Overview:
- [ ] 1. **Goal Collection** ← Current Stage
- [ ] 2. Requirements Gathering
- [ ] 3. Design Documentation
- [ ] 4. Task Planning
- [ ] 5. Task Execution

---

${template}

---

**Session Information**:
- Session ID: \`${session_id}\`

**Important**:
- Please discuss the feature goals with me thoroughly until the goals are completely clear
- **Only when you explicitly confirm the goals can you call** \`vibedev_specs_goal_confirmed\` tool
- **Never** call the next stage tool before the user **explicitly confirms the goals**`;
}