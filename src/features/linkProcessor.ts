import { App, TFile, MarkdownPostProcessorContext } from 'obsidian';
import type VitePressThemePlugin from '../main';

/**
 * Processes links with VitePress-style features
 * - External link icons
 * - Internal link resolution
 * - Line highlighting references
 */
export class LinkProcessor {
  private plugin: VitePressThemePlugin;
  private app: App;

  constructor(plugin: VitePressThemePlugin) {
    this.plugin = plugin;
    this.app = plugin.app;
  }

  /**
   * Post-processor for links
   */
  processLinks = (el: HTMLElement, ctx: MarkdownPostProcessorContext): void => {
    if (!this.plugin.settings.enableLinkProcessing) return;

    const links = el.querySelectorAll('a');
    links.forEach(link => this.enhanceLink(link, ctx));
  };

  /**
   * Enhance a single link
   */
  private enhanceLink(link: HTMLAnchorElement, ctx: MarkdownPostProcessorContext): void {
    const href = link.getAttribute('href');
    if (!href) return;

    // External links
    if (this.isExternalLink(href)) {
      this.processExternalLink(link);
    } else {
      this.processInternalLink(link, ctx);
    }
  }

  /**
   * Check if link is external
   */
  private isExternalLink(href: string): boolean {
    return /^https?:\/\//.test(href) || href.startsWith('//');
  }

  /**
   * Process external links
   */
  private processExternalLink(link: HTMLAnchorElement): void {
    // Add external link indicator
    link.classList.add('vp-external-link');

    // Set target and rel
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
  }

  /**
   * Process internal links with special handling
   */
  private processInternalLink(link: HTMLAnchorElement, ctx: MarkdownPostProcessorContext): void {
    // Check for line highlighting syntax: file.md#L10-L15
    const match = link.getAttribute('href')?.match(/^(.*)#L(\d+)(?:-L(\d+))?$/);
    if (match) {
      const [, filePath, startLine, endLine] = match;
      link.dataset.lineHighlight = `${startLine}${endLine ? `-${endLine}` : ''}`;
      link.classList.add('vp-line-link');

      // Add click handler for line highlighting
      link.addEventListener('click', (e) => {
        e.preventDefault();
        void this.openWithLineHighlight(filePath, parseInt(startLine), endLine ? parseInt(endLine) : undefined);
      });
    }

    // Handle relative paths
    if (ctx?.sourcePath && !link.getAttribute('href')?.startsWith('#')) {
      const href = link.getAttribute('href');
      if (href && !href.startsWith('/') && !href.startsWith('.')) {
        // Assume it's a relative path from current file
        const currentDir = ctx.sourcePath.split('/').slice(0, -1).join('/');
        const resolvedPath = currentDir ? `${currentDir}/${href}` : href;

        // Update link if file exists
        const file = this.app.vault.getAbstractFileByPath(resolvedPath);
        if (file instanceof TFile) {
          link.setAttribute('href', resolvedPath);
        }
      }
    }
  }

  /**
   * Open file with line highlighting
   */
  private async openWithLineHighlight(filePath: string, startLine: number, endLine?: number): Promise<void> {
    const file = this.app.vault.getAbstractFileByPath(filePath);
    if (!(file instanceof TFile)) return;

    // Open file
    await this.app.workspace.openLinkText(filePath, '', false);

    // Apply line highlighting (would need CodeMirror integration)
    // This is a placeholder for the implementation
    this.plugin.log(`LinkProcessor - Highlighting lines ${startLine} to ${endLine || startLine} in ${filePath}`);
  }

  /**
   * Convert VitePress relative links to Obsidian format
   */
  convertRelativeLink(vitepressLink: string, currentFilePath: string): string {
    // Remove .md extension for Obsidian
    let obsidianLink = vitepressLink.replace(/\.md$/i, '');

    // Handle relative paths
    if (obsidianLink.startsWith('./')) {
      const currentDir = currentFilePath.split('/').slice(0, -1).join('/');
      obsidianLink = obsidianLink.replace('./', currentDir ? currentDir + '/' : '');
    } else if (obsidianLink.startsWith('../')) {
      // Handle parent directory references
      const parts = currentFilePath.split('/');
      let parentLevels = 0;
      let linkParts = obsidianLink;

      while (linkParts.startsWith('../')) {
        parentLevels++;
        linkParts = linkParts.slice(3);
      }

      const currentDir = parts.slice(0, -1 - parentLevels).join('/');
      obsidianLink = currentDir ? `${currentDir}/${linkParts}` : linkParts;
    }

    return obsidianLink;
  }
}