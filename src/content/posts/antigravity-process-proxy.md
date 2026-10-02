---
title: 给单个应用走代理：Antigravity 的进程级配置思路
published: 2026-06-26
description: 当编辑器不遵循系统代理时，可只转发指定进程的流量，并逐层验证辅助进程与代理日志。
tags: [代理, Windows, 开发工具, Antigravity]
category: 开发实践
draft: false
---

# 给单个应用走代理：Antigravity 的进程级配置思路

有些桌面应用不会读取系统代理设置。遇到这种情况，常见做法是打开 TUN，让整台设备的流量都经过代理；如果只想让某个编辑器联网，也可以按进程转发，范围更小，排查时也更容易知道流量从哪里走。

如果桌面程序不读取系统代理，我会先确认发起网络请求的进程，再决定是否只给该应用配置进程级转发。Antigravity 这类编辑器除了主进程，也可能由语言服务进程发请求。

![ProxyBridge 中识别 Antigravity 主进程](/images/posts/linux-do/proxybridge-overview.png)

## 配置步骤

1. 确认本机代理正在运行，并记下协议、监听地址和端口。示例值 `127.0.0.1:20122` 只适用于对应环境，应换成你本机实际的监听地址。
2. 在 ProxyBridge 中添加代理配置。截图使用 SOCKS5；如果你的代理提供的是 HTTP 或其他协议，要按实际类型选择。
3. 添加 Antigravity 相关进程规则。常见目标包括 `Antigravity.exe` 和 `language_server_windows_x64.exe`。软件升级后路径或进程名可能变化，规则应以任务管理器中实际运行的进程为准。
4. 启动应用并检查 ProxyBridge 的日志或流量记录，确认两个进程都命中规则，再测试登录和对话。

![ProxyBridge 的代理地址和端口设置示例](/images/posts/linux-do/proxybridge-logs.png)

![将语言服务进程加入转发规则](/images/posts/linux-do/proxybridge-rules.png)

## 两个容易漏掉的地方

只代理主程序时，界面可能打开了，但实际请求由语言服务进程发出，结果仍然无法连接。登录成功跳回编辑器后若对话面板没有加载，可先完全退出应用，再重新启动并检查代理日志。

如果配置后仍不通，按这个顺序查会比较省时间：代理本身能否连接、代理类型和端口是否填对、规则是否匹配真实进程、日志里是否出现该进程的请求。一次只改一个条件，能避免把问题归到错误的地方。

进程级代理工具会介入应用网络流量。请从项目官方渠道获取工具，并确认代理目标和规则范围符合自己的网络环境。

资料来源：[Antigravity 非 TUN 代理方案 ProxyBridge](https://linux.do/t/1688640)（fredzhang 发起，文中截图来自原帖）｜[ProxyBridge 项目](https://github.com/InterceptSuite/ProxyBridge)
