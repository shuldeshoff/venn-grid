# VennGrid.js

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/venn-grid.svg)](https://www.npmjs.com/package/venn-grid)
[![GitHub stars](https://img.shields.io/github/stars/shuldeshoff/venn-grid.svg)](https://github.com/shuldeshoff/venn-grid/stargazers)

Standalone JavaScript библиотека для сеточной визуализации пересечений множеств (диаграммы Венна). Идеально подходит для каталогов игр, фильмов и других коллекций.

![VennGrid Demo](https://via.placeholder.com/800x400/2a2a2a/ffffff?text=VennGrid.js+Demo)

## ✨ Особенности

- 🎮 **Полный алгоритм из Godot** - портирован с GDScript на JavaScript
- 🚀 **Zero dependencies** - работает через простой `<script>` тег
- 🎯 **Битовая маркировка** - эффективное вычисление пересечений
- 🔍 **Zoom & Pan** - интерактивное масштабирование и перемещение
- 🎨 **Адаптивный дизайн** - автоматическое обрезание текста под размер ячейки
- 🖼️ **Tooltip с обложками** - всплывающие подсказки с изображениями (JPG/PNG/WebP)
- 📊 **Подобласти** - детализация данных с дополнительной фильтрацией
- 🎭 **Цветовые палитры** - две встроенные темы оформления

## 📦 Установка

### Через CDN (jsDelivr)

```html
<script src="https://cdn.jsdelivr.net/gh/shuldeshoff/venn-grid@main/dist/venn-grid.min.js"></script>
```

### Через npm

```bash
npm install venn-grid
```

### Локально

Скачайте [`venn-grid.min.js`](dist/venn-grid.min.js) и подключите:

```html
<script src="venn-grid.min.js"></script>
```

## 🚀 Быстрый старт

```html
<!DOCTYPE html>
<html>
<head>
    <title>VennGrid Example</title>
</head>
<body>
    <canvas id="vennCanvas"></canvas>

    <script src="venn-grid.min.js"></script>
    <script>
        const venn = new VennGrid('vennCanvas', {
            cellSize: 50,
            padding: 20
        });

        venn.setData({
            sets: [
                {
                    id: 'rpg',
                    label: 'RPG Games',
                    items: [
                        {
                            id: 1, 
                            title: 'The Witcher 3', 
                            slug: 'witcher3', 
                            rating: 9.5,
                            cover: 'https://example.com/witcher3.jpg'
                        },
                        {
                            id: 2, 
                            title: 'Skyrim', 
                            slug: 'skyrim', 
                            rating: 9.2,
                            cover: 'https://example.com/skyrim.jpg'
                        }
                    ]
                },
                {
                    id: 'action',
                    label: 'Action Games',
                    items: [
                        {
                            id: 1, 
                            title: 'The Witcher 3', 
                            slug: 'witcher3', 
                            rating: 9.5,
                            cover: 'https://example.com/witcher3.jpg'
                        }
                    ]
                }
            ]
        });
    </script>
</body>
</html>
```

## 📖 Документация

### Опции инициализации

```javascript
const venn = new VennGrid('canvas-id', {
    cellSize: 50,           // Размер ячейки в пикселях
    padding: 20,            // Отступы от краев canvas
    aspectRatio: 1.3,       // Соотношение сторон для сетки
    enableZoom: true,       // Включить масштабирование колесом мыши
    enablePan: true,        // Включить перемещение перетаскиванием
    paletteIndex: 0,        // Индекс цветовой палитры (0 или 1)
    
    // Callback при клике на ячейку
    onCellClick: (item) => {
        console.log('Clicked:', item.title);
        window.location.href = '/games/' + item.slug;
    }
});
```

### API методы

| Метод | Описание |
|-------|----------|
| `setData(data)` | Установить данные и отрисовать диаграмму |
| `render()` | Перерисовать canvas |
| `zoomIn()` | Увеличить масштаб |
| `zoomOut()` | Уменьшить масштаб |
| `resetView()` | Сбросить zoom и pan к начальному состоянию |
| `setPalette(index)` | Переключить цветовую палитру (0 или 1) |
| `getStats()` | Получить статистику (количество элементов и т.д.) |
| `getCellAt(x, y)` | Получить элемент по координатам экрана |
| `getTotalItems()` | Получить общее количество элементов |
| `clear()` | Очистить canvas |
| `destroy()` | Удалить все обработчики и очистить canvas |

### Формат данных

```javascript
{
    sets: [
        {
            id: 'set1',              // Уникальный ID множества
            label: 'My Set',         // Название для отображения
            items: [
                {
                    id: 1,           // Уникальный ID элемента (для пересечений)
                    title: 'Item 1', // Название (обязательно)
                    slug: 'item-1',  // URL slug для навигации
                    cover: 'url',    // URL обложки (JPG/PNG/WebP)
                    genre: 'RPG',    // Жанр
                    rating: 9.5,     // Рейтинг
                    year: 2023,      // Год
                    developer: '',   // Разработчик
                    price: 29.99     // Цена
                    // ... любые другие поля
                }
            ]
        }
    ],
    
    // Опционально: фильтры для подобластей
    subareaFilters: {
        set1: {
            a: (item) => item.rating > 9.0,
            b: (item) => item.rating > 8.0 && item.rating <= 9.0
        }
    }
}
```

## 🎮 Примеры

- [**Базовый пример**](examples/standalone.html) - простая диаграмма с играми
- [**С реальными обложками**](examples/with-real-covers.html) - tooltip с изображениями из IGDB
- [**Интеграция с Django**](examples/with-django.html) - подключение к бекенду

## 🔧 Разработка

```bash
# Установка зависимостей
npm install

# Сборка для production
npm run build

# Копирование в dist (dev)
npm run dev

# Watch режим
npm run watch
```

## 📚 Документация

- [**Django + Alpine.js Integration**](docs/DJANGO_ALPINE_INTEGRATION.md) - полный гайд по интеграции со стеком Django + Alpine.js
- [**API Reference**](docs/API.md) - подробное описание всех методов и опций
- [**Работа с обложками**](docs/COVER_IMAGES.md) - как использовать изображения JPG/PNG/WebP
- [**Contributing Guide**](CONTRIBUTING.md) - как внести вклад в проект

## 🤝 Вклад в проект

Pull requests приветствуются! Для крупных изменений сначала откройте issue для обсуждения.

## 📄 Лицензия

[MIT](LICENSE) © VennGrid Team

## 🌟 Поддержите проект

Если вам нравится VennGrid.js, поставьте ⭐ на [GitHub](https://github.com/shuldeshoff/venn-grid)!

---

**Версия**: 2.3.4 | **Размер**: 16KB (минифицированная) | **Зависимости**: 0

