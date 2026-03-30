---
name: obsidian-code-review
description: 专门针对 Obsidian 插件代码提交的审核规范与最佳实践
---

# Obsidian 插件代码审查 (Code Review) 指南

该 Skill 汇总了 Obsidian 官方插件仓库审核员提出的核心要求，以及本项目在开发过程中遇到的常见问题，旨在确保代码符合官方发布标准。

## 1. DOM 安全操作 (必选)
**核心原则**：绝对禁止在非受控状态下直接操作 DOM 容器的 HTML 结构。
- **禁止使用 `innerHTML` / `outerHTML`**：
    - ❌ `el.innerHTML = '<div>...</div>'`
    - ✅ 使用 `el.createDiv()`、`el.createSpan()` 等内置 API 或 `document.createElement()`。
    - ✅ **清空元素**：使用 `el.empty()` 替代 `el.innerHTML = ''`。
- **SVG 图标注入**：
    - 禁止通过 `innerHTML` 注入 SVG 字符串。
    - ✅ 方案：使用 `DOMParser` 将 SVG 字符串解析为 Fragment 后再用 `appendChild` 注入。

## 2. 只有特定控制台日志可用 (必选)
**核心原则**：发布代码中不得包含 `console.log`。
- **允许的方法**：仅允许使用 `warn` (警告)、`error` (错误)、`debug` (调试)。
- **规范实践**：
    - ❌ `console.log('[My Plugin]', data)`
    - ✅ `console.debug('[My Plugin]', data)`

## 3. UI 文本规范: Sentence Case (必选)
**核心原则**：所有面向用户的界面文本（设置项名称、描述等）必须使用“句式大小写”。
- **规则**：只有第一个单词的首字母大写，后面全部小写。
- **特例**：专有名词（如 **VitePress**, **Obsidian**, **SVG**）应保持其官方指定的大小写形式。
- **示例**：
    - ❌ `Enable Code Block Styles` (Title Case)
    - ✅ `Enable code block styles` (Sentence Case)
    - ✅ `Parse VitePress containers` (Sentence Case + 专有名词大写)

## 4. 设置页面 (Settings Tab) 规范
- **标题去冗余**：设置分类的标题（`setHeading()`）中禁止包含单词 "settings"。
    - ❌ `Style settings`
    - ✅ `Styles` | `Appearance`
- **简洁性**：尽量移除 Heading 中的选项、设置、偏好等描述性后缀。

## 5. TypeScript 类型安全
- **避免冗余断言**：如果编译器已经能够推导出变量类型，请不要重复使用 `as HTMLElement` 等断言（除非是因为调用 `dataset` 等特定场景需要强转）。
- **清理 lint 错误**：确保提交代码无明显的 TS 报错（尤其是 `Property '...' does not exist on type 'Element'` 类型的错误）。

## 6. 特有功能坑位 (项目相关)
- **徽章 (Badge) 行内显示**：Obsidian 在渲染加粗文本时会拆分 DOM 节点。处理行内徽章（`<Badge />`）时，锚点定位应缩短至 10 字符以内，且需智能清洗 Markdown 符号。

---
**使用建议**：每次修改插件业务逻辑、设置项或发布前，请务必调用此 Skill 对代码进行合规性扫描。
