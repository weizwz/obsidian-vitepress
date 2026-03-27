/**
 * VitePress Theme Plugin Settings
 *
 * 控制插件各模块的开启状态与主题配置。
 * 所有样式类开关（enable*）仅影响 CSS 注入，不影响解析逻辑；
 * enableContainerParser 同时控制 ::: 容器的 DOM 解析与渲染。
 */
export interface VitePressSettings {
  // ── 样式开关 ──────────────────────────────────────────────

  /**
   * 启用代码块增强样式
   * - 注入 `.vp-code-block` 外壳 CSS（header、语言标签、文件名、代码组 Tab）
   */
  enableCodeBlocks: boolean

  /**
   * 启用提示容器与折叠容器样式
   * - 注入 `.vp-container`（info/tip/warning/danger）和 `.vp-details` 的 CSS
   */
  enableContainers: boolean

  /**
   * 启用排版样式
   * - 标题尺寸、下边框、链接颜色、行高等与 VitePress 文档站点对齐
   */
  enableTypography: boolean

  // ── 功能开关 ──────────────────────────────────────────────

  /**
   * 解析 VitePress 容器语法
   * - 将 `:::` 语法（info/tip/warning/danger/details/code-group）
   *   在阅读模式下解析并渲染为对应 DOM 结构
   * - 关闭后 `:::` 文本保持原样显示
   */
  enableContainerParser: boolean

  /**
   * 处理链接
   * - 为外部链接添加 ↗ 图标并设置 target="_blank"
   * - 解析 VitePress 风格的相对路径链接
   */
  enableLinkProcessing: boolean

  // ── 主题配置 ──────────────────────────────────────────────

  /**
   * 跟随 Obsidian 主题色
   * - 开启时：使用 Obsidian 当前 accent 色作为品牌色
   * - 关闭时：使用 customPrimaryColor 作为品牌色
   */
  followObsidianTheme: boolean

  /**
   * 自定义主品牌色（HEX 格式）
   * - 仅在 followObsidianTheme 为 false 时生效
   * @default '#3451b2'
   */
  customPrimaryColor: string

  // ── 调试 ──────────────────────────────────────────────────

  /**
   * 调试模式
   * - 开启后 plugin.log() 调用会输出到控制台
   */
  debugMode: boolean
}

export const DEFAULT_SETTINGS: VitePressSettings = {
  enableCodeBlocks: true,
  enableContainers: true,
  enableTypography: true,
  enableContainerParser: true,
  enableLinkProcessing: true,
  followObsidianTheme: true,
  customPrimaryColor: '#3451b2',
  debugMode: false,
}