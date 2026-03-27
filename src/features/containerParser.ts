import { App, MarkdownPostProcessorContext } from 'obsidian'
import type VitePressThemePlugin from '../main'

/**
 * Parses VitePress-style custom containers
 *
 * 核心设计思路：
 * Obsidian 的 registerMarkdownPostProcessor 是逐块（per-section）调用的。
 * 每次调用时 el 只代表一个 block（段落 / 代码块 / 标题等）。
 *
 * code-group 跨多个 block，因此不能在看到 "开始" 时处理（后续块还未渲染）。
 * 正确策略：当 postProcessor 处理到「闭合 :::」元素时，
 *   此时 start 段落 + 中间代码块 + end 段落都已在 DOM 里，
 *   向前查找 ::: code-group 开始标记，然后完整组装。
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

  // GitHub-style label mapping
  private labelMap: Record<string, string> = {
    info: '提示',
    tip: '建议',
    warning: '警告',
    danger: '危险'
  }

  private globalDebounceTimer: number | null = null

  constructor(plugin: VitePressThemePlugin) {
    this.plugin = plugin
    this.app = plugin.app
    this.startScanner()
  }

  public startScanner() {
    this.plugin.registerInterval(
      window.setInterval(() => {
        this.scanAllSections()
      }, 800)
    )
  }

  public scanAllSections() {
    const sections = document.querySelectorAll('.markdown-preview-section')
    sections.forEach((section) => {
      this.processCodeGroupsInSection(section)
    })
  }

  /**
   * Post-processor entry — called once per rendered block
   */
  processContainer = (el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
    if (!this.plugin.settings.enableContainerParser) return

    // ① code-fence 格式 (:::\n inside ``` ``` ```)
    const codeBlocks = el.querySelectorAll('pre > code')
    codeBlocks.forEach((codeBlock) => {
      const pre = codeBlock.parentElement
      const text = codeBlock.textContent || ''
      if (/^:::\s*(tip|warning|danger|info|code-group)/i.test(text.trim())) {
        this.parseContainerBlock(pre as HTMLElement, ctx)
      }
    })

    // ② 单块段落容器 (info / tip / warning / danger)
    this.processParagraphContainers(el)

    // ③ code-group 跨块容器：延迟扫描整个页面
    // 强制使用全局去抖并扫描全页，解决切回阅读模式没渲染的问题
    if (this.globalDebounceTimer) {
      window.clearTimeout(this.globalDebounceTimer)
    }
    this.globalDebounceTimer = window.setTimeout(() => {
      this.globalDebounceTimer = null
      this.scanAllSections()
    }, 150)
  }

  // ─────────────────────────────────────────────
  // 跨块 code-group 防抖组装
  // ─────────────────────────────────────────────

  /**
   * 扫描整个 section 的直接子元素，寻找 ::: code-group 和 ::: 的配对
   */
  private processCodeGroupsInSection(section: Element): void {
    const children = Array.from(section.children)
    let startIndex = -1

    for (let i = 0; i < children.length; i++) {
      const child = children[i] as HTMLElement
      
      let isStart = false
      if (child.dataset.cgMarker === 'start') {
        isStart = true
      } else {
        const p = child.querySelector('p')
        if (p && /^(?::\s*)?:::\s*code-group/i.test(p.textContent?.trim() || '')) {
          isStart = true
        }
      }

      if (startIndex === -1) {
        if (isStart) {
          startIndex = i
        }
      } else {
        let isEnd = false
        if (child.dataset.cgMarker === 'end') {
          isEnd = true
        } else {
          const p = child.querySelector('p')
          if (p && p.textContent?.trim() === ':::') {
            isEnd = true
          }
        }

        if (isEnd) {
          const startEl = children[startIndex] as HTMLElement
          const endEl = child as HTMLElement
          const middleEls = children.slice(startIndex + 1, i) as HTMLElement[]

          let needsRebuild = false
          const existingGroup = startEl.querySelector('.vp-code-group')

          if (!existingGroup) {
            needsRebuild = true
          } else if (endEl.dataset.cgMarker !== 'end' || endEl.style.display !== 'none') {
            needsRebuild = true
          } else {
            for (const m of middleEls) {
              if (m.style.display !== 'none') {
                needsRebuild = true
                break
              }
            }
          }

          if (needsRebuild) {
            let activeIndex = 0
            if (existingGroup) {
              const activeTab = existingGroup.querySelector('.vp-code-group-tab.active') as HTMLElement
              if (activeTab && activeTab.dataset.index) {
                activeIndex = parseInt(activeTab.dataset.index)
              }
            }

            startEl.innerHTML = ''
            startEl.dataset.cgMarker = 'start'

            endEl.innerHTML = ''
            endEl.dataset.cgMarker = 'end'
            endEl.style.display = 'none'

            this.buildCodeGroup(startEl, middleEls, activeIndex)
          }

          startIndex = -1 // 重置，继续寻找下一个
        }
      }
    }
  }

  /**
   * 组装 code-group DOM (深度 Clone 模式，不碰 Obsidian 的缓存节点树)
   */
  private buildCodeGroup(startWrapper: HTMLElement, middleEls: HTMLElement[], activeIndex = 0): void {
    const codeGroupEl = document.createElement('div')
    codeGroupEl.className = 'vp-code-group'

    const tabsEl = document.createElement('div')
    tabsEl.className = 'vp-code-group-tabs'

    const contentsEl = document.createElement('div')
    contentsEl.className = 'vp-code-group-contents'

    let tabIndex = 0

    for (const wrapper of middleEls) {
      const codeEl = wrapper.querySelector('code') as HTMLElement | null
      if (!codeEl) {
        wrapper.style.display = 'none'
        continue
      }

      // 我们必须从最原始的 pre 出发进行 clone，不能去 clone 带有状态的 .vp-code-block
      const preEl = codeEl.closest('pre') as HTMLElement | null
      if (!preEl) {
        wrapper.style.display = 'none'
        continue
      }

      const filename = this.extractFilename(codeEl)

      // 1. 创建全新的 Clone 节点（摆脱 Obsidian 和原 codeEnhancer 绑定的事件状态）
      const rawPreClone = preEl.cloneNode(true) as HTMLElement
      
      // 2. 将隐藏的原始节点放置一旁
      wrapper.style.display = 'none'

      const tabEl = document.createElement('button')
      tabEl.className = `vp-code-group-tab${tabIndex === activeIndex ? ' active' : ''}`
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

      const contentEl = document.createElement('div')
      contentEl.className = `vp-code-group-content${tabIndex === activeIndex ? ' active' : ''}`
      contentEl.dataset.index = String(tabIndex)
      
      // 3. 将 Clone 的 Pre 节点插进我们的内容窗格
      contentEl.appendChild(rawPreClone)
      
      // 4. 对这个全新的 Pre 运行增强逻辑（恢复它的 Copy 按钮绑定和独立样式）
      this.plugin.codeEnhancer.enhanceSingleBlock(rawPreClone)

      contentsEl.appendChild(contentEl)

      tabIndex++
    }

    if (tabIndex === 0) return

    codeGroupEl.appendChild(tabsEl)
    codeGroupEl.appendChild(contentsEl)

    // 新的 VP 结构安全地挂载在负责定界的 Start 节点内部
    startWrapper.appendChild(codeGroupEl)
  }

  // ─────────────────────────────────────────────
  // 辅助方法
  // ─────────────────────────────────────────────

  /**
   * 获取 el 在 markdown-preview-section 中的直接子元素
   * Obsidian 将每个 block 包裹在单个子 div 内，需要层层向上找到顶层
   */
  private getSectionLevelEl(el: Element): Element | null {
    let current: Element = el
    while (current.parentElement) {
      const parent = current.parentElement
      // 到达 section 容器时停止
      if (
        parent.classList.contains('markdown-preview-section') ||
        parent.classList.contains('markdown-rendered') ||
        parent.classList.contains('markdown-preview-view')
      ) {
        return current
      }
      current = parent
    }
    return current
  }

  /**
   * 提取代码块文件名（显示在 tab 上）
   * Obsidian 将完整 info string 存入 data-lang，格式如 "ts [filename.ts]"
   */
  private extractFilename(codeEl: Element): string {
    const filename = codeEl.getAttribute('data-filename')
    if (filename) return filename

    const dataLang = codeEl.getAttribute('data-lang') || ''
    const m = dataLang.match(/\[(.+?)\]/)
    if (m) return m[1]
    // 回退：取语言名
    const langMatch = codeEl.className.match(/language-(\w+)/)
    return langMatch ? langMatch[1] : 'text'
  }

  // ─────────────────────────────────────────────
  // 单块容器处理（info / tip / warning / danger）
  // ─────────────────────────────────────────────

  private processParagraphContainers(el: HTMLElement): void {
    const paragraphs = el.querySelectorAll('p')
    paragraphs.forEach((p) => {
      const html = p.innerHTML.trim()
      if (!html || /^(?::\s*)?:::\s*code-group/i.test(html)) return

      const lines = html.split(/(?:<br[^>]*>|\n)/i)
      if (lines.length < 3) return

      // Stripping all HTML tags safely guarantees we see the text content even if Obsidian wrapped the formatting!
      const pureFirstLine = lines[0].replace(/<[^>]+>/g, '').trim()
      const pureLastLine = lines[lines.length - 1].replace(/<[^>]+>/g, '').trim()

      const typeMatch = pureFirstLine.match(/^\s*(?::\s*)?:::\s*([a-zA-Z]+)(.*)?$/i)
      if (!typeMatch) return

      const typeLower = typeMatch[1].toLowerCase()
      if (!this.labelMap[typeLower]) return
      
      // End boundary match, completely immune to suffix spaces or formatting spans
      if (!pureLastLine.endsWith(':::')) return

      const customTitle = typeMatch[2]
      const content = lines.slice(1, lines.length - 1).join('<br>')

      const containerEl = this.createContainerElement(typeLower, customTitle?.trim())
      const contentEl = containerEl.querySelector('.vp-container-content') as HTMLElement

      content.split(/<br\s*\/?>\s*/i).forEach((line) => {
        const trimmed = line.trim()
        if (!trimmed) return
        const lineP = document.createElement('p')
        lineP.innerHTML = trimmed
        contentEl.appendChild(lineP)
      })

      const wrapper = this.getSectionLevelEl(p) || p
      if (wrapper.parentElement) {
        wrapper.replaceWith(containerEl)
      } else {
        wrapper.innerHTML = ''
        wrapper.appendChild(containerEl)
      }
    })
  }

  // ─────────────────────────────────────────────
  // code-fence 格式的容器（::: 在 ``` 内）
  // ─────────────────────────────────────────────

  private parseContainerBlock(startEl: HTMLElement, ctx: MarkdownPostProcessorContext): void {
    const codeBlock = startEl.querySelector('code')
    if (!codeBlock) return

    const text = codeBlock.textContent || ''
    const match = text.match(/^:::\s*(\w+)(?:\s+(.+))?$/i)
    if (!match) return

    const [, type, customTitle] = match
    const typeLower = type.toLowerCase()

    if (typeLower === 'code-group') {
      // code-fence 格式的 code-group（不常见，保留处理）
      this.parseCodeGroupBlock(startEl, ctx)
      return
    }

    const containerEl = this.createContainerElement(typeLower, customTitle)
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

  private parseCodeGroupBlock(startEl: HTMLElement, ctx: MarkdownPostProcessorContext): void {
    const codeGroupEl = document.createElement('div')
    codeGroupEl.className = 'vp-code-group'

    const tabsEl = document.createElement('div')
    tabsEl.className = 'vp-code-group-tabs'

    const contentsEl = document.createElement('div')
    contentsEl.className = 'vp-code-group-contents'

    let currentEl: HTMLElement | null = startEl.parentElement?.nextElementSibling as HTMLElement
    let tabIndex = 0

    while (currentEl) {
      const code = currentEl.querySelector('pre > code')
      if (code && code.textContent?.trim() === ':::') {
        currentEl.remove()
        break
      }

      const preEl = currentEl.querySelector('pre')
      const codeEl = preEl?.querySelector('code')

      if (preEl && codeEl) {
        const filename = this.extractFilename(codeEl)
        const tabEl = document.createElement('button')
        tabEl.className = `vp-code-group-tab${tabIndex === 0 ? ' active' : ''}`
        tabEl.textContent = filename
        tabEl.dataset.index = String(tabIndex)
        tabEl.addEventListener('click', () => {
          const idx = parseInt(tabEl.dataset.index || '0')
          tabsEl.querySelectorAll('.vp-code-group-tab').forEach((t, i) => t.classList.toggle('active', i === idx))
          contentsEl.querySelectorAll('.vp-code-group-content').forEach((c, i) => c.classList.toggle('active', i === idx))
        })
        tabsEl.appendChild(tabEl)

        const contentEl = document.createElement('div')
        contentEl.className = `vp-code-group-content${tabIndex === 0 ? ' active' : ''}`
        contentEl.dataset.index = String(tabIndex)
        contentEl.appendChild(preEl.cloneNode(true))
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

  // ─────────────────────────────────────────────
  // DOM 工厂
  // ─────────────────────────────────────────────

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
