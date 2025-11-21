# ТЗ на разработку библиотеки VennGrid для интеграции с Django проектом

---

## 1. ОБЩАЯ ИНФОРМАЦИЯ

### 1.1 Название библиотеки
**VennGrid.js** - Standalone JavaScript библиотека для визуализации пересечений множеств

### 1.2 Цель разработки
Создать **полностью независимую** JavaScript библиотеку, которая:
- Не требует сборщиков (Webpack, Rollup)
- Работает через простой `<script>` тег
- Легко интегрируется с Django templates
- Совместима с Alpine.js (если используется)
- Не конфликтует с существующим стеком (Django + Bootstrap + jQuery)

### 1.3 Текущий стек проекта IndieBase
- **Backend**: Python 3.12 + Django 4.2
- **Frontend**: Vanilla JS + Alpine.js 3.x
- **Стили**: Bootstrap 5 + Custom CSS
- **База данных**: SQLite (dev), PostgreSQL (prod)

### 1.4 Требования к интеграции
```html
<!-- Простая интеграция в Django template -->
<script src="{% static 'js/venn-grid.min.js' %}"></script>
<script>
    const venn = new VennGrid(canvas);
    venn.setData(data);
</script>
```

---

## 2. СТРУКТУРА ПРОЕКТА БИБЛИОТЕКИ

### 2.1 Репозиторий библиотеки

```
venn-grid/
├── src/
│   └── venn-grid.js              # Один файл - вся библиотека
│
├── dist/
│   ├── venn-grid.js              # Development версия
│   └── venn-grid.min.js          # Production версия (минифицированная)
│
├── examples/
│   ├── standalone.html           # Без фреймворков
│   ├── with-alpine.html          # С Alpine.js
│   ├── with-django.html          # Пример Django template
│   └── with-fetch.html           # С AJAX загрузкой
│
├── test/
│   └── test.html                 # Браузерные тесты
│
├── docs/
│   ├── README.md                 # Документация
│   ├── API.md                    # Описание API
│   └── INTEGRATION.md            # Гайд по интеграции
│
├── package.json                  # Только для dev зависимостей
├── .gitignore
└── LICENSE
```

---

## 3. ФОРМАТ ВЫХОДНЫХ ФАЙЛОВ

### 3.1 Development версия (venn-grid.js)

```javascript
/**
 * VennGrid.js v1.0.0
 * Grid-based Venn diagram visualization library
 * https://github.com/username/venn-grid
 * Licensed under MIT
 */
(function(window) {
    'use strict';
    
    // Весь код библиотеки здесь
    
    // Экспорт
    window.VennGrid = VennGrid;
    
})(window);
```

### 3.2 Production версия (venn-grid.min.js)

- Минифицированная версия
- Удалены комментарии
- Размер: < 30 KB

---

## 4. API БИБЛИОТЕКИ

### 4.1 Инициализация

```javascript
// Простая инициализация
const venn = new VennGrid(canvasElement);

// С опциями
const venn = new VennGrid(canvasElement, {
    cellSize: 50,
    palette: { /* ... */ },
    onCellClick: function(item) { 
        window.location.href = '/games/' + item.slug; 
    }
});
```

### 4.2 Установка данных

```javascript
// Формат данных (совместимый с Django JSON)
const data = {
    sets: [
        {
            id: 'set1',
            label: 'Жанр: RPG',
            items: [
                {
                    id: 1,
                    title: 'Game Name',
                    slug: 'game-slug',
                    cover: '/media/covers/game.jpg',
                    // Любые дополнительные поля из Django модели
                    developer: 'Developer Name',
                    year: 2024
                }
            ]
        },
        {
            id: 'set2',
            label: 'Тег: Indie',
            items: [/* ... */]
        }
    ]
};

venn.setData(data);
```

### 4.3 Основные методы

```javascript
// Управление отображением
venn.render();              // Отрисовать
venn.clear();               // Очистить
venn.zoomIn();              // Zoom +
venn.zoomOut();             // Zoom -
venn.resetView();           // Сброс

// Получение информации
venn.getStats();            // Статистика
venn.getItemsInArea('set1'); // Элементы области

// Уничтожение
venn.destroy();             // Удалить все обработчики
```

