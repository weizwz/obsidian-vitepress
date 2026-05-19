# 插件审核意见修改计划

针对 Obsidian 官方插件审核提出的问题，制定以下修改计划。

## 1. 冗余类型断言清理 (Required)
**问题定位**：`src/features/containerParser.ts` 第 222 行和 282 行。
- `const endEl = child as HTMLElement` (Line 222)
- `const codeEl = wrapper.querySelector('code') as HTMLElement | null` (Line 282)

**修改方案**：
- 删除这些不改变表达式类型的冗余断言。
- 检查代码中其他类似的冗余 `as` 断言并清理。

## 2. 安全处理 DOM 写入 (Required)
**问题定位**：`src/features/containerParser.ts` 第 373 行。
- `iconSpan.innerHTML = icon`

**问题定位**：`src/features/containerParser.ts` 第 250, 253 行。
- `startEl.innerHTML = ''`
- `endEl.innerHTML = ''`

**修改方案**：
- **图标处理**：不再通过 `innerHTML` 注入 SVG 字符串。将 `svgIcons` 存储为 DOM 结构或者简单的字符，或者通过 `DOMParser` 解析并克隆为新节点追加。
- **清空操作**：将 `el.innerHTML = ''` 替换为 `el.empty()` (Obsidian 提供的实用方法)。

## 3. 规范控制台日志 (Required)
**问题定位**：`src/main.ts` 第 104 行。
- `console.log('[VitePress Theme]', ...args)`

**修改方案**：
- 按照审核规则，仅允许使用 `warn`, `error`, `debug`。
- 将 `console.log` 修改为 `console.debug`。

## 4. 设置页面 UI 优化 (Required)
**问题定位**：`src/settings.ts` 第 17 行及后续。
- `new Setting(containerEl).setName('Style options').setHeading();`

**修改方案**：
- **标题优化**：检查设置标题，确保不包含冗余的 "settings"。
- **Sentence Case (语句格式化)**：将所有设置项名称和描述修改为 Sentence case（仅句首首字母大写，除非是专有名词）。
  - 例如：`Enable code block styles` -> `Enable code block styles` (已符合)
  - 检查所有 `setName` 和 `setDesc`。

## 任务清单
- [ ] 清理 `src/features/containerParser.ts` 中的冗余类型断言 (Line 222, 282)。
- [ ] 修复 `src/features/containerParser.ts` 中的 `innerHTML` 使用，改用 `empty()` (Line 250, 253)。
- [ ] 在 `src/features/containerParser.ts` 中使用更安全的方法插入 SVG 图标 (Line 373)。
- [ ] 将 `src/main.ts` 中的 `console.log` 改为 `console.debug` (Line 104)。
- [ ] 优化 `src/settings.ts` 中的所有 UI 文本，遵循 Sentence case。
- [ ] 扫描整个项目以查找并清理其他 `innerHTML` 滥用。
