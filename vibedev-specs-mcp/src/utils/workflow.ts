// 工作流步骤定义
export interface WorkflowStep {
  step_number: number;
  name: string;
  description: string;
  tool: string;
  deliverable: string;
}

export interface WorkflowOverview {
  total_steps: number;
  current_step: string;  // 改为步骤名称
  current_step_number: number;  // 保留数字用于进度显示
  steps: WorkflowStep[];
}

// 步骤名称常量
export const STEP_NAMES = {
  GOAL_CONFIRMATION: '目标确认',
  REQUIREMENTS: '需求收集',
  DESIGN: '设计文档',
  TASKS: '任务规划',
  EXECUTION: '任务执行'
} as const;

// 工作流步骤常量
export const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    step_number: 1,
    name: STEP_NAMES.GOAL_CONFIRMATION,
    description: '通过对话明确功能开发目标',
    tool: 'vibedev_specs_workflow_start → vibedev_specs_goal_confirmed',
    deliverable: '明确的功能目标和 feature_name'
  },
  {
    step_number: 2,
    name: STEP_NAMES.REQUIREMENTS,
    description: '生成 EARS 格式的需求文档',
    tool: 'vibedev_specs_requirements_start → vibedev_specs_requirements_confirmed',
    deliverable: '.vibedev/specs/{feature_name}/requirements.md'
  },
  {
    step_number: 3,
    name: STEP_NAMES.DESIGN,
    description: '基于需求创建技术设计文档',
    tool: 'vibedev_specs_design_start → vibedev_specs_design_confirmed',
    deliverable: '.vibedev/specs/{feature_name}/design.md'
  },
  {
    step_number: 4,
    name: STEP_NAMES.TASKS,
    description: '生成可执行的开发任务列表',
    tool: 'vibedev_specs_tasks_start → vibedev_specs_tasks_confirmed',
    deliverable: '.vibedev/specs/{feature_name}/tasks.md'
  },
  {
    step_number: 5,
    name: STEP_NAMES.EXECUTION,
    description: '逐个执行开发任务',
    tool: 'vibedev_specs_execute_start',
    deliverable: '实际的代码实现'
  }
];

// 获取工作流概览的辅助函数
export function getWorkflowOverview(currentStepName: string): WorkflowOverview {
  const currentStep = WORKFLOW_STEPS.find(step => step.name === currentStepName);
  const stepNumber = currentStep?.step_number || 1;
  
  return {
    total_steps: WORKFLOW_STEPS.length,
    current_step: currentStepName,
    current_step_number: stepNumber,
    steps: WORKFLOW_STEPS
  };
}