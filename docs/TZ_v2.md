# ТЗ на разработку библиотеки VennGrid.js v2.0
## Полнофункциональная визуализация пересечений множеств игр

---

## 1. ОБЩАЯ ИНФОРМАЦИЯ

### 1.1 Название библиотеки
**VennGrid.js** - Standalone JavaScript библиотека для сеточной визуализации пересечений множеств

### 1.2 Цель разработки
Создать **полностью независимую** JavaScript библиотеку, которая:
- Работает через простой `<script>` тег (без сборщиков)
- Реализует полный алгоритм из Godot версии
- Визуализирует пересечения множеств игр на сетке
- Легко интегрируется с Django проектом
- Поддерживает подобласти для детальной фильтрации
- Совместима с Alpine.js

### 1.3 Отличия от Godot версии
| Аспект | Godot | VennGrid.js |
|--------|-------|-------------|
| Входные данные | CSV файлы | JSON с играми от Django API |
| Фильтрация | В клиенте (GDScript) | На backend (Django) |
| Визуализация | GridContainer + Panels | HTML5 Canvas |
| Интерактивность | Godot UI события | Canvas + DOM события |
| Данные | Файлы с путями | Игры с метаданными |

### 1.4 Стек проекта IndieBase
- **Backend**: Python 3.12 + Django 4.2
- **Frontend**: Vanilla JS + Alpine.js 3.x
- **Стили**: Bootstrap 5 + Custom CSS
- **База данных**: SQLite (dev), PostgreSQL (prod)

---

## 2. АРХИТЕКТУРА СИСТЕМЫ

### 2.1 Разделение ответственности

```
┌─────────────────────────────────────────────────────────┐
│                    DJANGO BACKEND                       │
├─────────────────────────────────────────────────────────┤
│ 1. Фильтрация игр по критериям                         │
│ 2. Формирование множеств (sets)                         │
│ 3. Отправка JSON с играми                              │
└─────────────────────────────────────────────────────────┘
                          ↓ JSON
┌─────────────────────────────────────────────────────────┐
│                  VENNGRID.JS LIBRARY                    │
├─────────────────────────────────────────────────────────┤
│ 1. Битовая маркировка (определение пересечений)        │
│ 2. Сортировка в области (set1, set2, intersection12..) │
│ 3. Проверка подобластей (по дополнительным критериям)  │
│ 4. Балансировка (оптимизация размещения)               │
│ 5. Расчет размеров сетки (эвристический алгоритм)      │
│ 6. Canvas рендеринг (отрисовка цветных ячеек)          │
│ 7. Интерактивность (клики, zoom, pan)                  │
└─────────────────────────────────────────────────────────┘
```

---

## 3. ФОРМАТ ДАННЫХ

### 3.1 Входной формат (от Django API)

```javascript
const data = {
    sets: [
        {
            id: 'set1',
            label: 'Жанр: RPG',
            color: '#f5c7c7',  // Опционально
            items: [
                {
                    id: 1,
                    title: 'The Witcher 3',
                    slug: 'the-witcher-3',
                    cover: '/media/covers/witcher3.jpg',
                    developer: 'CD Projekt Red',
                    year: 2015,
                    rating: 9.5,
                    platform: 'PC',
                    price: 29.99,
                    // ... любые дополнительные поля
                }
                // ... больше игр
            ]
        },
        {
            id: 'set2',
            label: 'Тег: Singleplayer',
            items: [...]
        },
        {
            id: 'set3',  // Опционально (поддержка 1-3 множеств)
            label: 'Платформа: PC',
            items: [...]
        }
    ],
    
    // Опционально: критерии для подобластей
    subareaFilters: {
        set1: [
            {field: 'rating', operator: '>=', value: 9.0, label: 'Высокий рейтинг'},
            {field: 'year', operator: '>=', value: 2020, label: 'Новые игры'}
        ],
        set2: [
            {field: 'price', operator: '<', value: 20, label: 'До $20'}
        ],
        set3: [...]
    }
};
```

### 3.2 Внутреннее представление элемента (после обработки)

```javascript
{
    id: 1,
    title: 'The Witcher 3',
    slug: 'the-witcher-3',
    cover: '/media/covers/witcher3.jpg',
    developer: 'CD Projekt Red',
    year: 2015,
    rating: 9.5,
    
    // Добавляется библиотекой:
    _bitmask: 5,        // 101 (в set1 и set3)
    _subareamask: 1,    // Подобласть 'a' в set1
    _area: 'set1',      // Основная область
    _subarea: 'a'       // Подобласть
}
```

---

## 4. АЛГОРИТМ РАБОТЫ (5 ЭТАПОВ)

### Этап 1: Битовая маркировка (Bitmask Assignment)

**Задача:** Определить в каких множествах находится каждая игра.

