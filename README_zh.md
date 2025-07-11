# vibedevtools

一个 Bash 工具集合，致力于提升开发效率，持续收录团队常用的自动化小工具。

## 目录结构

- `bin/`：所有可执行工具脚本存放目录
- `README.md`：项目说明文档

## 当前工具

- `pr-review.sh`：智能 PR 审查脚本，结合 GitHub CLI 和 Gemini AI，支持多语言、多类型审查，自动生成结构化审查报告。

## 使用方法

1. 进入 `bin/` 目录，给脚本加上可执行权限：
   ```bash
   chmod +x bin/pr-review.sh
   ```
2. 运行工具：
   ```bash
   ./bin/pr-review.sh --help
   ```

## 未来规划

- 持续增加更多实用工具脚本
- 提供一键安装脚本和详细文档

---

欢迎贡献你的开发小工具！ 

## License

MIT 