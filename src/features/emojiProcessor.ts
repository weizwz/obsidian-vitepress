import { App, MarkdownPostProcessorContext } from 'obsidian';
import emojiData from '../data/emoji';
import type VitePressThemePlugin from '../main';

/**
 * Emoji processor for VitePress-style emoji shortcodes
 * 
 * Strategy:
 * 1. Use Markdown Post-Processor for Reading Mode (full preview)
 * 2. Use CSS to show emoji in preview, show source in editor
 * 
 * This ensures:
 * - Reading Mode: displays emoji icons
 * - Live Preview: displays :shortcode: source
 * - Source Mode: displays :shortcode: source
 * - NEVER modifies the original markdown file
 */
export class EmojiProcessor {
  private app: App;
  private plugin: VitePressThemePlugin;
  private emojiMap: Map<string, string>;
  private regex: RegExp;

  constructor(app: App, plugin: VitePressThemePlugin) {
    this.app = app;
    this.plugin = plugin;
    this.emojiMap = new Map(Object.entries(emojiData));
    this.regex = /:([a-zA-Z0-9_+-]+):/g;
  }

  /**
   * Process emoji shortcodes in the element
   * This runs in BOTH reading mode and live preview, but CSS controls visibility
   */
  processEmoji(el: HTMLElement, _ctx: MarkdownPostProcessorContext): void {
    if (!this.plugin.settings.enableEmojiProcessor) {
      return;
    }

    // Skip code blocks entirely
    if (this.isInsideCodeBlock(el)) {
      return;
    }

    this.walkAndReplace(el);
  }

  /**
   * Check if element is inside a code block
   */
  private isInsideCodeBlock(el: HTMLElement): boolean {
    let parent: HTMLElement | null = el;
    while (parent) {
      const tagName = parent.tagName?.toLowerCase();
      if (tagName === 'pre' || tagName === 'code' || parent.classList?.contains('HyperMD-codeblock')) {
        return true;
      }
      parent = parent.parentElement;
    }
    return false;
  }

  /**
   * Walk through all text nodes and replace emoji shortcodes
   * Creates dual display structure: emoji + source (CSS controls which is shown)
   */
  private walkAndReplace(node: Node): void {
    if (node.nodeType === Node.TEXT_NODE) {
      const textNode = node as Text;
      const text = textNode.textContent || '';

      if (!text.includes(':')) {
        return;
      }

      const parts = this.parseEmojis(text);
      
      if (parts.length === 1 && parts[0].type === 'text') {
        return;
      }

      // Create container with dual display
      const container = document.createElement('span');
      container.className = 'vp-emoji-container';
      
      for (const part of parts) {
        if (part.type === 'emoji') {
          // Create wrapper with both emoji and source
          const wrapper = document.createElement('span');
          wrapper.className = 'vp-emoji-wrapper';
          
          const emojiSpan = document.createElement('span');
          emojiSpan.className = 'vp-emoji-display';
          emojiSpan.textContent = part.value;
          
          const sourceSpan = document.createElement('span');
          sourceSpan.className = 'vp-emoji-source';
          sourceSpan.textContent = `:${part.shortcode}:`;
          
          wrapper.appendChild(emojiSpan);
          wrapper.appendChild(sourceSpan);
          container.appendChild(wrapper);
        } else {
          container.appendChild(document.createTextNode(part.value));
        }
      }

      if (node.parentNode) {
        node.parentNode.replaceChild(container, node);
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;
      
      // Skip code elements
      const tagName = element.tagName.toLowerCase();
      if (tagName === 'code' || tagName === 'pre' || tagName === 'kbd') {
        return;
      }

      // Process children
      const children = Array.from(node.childNodes);
      for (const child of children) {
        this.walkAndReplace(child);
      }
    }
  }

  /**
   * Parse text and split into emoji/text parts
   */
  private parseEmojis(text: string): Array<{ type: 'text' | 'emoji'; value: string; shortcode?: string }> {
    const parts: Array<{ type: 'text' | 'emoji'; value: string; shortcode?: string }> = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    this.regex.lastIndex = 0;

    while ((match = this.regex.exec(text)) !== null) {
      const shortcode = match[1];
      const emoji = this.emojiMap.get(shortcode);

      if (emoji) {
        if (match.index > lastIndex) {
          parts.push({
            type: 'text',
            value: text.slice(lastIndex, match.index)
          });
        }

        parts.push({
          type: 'emoji',
          value: emoji,
          shortcode: shortcode
        });

        lastIndex = match.index + match[0].length;
      }
    }

    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        value: text.slice(lastIndex)
      });
    }

    return parts.length > 0 ? parts : [{ type: 'text', value: text }];
  }

  /**
   * Check if a shortcode exists
   */
  hasEmoji(shortcode: string): boolean {
    return this.emojiMap.has(shortcode);
  }

  /**
   * Get emoji by shortcode
   */
  getEmoji(shortcode: string): string | undefined {
    return this.emojiMap.get(shortcode);
  }
}
