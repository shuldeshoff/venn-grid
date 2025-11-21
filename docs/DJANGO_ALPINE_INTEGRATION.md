# 🔌 Интеграция VennGrid.js с Django + Alpine.js

## Обзор стека

| Технология | Версия | Роль |
|------------|--------|------|
| **Django** | 4.2.26 | Backend, API, данные |
| **Alpine.js** | 3.x | Реактивность, state management |
| **Vanilla JS** | ES6+ | Основная логика, VennGrid |
| **VennGrid.js** | 2.3.4 | Визуализация диаграммы Венна |

---

## 📋 Содержание

1. [Установка VennGrid.js](#1-установка-venngridjs)
2. [Backend: Django API](#2-backend-django-api)
3. [Frontend: Шаблон с Alpine.js](#3-frontend-шаблон-с-alpinejs)
4. [Интеграция с Alpine.js](#4-интеграция-с-alpinejs)
5. [Продвинутые примеры](#5-продвинутые-примеры)
6. [Типичные проблемы](#6-типичные-проблемы)

---

## 1. Установка VennGrid.js

### Вариант А: Через статические файлы Django

```bash
# Скачайте venn-grid.min.js в ваш проект
cd your_project/static/js/
wget https://cdn.jsdelivr.net/gh/shuldeshoff/venn-grid@main/dist/venn-grid.min.js
```

### Вариант Б: Через CDN

Подключите напрямую в шаблоне:

```html
<script src="https://cdn.jsdelivr.net/gh/shuldeshoff/venn-grid@main/dist/venn-grid.min.js"></script>
```

---

## 2. Backend: Django API

### 2.1 Модель данных

Пример модели для игр:

```python
# games/models.py
from django.db import models

class Game(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    cover_image = models.ImageField(upload_to='covers/', blank=True, null=True)
    genre = models.CharField(max_length=100)
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=0.0)
    release_year = models.IntegerField()
    developer = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=6, decimal_places=2)
    is_published = models.BooleanField(default=True)
    
    # Many-to-Many отношения
    tags = models.ManyToManyField('Tag', related_name='games', blank=True)
    platforms = models.ManyToManyField('Platform', related_name='games', blank=True)
    
    def __str__(self):
        return self.title

class Tag(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True)
    
    def __str__(self):
        return self.name

class Platform(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True)
    
    def __str__(self):
        return self.name
```

### 2.2 API View

```python
# games/views.py
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from .models import Game, Tag, Platform

@require_http_methods(["GET"])
def venn_diagram_api(request):
    """
    API endpoint для получения данных для VennGrid.js
    
    Query params:
    - genres: список ID жанров через запятую (e.g., "1,2,3")
    - tags: список ID тегов
    - platforms: список ID платформ
    """
    
    # Получаем фильтры из query params
    genre_filter = request.GET.get('genres', '').strip()
    tag_filter = request.GET.get('tags', '').strip()
    platform_filter = request.GET.get('platforms', '').strip()
    
    sets = []
    
    # Множество 1: Жанр
    if genre_filter:
        games_set1 = Game.objects.filter(
            genre__in=genre_filter.split(','),
            is_published=True
        ).distinct()
        
        sets.append({
            'id': 'set1',
            'label': f'Жанр: {genre_filter}',
            'items': [serialize_game(game) for game in games_set1]
        })
    
    # Множество 2: Теги
    if tag_filter:
        tag_ids = [int(id) for id in tag_filter.split(',') if id.isdigit()]
        games_set2 = Game.objects.filter(
            tags__id__in=tag_ids,
            is_published=True
        ).distinct()
        
        tag_names = Tag.objects.filter(id__in=tag_ids).values_list('name', flat=True)
        
        sets.append({
            'id': 'set2',
            'label': f'Теги: {", ".join(tag_names)}',
            'items': [serialize_game(game) for game in games_set2]
        })
    
    # Множество 3: Платформы
    if platform_filter:
        platform_ids = [int(id) for id in platform_filter.split(',') if id.isdigit()]
        games_set3 = Game.objects.filter(
            platforms__id__in=platform_ids,
            is_published=True
        ).distinct()
        
        platform_names = Platform.objects.filter(id__in=platform_ids).values_list('name', flat=True)
        
        sets.append({
            'id': 'set3',
            'label': f'Платформы: {", ".join(platform_names)}',
            'items': [serialize_game(game) for game in games_set3]
        })
    
    # Опционально: фильтры для подобластей
    subarea_filters = {}
    if genre_filter:
        subarea_filters['set1'] = [
            {'field': 'rating', 'operator': '>=', 'value': 9.0, 'label': 'Высокий рейтинг'},
            {'field': 'rating', 'operator': '<', 'value': 9.0, 'label': 'Средний рейтинг'}
        ]
    
    return JsonResponse({
        'sets': sets,
        'subareaFilters': subarea_filters
    })

def serialize_game(game):
    """Сериализация игры в JSON для VennGrid"""
    return {
        'id': game.id,
        'title': game.title,
        'slug': game.slug,
        'cover': game.cover_image.url if game.cover_image else None,
        'genre': game.genre,
        'rating': float(game.rating),
        'year': game.release_year,
        'developer': game.developer,
        'price': float(game.price),
    }
```

### 2.3 URL маршрут

```python
# games/urls.py
from django.urls import path
from . import views

app_name = 'games'

urlpatterns = [
    path('api/venn/', views.venn_diagram_api, name='venn_api'),
    path('<slug:slug>/', views.game_detail, name='game_detail'),
]
```

---

## 3. Frontend: Шаблон с Alpine.js

### 3.1 Базовый HTML шаблон

```html
<!-- templates/games/venn_diagram.html -->
{% extends 'base.html' %}
{% load static %}

{% block extra_css %}
<style>
    .venn-container {
        display: flex;
        gap: 20px;
        padding: 20px;
        min-height: 80vh;
    }
    
    .filters-panel {
        width: 300px;
        background: #f8f9fa;
        padding: 20px;
        border-radius: 8px;
        height: fit-content;
    }
    
    .filter-group {
        margin-bottom: 20px;
    }
    
    .filter-group h5 {
        margin-bottom: 10px;
        color: #333;
    }
    
    .filter-group label {
        display: block;
        margin-bottom: 8px;
        cursor: pointer;
    }
    
    .canvas-area {
        flex: 1;
        background: #fff;
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    #vennCanvas {
        width: 100%;
        height: 600px;
        border: 1px solid #ddd;
        border-radius: 4px;
    }
    
    .controls {
        margin-top: 15px;
        display: flex;
        gap: 10px;
    }
    
    .stats-panel {
        margin-top: 20px;
        padding: 15px;
        background: #f8f9fa;
        border-radius: 4px;
    }
    
    .loading {
        text-align: center;
        padding: 40px;
        color: #666;
    }
</style>
{% endblock %}

{% block content %}
<div class="venn-container" x-data="vennDiagram()">
    
    <!-- Панель фильтров -->
    <div class="filters-panel">
        <h3>Фильтры визуализации</h3>
        
        <!-- Множество 1: Жанры -->
        <div class="filter-group">
            <h5>Множество 1: Жанры</h5>
            <template x-for="genre in availableGenres" :key="genre">
                <label>
                    <input 
                        type="checkbox" 
                        :value="genre"
                        x-model="filters.genres"
                    >
                    <span x-text="genre"></span>
                </label>
            </template>
        </div>
        
        <!-- Множество 2: Теги -->
        <div class="filter-group">
            <h5>Множество 2: Теги</h5>
            <template x-for="tag in availableTags" :key="tag.id">
                <label>
                    <input 
                        type="checkbox" 
                        :value="tag.id"
                        x-model="filters.tags"
                    >
                    <span x-text="tag.name"></span>
                </label>
            </template>
        </div>
        
        <!-- Множество 3: Платформы -->
        <div class="filter-group">
            <h5>Множество 3: Платформы</h5>
            <template x-for="platform in availablePlatforms" :key="platform.id">
                <label>
                    <input 
                        type="checkbox" 
                        :value="platform.id"
                        x-model="filters.platforms"
                    >
                    <span x-text="platform.name"></span>
                </label>
            </template>
        </div>
        
        <button 
            @click="loadVennData()"
            class="btn btn-primary w-100"
            :disabled="loading || !hasFilters()"
        >
            <span x-show="!loading">Визуализировать</span>
            <span x-show="loading">Загрузка...</span>
        </button>
        
        <!-- Управление визуализацией -->
        <div class="controls">
            <button @click="zoomIn()" class="btn btn-sm btn-secondary">+</button>
            <button @click="zoomOut()" class="btn btn-sm btn-secondary">-</button>
            <button @click="resetView()" class="btn btn-sm btn-secondary">↺</button>
            <button @click="togglePalette()" class="btn btn-sm btn-secondary">🎨</button>
        </div>
        
        <!-- Статистика -->
        <div class="stats-panel" x-show="stats">
            <h5>Статистика</h5>
            <template x-if="stats">
                <div>
                    <p><strong>Всего игр:</strong> <span x-text="stats.total"></span></p>
                    <p><strong>Множество 1:</strong> <span x-text="stats.set1"></span></p>
                    <p><strong>Множество 2:</strong> <span x-text="stats.set2"></span></p>
                    <p><strong>Множество 3:</strong> <span x-text="stats.set3"></span></p>
                    <p><strong>Пересечение 1∩2:</strong> <span x-text="stats.intersection12"></span></p>
                    <p><strong>Пересечение 1∩3:</strong> <span x-text="stats.intersection13"></span></p>
                    <p><strong>Пересечение 2∩3:</strong> <span x-text="stats.intersection23"></span></p>
                    <p><strong>Все 3:</strong> <span x-text="stats.intersection123"></span></p>
                </div>
            </template>
        </div>
    </div>
    
    <!-- Canvas область -->
    <div class="canvas-area">
        <h2>Диаграмма Венна</h2>
        <p class="text-muted">Выберите фильтры и нажмите "Визуализировать"</p>
        
        <div x-show="loading" class="loading">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Загрузка...</span>
            </div>
        </div>
        
        <canvas 
            id="vennCanvas" 
            x-show="!loading"
        ></canvas>
    </div>
    
</div>
{% endblock %}

{% block extra_js %}
<!-- VennGrid.js -->
<script src="{% static 'js/venn-grid.min.js' %}"></script>

<!-- Alpine.js компонент -->
<script>
function vennDiagram() {
    return {
        // State
        vennGrid: null,
        filters: {
            genres: [],
            tags: [],
            platforms: []
        },
        availableGenres: {{ genres_json|safe }},
        availableTags: {{ tags_json|safe }},
        availablePlatforms: {{ platforms_json|safe }},
        loading: false,
        stats: null,
        currentPalette: 0,
        
        // Init
        init() {
            // Инициализация VennGrid после загрузки DOM
            this.$nextTick(() => {
                this.initVennGrid();
            });
        },
        
        // Инициализация VennGrid
        initVennGrid() {
            const canvas = document.getElementById('vennCanvas');
            
            this.vennGrid = new VennGrid(canvas, {
                cellSize: 50,
                padding: 20,
                enableZoom: true,
                enablePan: true,
                paletteIndex: 0,
                
                // Callback при клике
                onCellClick: (item) => {
                    if (item && item.slug) {
                        window.location.href = `/game/${item.slug}/`;
                    }
                },
                
                // Callback после рендеринга
                onRenderComplete: () => {
                    this.updateStats();
                }
            });
        },
        
        // Проверка наличия фильтров
        hasFilters() {
            return this.filters.genres.length > 0 || 
                   this.filters.tags.length > 0 || 
                   this.filters.platforms.length > 0;
        },
        
        // Загрузка данных с API
        async loadVennData() {
            if (!this.hasFilters()) {
                alert('Выберите хотя бы один фильтр');
                return;
            }
            
            this.loading = true;
            
            try {
                // Формируем URL с параметрами
                const params = new URLSearchParams();
                
                if (this.filters.genres.length > 0) {
                    params.append('genres', this.filters.genres.join(','));
                }
                if (this.filters.tags.length > 0) {
                    params.append('tags', this.filters.tags.join(','));
                }
                if (this.filters.platforms.length > 0) {
                    params.append('platforms', this.filters.platforms.join(','));
                }
                
                // Запрос к API
                const response = await fetch(`/api/venn/?${params}`);
                
                if (!response.ok) {
                    throw new Error('Ошибка загрузки данных');
                }
                
                const data = await response.json();
                
                // Передаем данные в VennGrid
                this.vennGrid.setData(data);
                
            } catch (error) {
                console.error('Ошибка:', error);
                alert('Не удалось загрузить данные. Попробуйте еще раз.');
            } finally {
                this.loading = false;
            }
        },
        
        // Управление визуализацией
        zoomIn() {
            if (this.vennGrid) {
                this.vennGrid.zoomIn();
            }
        },
        
        zoomOut() {
            if (this.vennGrid) {
                this.vennGrid.zoomOut();
            }
        },
        
        resetView() {
            if (this.vennGrid) {
                this.vennGrid.resetView();
            }
        },
        
        togglePalette() {
            this.currentPalette = this.currentPalette === 0 ? 1 : 0;
            if (this.vennGrid) {
                this.vennGrid.setPalette(this.currentPalette);
            }
        }
    };
}
</script>
{% endblock %}
```

### 3.2 Django View для шаблона

```python
# games/views.py
from django.shortcuts import render
import json

def venn_diagram_view(request):
    """Страница с диаграммой Венна"""
    
    # Получаем все доступные фильтры для UI
    genres = Game.objects.values_list('genre', flat=True).distinct()
    tags = Tag.objects.all()
    platforms = Platform.objects.all()
    
    context = {
        'genres_json': json.dumps(list(genres)),
        'tags_json': json.dumps([{'id': t.id, 'name': t.name} for t in tags]),
        'platforms_json': json.dumps([{'id': p.id, 'name': p.name} for p in platforms]),
    }
    
    return render(request, 'games/venn_diagram.html', context)
```

---

## 4. Интеграция с Alpine.js

### 4.1 Реактивное состояние

Alpine.js автоматически отслеживает изменения в `filters` и обновляет UI:

```javascript
filters: {
    genres: [],      // Alpine отслеживает изменения
    tags: [],        // Автоматическое обновление чекбоксов
    platforms: []
}
```

### 4.2 Двусторонняя связь (Two-way binding)

```html
<!-- x-model связывает чекбокс с массивом -->
<input 
    type="checkbox" 
    :value="tag.id"
    x-model="filters.tags"
>
```

### 4.3 Условный рендеринг

```html
<!-- Показать статистику только когда есть данные -->
<div class="stats-panel" x-show="stats">
    <!-- Контент -->
</div>

<!-- Показать загрузчик во время запроса -->
<div x-show="loading" class="loading">
    <div class="spinner-border"></div>
</div>
```

### 4.4 Lifecycle hooks

```javascript
init() {
    // Вызывается при инициализации компонента
    this.$nextTick(() => {
        // DOM готов - инициализируем VennGrid
        this.initVennGrid();
    });
}
```

---

## 5. Продвинутые примеры

### 5.1 Автоматическое обновление при изменении фильтров

```javascript
function vennDiagram() {
    return {
        // ... state ...
        
        init() {
            this.initVennGrid();
            
            // Watch для автоматического обновления
            this.$watch('filters', () => {
                if (this.hasFilters()) {
                    // Debounce для избежания частых запросов
                    clearTimeout(this.debounceTimer);
                    this.debounceTimer = setTimeout(() => {
                        this.loadVennData();
                    }, 500);
                }
            }, { deep: true });
        },
        
        debounceTimer: null,
        
        // ... остальные методы ...
    };
}
```

### 5.2 Сохранение состояния в URL

```javascript
function vennDiagram() {
    return {
        // ... state ...
        
        init() {
            this.initVennGrid();
            this.loadFiltersFromURL();
        },
        
        // Загрузка фильтров из URL
        loadFiltersFromURL() {
            const params = new URLSearchParams(window.location.search);
            
            if (params.has('genres')) {
                this.filters.genres = params.get('genres').split(',');
            }
            if (params.has('tags')) {
                this.filters.tags = params.get('tags').split(',').map(Number);
            }
            if (params.has('platforms')) {
                this.filters.platforms = params.get('platforms').split(',').map(Number);
            }
            
            // Автозагрузка если есть фильтры
            if (this.hasFilters()) {
                this.loadVennData();
            }
        },
        
        // Сохранение в URL при загрузке
        async loadVennData() {
            // ... существующий код ...
            
            // Обновляем URL
            const params = new URLSearchParams();
            if (this.filters.genres.length > 0) {
                params.set('genres', this.filters.genres.join(','));
            }
            if (this.filters.tags.length > 0) {
                params.set('tags', this.filters.tags.join(','));
            }
            if (this.filters.platforms.length > 0) {
                params.set('platforms', this.filters.platforms.join(','));
            }
            
            window.history.pushState({}, '', `?${params}`);
            
            // ... загрузка данных ...
        }
    };
}
```

### 5.3 Кэширование запросов

```javascript
function vennDiagram() {
    return {
        cache: new Map(),
        
        async loadVennData() {
            // Генерируем ключ кэша
            const cacheKey = JSON.stringify(this.filters);
            
            // Проверяем кэш
            if (this.cache.has(cacheKey)) {
                console.log('Загружено из кэша');
                this.vennGrid.setData(this.cache.get(cacheKey));
                return;
            }
            
            this.loading = true;
            
            try {
                // ... запрос к API ...
                const data = await response.json();
                
                // Сохраняем в кэш
                this.cache.set(cacheKey, data);
                
                this.vennGrid.setData(data);
            } catch (error) {
                console.error('Ошибка:', error);
            } finally {
                this.loading = false;
            }
        }
    };
}
```

### 5.4 Экспорт изображения

```javascript
function vennDiagram() {
    return {
        // ... state ...
        
        // Экспорт canvas в PNG
        exportImage() {
            if (!this.vennGrid) return;
            
            const canvas = document.getElementById('vennCanvas');
            const dataURL = canvas.toDataURL('image/png');
            
            // Создаем ссылку для скачивания
            const link = document.createElement('a');
            link.download = 'venn-diagram.png';
            link.href = dataURL;
            link.click();
        }
    };
}
```

---

## 6. Типичные проблемы

### Проблема 1: Canvas не инициализируется

**Симптом:** Ошибка "Cannot read property 'getContext' of null"

**Решение:**
```javascript
init() {
    // Используйте $nextTick для ожидания рендеринга DOM
    this.$nextTick(() => {
        const canvas = document.getElementById('vennCanvas');
        if (canvas) {
            this.initVennGrid();
        }
    });
}
```

### Проблема 2: CORS ошибки при загрузке обложек

**Симптом:** Обложки не отображаются в tooltip

**Решение:** Настройте CORS в Django:

```python
# settings.py
INSTALLED_APPS = [
    ...
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    ...
]

# Для dev
CORS_ALLOW_ALL_ORIGINS = True

# Для production
CORS_ALLOWED_ORIGINS = [
    "https://yourdomain.com",
]
```

### Проблема 3: Alpine.js не видит данные из Django

**Симптом:** Ошибка "availableGenres is not defined"

**Решение:** Используйте фильтр `safe` в шаблоне:

```html
<script>
function vennDiagram() {
    return {
        availableGenres: {{ genres_json|safe }},  // ← |safe важен!
    };
}
</script>
```

### Проблема 4: Медленная загрузка при большом количестве игр

**Решение:** Добавьте пагинацию или ограничение на backend:

```python
def venn_diagram_api(request):
    # Ограничение количества результатов
    MAX_RESULTS = 500
    
    games_set1 = Game.objects.filter(...)[:MAX_RESULTS]
    # ...
```

---

## 📚 Дополнительные ресурсы

- [Документация Alpine.js](https://alpinejs.dev/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [VennGrid.js API Reference](API.md)
- [Работа с обложками](COVER_IMAGES.md)

---

## 🎯 Итоговый чеклист

- [ ] VennGrid.js подключен (CDN или static)
- [ ] Django API endpoint создан (`/api/venn/`)
- [ ] Модели Game, Tag, Platform настроены
- [ ] Alpine.js шаблон реализован
- [ ] Фильтры работают и отправляют запросы
- [ ] Canvas отображается корректно
- [ ] Tooltip с обложками работает
- [ ] Zoom/Pan функционал активен
- [ ] Статистика обновляется после рендеринга

---

**Версия гайда:** 1.0  
**Дата:** 2025-11-21  
**Совместимость:** Django 4.2+, Alpine.js 3.x, VennGrid.js 2.3.4

