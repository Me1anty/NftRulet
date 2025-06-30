import React, { useState, useEffect } from 'react'
import UserProfile from './components/UserProfile'
import StrictRouletteScreen from './components/StrictRouletteScreen'
import BottomNavigation, { type NavigationTab } from './components/BottomNavigation'
import type { TelegramWebApp, WebAppUser } from './types/telegram'
import type { Gift } from './utils/giftImages'
import './App.css'

const App: React.FC = () => {
  const [user, setUser] = useState<WebAppUser | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  // Navigation state
  const [activeTab, setActiveTab] = useState<NavigationTab>('roulette')
  
  // Game state
  const [spinsLeft, setSpinsLeft] = useState(2)
  const [wonGifts, setWonGifts] = useState<Gift[]>([])

  useEffect(() => {
    // Инициализация Telegram WebApp
    const initTelegramWebApp = () => {
      try {
        if (window.Telegram?.WebApp) {
          const tg = window.Telegram.WebApp
          setWebApp(tg)

          // Настройка WebApp
          tg.ready()
          tg.expand()

          // Принудительно устанавливаем темную тему для строгого дизайна
          document.documentElement.setAttribute('data-theme', 'dark')
          document.body.style.backgroundColor = '#000000'

          // Установка CSS переменных для черно-белой темы
          const root = document.documentElement
          root.style.setProperty('--tg-theme-bg-color', '#000000')
          root.style.setProperty('--tg-theme-text-color', '#ffffff')
          root.style.setProperty('--tg-theme-hint-color', '#9ca3af')
          root.style.setProperty('--tg-theme-link-color', '#ffffff')
          root.style.setProperty('--tg-theme-button-color', '#ffffff')
          root.style.setProperty('--tg-theme-button-text-color', '#000000')
          root.style.setProperty('--tg-theme-secondary-bg-color', '#1f2937')

          // Получение данных пользователя
          if (tg.initDataUnsafe?.user) {
            setUser(tg.initDataUnsafe.user)
          } else {
            // Fallback для разработки
            if (import.meta.env.DEV) {
              setUser({
                id: 12345678,
                first_name: 'Developer',
                last_name: 'Mode',
                username: 'dev_user',
                language_code: 'ru',
                is_premium: true,
              })
            }
          }

          // Настройка главной кнопки (скрываем для рулетки)
          tg.MainButton.hide()

          // Haptic feedback при загрузке
          tg.HapticFeedback.impactOccurred('medium')

          console.log('Telegram WebApp initialized successfully')
          console.log('Platform:', tg.platform)
          console.log('Version:', tg.version)
          console.log('Color scheme: forced dark for strict design')
        } else {
          throw new Error('Telegram WebApp not available')
        }
      } catch (err) {
        console.error('Failed to initialize Telegram WebApp:', err)
        setError('Не удалось инициализировать Telegram WebApp')
        
        // Fallback для разработки вне Telegram
        if (import.meta.env.DEV) {
          // Принудительно устанавливаем черную тему
          document.documentElement.setAttribute('data-theme', 'dark')
          document.body.style.backgroundColor = '#000000'
          
          setUser({
            id: 12345678,
            first_name: 'Test',
            last_name: 'User',
            username: 'testuser',
            language_code: 'ru',
            is_premium: false,
          })
        }
      } finally {
        // Симуляция загрузки
        setTimeout(() => {
          setIsLoading(false)
        }, 1500)
      }
    }

    initTelegramWebApp()

    // Cleanup при размонтировании
    return () => {
      if (webApp) {
        webApp.MainButton.hide()
      }
    }
  }, [])

  // Game handlers
  const handleSpinUsed = () => {
    setSpinsLeft(prev => Math.max(0, prev - 1))
  }

  const handleGiftWon = (gift: Gift) => {
    setWonGifts(prev => [...prev, gift])
  }

  const handleTabChange = (tab: NavigationTab) => {
    setActiveTab(tab)
  }

  // Обработчик отправки данных в бот
  const sendDataToBot = (data: any) => {
    if (webApp) {
      webApp.sendData(JSON.stringify({
        action: 'user_interaction',
        timestamp: Date.now(),
        data: data
      }))
      webApp.HapticFeedback.notificationOccurred('success')
    }
  }

  if (error && !import.meta.env.DEV) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-black">
        <div className="text-center space-y-4 max-w-sm">
          <div className="text-4xl mb-4">⚠</div>
          <h1 className="text-xl font-bold text-white tracking-wider">ERROR</h1>
          <p className="text-gray-400 text-sm tracking-wide">
            {error}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="border-2 border-white text-white font-bold py-2 px-6 tracking-wider hover:bg-white hover:text-black transition-all duration-300"
          >
            RETRY
          </button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div className="space-y-2">
            <p className="text-white font-bold tracking-wider">LOADING ROULETTE</p>
            <p className="text-gray-400 text-sm tracking-wide">CONNECTING TO TELEGRAM</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Content */}
      <div className="pb-16"> {/* Padding for bottom navigation */}
        {activeTab === 'roulette' ? (
          <StrictRouletteScreen
            spinsLeft={spinsLeft}
            onSpinUsed={handleSpinUsed}
            onGiftWon={handleGiftWon}
          />
        ) : (
          <div className="min-h-screen flex flex-col justify-center bg-black">
            <UserProfile 
              user={user} 
              isLoading={false} 
              onSendData={sendDataToBot}
              wonGifts={wonGifts}
              spinsLeft={spinsLeft}
            />
          </div>
        )}
      </div>

      {/* Bottom Navigation - обновим для строгого стиля */}
      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 z-40">
        <div className="flex items-center justify-around py-3">
          
          {/* Roulette Tab */}
          <button
            onClick={() => handleTabChange('roulette')}
            className={`flex flex-col items-center justify-center p-3 transition-all duration-200 ${
              activeTab === 'roulette'
                ? 'text-white' 
                : 'text-gray-600 hover:text-gray-400'
            }`}
          >
            <div className="relative mb-1">
              <span className="text-xl">🎰</span>
              
              {spinsLeft > 0 && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                  <span className="text-black text-xs font-bold">
                    {spinsLeft > 9 ? '9+' : spinsLeft}
                  </span>
                </div>
              )}
            </div>
            
            <span className="text-xs font-bold tracking-wider">
              ROULETTE
            </span>

            {activeTab === 'roulette' && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-white"></div>
            )}
          </button>

          {/* Profile Tab */}
          <button
            onClick={() => handleTabChange('profile')}
            className={`flex flex-col items-center justify-center p-3 transition-all duration-200 ${
              activeTab === 'profile'
                ? 'text-white' 
                : 'text-gray-600 hover:text-gray-400'
            }`}
          >
            <div className="mb-1">
              <span className="text-xl">👤</span>
            </div>
            
            <span className="text-xs font-bold tracking-wider">
              PROFILE
            </span>

            {activeTab === 'profile' && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-white"></div>
            )}
          </button>

        </div>
      </div>

      {/* Development info */}
      {import.meta.env.DEV && (
        <div className="fixed top-4 right-4 bg-gray-900 border border-gray-700 rounded p-3 text-xs text-gray-400 max-w-xs z-50">
          <p><strong className="text-white">DEV MODE</strong></p>
          <p>WebApp: {webApp ? '✅' : '❌'}</p>
          <p>User: {user ? '✅' : '❌'}</p>
          <p>Spins: {spinsLeft}</p>
          <p>Gifts: {wonGifts.length}</p>
          <p>Theme: STRICT B&W</p>
        </div>
      )}
    </div>
  )
}

export default App