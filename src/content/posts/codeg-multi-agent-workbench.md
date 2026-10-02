---
title: 多个编码 Agent 放进一张画布：Codeg 的工作台思路
published: 2025-09-10
description: 从 Codeg 社区帖整理会话分叉、任务面板、仓库工作区和多 Agent 协作适合解决的问题。
tags: [AI Agent, 多智能体, 编码工具, Git Worktree]
category: 工具分享
draft: false
---

# 多个编码 Agent 放进一张画布：Codeg 的工作台思路

当 Claude Code、Codex、OpenCode 等编码 Agent 分别开在不同终端时，任务状态和上下文很容易散落。Codeg 的作者把它描述为一个多 Agent 编码工作台：会话可以放在画布上分组，支持从某条消息分叉、待办任务、仓库面板和 Git worktree。

![Codeg 展示的多种编码 Agent 接入方式](/images/posts/linux-do/codeg-canvas.png)

![Codeg 画布与会话面板示例，来自原帖](/images/posts/linux-do/codeg-workbench.jpeg)

## 画布解决的是“看得见”，不自动解决“做得对”

- 用一个 Agent 负责拆任务，把验收标准写清楚；
- 让实现 Agent 在独立分支或 worktree 中工作，避免并行修改同一份文件；
- 用另一条会话做代码审查，重点检查测试、异常路径和权限边界；
- 由人确认合并，记录每个任务的输入、改动和测试结果。

多 Agent 协作适合可以并行、边界清晰的任务，例如独立模块或不同测试集。需要共享大量上下文、频繁修改同一处逻辑的工作，拆得太碎反而会增加协调成本。先比较独立工作树和手动 Review 是否已经足够，再决定是否加编排工具。

参考：[LINUX DO：Codeg 无限画布与多智能体协作工作台](https://linux.do/t/2852703)｜[Codeg 项目](https://github.com/xintaofei/codeg)
