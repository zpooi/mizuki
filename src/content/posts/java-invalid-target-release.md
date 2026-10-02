---
title: Java 报 invalid target release：检查 Maven 真正使用的 JDK
published: 2026-08-19
description: IDE 里 Java 版本看起来正确，命令行仍可能使用另一套 JDK；用 java -version 和 mvn -v 对照定位。
tags: [Java, Maven, JDK, 故障排查]
category: 开发排错
draft: false
---

# Java 报 invalid target release：检查 Maven 真正使用的 JDK

看到 `invalid target release: 21` 或 `release version 21 not supported`，不一定是源代码写错了。常见情况是项目要求较新的 Java 版本，但 Maven 实际启动时拿到的是旧 JDK。IDE 项目设置、终端里的 `java` 和 Maven 使用的 Java 可能不是同一个。

## 先确认命令行到底用了哪套 Java

在项目目录执行：

```sh
java -version
mvn -v
```

第二条尤其重要：Maven 会显示它运行所用的 Java 版本和 Java home。仅看 `java -version` 还不够，因为 `mvn` 可能受 `JAVA_HOME` 或 Maven 启动脚本影响。

Windows 下还可以查看命令解析到哪里：

```powershell
where.exe java
where.exe mvn
$env:JAVA_HOME
```

如果终端结果与 IDE 不同，分别核对 IDE 的 Project SDK、Maven Runner JRE，以及终端的 `JAVA_HOME`。更改环境变量后要重新打开终端，让新进程读取新值。

## 核对项目要求，不要只改成自己机器能编译

查看 `pom.xml` 是否设置了 `maven.compiler.release`，或者通过 Maven Compiler Plugin 配置了 `release`。如果项目目标是 Java 21，就应让构建工具确实运行在支持该目标的 JDK 上。

不要为了让旧电脑通过构建就直接把目标版本降下来。这样可能让本地构建成功，却与项目部署环境不一致。若项目本来就该支持较旧版本，需要先确认代码、依赖和 CI 的兼容要求，再统一调整目标版本。

若错误是 `invalid source release`，同样先核对实际编译器版本；若错误变成 `Unsupported class file major version`，则可能是运行时或某个构建插件读到了更高版本编译的 class 文件。它们看起来都像“Java 版本问题”，但发生在不同阶段，应该根据第一条报错定位。

改完后重新运行 `mvn -v`，确认 Maven 使用的 JDK 已变化，再执行项目原本的测试或打包命令。IDE 的绿色运行按钮通过，不等于 CI 和命令行构建环境也一致。

参考：[Maven Compiler Plugin：编译器版本配置](https://maven.apache.org/plugins/maven-compiler-plugin/examples/set-compiler-source-and-target.html)｜[Maven Toolchains](https://maven.apache.org/guides/mini/guide-using-toolchains.html)
