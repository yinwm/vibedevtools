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