// Запуск тестов в Node.js окружении
const fs = require('fs');
const path = require('path');

// Загружаем библиотеку VennGrid
const vennGridCode = fs.readFileSync(path.join(__dirname, '../src/venn-grid.js'), 'utf8');

// Создаём минимальное DOM окружение для Node.js
class HTMLCanvasElement {
    constructor() {
        this.width = 800;
        this.height = 600;
        this.eventListeners = {};
    }
    getContext() {
        return {
            clearRect: () => {},
            fillRect: () => {},
            strokeRect: () => {},
            fillText: () => {},
            measureText: () => ({ width: 10 }),
            save: () => {},
            restore: () => {},
            translate: () => {},
            scale: () => {},
            beginPath: () => {},
            arc: () => {},
            fill: () => {},
            stroke: () => {},
            moveTo: () => {},
            lineTo: () => {},
            quadraticCurveTo: () => {},
            closePath: () => {},
            clip: () => {},
            drawImage: () => {},
            set fillStyle(val) {},
            set strokeStyle(val) {},
            set font(val) {},
            set textAlign(val) {},
            set textBaseline(val) {}
        };
    }
    addEventListener(event, handler) {
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        this.eventListeners[event].push(handler);
    }
    removeEventListener(event, handler) {
        if (this.eventListeners[event]) {
            const index = this.eventListeners[event].indexOf(handler);
            if (index > -1) {
                this.eventListeners[event].splice(index, 1);
            }
        }
    }
    getBoundingClientRect() {
        return {
            width: this.width,
            height: this.height,
            top: 0,
            left: 0,
            right: this.width,
            bottom: this.height
        };
    }
}

global.HTMLCanvasElement = HTMLCanvasElement;
global.window = global;
global.document = {
    getElementById: () => null,
    createElement: (tag) => {
        if (tag === 'canvas') {
            return new HTMLCanvasElement();
        }
        if (tag === 'div') {
            return {
                style: {},
                classList: {
                    add: () => {},
                    remove: () => {}
                },
                addEventListener: () => {},
                removeEventListener: () => {}
            };
        }
        return {};
    },
    body: {
        appendChild: () => {},
        removeChild: () => {},
        contains: () => false
    }
};
global.Image = class Image {
    constructor() {
        this.src = '';
        this.onload = null;
        this.onerror = null;
        this.crossOrigin = null;
        this.complete = false;
        this.naturalHeight = 0;
        this.width = 0;
        this.height = 0;
    }
};
global.Map = Map;
global.Set = Set;

// Выполняем код библиотеки
eval(vennGridCode);

// Загружаем тесты
const testsCode = fs.readFileSync(path.join(__dirname, 'grid-size-tests.js'), 'utf8');
eval(testsCode);

// Запускаем тесты
console.log('🚀 Запуск тестов из Node.js...\n');
const result = runAllTests();

process.exit(result ? 0 : 1);

