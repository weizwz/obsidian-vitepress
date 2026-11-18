import { App, Notice, PluginSettingTab, SettingDefinitionItem, SettingGroup } from 'obsidian'
import type VitePressThemePlugin from './main'
import { DEFAULT_SETTINGS, type VitePressSettings } from './types/settings'
import type { LanguageSetting } from './i18n'

export class VitePressSettingTab extends PluginSettingTab {
  plugin: VitePressThemePlugin
  icon = 'palette'

  constructor(app: App, plugin: VitePressThemePlugin) {
    super(app, plugin)
    this.plugin = plugin
  }

  getControlValue(key: string): unknown {
    return this.plugin.settings[key as keyof VitePressSettings]
  }

  async setControlValue(key: string, value: unknown): Promise<void> {
    const settingKey = key as keyof VitePressSettings
    ;(this.plugin.settings as unknown as Record<string, unknown>)[settingKey] = value
    await this.plugin.saveSettings()

    switch (settingKey) {
      case 'language':
        this.plugin.rerenderMarkdownViews()
        this.update()
        break
      case 'followObsidianTheme':
        this.plugin.updateTheme()
        this.refreshDomState()
        break
      case 'customPrimaryColor':
      case 'enableTypography':
      case 'enableContainers':
      case 'codeBlockRadius':
        this.plugin.updateTheme()
        break
      case 'enableCodeBlocks':
      case 'enableLinkProcessing':
        this.plugin.updateTheme()
        this.plugin.rerenderMarkdownViews()
        this.refreshDomState()
        break
      case 'enableExternalLinkFavicon':
        this.plugin.updateTheme()
        this.plugin.rerenderMarkdownViews()
        break
      case 'showCodeLineNumbers':
      case 'enableCodeLineAnnotations':
      case 'enableContainerParser':
      case 'enableRelativeLinkResolution':
      case 'enableBadgeProcessor':
      case 'enableEmojiProcessor':
        this.plugin.rerenderMarkdownViews()
        break
      case 'debugMode':
        break
    }
  }

