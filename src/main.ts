import { App, Component, MarkdownPostProcessorContext, Plugin, TFile } from 'obsidian'
import { VitePressSettingTab } from './settings'
import { VitePressSettings, DEFAULT_SETTINGS } from './types/settings'
import { ContainerParser } from './features/containerParser'
import { CodeEnhancer } from './features/codeEnhancer'
import { LinkProcessor } from './features/linkProcessor'
import { EmojiProcessor } from './features/emojiProcessor'

export default class VitePressThemePlugin extends Plugin {
  settings: VitePressSettings
  private containerParser: ContainerParser
  public codeEnhancer: CodeEnhancer
  private linkProcessor: LinkProcessor
  private emojiProcessor: EmojiProcessor
  private styleElement: HTMLStyleElement | null = null

  async onload() {
    await this.loadSettings()

    // Initialize features
    this.containerParser = new ContainerParser(this)
    this.codeEnhancer = new CodeEnhancer(this)
    this.linkProcessor = new LinkProcessor(this)
    this.emojiProcessor = new EmojiProcessor(this.app)

    // Add settings tab
    this.addSettingTab(new VitePressSettingTab(this.app, this))

    // Apply styles
    this.applyStyles()

    // Register post processors
    this.registerMarkdownPostProcessor((el, ctx) => {
      this.containerParser.processContainer(el, ctx)
      this.codeEnhancer.enhanceCodeBlocks(el, ctx)
      this.linkProcessor.processLinks(el, ctx)
      this.emojiProcessor.processEmoji(el, ctx)
    })

    // Add theme class to body
    document.body.classList.add('vitepress-theme')

    // Listen for theme changes
    this.registerEvent(
      this.app.workspace.on('css-change', () => {
        this.applyStyles()
      })
    )

    this.log('VitePress Theme loaded')
  }

  onunload() {
    // Remove styles
    if (this.styleElement) {
      this.styleElement.remove()
      this.styleElement = null
    }

    // Remove theme class
    document.body.classList.remove('vitepress-theme')

    this.log('VitePress Theme unloaded')
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
  }

  async saveSettings() {
    await this.saveData(this.settings)
  }

  /**
   * Apply CSS styles based on settings
   */
  applyStyles() {
    // Remove existing styles
    if (this.styleElement) {
      this.styleElement.remove()
    }

    // Create new style element
    this.styleElement = document.createElement('style')
    this.styleElement.id = 'vitepress-theme-styles'

    let css = ''

    // Base variables always applied
    if (this.settings.followObsidianTheme) {
      css += this.getDynamicVariables()
    }

    // Apply component styles based on settings
    if (this.settings.enableTypography) {
      css += this.getTypographyStyles()
    }

    if (this.settings.enableContainers) {
      css += this.getContainerStyles()
    }

    if (this.settings.enableCodeBlocks) {
      css += this.getCodeBlockStyles()
      css += this.getCodeGroupStyles()
    }

    // Always apply table and callout styles
    css += this.getTableStyles()
    css += this.getCalloutStyles()
    css += this.getEmojiStyles()

    this.styleElement.textContent = css
    document.head.appendChild(this.styleElement)
  }

  /**
   * Get dynamic CSS variables based on Obsidian theme
   */
  private getDynamicVariables(): string {
    const accent = this.settings.followObsidianTheme ? 'var(--accent-color)' : this.settings.customPrimaryColor

    return `
      .vitepress-theme {
        --vp-c-brand-1: ${accent};
        --vp-c-brand-2: ${accent};
        --vp-c-brand-3: ${accent};
      }
    `
  }

  /**
   * Get typography styles
   */
  private getTypographyStyles(): string {
    return `
      .vitepress-theme .markdown-preview-view {
        font-family: var(--font-interface);
        font-size: 16px;
        line-height: 1.7;
      }

      .vitepress-theme .metadata-content {
        background: hsla(var(--accent-h), var(--accent-s), var(--accent-l), 0.05);
        border: solid 1px hsla(var(--accent-h), var(--accent-s), var(--accent-l), 0.1);
        border-radius: 8px;
        padding: 8px;
      }

      .vitepress-theme .markdown-preview-view h1 {
        font-size: 2.2rem;
        border-bottom: 1px solid var(--divider-color);
        padding-bottom: 16px;
      }

      .vitepress-theme .markdown-preview-view h2 {
        font-size: 1.65rem;
        border-bottom: 1px solid var(--divider-color);
        padding: 12px 0;
      }

      .vitepress-theme .markdown-preview-view h3 {
        font-size: 1.35rem;
      }

      .vitepress-theme .markdown-preview-view a {
        color: var(--vp-c-brand-1);
        text-decoration: none;
        font-weight: 500;
      }

      .vitepress-theme .markdown-preview-view a:hover {
        text-decoration: underline;
      }
    `
  }

