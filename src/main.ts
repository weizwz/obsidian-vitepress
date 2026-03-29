import { Plugin } from 'obsidian'
import { VitePressSettingTab } from './settings'
import { VitePressSettings, DEFAULT_SETTINGS } from './types/settings'
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

    // Initialize features
    this.containerParser = new ContainerParser(this)
    this.codeEnhancer = new CodeEnhancer(this)
    this.linkProcessor = new LinkProcessor(this)
    this.emojiProcessor = new EmojiProcessor(this.app, this)
    this.badgeProcessor = new BadgeProcessor(this)

    // Add settings tab
    this.addSettingTab(new VitePressSettingTab(this.app, this))

    // Update theme based on settings
    this.updateTheme()

    // Register post processors
    this.registerMarkdownPostProcessor((el, ctx) => {
      this.containerParser.processContainer(el, ctx)
      this.codeEnhancer.enhanceCodeBlocks(el, ctx)
      this.linkProcessor.processLinks(el, ctx)
      this.emojiProcessor.processEmoji(el, ctx)
      this.badgeProcessor.processBadges(el, ctx)
    })

    // Add theme class to body
    document.body.classList.add('vitepress-theme')

    // Listen for theme changes
    this.registerEvent(
      this.app.workspace.on('css-change', () => {
        this.updateTheme()
      })
    )

    this.log('VitePress Theme loaded')
  }

  onunload() {
    this.removeTheme()

    // Remove theme class
    document.body.classList.remove('vitepress-theme')

    this.log('VitePress Theme unloaded')
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
  }

  async saveSettings() {
    await this.saveData(this.settings)
  }

  /**
   * Update DOM classes and variables based on settings
   */
  updateTheme() {
    const list = document.body.classList
    list.toggle('vp-feature-typography', this.settings.enableTypography)
    list.toggle('vp-feature-containers', this.settings.enableContainers)
    list.toggle('vp-feature-code-blocks', this.settings.enableCodeBlocks)

    const accent = this.settings.followObsidianTheme ? 'var(--accent-color)' : this.settings.customPrimaryColor
    document.body.style.setProperty('--vp-c-brand-1', accent)
    document.body.style.setProperty('--vp-c-brand-2', accent)
    document.body.style.setProperty('--vp-c-brand-3', accent)
  }

  removeTheme() {
    document.body.classList.remove(
      'vp-feature-typography',
      'vp-feature-containers',
      'vp-feature-code-blocks'
    )
    document.body.style.removeProperty('--vp-c-brand-1')
    document.body.style.removeProperty('--vp-c-brand-2')
    document.body.style.removeProperty('--vp-c-brand-3')
  }

  /**
   * Log to console if debug mode is enabled
   */
  log(...args: unknown[]) {
    if (this.settings.debugMode) {
      console.debug('[VitePress Theme]', ...args)
    }
  }
}