**Алгоритм:**
```javascript
function calculateBitmasks(sets) {
    const allItems = new Map();
    
    // Собираем все уникальные игры
    sets.forEach((set, setIndex) => {
        set.items.forEach(item => {
            if (!allItems.has(item.id)) {
                allItems.set(item.id, {
                    ...item,
                    _bitmask: 0
                });
            }
            // Устанавливаем бит для этого множества
            allItems.get(item.id)._bitmask |= (1 << setIndex);
        });
    });
    
    return Array.from(allItems.values());
}
```

**Битовые маски:**
```
Игра в set1:           001 = 1
Игра в set2:           010 = 2
Игра в set1+set2:      011 = 3
Игра в set3:           100 = 4
Игра в set1+set3:      101 = 5
Игра в set2+set3:      110 = 6
Игра во всех трех:     111 = 7
```

**Пример:**
```javascript
// The Witcher 3 есть в "RPG" (set1) и "PC" (set3)
{
    id: 1,
    title: 'The Witcher 3',
    _bitmask: 5  // 101 = set1 + set3
}
```

---

### Этап 2: Сортировка в области (Area Sorting)

**Задача:** Распределить игры по областям диаграммы Венна.

**Структура данных:**
```javascript
sorted = {
    set1: [],           // Только в множестве 1
    set2: [],           // Только в множестве 2
    set3: [],           // Только в множестве 3
    intersection12: [], // В 1 и 2
    intersection13: [], // В 1 и 3
    intersection23: [], // В 2 и 3
    intersection123: [] // Во всех трех
};
```

**Алгоритм:**
```javascript
function sortIntoAreas(items) {
    const sorted = {
        set1: [], set2: [], set3: [],
        intersection12: [], intersection13: [],
        intersection23: [], intersection123: []
    };
    
    items.forEach(item => {
        switch (item._bitmask) {
            case 1: // 001
                sorted.set1.push(item);
                break;
            case 2: // 010
                sorted.set2.push(item);
                break;
            case 3: // 011
                sorted.intersection12.push(item);
                break;
            case 4: // 100
                sorted.set3.push(item);
                break;
            case 5: // 101
                sorted.intersection13.push(item);
                break;
            case 6: // 110
                sorted.intersection23.push(item);
                break;
            case 7: // 111
                sorted.intersection123.push(item);
                break;
        }
    });
    
    return sorted;
}
```

---

### Этап 3: Подобласти (Subareas)

**Задача:** Дополнительная детализация внутри основных областей.

**Пример:** Игры жанра RPG можно разделить на:
- `a` - Высокий рейтинг (≥9.0)
- `b` - Низкий рейтинг (<9.0)
- `c` - Новые игры (≥2020)
- `d` - Старые игры (<2020)

**Структура данных:**
```javascript
subsorted = {
    set1: {
        a: [],  // RPG с рейтингом ≥9.0
        b: [],  // RPG с рейтингом <9.0
        c: [],  // RPG новые
        d: []   // RPG старые
    },
    set2: {
        a: [],  // Singleplayer дешевые (<$20)
        b: [],  // Singleplayer дорогие
        c: [], d: []
    },
    set3: {a: [], b: [], c: [], d: []}
};
```

**Алгоритм:**
```javascript
function checkSubareas(items, area, subareaFilters) {
    if (!subareaFilters || !subareaFilters[area]) {
        return {main: items, subareas: {}};
    }
    
    const subareas = {a: [], b: [], c: [], d: []};
    const main = [];
    const subareaLabels = ['a', 'b', 'c', 'd'];
    
    items.forEach(item => {
        let assigned = false;
        
        subareaFilters[area].forEach((filter, index) => {
            if (assigned) return;
            
            const value = item[filter.field];
            let matches = false;
            
            switch (filter.operator) {
                case '>=':
                    matches = value >= filter.value;
                    break;
                case '<=':
                    matches = value <= filter.value;
                    break;
                case '<':
                    matches = value < filter.value;
                    break;
                case '>':
                    matches = value > filter.value;
                    break;
                case '==':
                    matches = value === filter.value;
                    break;
            }
            
            if (matches) {
                item._subarea = subareaLabels[index];
                subareas[subareaLabels[index]].push(item);
                assigned = true;
            }
        });
        
        if (!assigned) {
            main.push(item);
        }
    });
    
    return {main, subareas};
}
```

---

### Этап 4: Балансировка (Area Shuffling)

**Задача:** Переставить области так, чтобы самая большая была первой (слева).

**Зачем:** Улучшение визуального восприятия и читаемости.

**Алгоритм:**
```javascript
function shuffleAreas(sorted, subsorted) {
    // Пузырьковая сортировка для 3 областей
    function swap(area1, area2, cross1, cross2) {
        const size1 = sorted[area1].length + sorted[cross1].length;
        const size2 = sorted[area2].length + sorted[cross2].length;
        
        if (size1 < size2) {
            // Меняем sorted
            [sorted[area1], sorted[area2]] = [sorted[area2], sorted[area1]];
            [sorted[cross1], sorted[cross2]] = [sorted[cross2], sorted[cross1]];
            
            // Меняем subsorted
            [subsorted[area1], subsorted[area2]] = [subsorted[area2], subsorted[area1]];
        }
    }
    
    // Три прохода для сортировки
    swap('set1', 'set2', 'intersection13', 'intersection23');
    swap('set2', 'set3', 'intersection12', 'intersection13');
    swap('set1', 'set2', 'intersection13', 'intersection23');
}
```

