# Nginx + HTTPS 配置文档（2026-05-09）

## 文档说明

这份文档用于说明如何在当前测试服务器上完成：

- 配置 Nginx 反向代理
- 绑定域名
- 配置 HTTPS 证书
- 让 Make API 通过域名访问

适用环境：

- 阿里云 ECS
- Alibaba Cloud Linux 3
- 已安装 `nginx`
- 已安装 `go`
- 已安装 `bun`

## 一、整体目标

最终目标是让你的项目通过下面这种地址访问：

```text
https://你的域名
```

请求流程通常是：

```text
浏览器 -> Nginx(80/443) -> Go 服务(例如 3000)
```

也就是说：

- 用户访问的是 `80/443`
- 你的 Go 项目监听的是内部端口，例如 `3000`
- Nginx 负责把外部请求转发给 Go 项目

## 二、开始前需要准备什么

在配置 Nginx 和 HTTPS 之前，你要先准备好这些：

1. 一台公网服务器
2. 一个域名
3. 域名已经解析到服务器公网 IP
4. 安全组已放行 `80`、`443`、`22`
5. Make API 项目已经可以在服务器本机启动

## 三、先确认域名已经解析

### 1. 需要做什么

在域名控制台添加 `A` 记录，把域名解析到服务器公网 IP。

例如：

- 主机记录：`@`
- 记录值：`47.95.179.199`

如果你想用子域名：

- 主机记录：`api`
- 记录值：`47.95.179.199`

那么最终访问地址就是：

```text
https://api.你的域名.com
```

### 2. 本地验证解析

在你本地电脑命令行执行：

```bash
nslookup 你的域名
```

### 作用

- 查询域名当前解析到哪个 IP

### 正常情况

应该返回你服务器的公网 IP。

## 四、先让 Go 项目跑起来

在配置 Nginx 之前，先确保你的后端程序已经能在服务器本机访问。

假设你的 Go 项目准备监听 `3000` 端口。

### 1. 启动项目

```bash
cd /root/你的项目目录
nohup go run main.go > server.out.log 2> server.err.log &
```

### 作用解释

- `cd /root/你的项目目录`：进入项目目录
- `nohup`：终端关闭后程序继续运行
- `go run main.go`：启动 Go 程序
- `> server.out.log`：标准输出写入日志
- `2> server.err.log`：错误输出写入错误日志
- `&`：放到后台运行

### 2. 查看是否启动成功

```bash
tail -f server.out.log
```

### 作用

- 实时查看程序启动日志

如果报错，再看：

```bash
tail -f server.err.log
```

### 3. 查看端口监听

```bash
ss -lntp | grep 3000
```

### 作用

- 查看系统是否有程序监听 `3000` 端口

### 正常情况

应该看到类似：

```bash
LISTEN ... :3000
```

### 4. 本机访问验证

```bash
curl http://127.0.0.1:3000
```

### 作用

- 在服务器本机访问 Go 服务
- 验证项目本身是否启动正常

### 结论

只有当 `curl http://127.0.0.1:3000` 能返回内容时，才进入下一步配置 Nginx。

## 五、Nginx 反向代理原理

这里的核心逻辑是：

- Nginx 对外监听 `80` 和 `443`
- Go 程序对内监听 `3000`
- 用户不直接访问 `3000`
- 用户访问域名时由 Nginx 转发

好处：

1. 可以统一走域名
2. 可以挂 HTTPS
3. 可以隐藏内部端口
4. 后面更方便做静态资源、限流、日志等

## 六、Nginx 配置文件位置

在当前系统里，常用位置是：

- 主配置：`/etc/nginx/nginx.conf`
- 子配置目录：`/etc/nginx/conf.d/`

建议不要把所有内容都写进主配置，最好单独建站点配置文件。

例如：

```text
/etc/nginx/conf.d/make-api.conf
```

## 七、先配置 HTTP 反向代理

### 1. 新建配置文件

执行：

```bash
vi /etc/nginx/conf.d/make-api.conf
```

### 作用

- 使用 `vi` 编辑器新建或编辑 Nginx 配置文件

如果你不习惯 `vi`，也可以安装 `vim`：

```bash
yum install -y vim
```

然后用：

```bash
vim /etc/nginx/conf.d/make-api.conf
```

### 2. 写入下面内容

把 `your-domain.com` 替换成你的真实域名。

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 每一段的解释

`listen 80;`

- 监听 HTTP 默认端口 80

`server_name your-domain.com www.your-domain.com;`

- 指定这个配置作用于哪些域名

`location / { ... }`

- 匹配所有请求路径

`proxy_pass http://127.0.0.1:3000;`

- 把请求转发给本机 `3000` 端口上的 Go 服务

`proxy_set_header Host $host;`

- 把原始域名传给后端

`proxy_set_header X-Real-IP $remote_addr;`

- 把真实客户端 IP 传给后端

`proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;`

- 记录代理链路中的客户端 IP

`proxy_set_header X-Forwarded-Proto $scheme;`

- 告诉后端当前请求是 `http` 还是 `https`

## 八、检查 Nginx 配置是否正确

### 命令

```bash
nginx -t
```

### 作用

- 检查 Nginx 配置文件语法

### 正常结果

应该看到类似：

```bash
syntax is ok
test is successful
```

如果这里报错，先不要重启 Nginx，先改配置。

## 九、重载 Nginx 配置

### 命令

```bash
systemctl reload nginx
```

### 作用

- 重新加载 Nginx 配置
- 不中断现有服务

### 如果 reload 失败

可以先看状态：

```bash
systemctl status nginx
```

或者查看错误日志：

```bash
tail -f /var/log/nginx/error.log
```