### 4.4 События (Callbacks)

```javascript
const venn = new VennGrid(canvas, {
    // Клик по ячейке
    onCellClick: function(event) {
        console.log(event.item);    // {id, title, slug, ...}
        console.log(event.area);    // 'set1', 'intersection12', etc.
        console.log(event.position); // {x, y}
    },
    
    // Наведение
    onCellHover: function(event) {
        // Показать tooltip
    },
    
    // Изменение zoom
    onZoomChange: function(zoom) {
        console.log('Zoom:', zoom);
    },
    
    // Завершение отрисовки
    onRenderComplete: function() {
        console.log('Готово!');
    }
});
```

---

## 5. ИНТЕГРАЦИЯ С DJANGO

### 5.1 Структура файлов в Django проекте

```
IndieBase/
├── static/
│   └── js/
│       ├── venn-grid.min.js      # Копия из библиотеки
│       └── venn-init.js          # Инициализация для проекта
│
├── templates/
│   └── games/
│       └── venn.html             # Страница с диаграммой
│
└── games/
    └── venn_views.py             # Django view
```

### 5.2 Django View

```python
# games/venn_views.py
from django.shortcuts import render
from django.http import JsonResponse
from .models import Game

def venn_visualization(request):
    """Страница с диаграммой"""
    context = {
        'title': 'Визуализация игр'
    }
    return render(request, 'games/venn.html', context)

def venn_api(request):
    """API для получения данных"""
    # Получить параметры из GET запроса
    genres = request.GET.getlist('genres')
    tags = request.GET.getlist('tags')
    
    # Фильтрация игр
    games = Game.objects.filter(is_published=True)
    if genres:
        games = games.filter(genres__id__in=genres)
    
    # Формирование данных для библиотеки
    games_data = []
    for game in games:
        games_data.append({
            'id': game.id,
            'title': game.title,
            'slug': game.slug,
            'cover': game.cover_image.url if game.cover_image else None,
            'developer': game.developer,
            'year': game.release_year
        })
    
    return JsonResponse({'games': games_data})
```

### 5.3 Django Template

