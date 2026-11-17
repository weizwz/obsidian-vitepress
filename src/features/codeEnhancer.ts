import { MarkdownPostProcessorContext } from 'obsidian'
import type VitePressThemePlugin from '../main'

interface FenceMeta {
  filename: string
  highlightLines: string
  lineAnnotations: Record<number, string[]>
}

const ANNOTATION_REGEX =
  /\s*(?:\/\/|#|--|\/\*|<!--)\s*\[!code\s+(highlight|hl|focus|\+\+|--|error|warning)(?::(\d+))?\]\s*(?:\*\/|-->)?\s*$/i

export class CodeEnhancer {
  private plugin: VitePressThemePlugin

  constructor(plugin: VitePressThemePlugin) {
    this.plugin = plugin
  }

  enhanceCodeBlocks = (el: HTMLElement, ctx: MarkdownPostProcessorContext): void => {
    if (!this.plugin.settings.enableCodeBlocks) return

    const metas = this.extractFenceMetas(el, ctx)
    const codeBlocks = el.querySelectorAll('pre:not(.vp-code-group pre):not(.vp-code-block pre)')

    let idx = 0
    codeBlocks.forEach((pre) => {
      const code = pre.querySelector('code')
      if (
        pre.classList.contains('frontmatter') ||
        pre.closest('.mod-frontmatter') ||
        (pre as HTMLElement).style.display === 'none'
      ) {
        return
      }

      const meta = metas[idx]
      if (code && meta) {
        if (meta.filename) {
          code.setAttribute('data-filename', meta.filename)
        }
        if (meta.highlightLines) {
          code.setAttribute('data-highlight-lines', meta.highlightLines)
        }
        if (Object.keys(meta.lineAnnotations).length > 0) {
          code.setAttribute('data-line-annotations', JSON.stringify(meta.lineAnnotations))
        }
      }

      this.enhanceSingleBlock(pre as HTMLElement)
      idx++
    })
  }

  private extractFenceMetas(el: HTMLElement, ctx: MarkdownPostProcessorContext): FenceMeta[] {
    const info = ctx.getSectionInfo(el)
    if (!info?.text) return []

    const textLines = info.text.split('\n').slice(info.lineStart, info.lineEnd + 1)
    const metas: FenceMeta[] = []
    let inFence = false
    let fenceChar = ''
    let fenceLen = 0
    let fenceLineNo = 0

    for (const line of textLines) {
      if (!inFence) {
        const openMatch = line.match(/^\s*(`{3,}|~{3,})(.*)$/)
        if (openMatch) {
          inFence = true
          fenceChar = openMatch[1][0]
          fenceLen = openMatch[1].length
          fenceLineNo = 0
          const header = openMatch[2]
          const filenameMatch = header.match(/\[(.*?)\]/)
          const highlightMatch = header.match(/\{([0-9,\s-]+)\}/)
          metas.push({
            filename: filenameMatch ? filenameMatch[1].trim() : '',
            highlightLines: highlightMatch ? this.parseLineRanges(highlightMatch[1]) : '',
            lineAnnotations: {}
          })
        }
      } else {
        const closeRegex = new RegExp(`^\\s*${fenceChar}{${fenceLen},}\\s*$`)
        if (closeRegex.test(line)) {
          inFence = false
        } else {
          fenceLineNo++
          const match = line.match(ANNOTATION_REGEX)
          const currentMeta = metas[metas.length - 1]
          if (match && currentMeta) {
            const directive = match[1].toLowerCase()
            const count = match[2] ? Math.max(1, parseInt(match[2], 10)) : 1
            const classes = this.directiveToClasses(directive)
            for (let i = 0; i < count; i++) {
              const targetLine = fenceLineNo + i
              if (!currentMeta.lineAnnotations[targetLine]) {
                currentMeta.lineAnnotations[targetLine] = []
              }
              for (const cls of classes) {
                if (!currentMeta.lineAnnotations[targetLine].includes(cls)) {
                  currentMeta.lineAnnotations[targetLine].push(cls)
                }
              }
            }
          }
        }
      }
    }

    return metas
  }

  private directiveToClasses(directive: string): string[] {
    if (directive === 'highlight' || directive === 'hl') {
      return ['highlighted']
    }
    if (directive === 'focus') {
      return ['has-focus']
    }
    if (directive === '++') {
      return ['diff', 'add']
    }
    if (directive === '--') {
      return ['diff', 'remove']
    }
    if (directive === 'error') {
      return ['highlighted', 'error']
    }
    if (directive === 'warning') {
      return ['highlighted', 'warning']
    }
    return []
  }

  private parseLineRanges(rangeStr: string): string {
    const lineSet = new Set<number>()
    for (const part of rangeStr.split(',')) {
      const trimmed = part.trim()
      if (!trimmed) continue
      const range = trimmed.match(/^(\d+)\s*-\s*(\d+)$/)
      if (range) {
        const start = parseInt(range[1], 10)
        const end = parseInt(range[2], 10)
        for (let i = Math.min(start, end); i <= Math.max(start, end); i++) {
          lineSet.add(i)
        }
      } else if (/^\d+$/.test(trimmed)) {
        lineSet.add(parseInt(trimmed, 10))
      }
    }
    return Array.from(lineSet).join(',')
  }

  public enhanceSingleBlock(pre: HTMLElement): void {
    const code = pre.querySelector('code')
    if (!code) return

    const langClass = Array.from(code.classList).find((c) => c.startsWith('language-'))
    const rawLang = langClass ? langClass.replace('language-', '') : ''
    const pureLang = rawLang.replace(/\{[^}]*\}/g, '').replace(/\[[^\]]*\]/g, '').trim()

    if (langClass && pureLang && rawLang !== pureLang) {
      code.classList.remove(langClass)
      code.classList.add(`language-${pureLang}`)
    }

    const wrapper = createDiv({ cls: 'vp-code-block' })
    const header = createDiv({ cls: 'vp-code-block-header' })

    const filename = code.getAttribute('data-filename')
    const displayLabel = filename || pureLang
    if (displayLabel) {
      header.createSpan({ cls: 'vp-code-lang', text: displayLabel })
    }

    wrapper.appendChild(header)

    pre.parentElement?.insertBefore(wrapper, pre)
    wrapper.appendChild(pre)

    if (pureLang) {
      wrapper.dataset.language = pureLang
    }

    const enableAnnotations = this.plugin.settings.enableCodeLineAnnotations
    const showLineNumbers = this.plugin.settings.showCodeLineNumbers

    if (!enableAnnotations && !showLineNumbers) return

    this.processCodeLines(wrapper, pre, code)

    let isApplying = false
    const observer = new MutationObserver(() => {
      if (isApplying) return
      if (!code.querySelector('.vp-code-line')) {
        isApplying = true
        this.processCodeLines(wrapper, pre, code)
        isApplying = false
      }
    })
    observer.observe(code, { childList: true })
  }

  private processCodeLines(wrapper: HTMLElement, pre: HTMLElement, code: HTMLElement): void {
    const enableAnnotations = this.plugin.settings.enableCodeLineAnnotations
    const showLineNumbers = this.plugin.settings.showCodeLineNumbers

    const lines = this.splitCodeIntoLines(code)
    if (lines.length === 0) return

    const highlightSet = new Set(
      (code.getAttribute('data-highlight-lines') || '')
        .split(',')
        .filter(Boolean)
        .map((n) => parseInt(n, 10))
    )

    let savedAnnotations: Record<number, string[]> = {}
    const rawSaved = code.getAttribute('data-line-annotations')
    if (rawSaved) {
      try {
        savedAnnotations = JSON.parse(rawSaved) as Record<number, string[]>
      } catch {
        savedAnnotations = {}
      }
    }

    let hasFocus = false
    const lineClasses: string[][] = lines.map(() => [])

    lines.forEach((lineEl, index) => {
      const lineNumber = index + 1
      const classes = lineClasses[index]

      if (enableAnnotations) {
        if (highlightSet.has(lineNumber)) {
          classes.push('highlighted')
        }

        const saved = savedAnnotations[lineNumber]
        if (saved) {
          for (const cls of saved) {
            if (!classes.includes(cls)) {
              classes.push(cls)
            }
          }
        }

        const extracted = this.extractAndStripAnnotation(lineEl)
        if (extracted) {
          const added = this.directiveToClasses(extracted.directive)
          for (let i = 0; i < extracted.count; i++) {
            const targetIdx = index + i
            if (targetIdx >= lines.length) break
            const targetLineNo = targetIdx + 1
            if (!savedAnnotations[targetLineNo]) {
              savedAnnotations[targetLineNo] = []
            }
            for (const cls of added) {
              if (!lineClasses[targetIdx].includes(cls)) {
                lineClasses[targetIdx].push(cls)
              }
              if (!savedAnnotations[targetLineNo].includes(cls)) {
                savedAnnotations[targetLineNo].push(cls)
              }
            }
          }
        }
      }
    })

    if (enableAnnotations && Object.keys(savedAnnotations).length > 0) {
      code.setAttribute('data-line-annotations', JSON.stringify(savedAnnotations))
    }

    lines.forEach((lineEl, index) => {
      const classes = lineClasses[index]
      if (classes.includes('has-focus')) {
        hasFocus = true
      }
      if (classes.length > 0) {
        lineEl.classList.add(...classes)
      }
    })

    wrapper.classList.toggle('has-focused-lines', hasFocus)

    const existingNumbers = wrapper.querySelector('.vp-line-numbers')
    if (existingNumbers) {
      existingNumbers.remove()
    }

    if (showLineNumbers && lines.length > 1) {
      this.renderLineNumbers(wrapper, pre, lineClasses)
    }
  }

  private splitCodeIntoLines(code: HTMLElement): HTMLElement[] {
    const lines: HTMLElement[] = [createSpan({ cls: 'vp-code-line' })]
    const ancestors: HTMLElement[] = []

    const appendTextToCurrentLine = (text: string) => {
      let target: HTMLElement = lines[lines.length - 1]
      for (const ancestor of ancestors) {
        const last = target.lastElementChild as HTMLElement | null
        if (last && last.dataset.vpCloneId === ancestor.dataset.vpCloneId) {
          target = last
        } else {
          const clone = ancestor.cloneNode(false) as HTMLElement
          target.appendChild(clone)
          target = clone
        }
      }
      target.appendChild(activeDocument.createTextNode(text))
    }

    let cloneSeq = 0
    const walk = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const parts = (node.textContent || '').split('\n')
        parts.forEach((part, i) => {
          if (i > 0) {
            lines.push(createSpan({ cls: 'vp-code-line' }))
          }
          if (part.length > 0) {
            appendTextToCurrentLine(part)
          }
        })
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement
        el.dataset.vpCloneId = String(++cloneSeq)
        ancestors.push(el)
        Array.from(el.childNodes).forEach(walk)
        ancestors.pop()
        delete el.dataset.vpCloneId
      }
    }

    Array.from(code.childNodes).forEach(walk)

    if (lines.length > 1 && !(lines[lines.length - 1].textContent || '')) {
      lines.pop()
    }

    code.empty()
    lines.forEach((line, index) => {
      if (index > 0) {
        code.appendChild(activeDocument.createTextNode('\n'))
      }
      code.appendChild(line)
    })
    return lines
  }

  private extractAndStripAnnotation(lineEl: HTMLElement): { directive: string; count: number } | null {
    const lineText = lineEl.textContent || ''
    if (!lineText.includes('[!code')) return null

    const match = lineText.match(ANNOTATION_REGEX)
    if (!match || match.index === undefined) return null

    const directive = match[1].toLowerCase()
    const count = match[2] ? Math.max(1, parseInt(match[2], 10)) : 1
    const cutStart = match.index
    const walker = activeDocument.createTreeWalker(lineEl, NodeFilter.SHOW_TEXT)
    const textNodes: Text[] = []
    let current: Text | null
    while ((current = walker.nextNode() as Text)) {
      textNodes.push(current)
    }

    let offset = 0
    const parentsToCheck = new Set<HTMLElement>()
    for (const node of textNodes) {
      const text = node.textContent || ''
      const len = text.length
      if (offset + len <= cutStart) {
        offset += len
        continue
      }

      if (offset < cutStart) {
        node.textContent = text.slice(0, cutStart - offset).replace(/\s+$/, '')
      } else {
        node.textContent = ''
        if (node.parentElement && node.parentElement !== lineEl) {
          parentsToCheck.add(node.parentElement)
        }
      }
      offset += len
    }

    parentsToCheck.forEach((parent) => {
      if ((parent.textContent || '') === '') {
        parent.remove()
      }
    })

    const lastChild = lineEl.lastChild
    if (lastChild?.nodeType === Node.TEXT_NODE) {
      lastChild.textContent = (lastChild.textContent || '').replace(/\s+$/, '')
    }

    return { directive, count }
  }

  private renderLineNumbers(wrapper: HTMLElement, pre: HTMLElement, lineClasses: string[][]): void {
    const lineNumbers = createDiv({ cls: 'vp-line-numbers' })

    lineClasses.forEach((classes, index) => {
      const num = lineNumbers.createSpan({
        cls: 'vp-line-number',
        text: String(index + 1)
      })
      if (classes.includes('highlighted') && !classes.includes('error') && !classes.includes('warning')) {
        num.classList.add('highlighted')
      }
    })

    wrapper.classList.add('has-line-numbers', 'vp-relative')
    wrapper.insertBefore(lineNumbers, pre)
  }
}
