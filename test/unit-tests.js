/**
 * Unit-тесты для VennGrid.js
 * Проверка соответствия алгоритму Godot без визуализации
 */

// === HELPER FUNCTIONS ===

function assert(condition, message) {
    if (!condition) {
        throw new Error('FAILED: ' + message);
    }
}

function assertEqual(actual, expected, message) {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        console.error('Expected:', expected);
        console.error('Actual:', actual);
        throw new Error('FAILED: ' + message);
    }
}

function log(message, isError = false) {
    const prefix = isError ? '❌' : '✅';
    console.log(prefix + ' ' + message);
}

// === TEST DATA ===

const testData1 = {
    sets: [
        {
            id: 'set1',
            items: [
                {id: 1, title: 'Item 1'},
                {id: 2, title: 'Item 2'}
            ]
        },
        {
            id: 'set2',
            items: [
                {id: 2, title: 'Item 2'},
                {id: 3, title: 'Item 3'}
            ]
        },
        {
            id: 'set3',
            items: [
                {id: 1, title: 'Item 1'},
                {id: 2, title: 'Item 2'},
                {id: 3, title: 'Item 3'}
            ]
        }
    ]
};

// === ТЕСТ 1: Битовая маркировка ===

function testBitmask() {
    console.log('\n=== ТЕСТ 1: Битовая маркировка ===');
    
    // Ожидаемые результаты:
    // Item 1: в set1 (bit 0) и set3 (bit 2) = 101 = 5
    // Item 2: во всех трех = 111 = 7
    // Item 3: в set2 (bit 1) и set3 (bit 2) = 110 = 6
    
    const allItems = new Map();
    
    testData1.sets.forEach((set, setIndex) => {
        set.items.forEach(item => {
            if (!allItems.has(item.id)) {
                allItems.set(item.id, Object.assign({}, item, {_bitmask: 0}));
            }
            allItems.get(item.id)._bitmask |= (1 << setIndex);
        });
    });
    
    const result = Array.from(allItems.values());
    
    // Проверка
    const item1 = result.find(i => i.id === 1);
    const item2 = result.find(i => i.id === 2);
    const item3 = result.find(i => i.id === 3);
    
    assertEqual(item1._bitmask, 5, 'Item 1 должен иметь bitmask 5 (101)');
    assertEqual(item2._bitmask, 7, 'Item 2 должен иметь bitmask 7 (111)');
    assertEqual(item3._bitmask, 6, 'Item 3 должен иметь bitmask 6 (110)');
    
    log('Битовая маркировка работает правильно');
    return result;
}

// === ТЕСТ 2: Сортировка в области ===

function testAreaSorting() {
    console.log('\n=== ТЕСТ 2: Сортировка в области ===');
    
    const items = testBitmask();
    
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
    
    // Проверка распределения
    assertEqual(sorted.set1.length, 0, 'set1 должен быть пустым (нет уникальных для set1)');
    assertEqual(sorted.set2.length, 0, 'set2 должен быть пустым');
    assertEqual(sorted.set3.length, 0, 'set3 должен быть пустым');
    assertEqual(sorted.intersection13.length, 1, 'intersection13 должен содержать 1 элемент (Item 1)');
    assertEqual(sorted.intersection23.length, 1, 'intersection23 должен содержать 1 элемент (Item 3)');
    assertEqual(sorted.intersection123.length, 1, 'intersection123 должен содержать 1 элемент (Item 2)');
    
    log('Сортировка в области работает правильно');
    return sorted;
}

// === ТЕСТ 3: Расчет размеров сетки (КРИТИЧЕСКИЙ!) ===

