import React, { useEffect, useRef, useState } from 'react';
import { Typography } from '@douyinfe/semi-ui';
import MarkdownRenderer from '../../components/common/markdown/MarkdownRenderer';

const { Title } = Typography;

const docNavItems = [
  { key: 'create-token', label: '创建令牌', match: '一、创建令牌' },
  { key: 'prepare-config', label: '准备配置', match: '二、准备 3 个配置项' },
  { key: 'test-api', label: '测试接口', match: '三、先测试接口' },
  {
    key: 'codex-config',
    label: 'Codex 桌面端',
    match: '四、Codex 桌面端配置',
  },
  {
    key: 'opencode-config',
    label: 'OpenCode 桌面端',
    match: '五、OpenCode 桌面端配置',
  },
  { key: 'errors', label: '常见报错', match: '六、常见报错' },
  { key: 'checklist', label: '最后检查', match: '七、最后检查' },
];

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
gpt-5.5
deepseek-chat
claude-3-5-sonnet
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

## 四、Codex 桌面端配置

### 1. 下载 Codex 桌面端

从 OpenAI 官方入口下载 Codex 桌面端：

[https://openai.com/codex/get-started/](https://openai.com/codex/get-started/)

下载完成后，先正常安装并打开一次。

![Codex 桌面端配置 makeapi 中转站](/docs-assets/codex-desktop-config.svg)

### 2. 配置 makeapi 中转站

如果 Codex 桌面端支持读取本机 Codex 配置，按下面这样写配置文件。

Windows 文件位置：

\`\`\`text
C:\\Users\\你的用户名\\.codex\\config.toml
\`\`\`

macOS / Linux 文件位置：

\`\`\`text
~/.codex/config.toml
\`\`\`

配置内容：

\`\`\`toml
model = "gpt-5.5"
model_provider = "makeapi"

[model_providers.makeapi]
base_url = "https://api.make1688.com/v1"
wire_api = "responses"
env_key = "MAKE_API_KEY"
\`\`\`

### 3. 设置 API Key

Windows PowerShell：

\`\`\`powershell
$env:MAKE_API_KEY="sk-替换成你刚创建的令牌"
\`\`\`

macOS / Linux：

\`\`\`bash
export MAKE_API_KEY="sk-替换成你刚创建的令牌"
\`\`\`

### 4. 重启并测试

保存配置后，重新打开 Codex 桌面端。

先输入：

\`\`\`text
只回复 OK，不要输出别的内容。
\`\`\`

如果没有回复，先检查这 3 个地方：

1. Base URL 是否是 \`https://api.make1688.com/v1\`
2. API Key 是否是刚创建的新令牌
3. Model 是否是后台真实存在的模型名，例如 \`gpt-5.5\`

注意：如果你打开的 Codex 桌面端只支持官方账号登录，没有 Base URL / Provider / 自定义模型入口，那就不能直接填中转站。这个时候优先使用支持自定义 provider 的 OpenCode 桌面端。

---

## 五、OpenCode 桌面端配置

### 1. 下载 OpenCode 桌面端

从 OpenCode 官方入口下载桌面端：

[https://opencode.ai/download](https://opencode.ai/download)

下载完成后，先正常安装并打开一次。

![OpenCode 桌面端配置 makeapi 中转站](/docs-assets/opencode-desktop-config.svg)

### 2. 写入配置文件

OpenCode 桌面端和 OpenCode 命令行都可以读取 \`opencode.json\`。

Windows 文件位置：

\`\`\`text
C:\\Users\\你的用户名\\AppData\\Roaming\\opencode\\opencode.json
\`\`\`

macOS / Linux 文件位置：

\`\`\`text
~/.config/opencode/opencode.json
\`\`\`

配置内容：

\`\`\`json
{
  "$schema": "https://opencode.ai/config.json",
  "model": "makeapi/gpt-5.5",
  "small_model": "makeapi/gpt-5.5",
  "provider": {
    "makeapi": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "Make API",
      "options": {
        "baseURL": "https://api.make1688.com/v1",
        "apiKey": "sk-替换成你刚创建的令牌"
      },
      "models": {
        "gpt-5.5": {
          "name": "gpt-5.5",
          "attachment": true,
          "modalities": {
            "input": ["text", "image"],
            "output": ["text"]
          }
        }
      }
    }
  }
}
\`\`\`

### 3. 重启并测试

保存配置后，重启 OpenCode 桌面端。

先输入：

\`\`\`text
只回复 OK，不要输出别的内容。
\`\`\`

如果要在 OpenCode 里发图片，必须保留下面这段：

\`\`\`json
"attachment": true,
"modalities": {
  "input": ["text", "image"],
  "output": ["text"]
}
\`\`\`

这段是在告诉 OpenCode：“这个模型可以读取图片”。如果删掉它，就算你的中转站和上游模型本身支持图片，OpenCode 也可能提示当前模型不支持图片。

---

## 六、常见报错

### 401

令牌错了、过期了，或者前后有空格。

### 404

Base URL 写错，或者漏了 /v1。

### model not found

模型名写错，或者后台没有这个模型。

### 当前模型不支持图片

OpenCode 配置里缺少 \`attachment\` 或 \`modalities.input: ["text", "image"]\`。

### insufficient balance / no quota

余额不足，或者令牌额度不足。

---

## 七、最后检查

1. 已创建令牌
2. Base URL 已写成 /v1 结尾
3. API Key 已填新令牌
4. Model 已填后台真实存在的模型名
5. 已测试 /v1/models
6. 已从官方入口下载安装桌面端
7. 已让 Codex 或 OpenCode 回复过 OK
`;

const DocsPage = () => {
  const contentRef = useRef(null);
  const sidebarRef = useRef(null);
  const [activeSection, setActiveSection] = useState(docNavItems[0].key);

  const getSectionHeadings = () => {
    const container = contentRef.current;
    if (!container) return [];
    return docNavItems
      .map((item) => {
        const heading = Array.from(container.querySelectorAll('h2')).find(
          (node) => node.textContent?.trim() === item.match,
        );
        return heading ? { ...item, heading } : null;
      })
      .filter(Boolean);
  };

  const getHeadingScrollTop = (heading, container) => {
    const containerRect = container.getBoundingClientRect();
    const headingRect = heading.getBoundingClientRect();
    return container.scrollTop + headingRect.top - containerRect.top - 12;
  };

  const handleSectionClick = (item) => {
    setActiveSection(item.key);
    const section = getSectionHeadings().find(
      (entry) => entry.key === item.key,
    );
    const container = contentRef.current;
    if (!section || !container) return;
    if (container.scrollHeight > container.clientHeight + 4) {
      container.scrollTo({
        top: getHeadingScrollTop(section.heading, container),
        behavior: 'smooth',
      });
    } else {
      section.heading.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  useEffect(() => {
    const activeButton = sidebarRef.current?.querySelector(
      `button[data-section-key="${activeSection}"]`,
    );
    activeButton?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  }, [activeSection]);

  return (
    <div className='docs-tech-page relative overflow-hidden'>
      <div className='docs-tech-orbit docs-tech-orbit-left' />
      <div className='docs-tech-orbit docs-tech-orbit-right' />
      <div className='docs-tech-rays' />
      <div className='docs-tech-shell w-full max-w-[1560px] mx-auto px-3 sm:px-4 lg:px-8'>
        <div className='docs-tech-card rounded-2xl p-6 md:p-10'>
          <div className='docs-tech-header'>
            <div>
              <div className='docs-tech-kicker'>Make API Client Guide</div>
              <Title heading={2} className='docs-tech-title mb-0'>
                Codex / OpenCode 配置使用文档
              </Title>
            </div>
          </div>
          <div className='docs-tech-layout'>
            <aside ref={sidebarRef} className='docs-tech-sidebar'>
              <div className='docs-tech-sidebar-title'>配置流程</div>
              {docNavItems.map((item) => (
                <button
                  key={item.key}
                  data-section-key={item.key}
                  type='button'
                  className={activeSection === item.key ? 'active' : ''}
                  onClick={() => handleSectionClick(item)}
                >
                  {item.label}
                </button>
              ))}
            </aside>
            <div
              ref={contentRef}
              className='docs-tech-content prose prose-lg max-w-none'
            >
              <MarkdownRenderer content={docsContent} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocsPage;