```html
<!-- templates/games/venn.html -->
{% extends 'base.html' %}
{% load static %}

{% block extra_css %}
<style>
    .venn-container {
        display: flex;
        height: calc(100vh - 100px);
        gap: 20px;
        padding: 20px;
    }
    
    .controls-panel {
        width: 300px;
        background: #f8f9fa;
        padding: 20px;
        border-radius: 8px;
    }
    
    .canvas-area {
        flex: 1;
        background: #2a2a2a;
        border-radius: 8px;
        position: relative;
    }
    
    #vennCanvas {
        width: 100%;
        height: 100%;
    }
</style>
{% endblock %}

{% block content %}
<div class="venn-container">
    <!-- Панель управления -->
    <div class="controls-panel">
        <h3>Критерии</h3>
        
        <div class="mb-3">
            <label>Жанры (множество 1)</label>
            {% for genre in genres %}
            <div>
                <input type="checkbox" 
                       id="genre-{{ genre.id }}" 
                       value="{{ genre.id }}"
                       class="set1-filter">
                <label for="genre-{{ genre.id }}">{{ genre.name }}</label>
            </div>
            {% endfor %}
        </div>
        
        <div class="mb-3">
            <label>Теги (множество 2)</label>
            {% for tag in hashtag_tags %}
            <div>
                <input type="checkbox" 
                       id="tag-{{ tag.id }}" 
                       value="{{ tag.id }}"
                       class="set2-filter">
                <label for="tag-{{ tag.id }}">{{ tag.name }}</label>
            </div>
            {% endfor %}
        </div>
        
        <button onclick="visualize()" class="btn btn-primary w-100">
            Визуализировать
        </button>
        
        <div class="mt-3">
            <button onclick="venn.zoomIn()" class="btn btn-sm btn-secondary">+</button>
            <button onclick="venn.zoomOut()" class="btn btn-sm btn-secondary">-</button>
            <button onclick="venn.resetView()" class="btn btn-sm btn-secondary">↺</button>
        </div>
    </div>
    
    <!-- Canvas -->
    <div class="canvas-area">
        <canvas id="vennCanvas"></canvas>
    </div>
</div>
{% endblock %}

{% block extra_js %}
<!-- Библиотека VennGrid -->
<script src="{% static 'js/venn-grid.min.js' %}"></script>

<script>
// Глобальная переменная для доступа из кнопок
let venn;

// Инициализация после загрузки страницы
document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('vennCanvas');
    
    // Создание экземпляра
    venn = new VennGrid(canvas, {
        cellSize: 50,
        enableZoom: true,
        enablePan: true,
        
        // Клик по ячейке - переход на страницу игры
        onCellClick: function(event) {
            if (event.item && event.item.slug) {
                window.location.href = '/games/' + event.item.slug + '/';
            }
        },
        
        // Tooltip при наведении
        onCellHover: function(event) {
            if (event.item) {
                // Можно показать кастомный tooltip
                console.log(event.item.title);
            }
        }
    });
});

// Функция визуализации
async function visualize() {
    // Собрать выбранные фильтры
    const set1Filters = Array.from(document.querySelectorAll('.set1-filter:checked'))
        .map(cb => cb.value);
    const set2Filters = Array.from(document.querySelectorAll('.set2-filter:checked'))
        .map(cb => cb.value);
    
    // Загрузить данные для каждого множества
    const [set1Data, set2Data] = await Promise.all([
        fetchGames(set1Filters, 'genres'),
        fetchGames(set2Filters, 'tags')
    ]);
    
    // Подготовить данные для библиотеки
    const data = {
        sets: [
            {
                id: 'set1',
                label: 'Жанры',
                items: set1Data
            },
            {
                id: 'set2',
                label: 'Теги',
                items: set2Data
            }
        ]
    };
    
    // Отрисовать
    venn.setData(data);
}

// Функция загрузки игр через API
async function fetchGames(filterIds, filterType) {
    if (filterIds.length === 0) return [];
    
    const params = new URLSearchParams();
    filterIds.forEach(id => params.append(filterType, id));
    
    const response = await fetch('/api/venn/?' + params);
    const result = await response.json();
    return result.games || [];
}
</script>
{% endblock %}
```

---

## 6. ИНТЕГРАЦИЯ С ALPINE.JS (опционально)

### 6.1 Alpine.js компонент

```html
<div x-data="vennComponent()" x-init="init()">
    <!-- Фильтры -->
    <div class="controls-panel">
        <template x-for="genre in genres" :key="genre.id">
            <label>
                <input type="checkbox" 
                       :value="genre.id" 
                       x-model="selectedGenres">
                <span x-text="genre.name"></span>
            </label>
        </template>
        
        <button @click="visualize()">Визуализировать</button>
    </div>
    
    <!-- Canvas -->
    <canvas id="vennCanvas"></canvas>
</div>

<script>
function vennComponent() {
    return {
        venn: null,
        genres: {{ genres|safe }},  // Из Django context
        tags: {{ tags|safe }},
        selectedGenres: [],
        selectedTags: [],
        
        init() {
            const canvas = document.getElementById('vennCanvas');
            this.venn = new VennGrid(canvas, {
                onCellClick: (e) => {
                    window.location.href = '/games/' + e.item.slug;
                }
            });
        },
        
        async visualize() {
            const data = await this.fetchData();
            this.venn.setData(data);
        },
        
        async fetchData() {
            const params = new URLSearchParams();
            this.selectedGenres.forEach(id => params.append('genres', id));
            
            const response = await fetch('/api/venn/?' + params);
            return await response.json();
        }
    }
}
</script>
```

---

## 7. СПЕЦИФИКАЦИЯ БИБЛИОТЕКИ

### 7.1 Входные данные

```typescript
interface VennGridData {
    sets: Array<{
        id: string;              // Уникальный ID множества
        label: string;           // Название для легенды
        color?: string;          // Опциональный цвет
        items: Array<{
            id: number | string; // Уникальный ID элемента
            title: string;       // Название
            [key: string]: any;  // Любые доп. поля
        }>;
    }>;
}
```

