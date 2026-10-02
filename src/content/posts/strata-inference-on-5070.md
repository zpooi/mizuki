---
title: 12GB 显卡跑大参数模型：Strata 测试里值得看的指标
published: 2025-07-29
description: 整理 Strata 在 RTX 5070 上运行量化 MoE 模型的社区测试，解释 decode、prefill 与内存需求不能混为一谈。
tags: [本地模型, 推理优化, 量化, RTX 5070]
category: 技术观察
draft: false
---

# 12GB 显卡跑大参数模型：Strata 测试里值得看的指标

LINUX DO 用户转发了一组 Strata 推理引擎的测试：在 RTX 5070 12GB 显卡、64GB 内存和 Ryzen 5 7600 配置下，量化后的 Qwen Flash-Next MoE 模型能以不同速度运行。帖子报告 Q2、IQ2 和 IQ3 量化的 decode 速度约为 65、52 和 45 token/s，prefill 速度则更高；作者同时列出了不同量化方式的内存需求。

![原帖中的 Strata 硬件与速度测试，数据为作者自测](/images/posts/linux-do/strata-5070-benchmark.png)

看这类数字时，先分清两个阶段：

- **Prefill**：模型读取提示词和上下文，影响首 token 等待时间；长上下文会让这一步更重。
- **Decode**：模型逐 token 生成回答，通常以 token/s 观察交互速度。

量化越激进，通常越省内存，但速度、输出质量和可用上下文都可能变化。实际运行还要把模型权重、KV cache、推理框架和系统预留内存一起算进去。

因此，别只比较一张“最高速度”截图。固定同一提示词和上下文长度，分别记录 prefill、decode、峰值内存和输出质量；模型版本、量化格式、驱动和推理框架也要一起记下。原帖成绩是特定机器与版本的自测，不等于所有 RTX 5070 都能复现。

参考：[LINUX DO：5070 45tps 本地跑 180B Qwen](https://linux.do/t/2954929)｜[Strata 推理引擎](https://github.com/Niko1221/Strata)

