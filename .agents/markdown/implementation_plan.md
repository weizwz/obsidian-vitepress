# Obsidian VitePress 插件修改计划

针对机器人审核提出的问题，本项目需要进行结构化的代码重构和规范化调整。以下是详细的修改计划。

## 1. 核心重构方向

### 1.1 从动态样式注入转向静态 CSS
*   **问题**：目前通过 `src/main.ts` 动态创建 `<style>` 标签并注入内容，这违反了 Obsidian 插件审核规定。
*   **方案**：
    *   创建根目录 `styles.css`，将所有样式迁移至此。
    *   使用 **Body Class** 机制（如 `.vp-enable-typography`）来控制不同功能的开关。
    *   使用 `setCssProps` 在 Body 上动态设置 CSS 变量（如品牌色），替代直接拼接字符串。

### 1.2 提升 DOM 操作安全性
*   **问题**：多处使用 `innerHTML` 和 `outerHTML`，存在安全隐患。
*   **方案**：
    *   使用 Obsidian 推荐的 `createEl`, `createDiv`, `createSpan` 等 API 构建 DOM。
    *   对于需要保留原有 HTML 结构的场景，采用节点克隆或逐个节点移动的方式，而非字符串拼接。

### 1.3 代码规范与类型强健性
*   **问题**：存在 `any` 类型、不必要的断言、未处理的 Promise 以及不规范的日志输出。
*   **方案**：
    *   补全 `MarkdownPostProcessorContext` 等缺失的类型定义。
    *   为异步调用添加 `await` 或 `void` 操作符。
    *   将 `console.log` 替换为插件的 `log` 方法或 `console.debug/warn/error`。

---

## 2. 阶段性修改任务清单

### 第一阶段：CSS 重构与样式应用优化
> **目标**：消除 `styleElement` 相关代码，建立基于类的控制机制。

- [ ] **1.1 创建 `styles.css`**：迁移 `src/main.ts` 中的所有 CSS 代码，添加基础控制类。
- [ ] **1.2 重构 `src/main.ts`**：
    - [ ] 移除 `applyStyles`, `styleElement` 及所有 `getXXXStyles` 方法。
    - [ ] 修改 `onload` 逻辑，在设置变更时通过 `document.body.classList` 切换功能类名。
    - [ ] 动态设置 `--vp-c-brand-1` 等 CSS 变量。
- [ ] **1.3 修复直设样式 (Inline Styles)**：
    - [ ] `src/features/codeEnhancer.ts`：移除 `style.position`，改用 `.vp-relative` 类。
    - [ ] `src/features/containerParser.ts`：移除 `style.display = 'none'`，改用 `.vp-hidden` 类。
    - [ ] `src/features/linkProcessor.ts`：移除 `style.fontSize` 等设置，改用 `.vp-external-icon` 类。

### 第二阶段：DOM 安全性修复
> **目标**：移除所有不合规的 `innerHTML` 调用。

- [ ] **2.1 重构 `ContainerParser.ts`**：
    - [ ] 修改 `createContainerElement`：使用 `createDiv` 构建头部和内容区。
    - [ ] 修改 `processParagraphContainers`：不使用 `innerHTML` 拼接段落内容。
- [ ] **2.2 重构 `LinkProcessor.ts`**：
    - [ ] 修改外部链接图标生成逻辑，使用 `textContent` 替代 `innerHTML`。

### 第三阶段：类型修复与代码规范
> **目标**：解决 TS 警告和运行时隐患。

- [ ] **3.1 修复 `Unexpected any`**：将所有 `ctx: any` 替换为 `MarkdownPostProcessorContext`。
- [ ] **3.2 修复 Promise 等待**：在 `linkProcessor.ts` 中为异步点击事件添加 `void` 处理。
- [ ] **3.3 修正正则转义**：移除 `emojiProcessor.ts` 中多余的 `\-` 转义。
- [ ] **3.4 清理控制台输出**：规范化 `console` 打印。

### 第四阶段：设置页面 (UX) 与最终清理
> **目标**：统一 UI 风格，移除冗余代码。

- [ ] **4.1 规范设置标题**：使用 `.setHeading()` 方法替换直接创建的 `h2`/`h3`。
- [ ] **4.2 文本大小写规范**：确保设置页的所有名称均遵循 Sentence case。
- [ ] **4.3 移除未使用导入**：清理 `src/main.ts` 和 `src/settings.ts` 中被标注为 unused 的变量。

---

## 3. 验证方式
*   运行 `npm run lint` 确保所有 eslint 规则通过。
*   在预览模式下检查：
    1. 容器（info/tip/warning/danger）是否渲染正常。
    2. 代码块增强（文件名、复制按钮）是否生效。
    3. 表格、引用、Emoji 是否显示正确。
    4. 设置项开关是否能即时改变预览样式。
