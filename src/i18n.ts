import type { PluginCategory } from "./lib/plugin-registry";

export type Locale = "en" | "zh";

interface Messages {
  metaTitle: string;
  metaDescription: string;
  pluginsMetaTitle: string;
  pluginsMetaDescription: string;
  themesMetaTitle: string;
  themesMetaDescription: string;
  brand: string;
  docs: string;
  submit: string;
  language: string;
  titleLead: string;
  titleAccent: string;
  pluginsTitleLead: string;
  pluginsTitleAccent: string;
  themesTitleLead: string;
  themesTitleAccent: string;
  searchLabel: string;
  searchPlaceholder: string;
  searchPluginsPlaceholder: string;
  searchThemesPlaceholder: string;
  tabsLabel: string;
  tabAll: string;
  tabPlugins: string;
  tabThemes: string;
  pluginsTitle: string;
  pluginsSubtitle: string;
  themesTitle: string;
  themesSubtitle: string;
  pluginCount: (count: number) => string;
  themeCount: (count: number) => string;
  combinedCount: (plugins: number, themes: number) => string;
  viewAllPlugins: string;
  viewAllThemes: string;
  catalog: string;
  noResultsTitle: string;
  noResultsBody: string;
  unavailableTitle: string;
  unavailableBody: string;
  openRegistry: string;
}

export const messages: Record<Locale, Messages> = {
  en: {
    metaTitle: "Eidos Community · Plugins & Themes",
    metaDescription: "Discover community plugins and themes for Eidos Lite and eidos serve.",
    pluginsMetaTitle: "Plugins · Eidos Community",
    pluginsMetaDescription: "Discover interactive views, editors, and automations for Eidos Lite and eidos serve.",
    themesMetaTitle: "Themes · Eidos Community",
    themesMetaDescription: "Discover visual palettes, typography, and styling for Eidos Lite.",
    brand: "Eidos",
    docs: "Developer docs",
    submit: "Submit a plugin",
    language: "Language",
    titleLead: "Apps for",
    titleAccent: "files you own.",
    pluginsTitleLead: "Apps for",
    pluginsTitleAccent: "files you own.",
    themesTitleLead: "Themes for",
    themesTitleAccent: "files you own.",
    searchLabel: "Search plugins and themes",
    searchPlaceholder: "Search plugins and themes",
    searchPluginsPlaceholder: "Search plugins",
    searchThemesPlaceholder: "Search themes",
    tabsLabel: "Filter by type",
    tabAll: "All",
    tabPlugins: "Plugins",
    tabThemes: "Themes",
    pluginsTitle: "Plugins",
    pluginsSubtitle: "Interactive views, editors, and automations for your files",
    themesTitle: "Themes",
    themesSubtitle: "Personalize colors, typography, and styling for Eidos Lite",
    pluginCount: (count) => `${count} ${count === 1 ? "plugin" : "plugins"}`,
    themeCount: (count) => `${count} ${count === 1 ? "theme" : "themes"}`,
    combinedCount: (plugins, themes) =>
      `${plugins} ${plugins === 1 ? "plugin" : "plugins"}, ${themes} ${themes === 1 ? "theme" : "themes"}`,
    viewAllPlugins: "View all plugins →",
    viewAllThemes: "View all themes →",
    catalog: "Catalog",
    noResultsTitle: "No results found",
    noResultsBody: "Try another name, capability, or keyword.",
    unavailableTitle: "The catalog is temporarily unavailable.",
    unavailableBody: "You can inspect the registry directly on GitHub.",
    openRegistry: "Open registry",
  },
  zh: {
    metaTitle: "Eidos 社区 · 插件与主题",
    metaDescription: "发现适用于 Eidos Lite 与 eidos serve 的社区插件与外观主题。",
    pluginsMetaTitle: "功能插件 · Eidos 社区",
    pluginsMetaDescription: "发现适用于 Eidos Lite 与 eidos serve 的功能扩展与自动化插件。",
    themesMetaTitle: "外观主题 · Eidos 社区",
    themesMetaDescription: "发现适用于 Eidos Lite 的外观主题、配色与排版字体。",
    brand: "Eidos",
    docs: "开发文档",
    submit: "提交插件",
    language: "语言",
    titleLead: "为自己的文件，",
    titleAccent: "找到更多可能。",
    pluginsTitleLead: "为自己的文件，",
    pluginsTitleAccent: "找到更多可能。",
    themesTitleLead: "随心定制，",
    themesTitleAccent: "属于你的视觉风格。",
    searchLabel: "搜索插件与主题",
    searchPlaceholder: "搜索插件与主题",
    searchPluginsPlaceholder: "搜索功能插件",
    searchThemesPlaceholder: "搜索外观主题",
    tabsLabel: "按类型筛选",
    tabAll: "全部",
    tabPlugins: "插件",
    tabThemes: "主题",
    pluginsTitle: "功能插件",
    pluginsSubtitle: "为你的笔记与表格带来丰富的扩展视图与自动化工具",
    themesTitle: "外观主题",
    themesSubtitle: "为 Eidos Lite 带来不同配色、排版字体与界面质感",
    pluginCount: (count) => `${count} 个插件`,
    themeCount: (count) => `${count} 款主题`,
    combinedCount: (plugins, themes) => `${plugins} 个插件，${themes} 款主题`,
    viewAllPlugins: "浏览全部插件 →",
    viewAllThemes: "浏览全部主题 →",
    catalog: "目录",
    noResultsTitle: "没有找到结果",
    noResultsBody: "试试其他名称、能力或关键词。",
    unavailableTitle: "暂时无法读取插件与主题目录。",
    unavailableBody: "你仍然可以前往 GitHub 查看注册表。",
    openRegistry: "打开注册表",
  },
};

