# VennGrid.js API Documentation

## Конструктор

### `new VennGrid(canvas, options)`

Создает новый экземпляр библиотеки.

**Параметры:**
- `canvas` (HTMLCanvasElement) - canvas элемент для рендеринга
- `options` (Object, optional) - опции конфигурации

**Пример:**
```javascript
const venn = new VennGrid(document.getElementById('canvas'), {
    cellSize: 50,
    enableZoom: true
});
```

---

## Опции конфигурации

### Визуальные опции

| Опция | Тип | По умолчанию | Описание |
|-------|-----|--------------|----------|
| `cellSize` | Number | 50 | Размер одной ячейки в пикселях |
| `padding` | Number | 20 | Отступы вокруг сетки |
| `aspectRatio` | Number | 1.3 | Соотношение сторон для расчета |
| `paletteIndex` | Number | 0 | Индекс цветовой палитры (0 или 1) |
| `showLabels` | Boolean | false | Показывать текст в ячейках |
| `showImages` | Boolean | false | Показывать изображения в ячейках |

### Интерактивность

| Опция | Тип | По умолчанию | Описание |
|-------|-----|--------------|----------|
| `enableZoom` | Boolean | true | Включить масштабирование |
| `enablePan` | Boolean | true | Включить перемещение |
| `minZoom` | Number | 0.1 | Минимальное значение zoom |
| `maxZoom` | Number | 5.0 | Максимальное значение zoom |
| `zoomStep` | Number | 0.1 | Шаг изменения zoom |

### Callbacks

| Опция | Тип | Описание |
|-------|-----|----------|
| `onCellClick` | Function | Вызывается при клике на ячейку |
| `onCellHover` | Function | Вызывается при наведении на ячейку |
| `onZoomChange` | Function | Вызывается при изменении zoom |
| `onRenderComplete` | Function | Вызывается после завершения рендеринга |

**Callback параметры:**

```javascript
// onCellClick, onCellHover
{
    item: Object,           // Данные элемента (игры)
    position: {x, y}        // Координаты курсора
}

// onZoomChange
zoom                        // Текущее значение zoom
```

---

## Методы

### `setData(data)`

Устанавливает данные и запускает рендеринг.

**Параметры:**
- `data` (Object) - данные в формате VennGrid

**Формат data:**
```javascript
{
    sets: [
        {
            id: 'set1',
            label: 'Название множества',
            items: [
                {id: 1, title: 'Item 1', ...},
                ...
            ]
        }
    ],
    subareaFilters: {
        set1: [
            {field: 'rating', operator: '>=', value: 9.0, label: 'Label'},
            ...
        ]
    }
}
```

**Пример:**
```javascript
venn.setData({
    sets: [{id: 'set1', label: 'Games', items: games}]
});
```

---

### `render()`

Перерисовывает диаграмму.

**Пример:**
```javascript
venn.render();
```

---

### `zoomIn()`

Увеличивает масштаб на `zoomStep`.

**Пример:**
```javascript
venn.zoomIn();
```

---

### `zoomOut()`

Уменьшает масштаб на `zoomStep`.

**Пример:**
```javascript
venn.zoomOut();
```

---

### `resetView()`

Сбрасывает zoom и pan к начальным значениям.

**Пример:**
```javascript
venn.resetView();
```

---

### `setPalette(index)`

Переключает цветовую палитру.

**Параметры:**
- `index` (Number) - индекс палитры (0 или 1)

**Пример:**
```javascript
venn.setPalette(1); // Яркая RGB палитра
```

---

### `setCellSize(size)`

Устанавливает размер ячейки.

**Параметры:**
- `size` (Number) - размер в пикселях

**Пример:**
```javascript
venn.setCellSize(60);
```

---

### `getStats()`

Возвращает статистику по областям.

**Возвращает:** Object

**Формат:**
```javascript
{
    total: Number,
    set1: Number,
    set2: Number,
    set3: Number,
    intersection12: Number,
    intersection13: Number,
    intersection23: Number,
    intersection123: Number,
    subareas: {
        set1: {a, b, c, d},
        set2: {a, b, c, d},
        set3: {a, b, c, d}
    },
    gridSize: {width, height}
}
```

**Пример:**
```javascript
const stats = venn.getStats();
console.log(`Total items: ${stats.total}`);
```