---

### Этап 5: Расчет размеров сетки (Grid Size Calculation)

**Задача:** Вычислить оптимальные размеры сетки для визуализации.

**Эвристическая формула:**
```javascript
const ASPECT_RATIO = 1.3; // Горизонтальная ориентация

function calculateGridSizes(sorted, subsorted) {
    // Шаг 1: Подсчет элементов в подобластях
    const n1a = subsorted.set1.a.length;
    const n1b = subsorted.set1.b.length;
    const n1c = subsorted.set1.c.length;
    const n1d = subsorted.set1.d.length;
    // ... для set2 и set3
    
    // Шаг 2: Размеры пересечений
    const n123 = sorted.intersection123.length;
    const n12 = sorted.intersection12.length + n123;
    const n13 = sorted.intersection13.length + n123;
    const n23 = sorted.intersection23.length + n123;
    
    // Шаг 3: Общие размеры областей
    const n1 = sorted.set1.length + n12 + n13 + n1a + n1b + n1c + n1d;
    const n2 = sorted.set2.length + n12 + n23 + n2a + n2b + n2c + n2d;
    const n3 = sorted.set3.length + n13 + n23 + n3a + n3b + n3c + n3d;
    
    // Шаг 4: Высота и ширина по формуле sqrt
    const h1 = Math.ceil(Math.sqrt(n1) / ASPECT_RATIO);
    const h2 = Math.ceil(Math.sqrt(n2) / ASPECT_RATIO);
    const l1 = Math.ceil(n1 / h1);
    const l2 = Math.ceil(n2 / h2);
    
    // Шаг 5: Размеры пересечений
    const h12 = Math.min(h1, h2);
    const l12 = Math.ceil(n12 / h12);
    const l123 = l12;
    const h123 = Math.ceil(n123 / l123);
    
    // Коррекция для оставшихся пересечений
    let n13_corrected = n13 - n123;
    let n23_corrected = n23 - n123;
    
    // Шаг 6: Размеры третьей области
    let l13, h13, l23, h23, l3, h3;
    
    if (n123 > 0) {
        l13 = Math.ceil(n13_corrected / h123);
        h13 = h123;
        l23 = Math.ceil(n23_corrected / h123);
        h23 = h123;
        l3 = l13 + l23 + l123;
        h3 = Math.ceil((n13_corrected + n23_corrected + n123) / l3);
    } else {
        l13 = Math.ceil(n13_corrected / h12);
        h13 = h12;
        l23 = Math.ceil(n23_corrected / h12);
        h23 = h12;
        l3 = l13 + l23 + l12;
        h3 = Math.ceil((n3 + n12) / l3);
        if (h3 === h12 && n3 - n13_corrected - n23_corrected > 0) {
            h3 += 1;
        }
    }
    
    // Шаг 7: Финальные размеры
    const width = n123 > 0 ? l1 + l2 - l123 : l1 + l2 - l12;
    const height = n123 > 0 ? h1 + h3 - h123 : h1 + h3 - h12;
    
    return {
        width,
        height,
        l1, l2, l3,
        h1, h2, h3,
        l12, l13, l23, l123,
        h12, h13, h23, h123
    };
}
```

**Концептуальная схема:**
```
┌───────────────────┬───────────────────┐
│                   │                   │
│      set1         │      set2         │
│   (RPG games)     │  (Singleplayer)   │
│                   │                   │
├──────┬────────────┼────────────┬──────┤
│      │intersection│intersection│      │
│ set1 │     12     │     23     │ set2 │
│      ├────────────┼────────────┤      │
│      │intersection│ inters.123 │      │
│      │     13     │  (центр)   │      │
├──────┴────────────┴────────────┴──────┤
│                                       │
│              set3                     │
│          (PC games)                   │
│                                       │
└───────────────────────────────────────┘
```

---

### Этап 6: Определение области для ячейки

**Задача:** По координатам (x, y) определить, к какой области относится ячейка.

