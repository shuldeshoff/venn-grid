# 📋 Инструкция для заказчика: VennGrid.js v2.1.0

**Дата:** 21 ноября 2025  
**Версия:** 2.1.0

---

## ✅ Что реализовано

### 1. 🎨 Иконка и название в каждой ячейке

✅ **Готово!** Каждая ячейка теперь показывает:
- Иконку игры (геймпад)
- Название игры
- Дополнительные детали при приближении

**Пример визуализации:**

```
┌──────────────┐
│      🎮      │  ← Иконка геймпада
│The Witcher 3 │  ← Название игры
│ RPG • ★9.5  │  ← Жанр + рейтинг
│    2015      │  ← Год выпуска
└──────────────┘
```

### 2. 📏 Адаптивное отображение при масштабировании

✅ **Готово!** Библиотека автоматически меняет детализацию:

| Zoom уровень | Что показывается |
|--------------|------------------|
| **0.5x - 1.0x** | Точка/индикатор (для обзора) |
| **1.0x - 1.5x** | Иконка + короткое название |
| **1.5x+** | Полная информация + жанры |

**Как это работает:**
- Отдалили (zoom out) → видно много ячеек, но мало деталей
- Приблизили (zoom in) → видно детали: жанр, рейтинг, год

### 3. 🖱️ Клик → переход на страницу игры

✅ **Готово!** При клике на ячейку автоматически открывается страница игры.

**Как это работает:**
- Пользователь кликает на ячейку
- Браузер переходит на `/games/{slug}/`
- Например: клик на "The Witcher 3" → `/games/witcher3/`

---

## 🚀 Как использовать

### Шаг 1: Подключите библиотеку

```html
<canvas id="vennCanvas" width="800" height="600"></canvas>

<script src="venn-grid.min.js"></script>
<script>
const venn = new VennGrid(document.getElementById('vennCanvas'));
</script>
```

### Шаг 2: Загрузите данные игр

```javascript
venn.setData({
    sets: [
        {
            id: 'set1',
            label: 'RPG Games',
            items: [
                {
                    id: 1,
                    title: 'The Witcher 3',      // ОБЯЗАТЕЛЬНО
                    slug: 'witcher3',             // ОБЯЗАТЕЛЬНО (для ссылки)
                    genre: 'RPG',                 // Показывается при zoom
                    rating: 9.5,                  // Показывается при zoom
                    year: 2015                    // Показывается при zoom
                }
            ]
        },
        {
            id: 'set2',
            label: 'Singleplayer',
            items: [...]
        }
    ]
});
```

### Шаг 3: Всё готово!

Библиотека автоматически:
- ✅ Покажет иконки и названия
- ✅ Добавит жанры при приближении
- ✅ Откроет страницу игры при клике

---

## 📊 Формат данных

### Обязательные поля

```javascript
{
    id: 1,                    // Уникальный ID
    title: 'The Witcher 3',   // Название игры
    slug: 'witcher3'          // Для URL ссылки
}
```

### Опциональные поля (для детализации)

```javascript
{
    genre: 'RPG',             // Жанр (показывается при zoom > 1.5)
    rating: 9.5,              // Рейтинг (показывается при zoom > 1.5)
    year: 2015,               // Год (показывается при zoom > 1.5)
    price: 29.99,             // Цена
    developer: 'CD Projekt'   // Разработчик
}
```

---

## 🎮 Управление

### Мышь
- **Колесо мыши** → Zoom (приближение/отдаление)
- **Клик левой кнопкой** → Переход на страницу игры
- **Зажать и тянуть** → Перемещение (pan)

### Кнопки (если добавите)
```html
<button onclick="venn.zoomIn()">+</button>
<button onclick="venn.zoomOut()">-</button>
<button onclick="venn.resetView()">Сброс</button>
```

---

## 🔧 Интеграция с Django

### Backend (Django views.py)

```python
from django.http import JsonResponse
from .models import Game

def venn_api(request):
    genre_ids = request.GET.getlist('genres')
    
    games = Game.objects.filter(
        genres__id__in=genre_ids,
        is_published=True
    ).distinct()
    
    return JsonResponse({
        'sets': [{
            'id': 'set1',
            'label': 'Выбранные жанры',
            'items': [{
                'id': game.id,
                'title': game.title,
                'slug': game.slug,
                'genre': game.main_genre.name if game.main_genre else None,
                'rating': float(game.average_rating) if game.average_rating else None,
                'year': game.release_year,
                'price': float(game.price) if game.price else None
            } for game in games]
        }]
    })
```

### Frontend (Django template)

```html
<canvas id="vennCanvas"></canvas>

<script src="{% static 'js/venn-grid.min.js' %}"></script>
<script>
const venn = new VennGrid(document.getElementById('vennCanvas'));

// Загрузка данных с вашего API
fetch('/api/venn/?genres=1,2,3')
    .then(r => r.json())
    .then(data => venn.setData(data));
</script>
```

---

## 📁 Файлы проекта

```
venn-grid/
├── dist/
│   ├── venn-grid.js          ← Development версия
│   └── venn-grid.min.js      ← Production версия (11KB) ⭐
├── examples/
│   ├── standalone.html       ← Рабочий пример
│   └── with-django.html      ← Пример с Django
├── docs/
│   ├── ADAPTIVE_DISPLAY.md   ← Документация по новым фичам
│   ├── API.md                ← Полное API
│   └── TZ_v2.md              ← Техническое задание
└── test/
    ├── unit-tests.js         ← Автотесты
    └── algorithm-test.html   ← Визуальные тесты
```

---

## 🧪 Как проверить

### 1. Открыть пример в браузере
```bash
open examples/standalone.html
```

### 2. Попробовать функционал
- ✅ Видите иконки и названия?
- ✅ Приблизьте (колесо мыши) → появляются жанры?
- ✅ Кликните на ячейку → работает переход?

### 3. Запустить тесты
```bash
node test/unit-tests.js
```

---

## ✨ Дополнительные возможности

### Кастомный обработчик клика

Если хотите показать модальное окно вместо перехода:

```javascript
const venn = new VennGrid(canvas, {
    onCellClick: function(event) {
        // Показать модальное окно
        showGameModal(event.item);
    }
});
```

### Смена цветовой палитры

```javascript
venn.setPalette(0);  // Пастельная
venn.setPalette(1);  // Яркая RGB
```

### Изменение размера ячеек

```javascript
venn.setCellSize(60);  // Большие ячейки
venn.setCellSize(40);  // Маленькие ячейки
```

---

## 📞 Поддержка

**Версия:** 2.1.0  
**Статус:** ✅ Готово к production  
**Тесты:** ✅ Все проходят  
**Документация:** ✅ Полная

### Файлы документации
- `docs/ADAPTIVE_DISPLAY.md` - Новые возможности
- `docs/API.md` - Полное API
- `docs/TZ_v2.md` - Техническое задание
- `CHANGELOG.md` - История изменений

---

## 🎯 Что получил заказчик

✅ **Иконка и название в каждой ячейке** - работает  
✅ **Жанры появляются при приближении** - работает  
✅ **Клик открывает страницу игры** - работает  
✅ **Адаптивное отображение по zoom** - работает  
✅ **Полностью протестировано** - unit + визуальные тесты  
✅ **Готово к интеграции с Django** - примеры кода готовы  

**Всё работает! Готово к использованию!** 🚀

---

**Дата сдачи:** 21 ноября 2025  
**Версия:** 2.1.0  
**Разработчик:** VennGrid Team

