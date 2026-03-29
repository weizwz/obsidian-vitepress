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
 * 正确策略：当末尾 ::: 被扫描到时，此时 start + middle + end 都已在 DOM 里，
 * 向前查找 ::: code-group 开始标记，然后完整组装。
 */
export class ContainerParser {
  private plugin: VitePressThemePlugin
  private app: App

  // SVG icons (inline, 由用户原设定保留)
  private svgIcons: Record<string, string> = {
    info: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon lucide-pencil"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"></path><path d="m15 5 4 4"></path></svg>',
    tip: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon lucide-flame"><path d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4"></path></svg>',
    warning:
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon lucide-alert-triangle"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>',
    danger:
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon lucide-alert-triangle"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>'
  }

  // GitHub-style label mapping (四种提示容器 + details 折叠容器)
  private labelMap: Record<string, string> = {
    info: '提示',
    tip: '建议',
    warning: '警告',
    danger: '危险',
    details: '详细信息'
  }

  private observer: MutationObserver | null = null
  private globalDebounceTimer: number | null = null

  constructor(plugin: VitePressThemePlugin) {
    this.plugin = plugin
    this.app = plugin.app
    this.initObserver()
  }

  /**
   * 使用 MutationObserver 监听预览区域的变化，替代高性能损耗的 setInterval 轮询
   */
  private initObserver() {
    this.observer = new MutationObserver((mutations) => {
      let needsScan = false
      for (const mutation of mutations) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          needsScan = true
          break
        }
      }
      if (needsScan) {
        this.requestGlobalScan()
      }
    })

    // 监听 body 确保即便在不同 Tab 切换时也能捕捉到
    this.observer.observe(document.body, { childList: true, subtree: true })
    
    // 同时也注册到插件的卸载逻辑中
    this.plugin.register(() => this.observer?.disconnect())
  }

  private requestGlobalScan() {
    if (this.globalDebounceTimer) {
      window.clearTimeout(this.globalDebounceTimer)
    }
    this.globalDebounceTimer = window.setTimeout(() => {
      this.globalDebounceTimer = null
      const sections = document.querySelectorAll('.markdown-preview-section')
      sections.forEach(s => this.processCodeGroupsInSection(s))
    }, 150)
  }

  /**
   * Post-processor entry — called once per rendered block by Obsidian
   */
  processContainer = (el: HTMLElement, _ctx: MarkdownPostProcessorContext) => {
    if (!this.plugin.settings.enableContainerParser) return

    // ① 单块段落容器 (info / tip / warning / danger)
    this.processParagraphContainers(el)

    // ② code-group 跨块容器触发逻辑
    // 如果发现标记或代码块，立即请求一次带防抖的全局扫描
    const html = el.innerHTML
    if (html.includes(':::') || el.querySelector('pre > code')) {
      this.requestGlobalScan()
    }
  }

  // ─────────────────────────────────────────────
  // 单块段落容器 (info / tip / warning / danger)
  // ─────────────────────────────────────────────

  private processParagraphContainers(el: HTMLElement): void {
    const paragraphs = el.querySelectorAll('p')
    paragraphs.forEach((p) => {
      // 1. 将 p 内容拆分为行（支持 BR 和 \n）
      const pNodes = Array.from(p.childNodes)
      const linesOfNodes: Node[][] = []
      let currentLine: Node[] = []

      pNodes.forEach(node => {
        if (node.nodeName === 'BR') {
          linesOfNodes.push(currentLine)
          currentLine = []
        } else if (node.nodeType === Node.TEXT_NODE && node.textContent?.includes('\n')) {
          const textParts = node.textContent.split('\n')
          for (let i = 0; i < textParts.length; i++) {
            if (i > 0) {
              linesOfNodes.push(currentLine)
              currentLine = []
            }
            if (textParts[i]) {
              currentLine.push(document.createTextNode(textParts[i]))
            }
          }
        } else {
          currentLine.push(node)
        }
      })
      if (currentLine.length > 0) linesOfNodes.push(currentLine)

      if (linesOfNodes.length < 3) return

      // 2. 解析头尾识别标志
      const firstLineText = linesOfNodes[0].map(n => n.textContent).join('').trim()
      const lastLineText = linesOfNodes[linesOfNodes.length - 1].map(n => n.textContent).join('').trim()

      if (/^(?::\s*)?:::\s*code-group/i.test(firstLineText)) return

      const typeMatch = firstLineText.match(/^\s*(?::\s*)?:::\s*([a-zA-Z]+)(.*)?$/i)
      if (!typeMatch) return

      const typeLower = typeMatch[1].toLowerCase()
      if (!this.labelMap[typeLower]) return

      if (!lastLineText.endsWith(':::')) return

      const customTitle = typeMatch[2]?.trim()

      // 3. 构建容器结构
      let containerEl: HTMLElement
      let contentEl: HTMLElement

      if (typeLower === 'details') {
        containerEl = createEl('details', { cls: 'vp-details' })
        containerEl.createEl('summary', { 
          cls: 'vp-details-summary', 
          text: customTitle || this.labelMap['details'] 
        })
        contentEl = containerEl.createDiv({ cls: 'vp-details-content' })
      } else {
        containerEl = this.createContainerElement(typeLower, customTitle)
        contentEl = containerEl.querySelector('.vp-container-content') as HTMLElement
      }

      // 4. 重组中间内容，克隆原生 Node 保障内部格式与事件
      for (let i = 1; i < linesOfNodes.length - 1; i++) {
        const lineNodes = linesOfNodes[i]
        const isEmpty = lineNodes.every(n => n.nodeType === Node.TEXT_NODE && !n.textContent?.trim())
        if (isEmpty) continue
        
        const lineP = contentEl.createEl('p')
        lineNodes.forEach(node => lineP.appendChild(node.cloneNode(true)))
      }

      // 5. 将旧段落直接替换
      p.replaceWith(containerEl)
    })
  }

  // ─────────────────────────────────────────────
  // 跨块 code-group 扫描与组装
  // ─────────────────────────────────────────────

  /**
   * 扫描整个 section 的直接子元素，寻找 ::: code-group 和结尾 ::: 的配对
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
          const endEl = child
          const middleEls = children.slice(startIndex + 1, i) as HTMLElement[]

          let needsRebuild = false
          const existingGroup = startEl.querySelector('.vp-code-group')

          if (!existingGroup) {
            needsRebuild = true
          } else if (endEl.dataset.cgMarker !== 'end' || !endEl.classList.contains('vp-hidden')) {
            needsRebuild = true
          } else {
            for (const m of middleEls) {
              if (!m.classList.contains('vp-hidden')) {
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

            startEl.empty()
            startEl.dataset.cgMarker = 'start'

            endEl.empty()
            endEl.dataset.cgMarker = 'end'
            endEl.classList.add('vp-hidden')

            this.buildCodeGroup(startEl, middleEls, activeIndex)
          }

          startIndex = -1 // 重置，继续寻找下一个 code-group
        }
      }
    }
  }

  /**
   * 组装 code-group DOM（深度 Clone 模式，不碰 Obsidian 的缓存节点树）
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
      const codeEl = wrapper.querySelector('code')
      if (!codeEl) {
        wrapper.classList.add('vp-hidden')
        continue
      }

      const preEl = codeEl.closest('pre') as HTMLElement | null
      if (!preEl) {
        wrapper.classList.add('vp-hidden')
        continue
      }

      const filename = this.extractFilename(codeEl)

      // Clone 原始节点，与 Obsidian / codeEnhancer 的状态隔离
      const rawPreClone = preEl.cloneNode(true) as HTMLElement

      // 隐藏原始节点（保留在 DOM 树中供 Obsidian 内部使用）
      wrapper.classList.add('vp-hidden')

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
      contentEl.appendChild(rawPreClone)

      // 对 Clone 的 pre 运行增强逻辑（绑定独立的 Copy 按钮等）
      this.plugin.codeEnhancer.enhanceSingleBlock(rawPreClone)

      contentsEl.appendChild(contentEl)
      tabIndex++
    }

    if (tabIndex === 0) return

    codeGroupEl.appendChild(tabsEl)
    codeGroupEl.appendChild(contentsEl)

    // VP 结构挂载在 start 节点内部
    startWrapper.appendChild(codeGroupEl)
  }

  // ─────────────────────────────────────────────
  // 辅助方法
  // ─────────────────────────────────────────────

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
  // DOM 工厂
  // ─────────────────────────────────────────────

  private createContainerElement(type: string, customTitle?: string): HTMLElement {
    const typeLower = type.toLowerCase()
    const icon = this.svgIcons[typeLower] || ''
    const defaultLabel = this.labelMap[typeLower] || typeLower
    const title = customTitle || defaultLabel

    const containerEl = createDiv({ cls: `vp-container vp-${typeLower}` })
    
    const headerEl = containerEl.createDiv({ cls: 'vp-container-header' })
    const iconSpan = headerEl.createSpan({ cls: 'vp-container-icon' })
    const parser = new DOMParser()
    const svgDoc = parser.parseFromString(icon, 'image/svg+xml')
    const svgEl = svgDoc.documentElement
    if (svgEl && svgEl.nodeName === 'svg') {
      iconSpan.appendChild(svgEl)
    }
    headerEl.createSpan({ cls: 'vp-container-title-text', text: title })
    
    containerEl.createDiv({ cls: 'vp-container-content' })
    
    return containerEl
  }
}
