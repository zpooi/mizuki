---
title: 从 Mermaid 到 Visio：把图表草稿转换成可继续编辑的流程图
published: 2026-04-12
description: 把 Mermaid 图表转换成可编辑 VSDX 草稿，再在 Visio 中校正布局和细节。
tags: [Mermaid, Visio, 文档, 开源工具]
category: 工具分享
draft: false
---

# 从 Mermaid 到 Visio：把图表草稿转换成可继续编辑的流程图

需要交付可编辑 Visio 文件时，手工拖节点和连线很花时间。把 Mermaid 当作结构草稿、再转换成 `.vsdx`，可以先固定节点关系，再在 Visio 里调整布局和文字。

![Mermaid 源文本与 Visio 输出的对照示例](/images/posts/linux-do/mermaid-visio-demo.png)

## 推荐流程

1. 先写 Mermaid 流程图，确保节点和连线语义正确；
2. 在安装了桌面版 Visio 的 Windows 环境测试 COM 自动化是否可用；
3. 选择目标文件，遇到生成失败时尝试新建空白 Visio 文档作为输出容器；
4. 打开结果核对节点文本、箭头方向、重叠和分页，再由人工整理版式。

工具能省去大量初始绘图动作，但复杂布局不一定和手工设计完全一致。启用绘图窗口能看出转换停在哪一步；第一次使用时先选小图验证，再处理完整架构图。

资料来源：[md2visio-gui，Mermaid 转 Visio 工具](https://linux.do/t/743889)｜[项目仓库](https://github.com/konbakuyomu/md2visio-gui)
