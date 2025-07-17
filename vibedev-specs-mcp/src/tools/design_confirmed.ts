export interface DesignConfirmedParams {
  session_id: string;
  feature_name: string;
}

export async function designConfirmed(
  params: DesignConfirmedParams
): Promise<string> {
  const { session_id, feature_name } = params;
  console.error(`[MCP] Design confirmed for feature: ${feature_name}`);
  
  return `# ✅ 设计文档完成

## 已生成设计文档：
📄 \`.vibedev/specs/${feature_name}/design.md\`

设计文档包含了完整的技术架构、组件设计和实现方案。

---

## 下一阶段：任务规划 (4/5)

### 工作流进度：
- [x] 1. 目标收集 ✅
- [x] 2. 需求收集 ✅
- [x] 3. **设计文档** ✅
- [ ] 4. **任务规划** ← 下一阶段
- [ ] 5. 任务执行

现在请调用 \`vibedev_specs_tasks_start\` 开始任务规划阶段。

**会话信息**：
- Session ID: \`${session_id}\`
- Feature Name: \`${feature_name}\`
- Requirements: ✅ 已完成
- Design: ✅ 已完成`;
}