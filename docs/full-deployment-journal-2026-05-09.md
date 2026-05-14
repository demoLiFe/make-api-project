# Make API 完整部署过程记录（2026-05-09）

## 文档目的

这份文档记录今天实际部署 `Make API` 到阿里云 ECS 的完整过程，尽量按下面方式写：

- 每一步做了什么
- 为什么这么做
- 每条命令的作用
- 遇到的报错代表什么
- 最后怎么解决

这份文档适合后面做这些事情：

- 重新部署一台测试服务器
- 给别人照着部署
- 以后整理正式环境部署文档

---

## 一、环境背景

### 1. 服务器环境

- 云厂商：阿里云 ECS
- 系统：`Alibaba Cloud Linux 3 (OpenAnolis Edition)`
- 用户：`root`
- 服务器公网 IP：`47.95.179.199`

### 2. 项目情况

- 项目目录：`/root/make-api-project`
- 前端主题目标：`classic`
- 后端运行端口：`3000`
- 对外访问方式：`Nginx -> Go 服务`

### 3. 一个重要前提

这个项目的后端启动时会把前端构建产物直接 `embed` 到 Go 二进制里，所以：

- `web/default/dist` 不能缺
- `web/classic/dist` 不能缺

即使你只想用 `classic`，`default/dist` 也必须存在。

---

## 二、刚连接服务器时看到的黑窗口是什么

连接阿里云服务器后，看到的是 Linux Shell，不是 Windows 桌面。

示例：

```bash
[root@xxxx ~]#
```

这表示：

- 已成功登录服务器
- 当前用户是 `root`
- 当前是命令行模式

这不是异常，而是最正常的 Linux 服务器使用方式。

---

## 三、确认系统版本

### 执行命令

```bash
cat /etc/os-release
```

### 命令作用

- `cat`：把文件内容直接打印到终端
- `/etc/os-release`：Linux 系统版本信息文件

### 为什么要执行

因为要先判断：

- 这台服务器是 `Ubuntu` 还是 `CentOS/RHEL` 系
- 后面到底该用 `apt` 还是 `yum`

### 实际结果

输出里看到了：

```bash
NAME="Alibaba Cloud Linux"
VERSION="3 (OpenAnolis Edition)"
```

### 结论

这台机器可以按 `CentOS / RHEL` 系方式处理，后面主要使用：

- `yum`
- `systemctl`

---

## 四、安装基础工具

### 1. 更新系统

#### 执行命令

```bash
yum update -y
```

#### 命令作用

- `yum`：系统包管理器
- `update`：更新系统软件包
- `-y`：自动确认，避免手动输入 `y`

#### 为什么要做

- 避免系统过旧
- 降低依赖冲突概率

### 2. 安装基础软件

#### 执行命令

```bash
yum install -y git curl wget unzip tar
```

#### 每个包的作用

- `git`：拉代码
- `curl`：下载文件、请求接口
- `wget`：下载文件
- `unzip`：Bun 安装脚本要用
- `tar`：解压 tar.gz 包

#### 为什么要装

后面安装 Bun、Go、拉项目代码、打包解压都要依赖这些工具。

---

## 五、安装 Bun

### 1. 执行安装命令

```bash
curl -fsSL https://bun.sh/install | bash
```

### 命令作用拆解

- `curl`：从网络下载内容
- `-f`：请求失败时直接报错
- `-s`：静默模式
- `-S`：静默模式下如果失败，仍然显示错误
- `-L`：自动跟随重定向
- `| bash`：把下载到的安装脚本直接交给 `bash` 执行

### 实际遇到的问题

第一次执行时报错：

```text
error: unzip is required to install bun
```

### 这个报错的意思

服务器没安装 `unzip`，而 Bun 安装脚本需要解压 zip 包。

### 解决办法

#### 执行命令

```bash
yum install -y unzip
```

#### 命令作用

- 安装 `unzip`
- `-y` 自动确认安装

### 2. 重新执行 Bun 安装

```bash
curl -fsSL https://bun.sh/install | bash
```

### 3. 让环境变量立刻生效

```bash
source /root/.bashrc
```

### 命令作用

- `source`：重新加载 shell 配置文件
- `/root/.bashrc`：root 用户的 bash 配置文件

### 为什么要执行

Bun 安装脚本会把 Bun 路径写进 `.bashrc`，不重新加载的话当前窗口找不到 Bun 命令。

### 4. 验证 Bun

```bash
bun -v
```

### 命令作用

- 查看 Bun 版本
- 检查是否安装成功

### 实际结果

