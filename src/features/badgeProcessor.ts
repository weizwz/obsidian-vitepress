import { App, MarkdownPostProcessorContext } from 'obsidian';

/**
 * Badge processor for VitePress-style badges
 * Two-step processing:
 * 1. Convert <Badge type="..." text="..." /> to <span data-badge-type="..." data-badge-text="..."></span>
 * 2. Render span as styled badge in preview mode only
 */
export class BadgeProcessor {
  private app: App;

  constructor(app: App) {
    this.app = app;
  }

  /**
   * Process badge tags in the element
   */
  processBadges(el: HTMLElement, ctx: MarkdownPostProcessorContext): void {
    // Step 1: Convert <Badge> tags to <span> with data attributes (preserves text)
    this.convertBadgeToSpan(el);
    
    // Step 2: Only in preview mode (not source/live-preview), render spans as badges
    if (!this.isInPreviewMode()) {
      return;
    }
    
    // Find all badge spans and convert them to styled badges
    this.renderBadgeSpans(el);
  }

  /**
   * Check if we're in preview mode (not source or live-preview)
   */
  private isInPreviewMode(): boolean {
    const activeView = document.querySelector('.workspace-leaf.mod-active');
    if (!activeView) return false;

    // If cm-editor exists, we're in source/live-preview mode
    const cmEditor = activeView.querySelector('.cm-editor');
    if (cmEditor) {
      return false; // Source or Live Preview mode - don't render badges
    }

    // Check for markdown-source-view class
    const sourceView = activeView.querySelector('.markdown-source-view');
    if (sourceView) {
      return false; // Source mode - don't render badges
    }

    return true; // Preview mode
  }

  /**
   * Step 1: Convert <Badge> tags to <span> with data attributes
   * This runs in all modes to preserve the badge text
   */
  private convertBadgeToSpan(el: HTMLElement): void {
    const walker = document.createTreeWalker(
      el,
      NodeFilter.SHOW_TEXT,
      null
    );

    const textNodes: Text[] = [];
    let node: Node | null;
    
    while ((node = walker.nextNode())) {
      if (node.textContent?.includes('<Badge')) {
        textNodes.push(node as Text);
      }
    }

    // Process collected text nodes
    textNodes.forEach((textNode) => {
      const text = textNode.textContent || '';
      const parts = this.parseBadgeSyntax(text);
      
      if (parts.length > 1) {
        const fragment = document.createDocumentFragment();
        parts.forEach((part) => {
          if (part.type === 'badge') {
            // Create span with data attributes instead of Badge tag
            const span = document.createElement('span');
            span.setAttribute('data-badge-type', part.badgeType);
            span.setAttribute('data-badge-text', part.text);
            fragment.appendChild(span);
          } else {
            fragment.appendChild(document.createTextNode(part.value));
          }
        });
        
        if (textNode.parentNode) {
          textNode.parentNode.replaceChild(fragment, textNode);
        }
      }
    });
  }

  /**
   * Step 2: Render badge spans as styled badges (preview mode only)
   */
  private renderBadgeSpans(el: HTMLElement): void {
    const badgeSpans = el.querySelectorAll('span[data-badge-type]');
    
    badgeSpans.forEach((span) => {
      const element = span as HTMLElement;
      const badgeType = element.getAttribute('data-badge-type') || 'info';
      const badgeText = element.getAttribute('data-badge-text') || '';
      
      if (badgeText) {
        // Replace span with styled badge
        const badge = this.createBadgeElement(badgeType, badgeText);
        element.replaceWith(badge);
      }
    });
  }

  /**
   * Parse <Badge type="..." text="..." /> syntax from text
   */
  private parseBadgeSyntax(text: string): Array<
    | { type: 'text'; value: string }
    | { type: 'badge'; text: string; badgeType: string }
  > {
    const parts: Array<
      | { type: 'text'; value: string }
      | { type: 'badge'; text: string; badgeType: string }
    > = [];
    
    const badgeRegex = /<Badge\s+type="([^"]+)"\s+text="([^"]+)"\s*\/?>/gi;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = badgeRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', value: text.slice(lastIndex, match.index) });
      }
      parts.push({ type: 'badge', badgeType: match[1].toLowerCase(), text: match[2] });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push({ type: 'text', value: text.slice(lastIndex) });
    }

    return parts.length > 0 ? parts : [{ type: 'text', value: text }];
  }

  /**
   * Create badge element
   */
  private createBadgeElement(badgeType: string, text: string): HTMLElement {
    const badge = document.createElement('span');
    badge.className = `vp-badge vp-badge-${badgeType.toLowerCase()}`;
    badge.textContent = text;
    return badge;
  }
}
