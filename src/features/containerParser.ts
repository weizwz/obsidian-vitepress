import { App, MarkdownPostProcessorContext, Component } from 'obsidian';
import type VitePressThemePlugin from '../main';

/**
 * Parses VitePress-style custom containers
 * Syntax: ::: type [title]
 *         content
 *         :::
 */
export class ContainerParser {
  private plugin: VitePressThemePlugin;
  private app: App;

  constructor(plugin: VitePressThemePlugin) {
    this.plugin = plugin;
    this.app = plugin.app;
  }

  /**
   * Post-processor for custom containers
   */
  processContainer = (el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
    if (!this.plugin.settings.enableContainerParser) return;

    const codeBlocks = el.querySelectorAll('pre > code');
    codeBlocks.forEach((codeBlock) => {
      const pre = codeBlock.parentElement;
      const text = codeBlock.textContent || '';

      // Check if this is a container definition
      if (this.isContainerStart(text)) {
        this.parseContainerBlock(pre as HTMLElement, ctx);
      }
    });

    // Also process inline ::: syntax in paragraphs
    this.processInlineContainers(el);
  };

  /**
   * Check if text is a container start
   */
  private isContainerStart(text: string): boolean {
    return /^:::\s*(tip|warning|danger|info|details)/i.test(text.trim());
  }

  /**
   * Parse a container block from code element
   */
  private parseContainerBlock(startEl: HTMLElement, ctx: MarkdownPostProcessorContext): void {
    const codeBlock = startEl.querySelector('code');
    if (!codeBlock) return;

    const text = codeBlock.textContent || '';
    const match = text.match(/^:::\s*(\w+)(?:\s+(.+))?$/i);
    if (!match) return;

    const [, type, title] = match;
    const containerEl = document.createElement('div');
    containerEl.className = `vp-container vp-${type.toLowerCase()}`;

    if (title) {
      const titleEl = document.createElement('div');
      titleEl.className = 'vp-container-title';
      titleEl.textContent = title;
      containerEl.appendChild(titleEl);
    }

    // Find closing :::
    let currentEl: HTMLElement | null = startEl.parentElement?.nextElementSibling as HTMLElement;
    const contentEl = document.createElement('div');
    contentEl.className = 'vp-container-content';

    while (currentEl) {
      const code = currentEl.querySelector('pre > code');
      if (code && code.textContent?.trim() === ':::') {
        // Found closing tag
        currentEl.remove();
        break;
      }

      // Clone content
      contentEl.appendChild(currentEl.cloneNode(true));
      const toRemove = currentEl;
      currentEl = currentEl.nextElementSibling as HTMLElement;
      toRemove.remove();
    }

    containerEl.appendChild(contentEl);

    // Replace original code block
    startEl.parentElement?.replaceWith(containerEl);
  }

  /**
   * Process inline ::: syntax in rendered markdown
   */
  private processInlineContainers(el: HTMLElement): void {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    const nodesToProcess: Text[] = [];

    let textNode;
    while (textNode = walker.nextNode() as Text) {
      if (textNode.textContent?.includes(':::')) {
        nodesToProcess.push(textNode);
      }
    }

    nodesToProcess.forEach(node => {
      const parent = node.parentElement;
      if (!parent) return;

      const content = node.textContent || '';
      const lines = content.split('\n');

      // Simple inline processing for now
      // Full implementation would require more complex parsing
    });
  }

  /**
   * Create container HTML from parsed data
   */
  createContainer(type: string, title: string, content: string): string {
    const iconMap: Record<string, string> = {
      tip: '💡',
      warning: '⚠️',
      danger: '🛑',
      info: 'ℹ️',
      details: '▶️',
    };

    const icon = iconMap[type] || '';
    const displayTitle = title || type.charAt(0).toUpperCase() + type.slice(1);

    return `
      <div class="vp-container vp-${type}">
        <div class="vp-container-title">${icon} ${displayTitle}</div>
        <div class="vp-container-content">${content}</div>
      </div>
    `;
  }
}