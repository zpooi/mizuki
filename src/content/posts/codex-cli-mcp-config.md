---
title: Codex CLI 的 MCP 配置不生效：从 config.toml 到命令行逐层确认
published: 2026-08-28
description: Codex CLI 找不到 MCP 工具时，检查配置文件位置、TOML 语法、命令路径和服务器启动状态。
tags: [Codex, MCP, TOML, AI 编程]
category: AI 工具
draft: false
---

# Codex CLI 的 MCP 配置不生效：从 config.toml 到命令行逐层确认

MCP 配置照着示例写了，Codex CLI 里却看不到服务，先别急着重装。最常见的问题是编辑了错误的配置文件，或把应用、CLI 和其他客户端的 MCP 配置格式混在一起。

## 确认正在使用的配置文件

Codex CLI 的用户配置通常位于 `~/.codex/config.toml`；Windows 下 `~` 指当前用户目录。不同安装方式和版本的设置可能有所变化，先运行 `codex --help` 并查看对应版本的官方文档，确认实际读取路径。Codex 桌面应用中的设置也不一定等同于 CLI 配置。

MCP 项配置一般在 TOML 中以类似这样的区块表达：

```toml
[mcp_servers.example]
command = "npx"
args = ["-y", "some-mcp-server"]
```

这里展示的是结构，不是任何特定服务的完整可用配置。TOML 的引号、数组逗号和区块名称都要符合语法；不要把 JSON 的花括号结构原样粘贴进 `config.toml`。

## 用 CLI 验证是否读到了服务

保存后可以用 `codex mcp list` 查看 CLI 识别到的服务器。若列表里没有，先确认文件路径、区块名称和 TOML 语法；若列表里有但连接失败，再单独排查 `command`、`args`、环境变量和权限。

在终端直接运行 MCP 服务器命令，确认它不会因为找不到运行时、包下载失败或缺少参数而立刻退出。Windows 的图形界面启动环境有时与终端 PATH 不同，所以需要时把可执行文件路径明确下来。修改配置后重新启动 CLI 会话，再检查工具是否加载。

把密钥放在配置文件中之前，先确认文件不会被提交进仓库。公开项目配置只保留服务名、命令和非敏感参数；私密凭证放在本机环境变量或受保护的用户配置中。只给 MCP 服务开放它实际需要的目录和操作权限。

我会把排查结果分成两层：CLI 有没有读到配置，以及 MCP 进程能不能正常启动。前一层失败时查配置解析；后一层失败时查命令和运行环境。这样不用因为一个工具没出现就反复改模型或重装 Codex。

参考：[OpenAI Codex 文档](https://developers.openai.com/codex/)｜[Codex MCP 配置说明](https://developers.openai.com/codex/mcp/)
