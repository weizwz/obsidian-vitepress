import type { LocaleMessages } from './en'

export const zh: LocaleMessages = {
  settings: {
    groups: {
      general: '通用',
      styles: '样式',
      codeBlocks: '代码块',
      features: '功能解析',
      appearance: '外观主题',
      advanced: '高级'
    },
    language: {
      name: '显示语言',
      desc: '选择插件界面与提示容器默认标题的语言',
      options: {
        auto: '跟随 Obsidian',
        en: 'English',
        zh: '简体中文'
      }
    },
    enableCodeBlocks: {
      name: '启用代码块样式',
      desc: '应用 VitePress 风格代码块（窗口顶栏、语言标签与代码组）'
    },
    enableContainers: {
      name: '启用容器样式',
      desc: '应用 VitePress 风格提示容器与折叠容器样式'
    },
    enableTypography: {
      name: '启用排版样式',
      desc: '应用 VitePress 排版规范（标题、链接、列表与行高）'
    },
    codeBlockRadius: {
      name: '代码块圆角',
      desc: '设置代码块与代码组容器的圆角大小（px）'
    },
    showCodeLineNumbers: {
      name: '显示代码行号',
      desc: '在阅读模式下为代码块左侧显示行号'
    },
    enableContainerParser: {
      name: '解析 VitePress 容器',
      desc: '将 ::: 语法解析并渲染为提示容器、折叠块和代码组'
    },
    enableLinkProcessing: {
      name: '处理链接',
      desc: '增强外部链接与 VitePress 风格内部链接'
    },
    enableExternalLinkFavicon: {
      name: '显示外链图标',
      desc: '通过 favicon.im 为外部链接自动加载站点图标'
    },
    enableRelativeLinkResolution: {
      name: '解析相对路径与行号链接',
      desc: '支持 VitePress 风格的相对路径和 #L10-L15 行号链接'
    },
    enableBadgeProcessor: {
      name: '解析 VitePress 徽章',
      desc: '将 <Badge /> 语法解析并渲染为行内徽章'
    },
    enableEmojiProcessor: {
      name: '解析 VitePress 表情',
      desc: '将 :emoji: 短代码解析为对应表情符号'
    },
    followObsidianTheme: {
      name: '跟随 Obsidian 主题色',
      desc: '自动使用 Obsidian 当前强调色作为品牌主色'
    },
    customPrimaryColor: {
      name: '自定义品牌主色',
      desc: '关闭跟随主题色时使用的自定义品牌颜色'
    },
    debugMode: {
      name: '调试模式',
      desc: '在开发者控制台输出调试日志'
    },
    reloadStyles: {
      name: '重新加载样式',
      desc: '重新应用主题样式并刷新已打开的 Markdown 预览视图',
      button: '重新加载'
    },
    resetDefaults: {
      name: '恢复默认配置',
      desc: '将所有配置项重置为初始默认值',
      button: '重置',
      notice: 'VitePress Theme 已恢复默认配置'
    }
  },
  containers: {
    info: '提示',
    note: '注意',
    tip: '建议',
    important: '重要',
    warning: '警告',
    danger: '危险',
    caution: '警告',
    details: '详细信息'
  }
}
