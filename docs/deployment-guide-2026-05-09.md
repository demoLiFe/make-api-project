# Make API 测试环境部署文档（2026-05-09）

## 文档说明

这份文档整理了今天实际走过的一整套部署流程，目标是：

- 购买一台测试服务器
- 连接阿里云 ECS
- 安装基础环境
- 安装 `Bun`
- 安装 `Go`
- 安装并启动 `Nginx`
- 放行安全组
- 准备后续部署 `Make API`

本文档尽量按“命令 + 作用 + 常见问题”的方式写，后面你自己重新部署时可以直接照着操作。

## 一、为什么买的是这个服务器界面

你买的是 `Linux 云服务器`，不是 `Windows 远程桌面服务器`。

所以连上以后看到的是：

```bash
[root@xxxx ~]#
```

这表示：

- 你已经成功登录服务器
- 当前登录用户是 `root`
- 当前界面是 `Shell`，也就是命令行终端

这不是异常，反而是最适合部署项目的环境。

## 二、服务器与域名选择建议

### 1. 服务器建议

测试环境建议：

- 地域：`中国香港`
- CPU / 内存：`2 核 2G`
- 带宽：`3M ~ 5M`
- 系统：`Alibaba Cloud Linux 3` 或 `Ubuntu 22.04`

原因：

- 中国香港通常不用备案
- 对接支付回调、域名访问更省事
- 测试环境不需要太高配置

### 2. 域名建议

优先建议：

- `.com`

可选补充：

- `.cn`

说明：

- `.com` 更通用，用户接受度更高
- `.cn` 更偏国内品牌保护
- 是否需要备案主要看服务器地域，不是看域名后缀

## 三、连接服务器

你今天是通过阿里云 Workbench 连接的，这种方式没有问题。

看到类似内容说明连接成功：

```bash
Welcome to Alibaba Cloud Elastic Compute Service!
Last login: ...
[root@xxxx ~]#
```

## 四、确认系统版本

### 命令

```bash
cat /etc/os-release
```

### 作用

- 查看当前 Linux 发行版
- 判断后续该用 `yum` 还是 `apt`

### 今天的实际结果

```bash
NAME="Alibaba Cloud Linux"
VERSION="3 (OpenAnolis Edition)"
```

### 结论

这类系统可以按 `CentOS / RHEL` 系处理，也就是：

- 使用 `yum`
- 服务管理使用 `systemctl`

## 五、更新系统

### 命令

```bash
yum update -y
```

### 作用解释

- `yum`：系统包管理器
- `update`：更新已安装软件包
- `-y`：自动确认，不需要你手动输入 `y`

### 为什么要做

- 避免系统包过旧
- 减少后续安装依赖时的兼容问题

### 注意

- 这一步可能需要几分钟
- 输出很多文字是正常的

## 六、安装基础工具

### 命令

```bash
yum install -y git curl wget unzip tar
```

### 作用解释

- `git`：后续拉代码
- `curl`：下载文件、请求接口
- `wget`：下载文件
- `unzip`：解压 `.zip` 文件
- `tar`：解压 `.tar.gz` 文件

### 为什么要做

后面安装 Bun、Go、拉代码、解压项目都需要这些工具。

## 七、安装 Bun

### 1. 安装命令

```bash
curl -fsSL https://bun.sh/install | bash
```

### 作用解释

- `curl`：从网络下载内容
- `-f`：请求失败时直接报错
- `-s`：静默输出
- `-S`：静默模式下如果出错仍然显示错误
- `-L`：自动跟随跳转
- `| bash`：把下载到的安装脚本交给 `bash` 执行

### 这条命令在做什么

它会：

- 从 Bun 官网下载安装脚本
- 在当前用户目录下安装 Bun
- 把 Bun 的环境变量写进 `~/.bashrc`

### 2. 让环境变量生效

```bash
source /root/.bashrc
```

### 作用解释

