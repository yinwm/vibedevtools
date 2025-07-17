# VibeSpecs MCP Server

An AI-powered development workflow MCP server that guides you from requirements to code implementation.

## Features

- **Complete Development Workflow**: From goal collection to task execution
- **AI-Powered Guidance**: Step-by-step instructions for each development phase
- **Template-Based**: Uses proven templates for requirements, design, and tasks
- **Claude Integration**: Seamlessly integrates with Claude Code

## Installation

### Using npx (Recommended)

```bash
# Always get the latest version
npx vibedev-specs-mcp@latest

# Or simply (will also get latest)
npx vibedev-specs-mcp
```

### Using npm

```bash
npm install -g vibedev-specs-mcp
vibedev-specs-mcp
```

## Usage

### With Claude Code

Add to your Claude Code MCP settings:

```json
{
  "mcpServers": {
    "vibedev-specs": {
      "command": "npx",
      "args": ["vibedev-specs-mcp@latest"],
      "env": {},
      "disabled": false
    }
  }
}
```

### Available Tools

1. **vibedev_specs_workflow_start** - Start the development workflow
2. **vibedev_specs_goal_confirmed** - Confirm feature goals
3. **vibedev_specs_requirements_start** - Begin requirements gathering
4. **vibedev_specs_requirements_confirmed** - Confirm requirements completion
5. **vibedev_specs_design_start** - Start design documentation
6. **vibedev_specs_design_confirmed** - Confirm design completion
7. **vibedev_specs_tasks_start** - Begin task planning
8. **vibedev_specs_tasks_confirmed** - Confirm task planning completion
9. **vibedev_specs_execute_start** - Start task execution

## Workflow Stages

1. **Goal Collection** - Define what you want to build
2. **Requirements Gathering** - Create detailed EARS-format requirements
3. **Design Documentation** - Technical architecture and design
4. **Task Planning** - Break down into executable tasks
5. **Task Execution** - Implement the code

## Project Structure

Generated projects follow this structure:

```
.vibedev/specs/{feature_name}/
├── requirements.md
├── design.md
└── tasks.md
```

## Example Usage

Here's a complete example of using the VibeSpecs workflow:

### 1. Start the Workflow
```
User: I want to build a user authentication feature
Assistant: Let me start the VibeSpecs workflow for you.
[calls vibedev_specs_workflow_start]
```

### 2. Goal Collection
```
Assistant: Welcome to VibeSpecs! Let's define your feature goals:

1. What specific authentication methods do you want to support?
2. Do you need social login (Google, GitHub, etc.)?
3. What user roles and permissions are required?

User: I need email/password login with JWT tokens, plus Google OAuth, and basic user/admin roles.

Assistant: Perfect! Let me confirm:
- Feature: User authentication system
- Methods: Email/password + Google OAuth
- Tokens: JWT-based
- Roles: User and Admin
- Feature name: "user-authentication"

Is this correct?
User: Yes, that's exactly what I need.

[calls vibedev_specs_goal_confirmed with feature_name="user-authentication"]
```

### 3. Requirements Gathering
```
Assistant: Great! Now let's gather detailed requirements.
[calls vibedev_specs_requirements_start]

[Assistant generates detailed EARS-format requirements in .vibedev/specs/user-authentication/requirements.md]

User: The requirements look comprehensive. Approved!

[calls vibedev_specs_requirements_confirmed]
```

### 4. Design Documentation
```
Assistant: Now let's create the technical design.
[calls vibedev_specs_design_start]

[Assistant creates detailed design document with architecture, components, data models, etc.]

User: Design looks good, proceed!

[calls vibedev_specs_design_confirmed]
```

### 5. Task Planning
```
Assistant: Let's break this down into executable tasks.
[calls vibedev_specs_tasks_start]

[Assistant creates numbered task list with priorities and dependencies]

User: Task breakdown is perfect!

[calls vibedev_specs_tasks_confirmed]
```

### 6. Task Execution
```
Assistant: Time to implement! Let's start coding.
[calls vibedev_specs_execute_start]

[Assistant begins implementing tasks one by one, following the plan]
```

### Generated Project Structure
```
.vibedev/specs/user-authentication/
├── requirements.md    # EARS-format requirements
├── design.md         # Technical architecture
└── tasks.md          # Implementation checklist
```

## Development

```bash
# Development mode
npm run dev

# Build
npm run build

# Test
npm test
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.