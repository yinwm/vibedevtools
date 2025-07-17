# VibeSpecs MCP 服务器

一个 AI 驱动的开发工作流 MCP 服务器，指导你从需求到代码实现的完整过程。

## 特性

- **完整的开发工作流**：从目标收集到任务执行
- **AI 驱动的指导**：每个开发阶段的逐步指导
- **基于模板**：使用经过验证的需求、设计和任务模板
- **Claude 集成**：与 Claude Code 无缝集成

## 安装

### 使用 npx（推荐）

```bash
# 总是获取最新版本
npx vibedev-specs-mcp@latest

# 或者简写（也会获取最新版本）
npx vibedev-specs-mcp
```

### 使用 npm

```bash
npm install -g vibedev-specs-mcp
vibedev-specs-mcp
```

## 使用方法

### 配置 Claude Code

在你的 Claude Code MCP 设置中添加：

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

### 可用工具

1. **vibedev_specs_workflow_start** - 启动开发工作流
2. **vibedev_specs_goal_confirmed** - 确认功能目标
3. **vibedev_specs_requirements_start** - 开始需求收集
4. **vibedev_specs_requirements_confirmed** - 确认需求收集完成
5. **vibedev_specs_design_start** - 开始设计文档
6. **vibedev_specs_design_confirmed** - 确认设计完成
7. **vibedev_specs_tasks_start** - 开始任务规划
8. **vibedev_specs_tasks_confirmed** - 确认任务规划完成
9. **vibedev_specs_execute_start** - 开始任务执行

## 工作流阶段

1. **目标收集** - 定义你想要构建的功能
2. **需求收集** - 创建详细的 EARS 格式需求
3. **设计文档** - 技术架构和设计
4. **任务规划** - 分解为可执行的任务
5. **任务执行** - 实现代码

## 使用示例

以下是使用 VibeSpecs 工作流的完整示例：

### 1. 启动工作流
```
用户：我想构建一个用户认证功能
助手：让我为你启动 VibeSpecs 工作流。
[调用 vibedev_specs_workflow_start]
```

### 2. 目标收集
```
助手：欢迎使用 VibeSpecs！让我们定义你的功能目标：

1. 你想支持哪些具体的认证方式？
2. 需要社交登录（Google、GitHub 等）吗？
3. 需要什么用户角色和权限？

用户：我需要邮箱/密码登录，JWT 令牌，还有 Google OAuth，以及基本的用户/管理员角色。

助手：完美！让我确认一下：
- 功能：用户认证系统
- 方式：邮箱/密码 + Google OAuth
- 令牌：基于 JWT
- 角色：用户和管理员
- 功能名称："user-authentication"

这样对吗？
用户：是的，这正是我需要的。

[调用 vibedev_specs_goal_confirmed，feature_name="user-authentication"]
```

### 3. 需求收集
```
助手：太好了！现在让我们收集详细的需求。
[调用 vibedev_specs_requirements_start]

[助手在 .vibedev/specs/user-authentication/requirements.md 中生成详细的 EARS 格式需求]

用户：需求看起来很全面。通过！

[调用 vibedev_specs_requirements_confirmed]
```

### 4. 设计文档
```
助手：现在让我们创建技术设计。
[调用 vibedev_specs_design_start]

[助手创建包含架构、组件、数据模型等的详细设计文档]

用户：设计看起来不错，继续！

[调用 vibedev_specs_design_confirmed]
```

### 5. 任务规划
```
助手：让我们将其分解为可执行的任务。
[调用 vibedev_specs_tasks_start]

[助手创建带有优先级和依赖关系的编号任务列表]

用户：任务分解很完美！

[调用 vibedev_specs_tasks_confirmed]
```

### 6. 任务执行
```
助手：开始实现！让我们开始编码。
[调用 vibedev_specs_execute_start]

[助手开始按计划逐一实现任务]
```

### 生成的项目结构
```
.vibedev/specs/user-authentication/
├── requirements.md    # EARS 格式需求
├── design.md         # 技术架构
└── tasks.md          # 实现清单
```

## 开发

```bash
# 开发模式
npm run dev

# 构建
npm run build

# 测试
npm test
```

## 许可证

MIT

## 贡献

欢迎贡献！请随时提交 Pull Request。