- `source`：让当前终端重新加载配置文件
- `/root/.bashrc`：root 用户的 shell 配置文件

### 为什么要做

不执行这一步的话，刚装好的 Bun 可能当前窗口还找不到。

### 3. 验证 Bun

```bash
bun -v
```

### 作用

- 查看 Bun 版本
- 判断是否安装成功

### 今天的实际结果

```bash
1.3.13
```

### 常见问题

#### 问题 1：报错 `unzip is required to install bun`

原因：

- 服务器没有安装 `unzip`

解决：

```bash
yum install -y unzip
```

然后重新执行：

```bash
curl -fsSL https://bun.sh/install | bash
```

## 八、安装 Go

### 1. 先切换到下载目录

```bash
cd /root
```

### 作用解释

- `cd`：切换目录
- `/root`：root 用户主目录

### 为什么要做

下载大文件时放在 `/root` 更稳，避免权限或路径问题。

### 2. 确认当前目录

```bash
pwd
```

### 作用

- 查看当前所在目录

如果输出：

```bash
/root
```

说明目录对了。

### 3. 下载 Go 安装包

```bash
curl -L -o go1.25.0.linux-amd64.tar.gz https://dl.google.com/go/go1.25.0.linux-amd64.tar.gz
```

### 作用解释

- `curl`：下载内容
- `-L`：如果下载地址有跳转，自动跟随
- `-o go1.25.0.linux-amd64.tar.gz`：把下载内容保存成这个文件名

### 为什么不直接用 `go.dev`

今天实际测试时：

- `go.dev` 在服务器上出现过超时和 TLS 异常
- 改用 `dl.google.com` 后成功下载

### 4. 删除旧版 Go

```bash
rm -rf /usr/local/go
```

### 作用解释

- `rm`：删除
- `-r`：递归删除目录
- `-f`：强制删除，不提示确认

### 为什么要做

- 避免旧版 Go 与新版冲突

### 注意

这条命令有删除行为，但这里删除的是固定的 Go 安装目录，属于正常升级步骤。

### 5. 解压 Go

```bash
tar -C /usr/local -xzf /root/go1.25.0.linux-amd64.tar.gz
```

### 作用解释

- `tar`：处理 tar 包
- `-C /usr/local`：解压到 `/usr/local`
- `-x`：解压
- `-z`：处理 gzip 压缩
- `-f`：指定文件名

### 6. 写入环境变量

```bash
echo 'export PATH=$PATH:/usr/local/go/bin' >> /root/.bashrc
```

### 作用解释

- `echo`：输出一段字符串
- `>>`：把内容追加到文件末尾

### 为什么要做

把 Go 的可执行目录加入 `PATH`，这样以后任何目录都能直接运行 `go`。

### 7. 让环境变量生效

```bash
source /root/.bashrc
```

### 8. 验证 Go

```bash
go version
```

### 作用

- 查看 Go 版本
- 检查安装是否成功

### 常见问题

#### 问题 1：`go.dev` 下载失败

现象：

- `Connection timed out`
- `Unable to establish SSL connection`

原因：

- 服务器到 `go.dev` 链路不稳定

解决：

- 改用 `dl.google.com`

#### 问题 2：`Failed writing body`

原因：

- 当前目录不对
- 命令写到了一起

今天实际踩过的坑：

把两条命令误写成一条：

```bash
ls -ld .cd /root
```

正确写法应该分开执行：

```bash
cd /root
pwd
ls -ld .
```

## 九、安装 Nginx

### 1. 安装命令

```bash
yum install -y nginx
```

### 作用

- 安装 Nginx

Nginx 后续的用途：

- 对外提供 Web 服务
- 反向代理 Go 服务
- 配置 HTTPS

### 2. 设置开机自启

```bash
systemctl enable nginx
```

### 作用

- 让 Nginx 在服务器重启后自动启动

### 3. 立即启动

```bash
systemctl start nginx
```

### 作用

- 现在立刻启动 Nginx