interface FooterMessages {
  description: string;
  product: string;
  developers: string;
  ecosystem: string;
  project: string;
  sync: string;
  publish: string;
  pricing: string;
  webEditor: string;
  download: string;
  changelog: string;
  documentation: string;
  buildGuide: string;
  pluginGuide: string;
  pluginTemplate: string;
  fileSpec: string;
  versionControl: string;
  support: string;
  privacy: string;
  terms: string;
  openFormat: string;
  localFirst: string;
  fileOwnership: string;
}

export const footerMessages: Record<Locale, FooterMessages> = {
  en: {
    description: "Eidos brings documents, data, and tools together around files you own.",
    product: "Product",
    developers: "Developers",
    ecosystem: "Ecosystem",
    project: "Project",
    sync: "Sync",
    publish: "Publish",
    pricing: "Pricing",
    webEditor: "Web Editor",
    download: "Download",
    changelog: "Changelog",
    documentation: "Documentation",
    buildGuide: "Build guide",
    pluginGuide: "Create a plugin",
    pluginTemplate: "Plugin template",
    fileSpec: "Eidos File spec",
    versionControl: "Version Control",
    support: "Support",
    privacy: "Privacy",
    terms: "Terms",
    openFormat: "Open format",
    localFirst: "Local-first",
    fileOwnership: "File ownership",
  },
  zh: {
    description: "Eidos 以你自己的文件为中心，连接文档、数据与工具。",
    product: "产品",
    developers: "开发者",
    ecosystem: "生态",
    project: "项目",
    sync: "Sync",
    publish: "Publish",
    pricing: "价格",
    webEditor: "Web 编辑器",
    download: "下载",
    changelog: "更新日志",
    documentation: "文档",
    buildGuide: "构建指南",
    pluginGuide: "创建插件",
    pluginTemplate: "插件模板",
    fileSpec: "Eidos File 规范",
    versionControl: "版本控制",
    support: "支持",
    privacy: "隐私",
    terms: "服务条款",
    openFormat: "开放格式",
    localFirst: "本地优先",
    fileOwnership: "文件所有权",
  },
};

export const pluginCategoryMessages = {
  en: {
    "data-visualization": "Data & visualization",
    "knowledge-and-writing": "Knowledge & writing",
    productivity: "Tools & workflows",
    automation: "Tools & workflows",
    integrations: "Tools & workflows",
    "developer-tools": "Tools & workflows",
    themes: "Themes",
    other: "Other",
  },
  zh: {
    "data-visualization": "数据与可视化",
    "knowledge-and-writing": "知识与写作",
    productivity: "工具与工作流",
    automation: "工具与工作流",
    integrations: "工具与工作流",
    "developer-tools": "工具与工作流",
    themes: "主题",
    other: "其他",
  },
} satisfies Record<Locale, Record<PluginCategory, string>>;

