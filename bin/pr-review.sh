#!/bin/bash

# vibedevtools 工具集 - pr-review.sh
# 所有工具请统一放在 bin/ 目录，便于管理和扩展
# 本脚本为智能 PR 审查工具，结合 gh CLI 和 Gemini AI

set -e

# 配置
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
REVIEW_PROMPT_PATH="/tmp/pr-review-prompt-$$"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 默认语言
DEFAULT_LANG="en"
CURRENT_LANG="en"

# 设置语言
set_language() {
    CURRENT_LANG="$1"
}

# 多语言文本获取函数
get_text() {
    local key="$1"
    
    case "$CURRENT_LANG" in
        "zh"|"zh-cn"|"chinese")
            case "$key" in
                "HELP_TITLE") echo "通用 PR 审查脚本" ;;
                "HELP_USAGE") echo "用法" ;;
                "HELP_COMMANDS") echo "命令" ;;
                "HELP_OPTIONS") echo "选项" ;;
                "HELP_EXAMPLES") echo "示例" ;;
                "LIST_COMMAND") echo "列出所有开放的 PR" ;;
                "HELP_OPTION") echo "显示帮助信息" ;;
                "TYPE_OPTION") echo "审查类型" ;;
                "OUTPUT_OPTION") echo "输出到文件" ;;
                "VERBOSE_OPTION") echo "详细输出" ;;
                "LANG_OPTION") echo "输出语言" ;;
                "LIST_PRS") echo "📋 列出所有开放的 PR..." ;;
                "NO_PRS") echo "没有开放的 PR" ;;
                "FOUND_PRS") echo "共找到" ;;
                "PRS_COUNT") echo "个开放的 PR" ;;
                "USAGE_HINT") echo "使用方法:" ;;
                "REVIEW_PR") echo "审查指定 PR" ;;
                "ERROR_GH_MISSING") echo "错误: 未安装 GitHub CLI (gh)" ;;
                "ERROR_GEMINI_MISSING") echo "错误: 未安装 Gemini CLI" ;;
                "ERROR_GH_AUTH") echo "错误: GitHub CLI 未认证" ;;
                "GH_AUTH_HINT") echo "请运行: gh auth login" ;;
                "GETTING_PR_INFO") echo "📋 获取 PR" ;;
                "BASIC_INFO") echo "基本信息..." ;;
                "GET_DETAILS") echo "⏳ 获取 PR 详情..." ;;
                "GET_STATS") echo "⏳ 获取变更统计..." ;;
                "GET_FILES") echo "⏳ 获取文件列表..." ;;
                "GET_DIFF") echo "⏳ 获取代码差异..." ;;
                "PR_INFO_SUCCESS") echo "✅ PR 信息获取成功:" ;;
                "TITLE") echo "标题" ;;
                "AUTHOR") echo "作者" ;;
                "STATE") echo "状态" ;;
                "CHANGES") echo "变更" ;;
                "FILE_COUNT") echo "文件数" ;;
                "ANALYZING") echo "🤖 正在使用 AI 进行分析..." ;;
                "REVIEW_COMPLETE") echo "✅ PR 审查完成！" ;;
                "REVIEW_SAVED") echo "✅ 审查结果已保存到:" ;;
                "ERROR_PR_NOT_FOUND") echo "错误: PR" ;;
                "NOT_EXIST") echo "不存在" ;;
                "ERROR_NO_PR_NUMBER") echo "错误: 请指定 PR 编号" ;;
                "ERROR_UNKNOWN_OPTION") echo "错误: 未知选项" ;;
                "ERROR_EXTRA_PARAM") echo "错误: 多余的参数" ;;
                "ERROR_INVALID_TYPE") echo "错误: 无效的审查类型" ;;
                "SUPPORTED_TYPES") echo "支持的类型: architecture, security, performance, full" ;;
                "STARTING_REVIEW") echo "🚀 开始 PR" ;;
                "REVIEW_OF") echo "的" ;;
                "REVIEW_TYPE") echo "审查..." ;;
                *) echo "$key" ;;
            esac
            ;;
        "ja"|"japanese")
            case "$key" in
                "HELP_TITLE") echo "汎用 PR レビュースクリプト" ;;
                "HELP_USAGE") echo "使用方法" ;;
                "HELP_COMMANDS") echo "コマンド" ;;
                "HELP_OPTIONS") echo "オプション" ;;
                "HELP_EXAMPLES") echo "例" ;;
                "LIST_COMMAND") echo "すべての開いているPRをリスト" ;;
                "HELP_OPTION") echo "ヘルプ情報を表示" ;;
                "TYPE_OPTION") echo "レビュータイプ" ;;
                "OUTPUT_OPTION") echo "ファイルに出力" ;;
                "VERBOSE_OPTION") echo "詳細出力" ;;
                "LANG_OPTION") echo "出力言語" ;;
                "LIST_PRS") echo "📋 すべての開いているPRをリスト中..." ;;
                "NO_PRS") echo "開いているPRがありません" ;;
                "FOUND_PRS") echo "見つかりました" ;;
                "PRS_COUNT") echo "個の開いているPR" ;;
                "USAGE_HINT") echo "使用方法:" ;;
                "REVIEW_PR") echo "指定されたPRをレビュー" ;;
                "ANALYZING") echo "🤖 AIで分析中..." ;;
                "REVIEW_COMPLETE") echo "✅ PRレビュー完了！" ;;
                *) echo "$key" ;;
            esac
            ;;
        *)  # Default to English
            case "$key" in
                "HELP_TITLE") echo "Universal PR Review Script" ;;
                "HELP_USAGE") echo "Usage" ;;
                "HELP_COMMANDS") echo "Commands" ;;
                "HELP_OPTIONS") echo "Options" ;;
                "HELP_EXAMPLES") echo "Examples" ;;
                "LIST_COMMAND") echo "List all open PRs" ;;
                "HELP_OPTION") echo "Show help information" ;;
                "TYPE_OPTION") echo "Review type" ;;
                "OUTPUT_OPTION") echo "Output to file" ;;
                "VERBOSE_OPTION") echo "Verbose output" ;;
                "LANG_OPTION") echo "Output language" ;;
                "LIST_PRS") echo "📋 Listing all open PRs..." ;;
                "NO_PRS") echo "No open PRs found" ;;
                "FOUND_PRS") echo "Found" ;;
                "PRS_COUNT") echo "open PRs" ;;
                "USAGE_HINT") echo "Usage:" ;;
                "REVIEW_PR") echo "Review specified PR" ;;
                "ERROR_GH_MISSING") echo "Error: GitHub CLI (gh) not installed" ;;
                "ERROR_GEMINI_MISSING") echo "Error: Gemini CLI not installed" ;;
                "ERROR_GH_AUTH") echo "Error: GitHub CLI not authenticated" ;;
                "GH_AUTH_HINT") echo "Please run: gh auth login" ;;
                "GETTING_PR_INFO") echo "📋 Getting PR" ;;
                "BASIC_INFO") echo "basic info..." ;;
                "GET_DETAILS") echo "⏳ Getting PR details..." ;;
                "GET_STATS") echo "⏳ Getting change statistics..." ;;
                "GET_FILES") echo "⏳ Getting file list..." ;;
                "GET_DIFF") echo "⏳ Getting code diff..." ;;
                "PR_INFO_SUCCESS") echo "✅ PR information retrieved successfully:" ;;
                "TITLE") echo "Title" ;;
                "AUTHOR") echo "Author" ;;
                "STATE") echo "State" ;;
                "CHANGES") echo "Changes" ;;
                "FILE_COUNT") echo "File count" ;;
                "ANALYZING") echo "🤖 Analyzing with AI..." ;;
                "REVIEW_COMPLETE") echo "✅ PR review completed!" ;;
                "REVIEW_SAVED") echo "✅ Review results saved to:" ;;
                "ERROR_PR_NOT_FOUND") echo "Error: PR" ;;
                "NOT_EXIST") echo "does not exist" ;;
                "ERROR_NO_PR_NUMBER") echo "Error: Please specify PR number" ;;
                "ERROR_UNKNOWN_OPTION") echo "Error: Unknown option" ;;
                "ERROR_EXTRA_PARAM") echo "Error: Extra parameter" ;;
                "ERROR_INVALID_TYPE") echo "Error: Invalid review type" ;;
                "SUPPORTED_TYPES") echo "Supported types: architecture, security, performance, full" ;;
                "STARTING_REVIEW") echo "🚀 Starting PR" ;;
                "REVIEW_OF") echo "" ;;
                "REVIEW_TYPE") echo "review..." ;;
                *) echo "$key" ;;
            esac
            ;;
    esac
}