```bash
1.3.13
```

说明 Bun 已成功安装。

---

## 六、安装 Go

### 1. 切换到 root 目录

#### 执行命令

```bash
cd /root
```

#### 命令作用

- `cd`：切换目录
- `/root`：root 用户主目录

### 2. 确认当前目录

```bash
pwd
```

### 命令作用

- `pwd`：打印当前目录路径

### 为什么要执行

防止把下载命令输在错误目录里。

### 实际踩过的坑

有一次把命令写串了，例如类似：

```bash
ls -ld .cd /root
```

这会被 shell 当成错误命令解析。

正确做法是：

```bash
cd /root
pwd
```

### 3. 下载 Go 1.25.0

最开始尝试的是：

```bash
wget https://go.dev/dl/go1.25.0.linux-amd64.tar.gz
```

### 遇到的问题

出现了：

- TLS 异常
- 连接超时
- 无法建立 SSL 连接

### 原因

服务器到 `go.dev` 的访问链路不稳定。

### 解决办法：换下载地址

#### 执行命令

```bash
curl -L -o go1.25.0.linux-amd64.tar.gz https://dl.google.com/go/go1.25.0.linux-amd64.tar.gz
```

#### 命令作用拆解

- `curl`：下载文件
- `-L`：跟随跳转
- `-o 文件名`：把下载结果保存成指定文件名

### 4. 删除旧版 Go

```bash
rm -rf /usr/local/go
```

### 命令作用

- `rm`：删除文件或目录
- `-r`：递归删除目录
- `-f`：强制删除，不提示

### 为什么做

防止新旧版本冲突。

### 5. 解压 Go

```bash
tar -C /usr/local -xzf /root/go1.25.0.linux-amd64.tar.gz
```

### 命令作用拆解

- `tar`：处理 tar 包
- `-C /usr/local`：解压到 `/usr/local`
- `-x`：解压
- `-z`：gzip 压缩格式
- `-f`：指定文件

### 6. 配置环境变量

```bash
echo 'export PATH=$PATH:/usr/local/go/bin' >> /root/.bashrc
```

### 命令作用

- `echo`：输出字符串
- `>>`：把内容追加到文件末尾

### 为什么要做

让系统能在任意目录直接执行 `go` 命令。

### 7. 重新加载环境变量

```bash
source /root/.bashrc
```

### 8. 验证版本

```bash
go version
```

### 命令作用

- 查看 Go 实际版本
- 确认安装成功

---

## 七、安装和启动 Nginx

### 1. 安装 Nginx

```bash
yum install -y nginx
```

### 命令作用

- 安装 Nginx Web 服务器

### 2. 设置开机自启

```bash
systemctl enable nginx
```

### 命令作用

- `systemctl`：systemd 服务管理命令
- `enable`：设置服务开机自动启动

### 3. 立即启动 Nginx

```bash
systemctl start nginx
```

### 命令作用

- 立刻启动 Nginx

### 4. 查看状态

```bash
systemctl status nginx
```

### 命令作用

- 查看服务运行状态

### 实际结果

看到：

```text
Active: active (running)
```

说明 Nginx 已成功运行。

### 注意

这个命令会进入分页界面，退出要按：

```text
q
```

---

## 八、安全组放行

### 放行端口

- `22`
- `80`
- `443`

### 这些端口分别干什么

- `22`：SSH 登录
- `80`：HTTP
- `443`：HTTPS

### 测试阶段配置

- 授权对象：`0.0.0.0/0`

### 这表示什么

- 任意公网 IP 都能访问

### 是否推荐

测试环境可以这样先开通。  
正式环境建议限制 `22` 的来源 IP。

---

## 九、前端构建：服务器构建失败

### 目标

原本希望在服务器直接构建：

- `web/default`
- `web/classic`

### 实际执行

例如在服务器里执行了类似：

```bash
cd /root/make-api-project/web/default
bun run build
```

### 实际报错

```text
error: script "build" was terminated by signal SIGKILL
Killed
```

### 报错含义

- 不是构建脚本语法错
- 是 Linux 系统直接把进程杀掉了
- 最常见原因是内存不够

### 服务器内存情况

执行：

```bash
free -h
```

看到：

- 总内存约 `1.8G`
- 没有 swap

### 为什么会这样

前端构建在这台 `2G` 左右机器上会出现瞬时高内存占用，系统触发 `OOM Killer` 把进程杀掉。

### 先尝试的解决办法：加 swap

#### 创建 swap 文件

```bash
fallocate -l 2G /swapfile
```

#### 命令作用

