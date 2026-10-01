---
title: 小机器不装面板：用脚本手撸 Nginx 反代并自动申请证书
published: 2026-10-01
description: 低配 VPS 装不动宝塔时，用一个 nginx 站点管理脚本完成反代、启用、证书申请与日志查看。
tags: [Nginx, 反向代理, 部署, certbot]
category: 问题解决
draft: false
---

# 小机器不装面板：用脚本手撸 Nginx 反代并自动申请证书

> 案例整理自 linux.do 原帖：[小鸡太小，面板不好安装，手撸nginx配置怎么方便](https://linux.do/t/topic/1486160)

![Nginx 反代配图 w-100](/assets/posts/linuxdo-nginx.webp "小机器也能优雅建站")

## 问题背景

手里是一台配置很低的 VPS（俗称"小鸡"），装宝塔这类面板既吃内存又拖慢系统，但手动写 Nginx 配置又很繁琐：建站、改配置、申请证书、看日志，每一步都要敲一堆命令。

原帖作者给出的解决办法是：**用一个 shell 脚本把常用操作封装成子命令**。

## 解决方案：一个脚本管理站点

脚本约定放在 `/root/nginx/nginx-site.sh`，并设置一个短别名（例如 `ng`）方便调用。常用子命令如下：

```bash
ng list                          # 查看所有网站
ng new myapp app.com 8080        # 创建新站点（名称 / 域名 / 后端端口）
ng enable myapp                  # 启用站点
ng cert app.com                  # 申请 SSL 证书
ng logs myapp                    # 查看日志
ng backup                        # 备份配置
ng reload                        # 重新加载 Nginx
```

脚本的本质是把三件事自动化：生成 `server` 配置块 → 软链到 `sites-enabled` → 调用 certbot 申请证书并 reload。

## 完整使用流程

以部署一个监听 3000 端口的服务（如 new-api）为例：

1. **先把服务跑起来**，确认 `curl http://127.0.0.1:3000` 有响应；
2. **创建反代**：`ng new newapi newapi.example.com 3000`；
3. **配置 DNS**：在域名服务商（如 Cloudflare）把域名 A 记录指向服务器 IP；
4. **启用站点**：`ng enable newapi`；
5. **申请证书**：`ng cert newapi.example.com`；
6. 如有复杂需求，直接改 `/etc/nginx/sites-available/` 下对应文件，然后 `ng reload`。

证书部分依赖 certbot，通常需要先安装：

```bash
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
```

## 手动配置时的核心要点

如果不想用脚本，手写一份反代配置的关键也就是这几行：

```nginx
server {
    listen 80;
    server_name app.example.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

改完一定先校验再重载：

```bash
sudo nginx -t && sudo systemctl reload nginx
```

## 常见坑

- **后端必须监听 `0.0.0.0`**，只监听 `127.0.0.1` 时外部访问不到（容器内同理）；
- **协议要统一**：让 Nginx 负责 HTTPS，后端保持 HTTP，否则容易出现 502；
- 出现 502 先查 `curl http://127.0.0.1:端口` 和后端日志，别急着改 Nginx；
- 端口要放行：`80/443` 需防火墙与安全组同时允许。

## 小结

"脚本化"不是为了炫技，而是把重复的运维动作变成可复用、可回滚的确定性操作。对小内存机器来说，一个几十行的 shell 脚本远比一个面板轻量，也更透明——出问题时你知道它到底做了什么。