### 7.2 Опции

```typescript
interface VennGridOptions {
    // Размеры
    cellSize?: number;           // По умолчанию: 50
    padding?: number;            // По умолчанию: 50
    
    // Цвета
    palette?: {
        background?: string;     // По умолчанию: '#2a2a2a'
        empty?: string;          // По умолчанию: '#000000'
        set1?: string;           // По умолчанию: '#f5c7c7'
        set2?: string;           // По умолчанию: '#e6dbba'
        set3?: string;           // По умолчанию: '#99fa99'
        intersection12?: string; // По умолчанию: '#e6c8f5'
        intersection13?: string; // По умолчанию: '#c8e6c8'
        intersection23?: string; // По умолчанию: '#f5f5c8'
        intersection123?: string;// По умолчанию: '#ffffff'
        border?: string;         // По умолчанию: 'rgba(0,0,0,0.2)'
    };
    
    // Интерактивность
    enableZoom?: boolean;        // По умолчанию: true
    enablePan?: boolean;         // По умолчанию: true
    enableTooltip?: boolean;     // По умолчанию: true
    
    // Zoom
    minZoom?: number;            // По умолчанию: 0.1
    maxZoom?: number;            // По умолчанию: 5.0
    zoomStep?: number;           // По умолчанию: 0.1
    
    // Callbacks
    onCellClick?: (event: CellEvent) => void;
    onCellHover?: (event: CellEvent) => void;
    onZoomChange?: (zoom: number) => void;
    onRenderComplete?: () => void;
}
```

### 7.3 Методы

```typescript
class VennGrid {
    constructor(canvas: HTMLCanvasElement, options?: VennGridOptions);
    
    // Основные
    setData(data: VennGridData): void;
    render(): void;
    clear(): void;
    destroy(): void;
    
    // Zoom/Pan
    zoomIn(): void;
    zoomOut(): void;
    setZoom(level: number): void;
    getZoom(): number;
    resetView(): void;
    
    // Информация
    getStats(): VennGridStats;
    getItemsInArea(area: string): Array<any>;
    getCellAt(x: number, y: number): any | null;
    
    // Экспорт
    exportAsPNG(filename?: string): void;
    exportAsJSON(): string;
}
```

---

## 8. РАЗРАБОТКА

### 8.1 Единственный исходный файл