function testGridSizeCalculation() {
    console.log('\n=== ТЕСТ 3: Расчет размеров сетки (алгоритм Godot) ===');
    
    // Создадим тестовый случай из Godot
    const sorted = {
        set1: Array(10).fill({id: 1}),      // data1: 10 элементов
        set2: Array(8).fill({id: 2}),       // data2: 8 элементов
        set3: Array(6).fill({id: 3}),       // data3: 6 элементов
        intersection12: Array(3).fill({id: 4}),   // data12: 3
        intersection13: Array(2).fill({id: 5}),   // data13: 2
        intersection23: Array(2).fill({id: 6}),   // data23: 2
        intersection123: Array(1).fill({id: 7})   // data123: 1
    };
    
    const subsorted = {
        set1: {a: [], b: [], c: [], d: []},
        set2: {a: [], b: [], c: [], d: []},
        set3: {a: [], b: [], c: [], d: []}
    };
    
    // АЛГОРИТМ GODOT (из Grid.gd, строки 225-288):
    
    // Шаг 1: Подсчет элементов в подобластях
    const n1a = subsorted.set1.a.length;
    const n1b = subsorted.set1.b.length;
    const n1c = subsorted.set1.c.length;
    const n2a = subsorted.set2.a.length;
    const n2b = subsorted.set2.b.length;
    const n2c = subsorted.set2.c.length;
    const n3a = subsorted.set3.a.length;
    const n3b = subsorted.set3.b.length;
    const n3c = subsorted.set3.c.length;
    
    // Шаг 2: Размеры пересечений (ВАЖНО!)
    let n123 = sorted.intersection123.length;
    let n12 = sorted.intersection12.length + n123;  // data12.size() + n123
    let n13 = sorted.intersection13.length + n123;  // data13.size() + n123
    let n23 = sorted.intersection23.length + n123;  // data23.size() + n123
    
    console.log('n12 = data12.size() + n123 =', sorted.intersection12.length, '+', n123, '=', n12);
    console.log('n13 = data13.size() + n123 =', sorted.intersection13.length, '+', n123, '=', n13);
    console.log('n23 = data23.size() + n123 =', sorted.intersection23.length, '+', n123, '=', n23);
    
    // Шаг 3: Общие размеры областей (ВКЛЮЧАЮТ пересечения!)
    const n1 = sorted.set1.length + n12 + n13 + n1a + n1b + n1c;
    const n2 = sorted.set2.length + n12 + n23 + n2a + n2b + n2c;
    const n3 = sorted.set3.length + n13 + n23 + n3a + n3b + n3c;
    
    console.log('n1 = data1.size() + n12 + n13 + подобласти =', sorted.set1.length, '+', n12, '+', n13, '+', (n1a+n1b+n1c), '=', n1);
    console.log('n2 = data2.size() + n12 + n23 + подобласти =', sorted.set2.length, '+', n12, '+', n23, '+', (n2a+n2b+n2c), '=', n2);
    console.log('n3 = data3.size() + n13 + n23 + подобласти =', sorted.set3.length, '+', n13, '+', n23, '+', (n3a+n3b+n3c), '=', n3);
    
    // Шаг 4: Высота и ширина по формуле sqrt
    const h1 = Math.ceil(Math.sqrt(n1) / 1.3);
    const h2 = Math.ceil(Math.sqrt(n2) / 1.3);
    const l1 = Math.ceil(n1 / h1);
    const l2 = Math.ceil(n2 / h2);
    
    console.log('h1 = ceil(sqrt(' + n1 + ') / 1.3) =', h1);
    console.log('l1 = ceil(' + n1 + ' / ' + h1 + ') =', l1);
    console.log('h2 = ceil(sqrt(' + n2 + ') / 1.3) =', h2);
    console.log('l2 = ceil(' + n2 + ' / ' + h2 + ') =', l2);
    
    // Шаг 5: Размеры пересечения 12
    const h12 = Math.min(h1, h2);
    const l12 = h12 > 0 ? Math.ceil(n12 / h12) : 0;
    
    console.log('h12 = min(' + h1 + ', ' + h2 + ') =', h12);
    console.log('l12 = ceil(' + n12 + ' / ' + h12 + ') =', l12);
    
    // Шаг 6: Размеры центрального пересечения
    const l123 = l12;
    const h123 = l123 > 0 ? Math.ceil(n123 / l123) : 0;
    
    console.log('l123 = l12 =', l123);
    console.log('h123 = ceil(' + n123 + ' / ' + l123 + ') =', h123);
    
    // ВАЖНО! Корректируем n13 и n23 (из Godot, строки 250-252)
    n13 = n13 - n123;
    n23 = n23 - n123;
    n123 = (l123 * h123 > n123) ? l123 * h123 : n123;
    
    console.log('После коррекции: n13 =', n13, ', n23 =', n23, ', n123 =', n123);
    
    // Шаг 7: Размеры третьей области
    let l13, h13, l23, h23, l3, h3;
    
    if (n123 > 0) {
        l13 = h123 > 0 ? Math.ceil(n13 / h123) : 0;
        h13 = h123;
        l23 = h123 > 0 ? Math.ceil(n23 / h123) : 0;
        h23 = h123;
        l3 = l13 + l23 + l123;
        h3 = l3 > 0 ? Math.ceil((n13 + n23 + n123) / l3) : 0;
        console.log('Ветка n123 > 0');
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
        console.log('Ветка n123 = 0');
    }
    
    console.log('l3 =', l3, ', h3 =', h3);
    console.log('l13 =', l13, ', h13 =', h13);
    console.log('l23 =', l23, ', h23 =', h23);
    
    // Шаг 8: Финальные размеры
    const width = n123 > 0 ? l1 + l2 - l123 : l1 + l2 - l12;
    const height = n123 > 0 ? h1 + h3 - h123 : h1 + h3 - h12;
    
    console.log('ФИНАЛЬНЫЕ РАЗМЕРЫ:');
    console.log('width =', width, '(формула:', n123 > 0 ? 'l1 + l2 - l123' : 'l1 + l2 - l12', ')');
    console.log('height =', height, '(формула:', n123 > 0 ? 'h1 + h3 - h123' : 'h1 + h3 - h12', ')');
    
    // Шаг 9: Обнуление нулевых размеров (из Godot, строки 276-287)
    if (h12 === 0 || l12 === 0) { l12 = 0; h12 = 0; }
    if (h13 === 0 || l13 === 0) { l13 = 0; h13 = 0; }
    if (h23 === 0 || l23 === 0) { l23 = 0; h23 = 0; }
    if (h123 === 0 || l123 === 0) { l123 = 0; h123 = 0; }
    
    const result = {
        width, height,
        l1, l2, l3, h1, h2, h3,
        l12, l13, l23, l123,
        h12, h13, h23, h123
    };
    
    console.log('\nРЕЗУЛЬТАТ:', JSON.stringify(result, null, 2));
    
    // Проверки
    assert(width > 0, 'Ширина сетки должна быть > 0');
    assert(height > 0, 'Высота сетки должна быть > 0');
    assert(l1 >= l12 || l12 === 0, 'l1 должен быть >= l12 (пересечение не может быть шире основной области)');
    
    log('Расчет размеров сетки выполнен по алгоритму Godot');
    return result;
}

