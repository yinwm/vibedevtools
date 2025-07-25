/**
 * TODO Parser Module
 * 
 * Provides comprehensive parsing for various TODO formats in markdown files.
 * Supports multiple checkbox formats, priority markers, and hierarchical task structures.
 */

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  lineNumber: number;
  indentLevel: number;
  priority: TodoPriority;
  format: TodoFormat;
  parentId?: string;
  children: string[];
}

export interface TodoParseResult {
  items: TodoItem[];
  total: number;
  completed: number;
  percentage: number;
  currentTask?: TodoItem;
  nextTasks: TodoItem[];
  byPriority: {
    high: TodoItem[];
    medium: TodoItem[];
    low: TodoItem[];
  };
}

export enum TodoPriority {
  HIGH = 'high',
  MEDIUM = 'medium', 
  LOW = 'low'
}

export enum TodoFormat {
  DASH_CHECKBOX = 'dash_checkbox',    // - [ ]
  ASTERISK_CHECKBOX = 'asterisk_checkbox', // * [ ]
  PLUS_CHECKBOX = 'plus_checkbox',    // + [ ]
  NUMBERED_CHECKBOX = 'numbered_checkbox' // 1. [ ]
}

export class TodoParser {
  private static readonly TODO_PATTERNS = [
    // Standard formats with optional priority markers
    { format: TodoFormat.DASH_CHECKBOX, regex: /^(\s*)-\s*\[([x\s])\]\s*(?:\[([!]{1,2}|[HML])\])?\s*(.+)$/i },
    { format: TodoFormat.ASTERISK_CHECKBOX, regex: /^(\s*)\*\s*\[([x\s])\]\s*(?:\[([!]{1,2}|[HML])\])?\s*(.+)$/i },  
    { format: TodoFormat.PLUS_CHECKBOX, regex: /^(\s*)\+\s*\[([x\s])\]\s*(?:\[([!]{1,2}|[HML])\])?\s*(.+)$/i },
    { format: TodoFormat.NUMBERED_CHECKBOX, regex: /^(\s*)\d+\.\s*\[([x\s])\]\s*(?:\[([!]{1,2}|[HML])\])?\s*(.+)$/i }
  ];

  /**
   * Parse TODO items from markdown content
   */
  public static parse(content: string): TodoParseResult {
    const lines = content.split('\n');
    const items: TodoItem[] = [];
    const itemsByLine = new Map<number, TodoItem>();
    
    // First pass: parse all TODO items
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const todoItem = this.parseLine(line, i + 1);
      
      if (todoItem) {
        items.push(todoItem);
        itemsByLine.set(i + 1, todoItem);
      }
    }

    // Second pass: establish parent-child relationships
    this.buildHierarchy(items);

    // Calculate statistics
    const total = items.length;
    const completed = items.filter(item => item.completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Find current task (first incomplete task)
    const currentTask = items.find(item => !item.completed);

    // Find next 3 incomplete tasks after current
    const incompleteTasks = items.filter(item => !item.completed);
    const nextTasks = incompleteTasks.slice(1, 4); // Skip current, take next 3

    // Group by priority
    const byPriority = {
      high: items.filter(item => item.priority === TodoPriority.HIGH),
      medium: items.filter(item => item.priority === TodoPriority.MEDIUM),
      low: items.filter(item => item.priority === TodoPriority.LOW)
    };

    return {
      items,
      total,
      completed,
      percentage,
      currentTask,
      nextTasks,
      byPriority
    };
  }

  /**
   * Parse a single line for TODO format
   */
  private static parseLine(line: string, lineNumber: number): TodoItem | null {
    for (const pattern of this.TODO_PATTERNS) {
      const match = line.match(pattern.regex);
      if (match) {
        const [, indent, completionMark, priorityMark, text] = match;
        const indentLevel = this.calculateIndentLevel(indent);
        const completed = completionMark.toLowerCase() === 'x';
        const priority = this.parsePriority(priorityMark);
        
        return {
          id: `todo_${lineNumber}_${Date.now()}`,
          text: text.trim(),
          completed,
          lineNumber,
          indentLevel,
          priority,
          format: pattern.format,
          children: []
        };
      }
    }
    return null;
  }