- 创建一个 2GB 的交换文件

#### 设置权限

```bash
chmod 600 /swapfile
```

#### 命令作用

- 只允许 root 读写这个文件

#### 格式化为 swap

```bash
mkswap /swapfile
```

#### 命令作用

- 把文件格式化为交换分区

#### 启用 swap

```bash
swapon /swapfile
```

#### 命令作用

- 立即启用 swap

#### 检查生效

```bash
free -h
```

#### 持久化

```bash
echo '/swapfile swap swap defaults 0 0' >> /etc/fstab
```

#### 命令作用

- 让服务器重启后自动挂载 swap

### 结果

即使加了 2GB swap，`bun run build` 依然可能被 `SIGKILL`，说明这台机器构建前端仍然不稳定。

### 最终策略

不再在服务器构建前端，改成：

- 本地构建
- 上传 `dist`
- 服务器只跑 Go 和 Nginx

---

## 十、本地构建前端

### 1. 本地构建 classic

```bash
cd web/classic
bun install
bun run build
```

### 每条命令作用

`cd web/classic`

- 进入 classic 前端目录

`bun install`

- 安装 classic 前端依赖

`bun run build`

- 执行生产构建
- 生成 `web/classic/dist`

### 2. 本地构建 default

```bash
cd ../default
bun install
bun run build
```

### 为什么 default 也要构建

因为这个项目后端在启动时会 embed：

- `web/default/dist`
- `web/classic/dist`

所以即使只想用 classic，也要保证 default 的 dist 存在。

---

## 十一、上传 dist 到服务器

### 已知前提

本地两个构建产物都准备好了：

- `web/classic/dist`
- `web/default/dist`

### 1. 上传 classic dist

在本地 PowerShell 执行：

```powershell
scp -r .\web\classic\dist root@47.95.179.199:/root/make-api-project/web/classic/
```

### 命令作用

- `scp`：通过 SSH 复制文件
- `-r`：递归复制整个目录
- `.\web\classic\dist`：本地 classic 构建产物
- `root@47.95.179.199:...`：服务器目标路径

### 第一次连接时出现的提示

```text
The authenticity of host ... can't be established.
Are you sure you want to continue connecting ...?
```

### 这是什么意思

- 这是第一次连接服务器
- 本机还没记住这台服务器的 SSH 指纹
- 不是报错

### 该怎么做

输入：

```text
yes
```

然后回车，再输入服务器密码。

### 2. 上传 default dist

```powershell
scp -r .\web\default\dist root@47.95.179.199:/root/make-api-project/web/default/
```

### 3. 在服务器验证是否上传成功

```bash
ls /root/make-api-project/web/classic/dist
ls /root/make-api-project/web/default/dist
```

### 命令作用

- `ls`：列出目录内容

### 实际结果

两个目录都存在，说明前端构建产物已经准备好。

---

## 十二、启动 Go 后端：第一次失败原因

### 启动命令

```bash
cd /root/make-api-project
nohup go run main.go > server.out.log 2> server.err.log &
```

### 命令作用拆解

- `cd /root/make-api-project`：进入项目根目录
- `nohup`：让程序在终端关闭后继续运行
- `go run main.go`：直接编译并运行 Go 程序
- `> server.out.log`：标准输出写入日志文件
- `2> server.err.log`：错误输出写入错误日志
- `&`：后台运行

### 第一次失败现象

看日志时发现：

```text
go: downloading go1.25.1 (linux/amd64)
... proxy.golang.org ... timeout
```

### 报错含义

Go 在尝试自动下载 `1.25.1` 工具链，但服务器访问不到 `proxy.golang.org`。

### 解决办法：禁止自动下载 toolchain

```bash
go env -w GOTOOLCHAIN=local
```

### 命令作用

- `go env -w`：把 Go 环境变量持久写入配置
- `GOTOOLCHAIN=local`：强制只使用本机已安装的 Go

### 验证

```bash
go env GOTOOLCHAIN
```

应该输出：

```text
local
```

---

## 十三、启动 Go 后端：第二次失败原因

### 继续查看错误日志

```bash
tail -n 100 server.err.log
```

### 命令作用

- `tail -n 100`：查看文件最后 100 行

### 实际错误

```text
go.mod requires go >= 1.25.1 (running go 1.25.0; GOTOOLCHAIN=local)
```

### 含义

- 项目要求 Go `1.25.1`
- 服务器实际装的是 `1.25.0`

### 解决办法：升级 Go 到 1.25.1

#### 下载 1.25.1