  getSettingDefinitions(): SettingDefinitionItem[] {
    const msg = this.plugin.getMessages().settings

    return [
      {
        type: 'group',
        heading: msg.groups.general,
        items: [
          {
            name: msg.language.name,
            desc: msg.language.desc,
            control: {
              type: 'dropdown',
              key: 'language',
              options: {
                auto: msg.language.options.auto,
                en: msg.language.options.en,
                zh: msg.language.options.zh
              }
            }
          }
        ]
      },
      {
        type: 'group',
        heading: msg.groups.appearance,
        items: [
          {
            name: msg.followObsidianTheme.name,
            desc: msg.followObsidianTheme.desc,
            control: {
              type: 'toggle',
              key: 'followObsidianTheme'
            }
          },
          {
            name: msg.customPrimaryColor.name,
            desc: msg.customPrimaryColor.desc,
            control: {
              type: 'color',
              key: 'customPrimaryColor',
              disabled: () => this.plugin.settings.followObsidianTheme
            }
          }
        ]
      },
      {
        type: 'group',
        heading: msg.groups.styles,
        items: [
          {
            name: msg.enableTypography.name,
            desc: msg.enableTypography.desc,
            control: {
              type: 'toggle',
              key: 'enableTypography'
            }
          },
          {
            name: msg.enableCodeBlocks.name,
            desc: msg.enableCodeBlocks.desc,
            control: {
              type: 'toggle',
              key: 'enableCodeBlocks'
            }
          },
          {
            name: msg.enableContainers.name,
            desc: msg.enableContainers.desc,
            control: {
              type: 'toggle',
              key: 'enableContainers'
            }
          },
          {
            name: msg.codeBlockRadius.name,
            desc: msg.codeBlockRadius.desc,
            control: {
              type: 'slider',
              key: 'codeBlockRadius',
              min: 0,
              max: 16,
              step: 1
            }
          }
        ]
      },
      {
        type: 'group',
        heading: msg.groups.codeBlocks,
        items: [
          {
            name: msg.showCodeLineNumbers.name,
            desc: msg.showCodeLineNumbers.desc,
            control: {
              type: 'toggle',
              key: 'showCodeLineNumbers',
              disabled: () => !this.plugin.settings.enableCodeBlocks
            }
          },
          {
            name: msg.enableCodeLineAnnotations.name,
            desc: msg.enableCodeLineAnnotations.desc,
            control: {
              type: 'toggle',
              key: 'enableCodeLineAnnotations',
              disabled: () => !this.plugin.settings.enableCodeBlocks
            }
          }
        ]
      },
      {
        type: 'group',
        heading: msg.groups.features,
        items: [
          {
            name: msg.enableContainerParser.name,
            desc: msg.enableContainerParser.desc,
            control: {
              type: 'toggle',
              key: 'enableContainerParser'
            }
          },
          {
            name: msg.enableLinkProcessing.name,
            desc: msg.enableLinkProcessing.desc,
            control: {
              type: 'toggle',
              key: 'enableLinkProcessing'
            }
          },
          {
            name: msg.enableExternalLinkFavicon.name,
            desc: msg.enableExternalLinkFavicon.desc,
            control: {
              type: 'toggle',
              key: 'enableExternalLinkFavicon',
              disabled: () => !this.plugin.settings.enableLinkProcessing
            }
          },
          {
            name: msg.enableRelativeLinkResolution.name,
            desc: msg.enableRelativeLinkResolution.desc,
            control: {
              type: 'toggle',
              key: 'enableRelativeLinkResolution',
              disabled: () => !this.plugin.settings.enableLinkProcessing
            }
          },
          {
            name: msg.enableBadgeProcessor.name,
            desc: msg.enableBadgeProcessor.desc,
            control: {
              type: 'toggle',
              key: 'enableBadgeProcessor'
            }
          },
          {
            name: msg.enableEmojiProcessor.name,
            desc: msg.enableEmojiProcessor.desc,
            control: {
              type: 'toggle',
              key: 'enableEmojiProcessor'
            }
          }
        ]
      },
      {
        type: 'group',
        heading: msg.groups.advanced,
        items: [
          {
            name: msg.debugMode.name,
            desc: msg.debugMode.desc,
            control: {
              type: 'toggle',
              key: 'debugMode'
            }
          },
          {
            name: msg.reloadStyles.name,
            desc: msg.reloadStyles.desc,
            render: (setting) => {
              setting.addButton((button) =>
                button.setButtonText(msg.reloadStyles.button).onClick(() => {
                  this.plugin.updateTheme()
                  this.plugin.rerenderMarkdownViews()
                })
              )
            }
          },
          {
            name: msg.resetDefaults.name,
            desc: msg.resetDefaults.desc,
            render: (setting) => {
              setting.addButton((button) =>
                button
                  .setWarning()
                  .setButtonText(msg.resetDefaults.button)
                  .onClick(async () => {
                    this.plugin.settings = { ...DEFAULT_SETTINGS }
                    await this.plugin.saveSettings()
                    this.plugin.updateTheme()
                    this.plugin.rerenderMarkdownViews()
                    this.update()
                    new Notice(msg.resetDefaults.notice)
                  })
              )
            }
          }
        ]
      }
    ]
  }

  display(): void {
    const { containerEl } = this
    containerEl.empty()

    const msg = this.plugin.getMessages().settings

    // General
    new SettingGroup(containerEl).setHeading(msg.groups.general).addSetting((setting) => {
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
              this.plugin.updateTheme()
              await this.plugin.saveSettings()
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
              this.plugin.updateTheme()
              await this.plugin.saveSettings()
            })
          )
          .setDisabled(this.plugin.settings.followObsidianTheme)
      })

    // Styles
    new SettingGroup(containerEl)
      .setHeading(msg.groups.styles)
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
      .addSetting((setting) => {
        setting
          .setName(msg.enableCodeLineAnnotations.name)
          .setDesc(msg.enableCodeLineAnnotations.desc)
          .addToggle((toggle) =>
            toggle.setValue(this.plugin.settings.enableCodeLineAnnotations).onChange(async (value) => {
              this.plugin.settings.enableCodeLineAnnotations = value
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
              this.plugin.updateTheme()
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
              this.plugin.updateTheme()
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
