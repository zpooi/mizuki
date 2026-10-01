---
title: 把服务装进盒子：我的第一次 Docker 部署实践
published: 2026-09-28
description: 从手写部署命令到 Dockerfile 与 Compose 编排，记录我第一次把项目容器化的过程和踩过的坑。
tags: [Docker, Linux, 部署运维]
category: 部署运维
draft: false
---

# 把服务装进盒子：我的第一次 Docker 部署实践

在项目上线之前，我的部署流程大概是这样的：SSH 登录服务器、手动装 JDK、配环境变量、上传 jar 包、写一串启动命令，任何一个环节忘了都可能导致"本地能跑，线上不行"。

![城市与容器配图 w-100](/assets/posts/docker-deploy.webp "把服务装进盒子")

第一次接触 Docker 时，最打动我的是它解决了一个很朴素的问题：**让程序运行所需的一切，跟着程序一起走**。

## 容器解决的不是性能问题，是一致性问题

刚开始我以为 Docker 是为了省内存或者启动快，用起来才发现它真正的价值在于一致性：

- 开发、测试、生产用的是同一个镜像，环境差异被大大压缩；
- 依赖被装进镜像里，服务器本身可以保持干净；
- 服务挂了可以 `docker compose up -d --build` 一键重建，不用在服务器上考古。

把"在我电脑上是好的"这句经典台词消灭掉，就是容器最大的贡献。

## Dockerfile：把部署命令变成代码

我的第一个 Dockerfile 写得很粗糙：把整个项目目录全部 `COPY` 进去，结果每次改一行代码，镜像就要完整重建。后来学习了分层缓存的思路，把变化频率低的步骤放在前面：

```dockerfile
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

依赖没变的时候，前面的层直接走缓存，构建时间从几分钟降到十几秒。多阶段构建还能让最终镜像里不带 Maven 和源码，体积小了很多。

## 用 Compose 编排一整套服务

一个真实项目往往不止一个容器：应用、MySQL、Nginx 至少三个。`docker-compose.yml` 把它们声明在一个文件里：

- 容器之间通过服务名互相访问，不用关心具体 IP；
- 数据库数据必须挂载数据卷，否则容器一删数据就没；
- 端口只暴露 Nginx 的 80/443，应用和数据库只在内部网络通信。

这份文件本身就是一份"部署说明书"，交给别人也能一眼看懂整套服务怎么跑起来。

## 我踩过的几个坑

- **时区问题**：容器默认 UTC，日志时间和本地差八小时。解决方式是在 Dockerfile 里设置时区，或在 compose 中传入 `TZ` 环境变量；
- **日志膨胀**：容器日志没有限制会写满磁盘，要配置日志轮转大小；
- **数据库容器当成持久服务**：数据没挂卷，重建容器后数据全丢，这个教训让我再也不敢省略 volume 配置。

## 小结

这次实践让我明白，Docker 的学习重点不在背命令，而在于理解"镜像、容器、数据卷、网络"这几个概念之间的关系。部署从一串临时命令变成一份可以版本管理的配置文件之后，服务的可迁移性和可恢复性都有了质的提升。

接下来我想继续深入镜像瘦身、健康检查和 CI/CD 自动构建，把这条链路彻底打通。
