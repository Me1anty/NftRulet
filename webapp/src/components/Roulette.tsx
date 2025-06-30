import React, { useState, useRef } from 'react'
import type { Gift } from '../utils/giftImages'
import { getWeightedRandomGift, rarityColors } from '../utils/giftImages'

interface RouletteProps {
  gifts: Gift[]
  spinsLeft: number
  onSpin: (wonGift: Gift) => void
  onSpinComplete?: (wonGift: Gift) => void
}

const Roulette: React.FC<RouletteProps> = ({ 
  gifts, 
  spinsLeft, 
  onSpin,
  onSpinComplete 
}) => {
  const [isSpinning, setIsSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [wonGift, setWonGift] = useState<Gift | null>(null)
  const [showResult, setShowResult] = useState(false)
  const wheelRef = useRef<HTMLDivElement>(null)

  // Создаем массив подарков для рулетки (дублируем для заполнения)
  const rouletteGifts = [...gifts, ...gifts, ...gifts].slice(0, 12)

  const handleSpin = () => {
    if (isSpinning || spinsLeft <= 0 || gifts.length === 0) return

    setIsSpinning(true)
    setShowResult(false)
    setWonGift(null)

    // Выбираем выигрышный подарок
    const selectedGift = getWeightedRandomGift(gifts)
    
    // Haptic feedback
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('medium')
    }

    // Рассчитываем угол поворота
    const spins = 5 + Math.random() * 5 // 5-10 полных оборотов
    const finalAngle = Math.random() * 360
    const totalRotation = rotation + spins * 360 + finalAngle

    setRotation(totalRotation)
    onSpin(selectedGift)

    // Завершение анимации
    setTimeout(() => {
      setIsSpinning(false)
      setWonGift(selectedGift)
      setShowResult(true)
      onSpinComplete?.(selectedGift)
      
      // Success haptic
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('success')
      }
    }, 4000) // 4 секунды анимации
  }

  const closeResult = () => {
    setShowResult(false)
    setWonGift(null)
  }

  if (gifts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="tg-loading w-12 h-12"></div>
        <p className="text-telegram-hint text-sm mt-4">Loading roulette...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center py-8 px-4">
      {/* Roulette Wheel */}
      <div className="relative mb-8">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-20">
          <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-yellow-400 drop-shadow-lg"></div>
        </div>

        {/* Wheel Container */}
        <div className="relative w-80 h-80 rounded-full overflow-hidden border-4 border-yellow-400 shadow-2xl">
          {/* Wheel */}
          <div
            ref={wheelRef}
            className="w-full h-full relative transition-transform duration-4000 ease-out"
            style={{
              transform: `rotate(${rotation}deg)`,
              transitionDuration: isSpinning ? '4s' : '0.5s'
            }}
          >
            {rouletteGifts.map((gift, index) => {
              const angle = (360 / rouletteGifts.length) * index
              const isEven = index % 2 === 0
              
              return (
                <div
                  key={`${gift.id}-${index}`}
                  className={`absolute w-full h-full ${
                    isEven ? 'bg-purple-600/30' : 'bg-blue-600/30'
                  }`}
                  style={{
                    transform: `rotate(${angle}deg)`,
                    clipPath: `polygon(50% 50%, 50% 0%, ${
                      50 + 50 * Math.cos((360 / rouletteGifts.length) * Math.PI / 180)
                    }% ${
                      50 - 50 * Math.sin((360 / rouletteGifts.length) * Math.PI / 180)
                    }%)`
                  }}
                >
                  <div 
                    className="absolute top-4 left-1/2 transform -translate-x-1/2"
                    style={{
                      transform: 'translateX(-50%) rotate(90deg)'
                    }}
                  >
                    <div 
                      className="w-12 h-12 rounded-lg overflow-hidden border-2 bg-white"
                      style={{ borderColor: rarityColors[gift.rarity] }}
                    >
                      <img 
                        src={gift.image} 
                        alt={gift.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Center Circle */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
            <span className="text-2xl">🎁</span>
          </div>
        </div>
      </div>

      {/* Spins Counter */}
      <div className="mb-6 text-center">
        <div className="text-telegram-text text-lg font-semibold mb-1">
          Free {spinsLeft} Spin{spinsLeft !== 1 ? 's' : ''}
        </div>
        <div className="text-telegram-hint text-sm">
          {spinsLeft > 0 ? 'Get your free gifts!' : 'No free spins left'}
        </div>
      </div>

      {/* Spin Button */}
      <button
        onClick={handleSpin}
        disabled={isSpinning || spinsLeft <= 0}
        className={`telegram-button text-xl font-bold py-4 px-8 rounded-xl transition-all duration-200 ${
          isSpinning || spinsLeft <= 0
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:scale-105 active:scale-95 shadow-lg'
        }`}
      >
        {isSpinning ? (
          <div className="flex items-center gap-3">
            <div className="tg-loading w-6 h-6 border-white border-t-transparent"></div>
            <span>Spinning...</span>
          </div>
        ) : spinsLeft > 0 ? (
          '🎰 SPIN'
        ) : (
          '✋ No Spins Left'
        )}
      </button>

      {/* Result Modal */}
      {showResult && wonGift && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="tg-card max-w-sm w-full text-center animate-scale-in">
            <div className="mb-4">
              <div className="text-4xl mb-2">🎉</div>
              <h2 className="text-2xl font-bold tg-text-primary mb-2">
                Congratulations!
              </h2>
              <p className="tg-text-secondary text-sm">
                You won an amazing gift!
              </p>
            </div>

            {/* Won Gift */}
            <div className="mb-6">
              <div 
                className="w-32 h-32 mx-auto rounded-xl overflow-hidden border-4 mb-3 shadow-lg"
                style={{ borderColor: rarityColors[wonGift.rarity] }}
              >
                <img 
                  src={wonGift.image} 
                  alt={wonGift.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 
                className="text-xl font-bold mb-1"
                style={{ color: rarityColors[wonGift.rarity] }}
              >
                {wonGift.name}
              </h3>
              <div 
                className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide"
                style={{ 
                  backgroundColor: `${rarityColors[wonGift.rarity]}20`,
                  color: rarityColors[wonGift.rarity]
                }}
              >
                {wonGift.rarity}
              </div>
            </div>

            <button
              onClick={closeResult}
              className="telegram-button w-full"
            >
              Awesome! 🎁
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Roulette