import { MarkdownPostProcessorContext } from 'obsidian'
import type VitePressThemePlugin from '../main'

/**
 * Optimized Badge Processor
 * Uses "Source Recovery + Index Mapping" technique to restore <Badge /> tags 
 * that are stripped by Obsidian's default HTML sanitizer.
 * 
 * Performance: Avoids full-file splitting.
 * Security: Uses textContent for XSS protection.
 * Compliance: Follows Obsidian Official Plugin standards.
 */
export class BadgeProcessor {
  private plugin: VitePressThemePlugin

  constructor(plugin: VitePressThemePlugin) {
    this.plugin = plugin
  }

  /**
   * Core processing method called by the PostProcessor
   */
  processBadges = (el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
    if (!this.plugin.settings.enableContainerParser) return

    // Get source info to recover stripped tags
    const sectionInfo = ctx.getSectionInfo(el)
    if (!sectionInfo) return

    try {
      // Benchmark improvement: Get lines text without splitting the entire file string
      const sourceText = this.getSourceLines(sectionInfo.text, sectionInfo.lineStart, sectionInfo.lineEnd)
      
      if (!sourceText.includes('<Badge')) return

      const badgeRegex = /<Badge\s+([^>]+?)\s*\/>/gi
      let match: RegExpExecArray | null

      while ((match = badgeRegex.exec(sourceText)) !== null) {
        const attrs = match[1]
        const typeMatch = attrs.match(/type="([^"]+)"/)
        const textMatch = attrs.match(/text="([^"]+)"/)
        
        const type = typeMatch ? typeMatch[1].toLowerCase() : 'info'
        const badgeContent = textMatch ? textMatch[1] : ''

        if (!badgeContent) continue

        /**
         * Anchor-based matching:
         * We find the text string preceding the Badge in the original source,
         * clean it of Markdown symbols (which might be rendered as HTML in DOM),
         * and look for it in the rendered elements to find the exact injection point.
         */
        const rawAnchor = sourceText.substring(Math.max(0, match.index - 15), match.index)
        const cleanAnchor = rawAnchor.replace(/[#*`[\]()_]/g, '').trim()

        this.injectBadgeAfterAnchor(el, cleanAnchor, type, badgeContent)
      }
    } catch (e) {
      if (this.plugin.settings.debugMode) {
        console.error('[BadgeProcessor] Recovery failed:', e)
      }
    }
  }

  /**
   * Performance optimization: Extract specific line range from string via index slicing
   */
  private getSourceLines(text: string, start: number, end: number): string {
    let currentLine = 0
    let startIdx = 0
    
    // Fast forward to lineStart
    while (currentLine < start && startIdx !== -1) {
      startIdx = text.indexOf('\n', startIdx) + 1
      currentLine++
    }
    
    // Find absolute end of lineEnd
    let endIdx = startIdx
    while (currentLine <= end && endIdx !== -1) {
      const nextN = text.indexOf('\n', endIdx)
      if (nextN === -1) {
        endIdx = text.length
        break
      }
      endIdx = nextN + 1
      currentLine++
    }
    
    return text.substring(startIdx, endIdx)
  }

  /**
   * Locates the anchor text in the actual DOM and inserts the Badge span
   */
  private injectBadgeAfterAnchor(container: HTMLElement, anchor: string, type: string, text: string) {
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null)
    let node: Text | null

    while ((node = walker.nextNode() as Text)) {
      const content = node.textContent || ''
      
      // Edge case: Badge is at the very beginning of the block
      if (!anchor && content.trim() && !node.previousSibling) {
        const badge = this.createBadgeElement(type, text)
        node.parentElement?.insertBefore(badge, node)
        break
      }

      if (anchor && content.includes(anchor)) {
        // Idempotency check: prevent duplicate badges if the processor runs multiple times
        let sibling = node.nextSibling as HTMLElement
        let alreadyExists = false
        while (sibling) {
          if (sibling.classList && sibling.classList.contains('vp-badge')) {
            if (sibling.textContent === text) {
              alreadyExists = true
              break
            }
          }
          if (sibling.nodeType === Node.TEXT_NODE && sibling.textContent?.trim()) break
          sibling = sibling.nextSibling as HTMLElement
        }
        
        if (alreadyExists) continue

        // Split text node and insert the Badge span
        const badge = this.createBadgeElement(type, text)
        const pos = content.indexOf(anchor) + anchor.length
        
        if (pos === content.length) {
          node.after(badge)
        } else {
          node.splitText(pos)
          node.after(badge)
        }
        break
      }
    }
  }

  /**
   * Helper to create a secure Badge element
   */
  private createBadgeElement(type: string, text: string): HTMLSpanElement {
    const span = document.createElement('span')
    span.className = `vp-badge vp-badge-${type}`
    // Security: always use textContent to prevent XSS
    span.textContent = text
    return span
  }
}
