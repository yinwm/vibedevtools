# Requirements Document: Spec Management Tools

## Introduction

The spec-management-tools feature enhances the vibedev-specs-mcp server by adding comprehensive spec management and viewing capabilities. This feature addresses the need for users to quickly understand the status of multiple specs, track long-term project progress, and seamlessly switch between different projects without losing context. The implementation will provide new MCP tools that complement the existing 9-tool workflow, enabling users to list all specs, view detailed information, and manage spec status.

## Requirements

### 1. Spec List Overview Tool

**User Story**: As a developer, I want to view a list of all my specs, so that I can quickly understand the status of all my projects.

**Acceptance Criteria**:
1. **WHEN** the user mentions keywords like "查看 spec 列表", "spec list", "show specs", or related phrases, **THEN** the system SHALL automatically invoke the spec list tool.
2. **WHERE** specs exist in the `.vibedev/specs/` directory, **THEN** the tool SHALL display all discovered specs with their metadata.
3. **IF** no specs are found, **THEN** the tool SHALL return a friendly message indicating no specs exist yet.
4. **WHILE** listing specs, the tool SHALL show:
   - Session ID
   - Feature name
   - Current stage (Goal Collection, Requirements, Design, Tasks, or Execution)
   - Overall status (in_progress, completed, archived)
   - Created date
   - Last updated date
5. **WHEN** a status_filter parameter is provided (all, in_progress, completed, archived), **THEN** the tool SHALL only return specs matching that status.
6. **UBIQUITOUS** the tool SHALL format the output as a markdown table for better readability.

### 2. Spec Detail View Tool

**User Story**: As a developer, I want to view detailed information about a specific spec, so that I can understand its current progress and access its documents.

**Acceptance Criteria**:
1. **WHEN** the user requests details for a specific spec by session_id or feature_name, **THEN** the tool SHALL return comprehensive status information.
2. **WHERE** the spec exists, the tool SHALL display:
   - Basic metadata (session_id, feature_name, dates)
   - Current workflow stage and status
   - Progress for each stage (completed/in_progress/pending)
   - File paths to generated documents (requirements.md, design.md, tasks.md)
   - For task execution stage: current task number and total tasks
3. **IF** the spec doesn't exist, **THEN** the tool SHALL return a clear error message.
4. **WHILE** in task execution stage, the tool SHALL parse the tasks.md file to show:
   - Total number of tasks
   - Number of completed tasks (marked with [x])
   - Current task being executed
   - Completion percentage
5. **WHEN** documents exist, **THEN** the tool SHALL verify their presence and include file sizes.

### 3. Spec Status Update Tool

**User Story**: As a developer, I want to manually update spec status, so that I can correct information or mark progress outside the workflow.

**Acceptance Criteria**:
1. **WHEN** the user wants to update spec status, **THEN** they can call the update tool with specific parameters.
2. **WHERE** valid parameters are provided, the tool SHALL update:
   - Overall spec status (in_progress, completed, archived, paused)
   - Current stage name
   - Task completion count
   - Custom notes or comments
3. **IF** the spec doesn't exist, **THEN** the tool SHALL return an error.
4. **WHILE** updating, the tool SHALL validate input parameters and maintain data consistency.
5. **UBIQUITOUS** the tool SHALL update the `updated` timestamp automatically.

### 4. Spec Archive Tool

**User Story**: As a developer, I want to archive completed or abandoned specs, so that my active list remains clean and focused.

**Acceptance Criteria**:
1. **WHEN** a spec is marked for archival, **THEN** the tool SHALL update its status to "archived".
2. **WHERE** archived specs exist, they SHALL be excluded from default list views unless specifically requested.
3. **IF** an archived spec is reactivated, **THEN** the tool SHALL restore it to "in_progress" status.
4. **WHILE** archiving, the tool SHALL preserve all existing data and documents.
5. **UBIQUITOUS** archived specs SHALL include an "archived_at" timestamp.

