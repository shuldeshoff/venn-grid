# VennGrid.js

Standalone JavaScript библиотека для сеточной визуализации пересечений множеств игр.

## Особенности

✨ Полный алгоритм из Godot версии  
✨ Работает через простой `<script>` тег  
✨ Битовая маркировка пересечений  
✨ Поддержка подобластей для детализации  
✨ Эвристический расчет размеров сетки  
✨ Интерактивность (zoom, pan, клики)  
✨ Две цветовые палитры  

## Быстрый старт

```html
<canvas id="vennCanvas" width="800" height="600"></canvas>

<script src="venn-grid.min.js"></script>
<script>
const venn = new VennGrid(document.getElementById('vennCanvas'));

venn.setData({
    sets: [
        {
            id: 'set1',
            label: 'RPG Games',
            items: [
                {id: 1, title: 'The Witcher 3', slug: 'witcher3', rating: 9.5},
                {id: 2, title: 'Skyrim', slug: 'skyrim', rating: 9.2}
            ]
        },
        {
            id: 'set2',
            label: 'Singleplayer',
            items: [
                {id: 1, title: 'The Witcher 3', slug: 'witcher3', rating: 9.5}
            ]
        }
    ]
});
</script>
```

## API

### Инициализация

```javascript
const venn = new VennGrid(canvasElement, {
    cellSize: 50,
    enableZoom: true,
    enablePan: true,
    onCellClick: (event) => {
        window.location.href = '/games/' + event.item.slug;
    }
});
```

### Методы

- `venn.setData(data)` - установить данные и отрисовать
- `venn.render()` - перерисовать
- `venn.zoomIn()` / `venn.zoomOut()` - масштабирование
- `venn.resetView()` - сброс zoom/pan
- `venn.setPalette(index)` - переключить палитру (0 или 1)
- `venn.getStats()` - получить статистику
- `venn.destroy()` - уничтожить инстанс

## Интеграция с Django

См. [TZ_v2.md](docs/TZ_v2.md) - полная документация по интеграции.

## Разработка

```bash
npm install
npm run dev    # Разработка
npm run build  # Production сборка
npm run watch  # Watch режим
```

## Примеры

- `examples/standalone.html` - базовый пример
- `examples/with-django.html` - интеграция с Django
- `test/test.html` - тестовая страница

## Лицензия

MIT

