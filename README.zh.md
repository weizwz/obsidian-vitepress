# VitePress Theme for Obsidian

一个为 Obsidian 设计的 [VitePress](https://vitepress.dev/) 风格主题插件，让你在 Obsidian 中获得与 VitePress 文档站点一致的阅读体验——包括语法容器、折叠容器、代码组等特性。

**[English Documentation](./README.md)**

## 功能特性

### 提示容器

将 VitePress 原生 `:::` 语法渲染为 GitHub Alert 风格的卡片，支持自定义标题：

```markdown
::: info 信息
这是一条信息
:::

::: tip 建议
这是一个建议
:::

::: warning 警告
这是一条警告
:::

::: danger 危险
这是一个危险警告
:::
```

![预览1](src/asset/images/preview1.png)

### 折叠容器

将 VitePress 原生 `::: details` 语法渲染为可点击展开的折叠块（原生 `<details>/<summary>` 元素）：

```markdown
::: details 点我查看
这是折叠的内容，点击标题可展开
:::
```

![预览2](src/asset/images/preview2.png)

### 代码块增强

代码块自动添加语言标签和文件名显示，支持 VitePress 的 `[filename]` 语法：

````markdown
```ts [config.ts]
export default {
  title: 'My Site'
}
```
````

![预览3](src/asset/images/preview3.png)

### 代码块组

将多个连续代码块组合为可切换 Tab 的代码组：

````markdown
::: code-group

```ts [TypeScript]
const msg: string = 'hello'
```

```js [JavaScript]
const msg = 'hello'
```

:::
````

![预览4](src/asset/images/preview4.png)

### Obsidian Callout 适配

原生的 Obsidian Callout 会自动适配 VitePress 配色风格：

```markdown
> [!note]
> 这是一个 note callout

> [!warning]
> 这是一个 warning callout
```

![预览5](src/asset/images/preview5.png)

### 徽章组件

支持 VitePress 风格的行内徽章（Badge），常用于标注版本或状态：

```markdown
VitePress <Badge type="info" text="default" />
VitePress <Badge type="tip" text="^1.5.0" />
VitePress <Badge type="warning" text="beta" />
VitePress <Badge type="danger" text="caution" />
```

![预览6](src/asset/images/preview6.png)

### Emoji

支持 VitePress Emoji，鼠标悬停时会显示 Emoji 对应的代码：

```markdown
:cn: :eight: :seven:
```

![预览7](src/asset/images/preview7.png)


### 其他样式

- **排版** — 标题层级、行高与链接样式（VitePress 风格）
- **链接增强** — 支持相对路径转换 (`./file.md`) 与行高亮引用 (`#L10`)
- **表格** — 统一边框与背景色

## 兼容性说明

| 特性                                | 阅读模式 | 实时预览 | 源码模式 |
| ----------------------------------- | :------: | :------: | :------: |
| 提示容器（info/tip/warning/danger） |    ✅    |    ❌    |    ❌    |
| 折叠容器（details）                 |    ✅    |    ❌    |    ❌    |
| 徽章组件（Badge）                   |    ✅    |    ❌    |    ❌    |
| 代码块组（code-group）              |    ✅    |    ❌    |    ❌    |
| 代码块增强（语言标签/文件名）       |    ✅    |    ❌    |    ❌    |
| Callout 样式                        |    ✅    |    ✅    |    ❌    |
| 表格 / 排版 / 链接增强              |    ✅    |    ✅    |    ❌    |

> **说明**：VitePress 特有语法（`:::` 容器）在 Obsidian 阅读模式下通过 Post Processor 解析渲染，实时预览和源码模式不作处理，保留原始文本以方便编辑。

## 安装

### 从源码构建

```bash
git clone https://github.com/weizwz/obsidian-vitepress-theme
cd obsidian-vitepress-theme
pnpm install
pnpm run build
```

将 `manifest.json`、`main.js` 复制到 Obsidian vault 的 `.obsidian/plugins/vitepress-theme/` 目录后，在 Obsidian **设置 → 第三方插件** 中启用。

### 手动安装

1. 下载最新 Release 中的 `manifest.json` 和 `main.js`
2. 放置到 `.obsidian/plugins/vitepress-theme/` 目录
3. 在 Obsidian **设置 → 第三方插件** 中启用

## 开发

```bash
# 安装依赖
pnpm install

# 开发模式（watch + 自动复制到根目录）
pnpm run dev

# 生产构建（minify + 复制到根目录）
pnpm run build
```

## 设置项

| 设置                       | 说明                               |  默认值   |
| -------------------------- | ---------------------------------- | :-------: |
| Enable code block styles   | 代码块增强（语言标签、文件名）     |    ✅     |
| Enable container styles    | 提示容器与折叠容器 CSS             |    ✅     |
| Enable typography styles   | 排版样式（标题、链接等）           |    ✅     |
| Parse VitePress containers | 解析 `:::` 语法并渲染容器          |    ✅     |
| Process links              | 内链解析与跨文件行高亮引用         |    ✅     |
| Follow Obsidian theme      | 自动跟随 Obsidian 主题色           |    ✅     |
| Custom primary color       | 自定义主品牌色（不跟随主题时生效） | `#409eff` |
| Debug mode                 | 启用控制台调试日志                 |    ❌     |

## License

MIT
