---
title: Claude Code 或 Codex 连不上服务：区分代理、DNS 与证书问题
published: 2026-09-26
description: AI 编程工具连接失败时，按名称解析、TCP、TLS 和应用代理设置分层检查，不要用关闭证书校验掩盖问题。
tags: [Claude Code, Codex, 代理, TLS, 网络排错]
category: AI 工具
draft: false
---

# Claude Code 或 Codex 连不上服务：区分代理、DNS 与证书问题

AI 编程工具一直转圈、突然断流或报 `ECONNRESET`，很容易被笼统归结为“网络不好”。但 DNS 解析失败、代理没生效、TLS 证书不受信任和上游限流，处理方式完全不同。先拿到具体错误，再沿请求路径逐层排查。

## 从最外层网络开始验证

先确认目标域名能解析，再检查代理端口是否能连接、代理本身是否可用。浏览器能打开网页不代表 CLI 一定走同一条网络路径：终端、IDE 和桌面应用可能继承不同的环境变量或有各自的代理设置。

Windows PowerShell 可以先查看当前进程是否设置了代理变量（注意不要分享包含账号密码的代理 URL）：

```powershell
Get-ChildItem Env: | Where-Object Name -Match '^(HTTP|HTTPS|ALL|NO)_PROXY$' | Select-Object Name
```

如果需要为当前终端临时设置代理，应按本机代理软件的实际地址配置 `HTTP_PROXY` / `HTTPS_PROXY`，再从同一终端启动工具。不同客户端对大小写变量和代理协议的支持可能不同，按该工具当前文档确认；不要把某个变量名当作所有应用的通用保证。

## 看错误停在哪一层

- 域名解析报错：先查 DNS 和域名拼写。
- 连接被拒绝：确认代理地址、端口和本机代理服务状态。
- `ECONNRESET` 或超时：对照代理日志、目标服务状态和发生时间，判断连接在哪一段被中断。
- `CERTIFICATE_VERIFY_FAILED`：检查系统时间、代理是否进行 TLS 检查、企业根证书是否按正规方式安装，以及客户端是否使用了另一套证书存储。

不要设置 `NODE_TLS_REJECT_UNAUTHORIZED=0`，也不要用关闭证书验证的方式“修好”请求。这会让客户端失去服务器身份验证，凭证可能被中间人读取。若是企业代理证书问题，应向管理员获取可信根证书并按官方方式配置；个人代理则先检查软件的证书和 HTTPS 解密设置。

最后用一个最小请求验证，再分别测试 CLI 和 IDE。记录发生时间、错误码、工具版本与网络路径，隐藏 token、用户信息和完整私有 URL。证据足够时，才能分辨是客户端配置问题、代理故障还是上游服务异常。

参考：[Node.js CLI 环境变量](https://nodejs.org/api/cli.html#environment-variables)｜[OpenAI Codex 文档](https://developers.openai.com/codex/)｜[Claude Code 故障排查](https://docs.anthropic.com/en/docs/claude-code/troubleshooting)