**Алгоритм:**
```javascript
function getAreaAtPosition(x, y, gridSizes) {
    const {l1, l2, l3, h1, h2, h3, 
           l12, l13, l23, l123,
           h12, h13, h23, h123} = gridSizes;
    
    let area = '';
    let subarea = '';
    
    if (l123 > 0 && h123 > 0) {
        // Логика с центральным пересечением
        if (y < h3 - h123) {
            // Верхняя зона set3
            if (x >= l1 - l13 - l123 && x < l1 + l23) {
                area = 'set3';
                // Определение подобласти
                if (x <= l1 - l13 - l123 + Math.ceil(l3/2) - 1) {
                    subarea = 'a';
                } else if (x > l1 - l13 - l123 + Math.ceil(l3/2)) {
                    subarea = 'b';
                }
            }
        } else if (y < h3) {
            // Горизонтальная полоса с пересечениями
            if (x < l1 - l13 - l123) {
                area = 'set1';
            } else if (x < l1 - l123) {
                area = 'intersection13';
            } else if (x < l1) {
                area = 'intersection123'; // Центр!
            } else if (x < l1 + l23) {
                area = 'intersection23';
            } else {
                area = 'set2';
            }
        } else if (y < h2 + h3 - h123) {
            // Средняя полоса
            if (x < l1 - l123) {
                area = 'set1';
            } else if (x < l1) {
                area = 'intersection12';
            } else {
                area = 'set2';
            }
        } else {
            // Нижняя зона set1
            if (x < l1) {
                area = 'set1';
            }
        }
    } else {
        // Упрощенная логика без центра (аналогично)
        // ...
    }
    
    return {area, subarea};
}
```

---

## 5. API БИБЛИОТЕКИ

### 5.1 Инициализация

```javascript
const venn = new VennGrid(canvasElement, {
    cellSize: 50,
    padding: 20,
    enableZoom: true,
    enablePan: true,
    showLabels: true,
    showImages: true,
    
    // Callbacks
    onCellClick: function(event) {
        window.location.href = '/games/' + event.item.slug;
    },
    
    onCellHover: function(event) {
        showTooltip(event.item);
    }
});
```

### 5.2 Установка данных

```javascript
venn.setData({
    sets: [
        {
            id: 'set1',
            label: 'RPG',
            items: [...games]
        }
    ],
    subareaFilters: {
        set1: [
            {field: 'rating', operator: '>=', value: 9.0, label: 'High rated'}
        ]
    }
});
```

### 5.3 Основные методы

```javascript
// Управление отображением
venn.render();
venn.clear();
venn.zoomIn();
venn.zoomOut();
venn.resetView();

// Получение информации
venn.getStats();          // Статистика по областям
venn.getItemsInArea('set1');
venn.getCellAt(x, y);

// Настройка
venn.setPalette(paletteIndex);
venn.setCellSize(60);

// Уничтожение
venn.destroy();
```

### 5.4 Статистика

```javascript
const stats = venn.getStats();
/*
{
    total: 150,
    set1: 45,
    set2: 38,
    set3: 27,
    intersection12: 15,
    intersection13: 12,
    intersection23: 8,
    intersection123: 5,
    
    subareas: {
        set1: {a: 20, b: 25, c: 0, d: 0},
        set2: {a: 15, b: 23, c: 0, d: 0},
        set3: {a: 10, b: 17, c: 0, d: 0}
    },
    
    gridSize: {
        width: 42,
        height: 28
    }
}
*/
```

---

## 6. ИНТЕГРАЦИЯ С DJANGO

### 6.1 Django View

```python
# games/views.py
from django.http import JsonResponse
from .models import Game

def venn_api(request):
    """API для получения данных для диаграммы Венна"""
    # Получаем критерии фильтрации
    genre_ids = request.GET.getlist('genres')
    tag_ids = request.GET.getlist('tags')
    platform_ids = request.GET.getlist('platforms')
    
    sets = []
    
    # Множество 1: Жанры
    if genre_ids:
        games_set1 = Game.objects.filter(
            genres__id__in=genre_ids,
            is_published=True
        ).distinct()
        
        sets.append({
            'id': 'set1',
            'label': f'Жанры: {", ".join(Genre.objects.filter(id__in=genre_ids).values_list("name", flat=True))}',
            'items': [serialize_game(g) for g in games_set1]
        })
    
    # Множество 2: Теги
    if tag_ids:
        games_set2 = Game.objects.filter(
            hashtag_tags__id__in=tag_ids,
            is_published=True
        ).distinct()
        
        sets.append({
            'id': 'set2',
            'label': f'Теги: {", ".join(HashtagTag.objects.filter(id__in=tag_ids).values_list("name", flat=True))}',
            'items': [serialize_game(g) for g in games_set2]
        })
    
    # Множество 3: Платформы
    if platform_ids:
        games_set3 = Game.objects.filter(
            platforms__id__in=platform_ids,
            is_published=True
        ).distinct()
        
        sets.append({
            'id': 'set3',
            'label': f'Платформы: {", ".join(Platform.objects.filter(id__in=platform_ids).values_list("name", flat=True))}',
            'items': [serialize_game(g) for g in games_set3]
        })
    
    # Опционально: критерии для подобластей
    subarea_filters = {}
    if genre_ids:
        subarea_filters['set1'] = [
            {'field': 'rating', 'operator': '>=', 'value': 9.0, 'label': 'Рейтинг ≥9.0'},
            {'field': 'rating', 'operator': '<', 'value': 9.0, 'label': 'Рейтинг <9.0'}
        ]
    
    return JsonResponse({
        'sets': sets,
        'subareaFilters': subarea_filters
    })

def serialize_game(game):
    """Сериализация игры в JSON"""
    return {
        'id': game.id,
        'title': game.title,
        'slug': game.slug,
        'cover': game.cover_image.url if game.cover_image else None,
        'developer': game.developer,
        'year': game.release_year,
        'rating': float(game.average_rating) if game.average_rating else 0.0,
        'price': float(game.price) if game.price else 0.0,
        'platforms': list(game.platforms.values_list('name', flat=True)),
    }
```

