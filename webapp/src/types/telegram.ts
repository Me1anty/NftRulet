// Telegram WebApp API Types for TypeScript

export interface TelegramWebApp {
    // Basic methods
    ready: () => void
    close: () => void
    expand: () => void
    
    // UI Components
    MainButton: MainButton
    BackButton: BackButton
    HapticFeedback: HapticFeedback
    
    // Data
    initData: string
    initDataUnsafe: WebAppInitData
    version: string
    platform: string
    colorScheme: 'light' | 'dark'
    themeParams: ThemeParams
    
    // Viewport
    isExpanded: boolean
    viewportHeight: number
    viewportStableHeight: number
    headerColor: string
    backgroundColor: string
    isClosingConfirmationEnabled: boolean
    
    // Events
    onEvent: (eventType: string, eventHandler: () => void) => void
    offEvent: (eventType: string, eventHandler: () => void) => void
    
    // Data exchange
    sendData: (data: string) => void
    
    // Popups
    showPopup: (params: PopupParams) => void
    showAlert: (message: string) => void
    showConfirm: (message: string) => void
    
    // Settings
    enableClosingConfirmation: () => void
    disableClosingConfirmation: () => void
    
    // Advanced
    openLink: (url: string) => void
    openTelegramLink: (url: string) => void
    openInvoice: (url: string) => void
  }
  
  export interface WebAppInitData {
    query_id?: string
    user?: WebAppUser
    receiver?: WebAppUser
    chat?: WebAppChat
    chat_type?: string
    chat_instance?: string
    start_param?: string
    can_send_after?: number
    auth_date: number
    hash: string
  }
  
  export interface WebAppUser {
    id: number
    is_bot?: boolean
    first_name: string
    last_name?: string
    username?: string
    language_code?: string
    is_premium?: boolean
    photo_url?: string
    allows_write_to_pm?: boolean
  }
  
  export interface WebAppChat {
    id: number
    type: 'group' | 'supergroup' | 'channel'
    title: string
    username?: string
    photo_url?: string
  }
  
  export interface ThemeParams {
    bg_color?: string
    text_color?: string
    hint_color?: string
    link_color?: string
    button_color?: string
    button_text_color?: string
    secondary_bg_color?: string
    header_bg_color?: string
    accent_text_color?: string
    section_bg_color?: string
    section_header_text_color?: string
    subtitle_text_color?: string
    destructive_text_color?: string
  }
  
  export interface MainButton {
    text: string
    color: string
    textColor: string
    isVisible: boolean
    isActive: boolean
    isProgressVisible: boolean
    setText: (text: string) => void
    onClick: (callback: () => void) => void
    offClick: (callback: () => void) => void
    show: () => void
    hide: () => void
    enable: () => void
    disable: () => void
    showProgress: (leaveActive?: boolean) => void
    hideProgress: () => void
    setParams: (params: MainButtonParams) => void
  }
  
  export interface MainButtonParams {
    text?: string
    color?: string
    text_color?: string
    is_active?: boolean
    is_visible?: boolean
  }
  
  export interface BackButton {
    isVisible: boolean
    onClick: (callback: () => void) => void
    offClick: (callback: () => void) => void
    show: () => void
    hide: () => void
  }
  
  export interface HapticFeedback {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void
    selectionChanged: () => void
  }
  
  export interface PopupParams {
    title?: string
    message: string
    buttons?: PopupButton[]
  }
  
  export interface PopupButton {
    id?: string
    type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive'
    text?: string
  }
  
  // Additional types for better development experience
  export interface WebAppEventMap {
    'themeChanged': () => void
    'viewportChanged': () => void
    'mainButtonClicked': () => void
    'backButtonClicked': () => void
    'settingsButtonClicked': () => void
    'invoiceClosed': (params: { url: string; status: string }) => void
    'popupClosed': (params: { button_id?: string }) => void
    'qrTextReceived': (params: { data: string }) => void
    'clipboardTextReceived': (params: { data: string }) => void
    'writeAccessRequested': () => void
    'contactRequested': () => void
  }
  
  export type WebAppEventType = keyof WebAppEventMap
  
  // Platform detection
  export type TelegramPlatform = 
    | 'android' 
    | 'android_x' 
    | 'ios' 
    | 'macos' 
    | 'tdesktop' 
    | 'weba' 
    | 'webk' 
    | 'unigram' 
    | 'web'
    | 'unknown'
  
  // Color scheme
  export type ColorScheme = 'light' | 'dark'
  
  // Utility types
  export interface WebAppEnvironment {
    isWebApp: boolean
    isTelegramDesktop: boolean
    isTelegramMobile: boolean
    isTelegramWeb: boolean
    platform: TelegramPlatform
    version: string
    colorScheme: ColorScheme
  }
  
  // Data structures for communication with bot
  export interface WebAppMessage {
    type: string
    payload?: any
    timestamp: number
    user_id?: number
  }
  
  export interface UserInteractionData {
    action: string
    data?: any
    timestamp: number
    session_id?: string
  }
  
  // Global window interface extension
  declare global {
    interface Window {
      Telegram?: {
        WebApp: TelegramWebApp
      }
    }
  }
  
  // Export utility functions types
  export interface TelegramUtils {
    isAvailable: () => boolean
    getUser: () => WebAppUser | undefined
    getTheme: () => ThemeParams
    sendHaptic: (type: 'light' | 'medium' | 'heavy') => void
    sendNotification: (type: 'success' | 'error' | 'warning') => void
    detectPlatform: () => TelegramPlatform
    getEnvironment: () => WebAppEnvironment
  }