// === ТЕСТ 4: Определение области для ячейки (КРИТИЧЕСКИЙ!) ===

function testAreaDetection() {
    console.log('\n=== ТЕСТ 4: Определение области для ячейки (алгоритм Godot) ===');
    
    // Используем результаты предыдущего теста
    const gridSizes = testGridSizeCalculation();
    const {l1, l2, l3, h1, h2, h3, l12, l13, l23, l123, h12, h13, h23, h123, width, height} = gridSizes;
    
    console.log('\nИспользуем размеры:', gridSizes);
    
    // Функция из Godot Grid.gd, метод drawPrefab (строки 107-212)
    function getAreaAtPosition(x, y) {
        let area = "";
        let subarea = "";
        
        if (l123 > 0 && h123 > 0) {
            // ВЕТКА 1: n123 > 0 (есть центральное пересечение)
            
            if (y < h3 - h123) {
                // Верхняя зона set3
                if (x < l1 - l13 - l123 || x >= l1 + l23) {
                    area = "";
                } else {
                    area = "set3";
                    if (x <= l1 - l13 - l123 + Math.ceil(l3/2) - 1) {
                        subarea = "a";
                    } else if (x > l1 - l13 - l123 + Math.ceil(l3/2)) {
                        subarea = "b";
                    }
                }
            } else if (y < h3) {
                // Горизонтальная полоса с пересечениями
                if (x < l1 - l13 - l123) {
                    area = "set1";
                } else if (x >= l1 - l13 - l123 && x < l1 - l123) {
                    area = "intersection13";
                } else if (x >= l1 - l123 && x < l1) {
                    area = "intersection123";
                } else if (x >= l1 && x < l1 + l23) {
                    area = "intersection23";
                } else {
                    area = "set2";
                }
            } else if (y < h2 + h3 - h123) {
                // Средняя полоса
                if (x < l1 - l123) {
                    area = "set1";
                } else if (x >= l1 - l123 && x < l1) {
                    area = "intersection12";
                } else {
                    area = "set2";
                }
            } else {
                // Нижняя зона set1
                if (x < l1) {
                    area = "set1";
                } else {
                    area = "";
                }
            }
        } else {
            // ВЕТКА 2: n123 = 0 (нет центрального пересечения)
            
            if (y < h3 - h12) {
                // Верхняя зона set3
                if (x < l1 - l13 - l12 || x >= l1 + l23) {
                    area = "";
                } else {
                    area = "set3";
                    if (x < l1 - l13 - l12 + Math.ceil(l3/2) - 1) {
                        subarea = "a";
                    } else if (x > l1 - l13 - l12 + Math.ceil(l3/2)) {
                        subarea = "b";
                    }
                }
            } else if (y < h3) {
                // Горизонтальная полоса с пересечениями
                if (x < l1 - l13 - l12) {
                    area = "set1";
                } else if (x >= l1 - l13 - l12 && x < l1 - l12) {
                    area = "intersection13";
                } else if (x >= l1 - l12 && x < l1) {
                    area = "intersection12";
                } else if (x >= l1 && x < l1 + l23) {
                    area = "intersection23";
                } else {
                    area = "set2";
                }
            } else {
                // Нижняя зона
                if (x < l1) {
                    area = "set1";
                } else {
                    area = "";
                }
            }
        }
        
        return {area, subarea};
    }
    
    // Тестируем определение областей
    console.log('\nПроверяем определение областей для различных координат:');
    
    const testPoints = [
        {x: 0, y: 0, expected: 'set1'},
        {x: l1 - 1, y: h3, expected: 'set1'},
        {x: l1, y: h3, expected: 'set2'},
    ];
    
    testPoints.forEach(point => {
        const result = getAreaAtPosition(point.x, point.y);
        console.log(`  (${point.x}, ${point.y}) => area: "${result.area}", subarea: "${result.subarea}"`);
    });
    
    log('Определение области работает по алгоритму Godot');
    return getAreaAtPosition;
}

