import { App, Component, MarkdownPostProcessorContext, Plugin, TFile } from 'obsidian';
import { VitePressSettingTab } from './settings';
import { VitePressSettings, DEFAULT_SETTINGS } from './types/settings';
import { ContainerParser } from './features/containerParser';
import { CodeEnhancer } from './features/codeEnhancer';
import { LinkProcessor } from './features/linkProcessor';
import { EmojiProcessor } from './features/emojiProcessor';

export default class VitePressThemePlugin extends Plugin {
  settings: VitePressSettings;
  private containerParser: ContainerParser;
  private codeEnhancer: CodeEnhancer;
  private linkProcessor: LinkProcessor;
  private emojiProcessor: EmojiProcessor;
  private styleElement: HTMLStyleElement | null = null;

  async onload() {
    await this.loadSettings();

    // Initialize features
    this.containerParser = new ContainerParser(this);
    this.codeEnhancer = new CodeEnhancer(this);
    this.linkProcessor = new LinkProcessor(this);
    this.emojiProcessor = new EmojiProcessor(this.app);

    // Add settings tab
    this.addSettingTab(new VitePressSettingTab(this.app, this));

    // Apply styles
    this.applyStyles();

    // Register post processors
    this.registerMarkdownPostProcessor((el, ctx) => {
      this.containerParser.processContainer(el, ctx);
      this.codeEnhancer.enhanceCodeBlocks(el);
      this.linkProcessor.processLinks(el, ctx);
      this.emojiProcessor.processEmoji(el, ctx);
    });

    // Add theme class to body
    document.body.classList.add('vitepress-theme');

    // Listen for theme changes
    this.registerEvent(
      this.app.workspace.on('css-change', () => {
        this.applyStyles();
      })
    );

    this.log('VitePress Theme loaded');
  }

  onunload() {
    // Remove styles
    if (this.styleElement) {
      this.styleElement.remove();
      this.styleElement = null;
    }

    // Remove theme class
    document.body.classList.remove('vitepress-theme');

    this.log('VitePress Theme unloaded');
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  /**
   * Apply CSS styles based on settings
   */
  applyStyles() {
    // Remove existing styles
    if (this.styleElement) {
      this.styleElement.remove();
    }

    // Create new style element
    this.styleElement = document.createElement('style');
    this.styleElement.id = 'vitepress-theme-styles';

    let css = '';

    // Base variables always applied
    if (this.settings.followObsidianTheme) {
      css += this.getDynamicVariables();
    }

    // Apply component styles based on settings
    if (this.settings.enableTypography) {
      css += this.getTypographyStyles();
    }

    if (this.settings.enableContainers) {
      css += this.getContainerStyles();
    }

    if (this.settings.enableCodeBlocks) {
      css += this.getCodeBlockStyles();
    }

    // Always apply table and callout styles
    css += this.getTableStyles();
    css += this.getCalloutStyles();
    css += this.getEmojiStyles();

    this.styleElement.textContent = css;
    document.head.appendChild(this.styleElement);
  }

  /**
   * Get dynamic CSS variables based on Obsidian theme
   */
  private getDynamicVariables(): string {
    const accent = this.settings.followObsidianTheme
      ? 'var(--accent-color)'
      : this.settings.customPrimaryColor;

    return `
      .vitepress-theme {
        --vp-c-brand-1: ${accent};
        --vp-c-brand-2: ${accent};
        --vp-c-brand-3: ${accent};
      }
    `;
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

      .vitepress-theme .markdown-preview-view h1 {
        font-size: 2.2rem;
        border-bottom: 1px solid var(--divider-color);
        padding-bottom: 16px;
      }

      .vitepress-theme .markdown-preview-view h2 {
        font-size: 1.65rem;
        border-bottom: 1px solid var(--divider-color);
        padding-bottom: 12px;
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
    `;
  }

  /**
   * Get container styles
   */
  private getContainerStyles(): string {
    return `
      .vp-container {
        border-radius: 8px;
        padding: 16px 20px;
        margin: 16px 0;
        border-left: 4px solid transparent;
        background: var(--background-secondary);
      }

      .vp-container.vp-tip {
        background: rgba(66, 184, 131, 0.1);
        border-color: #42b883;
      }

      .vp-container.vp-warning {
        background: rgba(234, 179, 8, 0.1);
        border-color: #eab308;
      }

      .vp-container.vp-danger {
        background: rgba(244, 63, 94, 0.1);
        border-color: #f43f5e;
      }

      .vp-container-title {
        font-weight: 600;
        margin-bottom: 8px;
      }
    `;
  }

  /**
   * Get code block styles
   */
  private getCodeBlockStyles(): string {
    return `
      .vp-code-block {
        background: var(--code-background);
        border-radius: 8px;
        overflow: hidden;
        margin: 16px 0;
      }

      .vp-code-block-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 16px;
        background: var(--background-secondary-alt);
      }

      .vp-code-copy-btn {
        background: var(--interactive-normal);
        border: none;
        padding: 4px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.85em;
      }

      .vp-code-copy-btn:hover {
        background: var(--interactive-hover);
      }

      .vp-code-copy-btn.copied {
        color: #42b883;
      }
    `;
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
    `;
  }

  /**
   * Get callout styles
   */
  private getCalloutStyles(): string {
    return `
      .vitepress-theme .callout {
        border-radius: 8px;
        border-left-width: 4px;
      }

      .vitepress-theme .callout[data-callout="tip"] {
        background: rgba(66, 184, 131, 0.1);
        border-color: #42b883;
      }

      .vitepress-theme .callout[data-callout="warning"] {
        background: rgba(234, 179, 8, 0.1);
        border-color: #eab308;
      }

      .vitepress-theme .callout[data-callout="danger"] {
        background: rgba(244, 63, 94, 0.1);
        border-color: #f43f5e;
      }
    `;
  }

  /**
   * Get emoji styles with hover effect
   */
  private getEmojiStyles(): string {
    return `
      .vp-emoji-container {
        display: inline;
      }

      .vp-emoji-wrapper {
        display: inline-block;
        position: relative;
        cursor: pointer;
      }

      .vp-emoji {
        font-family: "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", sans-serif;
        font-style: normal;
      }

      .vp-emoji-source {
        display: none;
        font-family: var(--font-monospace);
        font-size: 0.9em;
        color: var(--text-muted);
        background: var(--background-secondary);
        padding: 2px 4px;
        border-radius: 4px;
        white-space: nowrap;
      }

      /* Show source on hover */
      .vp-emoji-wrapper:hover .vp-emoji {
        display: none;
      }

      .vp-emoji-wrapper:hover .vp-emoji-source {
        display: inline;
      }

      /* Source mode - always show source, never emoji */
      /* Higher specificity for CodeMirror */
      body .cm-editor .vp-emoji,
      body .markdown-source-view .vp-emoji,
      .cm-content .vp-emoji,
      .cm-line .vp-emoji {
        display: none !important;
      }

      body .cm-editor .vp-emoji-source,
      body .markdown-source-view .vp-emoji-source,
      .cm-content .vp-emoji-source,
      .cm-line .vp-emoji-source {
        display: inline !important;
      }
      
      /* Ensure code blocks never show emoji */
      pre .vp-emoji,
      code .vp-emoji {
        display: none !important;
      }
      
      pre .vp-emoji-source,
      code .vp-emoji-source {
        display: inline !important;
      }
    `;
  }

  /**
   * Log to console if debug mode is enabled
   */
  log(...args: any[]) {
    if (this.settings.debugMode) {
      console.log('[VitePress Theme]', ...args);
    }
  }
}