# 帮助信息
show_help() {
    echo "$(get_text "HELP_TITLE")"
    echo ""
    echo "$(get_text "HELP_USAGE"): $0 [OPTIONS] [PR_NUMBER|COMMAND]"
    echo ""
    echo "$(get_text "HELP_COMMANDS"):"
    echo "  list                $(get_text "LIST_COMMAND")"
    echo ""
    echo "$(get_text "HELP_OPTIONS"):"
    echo "  -h, --help          $(get_text "HELP_OPTION")"
    echo "  -t, --type TYPE     $(get_text "TYPE_OPTION") (architecture|security|performance|full)"
    echo "  -o, --output FILE   $(get_text "OUTPUT_OPTION")"
    echo "  -v, --verbose       $(get_text "VERBOSE_OPTION")"
    echo "  -l, --lang LANG     $(get_text "LANG_OPTION") (en|zh|ja, default: en)"
    echo ""
    echo "$(get_text "HELP_EXAMPLES"):"
    echo "  $0 list                    # $(get_text "LIST_COMMAND")"
    echo "  $0 1                       # $(get_text "REVIEW_PR") #1"
    echo "  $0 --type security 1       # Security review"
    echo "  $0 --lang zh 1             # Review in Chinese"
    echo "  $0 -o review.md 1          # $(get_text "OUTPUT_OPTION")"
    echo ""
}

