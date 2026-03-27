import { App, PluginSettingTab, Setting } from 'obsidian';
import type VitePressThemePlugin from './main';
import { VitePressSettings, DEFAULT_SETTINGS } from './types/settings';

export class VitePressSettingTab extends PluginSettingTab {
  plugin: VitePressThemePlugin;

  constructor(app: App, plugin: VitePressThemePlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl('h2', { text: 'VitePress Theme Settings' });

    // Style Settings
    containerEl.createEl('h3', { text: 'Style Options' });

    new Setting(containerEl)
      .setName('Enable code block styles')
      .setDesc('Apply VitePress-style code blocks with copy button and language labels')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.enableCodeBlocks)
        .onChange(async (value) => {
          this.plugin.settings.enableCodeBlocks = value;
          await this.plugin.saveSettings();
          this.plugin.applyStyles();
        }));

    new Setting(containerEl)
      .setName('Enable container styles')
      .setDesc('Apply VitePress-style containers (tip, warning, danger)')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.enableContainers)
        .onChange(async (value) => {
          this.plugin.settings.enableContainers = value;
          await this.plugin.saveSettings();
          this.plugin.applyStyles();
        }));

    new Setting(containerEl)
      .setName('Enable typography styles')
      .setDesc('Apply VitePress typography (headings, links, lists)')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.enableTypography)
        .onChange(async (value) => {
          this.plugin.settings.enableTypography = value;
          await this.plugin.saveSettings();
          this.plugin.applyStyles();
        }));

    // Feature Settings
    containerEl.createEl('h3', { text: 'Features' });

    new Setting(containerEl)
      .setName('Parse VitePress containers')
      .setDesc('Convert ::: syntax to styled containers')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.enableContainerParser)
        .onChange(async (value) => {
          this.plugin.settings.enableContainerParser = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Process links')
      .setDesc('Add external link icons and handle VitePress-style links')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.enableLinkProcessing)
        .onChange(async (value) => {
          this.plugin.settings.enableLinkProcessing = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Parse VitePress badges')
      .setDesc('Convert <Badge /> syntax to styled badges')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.enableBadgeProcessor)
        .onChange(async (value) => {
          this.plugin.settings.enableBadgeProcessor = value;
          await this.plugin.saveSettings();
        }));

    new Setting(containerEl)
      .setName('Parse VitePress emojis')
      .setDesc('Convert :emoji: syntax to icons')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.enableEmojiProcessor)
        .onChange(async (value) => {
          this.plugin.settings.enableEmojiProcessor = value;
          await this.plugin.saveSettings();
        }));

    // Theme Settings
    containerEl.createEl('h3', { text: 'Theme' });

    new Setting(containerEl)
      .setName('Follow Obsidian theme')
      .setDesc('Automatically adapt colors to match Obsidian theme')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.followObsidianTheme)
        .onChange(async (value) => {
          this.plugin.settings.followObsidianTheme = value;
          await this.plugin.saveSettings();
          this.plugin.applyStyles();
        }));

    new Setting(containerEl)
      .setName('Custom primary color')
      .setDesc('Brand color for links and accents (when not following theme)')
      .addColorPicker(color => color
        .setValue(this.plugin.settings.customPrimaryColor)
        .onChange(async (value) => {
          this.plugin.settings.customPrimaryColor = value;
          await this.plugin.saveSettings();
          this.plugin.applyStyles();
        }))
      .setDisabled(this.plugin.settings.followObsidianTheme);

    // Debug
    containerEl.createEl('h3', { text: 'Debug' });

    new Setting(containerEl)
      .setName('Debug mode')
      .setDesc('Enable console logging for debugging')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.debugMode)
        .onChange(async (value) => {
          this.plugin.settings.debugMode = value;
          await this.plugin.saveSettings();
        }));

    // Actions
    containerEl.createEl('h3', { text: 'Actions' });

    new Setting(containerEl)
      .setName('Reload styles')
      .setDesc('Force reload of all styles')
      .addButton(button => button
        .setButtonText('Reload')
        .onClick(() => {
          this.plugin.applyStyles();
        }));
  }
}