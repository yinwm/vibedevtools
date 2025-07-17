export interface TasksConfirmedParams {
  session_id: string;
  feature_name: string;
}

export async function tasksConfirmed(
  params: TasksConfirmedParams
): Promise<string> {
  const { session_id, feature_name } = params;
  console.error(`[MCP] Tasks confirmed for feature: ${feature_name}`);
  
  return `# ✅ 任务规划完成

## 已生成任务文档：
📄 \`.vibedev/specs/${feature_name}/tasks.md\`

任务文档包含了详细的开发任务列表，每个任务都有明确的描述、验收标准和执行顺序。

---

## 下一阶段：任务执行 (5/5)

### 工作流进度：
- [x] 1. 目标收集 ✅
- [x] 2. 需求收集 ✅
- [x] 3. 设计文档 ✅
- [x] 4. **任务规划** ✅
- [ ] 5. **任务执行** ← 最终阶段

现在请调用 \`vibedev_specs_execute_start\` 开始任务执行阶段。

**会话信息**：
- Session ID: \`${session_id}\`
- Feature Name: \`${feature_name}\`
- Requirements: ✅ 已完成
- Design: ✅ 已完成
- Tasks: ✅ 已完成`;
}