# 列出所有开放的 PR
list_prs() {
    echo -e "${BLUE}$(get_text "LIST_PRS")${NC}"
    echo ""
    
    # 检查是否有开放的 PR
    local pr_count
    pr_count=$(gh pr list --state open --json number | jq '. | length')
    
    if [ "$pr_count" -eq 0 ]; then
        echo -e "${YELLOW}$(get_text "NO_PRS")${NC}"
        return
    fi
    
    # 显示 PR 列表
    gh pr list --state open
    
    echo ""
    echo -e "${GREEN}$(get_text "FOUND_PRS") $pr_count $(get_text "PRS_COUNT")${NC}"
    echo ""
    echo -e "${BLUE}$(get_text "USAGE_HINT")${NC}"
    echo "  $0 <PR_NUMBER>    # $(get_text "REVIEW_PR")"
    echo ""
}

# 检查依赖
check_dependencies() {
    if ! command -v gh &> /dev/null; then
        echo -e "${RED}$(get_text "ERROR_GH_MISSING")${NC}"
        echo "Install: https://cli.github.com/"
        exit 1
    fi
    
    if ! command -v gemini &> /dev/null; then
        echo -e "${RED}$(get_text "ERROR_GEMINI_MISSING")${NC}"
        echo "Install: npx @google/gemini-cli"
        exit 1
    fi
    
    # 检查 gh 认证
    if ! gh auth status &> /dev/null; then
        echo -e "${RED}$(get_text "ERROR_GH_AUTH")${NC}"
        echo "$(get_text "GH_AUTH_HINT")"
        exit 1
    fi
}