### 6.2 Django Template

```html
{% extends 'base.html' %}
{% load static %}

{% block content %}
<div class="venn-container">
    <!-- Панель управления -->
    <div class="controls-panel">
        <h3>Критерии визуализации</h3>
        
        <!-- Множество 1: Жанры -->
        <div class="filter-group">
            <h5>Множество 1: Жанры</h5>
            {% for genre in genres %}
            <label>
                <input type="checkbox" value="{{ genre.id }}" class="genre-filter">
                {{ genre.name }}
            </label>
            {% endfor %}
        </div>
        
        <!-- Множество 2: Теги -->
        <div class="filter-group">
            <h5>Множество 2: Теги</h5>
            {% for tag in hashtag_tags %}
            <label>
                <input type="checkbox" value="{{ tag.id }}" class="tag-filter">
                {{ tag.name }}
            </label>
            {% endfor %}
        </div>
        
        <!-- Множество 3: Платформы -->
        <div class="filter-group">
            <h5>Множество 3: Платформы</h5>
            {% for platform in platforms %}
            <label>
                <input type="checkbox" value="{{ platform.id }}" class="platform-filter">
                {{ platform.name }}
            </label>
            {% endfor %}
        </div>
        
        <button onclick="visualize()" class="btn btn-primary">
            Визуализировать
        </button>
        
        <div class="controls">
            <button onclick="venn.zoomIn()">+</button>
            <button onclick="venn.zoomOut()">-</button>
            <button onclick="venn.resetView()">↺</button>
            <button onclick="venn.setPalette(0)">Палитра 1</button>
            <button onclick="venn.setPalette(1)">Палитра 2</button>
        </div>
        
        <div id="stats"></div>
    </div>
    
    <!-- Canvas -->
    <div class="canvas-area">
        <canvas id="vennCanvas"></canvas>
    </div>
</div>
{% endblock %}

{% block extra_js %}
<script src="{% static 'js/venn-grid.min.js' %}"></script>

<script>
let venn;

document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('vennCanvas');
    
    venn = new VennGrid(canvas, {
        cellSize: 50,
        enableZoom: true,
        enablePan: true,
        showLabels: true,
        showImages: true,
        
        onCellClick: function(event) {
            if (event.item && event.item.slug) {
                window.location.href = '/games/' + event.item.slug + '/';
            }
        },
        
        onCellHover: function(event) {
            if (event.item) {
                showTooltip(event.item);
            }
        },
        
        onRenderComplete: function() {
            updateStats();
        }
    });
});

async function visualize() {
    const genreIds = getSelectedValues('.genre-filter');
    const tagIds = getSelectedValues('.tag-filter');
    const platformIds = getSelectedValues('.platform-filter');
    
    if (genreIds.length === 0 && tagIds.length === 0 && platformIds.length === 0) {
        alert('Выберите хотя бы один критерий');
        return;
    }
    
    const params = new URLSearchParams();
    genreIds.forEach(id => params.append('genres', id));
    tagIds.forEach(id => params.append('tags', id));
    platformIds.forEach(id => params.append('platforms', id));
    
    const response = await fetch('/api/venn/?' + params);
    const data = await response.json();
    
    venn.setData(data);
}

function getSelectedValues(selector) {
    return Array.from(document.querySelectorAll(selector + ':checked'))
        .map(cb => cb.value);
}

function updateStats() {
    const stats = venn.getStats();
    document.getElementById('stats').innerHTML = `
        <h5>Статистика</h5>
        <p>Всего игр: ${stats.total}</p>
        <p>Множество 1: ${stats.set1}</p>
        <p>Множество 2: ${stats.set2}</p>
        <p>Множество 3: ${stats.set3}</p>
        <p>Пересечение 1∩2: ${stats.intersection12}</p>
        <p>Пересечение 1∩3: ${stats.intersection13}</p>
        <p>Пересечение 2∩3: ${stats.intersection23}</p>
        <p>Пересечение всех: ${stats.intersection123}</p>
        <p>Размер сетки: ${stats.gridSize.width}×${stats.gridSize.height}</p>
    `;
}

function showTooltip(item) {
    // Показать tooltip с информацией об игре
    console.log(item.title, item.rating, item.year);
}
</script>
{% endblock %}
```

---

## 7. СТРУКТУРА БИБЛИОТЕКИ

### 7.1 Один файл - вся библиотека

