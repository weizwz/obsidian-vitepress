import { App, MarkdownPostProcessorContext } from 'obsidian';
import emojiData from '../data/emoji';

interface EmojiReplacement {
  element: HTMLElement;
  originalText: string;
}

/**
 * Emoji processor for VitePress-style emoji shortcodes
 * Converts :shortcode: to Unicode emoji characters
 * - Only works in preview mode (not source/edit mode)
 * - Shows source on hover in preview mode
 * - Never converts emoji in code blocks
 */
export class EmojiProcessor {
  private app: App;
  private emojiMap: Map<string, string>;
  private regex: RegExp;
  private replacements: WeakMap<HTMLElement, EmojiReplacement> = new WeakMap();

  constructor(app: App) {
    this.app = app;
    this.emojiMap = new Map(Object.entries(emojiData));
    this.regex = /:([a-zA-Z0-9_+\-]+):/g;
  }

  /**
   * Process emoji shortcodes in the element
   * Called by MarkdownPostProcessor for each block
   */
  processEmoji(el: HTMLElement, ctx: MarkdownPostProcessorContext): void {
    // Skip if in source/edit mode
    if (this.isSourceMode(el)) {
      return;
    }

    // Skip code blocks entirely
    if (this.isInsideCodeBlock(el)) {
      return;
    }

    this.walkAndReplace(el);
  }

  /**
   * Check if we're in source/edit mode
   */
  private isSourceMode(el: HTMLElement): boolean {
    // Check if element is inside a source view (cm-editor)
    let parent: HTMLElement | null = el;
    while (parent) {
      if (parent.classList?.contains('cm-editor') || 
          parent.classList?.contains('markdown-source-view') ||
          parent.getAttribute('contenteditable') === 'true') {
        return true;
      }
      parent = parent.parentElement;
    }
    return false;
  }

  /**
   * Check if element is inside a code block
   */
  private isInsideCodeBlock(el: HTMLElement): boolean {
    let parent: HTMLElement | null = el;
    while (parent) {
      const tagName = parent.tagName?.toLowerCase();
      if (tagName === 'pre' || tagName === 'code') {
        return true;
      }
      parent = parent.parentElement;
    }
    return false;
  }

  /**
   * Walk through all text nodes and replace emoji shortcodes
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

      // Create interactive emoji container
      const container = document.createElement('span');
      container.className = 'vp-emoji-container';
      
      for (const part of parts) {
        if (part.type === 'emoji') {
          // Create emoji element with hover behavior
          const emojiWrapper = document.createElement('span');
          emojiWrapper.className = 'vp-emoji-wrapper';
          
          const emojiSpan = document.createElement('span');
          emojiSpan.className = 'vp-emoji';
          emojiSpan.textContent = part.value;
          
          const sourceSpan = document.createElement('span');
          sourceSpan.className = 'vp-emoji-source';
          sourceSpan.textContent = `:${part.shortcode}:`;
          
          emojiWrapper.appendChild(emojiSpan);
          emojiWrapper.appendChild(sourceSpan);
          container.appendChild(emojiWrapper);
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