# 获取 PR 信息
get_pr_info() {
    local pr_number="$1"
    
    echo -e "${BLUE}$(get_text "GETTING_PR_INFO") #${pr_number} $(get_text "BASIC_INFO")${NC}"
    
    # 检查 PR 是否存在
    if ! gh pr view "$pr_number" --json title &> /dev/null; then
        echo -e "${RED}$(get_text "ERROR_PR_NOT_FOUND") #${pr_number} $(get_text "NOT_EXIST")${NC}"
        exit 1
    fi
    
    # 分步获取信息，避免卡住
    echo -e "${BLUE}$(get_text "GET_DETAILS")${NC}"
    PR_TITLE=$(gh pr view "$pr_number" --json title -q '.title')
    PR_AUTHOR=$(gh pr view "$pr_number" --json author -q '.author.login')
    PR_STATE=$(gh pr view "$pr_number" --json state -q '.state')
    
    echo -e "${BLUE}$(get_text "GET_STATS")${NC}"
    local stats=$(gh pr view "$pr_number" --json additions,deletions)
    PR_ADDITIONS=$(echo "$stats" | jq -r '.additions')
    PR_DELETIONS=$(echo "$stats" | jq -r '.deletions')
    
    echo -e "${BLUE}$(get_text "GET_FILES")${NC}"
    PR_FILES=$(gh pr view "$pr_number" --json files -q '.files[].path' | head -20)  # 限制文件数
    
    echo -e "${BLUE}$(get_text "GET_DIFF")${NC}"
    # 限制 diff 大小，避免卡住 (macOS 没有 timeout 命令)
    PR_DIFF=$(gh pr diff "$pr_number" || echo "# Diff retrieval failed")
    
    if [ "$VERBOSE" = true ]; then
        echo -e "${GREEN}$(get_text "PR_INFO_SUCCESS")${NC}"
        echo "  $(get_text "TITLE"): $PR_TITLE"
        echo "  $(get_text "AUTHOR"): $PR_AUTHOR"
        echo "  $(get_text "STATE"): $PR_STATE"
        echo "  $(get_text "CHANGES"): +$PR_ADDITIONS -$PR_DELETIONS"
        echo "  $(get_text "FILE_COUNT"): $(echo "$PR_FILES" | wc -l)"
        echo "  Diff lines: $(echo "$PR_DIFF" | wc -l)"
    fi
}

# 生成通用审查提示
generate_review_prompt() {
    local review_type="$1"
    local lang="$2"
    
    # 根据语言生成不同的提示
    case "$lang" in
        "zh"|"zh-cn"|"chinese")
            cat > "$REVIEW_PROMPT_PATH" << 'EOF'
# PR 代码审查专家

你是一个专业的代码审查专家，需要对以下 PR 进行深入分析。

## 审查重点

### 🏗️ 架构设计
- 检查代码结构和设计模式
- 验证模块化和职责分离
- 检查接口设计合理性
- 确保代码可维护性

### 🔒 安全性
- 检查是否有硬编码的秘钥或敏感信息
- 验证输入验证和数据清理
- 检查认证和授权逻辑
- 识别潜在的安全漏洞

### 📊 性能优化
- 检查是否有性能瓶颈
- 验证算法效率
- 检查资源使用情况
- 确保适当的缓存策略

### 🧪 代码质量
- 检查代码可读性和一致性
- 验证错误处理是否完善
- 检查是否遵循最佳实践
- 确保适当的测试覆盖

## 输出格式

请按以下格式提供审查结果：

### 📋 **PR 概览**
- 主要变更内容
- 影响范围评估
- 复杂度分析

### ✅ **优点**
- 列出代码的优秀之处
- 亮点功能说明

### ⚠️ **问题和建议**
按优先级分类：
EOF
            ;;
        "ja"|"japanese")
            cat > "$REVIEW_PROMPT_PATH" << 'EOF'
# PR コードレビュー専門家