```javascript
// src/venn-grid.js

(function(window) {
    'use strict';
    
    // === КОНСТАНТЫ ===
    const DEFAULT_OPTIONS = {
        cellSize: 50,
        padding: 20,
        aspectRatio: 1.3,
        palette: [
            // Палитра 1: Пастельная
            {
                background: '#2a2a2a',
                empty: '#000000',
                set1: '#f5c7c7',
                set2: '#e6dbba',
                set3: '#99fa99',
                intersection12: '#e6c8f5',
                intersection13: '#c8e6c8',
                intersection23: '#f5f5c8',
                intersection123: '#ffffff',
                // Подобласти
                set1a: '#f8ac9d',
                set1b: '#f89599',
                set2a: '#fbe295',
                set2b: '#f5f84a',
                set3a: '#76f8c5',
                set3b: '#67d4ff',
                border: 'rgba(0,0,0,0.2)'
            },
            // Палитра 2: Яркая (RGB)
            {
                background: '#2a2a2a',
                empty: '#000000',
                set1: '#ff0000',
                set2: '#00ff00',
                set3: '#0000ff',
                intersection12: '#ffff00',
                intersection13: '#ff00ff',
                intersection23: '#00ffff',
                intersection123: '#ffffff',
                set1a: '#ff6666',
                set1b: '#ff3333',
                set2a: '#66ff66',
                set2b: '#33ff33',
                set3a: '#6666ff',
                set3b: '#3333ff',
                border: 'rgba(0,0,0,0.2)'
            }
        ],
        paletteIndex: 0,
        enableZoom: true,
        enablePan: true,
        minZoom: 0.1,
        maxZoom: 5.0,
        zoomStep: 0.1,
        showLabels: true,
        showImages: false,
        onCellClick: null,
        onCellHover: null,
        onZoomChange: null,
        onRenderComplete: null
    };
    
    // === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===
    
    function mergeOptions(defaults, options) {
        // Глубокое слияние опций
        // ...
    }
    
    function calculateBitmasks(sets) {
        // Этап 1: Битовая маркировка
        // ...
    }
    
    function sortIntoAreas(items) {
        // Этап 2: Сортировка в области
        // ...
    }
    
    function checkSubareas(items, area, subareaFilters) {
        // Этап 3: Подобласти
        // ...
    }
    
    function shuffleAreas(sorted, subsorted) {
        // Этап 4: Балансировка
        // ...
    }
    
    function calculateGridSizes(sorted, subsorted) {
        // Этап 5: Расчет размеров
        // ...
    }
    
    function getAreaAtPosition(x, y, gridSizes) {
        // Этап 6: Определение области
        // ...
    }
    
    // === ГЛАВНЫЙ КЛАСС ===
    
    function VennGrid(canvas, options) {
        if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
            throw new Error('VennGrid: первый аргумент должен быть HTMLCanvasElement');
        }
        
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.options = mergeOptions(DEFAULT_OPTIONS, options || {});
        
        // Состояние
        this.data = null;
        this.sorted = null;
        this.subsorted = null;
        this.gridSizes = null;
        this.positionMap = {};
        this.zoom = 1.0;
        this.pan = {x: 0, y: 0};
        this.dragging = false;
        this.dragStart = {x: 0, y: 0};
        
        this._setupEventListeners();
        this._resizeCanvas();
    }
    
    // === ПУБЛИЧНЫЕ МЕТОДЫ ===
    
    VennGrid.prototype.setData = function(data) {
        if (!data || !data.sets || !Array.isArray(data.sets)) {
            throw new Error('VennGrid: неверный формат данных');
        }
        
        if (data.sets.length < 1 || data.sets.length > 3) {
            throw new Error('VennGrid: поддерживается от 1 до 3 множеств');
        }
        
        this.data = data;
        
        // Pipeline обработки
        const items = calculateBitmasks(data.sets);
        this.sorted = sortIntoAreas(items);
        
        // Обработка подобластей
        this.subsorted = {
            set1: {a: [], b: [], c: [], d: []},
            set2: {a: [], b: [], c: [], d: []},
            set3: {a: [], b: [], c: [], d: []}
        };
        
        if (data.subareaFilters) {
            ['set1', 'set2', 'set3'].forEach(area => {
                if (this.sorted[area] && this.sorted[area].length > 0) {
                    const result = checkSubareas(
                        this.sorted[area],
                        area,
                        data.subareaFilters
                    );
                    this.sorted[area] = result.main;
                    this.subsorted[area] = result.subareas;
                }
            });
        }
        
        // Балансировка
        shuffleAreas(this.sorted, this.subsorted);
        
        // Расчет размеров
        this.gridSizes = calculateGridSizes(this.sorted, this.subsorted);
        
        // Отрисовка
        this.render();
    };
    
    VennGrid.prototype.render = function() {
        if (!this.data) return;
        
        this._drawGrid();
        
        if (this.options.onRenderComplete) {
            this.options.onRenderComplete();
        }
    };
    
    VennGrid.prototype._drawGrid = function() {
        // Очистка
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Фон
        const palette = this.options.palette[this.options.paletteIndex];
        this.ctx.fillStyle = palette.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Трансформации
        this.ctx.save();
        this.ctx.translate(this.pan.x, this.pan.y);
        this.ctx.scale(this.zoom, this.zoom);
        
        // Копия для pop()
        const sortedCopy = this._copySorted();
        
        // Отрисовка ячеек
        const cellSize = this.options.cellSize;
        this.positionMap = {};
        
        for (let y = 0; y < this.gridSizes.height; y++) {
            for (let x = 0; x < this.gridSizes.width; x++) {
                const {area, subarea} = getAreaAtPosition(x, y, this.gridSizes);
                
                if (area) {
                    let items;
                    if (subarea) {
                        items = sortedCopy.subsorted[area][subarea];
                    } else {
                        items = sortedCopy.sorted[area];
                    }
                    
                    if (items && items.length > 0) {
                        const item = items.pop();
                        
                        // Цвет ячейки
                        let colorKey = area;
                        if (subarea) colorKey += subarea;
                        const color = palette[colorKey] || palette.empty;
                        
                        // Рисуем ячейку
                        this.ctx.fillStyle = color;
                        this.ctx.fillRect(
                            x * cellSize,
                            y * cellSize,
                            cellSize - 1,
                            cellSize - 1
                        );
                        
                        // Граница
                        this.ctx.strokeStyle = palette.border;
                        this.ctx.strokeRect(
                            x * cellSize,
                            y * cellSize,
                            cellSize - 1,
                            cellSize - 1
                        );
                        
                        // Сохранить в карту
                        if (!this.positionMap[x]) this.positionMap[x] = {};
                        this.positionMap[x][y] = item;
                        
                        // Опционально: текст или изображение
                        if (this.options.showLabels || this.options.showImages) {
                            this._drawCellContent(x, y, item, cellSize);
                        }
                    }
                }
            }
        }
        
        this.ctx.restore();
    };
    
    VennGrid.prototype._drawCellContent = function(x, y, item, cellSize) {
        // Отрисовка контента ячейки (иконка, текст)
        // ...
    };
    
    VennGrid.prototype.zoomIn = function() {
        this.zoom = Math.min(this.zoom + this.options.zoomStep, this.options.maxZoom);
        this.render();
        if (this.options.onZoomChange) {
            this.options.onZoomChange(this.zoom);
        }
    };
    
    VennGrid.prototype.zoomOut = function() {
        this.zoom = Math.max(this.zoom - this.options.zoomStep, this.options.minZoom);
        this.render();
        if (this.options.onZoomChange) {
            this.options.onZoomChange(this.zoom);
        }
    };
    
    VennGrid.prototype.resetView = function() {
        this.zoom = 1.0;
        this.pan = {x: 0, y: 0};
        this.render();
    };
    
    VennGrid.prototype.setPalette = function(index) {
        if (index >= 0 && index < this.options.palette.length) {
            this.options.paletteIndex = index;
            this.render();
        }
    };
    
    VennGrid.prototype.getStats = function() {
        if (!this.sorted) return null;
        
        return {
            total: this._getTotalItems(),
            set1: this.sorted.set1 ? this.sorted.set1.length : 0,
            set2: this.sorted.set2 ? this.sorted.set2.length : 0,
            set3: this.sorted.set3 ? this.sorted.set3.length : 0,
            intersection12: this.sorted.intersection12 ? this.sorted.intersection12.length : 0,
            intersection13: this.sorted.intersection13 ? this.sorted.intersection13.length : 0,
            intersection23: this.sorted.intersection23 ? this.sorted.intersection23.length : 0,
            intersection123: this.sorted.intersection123 ? this.sorted.intersection123.length : 0,
            subareas: {
                set1: {
                    a: this.subsorted.set1.a.length,
                    b: this.subsorted.set1.b.length,
                    c: this.subsorted.set1.c.length,
                    d: this.subsorted.set1.d.length
                },
                set2: {
                    a: this.subsorted.set2.a.length,
                    b: this.subsorted.set2.b.length,
                    c: this.subsorted.set2.c.length,
                    d: this.subsorted.set2.d.length
                },
                set3: {
                    a: this.subsorted.set3.a.length,
                    b: this.subsorted.set3.b.length,
                    c: this.subsorted.set3.c.length,
                    d: this.subsorted.set3.d.length
                }
            },
            gridSize: {
                width: this.gridSizes.width,
                height: this.gridSizes.height
            }
        };
    };
    
    VennGrid.prototype.getCellAt = function(x, y) {
        // Преобразовать экранные координаты в координаты сетки
        const rect = this.canvas.getBoundingClientRect();
        const canvasX = x - rect.left - this.pan.x;
        const canvasY = y - rect.top - this.pan.y;
        
        const gridX = Math.floor(canvasX / (this.options.cellSize * this.zoom));
        const gridY = Math.floor(canvasY / (this.options.cellSize * this.zoom));
        
        if (this.positionMap[gridX] && this.positionMap[gridX][gridY]) {
            return this.positionMap[gridX][gridY];
        }
        
        return null;
    };
    
    VennGrid.prototype.destroy = function() {
        this._removeEventListeners();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.data = null;
        this.sorted = null;
        this.subsorted = null;
    };
    
    // === ПРИВАТНЫЕ МЕТОДЫ ===
    
    VennGrid.prototype._copySorted = function() {
        // Глубокое копирование для pop()
        // ...
    };
    
    VennGrid.prototype._getTotalItems = function() {
        // Подсчет общего количества элементов
        // ...
    };
    
    VennGrid.prototype._setupEventListeners = function() {
        // Установка обработчиков событий
        // ...
    };
    
    VennGrid.prototype._removeEventListeners = function() {
        // Удаление обработчиков
        // ...
    };
    
    VennGrid.prototype._handleWheel = function(e) {
        // Обработка zoom колесом мыши
        // ...
    };
    
    VennGrid.prototype._handleClick = function(e) {
        // Обработка кликов
        // ...
    };
    
    VennGrid.prototype._handleMouseDown = function(e) {
        // Начало drag
        // ...
    };
    
    VennGrid.prototype._handleMouseMove = function(e) {
        // Pan и hover
        // ...
    };
    
    VennGrid.prototype._handleMouseUp = function(e) {
        // Конец drag
        // ...
    };
    
    VennGrid.prototype._resizeCanvas = function() {
        // Адаптация размера canvas под контейнер
        // ...
    };
    
    // === ЭКСПОРТ ===
    window.VennGrid = VennGrid;
    
})(window);
```

