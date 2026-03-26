import { App, Component, MarkdownPostProcessorContext, Plugin, TFile } from 'obsidian';
import { VitePressSettingTab } from './settings';
import { VitePressSettings, DEFAULT_SETTINGS } from './types/settings';
import { ContainerParser } from './features/containerParser';
import { CodeEnhancer } from './features/codeEnhancer';
import { LinkProcessor } from './features/linkProcessor';
import { EmojiProcessor } from './features/emojiProcessor';
import { BadgeProcessor } from './features/badgeProcessor';

export default class VitePressThemePlugin extends Plugin {
  settings: VitePressSettings;
  private containerParser: ContainerParser;
  private codeEnhancer: CodeEnhancer;
  private linkProcessor: LinkProcessor;
  private emojiProcessor: EmojiProcessor;
  private badgeProcessor: BadgeProcessor;
  private styleElement: HTMLStyleElement | null = null;

  async onload() {
    await this.loadSettings();

    // Initialize features
    this.containerParser = new ContainerParser(this);
    this.codeEnhancer = new CodeEnhancer(this);
    this.linkProcessor = new LinkProcessor(this);
    this.emojiProcessor = new EmojiProcessor(this.app);
    this.badgeProcessor = new BadgeProcessor(this.app);

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
      this.badgeProcessor.processBadges(el, ctx);
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
    css += this.getBadgeStyles();

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
    `;
  }

  /**
   * Get badge styles
   */
  private getBadgeStyles(): string {
    return `
      .vp-badge {
        display: inline-block;
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 0.85em;
        font-weight: 500;
        margin: 0 4px;
        border: 1px solid;
      }

      /* info - blue (default) */
      .vp-badge-info,
      .vp-badge-default {
        color: #3b82f6;
        background: rgba(59, 130, 246, 0.1);
        border-color: #3b82f6;
      }

      /* tip - green */
      .vp-badge-tip {
        color: #42b883;
        background: rgba(66, 184, 131, 0.1);
        border-color: #42b883;
      }

      /* warning - yellow/orange */
      .vp-badge-warning {
        color: #f59e0b;
        background: rgba(245, 158, 11, 0.1);
        border-color: #f59e0b;
      }

      /* danger - red */
      .vp-badge-danger {
        color: #ef4444;
        background: rgba(239, 68, 68, 0.1);
        border-color: #ef4444;
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
