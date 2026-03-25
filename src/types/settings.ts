export interface VitePressSettings {
  enableCodeBlocks: boolean;
  enableContainers: boolean;
  enableTypography: boolean;
  enableContainerParser: boolean;
  enableLinkProcessing: boolean;
  followObsidianTheme: boolean;
  customPrimaryColor: string;
  debugMode: boolean;
}

export const DEFAULT_SETTINGS: VitePressSettings = {
  enableCodeBlocks: true,
  enableContainers: true,
  enableTypography: true,
  enableContainerParser: true,
  enableLinkProcessing: true,
  followObsidianTheme: true,
  customPrimaryColor: '#3451b2',
  debugMode: false,
};