  /**
   * Get VitePress container styles (GitHub-style)
   */
  private getContainerStyles(): string {
    return `
      /* VitePress Custom Containers - GitHub Alert Style */
      .vp-container {
        border-radius: 8px;
        padding: 16px 20px;
        margin: 1em 0;
        border-left: 4px solid;
        background: var(--background-secondary-alt);
      }

      .vp-container-header {
        padding: var(--callout-title-padding);
        display: flex;
        gap: var(--size-4-1);
        font-size: var(--callout-title-size);
        color: rgb(var(--callout-color));
        align-items: center;
        margin-bottom: 12px;
      }

      .vp-container-icon {
        flex: 0 0 auto;
        display: flex;
        align-items: center;
      }

      .vp-container-title-text {
        color: inherit;
        --font-weight: var(--callout-title-weight);
        font-weight: var(--font-weight);
      }

      .vp-container-content {
        color: var(--text-normal);
        line-height: 1.6;
      }

      .vp-container-content > *:first-child {
        margin-top: 0;
      }

      .vp-container-content > *:last-child {
        margin-bottom: 0;
      }

      .vp-container-content p {
        margin: 0.5em 0;
      }

      .vp-container-content p:first-child {
        margin-top: 0;
      }

      .vp-container-content p:last-child {
        margin-bottom: 0;
      }

      /* 
       * VitePress -> GitHub mapping:
       * ::: info    -> [!NOTE]     蓝色  var(--callout-info)
       * ::: tip     -> [!TIP]      绿色  var(--callout-tip)
       * ::: warning -> [!WARNING]  黄色  var(--callout-warning)
       * ::: danger  -> [!CAUTION]  红色  var(--callout-error)
       */

      /*
       * GitHub Alert Style Colors
       * Source: https://github.com/orgs/community/discussions/16925
       */

      .vp-container.vp-info {
        background: rgba(var(--callout-info), 0.1);
        border-color: rgba(var(--callout-info), var(--callout-border-opacity));
      }
      .vp-container.vp-info .vp-container-header {
        color: rgb(var(--callout-info));
      }

      .vp-container.vp-tip {
        background: rgba(var(--callout-tip), 0.1);
        border-color: rgba(var(--callout-tip), var(--callout-border-opacity));
      }
      .vp-container.vp-tip .vp-container-header {
        color: rgb(var(--callout-tip));
      }

      .vp-container.vp-warning {
        background: rgba(var(--callout-warning), 0.1);
        border-color: rgba(var(--callout-warning), var(--callout-border-opacity));
      }
      .vp-container.vp-warning .vp-container-header {
        color: rgb(var(--callout-warning));
      }

      .vp-container.vp-danger {
        background: rgba(var(--callout-error), 0.1);
        border-color: rgba(var(--callout-error), var(--callout-border-opacity));
      }
      .vp-container.vp-danger .vp-container-header {
        color: rgb(var(--callout-error));
      }

      /* Blockquote - styled like info container */
      .vitepress-theme .markdown-preview-view blockquote {
        border-radius: 8px;
        padding: 16px 20px;
        margin: 1em 0;
        border-left: 4px solid var(--blockquote-border-color);
        background: hsla(var(--accent-h), var(--accent-s), var(--accent-l), 0.1);
      }

      .vitepress-theme .markdown-preview-view blockquote > p:first-child {
        margin-top: 0;
      }

      .vitepress-theme .markdown-preview-view blockquote > p:last-child {
        margin-bottom: 0;
      }

      .vitepress-theme .markdown-preview-view blockquote p {
        color: var(--text-normal);
        line-height: 1.6;
        margin: 0.5em 0;
      }
    `
  }

  /**
   * Get code block styles
   */
  private getCodeBlockStyles(): string {
    return `
      .markdown-rendered pre {
        margin: 0;
      }
      .vp-code-block {
        background: var(--code-background);
        border-radius: 8px;
        overflow: hidden;
      }

      .vp-code-block-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 16px;
        box-shadow: inset 0 -1px var(--background-modifier-border);
      }
    `
  }

  /**
   * Get table styles
   */
  private getTableStyles(): string {
    return `
      .vitepress-theme table {
        border-collapse: collapse;
        width: 100%;
        margin: 16px 0;
      }

      .vitepress-theme th,
      .vitepress-theme td {
        padding: 12px 16px;
        border-bottom: 1px solid var(--divider-color);
      }

      .vitepress-theme th {
        font-weight: 600;
        text-align: left;
        background: var(--background-secondary);
      }
    `
  }