### 4. 查看状态

```bash
systemctl status nginx
```

### 作用

- 查看 Nginx 是否运行成功

如果看到：

```bash
Active: active (running)
```

说明安装和启动都成功了。

### 注意

这个命令会进入一个状态查看界面，查看完以后按：

```bash
q
```

退出。

## 十、安全组放行

在阿里云控制台的安全组中，新增入方向规则。

### 建议放行端口

- `22`
- `80`
- `443`

### 字段解释

- `22`：SSH 登录服务器
- `80`：HTTP 网页访问
- `443`：HTTPS 网页访问

### 测试环境可先这样配置

- 授权策略：`允许`
- 协议类型：`TCP`
- 访问来源：`0.0.0.0/0`

### `0.0.0.0/0` 的意思

- 允许任何公网 IP 访问

### 是否安全

测试环境先这样配可以。

但更严格的做法是：

- `22` 只允许你自己的固定公网 IP 访问

## 十一、验证 Nginx

### 1. 服务器本机测试

```bash
curl http://127.0.0.1
```

### 作用

- 在服务器本机访问 Nginx
- 不依赖公网，只验证 Nginx 本地是否正常

### 正常结果

会返回一段 HTML。

### 2. 公网测试

在你自己的电脑浏览器访问：

```text
http://服务器公网IP
```

### 作用

- 验证安全组和公网访问是否已经正常

如果能看到 Nginx 默认页，说明：

- Nginx 正常
- 安全组规则生效
- 公网访问正常

## 十二、Git 与 GitHub 相关记录

### 1. 查看 Git 版本

正确命令：

```bash
git --version
```

### 注意

今天写错过一次：

```bash
git -v
```

这个不是查看版本的命令。

### 2. 如果服务器没装 Git

执行：

```bash
yum install -y git
```

### 3. 本地推 GitHub 遇到的问题

今天本地推送时出现：

```bash
Failed to connect to github.com port 443
Recv failure: Connection was reset
```

### 结论

这类问题是：

- 本地网络到 GitHub 不通
- 不是 Git 命令错
- 不是仓库地址一定错

### 处理思路

可选方案：

1. 换网络
2. 使用 SSH 推送
3. 暂时不走 GitHub，直接上传服务器部署

## 十三、如果代码已经在 Git 仓库

服务器上可以直接拉代码：

```bash
cd /root
git clone 你的仓库地址
```

### 作用

- 把远端仓库克隆到服务器本地

### 示例

```bash
cd /root
git clone https://github.com/yourname/your-repo.git
```

### 进入项目目录

```bash
cd 你的项目目录
ls
```

### 作用

- `cd`：进入项目目录
- `ls`：查看当前目录文件

## 十四、如果代码不方便从 GitHub 拉

可以在本地打包后上传。

### 1. 本地打包

```bash
tar --exclude=node_modules --exclude=dist --exclude=logs --exclude=*.db --exclude=.git -czf make-api-private.tar.gz .
```

### 作用

- 把当前项目压缩为 tar.gz
- 排除不需要上传的大文件和本地数据

### 参数解释

- `--exclude=node_modules`：排除依赖目录
- `--exclude=dist`：排除构建产物
- `--exclude=logs`：排除日志
- `--exclude=*.db`：排除数据库
- `--exclude=.git`：排除 Git 历史
- `-czf`：
  - `c`：创建压缩包
  - `z`：gzip 压缩
  - `f`：指定文件名

### 2. 上传到服务器

```bash
scp make-api-private.tar.gz root@服务器IP:/root/
```

### 作用

- 用 `scp` 把本地文件复制到服务器

### 3. 服务器端解压

```bash
cd /root
mkdir -p make-api-private
tar -xzf make-api-private.tar.gz -C make-api-private
cd make-api-private
```

### 作用解释

- `mkdir -p make-api-private`：创建目录，存在也不报错
- `tar -xzf ... -C make-api-private`：把压缩包解压到指定目录

