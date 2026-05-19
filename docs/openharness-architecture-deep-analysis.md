# OpenHarness 架构深度分析

## 1. 整体流程 & 架构分层

**整体流程**: 用户通过 CLI (`oh`) 启动 → `cli.py` 解析参数 → 调用 `ui/app.py` 的 `run_repl()` 或 `run_print_mode()` → 创建 `QueryEngine` → `run_query()` 驱动 Agent Loop (流式调 LLM → 解析 tool_use → 执行工具 → 返回结果 → 循环) → 输出给用户。

**架构分层** (从上到下):

| 层 | 模块 | 职责 |
|---|---|---|
| **CLI 入口** | `cli.py` (typer) | 参数解析、子命令路由、dry-run 预览 |
| **UI 层** | `ui/` | REPL 交互、prompt-toolkit 输入、Rich 输出渲染、React TUI (可选) |
| **Engine 层** | `engine/` | `QueryEngine` (会话管理) + `run_query()` (核心 Agent Loop) |
| **Tool 层** | `tools/` | 40+ 内置工具 (bash, file_edit, agent, task_create, ...) |
| **Coordinator 层** | `coordinator/` | 协调者模式检测、Worker 工具集定义、system prompt 生成 |
| **Swarm 层** | `swarm/` | 多 Agent 编排：team 生命周期、mailbox 通信、worktree 隔离、backend 注册 |
| **API 层** | `api/` | 多 Provider 适配 (Anthropic/OpenAI/Copilot/Codex/Bedrock/Vertex...) |
| **Memory 层** | `memory/` | 持久化记忆 (Markdown 后端 + mem0 后端) |
| **Services 层** | `services/compact/`, `services/` | 上下文压缩、session 存储、cron、token 估算 |
| **Infra 层** | `config/`, `auth/`, `permissions/`, `sandbox/`, `mcp/`, `hooks/`, `plugins/`, `skills/` | 配置、认证、权限、沙箱、MCP、Hook、插件、技能 |

## 2. CLI 还是 TUI？—— CLI 为主 + 可选 TUI

- **CLI 模式** (默认): `oh` 启动交互式 REPL，基于 `prompt-toolkit` + `rich`，纯终端
- **TUI 模式** (可选): `textual>=0.80.0` 依赖 + React 前端 (`frontend/terminal/`)，`--backend-only` 启动后端
- **Print 模式**: `oh -p "prompt"` 非交互单次输出
- **Task Worker 模式**: `oh --task-worker` stdin 驱动的 headless worker，用于子进程 Agent

本质上是一个 **CLI 工具**，TUI 是增强而非核心。

## 3. Workspace？Local Agent 还是 Cloud Agent？

**纯 Local Agent**，无云端组件：

- 所有执行在本地机器上 (`cwd` 参数，本地文件系统操作)
- 无远程服务器/云端编排
- Workspace 概念 = **当前工作目录** (`--cwd`)，不是独立 workspace 对象
- 状态存储在本地: `~/.openharness/` (teams, credentials, sessions, worktrees)
- 支持 **远程 API Provider** (调 Anthropic/OpenAI 等)，但 Agent 本体在本地

## 4. 计算复杂度 & 执行模式

OpenHarness 有 **两套执行模式**：

### Mode A: 单 Agent 模式 (默认)
- `run_query()` 循环：LLM → tool_use → 执行 → 循环
- 适合简单任务，无需多 Agent

### Mode B: Coordinator + Worker 模式 (Swarm)
- **Coordinator**: 拥有 `agent`、`send_message`、`task_stop` 三个专属工具
- **Worker**: 拥有 `bash`、`file_read`、`file_edit`、`glob`、`grep` 等执行工具
- 通过环境变量 `CLAUDE_CODE_COORDINATOR_MODE=1` 激活

**没有显式的"计算复杂度评估"逻辑**。模式选择由用户/配置决定，不是系统自动判定。

## 5. 如何决定走哪套模式？

**手动 + 环境变量驱动**，无自动判定：

1. 用户通过 `CLAUDE_CODE_COORDINATOR_MODE=1` 环境变量启动协调者模式
2. `is_coordinator_mode()` 检测环境变量
3. 协调者的 system prompt 通过 `get_coordinator_system_prompt()` 注入
4. Worker 的工具集通过 `get_coordinator_user_context()` 告知协调者
5. 简化模式 (`CLAUDE_CODE_SIMPLE=1`) 限制 Worker 只能用 bash/read/edit

与 Claude Code 的设计一致——**不自动判断**，由用户或上层系统配置。

## 6. 主 Agent 如何拆分任务？

**完全由 LLM (Coordinator) 自行决策**，代码层面没有硬编码的拆分逻辑。但通过 system prompt 强约束：

- **Phase 引导**: Research → Synthesis → Implementation → Verification
- **并行优先**: "Workers are async. Launch independent workers concurrently"
- **读写分离**: "Read-only tasks run in parallel freely; Write-heavy tasks one at a time per set of files"
- **Synthesis 必须 Coordinator 做**: "You must understand findings before directing follow-up work"
- **Continue vs Spawn 判断表**: 语境重叠高 → continue；低 → spawn fresh

Worker 的工具集定义在 `_WORKER_TOOLS` (完整) 或 `_SIMPLE_WORKER_TOOLS` (简化模式)。

## 7. 如何解决 Agent 写冲突？修改同一文件？

**三层机制**：

### 7.1 Git Worktree 隔离 (主要)
- `WorktreeManager` 为每个 Worker 创建独立 git worktree (`~/.openharness/worktrees/<slug>/`)
- Worker 在隔离目录操作，互不干扰
- 常用目录 (node_modules, .venv) 通过 symlink 共享，避免重复
- 完成后通过 `git worktree remove` 清理

