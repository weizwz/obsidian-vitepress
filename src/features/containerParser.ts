import { App, MarkdownPostProcessorContext, Component } from 'obsidian'
import type VitePressThemePlugin from '../main'

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
  private plugin: VitePressThemePlugin
  private app: App

  // SVG icons (inline)
  private svgIcons: Record<string, string> = {
    info: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon lucide-pencil"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"></path><path d="m15 5 4 4"></path></svg>',
    tip: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon lucide-flame"><path d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4"></path></svg>',
    warning:
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon lucide-alert-triangle"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>',
    danger:
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon lucide-alert-triangle"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>'
  }

  // GitHub-style label mapping (Chinese)
  private labelMap: Record<string, string> = {
    info: '提示',
    tip: '建议',
    warning: '警告',
    danger: '危险'
  }

  constructor(plugin: VitePressThemePlugin) {
    this.plugin = plugin
    this.app = plugin.app
  }

  /**
   * Post-processor for custom containers
   */
  processContainer = (el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
    if (!this.plugin.settings.enableContainerParser) return

    // Process code block format
    const codeBlocks = el.querySelectorAll('pre > code')
    codeBlocks.forEach((codeBlock) => {
      const pre = codeBlock.parentElement
      const text = codeBlock.textContent || ''

      if (this.isContainerStart(text)) {
        this.parseContainerBlock(pre as HTMLElement, ctx)
      }
    })

    // Process paragraph format (::: in text with <br>)
    this.processParagraphContainers(el)
  }

  /**
   * Check if text is a container start
   * VitePress syntax: ::: info|tip|warning|danger|code-group
   */
  private isContainerStart(text: string): boolean {
    return /^:::\s*(tip|warning|danger|info|code-group)/i.test(text.trim())
  }

  /**
   * Parse a container block from code element
   */
  private parseContainerBlock(startEl: HTMLElement, ctx: MarkdownPostProcessorContext): void {
    const codeBlock = startEl.querySelector('code')
    if (!codeBlock) return

    const text = codeBlock.textContent || ''
    const match = text.match(/^:::\s*(\w+)(?:\s+(.+))?$/i)
    if (!match) return

    const [, type, customTitle] = match
    const typeLower = type.toLowerCase()

    // Handle code-group specially
    if (typeLower === 'code-group') {
      this.parseCodeGroupBlock(startEl, ctx)
      return
    }

    // Create GitHub-style container
    const containerEl = this.createContainerElement(typeLower, customTitle)

    // Find closing :::
    let currentEl: HTMLElement | null = startEl.parentElement?.nextElementSibling as HTMLElement
    const contentEl = containerEl.querySelector('.vp-container-content') as HTMLElement

    while (currentEl) {
      const code = currentEl.querySelector('pre > code')
      if (code && code.textContent?.trim() === ':::') {
        currentEl.remove()
        break
      }

      contentEl.appendChild(currentEl.cloneNode(true))
      const toRemove = currentEl
      currentEl = currentEl.nextElementSibling as HTMLElement
      toRemove.remove()
    }

    startEl.parentElement?.replaceWith(containerEl)
  }

  /**
   * Process containers in paragraph format (with <br> line breaks)
   * Obsidian 将每个段落包裹在 div.el-p 中，需要考虑这个层级结构
   */
  private processParagraphContainers(el: HTMLElement): void {
    const paragraphs = el.querySelectorAll('p')

    paragraphs.forEach((p) => {
      const html = p.innerHTML

      // First check for code-group (content is in separate elements, not in the same paragraph)
      const codeGroupMatch = html.match(/^(?::\s*)?:::\s*code-group/i)
      if (codeGroupMatch) {
        this.parseCodeGroupFromParagraph(p as HTMLParagraphElement)
        return
      }

      // Check if this paragraph contains ::: container syntax
      // Pattern: starts with ::: type [title] and ends with :::
      const containerMatch = html.match(/^(?::\s*)?:::\s*(\w+)(?:\s+([^<\n]+))?\s*(?:<br\s*\/?>\s*|\n)?([\s\S]*?)<br\s*\/?>\s*:::\s*$/i)

      if (containerMatch) {
        const [, type, customTitle, content] = containerMatch
        const typeLower = type.toLowerCase()

        if (!this.labelMap[typeLower]) return // Unknown type

        const containerEl = this.createContainerElement(typeLower, customTitle?.trim())
        const contentEl = containerEl.querySelector('.vp-container-content') as HTMLElement

        // Parse content (handle <br> as line breaks)
        const contentLines = content.split(/<br\s*\/?>\s*/i)
        contentLines.forEach((line) => {
          const trimmedLine = line.trim()
          if (!trimmedLine) return
          const lineP = document.createElement('p')
          lineP.innerHTML = trimmedLine
          contentEl.appendChild(lineP)
        })

        // Replace the paragraph or its Obsidian wrapper
        const wrapper = this.getObsidianWrapper(p)
        wrapper.replaceWith(containerEl)
      }
    })
  }

  /**
   * 获取 Obsidian 包裹容器（div.el-p / div.el-pre 等）
   * 如果 p 的直接父元素是 Obsidian 的包裹 div，返回它；否则返回 p 自身
   */
  private getObsidianWrapper(el: Element): Element {
    const parent = el.parentElement
    if (!parent) return el
    // Obsidian 包裹 div 的 class 通常为 el-p, el-pre, el-h1 等
    if (parent.tagName === 'DIV' && /\bel-/.test(parent.className)) {
      return parent
    }
    return el
  }

  /**
   * 提取代码块的文件名（显示在 tab 上）
   * 支持格式：```ts [filename]``` ，也支持只有语言的情况
   */
  private extractFilename(codeEl: Element): string {
    // Obsidian 会将完整 info string 放到 data-lang 属性，格式如: "ts [filename]"
    const dataLang = codeEl.getAttribute('data-lang') || ''
    const filenameFromDataLang = dataLang.match(/\[(.+?)\]/)
    if (filenameFromDataLang) return filenameFromDataLang[1]

    // 备用：从 class 获取语言名
    const className = codeEl.className || ''
    const langMatch = className.match(/language-(\w+)/)
    return langMatch ? langMatch[1] : 'text'
  }

  /**
   * Parse code-group from paragraph format (::: code-group in <p>)
   * 注意：Obsidian 中每个段落/代码块被包裹在 div.el-p / div.el-pre 容器里
   * 需要从包裹容器层级进行兄弟遍历才能找到后续代码块
   */
  private parseCodeGroupFromParagraph(startP: HTMLParagraphElement): void {
    // 获取 Obsidian 包裹容器（div.el-p）作为居然起点进行兄弟遍历
    const startWrapper = this.getObsidianWrapper(startP)
    const parentEl = startWrapper.parentElement
    if (!parentEl) return

    const codeGroupEl = document.createElement('div')
    codeGroupEl.className = 'vp-code-group'

    const tabsEl = document.createElement('div')
    tabsEl.className = 'vp-code-group-tabs'

    const contentsEl = document.createElement('div')
    contentsEl.className = 'vp-code-group-contents'

    // 从包裹容器的下一个兄弟开始遍历（而不是 p 的下一个兄弟）
    let currentEl: Element | null = startWrapper.nextElementSibling
    let tabIndex = 0
    const activeTab = 0

    while (currentEl) {
      // Check for closing ::: (supports both paragraph and code block format)
      const text = currentEl.textContent?.trim() || ''
      const innerCode = currentEl.querySelector('pre > code')
      // 支持段落格式 ":::" 和 code 块格式 ":::" 两种闭合方式
      if (text === ':::' || (innerCode && innerCode.textContent?.trim() === ':::')) {
        currentEl.remove()
        break
      }

      // Check if this is a code block (may be wrapped in div.el-pre by Obsidian)
      const preEl = currentEl.querySelector('pre') as HTMLPreElement | null
      const codeEl = preEl?.querySelector('code')

      if (preEl && codeEl) {
        const filename = this.extractFilename(codeEl)

        // Create tab
        const tabEl = document.createElement('button')
        tabEl.className = `vp-code-group-tab${tabIndex === activeTab ? ' active' : ''}`
        tabEl.textContent = filename
        tabEl.dataset.index = String(tabIndex)
        tabEl.addEventListener('click', () => {
          const idx = parseInt(tabEl.dataset.index || '0')
          tabsEl.querySelectorAll('.vp-code-group-tab').forEach((t, i) => {
            t.classList.toggle('active', i === idx)
          })
          contentsEl.querySelectorAll('.vp-code-group-content').forEach((c, i) => {
            c.classList.toggle('active', i === idx)
          })
        })
        tabsEl.appendChild(tabEl)

        // Create content wrapper, move pre directly (no clone)
        const contentEl = document.createElement('div')
        contentEl.className = `vp-code-group-content${tabIndex === activeTab ? ' active' : ''}`
        contentEl.dataset.index = String(tabIndex)
        contentEl.appendChild(preEl)
        contentsEl.appendChild(contentEl)

        tabIndex++

        const toRemove = currentEl
        currentEl = currentEl.nextElementSibling
        toRemove.remove()
      } else {
        currentEl = currentEl.nextElementSibling
      }
    }

    // Only add if we found at least one code block
    if (tabIndex > 0) {
      codeGroupEl.appendChild(tabsEl)
      codeGroupEl.appendChild(contentsEl)
      // 替换 Obsidian 包裹容器（而不是只替换 p 元素）
      startWrapper.replaceWith(codeGroupEl)
    }
  }

  /**
   * Parse code-group container with tabbed code blocks
   */
  private parseCodeGroupBlock(startEl: HTMLElement, ctx: MarkdownPostProcessorContext): void {
    const codeGroupEl = document.createElement('div')
    codeGroupEl.className = 'vp-code-group'

    const tabsEl = document.createElement('div')
    tabsEl.className = 'vp-code-group-tabs'

    const contentsEl = document.createElement('div')
    contentsEl.className = 'vp-code-group-contents'

    let currentEl: HTMLElement | null = startEl.parentElement?.nextElementSibling as HTMLElement
    let tabIndex = 0
    const activeTab = 0

    while (currentEl) {
      // Check for closing :::
      const code = currentEl.querySelector('pre > code')
      if (code && code.textContent?.trim() === ':::') {
        currentEl.remove()
        break
      }

      // Check if this is a code block
      const preEl = currentEl.querySelector('pre')
      const codeEl = preEl?.querySelector('code')

      if (preEl && codeEl) {
        const filename = this.extractFilename(codeEl)

        // Create tab
        const tabEl = document.createElement('button')
        tabEl.className = `vp-code-group-tab${tabIndex === activeTab ? ' active' : ''}`
        tabEl.textContent = filename
        tabEl.dataset.index = String(tabIndex)
        tabEl.addEventListener('click', () => {
          const idx = parseInt(tabEl.dataset.index || '0')
          tabsEl.querySelectorAll('.vp-code-group-tab').forEach((t, i) => {
            t.classList.toggle('active', i === idx)
          })
          contentsEl.querySelectorAll('.vp-code-group-content').forEach((c, i) => {
            c.classList.toggle('active', i === idx)
          })
        })
        tabsEl.appendChild(tabEl)

        // Create content wrapper
        const contentEl = document.createElement('div')
        contentEl.className = `vp-code-group-content${tabIndex === activeTab ? ' active' : ''}`
        contentEl.dataset.index = String(tabIndex)

        // Move the pre element into content
        const clonedPre = preEl.cloneNode(true) as HTMLElement
        contentEl.appendChild(clonedPre)
        contentsEl.appendChild(contentEl)

        tabIndex++
      }

      const toRemove = currentEl
      currentEl = currentEl.nextElementSibling as HTMLElement
      toRemove.remove()
    }

    codeGroupEl.appendChild(tabsEl)
    codeGroupEl.appendChild(contentsEl)

    startEl.parentElement?.replaceWith(codeGroupEl)
  }

  /**
   * Create container DOM element
   */
  private createContainerElement(type: string, customTitle?: string): HTMLElement {
    const typeLower = type.toLowerCase()
    const icon = this.svgIcons[typeLower] || ''
    const defaultLabel = this.labelMap[typeLower] || typeLower
    const title = customTitle || defaultLabel

    const containerEl = document.createElement('div')
    containerEl.className = `vp-container vp-${typeLower}`

    containerEl.innerHTML = `
      <div class="vp-container-header">
        <span class="vp-container-icon">${icon}</span>
        <span class="vp-container-title-text">${title}</span>
      </div>
      <div class="vp-container-content"></div>
    `

    return containerEl
  }

  /**
   * Create container HTML from parsed data (for external use)
   */
  createContainer(type: string, title: string, content: string): string {
    const typeLower = type.toLowerCase()
    const icon = this.svgIcons[typeLower] || ''
    const defaultLabel = this.labelMap[typeLower] || typeLower
    const displayTitle = title || defaultLabel

    return `
      <div class="vp-container vp-${typeLower}">
        <div class="vp-container-header">
          <span class="vp-container-icon">${icon}</span>
          <span class="vp-container-title-text">${displayTitle}</span>
        </div>
        <div class="vp-container-content">${content}</div>
      </div>
    `
  }
}