あなたは専門的なコードレビュー専門家として、以下のPRを詳細に分析してください。

## レビューポイント

### 🏗️ アーキテクチャ設計
- コード構造とデザインパターンをチェック
- モジュール化と責任分離を検証
- インターフェース設計の妥当性をチェック
- コードの保守性を確保

### 🔒 セキュリティ
- ハードコードされた秘密情報の有無をチェック
- 入力検証とデータクリーニングを検証
- 認証と認可ロジックをチェック
- 潜在的なセキュリティ脆弱性を特定

### 📊 パフォーマンス最適化
- パフォーマンスボトルネックの有無をチェック
- アルゴリズムの効率性を検証
- リソース使用状況をチェック
- 適切なキャッシュ戦略を確保

### 🧪 コード品質
- コードの可読性と一貫性をチェック
- エラーハンドリングの完全性を検証
- ベストプラクティスの遵守をチェック
- 適切なテストカバレッジを確保

## 出力フォーマット

以下の形式でレビュー結果を提供してください：

### 📋 **PR 概要**
- 主な変更内容
- 影響範囲の評価
- 複雑度分析

### ✅ **優れた点**
- コードの優秀な箇所を列挙
- ハイライト機能の説明

### ⚠️ **問題と提案**
優先度別に分類：
EOF
            ;;
        *)  # Default to English
            cat > "$REVIEW_PROMPT_PATH" << 'EOF'
# PR Code Review Expert

You are a professional code review expert who needs to conduct in-depth analysis of the following PR.

## Review Focus Areas

### 🏗️ Architecture Design
- Check code structure and design patterns
- Verify modularization and separation of concerns
- Check interface design rationality
- Ensure code maintainability

### 🔒 Security
- Check for hardcoded secrets or sensitive information
- Verify input validation and data sanitization
- Check authentication and authorization logic
- Identify potential security vulnerabilities

### 📊 Performance Optimization
- Check for performance bottlenecks
- Verify algorithm efficiency
- Check resource usage
- Ensure appropriate caching strategies

### 🧪 Code Quality
- Check code readability and consistency
- Verify completeness of error handling
- Check adherence to best practices
- Ensure appropriate test coverage

## Output Format

Please provide review results in the following format:

### 📋 **PR Overview**
- Main changes content
- Impact scope assessment
- Complexity analysis

### ✅ **Strengths**
- List excellent aspects of the code
- Highlight feature descriptions

### ⚠️ **Issues and Suggestions**
Categorized by priority:
EOF
            ;;
    esac
    
    # 为每种语言添加共同的结尾部分
    case "$lang" in
        "zh"|"zh-cn"|"chinese")
            cat >> "$REVIEW_PROMPT_PATH" << 'EOF'
- 🔴 **严重问题** (必须修复)
- 🟡 **一般问题** (建议修复)
- 🔵 **优化建议** (可选)

### 🔍 **详细分析**
针对关键文件的具体评审

### 📝 **总结**
- 总体质量评估 (1-10分)
- 合并建议 (批准/条件批准/拒绝)
- 后续优化建议

用中文回答，保持专业且建设性的语调。
EOF
            ;;
        "ja"|"japanese")
            cat >> "$REVIEW_PROMPT_PATH" << 'EOF'
- 🔴 **重大な問題** (修正必須)
- 🟡 **一般的な問題** (修正推奨)
- 🔵 **最適化提案** (オプション)

### 🔍 **詳細分析**
重要ファイルの具体的なレビュー

### 📝 **まとめ**
- 全体的品質評価 (1-10点)
- マージ推奨 (承認/条件付き承認/拒否)
- 今後の最適化提案

日本語で回答し、専門的で建設的な口調を保ってください。
EOF
            ;;
        *)
            cat >> "$REVIEW_PROMPT_PATH" << 'EOF'
- 🔴 **Critical Issues** (must fix)
- 🟡 **General Issues** (recommended fix)
- 🔵 **Optimization Suggestions** (optional)

