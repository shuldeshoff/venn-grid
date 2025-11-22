/**
 * VennGrid.js v2.4.0
 * Grid-based Venn diagram visualization library with cover images
 * https://github.com/shuldeshoff/venn-grid
 * Licensed under MIT
 */
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
        showLabels: false,
        showImages: false,
        onCellClick: null,
        onCellHover: null,
        onZoomChange: null,
        onRenderComplete: null
    };
    
    // === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===
    
    function mergeOptions(defaults, options) {
        const result = {};
        for (const key in defaults) {
            if (options && options.hasOwnProperty(key)) {
                if (typeof defaults[key] === 'object' && !Array.isArray(defaults[key])) {
                    result[key] = mergeOptions(defaults[key], options[key]);
                } else {
                    result[key] = options[key];
                }
            } else {
                result[key] = defaults[key];
            }
        }
        return result;
    }
    
    // Этап 1: Битовая маркировка
    function calculateBitmasks(sets) {
        const allItems = new Map();
        
        sets.forEach((set, setIndex) => {
            if (!set.items || !Array.isArray(set.items)) return;
            
            set.items.forEach(item => {
                if (!allItems.has(item.id)) {
                    allItems.set(item.id, Object.assign({}, item, {_bitmask: 0}));
                }
                allItems.get(item.id)._bitmask |= (1 << setIndex);
            });
        });
        
        return Array.from(allItems.values());
    }
    
    // Этап 2: Сортировка в области
    function sortIntoAreas(items) {
        const sorted = {
            set1: [],
            set2: [],
            set3: [],
            intersection12: [],
            intersection13: [],
            intersection23: [],
            intersection123: []
        };
        
        items.forEach(item => {
            switch (item._bitmask) {
                case 1: sorted.set1.push(item); break;
                case 2: sorted.set2.push(item); break;
                case 3: sorted.intersection12.push(item); break;
                case 4: sorted.set3.push(item); break;
                case 5: sorted.intersection13.push(item); break;
                case 6: sorted.intersection23.push(item); break;
                case 7: sorted.intersection123.push(item); break;
            }
        });
        
        return sorted;
    }
    
    // Этап 3: Подобласти
    function checkSubareas(items, area, subareaFilters) {
        if (!subareaFilters || !subareaFilters[area]) {
            return {main: items, subareas: {a: [], b: [], c: [], d: []}};
        }
        
        const subareas = {a: [], b: [], c: [], d: []};
        const main = [];
        const subareaLabels = ['a', 'b', 'c', 'd'];
        
        items.forEach(item => {
            let assigned = false;
            
            subareaFilters[area].forEach((filter, index) => {
                if (assigned || index >= 4) return;
                
                const value = item[filter.field];
                let matches = false;
                
                switch (filter.operator) {
                    case '>=': matches = value >= filter.value; break;
                    case '<=': matches = value <= filter.value; break;
                    case '<': matches = value < filter.value; break;
                    case '>': matches = value > filter.value; break;
                    case '==': matches = value === filter.value; break;
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
    
    // Этап 4: Балансировка
    function shuffleAreas(sorted, subsorted) {
        function swap(area1, area2, cross1, cross2) {
            const size1 = sorted[area1].length + sorted[cross1].length;
            const size2 = sorted[area2].length + sorted[cross2].length;
            
            if (size1 < size2) {
                [sorted[area1], sorted[area2]] = [sorted[area2], sorted[area1]];
                [sorted[cross1], sorted[cross2]] = [sorted[cross2], sorted[cross1]];
                [subsorted[area1], subsorted[area2]] = [subsorted[area2], subsorted[area1]];
            }
        }
        
        swap('set1', 'set2', 'intersection13', 'intersection23');
        swap('set2', 'set3', 'intersection12', 'intersection13');
        swap('set1', 'set2', 'intersection13', 'intersection23');
    }
    
    // Этап 5: Расчет размеров сетки
    function calculateGridSizes(sorted, subsorted, aspectRatio) {
        const n1a = subsorted.set1.a.length;
        const n1b = subsorted.set1.b.length;
        const n1c = subsorted.set1.c.length;
        const n1d = subsorted.set1.d.length;
        const n2a = subsorted.set2.a.length;
        const n2b = subsorted.set2.b.length;
        const n2c = subsorted.set2.c.length;
        const n2d = subsorted.set2.d.length;
        const n3a = subsorted.set3.a.length;
        const n3b = subsorted.set3.b.length;
        const n3c = subsorted.set3.c.length;
        const n3d = subsorted.set3.d.length;
        
        let n123 = sorted.intersection123.length;
        const n12 = sorted.intersection12.length + n123;
        let n13 = sorted.intersection13.length + n123;
        let n23 = sorted.intersection23.length + n123;
        
        const n1 = sorted.set1.length + n12 + n13 + n1a + n1b + n1c + n1d;
        const n2 = sorted.set2.length + n12 + n23 + n2a + n2b + n2c + n2d;
        const n3 = sorted.set3.length + n13 + n23 + n3a + n3b + n3c + n3d;
        
        if (n1 === 0 && n2 === 0 && n3 === 0) {
            return {width: 0, height: 0, l1: 0, l2: 0, l3: 0, h1: 0, h2: 0, h3: 0,
                    l12: 0, l13: 0, l23: 0, l123: 0, h12: 0, h13: 0, h23: 0, h123: 0};
        }
        
        const h1 = n1 > 0 ? Math.ceil(Math.sqrt(n1) / aspectRatio) : 0;
        const h2 = n2 > 0 ? Math.ceil(Math.sqrt(n2) / aspectRatio) : 0;
        const l1 = h1 > 0 ? Math.ceil(n1 / h1) : 0;
        const l2 = h2 > 0 ? Math.ceil(n2 / h2) : 0;
        
        let h12 = Math.min(h1, h2);
        let l12 = h12 > 0 ? Math.ceil(n12 / h12) : 0;
        let l123 = l12;
        let h123 = l123 > 0 ? Math.ceil(n123 / l123) : 0;
        
        // ВАЖНО: Корректируем n13, n23 и n123 как в Godot (Grid.gd строки 250-252)
        n13 = n13 - n123;
        n23 = n23 - n123;
        n123 = (l123 * h123 > n123) ? l123 * h123 : n123;
        
        let l13, h13, l23, h23, l3, h3;
        
        if (n123 > 0) {
            l13 = h123 > 0 ? Math.ceil(n13 / h123) : 0;
            h13 = h123;
            l23 = h123 > 0 ? Math.ceil(n23 / h123) : 0;
            h23 = h123;
            l3 = l13 + l23 + l123;
            h3 = l3 > 0 ? Math.ceil((n13 + n23 + n123) / l3) : 0;
        } else {
            l13 = h12 > 0 ? Math.ceil(n13 / h12) : 0;
            h13 = h12;
            l23 = h12 > 0 ? Math.ceil(n23 / h12) : 0;
            h23 = h12;
            l3 = l13 + l23 + l12;
            h3 = l3 > 0 ? Math.ceil((n3 + l12) / l3) : 0;
            if (h3 === h12 && n3 - n13 - n23 > 0) {
                h3 += 1;
            }
        }
        
        const width = n123 > 0 ? l1 + l2 - l123 : l1 + l2 - l12;
        const height = n123 > 0 ? h1 + h3 - h123 : h1 + h3 - h12;
        
        // Обнуление нулевых размеров (из Godot Grid.gd строки 276-287)
        if (h12 === 0 || l12 === 0) { h12 = 0; l12 = 0; }
        if (h13 === 0 || l13 === 0) { h13 = 0; l13 = 0; }
        if (h23 === 0 || l23 === 0) { h23 = 0; l23 = 0; }
        if (h123 === 0 || l123 === 0) { h123 = 0; l123 = 0; }
        
        return {
            width: Math.max(width, 0),
            height: Math.max(height, 0),
            l1, l2, l3, h1, h2, h3,
            l12, l13, l23, l123,
            h12, h13, h23, h123
        };
    }
    
    // Этап 6: Определение области для ячейки
    function getAreaAtPosition(x, y, gridSizes) {
        const {l1, l2, l3, h1, h2, h3, l12, l13, l23, l123, h12, h13, h23, h123} = gridSizes;
        
        let area = '';
        let subarea = '';
        
        if (l123 > 0 && h123 > 0) {
            if (y < h3 - h123) {
                if (x >= l1 - l13 - l123 && x < l1 + l23) {
                    area = 'set3';
                    if (x <= l1 - l13 - l123 + Math.ceil(l3/2) - 1) {
                        subarea = 'a';
                    } else if (x > l1 - l13 - l123 + Math.ceil(l3/2)) {
                        subarea = 'b';
                    }
                }
            } else if (y < h3) {
                if (x < l1 - l13 - l123) {
                    area = 'set1';
                } else if (x < l1 - l123) {
                    area = 'intersection13';
                } else if (x < l1) {
                    area = 'intersection123';
                } else if (x < l1 + l23) {
                    area = 'intersection23';
                } else {
                    area = 'set2';
                }
            } else if (y < h2 + h3 - h123) {
                if (x < l1 - l123) {
                    area = 'set1';
                } else if (x < l1) {
                    area = 'intersection12';
                } else {
                    area = 'set2';
                }
            } else {
                if (x < l1) {
                    area = 'set1';
                }
            }
        } else {
            if (y < h3 - h12) {
                if (x >= l1 - l13 - l12 && x < l1 + l23) {
                    area = 'set3';
                    if (x < l1 - l13 - l12 + Math.ceil(l3/2) - 1) {
                        subarea = 'a';
                    } else if (x > l1 - l13 - l12 + Math.ceil(l3/2)) {
                        subarea = 'b';
                    }
                }
            } else if (y < h3) {
                if (x < l1 - l13 - l12) {
                    area = 'set1';
                } else if (x < l1 - l12) {
                    area = 'intersection13';
                } else if (x < l1) {
                    area = 'intersection12';
                } else if (x < l1 + l23) {
                    area = 'intersection23';
                } else {
                    area = 'set2';
                }
            } else {
                if (x < l1) {
                    area = 'set1';
                }
            }
        }
        
        return {area, subarea};
    }
    
    // === ГЛАВНЫЙ КЛАСС ===
    
    function VennGrid(canvas, options) {
        // Если передан ID (строка), находим элемент
        if (typeof canvas === 'string') {
            canvas = document.getElementById(canvas);
            if (!canvas) {
                throw new Error('VennGrid: элемент canvas с ID "' + canvas + '" не найден');
            }
        }
        
        // Проверяем что это действительно canvas
        if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
            throw new Error('VennGrid: первый аргумент должен быть HTMLCanvasElement или ID элемента canvas');
        }
        
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.options = mergeOptions(DEFAULT_OPTIONS, options || {});
        
        this.data = null;
        this.sorted = null;
        this.subsorted = null;
        this.gridSizes = null;
        this.positionMap = {};
        this.zoom = 1.0;
        this.pan = {x: 0, y: 0};
        this.dragging = false;
        this.dragStart = {x: 0, y: 0};
        this.panStart = {x: 0, y: 0};
        
        // Tooltip состояние
        this.hoverTimeout = null;
        this.currentHoverItem = null;
        this.tooltipElement = null;
        
        // Кэш изображений для обложек
        this.imageCache = new Map();
        
        this._setupEventListeners();
        this._resizeCanvas();
        this._createTooltip();
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
        
        const items = calculateBitmasks(data.sets);
        this.sorted = sortIntoAreas(items);
        
        this.subsorted = {
            set1: {a: [], b: [], c: [], d: []},
            set2: {a: [], b: [], c: [], d: []},
            set3: {a: [], b: [], c: [], d: []}
        };
        
        if (data.subareaFilters) {
            ['set1', 'set2', 'set3'].forEach(area => {
                if (this.sorted[area] && this.sorted[area].length > 0) {
                    const result = checkSubareas(this.sorted[area], area, data.subareaFilters);
                    this.sorted[area] = result.main;
                    this.subsorted[area] = result.subareas;
                }
            });
        }
        
        shuffleAreas(this.sorted, this.subsorted);
        this.gridSizes = calculateGridSizes(this.sorted, this.subsorted, this.options.aspectRatio);
        
        this.render();
    };
    
    VennGrid.prototype.render = function() {
        if (!this.data) return;
        
        this._drawGrid();
        
        if (this.options.onRenderComplete && typeof this.options.onRenderComplete === 'function') {
            this.options.onRenderComplete();
        }
    };
    
    VennGrid.prototype._drawGrid = function() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        const palette = this.options.palette[this.options.paletteIndex];
        this.ctx.fillStyle = palette.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.gridSizes.width === 0 || this.gridSizes.height === 0) return;
        
        this.ctx.save();
        this.ctx.translate(this.pan.x, this.pan.y);
        this.ctx.scale(this.zoom, this.zoom);
        
        const sortedCopy = this._copySorted();
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
                        
                        let colorKey = area;
                        if (subarea) colorKey += subarea;
                        const color = palette[colorKey] || palette.empty;
                        
                        this.ctx.fillStyle = color;
                        this.ctx.fillRect(x * cellSize, y * cellSize, cellSize - 1, cellSize - 1);
                        
                        this.ctx.strokeStyle = palette.border;
                        this.ctx.strokeRect(x * cellSize, y * cellSize, cellSize - 1, cellSize - 1);
                        
                        if (!this.positionMap[x]) this.positionMap[x] = {};
                        this.positionMap[x][y] = item;
                        
                        // Всегда рисуем контент ячейки (адаптивный к zoom)
                        if (item.title) {
                            this._drawCellLabel(x, y, item, cellSize);
                        }
                    }
                }
            }
        }
        
        this.ctx.restore();
    };
    
    VennGrid.prototype._drawCellLabel = function(x, y, item, cellSize) {
        this.ctx.save();
        
        const centerX = x * cellSize + cellSize / 2;
        const centerY = y * cellSize + cellSize / 2;
        
        // Если ячейка слишком маленькая - ничего не рисуем
        if (cellSize < 25) {
            this.ctx.restore();
            return;
        }
        
        // Если есть обложка - рисуем миниатюру
        if (item.cover) {
            this._drawCellCover(x, y, item, cellSize);
        } else {
            // Если нет обложки - рисуем только название
            this._drawCellText(x, y, item, cellSize);
        }
        
        this.ctx.restore();
    };
    
    VennGrid.prototype._drawCellCover = function(x, y, item, cellSize) {
        // Проверяем есть ли изображение в кэше
        const cacheKey = item.cover;
        
        if (!this.imageCache) {
            this.imageCache = new Map();
        }
        
        if (this.imageCache.has(cacheKey)) {
            const img = this.imageCache.get(cacheKey);
            if (img.complete && img.naturalHeight > 0) {
                this._drawImage(x, y, img, cellSize);
            } else {
                // Изображение еще загружается - рисуем placeholder
                this._drawCellPlaceholder(x, y, item, cellSize);
            }
        } else {
            // Загружаем изображение
            const img = new Image();
            img.crossOrigin = 'anonymous'; // Для CORS
            
            img.onload = () => {
                this.imageCache.set(cacheKey, img);
                // Перерисовываем после загрузки
                this.render();
            };
            
            img.onerror = () => {
                // Ошибка загрузки - помечаем как failed
                this.imageCache.set(cacheKey, null);
                this.render();
            };
            
            img.src = item.cover;
            this.imageCache.set(cacheKey, img);
            
            // Пока загружается - рисуем placeholder
            this._drawCellPlaceholder(x, y, item, cellSize);
        }
    };
    
    VennGrid.prototype._drawImage = function(x, y, img, cellSize) {
        const padding = cellSize * 0.1; // 10% padding
        const imgSize = cellSize - padding * 2;
        const imgX = x * cellSize + padding;
        const imgY = y * cellSize + padding;
        
        // Сохраняем контекст
        this.ctx.save();
        
        // Создаем clip path для скругленных углов
        const radius = Math.min(imgSize * 0.1, 4); // Радиус скругления
        this.ctx.beginPath();
        this.ctx.moveTo(imgX + radius, imgY);
        this.ctx.lineTo(imgX + imgSize - radius, imgY);
        this.ctx.quadraticCurveTo(imgX + imgSize, imgY, imgX + imgSize, imgY + radius);
        this.ctx.lineTo(imgX + imgSize, imgY + imgSize - radius);
        this.ctx.quadraticCurveTo(imgX + imgSize, imgY + imgSize, imgX + imgSize - radius, imgY + imgSize);
        this.ctx.lineTo(imgX + radius, imgY + imgSize);
        this.ctx.quadraticCurveTo(imgX, imgY + imgSize, imgX, imgY + imgSize - radius);
        this.ctx.lineTo(imgX, imgY + radius);
        this.ctx.quadraticCurveTo(imgX, imgY, imgX + radius, imgY);
        this.ctx.closePath();
        this.ctx.clip();
        
        // Рисуем изображение с сохранением пропорций (cover)
        const aspectRatio = img.width / img.height;
        let drawWidth, drawHeight, drawX, drawY;
        
        if (aspectRatio > 1) {
            // Горизонтальное изображение
            drawHeight = imgSize;
            drawWidth = imgSize * aspectRatio;
            drawX = imgX - (drawWidth - imgSize) / 2;
            drawY = imgY;
        } else {
            // Вертикальное изображение
            drawWidth = imgSize;
            drawHeight = imgSize / aspectRatio;
            drawX = imgX;
            drawY = imgY - (drawHeight - imgSize) / 2;
        }
        
        this.ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
        
        this.ctx.restore();
    };
    
    VennGrid.prototype._drawCellPlaceholder = function(x, y, item, cellSize) {
        // Placeholder пока изображение загружается
        const padding = cellSize * 0.1;
        const size = cellSize - padding * 2;
        const px = x * cellSize + padding;
        const py = y * cellSize + padding;
        
        // Серый фон
        this.ctx.fillStyle = 'rgba(200, 200, 200, 0.3)';
        this.ctx.fillRect(px, py, size, size);
        
        // Иконка загрузки (простой спиннер)
        const centerX = x * cellSize + cellSize / 2;
        const centerY = y * cellSize + cellSize / 2;
        const iconSize = Math.min(size * 0.4, 20);
        
        this.ctx.strokeStyle = 'rgba(100, 100, 100, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, iconSize / 2, 0, Math.PI * 1.5);
        this.ctx.stroke();
    };
    
    VennGrid.prototype._drawCellText = function(x, y, item, cellSize) {
        // Рисуем только текст (когда нет обложки)
        const centerX = x * cellSize + cellSize / 2;
        const centerY = y * cellSize + cellSize / 2;
        
        this.ctx.fillStyle = '#000';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // Выбираем размер шрифта
        let fontSize;
        if (cellSize < 30) {
            fontSize = 7;
        } else if (cellSize < 40) {
            fontSize = 8;
        } else if (cellSize < 50) {
            fontSize = 9;
        } else if (cellSize < 70) {
            fontSize = 10;
        } else if (cellSize < 100) {
            fontSize = 11;
        } else {
            fontSize = 12;
        }
        
        this.ctx.font = `${fontSize}px Arial`;
        
        // Максимальная ширина текста
        const maxWidth = cellSize * 0.85;
        
        // Обрезаем текст если не влезает
        let displayText = item.title;
        let textWidth = this.ctx.measureText(displayText).width;
        
        if (textWidth > maxWidth) {
            while (displayText.length > 1) {
                displayText = displayText.substring(0, displayText.length - 1);
                textWidth = this.ctx.measureText(displayText + '…').width;
                if (textWidth <= maxWidth) break;
            }
            displayText = displayText + '…';
        }
        
        // Рисуем текст
        this.ctx.fillText(displayText, centerX, centerY);
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
    
    VennGrid.prototype.setCellSize = function(size) {
        this.options.cellSize = size;
        this.render();
    };
    
    VennGrid.prototype.getStats = function() {
        if (!this.sorted) return null;
        
        return {
            total: this._getTotalItems(),
            set1: this.sorted.set1.length,
            set2: this.sorted.set2.length,
            set3: this.sorted.set3.length,
            intersection12: this.sorted.intersection12.length,
            intersection13: this.sorted.intersection13.length,
            intersection23: this.sorted.intersection23.length,
            intersection123: this.sorted.intersection123.length,
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
    
    VennGrid.prototype.getCellAt = function(clientX, clientY) {
        const rect = this.canvas.getBoundingClientRect();
        const canvasX = (clientX - rect.left - this.pan.x) / this.zoom;
        const canvasY = (clientY - rect.top - this.pan.y) / this.zoom;
        
        const gridX = Math.floor(canvasX / this.options.cellSize);
        const gridY = Math.floor(canvasY / this.options.cellSize);
        
        if (this.positionMap[gridX] && this.positionMap[gridX][gridY]) {
            return this.positionMap[gridX][gridY];
        }
        
        return null;
    };
    
    VennGrid.prototype.getItemsInArea = function(area) {
        if (!this.sorted || !this.sorted[area]) return [];
        return this.sorted[area].slice();
    };
    
    VennGrid.prototype.clear = function() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    };
    
    VennGrid.prototype.destroy = function() {
        this._removeEventListeners();
        this._removeTooltip();
        this.clear();
        this.data = null;
        this.sorted = null;
        this.subsorted = null;
    };
    
    // === TOOLTIP МЕТОДЫ ===
    
    VennGrid.prototype._createTooltip = function() {
        this.tooltipElement = document.createElement('div');
        this.tooltipElement.style.cssText = `
            position: fixed;
            background: rgba(0, 0, 0, 0.95);
            color: white;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            pointer-events: none;
            z-index: 10000;
            display: none;
            max-width: 300px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
        `;
        document.body.appendChild(this.tooltipElement);
    };
    
    VennGrid.prototype._removeTooltip = function() {
        if (this.tooltipElement && this.tooltipElement.parentNode) {
            this.tooltipElement.parentNode.removeChild(this.tooltipElement);
        }
        if (this.hoverTimeout) {
            clearTimeout(this.hoverTimeout);
        }
    };
    
    VennGrid.prototype._showTooltip = function(item, x, y) {
        if (!this.tooltipElement) return;
        
        // Формируем HTML контент
        let html = '';
        
        // Обложка игры (если есть)
        if (item.cover) {
            html += `<img src="${item.cover}" style="width: 100%; height: auto; border-radius: 4px; margin-bottom: 10px;" onerror="this.style.display='none'">`;
        }
        
        // Название
        html += `<div style="font-size: 18px; font-weight: bold; margin-bottom: 8px;">${item.title}</div>`;
        
        // Детали
        const details = [];
        if (item.genre) details.push(`<span style="color: #4a9eff;">🎮 ${item.genre}</span>`);
        if (item.rating) details.push(`<span style="color: #ffd700;">★ ${item.rating}</span>`);
        if (item.year) details.push(`<span style="color: #aaa;">📅 ${item.year}</span>`);
        if (item.developer) details.push(`<span style="color: #aaa;">👨‍💻 ${item.developer}</span>`);
        if (item.price !== undefined) {
            const priceStr = item.price === 0 ? 'Free' : `$${item.price}`;
            details.push(`<span style="color: #4caf50;">💰 ${priceStr}</span>`);
        }
        
        if (details.length > 0) {
            html += `<div style="font-size: 13px; line-height: 1.6;">${details.join('<br>')}</div>`;
        }
        
        // Подсказка
        html += `<div style="margin-top: 10px; font-size: 11px; color: #888; border-top: 1px solid #333; padding-top: 8px;">Кликните для перехода на страницу игры</div>`;
        
        this.tooltipElement.innerHTML = html;
        this.tooltipElement.style.display = 'block';
        
        // Позиционирование (справа от курсора, с проверкой границ экрана)
        const tooltipRect = this.tooltipElement.getBoundingClientRect();
        let left = x + 15;
        let top = y - tooltipRect.height / 2;
        
        // Проверка границ экрана
        if (left + tooltipRect.width > window.innerWidth) {
            left = x - tooltipRect.width - 15; // Слева от курсора
        }
        if (top < 10) top = 10;
        if (top + tooltipRect.height > window.innerHeight - 10) {
            top = window.innerHeight - tooltipRect.height - 10;
        }
        
        this.tooltipElement.style.left = left + 'px';
        this.tooltipElement.style.top = top + 'px';
    };
    
    VennGrid.prototype._hideTooltip = function() {
        if (this.tooltipElement) {
            this.tooltipElement.style.display = 'none';
        }
        if (this.hoverTimeout) {
            clearTimeout(this.hoverTimeout);
            this.hoverTimeout = null;
        }
        this.currentHoverItem = null;
    };
    
    // === ПРИВАТНЫЕ МЕТОДЫ ===
    
    VennGrid.prototype._copySorted = function() {
        const result = {sorted: {}, subsorted: {}};
        
        for (const key in this.sorted) {
            result.sorted[key] = this.sorted[key].slice();
        }
        
        for (const area in this.subsorted) {
            result.subsorted[area] = {};
            for (const sub in this.subsorted[area]) {
                result.subsorted[area][sub] = this.subsorted[area][sub].slice();
            }
        }
        
        return result;
    };
    
    VennGrid.prototype._getTotalItems = function() {
        let total = 0;
        for (const key in this.sorted) {
            total += this.sorted[key].length;
        }
        for (const area in this.subsorted) {
            for (const sub in this.subsorted[area]) {
                total += this.subsorted[area][sub].length;
            }
        }
        return total;
    };
    
    VennGrid.prototype._setupEventListeners = function() {
        this._wheelHandler = this._handleWheel.bind(this);
        this._mouseDownHandler = this._handleMouseDown.bind(this);
        this._mouseMoveHandler = this._handleMouseMove.bind(this);
        this._mouseUpHandler = this._handleMouseUp.bind(this);
        this._clickHandler = this._handleClick.bind(this);
        this._mouseLeaveHandler = this._handleMouseLeave.bind(this);
        
        this.canvas.addEventListener('wheel', this._wheelHandler);
        this.canvas.addEventListener('mousedown', this._mouseDownHandler);
        this.canvas.addEventListener('mousemove', this._mouseMoveHandler);
        this.canvas.addEventListener('mouseup', this._mouseUpHandler);
        this.canvas.addEventListener('click', this._clickHandler);
        this.canvas.addEventListener('mouseleave', this._mouseLeaveHandler);
    };
    
    VennGrid.prototype._removeEventListeners = function() {
        this.canvas.removeEventListener('wheel', this._wheelHandler);
        this.canvas.removeEventListener('mousedown', this._mouseDownHandler);
        this.canvas.removeEventListener('mousemove', this._mouseMoveHandler);
        this.canvas.removeEventListener('mouseup', this._mouseUpHandler);
        this.canvas.removeEventListener('click', this._clickHandler);
        this.canvas.removeEventListener('mouseleave', this._mouseLeaveHandler);
    };
    
    VennGrid.prototype._handleMouseLeave = function(e) {
        this._hideTooltip();
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
        const item = this.getCellAt(e.clientX, e.clientY);
        
        if (item) {
            if (this.options.onCellClick && typeof this.options.onCellClick === 'function') {
                this.options.onCellClick({
                    item: item,
                    position: {x: e.clientX, y: e.clientY}
                });
            } else if (item.slug) {
                // Автоматический переход на страницу игры, если не задан callback
                window.location.href = '/game/' + item.slug + '/';
            }
        }
    };
    
    VennGrid.prototype._handleMouseDown = function(e) {
        if (!this.options.enablePan) return;
        
        this.dragging = true;
        this.dragStart = {x: e.clientX, y: e.clientY};
        this.panStart = {x: this.pan.x, y: this.pan.y};
    };
    
    VennGrid.prototype._handleMouseMove = function(e) {
        const item = this.getCellAt(e.clientX, e.clientY);
        
        // Обработка tooltip
        if (item && item.id === (this.currentHoverItem ? this.currentHoverItem.id : null)) {
            // Тот же элемент - ничего не делаем
        } else if (item) {
            // Новый элемент - запускаем таймер
            this._hideTooltip();
            this.currentHoverItem = item;
            this.hoverTimeout = setTimeout(() => {
                this._showTooltip(item, e.clientX, e.clientY);
            }, 500); // 0.5 секунды задержка
        } else {
            // Ушли с элемента - скрываем tooltip
            this._hideTooltip();
        }
        
        // Обработка hover callback (если задан)
        if (item && this.options.onCellHover && typeof this.options.onCellHover === 'function') {
            this.options.onCellHover({
                item: item,
                position: {x: e.clientX, y: e.clientY}
            });
        }
        
        // Обработка pan
        if (this.dragging && this.options.enablePan) {
            const dx = e.clientX - this.dragStart.x;
            const dy = e.clientY - this.dragStart.y;
            this.pan.x = this.panStart.x + dx;
            this.pan.y = this.panStart.y + dy;
            this.render();
        }
    };
    
    VennGrid.prototype._handleMouseUp = function(e) {
        this.dragging = false;
    };
    
    VennGrid.prototype._resizeCanvas = function() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    };
    
    // === ЭКСПОРТ ===
    window.VennGrid = VennGrid;
    
})(window);

