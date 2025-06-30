import React, { useState, useEffect, useRef } from 'react'
import type { Gift } from '../utils/giftImages'
import { generateLiveDropItem, rarityColors } from '../utils/giftImages'

interface LiveDropItem {
  id: string
  gift: Gift
  username: string
  timestamp: number
}

interface LiveDropProps {
  gifts: Gift[]
  isActive?: boolean
}

const LiveDrop: React.FC<LiveDropProps> = ({ gifts, isActive = true }) => {
  const [dropItems, setDropItems] = useState<LiveDropItem[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isActive || gifts.length === 0) return

    const interval = setInterval(() => {
      const newItem = generateLiveDropItem(gifts)
      
      setDropItems(prev => {
        // Добавляем новый элемент и удаляем старые (оставляем максимум 10)
        const updated = [newItem, ...prev].slice(0, 10)
        return updated
      })
    }, 2000 + Math.random() * 3000) // Случайный интервал от 2 до 5 секунд

    return () => clearInterval(interval)
  }, [gifts, isActive])

  // Удаление элементов через 15 секунд
  useEffect(() => {
    dropItems.forEach(item => {
      setTimeout(() => {
        setDropItems(prev => prev.filter(i => i.id !== item.id))
      }, 15000)
    })
  }, [dropItems])

  if (gifts.length === 0) {
    return (
      <div className="h-16 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-b border-white/10 flex items-center justify-center">
        <p className="text-telegram-hint text-sm">Loading gifts...</p>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className="relative h-16 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-b border-white/10 overflow-hidden"
    >
      {/* Live Drop Header */}
      <div className="absolute inset-0 flex items-center px-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-telegram-text font-semibold text-sm">LIVE DROP</span>
        </div>
      </div>

      {/* Animated Drop Items */}
      <div className="absolute inset-0 pointer-events-none">
        {dropItems.map((item) => (
          <LiveDropItemComponent 
            key={item.id} 
            item={item} 
            containerWidth={containerRef.current?.offsetWidth || 0}
          />
        ))}
      </div>

      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>
    </div>
  )
}

interface LiveDropItemComponentProps {
  item: LiveDropItem
  index?: number  // Сделаем опциональным
  containerWidth: number
}

const LiveDropItemComponent: React.FC<LiveDropItemComponentProps> = ({ 
  item, 
  containerWidth 
}) => {
  const [position, setPosition] = useState({
    x: Math.random() * (containerWidth - 200),
    y: -60
  })

  useEffect(() => {
    // Анимация движения
    const startTime = Date.now()
    const duration = 8000 + Math.random() * 4000 // 8-12 секунд
    const startX = position.x
    const endX = startX + (Math.random() - 0.5) * 200 // Небольшое боковое движение
    const endY = 80

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Easing function для плавного движения
      const easeOut = 1 - Math.pow(1 - progress, 3)
      
      setPosition({
        x: startX + (endX - startX) * easeOut,
        y: -60 + (endY - (-60)) * easeOut
      })

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [])

  return (
    <div
      className="absolute transition-all duration-100 ease-linear"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translateZ(0)', // GPU acceleration
      }}
    >
      <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-lg px-3 py-1 border border-white/20">
        {/* Gift Image */}
        <div 
          className="w-8 h-8 rounded-md overflow-hidden border-2 flex-shrink-0"
          style={{ borderColor: rarityColors[item.gift.rarity] }}
        >
          <img 
            src={item.gift.image} 
            alt={item.gift.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Drop Info */}
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1">
            <span className="text-telegram-text text-xs font-medium truncate max-w-20">
              {item.username}
            </span>
            <span className="text-telegram-hint text-xs">won</span>
          </div>
          <span 
            className="text-xs font-semibold truncate max-w-24"
            style={{ color: rarityColors[item.gift.rarity] }}
          >
            {item.gift.name}
          </span>
        </div>
      </div>
    </div>
  )
}

export default LiveDrop