### 🔍 **Detailed Analysis**
Specific review for key files

### 📝 **Summary**
- Overall quality assessment (1-10 score)
- Merge recommendation (approve/conditional approve/reject)
- Future optimization suggestions

Please respond in English with a professional and constructive tone.
EOF
            ;;
    esac
    
    # 根据审查类型添加重点说明（多语言）
    case "$review_type" in
        "architecture")
            case "$lang" in
                "zh"|"zh-cn"|"chinese")
                    echo -e "\n## 本次审查重点：架构设计和代码结构" >> "$REVIEW_PROMPT_PATH"
                    ;;
                "ja"|"japanese")
                    echo -e "\n## 今回のレビュー重点：アーキテクチャ設計とコード構造" >> "$REVIEW_PROMPT_PATH"
                    ;;
                *)
                    echo -e "\n## Review Focus: Architecture design and code structure" >> "$REVIEW_PROMPT_PATH"
                    ;;
            esac
            ;;
        "security")
            case "$lang" in
                "zh"|"zh-cn"|"chinese")
                    echo -e "\n## 本次审查重点：安全性和数据保护" >> "$REVIEW_PROMPT_PATH"
                    ;;
                "ja"|"japanese")
                    echo -e "\n## 今回のレビュー重点：セキュリティとデータ保護" >> "$REVIEW_PROMPT_PATH"
                    ;;
                *)
                    echo -e "\n## Review Focus: Security and data protection" >> "$REVIEW_PROMPT_PATH"
                    ;;
            esac
            ;;
        "performance")
            case "$lang" in
                "zh"|"zh-cn"|"chinese")
                    echo -e "\n## 本次审查重点：性能优化和资源使用" >> "$REVIEW_PROMPT_PATH"
                    ;;
                "ja"|"japanese")
                    echo -e "\n## 今回のレビュー重点：パフォーマンス最適化とリソース使用" >> "$REVIEW_PROMPT_PATH"
                    ;;
                *)
                    echo -e "\n## Review Focus: Performance optimization and resource usage" >> "$REVIEW_PROMPT_PATH"
                    ;;
            esac
            ;;
        "full")
            case "$lang" in
                "zh"|"zh-cn"|"chinese")
                    echo -e "\n## 本次审查重点：全面审查（架构、安全、性能、代码质量）" >> "$REVIEW_PROMPT_PATH"
                    ;;
                "ja"|"japanese")
                    echo -e "\n## 今回のレビュー重点：包括的レビュー（アーキテクチャ、セキュリティ、パフォーマンス、コード品質）" >> "$REVIEW_PROMPT_PATH"
                    ;;
                *)
                    echo -e "\n## Review Focus: Comprehensive review (architecture, security, performance, code quality)" >> "$REVIEW_PROMPT_PATH"
                    ;;
            esac
            ;;
    esac
}

# 执行 Gemini 分析
run_gemini_analysis() {
    local pr_number="$1"
    
    echo -e "${BLUE}$(get_text "ANALYZING")${NC}"
    
    # 创建临时文件来存储完整上下文
    local temp_context_file="/tmp/pr-review-context-$$"
    
    # 构建简化的上下文，避免内容过大
    {
        # 添加审查提示
        cat "$REVIEW_PROMPT_PATH"
        echo -e "\n---\n"
        
        # 添加 PR 基本信息
        echo "# PR 信息"
        echo ""
        echo "**标题**: $PR_TITLE"
        echo "**作者**: $PR_AUTHOR"
        echo "**变更**: +$PR_ADDITIONS -$PR_DELETIONS lines"
        echo ""
        
        # 添加变更文件列表
        echo "## 变更文件"
        echo ""
        echo "$PR_FILES" | head -10 | while read -r file; do
            if [ -n "$file" ]; then
                echo "- $file"
            fi
        done
        echo ""
        
        # 添加精简的代码差异（只显示关键部分）
        echo "## 代码差异摘要"
        echo ""
        echo '```diff'
        echo "$PR_DIFF" | head -200  # 只显示前200行
        echo '```'
        
        # 如果 diff 很大，添加说明
        local diff_lines=$(echo "$PR_DIFF" | wc -l | tr -d ' ')
        if [ "$diff_lines" -gt 200 ]; then
            echo ""
            echo "注：diff 内容较大，仅显示前 200 行。总共约 $diff_lines 行变更。"
        fi
        
    } > "$temp_context_file"
    
    # 使用 gemini 进行分析
    local result
    result=$(gemini -p "$(cat "$temp_context_file")" 2>/dev/null)
    
    # 清理临时文件
    rm -f "$temp_context_file"
    
    echo "$result"
}