export const detailMessages = {
  en: {
    hooks: "File hooks",
    background: "Background service",
    backgroundSandbox: "Isolated iframe and QuickJS background sandbox",
    backgroundLifetime: "Continues after its page closes, until stopped, disabled, updated, or this Space closes.",
    startup: "Startup",
    autoStart: "Automatically when this Space opens, after approval",
    explicitStart: "Started by a plugin page or command, after approval",
    fileEvents: "File-open events",
    fileMetadata: "Paths and opening times in this Space; no file contents",
    notRequested: "Not requested",
    backgroundNetwork: "Background network access",
    pageNetwork: "Page network access",
    publicNetwork: "All public HTTPS/WSS services",
    publicPageNetwork: "All public HTTPS services",
    bluetooth: "Bluetooth",
    selectedDevice: "User-selected device",
    documentationFallback: "Documentation is unavailable in your language. Showing {locale}.",
    defaultLanguage: "the default document",
    pluginTemplate: "Plugin template",
    pluginGuide: "Create a plugin",
    back: "All plugins",
    backThemes: "All themes",
    marketplace: "Marketplace",
    themesMarketplace: "Themes",
    appProfile: "App profile",
    about: "About this app",
    aboutTheme: "About this theme",
    properties: "Properties",
    identifier: "Identifier",
    category: "Category",
    version: "Version",
    apiVersion: "API version",
    type: "Type",
    pluginType: "Plugin",
    theme: "Theme",
    compatibility: "Compatibility",
    capabilities: "Capabilities",
    views: "Views",
    actions: "Actions & commands",
    formatters: "Formatters",
    security: "Security & sandbox",
    execution: "Execution",
    sandbox: "Isolated iframe sandbox (null origin)",
    themeStyles: "Validated local styles; no executable code",
    network: "Network access",
    offline: "No network access declared",
    networkUnknown: "Network permissions unavailable",
    apiConnection: "API connection",
    configurableEndpoint: "Endpoint can be changed in connection settings",
    worker: "Dedicated worker support",
    verification: "Package verification",
    checksum: "SHA-256 verified by Eidos Lite before installation",
    resources: "Resources",
    source: "Source repository",
    install: "Install in Eidos Lite",
    release: "View release",
    read: "Read access",
    write: "Write access",
    table: "Table view",
    document: "Document view",
    page: "Workspace page",
    contribution: "Extension point",
    unavailable: "Details are unavailable for this plugin.",
    notFound: "Plugin not found",
    notFoundBody: "This plugin is not listed in the current registry.",
  },
  zh: {
    back: "全部插件",
    hooks: "文件 hook",
    background: "后台服务",
    backgroundSandbox: "独立 iframe 沙箱与 QuickJS 后台沙箱",
    backgroundLifetime: "关闭插件页面后继续运行，直到停止、禁用、更新插件或关闭此 Space。",
    startup: "启动方式",
    autoStart: "授权后，在打开此 Space 时自动启动",
    explicitStart: "授权后，由插件页面或命令启动",
    fileEvents: "文件打开事件",
    fileMetadata: "此 Space 内的文件路径与打开时间，不含文件内容",
    notRequested: "未申请",
    backgroundNetwork: "后台网络访问",
    pageNetwork: "页面网络访问",
    publicNetwork: "所有公共 HTTPS/WSS 服务",
    publicPageNetwork: "所有公共 HTTPS 服务",
    bluetooth: "蓝牙",
    selectedDevice: "用户选择的设备",
    documentationFallback: "此说明暂未提供当前语言版本，正在显示{locale}。",
    defaultLanguage: "默认文档",
    pluginTemplate: "插件模板",
    pluginGuide: "创建插件",
    backThemes: "全部主题",
    marketplace: "插件市场",
    themesMarketplace: "外观主题",
    appProfile: "应用概览",
    about: "关于此应用",
    aboutTheme: "关于此主题",
    properties: "属性",
    identifier: "标识符",
    category: "分类",
    version: "版本",
    apiVersion: "API 版本",
    type: "类型",
    pluginType: "功能插件",
    theme: "外观主题",
    compatibility: "兼容性",
    capabilities: "能力",
    views: "视图",
    actions: "操作与命令",
    formatters: "格式化工具",
    security: "安全与沙箱",
    execution: "运行环境",
    sandbox: "隔离的 iframe 沙箱（null origin）",
    themeStyles: "经校验的本地样式，不执行代码",
    network: "网络访问",
    offline: "未声明网络访问",
    networkUnknown: "暂时无法读取网络权限",
    apiConnection: "API 连接",
    configurableEndpoint: "可在连接设置中更改服务地址",
    worker: "支持独立 Worker",
    verification: "安装包验证",
    checksum: "Eidos Lite 安装前校验 SHA-256",
    resources: "资源",
    source: "源码仓库",
    install: "安装到 Eidos Lite",
    release: "查看发布版本",
    read: "只读访问",
    write: "读写访问",
    table: "表格视图",
    document: "文档视图",
    page: "工作区页面",
    contribution: "扩展能力",
    unavailable: "暂时无法读取此插件的详细信息。",
    notFound: "没有找到插件",
    notFoundBody: "当前注册表中没有这个插件。",
  },
} satisfies Record<Locale, Record<string, string>>;