  /**
   * Get callout styles
   */
  private getCalloutStyles(): string {
    return `
      .vitepress-theme .callout {
        border-radius: 8px;
        border-left: solid 4px;
        padding: 16px 20px;
      }
      .vitepress-theme .callout-title {
        margin-bottom: 12px;
      }
      .vitepress-theme .callout-content > *:first-child {
        margin-top: 0;
      }
      .vitepress-theme .callout-content > *:last-child {
        margin-bottom: 0;
      }
      .vitepress-theme .callout-content p {
        margin: 0.5em 0;
      }

      .vitepress-theme .callout[data-callout="note"],
      .vitepress-theme .callout[data-callout="info"] {
        background: rgba(var(--callout-info), 0.1);
        border-color: rgba(var(--callout-info), var(--callout-border-opacity));
      }

      .vitepress-theme .callout[data-callout="tip"] {
        background: rgba(var(--callout-tip), 0.1);
        border-color: rgba(var(--callout-tip), var(--callout-border-opacity));
      }

      .vitepress-theme .callout[data-callout="important"] {
        background: rgba(var(--callout-example), 0.1);
        border-color: rgba(var(--callout-example), var(--callout-border-opacity));
      }
      .vitepress-theme .callout[data-callout="important"] .callout-title,
      .vitepress-theme .callout[data-callout="important"] .svg-icon {
        color: rgb(var(--callout-example));
      }

      .vitepress-theme .callout[data-callout="warning"] {
        background: rgba(var(--callout-warning), 0.1);
        border-color: rgba(var(--callout-warning), var(--callout-border-opacity));
      }

      .vitepress-theme .callout[data-callout="danger"],
      .vitepress-theme .callout[data-callout="caution"] {
        background: rgba(var(--callout-error), 0.1);
        border-color: rgba(var(--callout-error), var(--callout-border-opacity));
      }
      .vitepress-theme .callout[data-callout="caution"] .callout-title,
      .vitepress-theme .callout[data-callout="caution"] .svg-icon {
        color: rgb(var(--callout-error));
      }
    `
  }

  /**
   * Get emoji styles - dual display with CSS control
   */
  private getEmojiStyles(): string {
    return `
      /* Base emoji wrapper */
      .vp-emoji-wrapper {
        display: inline;
        position: relative;
      }

      /* Emoji display (shown in preview) */
      .vp-emoji-display {
        font-family: "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", sans-serif;
        font-style: normal;
      }

      /* Source display (shown in editor) */
      .vp-emoji-source {
        font-family: var(--font-monospace);
        font-size: 0.9em;
        color: var(--text-muted);
        background: var(--background-secondary);
        padding: 2px 4px;
        border-radius: 4px;
        white-space: nowrap;
      }

      /* 
       * MODE-SPECIFIC DISPLAY CONTROL
       * =============================
       */

      /* READING MODE (full preview): Show emoji, hide source */
      .markdown-preview-view .vp-emoji-display {
        display: inline !important;
      }
      .markdown-preview-view .vp-emoji-source {
        display: none !important;
      }

      /* Hover in reading mode: Show source */
      .markdown-preview-view .vp-emoji-wrapper:hover .vp-emoji-display {
        display: none !important;
      }
      .markdown-preview-view .vp-emoji-wrapper:hover .vp-emoji-source {
        display: inline !important;
      }

      /* EDITOR MODES (source + live preview): Always show source, never emoji */
      .cm-editor .vp-emoji-display,
      .markdown-source-view .vp-emoji-display {
        display: none !important;
      }
      .cm-editor .vp-emoji-source,
      .markdown-source-view .vp-emoji-source {
        display: inline !important;
      }

      /* CODE BLOCKS: Always show source */
      pre .vp-emoji-display,
      code .vp-emoji-display,
      .HyperMD-codeblock .vp-emoji-display {
        display: none !important;
      }
      pre .vp-emoji-source,
      code .vp-emoji-source,
      .HyperMD-codeblock .vp-emoji-source {
        display: inline !important;
      }
    `
  }

  /**
   * Get code group styles
   */
  private getCodeGroupStyles(): string {
    return `
      /* Code Group - Tabbed Code Blocks */
      :root {
        --code-background: var(--background-secondary);
      }
      .vp-code-group {
        border-radius: 8px;
        overflow: hidden;
        margin: 16px 0;
        background: var(--code-background);
      }

      .vp-code-group .vp-code-block-header {
        display: none;
      }

      .vp-code-group-tabs {
        display: flex;
        padding: 0 16px;
        overflow-x: auto;
        box-shadow: inset 0 -1px var(--background-modifier-border);
      }

      .vp-code-group-tab {
        padding: 8px;
        border: none !important;
        background-color: transparent !important;
        box-shadow: none !important;
        border-radius: 0 !important;
        color: var(--text-muted);
        cursor: pointer;
        font-family: var(--font-monospace);
        font-size: 0.9em;
        position: relative;
        white-space: nowrap;
        flex-shrink: 0;
        margin: 0 !important;
        height: 46px;
      }

      .vp-code-group-tab:hover {
        color: var(--text-normal);
      }

      .vp-code-group-tab::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 2px;
        border-radius: 2px;
        background-color: transparent;
        transition: background-color 0.2s;
      }

      .vp-code-group-tab.active {
        color: var(--interactive-accent) !important;
      }

      .vp-code-group-tab.active::after {
        background-color: var(--interactive-accent);
      }

      .vp-code-group-contents {
        position: relative;
      }

      /* content 面板：默认隐藏，active 时显示 */
      .vp-code-group-content {
        display: none;
      }

      .vp-code-group-content.active {
        display: block;
      }

      .vp-code-group-content pre {
        margin: 0;
        border-radius: 0;
      }
    `
  }

  /**
   * Log to console if debug mode is enabled
   */
  log(...args: any[]) {
    if (this.settings.debugMode) {
      console.log('[VitePress Theme]', ...args)
    }
  }
}
