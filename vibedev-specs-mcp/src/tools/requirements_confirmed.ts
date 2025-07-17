export interface RequirementsConfirmedParams {
  session_id: string;
  feature_name: string;
}

export async function requirementsConfirmed(
  params: RequirementsConfirmedParams
): Promise<string> {
  const { session_id, feature_name } = params;
  console.error(`[MCP] Requirements confirmed for feature: ${feature_name}`);
  
  return `# ✅ 需求收集完成

## 已生成需求文档：
📄 \`.vibedev/specs/${feature_name}/requirements.md\`

需求文档包含了完整的用户故事和EARS格式的验收标准。

---

## 下一阶段：设计文档 (3/5)

### 工作流进度：
- [x] 1. 目标收集 ✅
- [x] 2. **需求收集** ✅
- [ ] 3. **设计文档** ← 下一阶段
- [ ] 4. 任务规划
- [ ] 5. 任务执行

现在请调用 \`vibedev_specs_design_start\` 开始技术设计阶段。

**会话信息**：
- Session ID: \`${session_id}\`
- Feature Name: \`${feature_name}\`
- Requirements: ✅ 已完成`;
}