---

### `getCellAt(clientX, clientY)`

Возвращает элемент в ячейке по координатам.

**Параметры:**
- `clientX` (Number) - X координата
- `clientY` (Number) - Y координата

**Возвращает:** Object | null

**Пример:**
```javascript
canvas.addEventListener('click', (e) => {
    const item = venn.getCellAt(e.clientX, e.clientY);
    if (item) {
        console.log(item.title);
    }
});
```

---

### `getItemsInArea(area)`

Возвращает все элементы в указанной области.

**Параметры:**
- `area` (String) - название области ('set1', 'intersection12', ...)

**Возвращает:** Array

**Пример:**
```javascript
const rpgGames = venn.getItemsInArea('set1');
console.log(rpgGames.length);
```

---

### `clear()`

Очищает canvas.

**Пример:**
```javascript
venn.clear();
```

---

### `destroy()`

Уничтожает экземпляр библиотеки, удаляет обработчики событий.

**Пример:**
```javascript
venn.destroy();
```

---

## Цветовые палитры

### Палитра 0 (Пастельная)

- `background`: #2a2a2a
- `empty`: #000000
- `set1`: #f5c7c7
- `set2`: #e6dbba
- `set3`: #99fa99
- `intersection12`: #e6c8f5
- `intersection13`: #c8e6c8
- `intersection23`: #f5f5c8
- `intersection123`: #ffffff

### Палитра 1 (Яркая RGB)

- `background`: #2a2a2a
- `empty`: #000000
- `set1`: #ff0000 (красный)
- `set2`: #00ff00 (зеленый)
- `set3`: #0000ff (синий)
- `intersection12`: #ffff00 (желтый)
- `intersection13`: #ff00ff (пурпурный)
- `intersection23`: #00ffff (голубой)
- `intersection123`: #ffffff (белый)

---

## События мыши

Библиотека автоматически обрабатывает:

- **Click** - клик по ячейке (вызывает `onCellClick`)
- **Hover** - наведение на ячейку (вызывает `onCellHover`)
- **Wheel** - масштабирование колесом мыши
- **MouseDown/Move/Up** - перемещение диаграммы (drag & drop)

---

## Алгоритм обработки данных

### 6 этапов:

1. **Битовая маркировка** - определение в каких множествах находится элемент
2. **Сортировка в области** - распределение по областям диаграммы
3. **Подобласти** - дополнительная детализация внутри областей
4. **Балансировка** - перестановка областей для лучшей визуализации
5. **Расчет размеров сетки** - эвристический алгоритм
6. **Определение области** - маппинг координат на области

См. подробности в [TZ_v2.md](TZ_v2.md) и [ALGORITHM_ANALYSIS.md](ALGORITHM_ANALYSIS.md).

---

## Интеграция с Django

Пример Django view:

```python
from django.http import JsonResponse
from .models import Game

def venn_api(request):
    genre_ids = request.GET.getlist('genres')
    tag_ids = request.GET.getlist('tags')
    
    sets = []
    
    if genre_ids:
        games = Game.objects.filter(genres__id__in=genre_ids)
        sets.append({
            'id': 'set1',
            'label': 'Genres',
            'items': [serialize_game(g) for g in games]
        })
    
    return JsonResponse({'sets': sets})
```

Пример использования в шаблоне:

```html
<canvas id="vennCanvas"></canvas>

<script src="{% static 'js/venn-grid.min.js' %}"></script>
<script>
const venn = new VennGrid(document.getElementById('vennCanvas'));

fetch('/api/venn/?genres=1,2')
    .then(r => r.json())
    .then(data => venn.setData(data));
</script>
```

---

## Браузерная совместимость

- Chrome/Edge: ✅
- Firefox: ✅
- Safari: ✅
- Opera: ✅
- IE11: ⚠️ (требует полифиллы для Map, Array.from)

---

## Производительность

Оптимально работает с:
- До 500 элементов в каждом множестве
- Сетки до 100×100 ячеек

Для больших датасетов рекомендуется:
- Уменьшить `cellSize`
- Включить виртуализацию (в будущей версии)
- Фильтровать данные на backend

---

## Лицензия

MIT License - свободное использование в коммерческих и некоммерческих проектах.

