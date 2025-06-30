import React, { useState, useEffect } from 'react'
import type { Gift } from '../utils/giftImages'
import { getWeightedRandomGift, rarityColors } from '../utils/giftImages'

interface ImprovedRouletteProps {
  gifts: Gift[]
  spinsLeft: number
  onSpin: (wonGift: Gift) => void
  onSpinComplete?: (wonGift: Gift) => void
}

// Типы для rarityColors
type RarityType = keyof typeof rarityColors

const ImprovedRoulette: React.FC<ImprovedRouletteProps> = ({ 
  gifts, 
  spinsLeft, 
  onSpin,
  onSpinComplete 
}) => {
  const [isSpinning, setIsSpinning] = useState(false)
  const [wonGift, setWonGift] = useState<Gift | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [recentWins, setRecentWins] = useState<Gift[]>([])

  // Создаем массив подарков для рулетки (6 позиций)
  const rouletteGifts = gifts.length > 0 ? 
    [...gifts, ...gifts, ...gifts].slice(0, 6) : 
    Array(6).fill(null)

  useEffect(() => {
    // Генерируем недавние выигрыши для примера
    if (gifts.length > 0 && recentWins.length === 0) {
      const recent = Array(6).fill(null).map(() => getWeightedRandomGift(gifts))
      setRecentWins(recent)
    }
  }, [gifts, recentWins.length])

  // Безопасная функция получения цвета редкости
  const getRarityColor = (rarity: string): string => {
    return rarityColors[rarity as RarityType] || rarityColors.common
  }

  const handleSpin = () => {
    if (isSpinning || spinsLeft <= 0 || gifts.length === 0) return

    setIsSpinning(true)
    setShowResult(false)
    setWonGift(null)
    setSelectedIndex(null)

    // Выбираем выигрышный подарок
    const selectedGift = getWeightedRandomGift(gifts)
    const winIndex = Math.floor(Math.random() * rouletteGifts.length)
    
    // Haptic feedback
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('medium')
    }

    onSpin(selectedGift)

    // Анимация мигания слотов
    let currentIndex = 0
    const spinDuration = 3000
    const intervalTime = 100

    const spinInterval = setInterval(() => {
      setSelectedIndex(currentIndex % rouletteGifts.length)
      currentIndex++
    }, intervalTime)

    // Завершение анимации
    setTimeout(() => {
      clearInterval(spinInterval)
      setSelectedIndex(winIndex)
      setIsSpinning(false)
      setWonGift(selectedGift)
      setShowResult(true)
      
      // Обновляем недавние выигрыши
      setRecentWins(prev => [selectedGift, ...prev.slice(0, 5)])
      
      onSpinComplete?.(selectedGift)
      
      // Success haptic
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success')
      }
    }, spinDuration)
  }

  const closeResult = () => {
    setShowResult(false)
    setWonGift(null)
    setSelectedIndex(null)
  }

  if (gifts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="tg-loading w-12 h-12"></div>
        <p className="text-white/70 text-sm mt-4">Loading roulette...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Improved Background */}
      <div className="absolute inset-0">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-indigo-900 to-violet-900"></div>
        
        {/* Animated particles */}
        <div className="absolute inset-0">
          {Array(20).fill(null).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400/30 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
        
        {/* Glow effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-6 text-white">
        {/* Header with Recent Wins */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-2xl">🏆</span>
            <h2 className="text-xl font-bold text-yellow-400 tracking-wide">
              НЕДАВНИЕ ВЫИГРЫШИ
            </h2>
          </div>
          
          {/* Recent wins grid */}
          <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto mb-4">
            {recentWins.slice(0, 6).map((gift, index) => (
              <div
                key={`recent-${index}`}
                className="aspect-square rounded-xl overflow-hidden border-2 bg-black/30 backdrop-blur-sm relative group hover:scale-105 transition-all duration-300"
                style={{ borderColor: `${getRarityColor(gift?.rarity || 'common')}60` }}
              >
                {gift && (
                  <>
                    <img
                      src={gift.image}
                      alt={gift.name}
                      className="w-full h-full object-cover"
                    />
                    <div 
                      className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    />
                    <div className="absolute bottom-1 left-1 right-1 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="text-xs font-semibold text-white drop-shadow-lg">
                        {gift.name}
                      </span>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Pointer Arrow */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-0 h-0 border-l-6 border-r-6 border-t-12 border-l-transparent border-r-transparent border-t-yellow-400 drop-shadow-lg animate-bounce"></div>
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <div className="w-4 h-4 bg-yellow-400 rounded-full animate-ping"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Roulette Grid */}
        <div className="mb-8">
          <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
            {rouletteGifts.map((gift, index) => (
              <div
                key={`slot-${index}`}
                className={`aspect-square rounded-2xl overflow-hidden border-3 bg-black/40 backdrop-blur-md relative transition-all duration-300 ${
                  selectedIndex === index 
                    ? 'border-yellow-400 shadow-2xl shadow-yellow-400/50 scale-110 animate-glow' 
                    : 'border-white/20 hover:border-white/40'
                } ${isSpinning ? 'animate-pulse' : ''}`}
              >
                {gift && (
                  <>
                    <img
                      src={gift.image}
                      alt={gift.name}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Rarity indicator */}
                    <div 
                      className="absolute top-2 right-2 w-3 h-3 rounded-full border border-white/50"
                      style={{ backgroundColor: getRarityColor(gift.rarity) }}
                    />
                    
                    {/* Selection overlay */}
                    {selectedIndex === index && (
                      <div className="absolute inset-0 bg-yellow-400/20 border-2 border-yellow-400 rounded-2xl animate-pulse">
                        <div className="absolute inset-2 border border-yellow-300 rounded-xl"></div>
                      </div>
                    )}
                    
                    {/* Glow effect when selected */}
                    {selectedIndex === index && !isSpinning && (
                      <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl blur opacity-75 animate-pulse"></div>
                    )}
                  </>
                )}
                
                {/* Empty slot placeholder */}
                {!gift && (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-4xl opacity-30">🎁</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Spins Counter */}
        <div className="text-center mb-6">
          <p className="text-white/80 text-lg mb-2">
            Доступно вращений: <span className="text-2xl font-bold text-yellow-400">{spinsLeft}</span>
          </p>
          {spinsLeft === 0 && (
            <p className="text-red-400 text-sm">Бесплатные вращения закончились</p>
          )}
        </div>

        {/* Spin Button */}
        <div className="flex justify-center">
          <button
            onClick={handleSpin}
            disabled={isSpinning || spinsLeft <= 0}
            className={`relative px-12 py-4 rounded-2xl font-bold text-xl tracking-wider transition-all duration-300 overflow-hidden ${
              isSpinning || spinsLeft <= 0
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500 hover:scale-105 active:scale-95 shadow-2xl hover:shadow-purple-500/50'
            }`}
          >
            {/* Button glow effect */}
            {spinsLeft > 0 && !isSpinning && (
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-20 animate-pulse"></div>
            )}
            
            <span className="relative z-10">
              {isSpinning ? (
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ВРАЩЕНИЕ...
                </div>
              ) : spinsLeft > 0 ? (
                '🎰 КРУТИТЬ!'
              ) : (
                '❌ НЕТ ВРАЩЕНИЙ'
              )}
            </span>
          </button>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-10 left-10 text-6xl opacity-20 animate-pulse">💎</div>
        <div className="absolute top-20 right-10 text-4xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}>⭐</div>
        <div className="absolute bottom-20 left-20 text-5xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}>🎁</div>
        <div className="absolute bottom-10 right-20 text-4xl opacity-20 animate-pulse" style={{ animationDelay: '0.5s' }}>👑</div>
      </div>

      {/* Result Modal */}
      {showResult && wonGift && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-purple-800 to-indigo-900 rounded-3xl p-8 max-w-sm w-full text-center border border-yellow-400/30 shadow-2xl">
            {/* Celebration animation */}
            <div className="mb-6">
              <div className="text-6xl mb-4 animate-bounce">🎉</div>
              <h2 className="text-3xl font-bold text-yellow-400 mb-2 animate-pulse">
                ПОЗДРАВЛЯЕМ!
              </h2>
              <p className="text-white/80">
                Вы выиграли потрясающий подарок!
              </p>
            </div>

            {/* Won Gift Display */}
            <div className="mb-8">
              <div 
                className="w-40 h-40 mx-auto rounded-2xl overflow-hidden border-4 mb-4 shadow-2xl relative"
                style={{ borderColor: getRarityColor(wonGift.rarity) }}
              >
                <img 
                  src={wonGift.image} 
                  alt={wonGift.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              </div>
              
              <h3 
                className="text-2xl font-bold mb-2"
                style={{ color: getRarityColor(wonGift.rarity) }}
              >
                {wonGift.name}
              </h3>
              
              <div 
                className="inline-block px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider border-2"
                style={{ 
                  backgroundColor: `${getRarityColor(wonGift.rarity)}20`,
                  color: getRarityColor(wonGift.rarity),
                  borderColor: getRarityColor(wonGift.rarity)
                }}
              >
                ✨ {wonGift.rarity} ✨
              </div>
            </div>

            <button
              onClick={closeResult}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold py-4 rounded-xl text-lg hover:from-yellow-400 hover:to-orange-400 transition-all duration-300 shadow-lg"
            >
              🎁 ОТЛИЧНО!
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ImprovedRoulette