```bash
cd /root
curl -L -o go1.25.1.linux-amd64.tar.gz https://dl.google.com/go/go1.25.1.linux-amd64.tar.gz
```

#### 删除旧版

```bash
rm -rf /usr/local/go
```

#### 解压新版

```bash
tar -C /usr/local -xzf /root/go1.25.1.linux-amd64.tar.gz
```

#### 重新加载环境变量

```bash
source /root/.bashrc
```

#### 验证版本

```bash
go version
```

### 实际结果

最终 Go 变成：

```text
go version go1.25.1 linux/amd64
```

---

## 十四、下载 Go 依赖

### 第一次执行问题

有一次直接执行：

```bash
go mod download
```

但不在项目目录，所以报：

```text
go: no modules specified
```

### 含义

- 当前目录没有 `go.mod`
- 所以 Go 不知道下载哪个模块

### 正确做法

先进入项目目录：

```bash
cd /root/make-api-project
go mod download
```

### 如果觉得没进度怎么办

Go 默认没有明显进度条。

### 查看更详细输出

```bash
go mod download -x
```

### 命令作用

- `-x`：打印执行过程中的详细下载动作

### 如果国外依赖很慢，改 Go 代理

```bash
go env -w GOPROXY=https://goproxy.cn,direct
go env -w GOSUMDB=sum.golang.google.cn
```

### 命令作用

- `GOPROXY`：Go 依赖下载代理
- `GOSUMDB`：Go 依赖校验服务地址

### 为什么这么设

让服务器优先走国内更稳定的代理。

### 实际结果

依赖下载完成。

---

## 十五、Go 服务最终启动成功

### 启动命令

```bash
cd /root/make-api-project
nohup go run main.go > server.out.log 2> server.err.log &
```

### 观察日志

```bash
tail -f server.out.log
```

### 命令作用

- `tail -f`：持续跟踪日志文件新增内容

### 最终看到的关键日志

```text
Make API v0.0.0 started
Make API v0.0.0 ready in 863 ms
Local:   http://localhost:3000/
Network: http://172.20.55.250:3000/
```

### 这说明什么

- 后端服务已成功启动
- 已经监听 `3000`
- 本机可以访问 `127.0.0.1:3000`

### 日志里的这句不是错误

```text
system is not initialized and no root user exists
```

### 这是什么意思

- 数据库里还没有初始化数据
- 还没有管理员账号
- 这是首次安装的正常状态，不是启动失败

---

## 十六、Nginx 配置阶段的问题

### 浏览器访问公网 IP 后看到的页面

看到的是：

```text
Welcome to HTTP Server Test Page!
Thank you for using apache httpd.
```

### 这意味着什么

访问到的不是 Make API 页面，而是某个默认站点页面。

### 先检查 80 端口归谁管

```bash
ss -lntp | grep :80
```

### 命令作用

- `ss`：查看网络端口监听
- `-l`：只看监听状态
- `-n`：数字形式显示端口
- `-t`：只看 TCP
- `-p`：显示进程信息

### 实际结果

看到是 `nginx` 在监听 `80`。

这说明：

- 不是 `httpd` 抢占了端口
- 而是 Nginx 当前生效配置仍然指向默认静态页

### 再检查 Nginx 状态

```bash
systemctl status nginx --no-pager
```

### 命令作用

- `--no-pager`：不要进入分页界面，直接打印

### 结论

Nginx 正常运行，但配置没有命中目标反代规则。

---

## 十七、建议的 Nginx 反向代理配置

当服务已经跑在 `3000` 后，建议直接写一个默认站点配置。

### 写配置文件

```bash
cat > /etc/nginx/conf.d/make-api.conf <<'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
```

### 命令作用

- `cat > 文件 <<'EOF' ... EOF`：把一大段文本直接写入配置文件
- `listen 80 default_server`：将这个站点设为 80 端口默认站点
- `server_name _;`：匹配所有域名或 IP 访问
- `proxy_pass http://127.0.0.1:3000;`：把外部请求转发给本机 3000 端口的 Go 服务

### 检查配置

```bash
nginx -t
```

### 命令作用

- 检查 Nginx 配置语法是否正确

### 重启或重载 Nginx

```bash
systemctl restart nginx
```

或：

```bash
systemctl reload nginx
```

### 区别

- `restart`：重启服务
- `reload`：重新加载配置，尽量不中断服务

---

## 十八、如何验证反代是否生效

### 1. 本机直接访问后端

```bash
curl http://127.0.0.1:3000
```

### 作用

- 绕过 Nginx，直接验证 Go 服务本身是否正常

