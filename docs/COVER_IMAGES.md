# 🖼️ Обложки игр в VennGrid.js

## Как это работает

VennGrid.js **автоматически отображает обложки** игр в tooltip при наведении на ячейку на 0.5 секунды.

## Формат данных

Просто добавьте поле `cover` с URL на изображение (JPG, PNG, WebP, etc.):

```javascript
const gameData = {
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
                    year: 2015,
                    price: 29.99,
                    developer: 'CD Projekt Red',
                    genre: 'RPG',
                    cover: 'https://example.com/covers/witcher3.jpg'  // ← Ваш JPG
                },
                {
                    id: 2,
                    title: 'Skyrim',
                    slug: 'skyrim',
                    cover: '/static/images/covers/skyrim.jpg'  // ← Относительный путь тоже работает
                }
            ]
        }
    ]
};
```

## Поддерживаемые форматы

- ✅ **JPG/JPEG** - рекомендуется для обложек
- ✅ **PNG** - для изображений с прозрачностью
- ✅ **WebP** - современный формат, меньший размер
- ✅ **GIF** - для анимированных обложек

## Рекомендации

### 1. Размер изображений
- **Ширина**: 300-600px (оптимально 400px)
- **Высота**: 400-800px (оптимально 600px)
- **Соотношение**: 2:3 (как обложка книги)

### 2. Оптимизация
```bash
# Оптимизация JPG с качеством 85%
convert input.jpg -quality 85 -resize 400x600 output.jpg

# Или используйте WebP для меньшего размера
cwebp -q 85 input.jpg -o output.webp
```

### 3. CDN и кэширование
Храните обложки на CDN для быстрой загрузки:
```javascript
cover: 'https://cdn.yourgame.com/covers/witcher3.jpg'
```

## Обработка ошибок

Если изображение не загрузится, оно **автоматически скроется** - tooltip останется работать без обложки:

```javascript
// В коде библиотеки:
<img src="${item.cover}" onerror="this.style.display='none'">
```

## Примеры интеграции

### С Django
```python
# views.py
def get_games(request):
    games = Game.objects.all()
    return JsonResponse({
        'sets': [{
            'id': 'all',
            'label': 'All Games',
            'items': [{
                'id': game.id,
                'title': game.title,
                'slug': game.slug,
                'cover': game.cover.url,  # Django ImageField
                # ... другие поля
            } for game in games]
        }]
    })
```

### С статическими файлами
```javascript
// Структура папок:
// public/
//   covers/
//     witcher3.jpg
//     skyrim.jpg
//     darksouls.jpg

const games = [
    {
        id: 1,
        title: 'The Witcher 3',
        cover: '/covers/witcher3.jpg'
    }
];
```

### С внешними API
```javascript
// Например, IGDB API
fetch('https://api.igdb.com/v4/games')
    .then(res => res.json())
    .then(games => {
        const vennData = {
            sets: [{
                id: 'games',
                items: games.map(game => ({
                    id: game.id,
                    title: game.name,
                    cover: game.cover.url  // URL из API
                }))
            }]
        };
        vennGrid.setData(vennData);
    });
```

## Без обложки

Если обложка не нужна, просто **не добавляйте поле `cover`** - tooltip будет работать без изображения:

```javascript
{
    id: 1,
    title: 'Game Without Cover',
    slug: 'game-1',
    genre: 'Action'
    // cover: НЕТ - tooltip будет без картинки
}
```

## Стилизация

Обложка отображается с такими стилями:
```css
img {
    width: 100%;           /* Занимает всю ширину tooltip */
    height: auto;          /* Пропорциональная высота */
    border-radius: 4px;    /* Скругленные углы */
    margin-bottom: 10px;   /* Отступ снизу */
}
```

Tooltip имеет максимальную ширину **300px**, поэтому обложка будет масштабирована соответственно.

## Полный пример

```html
<!DOCTYPE html>
<html>
<head>
    <title>VennGrid с обложками</title>
</head>
<body>
    <canvas id="venn-canvas"></canvas>
    
    <script src="venn-grid.js"></script>
    <script>
        const vennGrid = new VennGrid('venn-canvas', {
            cellSize: 50
        });
        
        const data = {
            sets: [
                {
                    id: 'rpg',
                    label: 'RPG',
                    items: [
                        {
                            id: 1,
                            title: 'The Witcher 3',
                            slug: 'witcher3',
                            genre: 'RPG',
                            rating: 9.5,
                            year: 2015,
                            developer: 'CD Projekt Red',
                            price: 29.99,
                            cover: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1wyy.jpg'
                        }
                    ]
                }
            ]
        };
        
        vennGrid.setData(data);
    </script>
</body>
</html>
```

## Важно! ⚠️

1. **CORS**: Убедитесь что сервер с изображениями разрешает CORS, если обложки на другом домене
2. **HTTPS**: Если ваш сайт на HTTPS, обложки тоже должны быть на HTTPS
3. **Размер**: Не используйте огромные изображения (> 2MB) - это замедлит загрузку

---

**Версия**: 2.3.3  
**Последнее обновление**: 2025-11-21

