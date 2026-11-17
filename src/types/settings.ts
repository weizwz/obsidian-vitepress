import type { LanguageSetting } from '../i18n'

export interface VitePressSettings {
  language: LanguageSetting

  enableCodeBlocks: boolean
  enableContainers: boolean
  enableTypography: boolean
  codeBlockRadius: number

  showCodeLineNumbers: boolean
  enableCodeLineAnnotations: boolean

  enableContainerParser: boolean
  enableLinkProcessing: boolean
  enableExternalLinkFavicon: boolean
  enableRelativeLinkResolution: boolean
  enableBadgeProcessor: boolean
  enableEmojiProcessor: boolean

  followObsidianTheme: boolean
  customPrimaryColor: string

  debugMode: boolean
}

export const DEFAULT_SETTINGS: VitePressSettings = {
  language: 'auto',

  enableCodeBlocks: true,
  enableContainers: true,
  enableTypography: true,
  codeBlockRadius: 8,

  showCodeLineNumbers: true,
  enableCodeLineAnnotations: true,

  enableContainerParser: true,
  enableLinkProcessing: true,
  enableExternalLinkFavicon: true,
  enableRelativeLinkResolution: true,
  enableBadgeProcessor: true,
  enableEmojiProcessor: true,

  followObsidianTheme: true,
  customPrimaryColor: '#409eff',

  debugMode: false
}