```javascript
// src/venn-grid.js - ВСЯ библиотека в одном файле

(function(window) {
    'use strict';
    
    // === КОНСТАНТЫ ===
    const DEFAULT_OPTIONS = {
        cellSize: 50,
        padding: 50,
        palette: {
            background: '#2a2a2a',
            empty: '#000000',
            set1: '#f5c7c7',
            set2: '#e6dbba',
            set3: '#99fa99',
            intersection12: '#e6c8f5',
            intersection13: '#c8e6c8',
            intersection23: '#f5f5c8',
            intersection123: '#ffffff',
            border: 'rgba(0,0,0,0.2)'
        },
        enableZoom: true,
        enablePan: true,
        enableTooltip: true,
        minZoom: 0.1,
        maxZoom: 5.0,
        zoomStep: 0.1
    };
    
    // === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===
    function mergeOptions(defaults, options) {
        // ...
    }
    
    function calculateBitmasks(sets) {
        // ...
    }
    
    function sortIntoAreas(items) {
        // ...
    }
    
    function calculateGridSizes(sorted) {
        // ...
    }
    
    function getAreaAtPosition(x, y, gridSizes) {
        // ...
    }
    
    // === ГЛАВНЫЙ КЛАСС ===
    function VennGrid(canvas, options) {
        // Валидация
        if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
            throw new Error('VennGrid: первый аргумент должен быть HTMLCanvasElement');
        }
        
        // Инициализация
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.options = mergeOptions(DEFAULT_OPTIONS, options || {});
        
        // Состояние
        this.data = null;
        this.sorted = {};
        this.gridSizes = {};
        this.positionMap = {};
        this.zoom = 1.0;
        this.pan = {x: 0, y: 0};
        
        // Привязка обработчиков
        this._setupEventListeners();
    }
    
    // === МЕТОДЫ КЛАССА ===
    VennGrid.prototype.setData = function(data) {
        // Валидация данных
        if (!data || !data.sets || !Array.isArray(data.sets)) {
            throw new Error('VennGrid: неверный формат данных');
        }
        
        if (data.sets.length < 1 || data.sets.length > 3) {
            throw new Error('VennGrid: поддерживается от 1 до 3 множеств');
        }
        
        this.data = data;
        
        // Pipeline обработки
        const itemsWithBitmasks = calculateBitmasks(data.sets);
        this.sorted = sortIntoAreas(itemsWithBitmasks);
        this.gridSizes = calculateGridSizes(this.sorted);
        
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
        this.ctx.fillStyle = this.options.palette.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Трансформации
        this.ctx.save();
        this.ctx.translate(this.pan.x, this.pan.y);
        this.ctx.scale(this.zoom, this.zoom);
        
        // Отрисовка ячеек
        const cellSize = this.options.cellSize;
        const sortedCopy = this._copySorted();
        
        for (let y = 0; y < this.gridSizes.height; y++) {
            for (let x = 0; x < this.gridSizes.width; x++) {
                const area = getAreaAtPosition(x, y, this.gridSizes);
                
                if (area && sortedCopy[area] && sortedCopy[area].length > 0) {
                    const item = sortedCopy[area].pop();
                    const color = this.options.palette[area] || this.options.palette.empty;
                    
                    // Ячейка
                    this.ctx.fillStyle = color;
                    this.ctx.fillRect(
                        x * cellSize, 
                        y * cellSize, 
                        cellSize - 1, 
                        cellSize - 1
                    );
                    
                    // Граница
                    this.ctx.strokeStyle = this.options.palette.border;
                    this.ctx.strokeRect(
                        x * cellSize, 
                        y * cellSize, 
                        cellSize - 1, 
                        cellSize - 1
                    );
                    
                    // Сохранить в карту
                    if (!this.positionMap[x]) this.positionMap[x] = {};
                    this.positionMap[x][y] = item;
                }
            }
        }
        
        this.ctx.restore();
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
    
    VennGrid.prototype.getStats = function() {
        return {
            total: this._getTotalItems(),
            set1: this.sorted.set1 ? this.sorted.set1.length : 0,
            set2: this.sorted.set2 ? this.sorted.set2.length : 0,
            set3: this.sorted.set3 ? this.sorted.set3.length : 0,
            intersection12: this.sorted.intersection12 ? this.sorted.intersection12.length : 0,
            intersection13: this.sorted.intersection13 ? this.sorted.intersection13.length : 0,
            intersection23: this.sorted.intersection23 ? this.sorted.intersection23.length : 0,
            intersection123: this.sorted.intersection123 ? this.sorted.intersection123.length : 0,
            gridSize: {
                width: this.gridSizes.width || 0,
                height: this.gridSizes.height || 0
            }
        };
    };
    
    VennGrid.prototype.destroy = function() {
        this._removeEventListeners();
        this.clear();
        this.data = null;
    };
    
    VennGrid.prototype._setupEventListeners = function() {
        // Zoom
        this._wheelHandler = this._handleWheel.bind(this);
        this.canvas.addEventListener('wheel', this._wheelHandler);
        
        // Pan
        this._mouseDownHandler = this._handleMouseDown.bind(this);
        this._mouseMoveHandler = this._handleMouseMove.bind(this);
        this._mouseUpHandler = this._handleMouseUp.bind(this);
        
        this.canvas.addEventListener('mousedown', this._mouseDownHandler);
        this.canvas.addEventListener('mousemove', this._mouseMoveHandler);
        this.canvas.addEventListener('mouseup', this._mouseUpHandler);
        
        // Click
        this._clickHandler = this._handleClick.bind(this);
        this.canvas.addEventListener('click', this._clickHandler);
    };
    
    VennGrid.prototype._handleWheel = function(e) {
        if (!this.options.enableZoom) return;
        e.preventDefault();
        
        if (e.deltaY < 0) {
            this.zoomIn();
        } else {
            this.zoomOut();
        }
    };
    
    VennGrid.prototype._handleClick = function(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const item = this.getCellAt(x, y);
        
        if (item && this.options.onCellClick) {
            this.options.onCellClick({
                item: item,
                position: {x, y},
                area: this._getAreaForItem(item)
            });
        }
    };
    
    // ... остальные методы
    
    // === ЭКСПОРТ ===
    window.VennGrid = VennGrid;
    
})(window);
```