### 5. Status Persistence System

**User Story**: As a developer, I want spec status to be stored efficiently, so that it consumes minimal tokens and disk space.

**Acceptance Criteria**:
1. **WHEN** any workflow tool is called, **THEN** the system SHALL automatically update or create a `.status.yaml` file in the spec directory.
2. **WHERE** status changes occur, the `.status.yaml` file SHALL use a compact format:
   ```yaml
   sid: session_id
   name: feature_name
   created: ISO_timestamp
   updated: ISO_timestamp
   stage: current_stage_name
   status: overall_status
   stages:
     goal: [status, timestamp]
     req: [status, timestamp]
     design: [status, timestamp]
     tasks: [status, timestamp, total, completed]
     exec: [status, timestamp, current_task]
   ```
3. **IF** the `.vibedev/specs/_metadata.yaml` index file doesn't exist, **THEN** the system SHALL create it automatically.
4. **WHILE** updating status, the system SHALL:
   - Use atomic file operations to prevent corruption
   - Validate YAML structure before writing
   - Update both spec-specific status and global metadata index
5. **UBIQUITOUS** all timestamps SHALL use ISO 8601 format in UTC.

### 6. Backward Compatibility

**User Story**: As a user, I want the new tools to work seamlessly with existing workflow tools, so that my current processes aren't disrupted.

**Acceptance Criteria**:
1. **WHEN** new management tools are added, **THEN** all existing 9 workflow tools SHALL continue to function without modification.
2. **WHERE** existing tools create files, **THEN** new tools SHALL read these files without requiring format changes.
3. **IF** status files don't exist for older specs, **THEN** the management tools SHALL gracefully handle missing data.
4. **WHILE** new tools operate, they SHALL NOT interfere with the existing workflow execution.

### 7. Error Handling and Edge Cases

**User Story**: As a developer, I want the tools to handle errors gracefully, so that I can understand and resolve issues quickly.

**Acceptance Criteria**:
1. **WHEN** file system operations fail, **THEN** tools SHALL return descriptive error messages.
2. **WHERE** YAML parsing fails, **THEN** tools SHALL attempt recovery or provide clear error details.
3. **IF** required directories don't exist, **THEN** tools SHALL either create them or guide the user.
4. **WHILE** handling concurrent access, tools SHALL implement proper file locking or handle conflicts gracefully.
5. **UBIQUITOUS** all error messages SHALL include actionable suggestions for resolution.

### 8. User Experience

**User Story**: As a developer, I want intuitive and informative output, so that I can quickly understand spec status.

**Acceptance Criteria**:
1. **WHEN** listing specs, **THEN** output SHALL use box-drawing characters and emojis for better terminal visibility:
   - Use ╔═╗╚╝║╠╣╟╢ for borders
   - Use 🔷🔶✅🔸 for status indicators
   - Use 🚀📋📐✨ for stage indicators
2. **WHERE** progress is shown, **THEN** visual progress bars using █░ characters SHALL be used.
3. **IF** specs are stale (>30 days without updates), **THEN** they SHALL be visually distinguished with 🕐 icon.
4. **WHILE** displaying file paths, **THEN** they SHALL be shown in a shortened format with ellipsis.
5. **UBIQUITOUS** all output SHALL use consistent box layouts with proper spacing and alignment.

## Success Criteria

1. Users can view all their specs at a glance within 2 seconds
2. Switching between projects requires only a single command
3. No data loss occurs when interrupting and resuming workflows
4. New tools integrate seamlessly without breaking existing workflows
5. Status information remains accurate across multiple sessions

## Technical Constraints

1. All data must be stored locally in the file system
2. Must maintain compatibility with existing MCP tool structure
3. Performance must remain acceptable with 100+ specs
4. File operations must be atomic to prevent corruption
5. Must work across different operating systems (Windows, macOS, Linux)

---

Do the requirements look good? If so, we can move on to the design.