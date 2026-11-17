export interface LocaleMessages {
  settings: {
    groups: {
      general: string
      styles: string
      codeBlocks: string
      features: string
      appearance: string
      advanced: string
    }
    language: {
      name: string
      desc: string
      options: {
        auto: string
        en: string
        zh: string
      }
    }
    enableCodeBlocks: {
      name: string
      desc: string
    }
    enableContainers: {
      name: string
      desc: string
    }
    enableTypography: {
      name: string
      desc: string
    }
    codeBlockRadius: {
      name: string
      desc: string
    }
    showCodeLineNumbers: {
      name: string
      desc: string
    }
    enableCodeLineAnnotations: {
      name: string
      desc: string
    }
    enableContainerParser: {
      name: string
      desc: string
    }
    enableLinkProcessing: {
      name: string
      desc: string
    }
    enableExternalLinkFavicon: {
      name: string
      desc: string
    }
    enableRelativeLinkResolution: {
      name: string
      desc: string
    }
    enableBadgeProcessor: {
      name: string
      desc: string
    }
    enableEmojiProcessor: {
      name: string
      desc: string
    }
    followObsidianTheme: {
      name: string
      desc: string
    }
    customPrimaryColor: {
      name: string
      desc: string
    }
    debugMode: {
      name: string
      desc: string
    }
    reloadStyles: {
      name: string
      desc: string
      button: string
    }
    resetDefaults: {
      name: string
      desc: string
      button: string
      notice: string
    }
  }
  containers: {
    info: string
    note: string
    tip: string
    important: string
    warning: string
    danger: string
    caution: string
    details: string
  }
}

export const en: LocaleMessages = {
  settings: {
    groups: {
      general: 'General',
      styles: 'Styles',
      codeBlocks: 'Code blocks',
      features: 'Features',
      appearance: 'Appearance',
      advanced: 'Advanced'
    },
    language: {
      name: 'Display language',
      desc: 'Choose the language for plugin interface and container labels',
      options: {
        auto: 'Follow Obsidian',
        en: 'English',
        zh: '简体中文'
      }
    },
    enableCodeBlocks: {
      name: 'Enable code block styles',
      desc: 'Apply VitePress-style code blocks with window header and language labels'
    },
    enableContainers: {
      name: 'Enable container styles',
      desc: 'Apply VitePress-style containers (tip, warning, danger, details)'
    },
    enableTypography: {
      name: 'Enable typography styles',
      desc: 'Apply VitePress typography (headings, links, lists)'
    },
    codeBlockRadius: {
      name: 'Code block corner radius',
      desc: 'Border radius in pixels for code blocks and code groups'
    },
    showCodeLineNumbers: {
      name: 'Show line numbers',
      desc: 'Display line numbers alongside code blocks in reading view'
    },
    enableCodeLineAnnotations: {
      name: 'Code line highlights and annotations',
      desc: 'Support {1,3-5} line highlights and [!code focus/++/--/error/warning] markers'
    },
    enableContainerParser: {
      name: 'Parse VitePress containers',
      desc: 'Convert ::: syntax to styled containers and code groups'
    },
    enableLinkProcessing: {
      name: 'Process links',
      desc: 'Enhance external and VitePress-style internal links'
    },
    enableExternalLinkFavicon: {
      name: 'Show external link favicons',
      desc: 'Fetch site favicons for external links via favicon.im'
    },
    enableRelativeLinkResolution: {
      name: 'Resolve relative links',
      desc: 'Resolve VitePress-style relative paths and line highlight links'
    },
    enableBadgeProcessor: {
      name: 'Parse VitePress badges',
      desc: 'Convert <Badge /> syntax to styled inline badges'
    },
    enableEmojiProcessor: {
      name: 'Parse VitePress emojis',
      desc: 'Convert :emoji: shortcodes to emoji icons'
    },
    followObsidianTheme: {
      name: 'Follow Obsidian theme',
      desc: 'Automatically adapt brand colors to match Obsidian accent color'
    },
    customPrimaryColor: {
      name: 'Custom primary color',
      desc: 'Brand color for links and accents when not following Obsidian theme'
    },
    debugMode: {
      name: 'Debug mode',
      desc: 'Enable debug logging in the developer console'
    },
    reloadStyles: {
      name: 'Reload styles',
      desc: 'Reapply theme classes and refresh rendered markdown views',
      button: 'Reload'
    },
    resetDefaults: {
      name: 'Reset to defaults',
      desc: 'Restore all options to their default values',
      button: 'Reset',
      notice: 'VitePress Theme options reset to defaults'
    }
  },
  containers: {
    info: 'Info',
    note: 'Note',
    tip: 'Tip',
    important: 'Important',
    warning: 'Warning',
    danger: 'Danger',
    caution: 'Caution',
    details: 'Details'
  }
}
