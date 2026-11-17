import { MarkdownView, Plugin } from 'obsidian'
import { VitePressSettingTab } from './settings'
import { VitePressSettings, DEFAULT_SETTINGS } from './types/settings'
import { getMessages, type LocaleMessages } from './i18n'
import { ContainerParser } from './features/containerParser'
import { CodeEnhancer } from './features/codeEnhancer'
import { LinkProcessor } from './features/linkProcessor'
import { EmojiProcessor } from './features/emojiProcessor'
import { BadgeProcessor } from './features/badgeProcessor'

export default class VitePressThemePlugin extends Plugin {
  settings!: VitePressSettings
  private containerParser!: ContainerParser
  public codeEnhancer!: CodeEnhancer
  private linkProcessor!: LinkProcessor
  private emojiProcessor!: EmojiProcessor
  private badgeProcessor!: BadgeProcessor

  async onload() {
    await this.loadSettings()

    this.containerParser = new ContainerParser(this)
    this.codeEnhancer = new CodeEnhancer(this)
    this.linkProcessor = new LinkProcessor(this)
    this.emojiProcessor = new EmojiProcessor(this.app, this)
    this.badgeProcessor = new BadgeProcessor(this)

    this.addSettingTab(new VitePressSettingTab(this.app, this))

    this.updateTheme()

    this.registerMarkdownPostProcessor((el, ctx) => {
      this.containerParser.processContainer(el, ctx)
      this.codeEnhancer.enhanceCodeBlocks(el, ctx)
      this.linkProcessor.processLinks(el, ctx)
      this.emojiProcessor.processEmoji(el, ctx)
      this.badgeProcessor.processBadges(el, ctx)
    })

    this.registerEvent(
      this.app.workspace.on('css-change', () => {
        this.updateTheme()
      })
    )

    this.registerEvent(
      this.app.workspace.on('window-open', (_win, windowObj) => {
        this.applyThemeToDocument(windowObj.document)
      })
    )

    this.log('VitePress Theme loaded')
  }

  onunload() {
    this.removeThemeFromDocument(activeDocument)
    this.log('VitePress Theme unloaded')
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, (await this.loadData()) as Partial<VitePressSettings>)
  }

  async saveSettings() {
    await this.saveData(this.settings)
  }

  getMessages(): LocaleMessages {
    return getMessages(this.settings.language)
  }

  updateTheme() {
    const docs = new Set<Document>([document, activeDocument])
    this.app.workspace.iterateAllLeaves((leaf) => {
      const doc = leaf.view.containerEl.ownerDocument
      if (doc) docs.add(doc)
    })
    docs.forEach((doc) => this.applyThemeToDocument(doc))
  }

  private applyThemeToDocument(doc: Document) {
    const body = doc.body
    body.classList.add('vitepress-theme')
    body.classList.toggle('vp-feature-typography', this.settings.enableTypography)
    body.classList.toggle('vp-feature-containers', this.settings.enableContainers)
    body.classList.toggle('vp-feature-code-blocks', this.settings.enableCodeBlocks)

    const accent = this.settings.followObsidianTheme ? 'var(--accent-color)' : this.settings.customPrimaryColor
    body.style.setProperty('--vp-c-brand-1', accent)
    body.style.setProperty('--vp-c-brand-2', accent)
    body.style.setProperty('--vp-c-brand-3', accent)
    body.style.setProperty('--vp-code-block-radius', `${this.settings.codeBlockRadius}px`)
  }

  private removeThemeFromDocument(doc: Document) {
    const body = doc.body
    body.classList.remove(
      'vitepress-theme',
      'vp-feature-typography',
      'vp-feature-containers',
      'vp-feature-code-blocks'
    )
    body.style.removeProperty('--vp-c-brand-1')
    body.style.removeProperty('--vp-c-brand-2')
    body.style.removeProperty('--vp-c-brand-3')
    body.style.removeProperty('--vp-code-block-radius')
  }

  rerenderMarkdownViews() {
    this.app.workspace.iterateAllLeaves((leaf) => {
      if (leaf.view instanceof MarkdownView && leaf.view.getMode() === 'preview') {
        leaf.view.previewMode.rerender(true)
      }
    })
  }

  log(...args: unknown[]) {
    if (this.settings.debugMode) {
      console.debug('[VitePress Theme]', ...args)
    }
  }
}
