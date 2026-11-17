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

  // SVG icons (对齐 VitePress block.css 实心图标)
  private svgIcons: Record<string, string> = {
    info: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 1024 1024" class="svg-icon"><path fill="currentColor" d="M512 64a448 448 0 1 1 0 896.064A448 448 0 0 1 512 64m67.2 275.072c33.28 0 60.288-23.104 60.288-57.344s-27.072-57.344-60.288-57.344c-33.28 0-60.16 23.104-60.16 57.344s26.88 57.344 60.16 57.344M590.912 699.2c0-6.848 2.368-24.64 1.024-34.752l-52.608 60.544c-10.88 11.456-24.512 19.392-30.912 17.28a12.992 12.992 0 0 1-8.256-14.72l87.68-276.992c7.168-35.136-12.544-67.2-54.336-71.296-44.096 0-108.992 44.736-148.48 101.504 0 6.784-1.28 23.68.064 33.792l52.544-60.608c10.88-11.328 23.552-19.328 29.952-17.152a12.8 12.8 0 0 1 7.808 16.128L388.48 728.576c-10.048 32.256 8.96 63.872 55.04 71.04 67.84 0 107.904-43.648 147.456-100.416z"/></svg>',
    note: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 1024 1024" class="svg-icon"><path fill="currentColor" d="M512 64a448 448 0 1 1 0 896.064A448 448 0 0 1 512 64m67.2 275.072c33.28 0 60.288-23.104 60.288-57.344s-27.072-57.344-60.288-57.344c-33.28 0-60.16 23.104-60.16 57.344s26.88 57.344 60.16 57.344M590.912 699.2c0-6.848 2.368-24.64 1.024-34.752l-52.608 60.544c-10.88 11.456-24.512 19.392-30.912 17.28a12.992 12.992 0 0 1-8.256-14.72l87.68-276.992c7.168-35.136-12.544-67.2-54.336-71.296-44.096 0-108.992 44.736-148.48 101.504 0 6.784-1.28 23.68.064 33.792l52.544-60.608c10.88-11.328 23.552-19.328 29.952-17.152a12.8 12.8 0 0 1 7.808 16.128L388.48 728.576c-10.048 32.256 8.96 63.872 55.04 71.04 67.84 0 107.904-43.648 147.456-100.416z"/></svg>',
    tip: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 1024 1024" class="svg-icon"><path fill="currentColor" d="M384 960v-64h192.064v64zm448-544a350.656 350.656 0 0 1-128.32 271.424C665.344 719.04 640 763.776 640 813.504V832H320v-14.336c0-48-19.392-95.36-57.216-124.992a351.552 351.552 0 0 1-128.448-344.256c25.344-136.448 133.888-248.128 269.76-276.48A352.384 352.384 0 0 1 832 416m-544 32c0-132.288 75.904-224 192-224v-64c-154.432 0-256 122.752-256 288z"/></svg>',
    important:
      '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 1024 1024" class="svg-icon"><path fill="currentColor" d="M640 832a128 128 0 0 1-256 0zm192-64H134.4a38.4 38.4 0 0 1 0-76.8H192V448c0-154.88 110.08-284.16 256.32-313.6a64 64 0 1 1 127.36 0A320.128 320.128 0 0 1 832 448v243.2h57.6a38.4 38.4 0 0 1 0 76.8z"/></svg>',
    warning:
      '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 1024 1024" class="svg-icon"><path fill="currentColor" d="M928.99 755.83 574.6 203.25c-12.89-20.16-36.76-32.58-62.6-32.58s-49.71 12.43-62.6 32.58L95.01 755.83c-12.91 20.12-12.9 44.91.01 65.03 12.92 20.12 36.78 32.51 62.59 32.49h708.78c25.82.01 49.68-12.37 62.59-32.49 12.91-20.12 12.92-44.91.01-65.03M554.67 768h-85.33v-85.33h85.33zm0-426.67v298.66h-85.33V341.32z"/></svg>',
    danger:
      '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 1024 1024" class="svg-icon"><path fill="currentColor" d="M512 64a448 448 0 1 1 0 896 448 448 0 0 1 0-896m0 393.664L407.936 353.6a38.4 38.4 0 1 0-54.336 54.336L457.664 512 353.6 616.064a38.4 38.4 0 1 0 54.336 54.336L512 566.336 616.064 670.4a38.4 38.4 0 1 0 54.336-54.336L566.336 512 670.4 407.936a38.4 38.4 0 1 0-54.336-54.336z"/></svg>',
    caution:
      '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 1024 1024" class="svg-icon"><path fill="currentColor" d="M512 64a448 448 0 1 1 0 896 448 448 0 0 1 0-896m0 393.664L407.936 353.6a38.4 38.4 0 1 0-54.336 54.336L457.664 512 353.6 616.064a38.4 38.4 0 1 0 54.336 54.336L512 566.336 616.064 670.4a38.4 38.4 0 1 0 54.336-54.336L566.336 512 670.4 407.936a38.4 38.4 0 1 0-54.336-54.336z"/></svg>'
  }

  // GitHub-style label mapping (提示容器 + details 折叠容器)
  private labelMap: Record<string, string> = {
    info: '提示',
    note: '注意',
    tip: '建议',
    important: '重要',
    warning: '警告',
    danger: '危险',
    caution: '警告',
    details: '详细信息'
  }

  private observer: MutationObserver | null = null
  private globalScanQueued: boolean = false

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
    this.observer.observe(activeDocument.body, { childList: true, subtree: true })
    
    // 同时也注册到插件的卸载逻辑中
    this.plugin.register(() => this.observer?.disconnect())
  }

  private requestGlobalScan() {
    if (this.globalScanQueued) return
    
    this.globalScanQueued = true
    activeWindow.requestAnimationFrame(() => {
      this.globalScanQueued = false
      const sections = activeDocument.querySelectorAll('.markdown-preview-section')
      sections.forEach(s => this.processCodeGroupsInSection(s))
    })
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
              currentLine.push(activeDocument.createTextNode(textParts[i]))
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
      } else if (!child.matches('pre, .vp-code-block, .vp-code-group')) {
        const p = child.matches('p') ? child : child.querySelector('p')
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
        } else if (!child.matches('pre, .vp-code-block, .vp-code-group')) {
          const p = child.matches('p') ? child : child.querySelector('p')
          if (p && p.textContent?.trim() === ':::') {
            isEnd = true
          }
        }

        if (isEnd) {
          let startEl = children[startIndex] as HTMLElement
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
              if (!m.classList.contains('markdown-preview-pusher') && !m.classList.contains('vp-hidden')) {
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

            if (startEl.tagName === 'P') {
              const host = createDiv()
              startEl.replaceWith(host)
              startEl = host
            } else {
              startEl.empty()
            }
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
    const codeGroupEl = createDiv()
    codeGroupEl.className = 'vp-code-group'

    const tabsEl = createDiv()
    tabsEl.className = 'vp-code-group-tabs'

    const contentsEl = createDiv()
    contentsEl.className = 'vp-code-group-contents'

    let tabIndex = 0

    for (const wrapper of middleEls) {
      if (wrapper.classList.contains('markdown-preview-pusher')) continue

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

      const tabEl = createEl('button')
      tabEl.className = `vp-code-group-tab${tabIndex === activeIndex ? ' active' : ''}`
      tabEl.dataset.index = String(tabIndex)

      const iconSvg = this.getTabIconSvg(filename, codeEl)
      if (iconSvg) {
        const iconSpan = tabEl.createSpan({ cls: 'vp-code-group-tab-icon' })
        const svgDoc = new DOMParser().parseFromString(iconSvg, 'image/svg+xml')
        if (svgDoc.documentElement && svgDoc.documentElement.nodeName === 'svg') {
          iconSpan.appendChild(svgDoc.documentElement)
        }
      }
      tabEl.createSpan({ text: filename })

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

      const contentEl = createDiv()
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

  private getTabIconSvg(filename: string, codeEl: Element): string | null {
    const name = filename.toLowerCase()
    const langMatch = codeEl.className.match(/language-(\w+)/)
    const lang = langMatch ? langMatch[1].toLowerCase() : ''

    const icons: Record<string, string> = {
      pnpm: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="#F9AD00" d="M2 2h6v6H2zm7 0h6v6H9zm7 0h6v6h-6zm0 7h6v6h-6z"/><path fill="#4E4E4E" d="M9 9h6v6H9zm0 7h6v6H9zm7 0h6v6h-6zm-14 0h6v6H2z"/></svg>',
      yarn: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="#2C8EBB" d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2m4.4 14.3c-.6.5-1.5.5-2.1 0-.4-.3-.9-.5-1.5-.5-.6 0-1.1.2-1.5.5-.6.5-1.5.5-2.1 0-.5-.4-.6-1.1-.3-1.7.4-.7.6-1.5.5-2.3-.1-.9-.5-1.7-1.1-2.3-.5-.5-.5-1.3 0-1.8s1.3-.5 1.8 0c.6.6 1.3.9 2.1 1 .8.1 1.6-.1 2.3-.6.6-.4 1.4-.3 1.8.3s.3 1.4-.3 1.8c-.6.4-1 1.1-1 1.9 0 .8.4 1.5 1 1.9.6.4.8 1.2.4 1.8"/></svg>',
      npm: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="#CB3837" d="M2 7h20v10H12v2H8v-2H2zm2 2v6h4v-4h2v4h2V9zm8 0v6h2v-4h2v4h2v-4h2v4h2V9z"/></svg>',
      bun: '<svg viewBox="0 0 24 24" width="16" height="16"><ellipse cx="12" cy="13" rx="9" ry="7" fill="#FBF0DF" stroke="#14110F" stroke-width="1.5"/><circle cx="9" cy="12" r="1.2" fill="#14110F"/><circle cx="15" cy="12" r="1.2" fill="#14110F"/><path d="M10.5 14.5q1.5 1 3 0" fill="none" stroke="#DE4E6B" stroke-width="1.5" stroke-linecap="round"/></svg>',
      ts: '<svg viewBox="0 0 24 24" width="16" height="16"><rect width="20" height="20" x="2" y="2" rx="3" fill="#3178C6"/><path fill="#fff" d="M11 11.5H8.8V19H7v-7.5H4.8V10H11zm1.5 6.8v-1.6c.6.4 1.4.7 2.2.7.9 0 1.3-.3 1.3-.8 0-.6-.5-.8-1.6-1.2-1.4-.5-2.1-1.1-2.1-2.3 0-1.4 1.1-2.3 2.8-2.3.9 0 1.6.2 2.1.4v1.5c-.5-.3-1.2-.5-1.9-.5-.8 0-1.2.3-1.2.8 0 .5.4.7 1.5 1.1 1.5.5 2.3 1.1 2.3 2.4 0 1.4-1 2.4-3 2.4-1 0-1.9-.2-2.4-.6"/></svg>',
      js: '<svg viewBox="0 0 24 24" width="16" height="16"><rect width="20" height="20" x="2" y="2" rx="3" fill="#F7DF1E"/><path fill="#000" d="M11 16.4c0 1.7-1 2.5-2.5 2.5-1.1 0-1.8-.5-2.2-1.3l1.3-.8c.2.4.5.7.9.7.5 0 .8-.2.8-1V10H11zm2.2 1.2 1.3-.8c.3.6.8.9 1.6.9.7 0 1.1-.3 1.1-.8 0-.5-.4-.7-1.3-1.1l-.5-.2c-1.3-.5-2.1-1.2-2.1-2.5 0-1.2.9-2.2 2.4-2.2 1.1 0 1.9.4 2.4 1.3l-1.3.8c-.3-.5-.6-.7-1.1-.7s-.8.3-.8.7c0 .5.3.7 1.2 1.1l.5.2c1.5.6 2.3 1.3 2.3 2.7 0 1.5-1.2 2.4-2.8 2.4-1.6 0-2.6-.7-2.9-1.8"/></svg>',
      vue: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="#41B883" d="M2 4h4l6 10.4L18 4h4L12 21z"/><path fill="#35495E" d="M6 4h3.5L12 8.3 14.5 4H18l-6 10.4z"/></svg>',
      json: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="#CBCB41" d="M7 4c-1.5 0-2.5 1-2.5 2.5v3c0 .8-.5 1.5-1.5 1.5v2c1 0 1.5.7 1.5 1.5v3C4.5 19 5.5 20 7 20h1v-2H7.2c-.5 0-.7-.3-.7-.8v-3c0-1-.4-1.7-1.2-2.2.8-.5 1.2-1.2 1.2-2.2v-3c0-.5.2-.8.7-.8H8V4zm10 0h-1v2h.8c.5 0 .7.3.7.8v3c0 1 .4 1.7 1.2 2.2-.8.5-1.2 1.2-1.2 2.2v3c0 .5-.2.8-.7.8H16v2h1c1.5 0 2.5-1 2.5-2.5v-3c0-.8.5-1.5 1.5-1.5v-2c-1 0-1.5-.7-1.5-1.5v-3C19.5 5 18.5 4 17 4"/></svg>',
      css: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="#264DE4" d="M4 3h16l-1.5 16.5L12 21.5l-6.5-2z"/><path fill="#fff" d="M7.5 7h9l-.3 2.5H10l.2 2h5.7l-.5 5-3.4 1-3.4-1-.2-2h2l.1 1 1.5.4 1.5-.4.2-2H8z"/></svg>',
      html: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="#E34F26" d="M4 3h16l-1.5 16.5L12 21.5l-6.5-2z"/><path fill="#fff" d="M7.5 7h9l-.2 2H9.7l.2 2h6.2l-.5 5.5-3.6 1-3.6-1-.2-2.5h2l.1 1.2 1.7.5 1.7-.5.2-2.2H8z"/></svg>',
      sh: '<svg viewBox="0 0 24 24" width="16" height="16"><rect width="20" height="16" x="2" y="4" rx="2" fill="#4EAA25"/><path fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="m7 9 3 3-3 3m5 0h5"/></svg>',
      md: '<svg viewBox="0 0 24 24" width="16" height="16"><rect width="20" height="14" x="2" y="5" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path fill="currentColor" d="M5 15V9h2l2 2.5L11 9h2v6h-2v-3.5L9 14l-2-2.5V15zm11 0-2.5-3h1.5V9h2v3h1.5z"/></svg>'
    }

    if (name.includes('pnpm')) return icons.pnpm
    if (name.includes('yarn')) return icons.yarn
    if (name.includes('npm')) return icons.npm
    if (name.includes('bun')) return icons.bun
    if (name.endsWith('.ts') || name.endsWith('.mts') || lang === 'ts' || lang === 'typescript') return icons.ts
    if (name.endsWith('.js') || name.endsWith('.mjs') || lang === 'js' || lang === 'javascript') return icons.js
    if (name.endsWith('.vue') || lang === 'vue') return icons.vue
    if (name.endsWith('.json') || lang === 'json') return icons.json
    if (name.endsWith('.css') || name.endsWith('.scss') || lang === 'css' || lang === 'scss') return icons.css
    if (name.endsWith('.html') || lang === 'html') return icons.html
    if (name.endsWith('.md') || lang === 'md' || lang === 'markdown') return icons.md
    if (name.endsWith('.sh') || lang === 'sh' || lang === 'bash' || lang === 'zsh' || lang === 'shell') return icons.sh
    return null
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
