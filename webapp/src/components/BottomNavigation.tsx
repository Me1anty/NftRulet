import React from 'react'

export type NavigationTab = 'roulette' | 'profile'

interface BottomNavigationProps {
  activeTab: NavigationTab
  onTabChange: (tab: NavigationTab) => void
  spinsLeft?: number
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ 
  activeTab, 
  onTabChange,
  spinsLeft = 0
}) => {
  const handleTabClick = (tab: NavigationTab) => {
    if (activeTab !== tab) {
      // Haptic feedback
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.HapticFeedback.selectionChanged()
      }
      onTabChange(tab)
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-telegram-bg border-t border-white/10 safe-area-pb z-40">
      <div className="flex items-center justify-around py-2">
        
        {/* Roulette Tab */}
        <button
          onClick={() => handleTabClick('roulette')}
          className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-200 relative ${
            activeTab === 'roulette'
              ? 'text-telegram-button bg-telegram-button/10' 
              : 'text-telegram-hint hover:text-telegram-text'
          }`}
        >
          {/* Icon */}
          <div className="relative mb-1">
            <span className="text-2xl">🎰</span>
            
            {/* Spins Badge */}
            {spinsLeft > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {spinsLeft > 9 ? '9+' : spinsLeft}
                </span>
              </div>
            )}
          </div>
          
          {/* Label */}
          <span className="text-xs font-medium">
            Roulette
          </span>

          {/* Active Indicator */}
          {activeTab === 'roulette' && (
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-telegram-button rounded-full"></div>
          )}
        </button>

        {/* Profile Tab */}
        <button
          onClick={() => handleTabClick('profile')}
          className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-200 relative ${
            activeTab === 'profile'
              ? 'text-telegram-button bg-telegram-button/10' 
              : 'text-telegram-hint hover:text-telegram-text'
          }`}
        >
          {/* Icon */}
          <div className="mb-1">
            <span className="text-2xl">👤</span>
          </div>
          
          {/* Label */}
          <span className="text-xs font-medium">
            Profile
          </span>

          {/* Active Indicator */}
          {activeTab === 'profile' && (
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-telegram-button rounded-full"></div>
          )}
        </button>

      </div>

      {/* Safe area padding for devices with home indicator */}
      <div className="h-safe-area-inset-bottom"></div>
    </div>
  )
}

export default BottomNavigation