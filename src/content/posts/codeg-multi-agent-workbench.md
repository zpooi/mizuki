---
title: 多个编码 Agent 放进一张画布：Codeg 的工作台思路
published: 2025-09-10
description: 通过会话分叉、任务面板、仓库工作区和 worktree 组织多 Agent 编码任务。
tags: [AI Agent, 多智能体, 编码工具, Git Worktree]
category: 工具分享
draft: false
---

# 多个编码 Agent 放进一张画布：Codeg 的工作台思路

我评估多 Agent 工作台时，首先看它能否让任务状态和上下文保持可见。Codeg 展示了画布分组、会话分叉、待办面板和 Git worktree 等做法，适合进一步检查并行开发如何隔离改动、审阅结果和合并代码。

![Codeg 展示的多种编码 Agent 接入方式](/images/posts/linux-do/codeg-canvas.png)

![Codeg 画布与会话面板示例](/images/posts/linux-do/codeg-workbench.jpeg)

## 画布解决的是“看得见”，不自动解决“做得对”

- 用一个 Agent 负责拆任务，把验收标准写清楚；
- 让实现 Agent 在独立分支或 worktree 中工作，避免并行修改同一份文件；
- 用另一条会话做代码审查，重点检查测试、异常路径和权限边界；
- 由人确认合并，记录每个任务的输入、改动和测试结果。

多 Agent 协作适合可以并行、边界清晰的任务，例如独立模块或不同测试集。需要共享大量上下文、频繁修改同一处逻辑的工作，拆得太碎反而会增加协调成本。先比较独立工作树和手动 Review 是否已经足够，再决定是否加编排工具。

资料来源：[Codeg 无限画布与多智能体协作工作台](https://linux.do/t/2852703)｜[Codeg 项目](https://github.com/xintaofei/codeg)
