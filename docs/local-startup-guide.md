# Make API 本地启动流程

这份文档用于说明如何在本地启动当前项目，并查看你刚修改过的经典前端页面。

适用场景：

- 本地查看 `web/classic` 页面改动
- 本地联调 Go 后端接口
- 本地打开文档页、首页、设置页等页面

## 1. 先理解启动结构

这个项目本地开发通常分成两部分：

1. Go 后端
2. Classic 前端开发服务

调用关系可以理解为：

```text
浏览器 -> Classic 前端开发服务 -> 本地 Go 后端
```

常见端口：

- 后端：`3000`
- 前端：`5173`

如果 `5173` 已被别的项目占用，可以改成：

- `5174`

## 2. 启动前需要准备什么

本地至少需要有：

1. Go
2. Node.js / npm
3. Classic 前端依赖已安装

检查命令如下。

### 2.1 检查 Go

```bash
go version
```

作用：

- 查看本地 Go 版本
- 确认 `go` 命令可用

### 2.2 检查 npm

```bash
npm --version
```

作用：

- 查看 npm 是否安装

### 2.3 检查 classic 依赖目录

PowerShell：

```powershell
dir web\classic\node_modules
```

Git Bash：

```bash
ls web/classic/node_modules
```

作用：

- 确认 classic 前端依赖已经装好

## 3. 启动 Go 后端

### 3.1 进入项目根目录

```powershell
cd D:\学习\make-api-private
```

作用：

- 进入项目根目录
- 后端启动命令需要在这里执行

### 3.2 启动后端

```powershell
go run main.go
```

作用：

- 直接编译并运行 Go 后端

### 3.3 如何判断后端启动成功

正常情况下，终端会出现类似输出：

```text
Make API started
http://127.0.0.1:3000
```

这表示：

- 后端已经开始监听 `3000`
- 前端可以通过代理访问接口

### 3.4 单独检查 3000 端口

```powershell
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
```

作用：

- 查看本机 `3000` 端口是否处于监听状态

## 4. 启动 Classic 前端

### 4.1 进入 classic 目录

```powershell
cd D:\学习\make-api-private\web\classic
```

作用：

- 进入 classic 前端目录

### 4.2 启动开发服务

```powershell
npm run dev
```

作用：

- 启动 Vite 开发服务器

### 4.3 默认访问地址

通常会启动在：

```text
http://127.0.0.1:5173
```

### 4.4 如果 5173 被占用

可以手动指定端口，例如用 `5174`：

```powershell
npm run dev -- --host 127.0.0.1 --port 5174
```

每一段参数的作用：

- `npm run dev`
  作用：执行 `package.json` 里的 `dev` 脚本
- `--`
  作用：把后面的参数继续传给 Vite
- `--host 127.0.0.1`
  作用：只绑定本机地址
- `--port 5174`
  作用：把开发服务启动在 `5174`

### 4.5 如何判断前端启动成功

正常会看到类似输出：

```text
VITE ready in xxxx ms
Local: http://127.0.0.1:5174/
```

这表示 classic 前端已经起来了。

## 5. 如果你不想一直占着终端

可以把 classic 前端放到后台运行。

### 5.1 后台启动 classic

```powershell
Start-Process -WindowStyle Hidden -FilePath cmd.exe -ArgumentList '/c npm run dev -- --host 127.0.0.1 --port 5174' -WorkingDirectory 'D:\学习\make-api-private\web\classic' -RedirectStandardOutput 'D:\学习\make-api-private\web\classic\vite-5174.out.log' -RedirectStandardError 'D:\学习\make-api-private\web\classic\vite-5174.err.log'
```

作用：

- 隐藏窗口启动 classic 前端
- 标准输出写入 `vite-5174.out.log`
- 错误输出写入 `vite-5174.err.log`

### 5.2 查看日志

```powershell
Get-Content D:\学习\make-api-private\web\classic\vite-5174.out.log -Tail 50
```

作用：

- 查看最近 50 行前端启动日志

## 6. 怎么确认页面能访问

### 6.1 检查后端

```powershell
Invoke-WebRequest -Uri http://127.0.0.1:3000 -UseBasicParsing
```

作用：

- 直接请求本地后端
- 如果返回 `200`，说明后端在线

### 6.2 检查前端

如果前端跑在 `5174`：

```powershell
Invoke-WebRequest -Uri http://127.0.0.1:5174 -UseBasicParsing
```

如果前端跑在 `5173`：

```powershell
Invoke-WebRequest -Uri http://127.0.0.1:5173 -UseBasicParsing
```

作用：

- 检查前端开发服务是否已经启动成功

## 7. 如何查看你现在改过的文档页

你这次改的是 classic 前端里的“文档”页面内容。

如果前端跑在 `5174`，直接打开：

```text
http://127.0.0.1:5174/docs
```

如果前端跑在 `5173`，打开：

```text
http://127.0.0.1:5173/docs
```

你应该能看到：

- `Codex / OpenCode` 配置使用说明

## 8. 怎么确认打开的是当前项目，不是别的 Vite

如果本机同时跑了多个前端项目，最容易混的是端口。

### 8.1 看端口归属

```powershell
Get-NetTCPConnection -LocalPort 5173,5174 -ErrorAction SilentlyContinue | Select-Object LocalPort,State,OwningProcess
```

作用：

- 查看 `5173` / `5174` 当前由哪个进程占用

### 8.2 看进程命令行

```powershell
Get-CimInstance Win32_Process | Where-Object { $_.Name -eq 'node.exe' } | Select-Object ProcessId,CommandLine | Format-List
```

作用：

- 查看对应 `node` 进程是从哪个目录启动的

如果输出里包含：

```text
D:\学习\make-api-private\web\classic
```

就说明当前访问的是这个项目。

## 9. 常见问题

### 9.1 前端打开是 404

常见原因：

1. 前端开发服务没启动
2. 端口写错了
3. 打开的是别的项目端口

### 9.2 页面能打开，但不是你想看的内容

常见原因：

1. 本机有别的项目占用了 `5173`
2. 访问错了端口

解决办法：

- 改用 `5174`
- 再检查一次端口归属

### 9.3 后端 3000 没起来

先执行：

```powershell
go run main.go
```

然后直接看终端报错内容。

### 9.4 前端能起，但接口报错

这种情况通常表示：

- 前端正常
- 后端没起来
- 或者后端启动失败

优先检查后端终端输出。

## 10. 推荐的最小启动顺序

按这个顺序最稳：

### 10.1 先启动后端

```powershell
cd D:\学习\make-api-private
go run main.go
```

### 10.2 再启动 classic 前端

```powershell
cd D:\学习\make-api-private\web\classic
npm run dev -- --host 127.0.0.1 --port 5174
```

### 10.3 浏览器打开

```text
http://127.0.0.1:5174/docs
```

## 11. 当前这次本地预览建议

如果你本机 `5173` 已被其他项目占用，建议直接使用：

```text
http://127.0.0.1:5174/docs
```

这样最不容易串项目。