---

## 8. СБОРКА И РАЗВЕРТЫВАНИЕ

### 8.1 package.json

```json
{
  "name": "venn-grid",
  "version": "2.0.0",
  "description": "Grid-based Venn diagram visualization library",
  "main": "dist/venn-grid.min.js",
  "scripts": {
    "dev": "cp src/venn-grid.js dist/venn-grid.js",
    "build": "terser src/venn-grid.js -o dist/venn-grid.min.js --compress --mangle",
    "watch": "nodemon --watch src --exec 'npm run dev'"
  },
  "devDependencies": {
    "terser": "^5.16.0",
    "nodemon": "^2.0.20"
  },
  "keywords": ["venn", "diagram", "visualization", "grid", "canvas"],
  "author": "Your Name",
  "license": "MIT"
}
```

### 8.2 Команды разработки

```bash
# Разработка
npm run dev

# Сборка production
npm run build

# Watch режим
npm run watch
```

---

## 9. ТЕСТИРОВАНИЕ

### 9.1 Тестовые данные

```javascript
// test/test-data.js
const testData = {
    sets: [
        {
            id: 'set1',
            label: 'RPG Games',
            items: [
                {id: 1, title: 'The Witcher 3', slug: 'witcher3', rating: 9.5, year: 2015, price: 29.99},
                {id: 2, title: 'Skyrim', slug: 'skyrim', rating: 9.2, year: 2011, price: 19.99},
                {id: 3, title: 'Dark Souls', slug: 'dark-souls', rating: 9.0, year: 2011, price: 39.99},
                // ... 50 игр
            ]
        },
        {
            id: 'set2',
            label: 'Singleplayer Games',
            items: [
                {id: 1, title: 'The Witcher 3', slug: 'witcher3', rating: 9.5, year: 2015, price: 29.99},
                {id: 4, title: 'Portal 2', slug: 'portal2', rating: 9.7, year: 2011, price: 9.99},
                // ... 45 игр
            ]
        },
        {
            id: 'set3',
            label: 'PC Games',
            items: [
                {id: 1, title: 'The Witcher 3', slug: 'witcher3', rating: 9.5, year: 2015, price: 29.99},
                {id: 2, title: 'Skyrim', slug: 'skyrim', rating: 9.2, year: 2011, price: 19.99},
                // ... 60 игр
            ]
        }
    ],
    subareaFilters: {
        set1: [
            {field: 'rating', operator: '>=', value: 9.0, label: 'High rated'},
            {field: 'rating', operator: '<', value: 9.0, label: 'Lower rated'}
        ],
        set2: [
            {field: 'price', operator: '<', value: 20, label: 'Under $20'},
            {field: 'price', operator: '>=', value: 20, label: '$20+'}
        ],
        set3: [
            {field: 'year', operator: '>=', value: 2015, label: 'Modern'},
            {field: 'year', operator: '<', value: 2015, label: 'Classic'}
        ]
    }
};
```

---

## 10. ИТОГОВЫЕ ПРЕИМУЩЕСТВА

### По сравнению с предыдущей версией ТЗ:

✅ **Полный алгоритм** - все 6 этапов обработки из Godot  
✅ **Битовая маркировка** - правильное определение пересечений  
✅ **Подобласти** - двухуровневая детализация  
✅ **Балансировка** - визуальная оптимизация  
✅ **Унифицированные названия** - set1, intersection12 вместо data1, data12  
✅ **Адаптация для игр** - специфические поля (rating, year, price)  
✅ **Разделение ответственности** - Django фильтрует, библиотека визуализирует  
✅ **Гибкость** - поддержка 1-3 множеств с подобластями  

---

**Версия:** 2.0  
**Дата:** 2025-11-21  
**Статус:** Готово к разработке

