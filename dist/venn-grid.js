/**
 * VennGrid.js v2.0.0
 * Grid-based Venn diagram visualization library
 * https://github.com/username/venn-grid
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
        
        const h12 = Math.min(h1, h2);
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
            h3 = l3 > 0 ? Math.ceil((n3 + n12) / l3) : 0;
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
        if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
            throw new Error('VennGrid: первый аргумент должен быть HTMLCanvasElement');
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
        
        if (this.options.onRenderComplete) {
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
                        
                        if (this.options.showLabels && item.title) {
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
        this.ctx.fillStyle = '#000';
        this.ctx.font = '10px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        const text = item.title.length > 8 ? item.title.substring(0, 8) + '...' : item.title;
        this.ctx.fillText(text, x * cellSize + cellSize / 2, y * cellSize + cellSize / 2);
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
        this.clear();
        this.data = null;
        this.sorted = null;
        this.subsorted = null;
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
        
        this.canvas.addEventListener('wheel', this._wheelHandler);
        this.canvas.addEventListener('mousedown', this._mouseDownHandler);
        this.canvas.addEventListener('mousemove', this._mouseMoveHandler);
        this.canvas.addEventListener('mouseup', this._mouseUpHandler);
        this.canvas.addEventListener('click', this._clickHandler);
    };
    
    VennGrid.prototype._removeEventListeners = function() {
        this.canvas.removeEventListener('wheel', this._wheelHandler);
        this.canvas.removeEventListener('mousedown', this._mouseDownHandler);
        this.canvas.removeEventListener('mousemove', this._mouseMoveHandler);
        this.canvas.removeEventListener('mouseup', this._mouseUpHandler);
        this.canvas.removeEventListener('click', this._clickHandler);
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
        
        if (item && this.options.onCellClick) {
            this.options.onCellClick({
                item: item,
                position: {x: e.clientX, y: e.clientY}
            });
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
        
        if (item && this.options.onCellHover) {
            this.options.onCellHover({
                item: item,
                position: {x: e.clientX, y: e.clientY}
            });
        }
        
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

