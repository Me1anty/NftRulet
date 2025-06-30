// Утилиты для работы с изображениями подарков

// Интерфейс подарка
export interface Gift {
    id: string
    name: string
    image: string
    rarity: 'common' | 'rare' | 'epic' | 'legendary'
  }
  
  // Функция для импорта всех изображений подарков
  const importGiftImages = (): Record<string, string> => {
    const modules = import.meta.glob('../assets/gift/*.jpg', { 
      eager: true, 
      as: 'url' 
    })
    
    const images: Record<string, string> = {}
    
    Object.entries(modules).forEach(([path, url]) => {
      // Извлекаем название файла без расширения и пути
      const fileName = path.split('/').pop()?.replace('.jpg', '') || ''
      const giftName = fileName.replace('.large', '')
      images[giftName] = url as string
    })
    
    return images
  }
  
  // Определение редкости подарка по названию
  const getGiftRarity = (name: string): Gift['rarity'] => {
    const rarityMap: Record<string, Gift['rarity']> = {
      'lunarsnake': 'legendary',
      'skullflower': 'epic',
      // Добавьте больше подарков с их редкостью
    }
    
    return rarityMap[name] || 'common'
  }
  
  // Загрузка всех подарков
  export const loadGifts = (): Gift[] => {
    const images = importGiftImages()
    
    return Object.entries(images).map(([name, image]) => ({
      id: name,
      name: name.charAt(0).toUpperCase() + name.slice(1), // Первая буква заглавная
      image,
      rarity: getGiftRarity(name)
    }))
  }
  
  // Получение случайного подарка
  export const getRandomGift = (gifts: Gift[]): Gift => {
    const randomIndex = Math.floor(Math.random() * gifts.length)
    return gifts[randomIndex]
  }
  
  // Получение подарков с учетом весов редкости
  export const getWeightedRandomGift = (gifts: Gift[]): Gift => {
    const weights = {
      common: 50,
      rare: 30,
      epic: 15,
      legendary: 5
    }
    
    const weightedGifts: Gift[] = []
    
    gifts.forEach(gift => {
      const weight = weights[gift.rarity]
      for (let i = 0; i < weight; i++) {
        weightedGifts.push(gift)
      }
    })
    
    return getRandomGift(weightedGifts)
  }
  
  // Цвета редкости
  export const rarityColors = {
    common: '#9ca3af',    // gray
    rare: '#3b82f6',      // blue  
    epic: '#8b5cf6',      // purple
    legendary: '#f59e0b'  // amber
  }
  
  // Анимация для Live Drop
  export const generateLiveDropItem = (gifts: Gift[]) => {
    const gift = getRandomGift(gifts)
    const username = generateRandomUsername()
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      gift,
      username,
      timestamp: Date.now()
    }
  }
  
  // Генерация случайных имен пользователей для Live Drop
  const generateRandomUsername = (): string => {
    const adjectives = ['Lucky', 'Pro', 'Epic', 'Cool', 'Super', 'Mega', 'Ultra', 'Fast', 'Smart', 'Crazy']
    const nouns = ['Player', 'Gamer', 'Winner', 'Master', 'Champion', 'Hero', 'Legend', 'King', 'Boss', 'Star']
    
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
    const noun = nouns[Math.floor(Math.random() * nouns.length)]
    const number = Math.floor(Math.random() * 999) + 1
    
    return `${adj}${noun}${number}`
  }