# 主函数
main() {
    local pr_number=""
    local review_type="full"
    local output_file=""
    local lang="$DEFAULT_LANG"
    local verbose=false
    
    VERBOSE=false
    
    # 第一阶段：解析所有选项参数和收集命令/PR号
    local commands=()
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                set_language "$lang"
                show_help
                exit 0
                ;;
            -t|--type)
                review_type="$2"
                shift 2
                ;;
            -o|--output)
                output_file="$2"
                shift 2
                ;;
            -v|--verbose)
                VERBOSE=true
                shift
                ;;
            -l|--lang)
                lang="$2"
                shift 2
                ;;
            -*)
                set_language "$lang"
                echo -e "${RED}$(get_text "ERROR_UNKNOWN_OPTION") $1${NC}"
                show_help
                exit 1
                ;;
            *)
                # 收集非选项参数（命令或PR号）
                commands+=("$1")
                shift
                ;;
        esac
    done
    
    # 设置语言
    set_language "$lang"
    
    # 第二阶段：处理收集到的命令和参数
    if [ ${#commands[@]} -eq 0 ]; then
        echo -e "${RED}$(get_text "ERROR_NO_PR_NUMBER")${NC}"
        show_help
        exit 1
    fi
    
    # 处理第一个命令/参数
    local first_arg="${commands[0]}"
    
    if [ "$first_arg" = "list" ]; then
        # 处理 list 命令
        check_dependencies
        list_prs
        exit 0
    else
        # 假设是 PR 编号
        pr_number="$first_arg"
        
        # 检查是否有多余参数
        if [ ${#commands[@]} -gt 1 ]; then
            echo -e "${RED}$(get_text "ERROR_EXTRA_PARAM") ${commands[1]}${NC}"
            show_help
            exit 1
        fi
    fi
    
    # 验证审查类型
    case "$review_type" in
        "architecture"|"security"|"performance"|"full")
            ;;
        *)
            echo -e "${RED}$(get_text "ERROR_INVALID_TYPE") '$review_type'${NC}"
            echo "$(get_text "SUPPORTED_TYPES")"
            exit 1
            ;;
    esac
    
    echo -e "${GREEN}$(get_text "STARTING_REVIEW") #${pr_number} $(get_text "REVIEW_OF")${review_type}$(get_text "REVIEW_TYPE")${NC}"
    
    # 检查依赖
    check_dependencies
    
    # 获取 PR 信息
    get_pr_info "$pr_number"
    
    # 生成审查提示
    generate_review_prompt "$review_type" "$lang"
    
    # 执行 Gemini 分析
    local analysis_result
    analysis_result=$(run_gemini_analysis "$pr_number")
    
    # 输出结果
    if [ -n "$output_file" ]; then
        echo "$analysis_result" > "$output_file"
        echo -e "${GREEN}$(get_text "REVIEW_SAVED") $output_file${NC}"
    else
        echo "$analysis_result"
    fi
    
    # 清理临时文件
    rm -f "$REVIEW_PROMPT_PATH" 2>/dev/null || true
    
    echo -e "${GREEN}$(get_text "REVIEW_COMPLETE")${NC}"
}

# 脚本入口
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi