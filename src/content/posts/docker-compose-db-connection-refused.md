---
title: Docker Compose 里数据库连不上：别在容器中用 localhost
published: 2026-09-02
description: 应用容器连接数据库失败时，按容器网络、服务名、端口和启动就绪状态逐层排查。
tags: [Docker, Docker Compose, PostgreSQL, 网络排错]
category: 开发排错
draft: false
---

# Docker Compose 里数据库连不上：别在容器中用 localhost

本机运行应用时数据库可以连接，放进 Docker Compose 后却报 `Connection refused`，最容易忽略的是：容器里的 `localhost` 指向应用容器自己，并不是宿主机，也不是数据库容器。

## 先分清连接发生在哪里

如果应用和数据库都在同一个 Compose 项目里，应用通常应该使用 Compose 服务名作为主机名。例如服务叫 `db`，应用连接地址应指向 `db:5432`，而不是 `localhost:5432`。Compose 会在项目网络里提供服务发现。

`ports` 配置的用途主要是把容器端口发布到宿主机。例如 `15432:5432` 表示宿主机用 `localhost:15432` 访问数据库；同一 Compose 网络里的应用仍应访问 `db:5432`。不要把宿主机映射端口误当成容器间通信端口。

先看服务是否创建、运行并暴露了预期端口：

```sh
docker compose ps
docker compose logs db
docker compose logs app
```

将 `db` 和 `app` 替换成 Compose 文件里的真实服务名。然后检查应用容器拿到的数据库主机、端口、库名和用户名是否正确；排查时不要把密码或完整连接串贴到公开日志里。

## 容器启动不等于数据库已经就绪

Compose 可以启动应用容器和数据库容器，但数据库可能还在初始化。应用如果只在启动时连接一次，就可能赶在数据库接受连接前报错退出。

可以为数据库添加健康检查，并让应用依赖数据库的健康状态；同时，应用端保留有限次数的重试和退避，避免一次短暂延迟就导致整个服务不可用。单纯增加固定 `sleep` 往往不稳：慢机器上时间不够，快机器上又白白等待。

如果数据库运行在宿主机而非 Compose 服务中，容器访问宿主机的方式取决于操作系统和 Docker 网络配置，不能照搬另一个环境的 `localhost`。先从应用容器内验证 DNS 和 TCP 是否可达，再检查防火墙及数据库监听地址。

一套有效的排查顺序是：服务名解析 → 网络可达 → 端口监听 → 数据库就绪 → 认证与库名。每一步都确认后再改下一项，才能避免把网络问题误判成密码错误。

参考：[Docker Compose networking](https://docs.docker.com/compose/how-tos/networking/)｜[Compose startup order](https://docs.docker.com/compose/how-tos/startup-order/)