## 十五、项目启动参考

下面是后续部署 Make API 时大概率会用到的步骤。

### 1. 下载 Go 依赖

```bash
go mod download
```

### 作用

- 按 `go.mod` 下载后端依赖

### 2. 构建默认前端

```bash
cd /root/项目目录/web/default
bun install
bun run build
```

### 每个命令的作用

`bun install`

- 根据前端依赖配置安装包

`bun run build`

- 执行前端构建
- 生成生产环境静态文件

### 3. 构建 classic 前端

```bash
cd /root/项目目录/web/classic
bun install
bun run build
```

### 作用

- 构建 classic 主题静态资源

### 4. 启动后端

```bash
cd /root/项目目录
nohup go run main.go > server.out.log 2> server.err.log &
```

### 命令解释

- `nohup`：让程序在终端关闭后继续运行
- `go run main.go`：直接运行 Go 项目
- `> server.out.log`：标准输出写入日志文件
- `2> server.err.log`：错误输出写入错误日志
- `&`：放到后台执行

### 5. 查看启动日志

```bash
tail -f server.out.log
```

### 作用

- 实时查看启动日志

如果程序启动失败，也要看：

```bash
tail -f server.err.log
```

## 十六、今天的 `.gitignore` 处理记录

今天还整理过一次 `.gitignore`，重点是不要把这些内容提交到 GitHub：

- `*.db`
- `logs/`
- `dist/`
- `node_modules/`
- `.env`
- `server.out.log`
- `server.err.log`
- 本地缓存和 IDE 配置

如果 `.gitignore` 改了但 Git 还在跟踪旧文件，可以执行：

```bash
git rm -r --cached .
git add .
git status
```

### 作用解释

`git rm -r --cached .`

- 只取消 Git 跟踪
- 不删除本地文件

`git add .`

- 按新的 `.gitignore` 规则重新加入文件

`git status`

- 查看当前暂存状态

## 十七、今天实际踩过的坑

### 坑 1：Bun 安装失败

报错：

```bash
unzip is required to install bun
```

解决：

```bash
yum install -y unzip
```

### 坑 2：Go 官网下载失败

报错类型：

- TLS 异常
- 超时

解决：

- 不用 `go.dev`
- 改用 `dl.google.com`

### 坑 3：命令写到一起

错误示例：

```bash
ls -ld .cd /root
```

正确方式：

```bash
cd /root
pwd
ls -ld .
```

### 坑 4：GitHub 推不上去

报错：

```bash
Failed to connect to github.com port 443
```

结论：

- 网络问题，不是 Git 语法问题

## 十八、最简可执行命令汇总

如果只是照着快速装环境，可以按这个顺序执行：

```bash
cat /etc/os-release
yum update -y
yum install -y git curl wget unzip tar nginx
curl -fsSL https://bun.sh/install | bash
source /root/.bashrc
bun -v
cd /root
curl -L -o go1.25.0.linux-amd64.tar.gz https://dl.google.com/go/go1.25.0.linux-amd64.tar.gz
rm -rf /usr/local/go
tar -C /usr/local -xzf /root/go1.25.0.linux-amd64.tar.gz
echo 'export PATH=$PATH:/usr/local/go/bin' >> /root/.bashrc
source /root/.bashrc
go version
systemctl enable nginx
systemctl start nginx
systemctl status nginx
curl http://127.0.0.1
```

## 十九、后续建议

环境装完后，下一步建议继续做：

1. 绑定域名解析到服务器公网 IP
2. 用 Nginx 反代 Go 服务
3. 配置 HTTPS 证书
4. 上传或拉取 Make API 代码
5. 构建前端
6. 启动后端
7. 修改 `ServerAddress`
8. 最后再接支付回调

## 二十、文档用途建议

这份文档适合后面做这些事情：

- 重新部署一台新测试机
- 交给别人按步骤复现
- 后面补正式环境文档时作为基础版本

