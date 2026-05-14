import React from 'react';
import { Typography } from '@douyinfe/semi-ui';
import MarkdownRenderer from '../../components/common/markdown/MarkdownRenderer';

const { Title } = Typography;

const docsContent = `
# Codex / OpenCode 配置使用文档

## 一、创建令牌

1. 点击 控制台
2. 进入 令牌管理
3. 点击 添加令牌

令牌名称建议直接按用途命名，例如：

\`\`\`text
codex
opencode
\`\`\`

创建完成后，会得到一串令牌：

\`\`\`text
sk-xxxxxxxxxxxxxxxxxxxxxxxx
\`\`\`

后面配置客户端时，API Key 就填这串内容。

---

## 二、准备 3 个配置项

### 1. Base URL

必须使用带 /v1 的地址。

错误示例：

\`\`\`text
https://api.make1688.com
\`\`\`

正确示例：

\`\`\`text
https://api.make1688.com/v1
\`\`\`

### 2. API Key

填写你刚刚新建的令牌：

\`\`\`text
sk-xxxxxxxxxxxxxxxxxxxxxxxx
\`\`\`

### 3. Model

模型名必须填写后台真实存在的模型名，例如：

\`\`\`text
gpt-5.3-codex
gpt-5.2-codex
gpt-4.1
gpt-4o-mini
deepseek-chat
claude-3-5-sonnet
\`\`\`

如果只是先测试是否能用，建议先用：

\`\`\`text
gpt-4o-mini
\`\`\`

---

## 三、先测试接口

### PowerShell

\`\`\`powershell
$headers = @{
  Authorization = "Bearer sk-替换成你刚创建的令牌"
}

Invoke-RestMethod \`
  -Uri "https://api.make1688.com/v1/models" \`
  -Headers $headers \`
  -Method Get
\`\`\`

### curl

\`\`\`bash
curl https://api.make1688.com/v1/models \\
  -H "Authorization: Bearer sk-替换成你刚创建的令牌"
\`\`\`

能返回模型列表，就说明这一步没问题。

---

## 四、Codex 保姆级安装和配置

### 1. 先检查有没有安装 Node.js

Codex 官方 npm 安装方式依赖 Node.js。

先执行：

\`\`\`bash
node --version
npm --version
\`\`\`

如果都能看到版本号，说明已经安装好了，可以直接看后面的 Codex 安装步骤。

如果提示找不到命令，说明你本机还没有装 Node.js。

### 2. Node.js 最低版本

根据 OpenAI Codex 官方 GitHub 仓库当前的 package 配置，Node.js 版本要求是：

\`\`\`text
Node.js >= 22
\`\`\`

建议直接安装：

\`\`\`text
Node.js 22 或更高版本
\`\`\`

如果你安装的是更低版本，Codex 可能无法正常安装或运行。

### 3. Windows 安装 Node.js

最适合新手的方式：

1. 打开 Node.js 官网下载页
2. 下载 Windows 安装包
3. 双击安装
4. 一路点击 Next
5. 保持默认安装选项
6. 安装完成后关闭安装窗口

安装完成后，重新打开 PowerShell，再执行：

\`\`\`powershell
node --version
npm --version
\`\`\`

如果能看到版本号，说明 Node.js 已经装好了。

### 4. macOS 安装 Node.js

如果你已经安装 Homebrew，可以执行：

\`\`\`bash
brew install node
\`\`\`

安装完成后执行：

\`\`\`bash
node --version
npm --version
\`\`\`

### 5. Linux 安装 Node.js

最稳妥的做法是使用你当前发行版支持的 Node.js 22 或更高版本安装方式。

安装完成后执行：

\`\`\`bash
node --version
npm --version
\`\`\`

### 6. 安装 Codex

如果 Node.js 已经装好，再执行：

Windows：

\`\`\`powershell
npm install -g @openai/codex
\`\`\`

macOS：

\`\`\`bash
npm install -g @openai/codex
\`\`\`

Linux：

\`\`\`bash
npm install -g @openai/codex
\`\`\`

### 7. 检查 Codex 是否安装成功

\`\`\`bash
codex --version
\`\`\`

如果能看到版本号，说明安装成功。

### 8. 最简单配置方式

Windows PowerShell：

\`\`\`powershell
$env:OPENAI_API_KEY="sk-替换成你刚创建的令牌"
$env:OPENAI_BASE_URL="https://api.make1688.com/v1"
codex -m gpt-4.1
\`\`\`

macOS / Linux：

\`\`\`bash
export OPENAI_API_KEY="sk-替换成你刚创建的令牌"
export OPENAI_BASE_URL="https://api.make1688.com/v1"
codex -m gpt-4.1
\`\`\`

### 9. 配置文件方式

文件位置：

\`\`\`text
~/.codex/config.toml
\`\`\`

配置文件示例：

\`\`\`toml
model = "gpt-4.1"
model_provider = "makeapi"

[model_providers.makeapi]
base_url = "https://api.make1688.com/v1"
wire_api = "responses"
env_key = "MAKE_API_KEY"
\`\`\`

上面这份配置可以这样理解：

1. model：默认使用哪个模型
2. model_provider：默认使用哪个 provider
3. base_url：请求发到哪里
4. wire_api：请求协议类型
5. env_key：告诉 Codex 去读取哪个环境变量里的令牌

也就是说：

\`\`\`text
config.toml 里写地址和读取规则
环境变量里放真正的 key
\`\`\`

### 10. key 怎么一起配置进去

如果你用了下面这行：

\`\`\`toml
env_key = "MAKE_API_KEY"
\`\`\`

那你还要在系统里设置同名环境变量。

Windows PowerShell：

\`\`\`powershell
$env:MAKE_API_KEY="sk-替换成你刚创建的令牌"
\`\`\`

macOS / Linux：

\`\`\`bash
export MAKE_API_KEY="sk-替换成你刚创建的令牌"
\`\`\`

这样 Codex 启动时，就会自动去读取 MAKE_API_KEY 里的令牌。

### 11. 更适合新手的完整写法

第一步，先写配置文件：

\`\`\`toml
model = "gpt-4.1"
model_provider = "makeapi"

[model_providers.makeapi]
base_url = "https://api.make1688.com/v1"
wire_api = "responses"
env_key = "MAKE_API_KEY"
\`\`\`

第二步，再设置令牌：

\`\`\`powershell
$env:MAKE_API_KEY="sk-替换成你刚创建的令牌"
\`\`\`

第三步，启动 Codex：

\`\`\`powershell
codex
\`\`\`

如果你不想用 env_key 这种方式，也可以直接用最简单写法：

\`\`\`powershell
$env:OPENAI_API_KEY="sk-替换成你刚创建的令牌"
$env:OPENAI_BASE_URL="https://api.make1688.com/v1"
codex -m gpt-4.1
\`\`\`

### 12. Codex 验证

先输入：

\`\`\`text
只回复 OK，不要输出别的内容。
\`\`\`

再输入：

\`\`\`text
请先读取当前项目目录结构，并告诉我前后端分别在哪些目录。
\`\`\`

---

## 五、OpenCode 保姆级安装和配置

### 1. 安装 OpenCode

官方文档里常见的 Node.js 安装命令是：

\`\`\`bash
npm install -g opencode-ai
\`\`\`

Windows：

\`\`\`powershell
npm install -g opencode-ai
\`\`\`

macOS：

\`\`\`bash
npm install -g opencode-ai
\`\`\`

Linux：

\`\`\`bash
npm install -g opencode-ai
\`\`\`

### 2. 检查 OpenCode 是否安装成功

\`\`\`bash
opencode --version
\`\`\`

### 3. 配置文件位置

全局：

\`\`\`text
~/.config/opencode/opencode.json
\`\`\`

项目级：

\`\`\`text
项目根目录/opencode.json
\`\`\`

### 4. OpenCode 配置示例

\`\`\`json
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "makeapi": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "Make API",
      "options": {
        "baseURL": "https://api.make1688.com/v1",
        "apiKey": "sk-替换成你刚创建的令牌"
      },
      "models": {
        "gpt-4.1": {
          "name": "GPT-4.1"
        },
        "gpt-4o-mini": {
          "name": "GPT-4o Mini"
        }
      }
    }
  },
  "model": "makeapi/gpt-4.1",
  "small_model": "makeapi/gpt-4o-mini"
}
\`\`\`

### 5. OpenCode 里 key 怎么配置

最简单的方式，就是直接写在配置文件里：

\`\`\`json
"apiKey": "sk-替换成你刚创建的令牌"
\`\`\`

如果你不想直接写死，也可以改成环境变量方式：

\`\`\`json
"apiKey": "{env:MAKE_API_KEY}"
\`\`\`

然后在系统里设置：

Windows PowerShell：

\`\`\`powershell
$env:MAKE_API_KEY="sk-替换成你刚创建的令牌"
\`\`\`

macOS / Linux：

\`\`\`bash
export MAKE_API_KEY="sk-替换成你刚创建的令牌"
\`\`\`

### 6. OpenCode 验证

先输入：

\`\`\`text
只回复 OK，不要输出别的内容。
\`\`\`

再输入：

\`\`\`text
请读取当前项目目录结构，并告诉我这是前端项目、后端项目，还是全栈项目。
\`\`\`

---

## 六、常见报错

### 401

令牌错了、过期了，或者前后有空格。

### 404

Base URL 写错，或者漏了 /v1。

### model not found

模型名写错，或者后台没有这个模型。

### insufficient balance / no quota

余额不足，或者令牌额度不足。

---

## 七、最容易填错的地方

### 1. Base URL

错误：

\`\`\`text
https://api.make1688.com
\`\`\`

正确：

\`\`\`text
https://api.make1688.com/v1
\`\`\`

### 2. 模型名

错误：

\`\`\`text
GPT-4.1
\`\`\`

正确：

\`\`\`text
gpt-4.1
\`\`\`

---

## 八、最后检查

1. 已创建令牌
2. Base URL 已写成 /v1 结尾
3. API Key 已填新令牌
4. Model 已填后台真实存在的模型名
5. 已测试 /v1/models
6. 已让 Codex 或 OpenCode 回复过 OK
`;

const DocsPage = () => {
  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8'>
        <div className='bg-white rounded-lg shadow-sm p-6 md:p-10'>
          <Title heading={2} className='text-center mb-8'>
            Codex / OpenCode 配置使用文档
          </Title>
          <div className='prose prose-lg max-w-none'>
            <MarkdownRenderer content={docsContent} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocsPage;