  /**
   * Calculate indentation level (number of spaces / 2)
   */
  private static calculateIndentLevel(indent: string): number {
    return Math.floor(indent.length / 2);
  }

  /**
   * Parse priority from priority marker
   */
  private static parsePriority(priorityMark?: string): TodoPriority {
    if (!priorityMark) return TodoPriority.MEDIUM;
    
    const mark = priorityMark.toUpperCase();
    switch (mark) {
      case '!!':
      case '!':
      case 'H':
        return TodoPriority.HIGH;
      case 'L':
        return TodoPriority.LOW;
      case 'M':
      default:
        return TodoPriority.MEDIUM;
    }
  }

  /**
   * Build parent-child relationships based on indentation
   */
  private static buildHierarchy(items: TodoItem[]): void {
    const stack: TodoItem[] = [];

    for (const item of items) {
      // Pop items from stack that are at same or deeper level
      while (stack.length > 0 && stack[stack.length - 1].indentLevel >= item.indentLevel) {
        stack.pop();
      }

      // If stack has items, current item is child of top item
      if (stack.length > 0) {
        const parent = stack[stack.length - 1];
        item.parentId = parent.id;
        parent.children.push(item.id);
      }

      stack.push(item);
    }
  }

  /**
   * Get detailed progress information
   */
  public static getProgressDetails(result: TodoParseResult): {
    completionRate: number;
    estimatedRemainingTasks: number;
    highPriorityRemaining: number;
    currentTaskDetails?: {
      text: string;
      priority: TodoPriority;
      hasSubtasks: boolean;
      position: number;
    };
  } {
    const { items, completed, total, currentTask } = result;
    const completionRate = total > 0 ? completed / total : 0;
    const estimatedRemainingTasks = total - completed;
    const highPriorityRemaining = result.byPriority.high.filter(item => !item.completed).length;

    let currentTaskDetails;
    if (currentTask) {
      const position = items.findIndex(item => item.id === currentTask.id) + 1;
      currentTaskDetails = {
        text: currentTask.text,
        priority: currentTask.priority,
        hasSubtasks: currentTask.children.length > 0,
        position
      };
    }

    return {
      completionRate,
      estimatedRemainingTasks,
      highPriorityRemaining,
      currentTaskDetails
    };
  }

  /**
   * Validate TODO format and provide suggestions
   */
  public static validateFormat(content: string): {
    isValid: boolean;
    issues: string[];
    suggestions: string[];
  } {
    const lines = content.split('\n');
    const issues: string[] = [];
    const suggestions: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = i + 1;

      // Check for potential TODO patterns that look malformed
      // Only flag lines that start with list markers followed by brackets
      const potentialTodoPattern = /^\s*[\-\*\+\d]\s*\[/;
      if (potentialTodoPattern.test(line) && !this.parseLine(line, lineNumber)) {
        issues.push(`Line ${lineNumber}: Malformed TODO format`);
        suggestions.push(`Line ${lineNumber}: Use standard format like "- [ ] task description"`);
      }

      // Check for inconsistent indentation in actual TODO lines
      if (line.match(/^\s*[\-\*\+]\s*\[/)) {
        const indent = line.match(/^(\s*)/)?.[1] || '';
        if (indent.length % 2 !== 0) {
          issues.push(`Line ${lineNumber}: Inconsistent indentation (should be multiple of 2 spaces)`);
          suggestions.push(`Line ${lineNumber}: Use 2, 4, 6... spaces for indentation`);
        }
      }
    }

    return {
      isValid: issues.length === 0,
      issues,
      suggestions
    };
  }
}