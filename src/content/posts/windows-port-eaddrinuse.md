---
title: Windows 开发报 EADDRINUSE：先查端口占用进程
published: 2026-09-13
description: Node、Java 服务启动时端口被占用，使用 PowerShell 找到监听 PID，确认用途后再处理。
tags: [Windows, Node.js, Java, 端口, 故障排查]
category: 开发排错
draft: false
---

# Windows 开发报 EADDRINUSE：先查端口占用进程

Node 服务启动时报 `EADDRINUSE`，Java 报 `Address already in use`，通常表示程序想监听的端口已被其他进程占用。直接反复重启往往没有帮助；先确认是哪一个进程在监听，才知道该停服务还是换端口。

假设报错端口是 `3000`，PowerShell 可以这样查：

```powershell
Get-NetTCPConnection -LocalPort 3000 -State Listen |
  Select-Object LocalAddress, LocalPort, OwningProcess
```

记下 `OwningProcess`，再查看对应程序：

```powershell
Get-Process -Id 1234
```

把 `1234` 替换为实际 PID。也可以先用 `netstat -ano | findstr :3000` 找监听记录，再用 `tasklist /FI "PID eq 1234"` 核对进程名。

## 确认它是不是该停止的进程

常见占用者是上一次没有退出的开发服务器、另一个项目、容器映射出来的端口，或本机数据库。先检查终端窗口、IDE 运行面板以及 `docker ps`。如果它是另一个正在使用的服务，正确做法可能是停止你刚启动的重复实例，或把当前项目改到另一个端口。

确认 PID 对应的是自己启动、可以停止的进程后，再正常结束它。不要看到一个数字就直接强制杀进程；PID 可能属于系统服务或其他正在工作的程序。

还要区分 IPv4 / IPv6 监听、TCP / UDP 和端口映射。相同数字的端口不总是同一条冲突；应以程序完整报错和监听记录为准。容器场景下也要检查宿主机发布端口是否已被另一个容器占用。

如果端口经常冲突，给开发服务配置可覆盖的端口变量，并在启动脚本里打印实际监听地址。这样比每次遇到问题都去“清理所有 node.exe”安全得多，也更容易复现。
