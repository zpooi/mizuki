---
title: Agent 桌面端能操作终端和 SSH 后，权限边界要怎么设
published: 2026-04-07
description: 从 LiveAgent 展示的终端、文件、浏览器、隧道和 SSH 功能出发，整理桌面 Agent 的隔离与授权检查。
tags: [AI Agent, SSH, 桌面工具, 安全]
category: 开发实践
draft: false
---

# Agent 桌面端能操作终端和 SSH 后，权限边界要怎么设

LiveAgent 的社区介绍展示了桌面客户端与 Gateway / WebUI：Agent 可以访问终端、文件树、SSH、浏览器和后台任务。这让工作流更连贯，也意味着 Agent 获得的权限可能超出普通聊天窗口。

![LiveAgent 桌面端界面示例，来自项目原帖](/images/posts/linux-do/liveagent-ui.jpeg)

## 按任务开放权限

1. **先在测试仓库运行**：使用可重建的副本，避免 Agent 直接改动唯一工作目录。
2. **只开放必要目录**：不用时关闭桌面、浏览器、SSH 或远程网关等工具。
3. **保留关键动作确认**：删除、推送、数据库迁移和生产发布都应让人审阅命令与目标。
4. **分开本地和远程身份**：不要把生产 SSH 私钥放进 Agent 默认可读的目录；使用最小权限的临时凭证。
5. **检查 Gateway 暴露面**：远程访问要有认证和 TLS，并限制可连接的设备与网络范围。

“能执行”不等于“应该自动执行”。评估这类客户端时，可以先测它如何展示工具调用、如何中断长任务、后台进程怎么回收，以及断线后是否保留执行状态，再决定放进日常或生产流程。

参考：[LINUX DO：LiveAgent，一个支持 WebUI 的 AI Agent 客户端](https://linux.do/t/2587954)｜[LiveAgent 项目](https://github.com/Stack-Cairn/LiveAgent)
