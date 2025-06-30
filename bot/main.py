import asyncio
import logging
from aiogram import Bot, Dispatcher, types, F
from aiogram.types import WebAppInfo, InlineKeyboardMarkup, InlineKeyboardButton, MenuButtonWebApp
from aiogram.filters import CommandStart, Command
from aiogram.fsm.storage.memory import MemoryStorage
from config import BOT_TOKEN, WEBAPP_URL

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Инициализация бота и диспетчера
bot = Bot(token=BOT_TOKEN)
dp = Dispatcher(storage=MemoryStorage())

@dp.message(CommandStart())
async def start_handler(message: types.Message):
    """Обработчик команды /start"""
    user = message.from_user
    
    # Создаем клавиатуру с WebApp
    keyboard = InlineKeyboardMarkup(inline_keyboard=[[
        InlineKeyboardButton(
            text="🚀 Открыть WebApp",
            web_app=WebAppInfo(url=WEBAPP_URL)
        )
    ]])
    
    welcome_text = f"""
👋 <b>Привет, {user.first_name}!</b>

🌟 Добро пожаловать в наш Telegram WebApp!

✨ <b>Что умеет приложение:</b>
• Показывает ваш профиль и аватар
• Адаптируется под тему Telegram
• Современный и красивый интерфейс
• Быстрая и плавная работа

🚀 <b>Нажмите кнопку ниже, чтобы открыть приложение!</b>
    """
    
    await message.answer(
        welcome_text,
        reply_markup=keyboard,
        parse_mode="HTML"
    )

@dp.message(Command("webapp"))
async def webapp_handler(message: types.Message):
    """Обработчик команды /webapp"""
    keyboard = InlineKeyboardMarkup(inline_keyboard=[[
        InlineKeyboardButton(
            text="🌐 Открыть WebApp",
            web_app=WebAppInfo(url=WEBAPP_URL)
        )
    ]])
    
    await message.answer(
        "🌐 <b>Открыть WebApp приложение:</b>",
        reply_markup=keyboard,
        parse_mode="HTML"
    )

@dp.message(Command("help"))
async def help_handler(message: types.Message):
    """Обработчик команды /help"""
    help_text = """
🆘 <b>Помощь по боту</b>

📋 <b>Доступные команды:</b>
• /start - Главное меню
• /webapp - Открыть WebApp
• /help - Показать эту справку
• /about - О приложении

🔗 <b>Как пользоваться:</b>
1. Нажмите на кнопку "Открыть WebApp"
2. Приложение покажет ваш профиль
3. Наслаждайтесь современным интерфейсом!

💡 <b>Совет:</b> Приложение автоматически адаптируется под вашу тему Telegram (светлая/темная).
    """
    
    await message.answer(help_text, parse_mode="HTML")

@dp.message(Command("about"))
async def about_handler(message: types.Message):
    """Обработчик команды /about"""
    about_text = """
ℹ️ <b>О приложении</b>

🔧 <b>Технологии:</b>
• Frontend: React + TypeScript + Tailwind CSS v4
• Backend: Python + aiogram
• Hosting: Vercel/Netlify

⚡ <b>Особенности:</b>
• Быстрая загрузка и работа
• Адаптивный дизайн
• Поддержка темной темы
• Современные анимации

👨‍💻 <b>Разработчик:</b> Ваше имя
📅 <b>Версия:</b> 1.0.0
    """
    
    await message.answer(about_text, parse_mode="HTML")