### 7.2 协调者 Prompt 约束
- "Write-heavy tasks — one at a time per set of files"
- 协调者负责调度，避免同时让两个 Worker 写同一文件

### 7.3 File Lock (辅助)
- `utils/file_lock.py` 提供文件级锁
- Mailbox 写入使用 `exclusive_file_lock` 保证原子性

## 8. 上下文管理——四层体系

### Layer 1: 对话历史 (`ConversationMessage` 列表)
- 完整的 user/assistant/tool_result 消息链
- `QueryEngine._messages` 维护

### Layer 2: Tool Metadata (跨轮携带状态)
- `tool_metadata` 字典在 query loop 间传递
- 包含: `task_focus_state` (目标/工件/验证状态)、`read_file_state`、`async_agent_tasks`、`recent_work_log` 等
- 压缩时通过 `CompactAttachment` 保留关键状态

### Layer 3: Auto-Compaction (自动压缩)

三级渐进压缩策略：

1. **Microcompact**: 清除旧 tool_result 内容 (零 LLM 调用)
2. **Session Memory**: 确定性摘要 (无 LLM 调用，行级摘要)
3. **Full Compact**: LLM 生成结构化 `<analysis>` + `<summary>` (最贵)
4. **Context Collapse**: 截断过长文本块 (head+tail 保留)
5. **PTL Retry**: 压缩请求本身超长时，删除最老 prompt round

触发条件: `token_count >= context_window - 13_000`

### Layer 4: Memory Backend (持久化记忆)
- **Markdown 后端**: 文件系统 markdown 文件存储
- **mem0 后端**: 可选的 AI 记忆提取
- 自动提取: 每 N 条消息或每 N 秒触发 `extract_and_store()`
- 压缩前安全网: `_extract_before_compact()` 确保细节不丢失

## 9. Agent 间通信方式

**三种通信机制**：

### 9.1 Task Notification (主通道)
- Worker 完成后发送 `<task-notification>` XML 给 Coordinator
- 格式: `<task-id>`, `<status>`, `<summary>`, `<result>`, `<usage>`
- Coordinator 将其识别为 user-role 消息

### 9.2 Mailbox (异步消息队列)
- 基于文件系统: `~/.openharness/teams/<team>/agents/<agent_id>/inbox/`
- 每条消息一个 JSON 文件，原子写入 (`.tmp` → `rename`)
- 支持消息类型: `user_message`, `permission_request/response`, `shutdown`, `idle_notification`
- 排他文件锁 (`exclusive_file_lock`) 防止并发写冲突

### 9.3 stdin/stdout (子进程模式)
- `SubprocessBackend` 通过 stdin 向 Worker 进程写入 JSON 消息
- Worker 通过 stdout 返回结果

## 10. 子 Agent 上下文压缩

**Worker/子 Agent 有独立的压缩机制**：

- 每个 Worker 有自己的 `QueryEngine` 实例和独立的 `_messages` 列表
- Worker 的 `run_query()` 同样执行 `auto_compact_if_needed()`
- **Worker 上下文天然比主 Agent 小**：因为 Worker 是"自包含 prompt"设计——Coordinator 必须在 prompt 中提供完整上下文，Worker 不继承主对话
- In-process Worker: `TeammateContext` 通过 `ContextVar` 隔离，各 Worker 的 token 统计独立
- Subprocess Worker: 完全独立进程，有自己的上下文窗口

**关键点**: Worker 的上下文从启动 prompt 开始，不累积主 Agent 的历史。Coordinator 通过 `send_message` 可继续 Worker，此时 Worker 保留之前的上下文。

## 11. 对比 Claude Code，优劣势

### OpenHarness 优势

| 维度 | OpenHarness | Claude Code |
|------|------------|-------------|
| **开源** | MIT 协议，完全开源 | 闭源 |
| **多 Provider** | Anthropic/OpenAI/Copilot/Codex/Bedrock/Vertex/DashScope/Moonshot/Gemini/MiniMax | 仅 Anthropic |
| **多 API 格式** | anthropic/openai/copilot 三种格式 | 仅 anthropic |
| **语言** | Python，易扩展和审计 | TypeScript/Node |
| **通信渠道** | Slack/Telegram/Discord/飞书/钉钉/QQ/微信/WhatsApp/Email | 无 |
| **Autopilot** | 内建 autopilot (看板/排期/自动执行/验证) | 无 |
| **Cron** | 内建 cron 调度器 | 无 |
| **Sandbox** | Docker 沙箱后端 | 仅本地执行 |
| **记忆系统** | Markdown + mem0 双后端 | Markdown 单后端 |

### OpenHarness 劣势

| 维度 | OpenHarness | Claude Code |
|------|------------|-------------|
| **成熟度** | 0.1.7，早期项目 | 生产级，大量用户验证 |
| **生态** | 无 IDE 插件 | VS Code + JetBrains 插件 |
| **模型绑定** | 依赖外部 API，自建模型生态弱 | Anthropic 原生深度优化 |
| **性能** | Python 进程模型，GIL 限制 | Node.js 事件循环更轻量 |
| **In-process Worker** | 仅 stub 实现，`query_context=None` 走桩代码 | 完整实现 |
| **tmux/iTerm2 集成** | 有 Protocol 定义但实现较薄 | 完整的可视化 Swarm |
| **Swarm 可视化** | 无实时 UI | 完整的 tmux pane 视图 |
| **测试覆盖** | 较少 | 完善 |
| **文档** | 早期 | 成熟 |

### 本质差异

- **Claude Code** = 闭源产品，深度绑定 Anthropic 模型，打磨用户体验
- **OpenHarness** = 开源框架，"bring your own model"，强调可扩展性和多渠道接入，但在核心 Agent Loop 的完成度上还有差距
