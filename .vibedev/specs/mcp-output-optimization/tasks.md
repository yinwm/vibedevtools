# Implementation Tasks: MCP Output Display Optimization

## Overview
Convert VibeSpecs MCP tools from server-side formatting to client-side formatting using YAML structured data.

## Implementation Tasks

### 1. Setup and Dependencies
- [x] 1.1 Add js-yaml dependency to MCP project
  - Install js-yaml package and @types/js-yaml
  - Update package.json with proper version constraints
  - Addresses Requirement 1.1: System SHALL define standard JSON output format (now YAML)

- [x] 1.2 Create YAML response utility module
  - Create `src/utils/yaml-response.ts` with helper functions for generating standardized YAML responses
  - Include type definitions for VibeSpecResponse interface
  - Add validation for required fields (vibespec_format, type, data)
  - Addresses Requirement 1.2: System SHALL include type field and data field

### 2. MCP Tool Output Format Migration
- [x] 2.1 Update list.ts to return YAML format
  - Modify `listSpecs()` function to return YAML with `vibespec_format: "v1"` and `type: "spec_list"`
  - Include summary calculation logic in data field
  - Add error handling with structured YAML error format
  - Addresses Requirement 1.4: System SHALL ensure all 4 target tools use standardized format

- [x] 2.2 Update get_status.ts to return YAML format  
  - Modify `getSpecStatus()` function to return YAML with `type: "spec_detail"`
  - Include taskProgress and fileSizes in structured data
  - Maintain all existing data but in YAML structure
  - Addresses Requirement 1.4: System SHALL ensure all 4 target tools use standardized format

- [x] 2.3 Update update_status.ts to return YAML format
  - Modify `updateSpecStatus()` function to return YAML with `type: "status_update"`
  - Structure confirmation data in YAML format
  - Keep user-friendly success messages but in structured format
  - Addresses Requirement 1.4: System SHALL ensure all 4 target tools use standardized format

- [x] 2.4 Update archive.ts to return YAML format
  - Modify `archiveSpec()` function to return YAML with `type: "archive_action"`
  - Structure archive/restore confirmation in YAML format
  - Include action details and timestamps in data field
  - Addresses Requirement 1.4: System SHALL ensure all 4 target tools use standardized format

### 3. TODO Progress Tracking Implementation
- [x] 3.1 Create TODO parser module
  - Create `src/utils/todo-parser.ts` with TODOParser class
  - Implement parsing for various TODO formats (- [ ], - [x], * [ ], etc.)
  - Add support for priority markers and line number tracking
  - Addresses Requirement 5.6: System SHALL handle various TODO formats

- [x] 3.2 Enhance task progress calculation
  - Extend existing `parseTaskProgress()` function to use new TODO parser
  - Calculate percentage, current task, and next tasks information
  - Add error handling for malformed or missing tasks.md files
  - Addresses Requirement 5.2: System SHALL calculate progress percentage based on completed vs total

- [x] 3.3 Integrate TODO progress into spec detail response
  - Update `getSpecStatus()` to include enhanced task progress data
  - Structure progress information in YAML data field
  - Add current task and next tasks to response
  - Addresses Requirement 5.3: System SHALL display current task information

### 4. Claude Code Formatting Detection and Processing
- [x] 4.1 Create format detection utility
  - Create detection logic that checks for `vibespec_format: "v1"` in YAML responses
  - Implement YAML parsing with error handling and fallback to raw output
  - Add type-based formatter selection mechanism
  - Addresses Requirement 2.1: System SHALL detect presence of vibespec_format identifier

- [x] 4.2 Implement spec list formatter
  - Create simple text formatter for spec list data
  - Use emojis for status indication (🔷, ✅, 📦, ⏸️)
  - Include summary line with counts and breakdown by status
  - Format: "• 🔷 spec-name (Status) - Updated X ago"
  - Addresses Requirement 3.3: System SHALL use simple emojis for status indication

- [x] 4.3 Implement spec detail formatter
  - Create detailed formatter for individual spec information
  - Include workflow progress with stage indicators
  - Display TODO-based progress with percentage and current task
  - Show document paths and file sizes
  - Addresses Requirement 4.2: System SHALL show workflow progress with clear stage indicators

- [x] 4.4 Implement status update and archive formatters
  - Create simple confirmation formatters for update and archive operations
  - Show key changed information and current status
  - Use consistent formatting style with other formatters
  - Addresses Requirement 6.3: System SHALL provide confirmation messages for successful operations

### 5. Error Handling and Fallback Implementation
- [ ] 5.1 Implement YAML parsing error handling
  - Add try-catch blocks around YAML parsing operations
  - Log parsing errors for debugging while maintaining user experience
  - Fallback to original response when parsing fails
  - Addresses Requirement 7.2: System SHALL handle malformed JSON gracefully (now YAML)

- [ ] 5.2 Create structured error response system
  - Update all MCP tools to return structured YAML errors when exceptions occur
  - Include error code, message, and helpful suggestions
  - Maintain consistent error format across all tools
  - Addresses Requirement 6.1: System SHALL format error messages clearly

- [ ] 5.3 Implement formatter fallback logic
  - Add fallback formatting when specific formatters fail
  - Create simple key-value display for unknown data structures
  - Ensure system never crashes due to formatting errors
  - Addresses Requirement 7.3: System SHALL fall back to original output format if detection fails

### 6. Testing and Validation
- [ ] 6.1 Create unit tests for YAML response generation
  - Test all 4 MCP tools return valid YAML with correct structure
  - Verify vibespec_format and type fields are present
  - Test error cases and malformed input handling
  - Addresses Requirement 7.5: System SHALL be testable and maintainable

- [ ] 6.2 Create unit tests for TODO parser
  - Test parsing of various TODO formats and edge cases
  - Verify progress calculation accuracy
  - Test handling of missing or empty tasks.md files
  - Addresses Requirement 5.7: System SHALL gracefully handle cases where tasks.md doesn't exist

- [ ] 6.3 Create unit tests for format detection and formatting
  - Test YAML detection logic with valid and invalid inputs
  - Verify each formatter produces expected output format
  - Test fallback behavior when detection or formatting fails
  - Addresses Requirement 2.4: System SHALL handle different content types with appropriate formatting

- [ ] 6.4 Create integration tests for end-to-end workflow
  - Test complete flow from MCP tool call to formatted output
  - Verify all data is preserved through the transformation
  - Test error scenarios and recovery mechanisms
  - Addresses Requirement 7.4: System SHALL maintain all existing functionality while adding new formatting layer

### 7. Performance and Optimization
- [ ] 7.1 Optimize YAML serialization and parsing
  - Profile YAML operations with large datasets
  - Implement caching for repeated parsing operations where appropriate
  - Ensure processing stays within 100ms requirement
  - Addresses Requirement 7.1: System SHALL process and format output within 100ms

- [ ] 7.2 Add performance monitoring and metrics
  - Add timing measurements for key operations
  - Log performance metrics for monitoring
  - Implement warnings for slow operations
  - Addresses Requirement 7.1: System SHALL process and format output within 100ms

### 8. Integration and Finalization
- [ ] 8.1 Update MCP server configuration
  - Ensure all tool handlers use new YAML response format
  - Verify no breaking changes to existing MCP interfaces
  - Test with both local and remote MCP configurations
  - Addresses Requirement 1.5: System SHALL maintain backward compatibility during transition

- [ ] 8.2 Create comprehensive integration tests
  - Test complete user workflows with new formatting system
  - Verify all existing functionality works with new output format
  - Test edge cases and error recovery scenarios
  - Addresses Requirement 7.4: System SHALL maintain all existing functionality

- [ ] 8.3 Update build and deployment configuration
  - Ensure js-yaml dependency is included in build process
  - Update any deployment scripts or configurations
  - Verify compatibility with existing development workflows
  - Addresses Requirement 7.5: System SHALL be testable and maintainable

## Success Criteria
- All MCP tools return structured YAML with vibespec_format identifier
- Claude Code automatically detects and formats VibeSpecs tool outputs  
- Users see clean, readable output without manual expansion
- TODO-based progress tracking works accurately
- All existing functionality preserved
- Zero breaking changes to user workflows
- Performance stays within acceptable limits (< 100ms formatting overhead)