@dp.message(F.web_app_data)
async def web_app_data_handler(message: types.Message):
    """Обработчик данных от WebApp"""
    try:
        # Получаем данные от WebApp
        web_app_data = message.web_app_data.data
        logger.info(f"Received WebApp data: {web_app_data}")
        
        # Парсим JSON данные
        import json
        try:
            data = json.loads(web_app_data)
            action = data.get('action', 'unknown')
            
            if action == 'gift_won':
                # Обработка выигрыша подарка
                gift = data.get('gift', {})
                spins_left = data.get('spinsLeft', 0)
                
                gift_name = gift.get('name', 'Unknown Gift')
                rarity = gift.get('rarity', 'common')
                
                # Эмодзи для редкости
                rarity_emoji = {
                    'common': '⚪',
                    'rare': '🔵', 
                    'epic': '🟣',
                    'legendary': '🟡'
                }
                
                response_text = f"""
🎉 <b>Поздравляем с выигрышем!</b>

🎁 <b>Подарок:</b> {gift_name}
{rarity_emoji.get(rarity, '⚪')} <b>Редкость:</b> {rarity.title()}
🎰 <b>Спинов осталось:</b> {spins_left}

{f"🎊 <b>ЛЕГЕНДАРНЫЙ ПОДАРОК!</b> Невероятная удача!" if rarity == 'legendary' else ""}
                """
                
            elif action == 'user_interaction':
                # Обработка взаимодействия с интерфейсом
                interaction_data = data.get('data', {})
                interaction_action = interaction_data.get('action', 'unknown')
                
                response_text = f"""
📊 <b>Взаимодействие зафиксировано</b>

🔧 <b>Действие:</b> {interaction_action}
⏰ <b>Время:</b> {data.get('timestamp', 'unknown')}
                """
                
            else:
                # Обработка других действий
                response_text = f"""
✅ <b>Данные получены от WebApp!</b>

📊 <b>Действие:</b> {action}
📝 <b>Данные:</b> <code>{web_app_data}</code>
                """
                
        except json.JSONDecodeError:
            # Если не JSON, показываем как обычно
            response_text = f"""
✅ <b>Данные получены от WebApp!</b>

📊 <code>{web_app_data}</code>
            """
        
        await message.answer(response_text, parse_mode="HTML")
        
    except Exception as e:
        logger.error(f"Error processing WebApp data: {e}")
        await message.answer(
            "❌ <b>Ошибка обработки данных</b>",
            parse_mode="HTML"
        )

@dp.message()
async def echo_handler(message: types.Message):
    """Обработчик всех остальных сообщений"""
    keyboard = InlineKeyboardMarkup(inline_keyboard=[[
        InlineKeyboardButton(
            text="🚀 Открыть WebApp",
            web_app=WebAppInfo(url=WEBAPP_URL)
        )
    ]])
    
    await message.answer(
        "🤖 Привет! Я бот для работы с WebApp.\n\n"
        "📱 Нажмите кнопку ниже, чтобы открыть приложение, "
        "или используйте команду /help для получения справки.",
        reply_markup=keyboard
    )

async def set_bot_commands():
    """Установка команд бота"""
    commands = [
        types.BotCommand(command="start", description="🏠 Главное меню"),
        types.BotCommand(command="webapp", description="🌐 Открыть WebApp"),
        types.BotCommand(command="help", description="🆘 Помощь"),
        types.BotCommand(command="about", description="ℹ️ О приложении"),
    ]
    
    await bot.set_my_commands(commands)
    logger.info("Bot commands set successfully")

async def set_menu_button():
    """Установка кнопки меню с WebApp"""
    try:
        menu_button = MenuButtonWebApp(
            text="🚀 Открыть WebApp",
            web_app=WebAppInfo(url=WEBAPP_URL)
        )
        await bot.set_chat_menu_button(menu_button=menu_button)
        logger.info("Menu button set successfully")
    except Exception as e:
        logger.error(f"Error setting menu button: {e}")

async def main():
    """Главная функция"""
    try:
        # Установка команд и кнопки меню
        await set_bot_commands()
        await set_menu_button()
        
        # Запуск бота
        logger.info("Starting bot...")
        await dp.start_polling(bot)
        
    except Exception as e:
        logger.error(f"Error starting bot: {e}")
    finally:
        await bot.session.close()

if __name__ == '__main__':
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Bot stopped by user")