import os
from dotenv import load_dotenv

# Загрузка переменных окружения из .env файла
load_dotenv()

# Конфигурация бота
BOT_TOKEN = os.getenv('BOT_TOKEN', 'YOUR_BOT_TOKEN_HERE')

# URL WebApp (замените на ваш URL после деплоя)
WEBAPP_URL = os.getenv('WEBAPP_URL', 'http://localhost:3000')

# Настройки для разработки
DEV_MODE = os.getenv('DEV_MODE', 'False').lower() == 'true'

# Если в режиме разработки, используем ngrok или localhost URL
if DEV_MODE:
    WEBAPP_URL = os.getenv('NGROK_URL', 'http://localhost:3000')

# Проверка обязательных переменных
if BOT_TOKEN == 'YOUR_BOT_TOKEN_HERE':
    raise ValueError(
        "❌ BOT_TOKEN не установлен!\n"
        "Создайте .env файл и добавьте: BOT_TOKEN=your_actual_bot_token\n"
        "Получите токен у @BotFather в Telegram"
    )

if 'your-app.vercel.app' in WEBAPP_URL:
    print("⚠️  WEBAPP_URL не настроен! Используется заглушка.")
    print("📝 Обновите WEBAPP_URL в config.py или .env после деплоя WebApp")

# Вывод конфигурации при запуске
print("=" * 50)
print("🤖 TELEGRAM BOT CONFIGURATION")
print("=" * 50)
print(f"🔑 Bot Token: {'✅ Установлен' if BOT_TOKEN != 'YOUR_BOT_TOKEN_HERE' else '❌ Не установлен'}")
print(f"🌐 WebApp URL: {WEBAPP_URL}")
print(f"🔧 Dev Mode: {'✅ Включен' if DEV_MODE else '❌ Выключен'}")
print("=" * 50)