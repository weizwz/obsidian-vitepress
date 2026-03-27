import { App, MarkdownPostProcessorContext } from 'obsidian'
import type VitePressThemePlugin from '../main'

/**
 * Enhances code blocks with VitePress-style features
 * - Copy button
 * - Line numbers
 * - Code groups
 * - Language labels
 */
export class CodeEnhancer {
  private plugin: VitePressThemePlugin
  private app: App

  constructor(plugin: VitePressThemePlugin) {
    this.plugin = plugin
    this.app = plugin.app
  }

  /**
   * Post-processor to enhance code blocks
   */
  enhanceCodeBlocks = (el: HTMLElement, ctx: MarkdownPostProcessorContext): void => {
    if (!this.plugin.settings.enableCodeBlocks) return

    // 获取当前区块原始信息以提取 `[filename]`，例如 ```ts [config.ts]
    const info = ctx.getSectionInfo(el)
    const filenames: string[] = []
    if (info && info.text) {
      const textLines = info.text.split('\n').slice(info.lineStart, info.lineEnd + 1)
      for (const line of textLines) {
        const match = line.match(/^```[a-zA-Z0-9_+-]*\s+\[(.*?)\]/)
        if (match) {
          filenames.push(match[1])
        } else if (line.match(/^```/)) {
          // 只写了语言没写中括号
          filenames.push('')
        }
      }
    }

    // 跳过 .vp-code-group 内的代码块（已由 containerParser 处理）
    // 跳过已经增强过的代码块（在 .vp-code-block 内部的 pre）
    const codeBlocks = el.querySelectorAll('pre:not(.vp-code-group pre):not(.vp-code-block pre)')
    let idx = 0
    codeBlocks.forEach((pre) => {
      const code = pre.querySelector('code')
      if (code && filenames[idx]) {
        code.setAttribute('data-filename', filenames[idx])
      }
      this.enhanceSingleBlock(pre as HTMLElement)
      idx++
    })
  }

  /**
   * Enhance a single code block
   */
  public enhanceSingleBlock(pre: HTMLElement): void {
    const code = pre.querySelector('code')
    if (!code) return

    // Get language from class
    const langClass = Array.from(code.classList).find((c) => c.startsWith('language-'))
    const lang = langClass ? langClass.replace('language-', '') : ''

    // Create wrapper
    const wrapper = document.createElement('div')
    wrapper.className = 'vp-code-block'

    // Create header
    const header = document.createElement('div')
    header.className = 'vp-code-block-header'

    // Language label or filename
    const filename = code.getAttribute('data-filename')
    const displayLabel = filename || lang
    if (displayLabel) {
      const langLabel = document.createElement('span')
      langLabel.className = 'vp-code-lang'
      langLabel.textContent = displayLabel
      header.appendChild(langLabel)
    }

    wrapper.appendChild(header)

    // Move pre into wrapper
    pre.parentElement?.insertBefore(wrapper, pre)
    wrapper.appendChild(pre)

    // Add language-specific styling
    if (lang) {
      wrapper.dataset.language = lang
    }
  }

  /**
   * Copy code to clipboard
   */
  private async copyCode(code: HTMLElement, button: HTMLButtonElement): Promise<void> {
    const text = code.textContent || ''

    try {
      await navigator.clipboard.writeText(text)
      button.textContent = 'Copied!'
      button.classList.add('copied')

      setTimeout(() => {
        button.textContent = 'Copy'
        button.classList.remove('copied')
      }, 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
      button.textContent = 'Failed'
      setTimeout(() => {
        button.textContent = 'Copy'
      }, 2000)
    }
  }

  addLineNumbers(pre: HTMLElement): void {
    const code = pre.querySelector('code')
    if (!code) return

    const lines = code.innerHTML.split('\n')
    if (lines.length <= 1) return

    // Remove trailing empty line
    if (lines[lines.length - 1] === '') {
      lines.pop()
    }

    // Create line number container
    const lineNumbers = document.createElement('div')
    lineNumbers.className = 'vp-line-numbers'

    lines.forEach((_, index) => {
      const num = document.createElement('span')
      num.className = 'vp-line-number'
      num.textContent = String(index + 1)
      lineNumbers.appendChild(num)
    })

    const wrapper = pre.closest('.vp-code-block') as HTMLElement
    if (wrapper) {
      wrapper.classList.add('has-line-numbers')
      wrapper.style.position = 'relative'
      wrapper.insertBefore(lineNumbers, pre)
    }
  }
}
