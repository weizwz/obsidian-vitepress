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
    if (!this.plugin.settings.enableBadgeProcessor) return

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
         * To securely insert the badge into Obsidian's DOM, we extract text content preceding the badge.
         */
        const matchIndex = match.index

        // Left anchor (preferred)
        const leftRaw = sourceText.substring(Math.max(0, matchIndex - 15), matchIndex)
        const leftAnchor = leftRaw.replace(/[#*`[\]()_]/g, '').trim()

        // Right anchor (fallback, useful if left anchor is stripped out completely like a link URL)
        const badgeLen = match[0].length
        const rightRaw = sourceText.substring(matchIndex + badgeLen, Math.min(sourceText.length, matchIndex + badgeLen + 15))
        const rightAnchor = rightRaw.replace(/[#*`[\]()_]/g, '').trim()

        this.injectBadgeAfterAnchor(el, leftAnchor, rightAnchor, type, badgeContent)
      }
    } catch (e) {
      if (this.plugin.settings.debugMode) {
        console.error('[VitePress Theme] BadgeProcessor - Recovery failed:', e)
      }
    }
  }

  /**
   * Performance optimization: Extract specific line range from string via index slicing
   */
  private getSourceLines(text: string, start: number, end: number): string {
    let currentLine = 0
    let startIdx = 0

    while (currentLine < start && startIdx !== -1) {
      startIdx = text.indexOf('\n', startIdx) + 1
      currentLine++
    }

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
   * Helper to find insertion position in full DOM text
   */
  private findInsertionPos(fullText: string, anchor: string, direction: 'left' | 'right'): number[] {
    if (!anchor) return []
    const chars = Array.from(anchor.replace(/\s+/g, ''))
    if (chars.length === 0) return []

    const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regexStr = chars.map(escapeRegex).join('\\s*')
    // We allow matching spaces around the characters
    const regex = new RegExp(regexStr, 'g')

    const positions: number[] = []
    let match: RegExpExecArray | null
    while ((match = regex.exec(fullText)) !== null) {
      if (direction === 'left') {
        // Insert AFTER the left anchor
        positions.push(match.index + match[0].length)
      } else {
        // Insert BEFORE the right anchor
        positions.push(match.index)
      }
    }
    return positions
  }

  /**
   * Locates the anchor text in the actual DOM string and inserts the Badge span
   */
  private injectBadgeAfterAnchor(container: HTMLElement, leftAnchor: string, rightAnchor: string, type: string, text: string) {
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null)
    let node: Text | null
    const textNodes: Text[] = []

    while ((node = walker.nextNode() as Text)) {
      textNodes.push(node)
    }

    // Edge case: empty DOM or just beginning of block without anchors
    if (!leftAnchor && !rightAnchor && textNodes.length > 0) {
      const firstNode = textNodes[0]
      if (firstNode.textContent?.trim() && !firstNode.previousSibling) {
        const badge = this.createBadgeElement(type, text)
        firstNode.parentElement?.insertBefore(badge, firstNode)
        return
      }
    }

    let fullDomText = ''
    const nodeMapping: { node: Text; start: number; end: number }[] = []

    for (const textNode of textNodes) {
      const content = textNode.textContent || ''
      nodeMapping.push({
        node: textNode,
        start: fullDomText.length,
        end: fullDomText.length + content.length
      })
      fullDomText += content
    }

    let candidatePositions = this.findInsertionPos(fullDomText, leftAnchor, 'left')
    if (candidatePositions.length === 0) {
      candidatePositions = this.findInsertionPos(fullDomText, rightAnchor, 'right')
    }

    for (const targetPos of candidatePositions) {
      // Find the text node containing this absolute position
      const mapping = nodeMapping.find((m) => targetPos >= m.start && targetPos <= m.end)
      if (!mapping) continue

      const targetNode = mapping.node

      // Idempotency check: see if a badge with this text already exists at this boundary
      let sibling = targetNode.nextSibling as HTMLElement
      let alreadyExists = false
      while (sibling) {
        if (sibling.classList && sibling.classList.contains('vp-badge')) {
          if (sibling.textContent === text) {
            alreadyExists = true
            break
          }
        }
        // Stop checking if we hit regular textual content that is not empty
        if (sibling.nodeType === Node.TEXT_NODE && sibling.textContent?.replace(/\u200B/g, '').trim()) break
        sibling = sibling.nextSibling as HTMLElement
      }

      if (alreadyExists) continue

      // Found valid insertion point
      const relativePos = targetPos - mapping.start
      const badge = this.createBadgeElement(type, text)

      if (relativePos === targetNode.length) {
        targetNode.after(badge)
      } else if (relativePos === 0) {
        targetNode.before(badge)
      } else {
        targetNode.splitText(relativePos)
        targetNode.after(badge)
      }

      return
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
