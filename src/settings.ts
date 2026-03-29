import { App, PluginSettingTab, Setting } from 'obsidian'
import type VitePressThemePlugin from './main'

export class VitePressSettingTab extends PluginSettingTab {
  plugin: VitePressThemePlugin

  constructor(app: App, plugin: VitePressThemePlugin) {
    super(app, plugin)
    this.plugin = plugin
  }

  display(): void {
    const { containerEl } = this
    containerEl.empty()

    // Style options
    new Setting(containerEl).setName('Styles').setHeading()

    new Setting(containerEl)
      .setName('Enable code block styles')
      .setDesc('Apply vitepress-style code blocks with copy button and language labels')
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.enableCodeBlocks).onChange(async (value) => {
          this.plugin.settings.enableCodeBlocks = value
          await this.plugin.saveSettings()
          this.plugin.updateTheme()
        })
      )

    new Setting(containerEl)
      .setName('Enable container styles')
      .setDesc('Apply vitepress-style containers (tip, warning, danger)')
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.enableContainers).onChange(async (value) => {
          this.plugin.settings.enableContainers = value
          await this.plugin.saveSettings()
          this.plugin.updateTheme()
        })
      )

    new Setting(containerEl)
      .setName('Enable typography styles')
      .setDesc('Apply vitepress typography (headings, links, lists)')
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.enableTypography).onChange(async (value) => {
          this.plugin.settings.enableTypography = value
          await this.plugin.saveSettings()
          this.plugin.updateTheme()
        })
      )

    // Features
    new Setting(containerEl).setName('Features').setHeading()

    new Setting(containerEl)
      .setName('Parse vitepress containers')
      .setDesc('Convert ::: syntax to styled containers')
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.enableContainerParser).onChange(async (value) => {
          this.plugin.settings.enableContainerParser = value
          await this.plugin.saveSettings()
        })
      )

    new Setting(containerEl)
      .setName('Process links')
      .setDesc('Add external link icons and handle vitepress-style links')
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.enableLinkProcessing).onChange(async (value) => {
          this.plugin.settings.enableLinkProcessing = value
          await this.plugin.saveSettings()
        })
      )

    new Setting(containerEl)
      .setName('Parse vitepress badges')
      .setDesc('Convert <Badge /> syntax to styled badges')
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.enableBadgeProcessor).onChange(async (value) => {
          this.plugin.settings.enableBadgeProcessor = value
          await this.plugin.saveSettings()
        })
      )

    new Setting(containerEl)
      .setName('Parse vitepress emojis')
      .setDesc('Convert :emoji: syntax to icons')
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.enableEmojiProcessor).onChange(async (value) => {
          this.plugin.settings.enableEmojiProcessor = value
          await this.plugin.saveSettings()
        })
      )

    // Theme
    new Setting(containerEl).setName('Theme').setHeading()

    new Setting(containerEl)
      .setName('Follow Obsidian theme')
      .setDesc('Automatically adapt colors to match Obsidian theme')
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.followObsidianTheme).onChange(async (value) => {
          this.plugin.settings.followObsidianTheme = value
          await this.plugin.saveSettings()
          this.plugin.updateTheme()
        })
      )

    new Setting(containerEl)
      .setName('Custom primary color')
      .setDesc('Brand color for links and accents (when not following theme)')
      .addColorPicker((color) =>
        color.setValue(this.plugin.settings.customPrimaryColor).onChange(async (value) => {
          this.plugin.settings.customPrimaryColor = value
          await this.plugin.saveSettings()
          this.plugin.updateTheme()
        })
      )
      .setDisabled(this.plugin.settings.followObsidianTheme)

    // Debug
    new Setting(containerEl).setName('Debug').setHeading()

    new Setting(containerEl)
      .setName('Debug mode')
      .setDesc('Enable console logging for debugging')
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.debugMode).onChange(async (value) => {
          this.plugin.settings.debugMode = value
          await this.plugin.saveSettings()
        })
      )

    // Actions
    new Setting(containerEl).setName('Actions').setHeading()

    new Setting(containerEl)
      .setName('Reload styles')
      .setDesc('Force reload of all styles')
      .addButton((button) =>
        button.setButtonText('Reload').onClick(() => {
          this.plugin.updateTheme()
        })
      )
  }
}