## 十、验证 HTTP 反向代理

### 1. 服务器本机验证

```bash
curl -H "Host: your-domain.com" http://127.0.0.1
```

### 作用

- 模拟带域名头的 HTTP 请求
- 验证 Nginx 是否已经把请求转发给 Go 服务

### 2. 公网验证

在本地浏览器打开：

```text
http://your-domain.com
```

### 正常结果

如果打开的是你的项目页面，而不是 Nginx 默认页，说明反向代理配置成功。

## 十一、安装 HTTPS 证书工具

最常用的是 `certbot`。

在 Alibaba Cloud Linux 3 上，推荐先安装 `epel-release`：

```bash
yum install -y epel-release
```

然后安装 `certbot` 和 Nginx 插件：

```bash
yum install -y certbot python3-certbot-nginx
```

### 作用解释

`certbot`

- 用于申请和管理 Let's Encrypt 证书

`python3-certbot-nginx`

- 让 certbot 能直接识别并修改 Nginx 配置

## 十二、申请 HTTPS 证书

### 命令

把域名替换成你自己的：

```bash
certbot --nginx -d your-domain.com -d www.your-domain.com
```

### 作用

- 自动申请 Let's Encrypt 免费证书
- 自动把证书写到 Nginx 配置里

### 执行过程中会发生什么

通常会要求你：

1. 输入邮箱
2. 同意服务条款
3. 选择是否跳转 HTTP 到 HTTPS

### 建议选择

建议选：

- 自动跳转到 HTTPS

这样后面用户访问 `http://` 也会自动转成 `https://`

## 十三、申请证书成功后大概会变成什么样

成功后，Nginx 配置通常会被 certbot 自动改造成类似下面结构：

```nginx
server {
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
}

server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$host$request_uri;
}
```

### 解释

`listen 443 ssl;`

- 监听 HTTPS 端口

`ssl_certificate`

- 公钥证书文件路径

`ssl_certificate_key`

- 私钥文件路径

`return 301 https://$host$request_uri;`

- 把所有 HTTP 请求永久重定向到 HTTPS

## 十四、验证 HTTPS

### 1. 浏览器验证

直接访问：

```text
https://your-domain.com
```

### 正常情况

- 浏览器地址栏显示锁标志
- 项目页面正常打开

### 2. 命令行验证

```bash
curl -I https://your-domain.com
```

### 作用

- 只查看响应头
- 快速确认 HTTPS 是否正常

### 如果你配置了 HTTP 自动跳转

可以再验证：

```bash
curl -I http://your-domain.com
```

### 正常结果

应该看到：

```bash
301 Moved Permanently
```

并跳转到 `https://`

## 十五、把 Make API 配置成正式域名

项目部署成功后，需要把后台里的 `ServerAddress` 改成你的正式地址。

例如：

```text
https://your-domain.com
```

### 为什么必须改

因为这个项目里很多地方会依赖 `ServerAddress`：

- 回调地址
- 支付通知地址
- 页面链接

如果不改，后面在线充值、OAuth 回调、外链等很容易错。

## 十六、常见问题

### 问题 1：域名打不开

排查顺序：

1. 域名是否解析到服务器公网 IP
2. 安全组是否放行 `80` / `443`
3. Nginx 是否正在运行
4. Go 项目是否真的监听在 `3000`
5. Nginx 配置里的 `server_name` 是否写对

### 问题 2：只能打开 Nginx 默认页

原因通常是：

- 你的反向代理配置没生效
- 没有 reload nginx
- 域名没命中你新写的 `server` 配置

检查：

```bash
nginx -t
systemctl reload nginx
```

### 问题 3：HTTPS 申请失败

常见原因：

1. 域名没解析成功
2. `80` 端口没开放
3. Nginx 没启动
4. 域名被墙或解析没生效
5. 服务器无法被 Let's Encrypt 校验访问

### 问题 4：后端获取不到真实 IP

通常是 `proxy_set_header` 没配好。

至少保留：

```nginx
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
```

### 问题 5：项目页面能打开，但资源加载失败

排查：

1. 前端构建是否完成
2. Go 服务日志是否报静态资源找不到
3. 当前主题资源是否已构建
4. 浏览器控制台是否 404

## 十七、推荐的完整配置顺序

建议按下面顺序做：

1. 域名解析到公网 IP
2. 服务器启动 Go 服务
3. 本机 `curl 127.0.0.1:3000` 确认服务正常
4. 写 Nginx HTTP 反向代理
5. `nginx -t`
6. `systemctl reload nginx`
7. 浏览器测试 `http://域名`
8. 安装 certbot
9. 申请 HTTPS 证书
10. 浏览器测试 `https://域名`
11. 后台把 `ServerAddress` 改为正式域名
12. 再做支付回调或 OAuth 回调

## 十八、今天可以直接复用的命令清单

下面是一套最短命令顺序，实际执行时记得替换域名和项目目录：

```bash
cd /root/你的项目目录
nohup go run main.go > server.out.log 2> server.err.log &
ss -lntp | grep 3000
curl http://127.0.0.1:3000
vi /etc/nginx/conf.d/make-api.conf
nginx -t
systemctl reload nginx
curl -H "Host: your-domain.com" http://127.0.0.1
yum install -y epel-release
yum install -y certbot python3-certbot-nginx
certbot --nginx -d your-domain.com -d www.your-domain.com
curl -I https://your-domain.com
```

## 十九、下一步建议

配置完 Nginx 和 HTTPS 后，建议继续做：

1. 部署 Make API 正式进程管理方式
2. 改成 `systemd` 托管 Go 服务
3. 配置自动重启
4. 配置日志轮转
5. 再做支付配置

