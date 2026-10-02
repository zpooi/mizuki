---
title: 用 Google Cloud 额度接入代码 Agent：先理清 Vertex AI 这条链路
published: 2025-09-25
description: 讨论中的一种接法是通过 Vertex AI 调用模型；整理项目、区域、认证与预算控制的准备步骤。
tags: [Google Cloud, Vertex AI, Claude Code, 凭证安全]
category: 开发实践
draft: false
---

# 用 Google Cloud 额度接入代码 Agent：先理清 Vertex AI 这条链路

LINUX DO 上有人问，新账号获得的 Google Cloud 额度能不能用于代码 Agent。回复里提到的核心不是把“赠金”塞进任意客户端，而是确认服务是否能调用 Vertex AI：有些客户端原生支持 Vertex，有些需要一个本地兼容网关把请求协议转换后再转发。

## 开始前先确认四件事

1. **额度范围**：核对 Cloud Credits 是否可用于目标 Vertex AI 模型、区域和 API，额度到期后是否会自动转为付费。
2. **项目和区域**：在专用 Google Cloud 项目中启用所需 API，选择模型可用的区域，并查看配额。
3. **认证方式**：优先使用官方支持的 Application Default Credentials 或受管身份；确实需要服务账号密钥时，只授予最小权限并保存在本机凭证目录。
4. **客户端接法**：原生支持 Vertex 的工具直接按官方文档配置；不支持时才评估 LiteLLM 一类本地协议网关，并验证它对工具调用、流式响应和错误码的支持。

Claude Code 使用 Vertex 的配置大致会涉及项目、区域和 Google 凭证：

```bash
export CLAUDE_CODE_USE_VERTEX=1
export ANTHROPIC_VERTEX_PROJECT_ID="your-project-id"
export CLOUD_ML_REGION="us-central1"
export GOOGLE_APPLICATION_CREDENTIALS="/local/secure/path/vertex-credentials.json"
```

变量名和当前可用模型应以工具与 Vertex AI 的最新官方文档为准。启动前可以先确认凭证身份、区域和 API 配额，再做一个小请求。

## 额度不是密钥的替代品

服务账号 JSON 私钥一旦上传到仓库、贴进论坛或交给不可信网关，就可能被用于消耗项目额度。不要把凭证写进 `.env.example`、截图或日志；本地配置文件应加入忽略规则。为项目设置预算提醒和配额，测试完成后撤销不再使用的密钥。

参考：[LINUX DO：Google 新账号赠金怎么在 Code Agent 上调用？](https://linux.do/t/2973817)（讨论提到了 Vertex AI 原生接入与本地协议网关两种路线；具体支持情况请核对官方文档）

