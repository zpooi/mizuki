---
title: 免费服务器上的服务总掉线：用 Python 写一个 SSH 保活脚本
published: 2026-10-01
description: 针对 Serv00 等免费主机服务被回收的问题，用 paramiko + schedule 定时检查进程并在掉线时自动拉起。
tags: [Python, 自动化, 运维, 保活]
category: 问题解决
draft: false
---

# 免费服务器上的服务总掉线：用 Python 写一个 SSH 保活脚本

> 案例整理自 linux.do 原帖：[自用Serv00保活脚本](https://linux.do/t/topic/434340)

![保活脚本配图 w-100](/assets/posts/linuxdo-keepalive.webp "让服务自己爬起来")

## 问题背景

Serv00 这类免费主机资源有限，挂在上面的服务（进程）时不时被回收或异常退出，需要人工登录去看、去重启。原帖作者的做法是：**在另一台常开的机器或电脑上跑一个 Python 脚本，定时 SSH 上去检查服务，没在跑就拉起来**。

## 解决思路

整体逻辑非常朴素，只有三步：

1. SSH 登录目标机器；
2. 检查目标进程是否存在；
3. 不存在就执行启动命令，并把结果记录下来。

用 `paramiko` 做 SSH，`schedule` 做定时，`time` 控制循环即可。

## 核心代码

```python
import time
import paramiko
import schedule


def check_service_and_start(hostname, port, username, password,
                            service_name, service_process_name,
                            service_start_command):
    """连接远程服务器，检查服务是否运行，未运行则启动。"""
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        print(f"尝试连接到 {hostname}:{port} 以检查服务：{service_name} ...")
        client.connect(hostname, port=port, username=username,
                       password=password, timeout=10)

        check_command = f"pgrep {service_process_name}"
        stdin, stdout, stderr = client.exec_command(check_command)
        exit_status = stdout.channel.recv_exit_status()

        if exit_status == 0:
            print(f"{service_name} 服务正在运行。")
        else:
            print(f"{service_name} 未运行，正在启动 ...")
            client.exec_command(service_start_command)
    finally:
        client.close()
```

配置部分与服务逻辑分离，只改配置不动代码：

```python
server_configurations = [
    {
        "hostname": "your-host.example.com",
        "port": 22,
        "username": "yourname",
        "password": "yourpass",
        "service_name": "myapp",
        "service_process_name": "myapp",
        "service_start_command": "nohup /home/user/myapp/run.sh >/dev/null 2>&1 &",
    },
]

schedule.every(10).minutes.do(
    lambda: [check_service_and_start(**cfg) for cfg in server_configurations]
)

while True:
    schedule.run_pending()
    time.sleep(1)
```

## 几个实现细节

- **用 `pgrep` 判断进程存在**：比 `ps | grep` 干净，不会匹配到 grep 自身（`pgrep` 在 Windows 上不可用，需换方案）；
- **启动命令要脱钩**：加 `nohup ... &` 并重定向输出，否则 SSH 会话关闭时进程可能被一起带走；
- **设置连接超时**：`timeout=10`，避免机器不可达时脚本一直卡住；
- **`finally` 里关闭连接**：循环任务最怕连接泄漏；
- 更稳妥的做法是改用 SSH key 认证，密码写进脚本有泄露风险。

## 还能怎么改进

- 把结果通过邮件/微信推送（如 WxPusher、Server 酱）通知，而不是只在控制台打印；
- 加连续失败计数，多次拉起失败时告警，避免"假活"；
- 用 systemd / supervisor 的 `Restart=always` 替代外部保活，如果机器支持的话这是首选。

## 小结

这类"保活脚本"解决的不是高深技术问题，而是一个现实矛盾：**资源受限的环境不会替你保证可用性**。

自己写一个几十行的检查脚本，把不确定性变成定时巡检，是运维自动化最朴素的起点。
