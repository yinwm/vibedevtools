# Implementation Tasks: Spec Management Tools

## Overview
This task list breaks down the implementation of spec management tools into discrete, test-driven coding steps. Each task builds incrementally on previous work and references specific requirements.

## Tasks

### 1. Core Infrastructure Setup

- [x] 1.1 Create Status Manager module structure
  - Create `/src/utils/status-manager.ts` with TypeScript interfaces
  - Define `SpecStatus`, `SpecMetadata`, and related types from design
  - References: Req 5.2 (YAML format structure)

- [x] 1.2 Implement YAML file operations
  - Add `js-yaml` dependency to package.json
  - Create atomic write operations for YAML files
  - Implement read operations with error handling
  - References: Req 5.4 (atomic operations), Req 7.2 (YAML parsing)

- [ ] 1.3 Create Output Formatter module
  - Create `/src/utils/output-formatter.ts`
  - Implement box-drawing character constants
  - Add emoji mapping for status indicators
  - References: Req 8.1 (box-drawing and emojis)

### 2. Status Manager Implementation

- [ ] 2.1 Implement spec status loading
  - Create `loadSpecStatus()` function to read `.status.yaml` files
  - Handle missing files by inferring from .md files
  - Add validation for YAML structure
  - References: Req 2.1 (return comprehensive status), Req 6.3 (handle missing data)

- [ ] 2.2 Implement metadata index management
  - Create `loadAllSpecs()` to read `_metadata.yaml`
  - Implement `ensureMetadataIndex()` to create index if missing
  - Add sorting by updated date
  - References: Req 5.3 (metadata index), Req 8.1 (sort by date)

- [ ] 2.3 Implement status update operations
  - Create `updateSpecStatus()` with partial updates support
  - Implement `createSpecStatus()` for new specs
  - Auto-update timestamps on changes
  - References: Req 3.5 (auto-update timestamp), Req 5.4 (update both files)

- [ ] 2.4 Implement task progress parsing
  - Create `parseTaskProgress()` to analyze tasks.md files
  - Count total tasks and completed tasks (marked with [x])
  - Calculate completion percentage
  - References: Req 2.4 (parse tasks.md file)

### 3. MCP Tool Implementation

- [ ] 3.1 Implement vibedev_specs_list tool
  - Create `/src/tools/list.ts`
  - Add tool definition to server.ts
  - Implement status filtering logic
  - Format output using Output Formatter
  - References: Req 1.1-1.6 (list tool requirements)

- [ ] 3.2 Implement vibedev_specs_get_status tool
  - Create `/src/tools/get_status.ts`
  - Support lookup by session_id or feature_name
  - Include file size verification for documents
  - Format detailed output with progress bars
  - References: Req 2.1-2.5 (detail view requirements)

- [ ] 3.3 Implement vibedev_specs_update_status tool
  - Create `/src/tools/update_status.ts`
  - Add parameter validation
  - Support all update fields (status, stage, tasks, notes)
  - Return formatted confirmation
  - References: Req 3.1-3.5 (update tool requirements)

- [ ] 3.4 Implement vibedev_specs_archive tool
  - Create `/src/tools/archive.ts`
  - Support archive and restore actions
  - Update archived_at timestamp
  - Modify list filtering behavior
  - References: Req 4.1-4.5 (archive requirements)

### 4. Workflow Integration

- [ ] 4.1 Add status updates to existing workflow tools
  - Modify each workflow tool to call Status Manager on execution
  - Update stage status when moving between workflow steps
  - Ensure no breaking changes to tool signatures
  - References: Req 6.1 (existing tools continue functioning)

- [ ] 4.2 Implement graceful degradation
  - Add logic to infer status from existing files when .status.yaml missing
  - Check for requirements.md, design.md, tasks.md presence
  - Create status files on first management tool use
  - References: Req 6.3 (handle missing data gracefully)

### 5. Output Formatting Implementation

- [ ] 5.1 Implement spec list formatter
  - Create box-drawing table layout
  - Add emoji indicators for status and stages
  - Implement progress bar generation
  - Handle empty spec list case
  - References: Req 8.1-8.2 (terminal formatting)

- [ ] 5.2 Implement spec detail formatter
  - Create detailed box layout with sections
  - Format file paths with ellipsis
  - Add visual distinction for stale specs
  - Implement task list formatting
  - References: Req 8.3-8.5 (detail formatting)

- [ ] 5.3 Implement error formatter
  - Create consistent error message format
  - Include actionable suggestions
  - Format error codes clearly
  - References: Req 7.5 (error suggestions)

### 6. Migration and Documentation

- [ ] 6.1 Implement auto-migration logic
  - Scan existing specs without status files
  - Generate initial status from available documents
  - Create metadata index from discovered specs
  - References: Design migration strategy

- [ ] 6.2 Add comprehensive error handling
  - Implement all error categories from design
  - Add retry logic for file operations
  - Create helpful error messages
  - References: Req 7.1-7.5 (error handling)

## Completion Criteria

Each task is complete when:
- Code is written and integrated
- Unit tests pass
- Integration with existing code verified
- Output matches design specifications

---

Do the tasks look good?