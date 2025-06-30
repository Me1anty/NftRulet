import React, { useState, useEffect } from 'react'
import type { WebAppUser } from '../types/telegram'
import type { Gift } from '../utils/giftImages'
import { rarityColors } from '../utils/giftImages'
import '../styles/telegram.css'

interface UserProfileProps {
  user?: WebAppUser
  isLoading?: boolean
  onSendData?: (data: any) => void
  wonGifts?: Gift[]
  spinsLeft?: number
}

const UserProfile: React.FC<UserProfileProps> = ({ 
  user, 
  isLoading = false, 
  onSendData,
  wonGifts = [],
  spinsLeft = 0
}) => {
  const [imageError, setImageError] = useState(false)
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  const [buttonClicks, setButtonClicks] = useState(0)

  // Сброс состояния при изменении пользователя
  useEffect(() => {
    setImageError(false)
    setIsImageLoaded(false)
  }, [user?.photo_url])

  // Получение инициалов пользователя
  const getInitials = (firstName: string, lastName?: string): string => {
    const first = firstName?.charAt(0)?.toUpperCase() || ''
    const last = lastName?.charAt(0)?.toUpperCase() || ''
    return first + last
  }

  // Генерация цвета аватара на основе ID пользователя
  const getAvatarGradient = (userId: number): string => {
    const gradients = [
      'linear-gradient(135deg, #ff6b6b, #ee5a24)',
      'linear-gradient(135deg, #4ecdc4, #44a08d)',
      'linear-gradient(135deg, #45b7d1, #2980b9)',
      'linear-gradient(135deg, #f9ca24, #f0932b)',
      'linear-gradient(135deg, #eb4d4b, #c0392b)',
      'linear-gradient(135deg, #6c5ce7, #a29bfe)',
      'linear-gradient(135deg, #fd79a8, #e84393)',
      'linear-gradient(135deg, #00b894, #00cec9)',
    ]
    return gradients[userId % gradients.length]
  }

  // Обработчик клика по кнопке
  const handleButtonClick = (action: string) => {
    const newCount = buttonClicks + 1
    setButtonClicks(newCount)
    
    if (onSendData) {
      onSendData({
        action,
        button_clicks: newCount,
        user_id: user?.id,
        timestamp: Date.now()
      })
    }

    // Haptic feedback
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('light')
    }
  }

  const displayName = user ? 
    `${user.first_name}${user.last_name ? ` ${user.last_name}` : ''}` : 
    'Telegram User'

  const username = user?.username
  const isPremium = user?.is_premium
  const languageCode = user?.language_code

  // Статистика подарков
  const giftStats = {
    total: wonGifts.length,
    common: wonGifts.filter(g => g.rarity === 'common').length,
    rare: wonGifts.filter(g => g.rarity === 'rare').length,
    epic: wonGifts.filter(g => g.rarity === 'epic').length,
    legendary: wonGifts.filter(g => g.rarity === 'legendary').length,
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-6 tg-fade-in">
        {/* Loading avatar */}
        <div className="tg-avatar tg-avatar-large tg-skeleton rounded-full"></div>
        
        {/* Loading name */}
        <div className="space-y-3 text-center">
          <div className="h-8 w-48 tg-skeleton rounded-lg mx-auto"></div>
          <div className="h-5 w-32 tg-skeleton rounded-md mx-auto"></div>
        </div>

        {/* Loading card */}
        <div className="w-full max-w-sm h-24 tg-skeleton rounded-xl"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-8 tg-fade-in">
      {/* Avatar Section */}
      <div className="relative group">
        <div 
          className="tg-avatar tg-avatar-large transition-all duration-300 group-hover:scale-105"
          style={{
            background: user ? getAvatarGradient(user.id) : 'linear-gradient(135deg, #gray-400, #gray-600)'
          }}
        >
          {user?.photo_url && !imageError ? (
            <>
              <img
                src={user.photo_url}
                alt={displayName}
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  isImageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setIsImageLoaded(true)}
                onError={() => setImageError(true)}
              />
              
              {/* Image loading overlay */}
              {!isImageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <div className="tg-loading"></div>
                </div>
              )}
            </>
          ) : (
            <span className="text-4xl font-bold">
              {user ? getInitials(user.first_name, user.last_name) : '👤'}
            </span>
          )}
        </div>

        {/* Premium badge */}
        {isPremium && (
          <div className="tg-avatar-badge bg-yellow-400 text-yellow-900">
            ⭐
          </div>
        )}

        {/* Online status */}
        <div className="tg-avatar-status"></div>
      </div>

      {/* User Information */}
      <div className="text-center space-y-3 tg-slide-up">
        {/* Name */}
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tg-text-primary flex items-center justify-center gap-2">
            {displayName}
            {isPremium && (
              <span className="text-yellow-500 animate-pulse text-2xl">👑</span>
            )}
          </h1>

          {/* Username */}
          {username && (
            <p className="tg-text-secondary text-lg">
              @{username}
            </p>
          )}

          {/* Language code */}
          {languageCode && (
            <p className="tg-text-secondary text-sm opacity-75">
              🌍 {languageCode.toUpperCase()}
            </p>
          )}
        </div>

        {/* User ID for development */}
        {user && import.meta.env.DEV && (
          <p className="text-xs tg-text-secondary opacity-50 font-mono">
            ID: {user.id}
          </p>
        )}
      </div>

      {/* Game Stats */}
      <div className="w-full max-w-sm space-y-4">
        {/* Spins Left */}
        <div className="tg-card text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-2xl">🎰</span>
            <h3 className="text-lg font-semibold tg-text-primary">Roulette Stats</h3>
          </div>
          <div className="flex justify-between items-center">
            <span className="tg-text-secondary">Free spins left:</span>
            <span className="text-xl font-bold tg-text-accent">{spinsLeft}</span>
          </div>
        </div>

        {/* Gifts Collection */}
        <div className="tg-card">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-2xl">🎁</span>
            <h3 className="text-lg font-semibold tg-text-primary">Gift Collection</h3>
          </div>

          {wonGifts.length === 0 ? (
            <div className="text-center py-4">
              <p className="tg-text-secondary text-sm">No gifts won yet</p>
              <p className="tg-text-hint text-xs mt-1">Try the roulette to win some gifts!</p>
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                <div className="text-center p-2 rounded-lg bg-white/5">
                  <div className="text-lg font-bold tg-text-primary">{giftStats.total}</div>
                  <div className="text-xs tg-text-secondary">Total</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-gray-500/10">
                  <div className="text-lg font-bold" style={{ color: rarityColors.common }}>
                    {giftStats.common}
                  </div>
                  <div className="text-xs tg-text-secondary">Common</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-blue-500/10">
                  <div className="text-lg font-bold" style={{ color: rarityColors.rare }}>
                    {giftStats.rare}
                  </div>
                  <div className="text-xs tg-text-secondary">Rare</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-purple-500/10">
                  <div className="text-lg font-bold" style={{ color: rarityColors.epic }}>
                    {giftStats.epic}
                  </div>
                  <div className="text-xs tg-text-secondary">Epic</div>
                </div>
              </div>

              {/* Legendary Count (if any) */}
              {giftStats.legendary > 0 && (
                <div className="text-center mb-4 p-2 rounded-lg bg-yellow-500/10">
                  <div className="text-2xl font-bold" style={{ color: rarityColors.legendary }}>
                    {giftStats.legendary}
                  </div>
                  <div className="text-sm font-semibold" style={{ color: rarityColors.legendary }}>
                    ✨ LEGENDARY GIFTS ✨
                  </div>
                </div>
              )}

              {/* Recent Gifts */}
              <div>
                <h4 className="text-sm font-semibold tg-text-primary mb-2">Recent Gifts:</h4>
                <div className="grid grid-cols-4 gap-2">
                  {wonGifts.slice(-8).map((gift, index) => (
                    <div
                      key={`${gift.id}-${index}`}
                      className="relative aspect-square rounded-lg overflow-hidden border-2"
                      style={{ borderColor: rarityColors[gift.rarity] }}
                    >
                      <img
                        src={gift.image}
                        alt={gift.name}
                        className="w-full h-full object-cover"
                      />
                      <div 
                        className="absolute top-1 right-1 w-3 h-3 rounded-full border border-white"
                        style={{ backgroundColor: rarityColors[gift.rarity] }}
                      ></div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 w-full max-w-sm">
        <div className="grid grid-cols-2 gap-3">
          <button 
            className="tg-button-secondary tg-button text-sm"
            onClick={() => handleButtonClick('share_profile')}
          >
            📤 Share
          </button>
          
          <button 
            className="tg-button-secondary tg-button text-sm"
            onClick={() => handleButtonClick('view_achievements')}
          >
            🏆 Achievements
          </button>
        </div>

        {/* Stats for development */}
        {import.meta.env.DEV && buttonClicks > 0 && (
          <div className="tg-card text-center">
            <p className="text-sm tg-text-secondary">
              Кнопки нажаты: <span className="font-bold">{buttonClicks}</span> раз
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center space-y-2 mt-8">
        <p className="text-xs tg-text-secondary opacity-75">
          Telegram Roulette WebApp
        </p>
        <div className="flex items-center justify-center gap-2 text-xs tg-text-secondary">
          <span>React</span>
          <span>•</span>
          <span>TypeScript</span>
          <span>•</span>
          <span>Tailwind CSS</span>
        </div>
      </div>
    </div>
  )
}

export default UserProfile