### 2. 本机访问 Nginx

```bash
curl http://127.0.0.1
```

### 作用

- 检查 Nginx 当前默认返回的内容

### 3. 带 Host 头访问 Nginx

```bash
curl -H "Host: 47.95.179.199" http://127.0.0.1
```

### 作用

- 模拟浏览器带 Host 头访问
- 验证 Nginx 的站点匹配逻辑

### 4. 浏览器访问公网 IP

```text
http://47.95.179.199
```

如果最终看到的是初始化页面，而不是默认测试页，说明反代成功。

---

## 十九、classic 主题说明

当前部署目标是：

- 只使用 `classic`

### 实际做法

- 本地同时构建了 `default` 和 `classic`
- 上传了两个 dist
- 运行时最终只让系统使用 `classic`

### 为什么这样

因为 Go 启动时需要两个前端构建目录都存在，但业务实际主题可以只用 `classic`。

---

## 二十、今天所有关键命令汇总

下面这段不是严格一步不差的历史记录，而是把今天真正用到的关键命令按正确顺序整理成了可复用版。

### 1. 基础环境安装

```bash
cat /etc/os-release
yum update -y
yum install -y git curl wget unzip tar nginx
```

### 2. 安装 Bun

```bash
curl -fsSL https://bun.sh/install | bash
source /root/.bashrc
bun -v
```

### 3. 安装 Go

```bash
cd /root
curl -L -o go1.25.1.linux-amd64.tar.gz https://dl.google.com/go/go1.25.1.linux-amd64.tar.gz
rm -rf /usr/local/go
tar -C /usr/local -xzf /root/go1.25.1.linux-amd64.tar.gz
echo 'export PATH=$PATH:/usr/local/go/bin' >> /root/.bashrc
source /root/.bashrc
go version
```

### 4. 启动 Nginx

```bash
systemctl enable nginx
systemctl start nginx
systemctl status nginx
```

### 5. 创建 swap

```bash
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile swap swap defaults 0 0' >> /etc/fstab
free -h
```

### 6. Go 代理与工具链

```bash
go env -w GOTOOLCHAIN=local
go env -w GOPROXY=https://goproxy.cn,direct
go env -w GOSUMDB=sum.golang.google.cn
go env GOTOOLCHAIN
go env GOPROXY
go env GOSUMDB
```

### 7. 下载依赖

```bash
cd /root/make-api-project
go mod download -x
```

### 8. 启动后端

```bash
cd /root/make-api-project
nohup go run main.go > server.out.log 2> server.err.log &
tail -f server.out.log
```

### 9. Nginx 反代

```bash
cat > /etc/nginx/conf.d/make-api.conf <<'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
nginx -t
systemctl restart nginx
```

---

## 二十一、今天踩过的坑总结

### 坑 1：Bun 安装失败

原因：

- 缺少 `unzip`

### 坑 2：Go 官方下载地址不稳定

原因：

- 服务器访问 `go.dev` 不稳定

解决：

- 改用 `dl.google.com`

### 坑 3：服务器构建前端被杀

原因：

- 机器内存小
- 构建过程触发 `SIGKILL`

解决：

- 本地构建前端
- 服务器只跑 Go

### 坑 4：Go 自动下载工具链失败

原因：

- 服务器访问不到 `proxy.golang.org`

解决：

- `go env -w GOTOOLCHAIN=local`

### 坑 5：Go 版本不够

原因：

- 项目要求 `1.25.1`
- 机器上是 `1.25.0`

解决：

- 手动升级 Go 到 `1.25.1`

### 坑 6：Go 依赖下载慢

原因：

- 国外依赖拉取慢

解决：

- 配 `GOPROXY`
- 配 `GOSUMDB`

### 坑 7：浏览器打开的是默认测试页

原因：

- Nginx 默认站点优先级或默认配置未替换

解决：

- 写 `default_server`
- 直接把所有流量反代到 `127.0.0.1:3000`

---

## 二十二、下一步建议

今天完成到这里后，后面建议继续做：

1. 完成 Nginx 反向代理最终验证
2. 初始化系统管理员
3. 确认主题为 `classic`
4. 绑定域名
5. 配置 HTTPS
6. 把 Go 服务改成 `systemd` 托管
7. 配置日志轮转

---

## 二十三、关联文档

本仓库里今天还额外整理了两份文档：

- [部署基础文档](D:/学习/make-api-private/docs/deployment-guide-2026-05-09.md)
- [Nginx + HTTPS 文档](D:/学习/make-api-private/docs/nginx-https-guide-2026-05-09.md)

