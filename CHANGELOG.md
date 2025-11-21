# Changelog

All notable changes to VennGrid.js will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-11-21

### Added
- 🎉 Полная реализация библиотеки VennGrid.js
- ✨ Битовая маркировка для определения пересечений множеств
- ✨ Алгоритм сортировки в области (set1, set2, set3, intersections)
- ✨ Поддержка подобластей (subareas) для детальной фильтрации
- ✨ Балансировка областей (shuffling) для оптимального отображения
- ✨ Эвристический алгоритм расчета размеров сетки
- ✨ Определение области по координатам ячейки
- 🎨 Две цветовые палитры (пастельная и яркая RGB)
- 🖱️ Интерактивность: zoom, pan, клики по ячейкам
- 📊 API для получения статистики
- 🔧 Гибкая конфигурация через options
- 📦 Standalone библиотека (без зависимостей)
- 🧪 Полный набор тестов (unit + integration + visual)
- 📚 Примеры использования (standalone, Django integration)
- 📖 Подробная документация в TZ_v2.md
- 🔨 Настроенная сборка с минификацией (terser)

### Features
- Поддержка 1-3 множеств
- Canvas рендеринг с высокой производительностью
- Callbacks для событий (click, hover, zoom, render)
- Методы управления: setData, render, zoom, pan, reset, setPalette
- Автоматическая адаптация размера canvas
- Drag & drop для перемещения диаграммы
- Колесо мыши для зоома

### Technical Details
- Размер исходного файла: 24KB
- Размер минифицированного: 11KB
- Без внешних зависимостей
- ES5-совместимый код
- Browser support: все современные браузеры

### Documentation
- README.md - основная документация
- TZ_v2.md - техническое задание v2.0
- ALGORITHM_ANALYSIS.md - анализ алгоритма Godot версии
- CONTRADICTIONS_ANALYSIS.md - анализ противоречий между версиями

### Examples
- examples/standalone.html - базовый пример
- examples/with-django.html - интеграция с Django
- test/test.html - тестовая страница
- test/test-data.js - тестовые данные

### Build System
- npm run dev - копирование исходника в dist
- npm run build - production сборка с минификацией
- npm run watch - watch режим для разработки

[2.0.0]: https://github.com/username/venn-grid/releases/tag/v2.0.0

