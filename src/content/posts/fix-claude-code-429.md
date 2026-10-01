---
title: Claude Code 走反代调用 Gemini 一直 429？问题不在额度，在请求指纹
published: 2026-10-01
description: 复现 linux.do 上一个典型案例：用 curl 最小化验证、发现 Header 特征头触发伪 429，最终通过敏感词过滤解决。
tags: [Claude Code, 排查, 429, 反代]
category: 问题解决
draft: false
---

# Claude Code 走反代调用 Gemini 一直 429？问题不在额度，在请求指纹

> 案例整理自 linux.do 原帖：[cpa反代Antigravity 429解决思路](https://linux.do/t/topic/2926807)

![429 排查配图 w-100](/assets/posts/linuxdo-429.webp "429 不一定是额度问题")

## 问题现象

用 Claude Code 配合 CPA 反代 Antigravity 的 `gemini-3.8-flash-high` 模型，突然开始抛 **429 错误**。

第一反应通常是"账号额度用完了"或者"上游限流了"，于是去查余额、换账号，但往往查不出所以然。

## 排查过程：三步缩小范围

这个案例的排查路径非常标准，值得完整记下来：

### 第一步：先查社区有没有同类反馈

作者翻社区帖子，发现有人遇到"Claude Code 里使用 Gemini 模型时一直 429"，线索指向 **Antigravity 对 System Prompt 做特征匹配，触发了伪 429**。

这一步的意义是：把问题从"我的账号有问题"重新定义成"我的请求被识别了"。

### 第二步：用 curl 做最小化请求验证

```bash
curl https://<反代地址>/v1/chat/completions \
  -H "Authorization: Bearer $KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"gemini-3.8-flash-high","messages":[{"role":"user","content":"hi"}]}'
```

结果是**秒回**——同样的渠道、同样的模型，裸 curl 完全正常。

这一步是整个排查的关键：**如果裸 curl 能通，说明额度、网络、鉴权都没问题，问题一定出在客户端发出的请求特征上**。

### 第三步：对比客户端与 curl 的请求差异

Claude Code CLI 会在上行请求里带上自己的私有特征头，例如：

```http
x-anthropic-billing-header: cc_version=2.1.267.0c0; cc_entrypoint=cli;
```

同时 System Prompt 里也包含 `Claude Code`、`system-conventions`、`RFC 2119: MUST, REQUIRED...` 这类可被匹配的固定串。**特征匹配不只发生在 Prompt 文本，Header 指纹同样会命中**，这是最容易忽略的盲点。

## 解决方案：在反代侧过滤特征词

修改 CPA 配置，把客户端特征加入敏感词列表，然后重启服务：

```yaml
antigravity:
  sensitive-words:
    - "x-anthropic-billing-header"
    - "Claude Code"
    - "Claude Agent SDK"
    - "Hermes Agent"
    - "Nous Research"
    - "system-conventions"
    - "system_conventions"
    - "system-directive"
    - "system_directive"
    - "RFC 2119: MUST, REQUIRED, SHOULD, RECOMMENDED, MAY, OPTIONAL."
```

改完重启后即可正常调用。

## 可复用的排查思路

从这个案例能抽出一个通用流程，遇到"莫名其妙的限流/拒绝"都可以套用：

1. **先用最小请求验证连通性**（curl 或一段最小代码），确认账号、网络、鉴权无问题；
2. **再对比客户端与最小请求的差异**：Prompt、Headers、环境变量、User-Agent；
3. **最后看服务端日志**，确认到底是哪一段被规则命中。

如果 CLI 更新后又复现，优先怀疑"新增了私有 Header 或注入了环境变量"，而不是再次怀疑额度。

## 小结

429 这个状态码很容易被误读成"配额不足"。这个案例提醒我们：**状态码只是表象，真正的判断要建立在最小复现和差异对比之上**。

掌握"先验证连通、再对比差异"这两步，能省下大量无意义的换号、重装时间。