### 8.2 Сборка

```bash
# Простая минификация (можно использовать онлайн инструменты)
# Или установить только минификатор
npm install terser --save-dev

# package.json
{
  "scripts": {
    "build": "terser src/venn-grid.js -o dist/venn-grid.min.js --compress --mangle",
    "dev": "cp src/venn-grid.js dist/venn-grid.js"
  }
}
```

---

## 9. УСТАНОВКА И ИСПОЛЬЗОВАНИЕ

### 9.1 Копирование в Django проект

```bash
# 1. Скачать файл из репозитория библиотеки
wget https://raw.githubusercontent.com/username/venn-grid/main/dist/venn-grid.min.js

# 2. Поместить в static
cp venn-grid.min.js /path/to/IndieBase/static/js/

# 3. Собрать статику Django
python manage.py collectstatic
```

### 9.2 Подключение в template

```html
{% load static %}
<script src="{% static 'js/venn-grid.min.js' %}"></script>
```

---

## 10. ДОКУМЕНТАЦИЯ

### 10.1 README.md библиотеки

```markdown
# VennGrid.js

Standalone JavaScript библиотека для визуализации пересечений множеств

## Установка

### CDN (будущее)
```html
<script src="https://cdn.jsdelivr.net/npm/venn-grid/dist/venn-grid.min.js"></script>
```

### Скачать файл
1. Скачать `venn-grid.min.js`
2. Поместить в проект
3. Подключить через `<script>`

## Быстрый старт

```html
<canvas id="venn" width="800" height="600"></canvas>

<script src="venn-grid.min.js"></script>
<script>
const venn = new VennGrid(document.getElementById('venn'));

venn.setData({
    sets: [
        {
            id: 'set1',
            label: 'Group A',
            items: [
                {id: 1, title: 'Item 1'},
                {id: 2, title: 'Item 2'}
            ]
        }
    ]
});
</script>
```

## API

См. [API.md](docs/API.md)

## Интеграция с Django

См. [INTEGRATION.md](docs/INTEGRATION.md)

## Лицензия

MIT
```

---

## 11. ИТОГОВАЯ ИНТЕГРАЦИЯ

### 11.1 Шаги интеграции

1. **Разработка библиотеки** (отдельный репозиторий)
   ```
   venn-grid/
   ├── src/venn-grid.js
   └── dist/venn-grid.min.js
   ```

2. **Копирование в Django проект**
   ```bash
   cp venn-grid/dist/venn-grid.min.js IndieBase/static/js/
   ```

3. **Использование в template**
   ```html
   <script src="{% static 'js/venn-grid.min.js' %}"></script>
   <script>
   const venn = new VennGrid(canvas);
   venn.setData(data);
   </script>
   ```

### 11.2 Преимущества такого подхода

✅ **Независимость** - библиотека работает автономно
✅ **Простота** - один файл, никаких сборщиков в Django проекте
✅ **Совместимость** - работает с любым фреймворком или без него
✅ **Переиспользуемость** - можно использовать в других проектах
✅ **Версионирование** - разные версии в разных репозиториях
✅ **Тестирование** - библиотеку легко тестировать отдельно

### 11.3 Пример обновления

```bash
# В репозитории библиотеки
git clone https://github.com/username/venn-grid.git
cd venn-grid
# Внести изменения в src/venn-grid.js
npm run build
git commit -m "v1.1.0"
git tag v1.1.0
git push

# В Django проекте
cd IndieBase
wget https://github.com/username/venn-grid/releases/download/v1.1.0/venn-grid.min.js
mv venn-grid.min.js static/js/
python manage.py collectstatic
```

---

**Готово! Теперь у вас есть полное ТЗ для разработки независимой библиотеки, которая легко интегрируется с Django проектом через простой `<script>` тег.**

