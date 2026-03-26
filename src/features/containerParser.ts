import { App, MarkdownPostProcessorContext, Component } from 'obsidian';
import type VitePressThemePlugin from '../main';

/**
 * Parses VitePress-style custom containers
 * Syntax: ::: type [title]
 *         content
 *         :::
 *
 * GitHub-style mapping:
 * - ::: info -> [!NOTE] 蓝色
 * - ::: tip -> [!TIP] 绿色
 * - ::: warning -> [!WARNING] 黄色
 * - ::: danger -> [!CAUTION] 红色
 */
export class ContainerParser {
  private plugin: VitePressThemePlugin;
  private app: App;

  // SVG icons (inline)
  private svgIcons: Record<string, string> = {
    info: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-info-icon lucide-info"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
    note: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-info-icon lucide-info"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
    tip: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pencil-line-icon lucide-pencil-line"><path d="M13 21h8"/><path d="m15 5 4 4"/><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/></svg>',
    important: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bell-icon lucide-bell"><path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/></svg>',
    warning: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-triangle-alert-icon lucide-triangle-alert"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',
    danger: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-x-icon lucide-circle-x"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>',
  };

  // GitHub-style label mapping (Chinese)
  private labelMap: Record<string, string> = {
    info: '提示',
    note: '提示',
    tip: '建议',
    important: '重要',
    warning: '警告',
    danger: '危险',
  };

  constructor(plugin: VitePressThemePlugin) {
    this.plugin = plugin;
    this.app = plugin.app;
  }

  /**
   * Post-processor for custom containers
   */
  processContainer = (el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
    if (!this.plugin.settings.enableContainerParser) return;

    // Process code block format
    const codeBlocks = el.querySelectorAll('pre > code');
    codeBlocks.forEach((codeBlock) => {
      const pre = codeBlock.parentElement;
      const text = codeBlock.textContent || '';

      if (this.isContainerStart(text)) {
        this.parseContainerBlock(pre as HTMLElement, ctx);
      }
    });

    // Process paragraph format (::: in text with <br>)
    this.processParagraphContainers(el);
  };

  /**
   * Check if text is a container start
   * VitePress syntax: ::: info|tip|warning|danger
   */
  private isContainerStart(text: string): boolean {
    return /^:::\s*(tip|warning|danger|info)/i.test(text.trim());
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

    const [, type, customTitle] = match;
    const typeLower = type.toLowerCase();

    // Create GitHub-style container
    const containerEl = this.createContainerElement(typeLower, customTitle);

    // Find closing :::
    let currentEl: HTMLElement | null = startEl.parentElement?.nextElementSibling as HTMLElement;
    const contentEl = containerEl.querySelector('.vp-container-content') as HTMLElement;

    while (currentEl) {
      const code = currentEl.querySelector('pre > code');
      if (code && code.textContent?.trim() === ':::') {
        currentEl.remove();
        break;
      }

      contentEl.appendChild(currentEl.cloneNode(true));
      const toRemove = currentEl;
      currentEl = currentEl.nextElementSibling as HTMLElement;
      toRemove.remove();
    }

    startEl.parentElement?.replaceWith(containerEl);
  }

  /**
   * Process containers in paragraph format (with <br> line breaks)
   */
  private processParagraphContainers(el: HTMLElement): void {
    const paragraphs = el.querySelectorAll('p');

    paragraphs.forEach(p => {
      const html = p.innerHTML;

      // Check if this paragraph contains ::: container syntax
      // Pattern: starts with ::: type [title] and ends with :::
      const containerMatch = html.match(/^(?::\s*)?:::\s*(\w+)(?:\s+([^<\n]+))?\s*(?:<br\s*\/?>\s*|\n)?([\s\S]*?)<br\s*\/?>\s*:::\s*$/i);

      if (containerMatch) {
        const [, type, customTitle, content] = containerMatch;
        const typeLower = type.toLowerCase();

        if (!this.labelMap[typeLower]) return; // Unknown type

        const containerEl = this.createContainerElement(typeLower, customTitle?.trim());
        const contentEl = containerEl.querySelector('.vp-container-content') as HTMLElement;

        // Parse content (handle <br> as line breaks)
        const contentLines = content.split(/<br\s*\/?>/i);
        contentLines.forEach((line, index) => {
          const trimmedLine = line.trim();
          if (!trimmedLine) return;

          // Create paragraph for each line
          const lineP = document.createElement('p');
          lineP.innerHTML = trimmedLine;
          contentEl.appendChild(lineP);
        });

        // Replace the original paragraph
        p.replaceWith(containerEl);
      }
    });
  }

  /**
   * Create container DOM element
   */
  private createContainerElement(type: string, customTitle?: string): HTMLElement {
    const typeLower = type.toLowerCase();
    const icon = this.svgIcons[typeLower] || '';
    const defaultLabel = this.labelMap[typeLower] || typeLower;
    const title = customTitle || defaultLabel;

    const containerEl = document.createElement('div');
    containerEl.className = `vp-container vp-${typeLower}`;

    containerEl.innerHTML = `
      <div class="vp-container-header">
        <span class="vp-container-icon">${icon}</span>
        <span class="vp-container-title-text">${title}</span>
      </div>
      <div class="vp-container-content"></div>
    `;

    return containerEl;
  }

  /**
   * Create container HTML from parsed data (for external use)
   */
  createContainer(type: string, title: string, content: string): string {
    const typeLower = type.toLowerCase();
    const icon = this.svgIcons[typeLower] || '';
    const defaultLabel = this.labelMap[typeLower] || typeLower;
    const displayTitle = title || defaultLabel;

    return `
      <div class="vp-container vp-${typeLower}">
        <div class="vp-container-header">
          <span class="vp-container-icon">${icon}</span>
          <span class="vp-container-title-text">${displayTitle}</span>
        </div>
        <div class="vp-container-content">${content}</div>
      </div>
    `;
  }
}
