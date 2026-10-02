---
title: npm 报 ERESOLVE unable to resolve dependency tree：先查 peerDependencies
published: 2026-08-07
description: 遇到 npm ERESOLVE 时，先核对 Node、npm 与依赖版本，再决定是否调整依赖，不要一上来强行安装。
tags: [Node.js, npm, ERESOLVE, 故障排查]
category: 开发排错
draft: false
---

# npm 报 ERESOLVE unable to resolve dependency tree：先查 peerDependencies

执行 `npm install` 时看到 `ERESOLVE unable to resolve dependency tree`，直觉上很容易加上 `--force` 继续装。但这个错误通常是在提醒：项目里至少有两个依赖对某个共享依赖的版本要求不一致。强行跳过检查，可能只是把安装错误推迟到运行或构建阶段。

## 先找到冲突的那一组依赖

错误输出通常会包含 `Found`、`Could not resolve dependency` 和 `peer ... from ...` 等信息。重点读清楚三件事：当前实际安装了哪个版本、哪个包提出了 peer dependency 要求、它接受的版本范围是什么。不要只看输出最后的 `Fix the upstream dependency conflict`。

先记录当前工具版本和项目声明：

```sh
node --version
npm --version
npm pkg get dependencies devDependencies
```

如果错误提到了某个框架插件，先检查它支持的框架主版本，再决定是升级插件、降级框架，还是安装一组彼此兼容的版本。项目已有 `package-lock.json` 时，也要确认它和 `package.json` 是同一套变更，不要在排错过程中随手删掉锁文件。

## 按改动范围处理

如果这是刚新增的依赖，先查它的 peer dependency 范围，并挑选与项目现有主版本兼容的版本。如果是升级框架后才出现，检查相关插件是否已经支持新主版本；一组依赖应作为整体升级，而不是逐个碰运气。

依赖声明确认兼容后，再用锁文件进行干净安装：

```sh
npm ci
```

`npm ci` 会按锁文件安装并要求两份依赖清单一致，适合验证项目能否从干净状态复现。若它提示 `package.json` 与锁文件不匹配，应先在确认依赖版本后更新并提交锁文件，而不是把错误隐藏起来。

## `--legacy-peer-deps` 什么时候才考虑

有些旧项目依赖树原本就使用 npm 的宽松解析方式，维护者也明确验证过组合；这种情况下，可以先在本地试 `npm install --legacy-peer-deps`，并运行测试、构建和关键功能确认结果。但这会绕过 peer dependency 的冲突检查，不应当作为所有项目的默认安装参数，更不要不经验证就写进全局 npm 配置。

`--force` 更不适合当作第一反应：它会接受 npm 通常认为不安全的依赖组合。能安装不代表运行时兼容。

我排这类问题时会保留完整错误、Node/npm 版本和锁文件状态。这样即使需要请别人协助，也能把讨论聚焦在具体冲突，而不是反复猜“是不是 npm 坏了”。

参考：[npm ERESOLVE 错误说明](https://docs.npmjs.com/cli/v11/using-npm/config#legacy-peer-deps)｜[npm ci](https://docs.npmjs.com/cli/v11/commands/npm-ci)
