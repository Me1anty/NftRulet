import React, { useState, useEffect } from 'react'
import LiveDrop from './LiveDrop'
import type { Gift } from '../utils/giftImages'
import { loadGifts } from '../utils/giftImages'

// Динамический импорт улучшенной рулетки
const ImprovedRoulette = React.lazy(() => 
  import('./ImprovedRoulette').catch(() => 
    import('./Roulette') // Fallback к обычной рулетке
  )
)

interface RouletteScreenProps {
  spinsLeft: number
  onSpinUsed: () => void
  onGiftWon: (gift: Gift) => void
}

const RouletteScreen: React.FC<RouletteScreenProps> = ({
  spinsLeft,
  onSpinUsed,
  onGiftWon
}) => {
  const [gifts, setGifts] = useState<Gift[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Загрузка подарков
  useEffect(() => {
    const loadGiftsData = async () => {
      try {
        setLoading(true)
        
        // Имитация задержки загрузки
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const loadedGifts = loadGifts()
        
        if (loadedGifts.length === 0) {
          console.warn('No gifts found in assets/gift folder, using fallback gifts')
        }
        
        // Создаем тестовые подарки для демонстрации
        const fallbackGifts: Gift[] = [
          {
            id: 'happybday',
            name: 'Happy B-day',
            image: '/vite.svg',
            rarity: 'common'
          },
          {
            id: 'book',
            name: 'Magic Book',
            image: '/vite.svg',
            rarity: 'rare'
          },
          {
            id: 'gingerbread',
            name: 'Gingerbread',
            image: '/vite.svg',
            rarity: 'epic'
          },
          {
            id: 'crystal',
            name: 'Crystal',
            image: '/vite.svg',
            rarity: 'legendary'
          },
          {
            id: 'witchhat',
            name: 'Witch Hat',
            image: '/vite.svg',
            rarity: 'epic'
          },
          {
            id: 'scroll',
            name: 'Ancient Scroll',
            image: '/vite.svg',
            rarity: 'rare'
          }
        ]
        
        setGifts(loadedGifts.length > 0 ? loadedGifts : fallbackGifts)
        setError(null)
      } catch (err) {
        console.error('Failed to load gifts:', err)
        setError(err instanceof Error ? err.message : 'Failed to load gifts')
      } finally {
        setLoading(false)
      }
    }

    loadGiftsData()
  }, [])

  const handleSpin = (wonGift: Gift) => {
    onSpinUsed()
    onGiftWon(wonGift)
    
    // Отправляем данные в бота
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.sendData(JSON.stringify({
        action: 'gift_won',
        gift: wonGift,
        spinsLeft: spinsLeft - 1,
        timestamp: Date.now()
      }))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-violet-900 flex flex-col">
        {/* Loading Live Drop */}
        <div className="h-16 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-b border-white/10 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <div className="tg-loading w-4 h-4"></div>
            <span className="text-white text-sm">Loading...</span>
          </div>
        </div>

        {/* Loading Content */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="tg-loading w-16 h-16 mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">
              Загрузка рулетки
            </h2>
            <p className="text-white/70">
              Подготавливаем ваши подарки...
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-violet-900 flex flex-col">
        {/* Error Live Drop */}
        <div className="h-16 bg-gradient-to-r from-red-600/20 to-orange-600/20 border-b border-white/10 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <span className="text-red-400">⚠️</span>
            <span className="text-white text-sm">Error loading gifts</span>
          </div>
        </div>

        {/* Error Content */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center max-w-sm text-white">
            <div className="text-6xl mb-4">😅</div>
            <h2 className="text-xl font-semibold mb-2">
              Упс! Что-то пошло не так
            </h2>
            <p className="text-white/70 text-sm mb-4">
              {error}
            </p>
            <p className="text-white/50 text-xs">
              Убедитесь, что в папке assets/gift есть изображения подарков
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-violet-900">
      {/* Live Drop - показываем только если есть подарки */}
      {gifts.length > 0 && (
        <LiveDrop gifts={gifts} isActive={true} />
      )}

      {/* Main Roulette Content */}
      <div className="pb-20"> {/* Padding for bottom navigation */}
        <React.Suspense fallback={
          <div className="flex items-center justify-center py-20">
            <div className="tg-loading w-12 h-12"></div>
          </div>
        }>
          <ImprovedRoulette
            gifts={gifts}
            spinsLeft={spinsLeft}
            onSpin={handleSpin}
            onSpinComplete={onGiftWon}
          />
        </React.Suspense>
      </div>
    </div>
  )
}

export default RouletteScreen