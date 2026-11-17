import { App, Notice, PluginSettingTab, SettingGroup } from 'obsidian'
import type VitePressThemePlugin from './main'
import { DEFAULT_SETTINGS } from './types/settings'
import type { LanguageSetting } from './i18n'

export class VitePressSettingTab extends PluginSettingTab {
  plugin: VitePressThemePlugin
  icon = 'palette'

  constructor(app: App, plugin: VitePressThemePlugin) {
    super(app, plugin)
    this.plugin = plugin
  }

  display(): void {
    const { containerEl } = this
    containerEl.empty()

    const msg = this.plugin.getMessages().settings

    // General
    new SettingGroup(containerEl)
      .setHeading(msg.groups.general)
      .addSetting((setting) => {
        setting
          .setName(msg.language.name)
          .setDesc(msg.language.desc)
          .addDropdown((dropdown) =>
            dropdown
              .addOption('auto', msg.language.options.auto)
              .addOption('en', msg.language.options.en)
              .addOption('zh', msg.language.options.zh)
              .setValue(this.plugin.settings.language)
              .onChange(async (value) => {
                this.plugin.settings.language = value as LanguageSetting
                await this.plugin.saveSettings()
                this.plugin.rerenderMarkdownViews()
                this.display()
              })
          )
      })

    // Styles
    new SettingGroup(containerEl)
      .setHeading(msg.groups.styles)
      .addSetting((setting) => {
        setting
          .setName(msg.enableCodeBlocks.name)
          .setDesc(msg.enableCodeBlocks.desc)
          .addToggle((toggle) =>
            toggle.setValue(this.plugin.settings.enableCodeBlocks).onChange(async (value) => {
              this.plugin.settings.enableCodeBlocks = value
              await this.plugin.saveSettings()
              this.plugin.updateTheme()
              this.plugin.rerenderMarkdownViews()
              this.display()
            })
          )
      })
      .addSetting((setting) => {
        setting
          .setName(msg.enableContainers.name)
          .setDesc(msg.enableContainers.desc)
          .addToggle((toggle) =>
            toggle.setValue(this.plugin.settings.enableContainers).onChange(async (value) => {
              this.plugin.settings.enableContainers = value
              await this.plugin.saveSettings()
              this.plugin.updateTheme()
            })
          )
      })
      .addSetting((setting) => {
        setting
          .setName(msg.enableTypography.name)
          .setDesc(msg.enableTypography.desc)
          .addToggle((toggle) =>
            toggle.setValue(this.plugin.settings.enableTypography).onChange(async (value) => {
              this.plugin.settings.enableTypography = value
              await this.plugin.saveSettings()
              this.plugin.updateTheme()
            })
          )
      })
      .addSetting((setting) => {
        setting
          .setName(msg.codeBlockRadius.name)
          .setDesc(msg.codeBlockRadius.desc)
          .addSlider((slider) =>
            slider
              .setLimits(0, 16, 1)
              .setValue(this.plugin.settings.codeBlockRadius)
              .setDynamicTooltip()
              .onChange(async (value) => {
                this.plugin.settings.codeBlockRadius = value
                this.plugin.updateTheme()
                await this.plugin.saveSettings()
              })
          )
      })

    // Code blocks
    new SettingGroup(containerEl)
      .setHeading(msg.groups.codeBlocks)
      .addSetting((setting) => {
        setting
          .setName(msg.showCodeLineNumbers.name)
          .setDesc(msg.showCodeLineNumbers.desc)
          .addToggle((toggle) =>
            toggle.setValue(this.plugin.settings.showCodeLineNumbers).onChange(async (value) => {
              this.plugin.settings.showCodeLineNumbers = value
              await this.plugin.saveSettings()
              this.plugin.rerenderMarkdownViews()
            })
          )
          .setDisabled(!this.plugin.settings.enableCodeBlocks)
      })

    // Features
    new SettingGroup(containerEl)
      .setHeading(msg.groups.features)
      .addSetting((setting) => {
        setting
          .setName(msg.enableContainerParser.name)
          .setDesc(msg.enableContainerParser.desc)
          .addToggle((toggle) =>
            toggle.setValue(this.plugin.settings.enableContainerParser).onChange(async (value) => {
              this.plugin.settings.enableContainerParser = value
              await this.plugin.saveSettings()
              this.plugin.rerenderMarkdownViews()
            })
          )
      })
      .addSetting((setting) => {
        setting
          .setName(msg.enableLinkProcessing.name)
          .setDesc(msg.enableLinkProcessing.desc)
          .addToggle((toggle) =>
            toggle.setValue(this.plugin.settings.enableLinkProcessing).onChange(async (value) => {
              this.plugin.settings.enableLinkProcessing = value
              await this.plugin.saveSettings()
              this.plugin.rerenderMarkdownViews()
              this.display()
            })
          )
      })
      .addSetting((setting) => {
        setting
          .setName(msg.enableExternalLinkFavicon.name)
          .setDesc(msg.enableExternalLinkFavicon.desc)
          .addToggle((toggle) =>
            toggle.setValue(this.plugin.settings.enableExternalLinkFavicon).onChange(async (value) => {
              this.plugin.settings.enableExternalLinkFavicon = value
              await this.plugin.saveSettings()
              this.plugin.rerenderMarkdownViews()
            })
          )
          .setDisabled(!this.plugin.settings.enableLinkProcessing)
      })
      .addSetting((setting) => {
        setting
          .setName(msg.enableRelativeLinkResolution.name)
          .setDesc(msg.enableRelativeLinkResolution.desc)
          .addToggle((toggle) =>
            toggle.setValue(this.plugin.settings.enableRelativeLinkResolution).onChange(async (value) => {
              this.plugin.settings.enableRelativeLinkResolution = value
              await this.plugin.saveSettings()
              this.plugin.rerenderMarkdownViews()
            })
          )
          .setDisabled(!this.plugin.settings.enableLinkProcessing)
      })
      .addSetting((setting) => {
        setting
          .setName(msg.enableBadgeProcessor.name)
          .setDesc(msg.enableBadgeProcessor.desc)
          .addToggle((toggle) =>
            toggle.setValue(this.plugin.settings.enableBadgeProcessor).onChange(async (value) => {
              this.plugin.settings.enableBadgeProcessor = value
              await this.plugin.saveSettings()
              this.plugin.rerenderMarkdownViews()
            })
          )
      })
      .addSetting((setting) => {
        setting
          .setName(msg.enableEmojiProcessor.name)
          .setDesc(msg.enableEmojiProcessor.desc)
          .addToggle((toggle) =>
            toggle.setValue(this.plugin.settings.enableEmojiProcessor).onChange(async (value) => {
              this.plugin.settings.enableEmojiProcessor = value
              await this.plugin.saveSettings()
              this.plugin.rerenderMarkdownViews()
            })
          )
      })

    // Appearance
    new SettingGroup(containerEl)
      .setHeading(msg.groups.appearance)
      .addSetting((setting) => {
        setting
          .setName(msg.followObsidianTheme.name)
          .setDesc(msg.followObsidianTheme.desc)
          .addToggle((toggle) =>
            toggle.setValue(this.plugin.settings.followObsidianTheme).onChange(async (value) => {
              this.plugin.settings.followObsidianTheme = value
              await this.plugin.saveSettings()
              this.plugin.updateTheme()
              this.display()
            })
          )
      })
      .addSetting((setting) => {
        setting
          .setName(msg.customPrimaryColor.name)
          .setDesc(msg.customPrimaryColor.desc)
          .addColorPicker((color) =>
            color.setValue(this.plugin.settings.customPrimaryColor).onChange(async (value) => {
              this.plugin.settings.customPrimaryColor = value
              await this.plugin.saveSettings()
              this.plugin.updateTheme()
            })
          )
          .setDisabled(this.plugin.settings.followObsidianTheme)
      })

    // Advanced
    new SettingGroup(containerEl)
      .setHeading(msg.groups.advanced)
      .addSetting((setting) => {
        setting
          .setName(msg.debugMode.name)
          .setDesc(msg.debugMode.desc)
          .addToggle((toggle) =>
            toggle.setValue(this.plugin.settings.debugMode).onChange(async (value) => {
              this.plugin.settings.debugMode = value
              await this.plugin.saveSettings()
            })
          )
      })
      .addSetting((setting) => {
        setting
          .setName(msg.reloadStyles.name)
          .setDesc(msg.reloadStyles.desc)
          .addButton((button) =>
            button.setButtonText(msg.reloadStyles.button).onClick(() => {
              this.plugin.updateTheme()
              this.plugin.rerenderMarkdownViews()
            })
          )
      })
      .addSetting((setting) => {
        setting
          .setName(msg.resetDefaults.name)
          .setDesc(msg.resetDefaults.desc)
          .addButton((button) =>
            button
              .setWarning()
              .setButtonText(msg.resetDefaults.button)
              .onClick(async () => {
                this.plugin.settings = { ...DEFAULT_SETTINGS }
                await this.plugin.saveSettings()
                this.plugin.updateTheme()
                this.plugin.rerenderMarkdownViews()
                this.display()
                new Notice(msg.resetDefaults.notice)
              })
          )
      })
  }
}