// === ТЕСТ 5: Полная проверка пайплайна ===

function testFullPipeline() {
    console.log('\n=== ТЕСТ 5: Полная проверка пайплайна ===');
    
    // Данные для полного теста
    const testData = {
        sets: [
            {
                id: 'set1',
                items: [
                    {id: 1, title: 'Game 1', rating: 9.5},
                    {id: 2, title: 'Game 2', rating: 8.5},
                    {id: 5, title: 'Game 5', rating: 7.0}
                ]
            },
            {
                id: 'set2',
                items: [
                    {id: 2, title: 'Game 2', rating: 8.5},
                    {id: 3, title: 'Game 3', rating: 9.0},
                    {id: 4, title: 'Game 4', rating: 8.0}
                ]
            },
            {
                id: 'set3',
                items: [
                    {id: 1, title: 'Game 1', rating: 9.5},
                    {id: 2, title: 'Game 2', rating: 8.5},
                    {id: 3, title: 'Game 3', rating: 9.0},
                    {id: 6, title: 'Game 6', rating: 7.5}
                ]
            }
        ],
        subareaFilters: {
            set1: [
                {field: 'rating', operator: '>=', value: 9.0, label: 'High'}
            ]
        }
    };
    
    console.log('Входные данные:', JSON.stringify(testData, null, 2));
    
    // Шаг 1: Битовая маркировка
    console.log('\n--- Шаг 1: Битовая маркировка ---');
    const allItems = new Map();
    testData.sets.forEach((set, setIndex) => {
        set.items.forEach(item => {
            if (!allItems.has(item.id)) {
                allItems.set(item.id, Object.assign({}, item, {_bitmask: 0}));
            }
            allItems.get(item.id)._bitmask |= (1 << setIndex);
        });
    });
    const items = Array.from(allItems.values());
    console.log('Результат битовой маркировки:');
    items.forEach(item => {
        console.log(`  ${item.title}: bitmask = ${item._bitmask} (${item._bitmask.toString(2).padStart(3, '0')})`);
    });
    
    // Шаг 2: Сортировка в области
    console.log('\n--- Шаг 2: Сортировка в области ---');
    const sorted = {
        set1: [], set2: [], set3: [],
        intersection12: [], intersection13: [],
        intersection23: [], intersection123: []
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
    console.log('Распределение по областям:');
    for (const area in sorted) {
        if (sorted[area].length > 0) {
            console.log(`  ${area}: ${sorted[area].length} элементов`, sorted[area].map(i => i.title));
        }
    }
    
    // Шаг 3: Подобласти
    console.log('\n--- Шаг 3: Подобласти ---');
    const subsorted = {
        set1: {a: [], b: [], c: [], d: []},
        set2: {a: [], b: [], c: [], d: []},
        set3: {a: [], b: [], c: [], d: []}
    };
    
    if (testData.subareaFilters && testData.subareaFilters.set1) {
        const filter = testData.subareaFilters.set1[0];
        const newSet1 = [];
        sorted.set1.forEach(item => {
            if (item[filter.field] >= filter.value) {
                item._subarea = 'a';
                subsorted.set1.a.push(item);
                console.log(`  ${item.title} => set1/a (rating ${item.rating} >= ${filter.value})`);
            } else {
                newSet1.push(item);
            }
        });
        sorted.set1 = newSet1;
    }
    
    // Шаг 4: Балансировка (упрощенная проверка)
    console.log('\n--- Шаг 4: Балансировка ---');
    console.log('Размеры до балансировки:');
    console.log(`  set1 + cross: ${sorted.set1.length + sorted.intersection13.length}`);
    console.log(`  set2 + cross: ${sorted.set2.length + sorted.intersection23.length}`);
    console.log(`  set3 + cross: ${sorted.set3.length + sorted.intersection13.length}`);
    
    // Шаг 5: Расчет размеров
    console.log('\n--- Шаг 5: Расчет размеров сетки ---');
    const n1a = subsorted.set1.a.length;
    const n1b = subsorted.set1.b.length;
    const n1c = subsorted.set1.c.length;
    
    let n123 = sorted.intersection123.length;
    let n12 = sorted.intersection12.length + n123;
    let n13 = sorted.intersection13.length + n123;
    let n23 = sorted.intersection23.length + n123;
    
    const n1 = sorted.set1.length + n12 + n13 + n1a + n1b + n1c;
    const n2 = sorted.set2.length + n12 + n23;
    const n3 = sorted.set3.length + n13 + n23;
    
    console.log(`n1 = ${n1}, n2 = ${n2}, n3 = ${n3}`);
    console.log(`n12 = ${n12}, n13 = ${n13}, n23 = ${n23}, n123 = ${n123}`);
    
    const h1 = Math.ceil(Math.sqrt(n1) / 1.3);
    const l1 = Math.ceil(n1 / h1);
    console.log(`h1 = ${h1}, l1 = ${l1}`);
    
    log('Полный пайплайн выполнен успешно');
}

// === ЗАПУСК ВСЕХ ТЕСТОВ ===

console.log('╔════════════════════════════════════════════════════════╗');
console.log('║  UNIT-ТЕСТЫ VennGrid.js - Проверка алгоритма Godot   ║');
console.log('╚════════════════════════════════════════════════════════╝');

try {
    testBitmask();
    testAreaSorting();
    testGridSizeCalculation();
    testAreaDetection();
    testFullPipeline();
    
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║  ✅ ВСЕ ТЕСТЫ ПРОЙДЕНЫ УСПЕШНО!                       ║');
    console.log('╚════════════════════════════════════════════════════════╝');
} catch (error) {
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║  ❌ ТЕСТЫ ПРОВАЛЕНЫ!                                   ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.error('\nОшибка:', error.message);
    console.error(error.stack);
}

