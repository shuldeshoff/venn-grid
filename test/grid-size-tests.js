/**
 * Unit-тесты для проверки расчёта размеров сетки
 * Тестирование случаев с 1, 2 и 3 множествами
 */

// Вспомогательная функция для подсчёта общего количества элементов
function countTotalItems(sorted) {
    let total = 0;
    for (const area in sorted) {
        total += sorted[area].length;
    }
    return total;
}

// Вспомогательная функция для подсчёта уникальных элементов по ID
function countUniqueItems(sorted) {
    const uniqueIds = new Set();
    for (const area in sorted) {
        sorted[area].forEach(item => uniqueIds.add(item.id));
    }
    return uniqueIds.size;
}

// Тест 1: Один критерий (1 множество)
function test1Set() {
    console.log('\n=== ТЕСТ 1: Одно множество ===');
    
    const data = {
        sets: [
            {
                id: 'rpg',
                label: 'RPG',
                items: Array.from({length: 50}, (_, i) => ({
                    id: i + 1,
                    title: `Game ${i + 1}`
                }))
            }
        ]
    };
    
    // Создаём временный canvas
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    
    const venn = new VennGrid(canvas, {
        cellSize: 30,
        aspectRatio: 1.3
    });
    
    venn.setData(data);
    
    const totalItems = countTotalItems(venn.sorted);
    const gridCapacity = venn.gridSizes.width * venn.gridSizes.height;
    
    console.log(`✓ Всего элементов: ${totalItems}`);
    console.log(`✓ Размер сетки: ${venn.gridSizes.width} × ${venn.gridSizes.height} = ${gridCapacity}`);
    console.log(`✓ set1: ${venn.sorted.set1.length}`);
    console.log(`✓ set2: ${venn.sorted.set2.length}`);
    console.log(`✓ set3: ${venn.sorted.set3.length}`);
    console.log(`✓ intersection12: ${venn.sorted.intersection12.length}`);
    
    // Проверки
    const passed = totalItems === 50 && 
                   venn.sorted.set1.length === 50 &&
                   venn.sorted.set2.length === 0 &&
                   venn.sorted.set3.length === 0 &&
                   venn.sorted.intersection12.length === 0 &&
                   gridCapacity >= totalItems;
    
    if (passed) {
        console.log('✅ ТЕСТ 1 ПРОЙДЕН');
    } else {
        console.error('❌ ТЕСТ 1 ПРОВАЛЕН');
        if (gridCapacity < totalItems) {
            console.error(`   Проблема: сетка ${gridCapacity} меньше чем элементов ${totalItems}`);
        }
    }
    
    return passed;
}

// Тест 2: Два критерия (2 множества) - КРИТИЧЕСКИЙ СЛУЧАЙ
function test2Sets() {
    console.log('\n=== ТЕСТ 2: Два множества (КРИТИЧЕСКИЙ) ===');
    
    const data = {
        sets: [
            {
                id: 'rpg',
                label: 'RPG',
                items: [
                    { id: 1, title: 'Skyrim' },
                    { id: 2, title: 'Witcher 3' },
                    { id: 3, title: 'Dark Souls' },
                    { id: 4, title: 'Dragon Age' },
                    { id: 5, title: 'Mass Effect' }
                ]
            },
            {
                id: 'action',
                label: 'Action',
                items: [
                    { id: 3, title: 'Dark Souls' },     // Пересечение
                    { id: 6, title: 'GTA V' },
                    { id: 7, title: 'Cyberpunk' },
                    { id: 8, title: 'Fallout' }
                ]
            }
        ]
    };
    
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    
    const venn = new VennGrid(canvas, {
        cellSize: 30,
        aspectRatio: 1.3
    });
    
    venn.setData(data);
    
    const totalItems = countTotalItems(venn.sorted);
    const uniqueItems = countUniqueItems(venn.sorted);
    const gridCapacity = venn.gridSizes.width * venn.gridSizes.height;
    
    console.log(`✓ Всего элементов в массивах: ${totalItems}`);
    console.log(`✓ Уникальных элементов: ${uniqueItems}`);
    console.log(`✓ Размер сетки: ${venn.gridSizes.width} × ${venn.gridSizes.height} = ${gridCapacity}`);
    console.log(`✓ set1 (только RPG): ${venn.sorted.set1.length}`);
    console.log(`✓ set2 (только Action): ${venn.sorted.set2.length}`);
    console.log(`✓ set3: ${venn.sorted.set3.length}`);
    console.log(`✓ intersection12 (RPG ∩ Action): ${venn.sorted.intersection12.length}`);
    console.log(`✓ intersection13: ${venn.sorted.intersection13.length}`);
    console.log(`✓ intersection23: ${venn.sorted.intersection23.length}`);
    console.log(`✓ intersection123: ${venn.sorted.intersection123.length}`);
    
    // Ожидаемые значения
    const expectedSet1 = 4;  // Skyrim, Witcher 3, Dragon Age, Mass Effect
    const expectedSet2 = 3;  // GTA V, Cyberpunk, Fallout
    const expectedIntersection = 1;  // Dark Souls
    const expectedTotal = 8;  // 4 + 3 + 1
    
    // Проверки
    const passed = uniqueItems === expectedTotal &&
                   venn.sorted.set1.length === expectedSet1 &&
                   venn.sorted.set2.length === expectedSet2 &&
                   venn.sorted.intersection12.length === expectedIntersection &&
                   venn.sorted.set3.length === 0 &&
                   venn.sorted.intersection13.length === 0 &&
                   venn.sorted.intersection23.length === 0 &&
                   venn.sorted.intersection123.length === 0 &&
                   gridCapacity >= totalItems;
    
    if (passed) {
        console.log('✅ ТЕСТ 2 ПРОЙДЕН');
    } else {
        console.error('❌ ТЕСТ 2 ПРОВАЛЕН');
        if (uniqueItems !== expectedTotal) {
            console.error(`   Ожидалось ${expectedTotal} уникальных, получено ${uniqueItems}`);
        }
        if (venn.sorted.set1.length !== expectedSet1) {
            console.error(`   set1: ожидалось ${expectedSet1}, получено ${venn.sorted.set1.length}`);
        }
        if (venn.sorted.set2.length !== expectedSet2) {
            console.error(`   set2: ожидалось ${expectedSet2}, получено ${venn.sorted.set2.length}`);
        }
        if (venn.sorted.intersection12.length !== expectedIntersection) {
            console.error(`   intersection12: ожидалось ${expectedIntersection}, получено ${venn.sorted.intersection12.length}`);
        }
        if (gridCapacity < totalItems) {
            console.error(`   Проблема: сетка ${gridCapacity} меньше чем элементов ${totalItems}`);
        }
    }
    
    return passed;
}

// Тест 3: Два критерия с большим набором данных
function test2SetsLarge() {
    console.log('\n=== ТЕСТ 3: Два множества (БОЛЬШОЙ НАБОР) ===');
    
    // Создаём набор как в реальном случае: 28 + 17 игр с пересечением 5
    const set1Items = Array.from({length: 28}, (_, i) => ({
        id: i + 1,
        title: `RPG Game ${i + 1}`
    }));
    
    const set2Items = Array.from({length: 17}, (_, i) => ({
        id: i < 5 ? i + 1 : i + 24,  // Первые 5 - пересечение, остальные уникальные
        title: i < 5 ? `RPG Game ${i + 1}` : `Strategy Game ${i + 1}`
    }));
    
    const data = {
        sets: [
            { id: 'rpg', label: 'RPG', items: set1Items },
            { id: 'strategy', label: 'Strategy', items: set2Items }
        ]
    };
    
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    
    const venn = new VennGrid(canvas, {
        cellSize: 30,
        aspectRatio: 1.3
    });
    
    venn.setData(data);
    
    const totalItems = countTotalItems(venn.sorted);
    const uniqueItems = countUniqueItems(venn.sorted);
    const gridCapacity = venn.gridSizes.width * venn.gridSizes.height;
    
    console.log(`✓ Всего элементов в массивах: ${totalItems}`);
    console.log(`✓ Уникальных элементов: ${uniqueItems}`);
    console.log(`✓ Размер сетки: ${venn.gridSizes.width} × ${venn.gridSizes.height} = ${gridCapacity}`);
    console.log(`✓ set1 (только RPG): ${venn.sorted.set1.length}`);
    console.log(`✓ set2 (только Strategy): ${venn.sorted.set2.length}`);
    console.log(`✓ intersection12 (RPG ∩ Strategy): ${venn.sorted.intersection12.length}`);
    
    // Ожидаемые значения: 28 + 17 - 5 = 40 уникальных
    const expectedTotal = 40;
    const expectedIntersection = 5;
    
    // Проверки
    const passed = uniqueItems === expectedTotal &&
                   venn.sorted.intersection12.length === expectedIntersection &&
                   venn.sorted.set3.length === 0 &&
                   gridCapacity >= totalItems;
    
    if (passed) {
        console.log('✅ ТЕСТ 3 ПРОЙДЕН');
    } else {
        console.error('❌ ТЕСТ 3 ПРОВАЛЕН');
        if (uniqueItems !== expectedTotal) {
            console.error(`   Ожидалось ${expectedTotal} уникальных, получено ${uniqueItems}`);
        }
        if (gridCapacity < totalItems) {
            console.error(`   КРИТИЧНО: сетка ${gridCapacity} меньше чем элементов ${totalItems}`);
        }
    }
    
    return passed;
}

// Тест 4: Три критерия (3 множества)
function test3Sets() {
    console.log('\n=== ТЕСТ 4: Три множества ===');
    
    const data = {
        sets: [
            {
                id: 'rpg',
                label: 'RPG',
                items: [
                    { id: 1, title: 'Skyrim' },
                    { id: 2, title: 'Witcher 3' },
                    { id: 3, title: 'Dark Souls' }
                ]
            },
            {
                id: 'action',
                label: 'Action',
                items: [
                    { id: 2, title: 'Witcher 3' },
                    { id: 3, title: 'Dark Souls' },
                    { id: 4, title: 'GTA V' }
                ]
            },
            {
                id: 'openworld',
                label: 'Open World',
                items: [
                    { id: 1, title: 'Skyrim' },
                    { id: 2, title: 'Witcher 3' },
                    { id: 4, title: 'GTA V' }
                ]
            }
        ]
    };
    
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    
    const venn = new VennGrid(canvas, {
        cellSize: 30,
        aspectRatio: 1.3
    });
    
    venn.setData(data);
    
    const totalItems = countTotalItems(venn.sorted);
    const uniqueItems = countUniqueItems(venn.sorted);
    const gridCapacity = venn.gridSizes.width * venn.gridSizes.height;
    
    console.log(`✓ Всего элементов в массивах: ${totalItems}`);
    console.log(`✓ Уникальных элементов: ${uniqueItems}`);
    console.log(`✓ Размер сетки: ${venn.gridSizes.width} × ${venn.gridSizes.height} = ${gridCapacity}`);
    console.log(`✓ set1 (только RPG): ${venn.sorted.set1.length}`);
    console.log(`✓ set2 (только Action): ${venn.sorted.set2.length}`);
    console.log(`✓ set3 (только Open World): ${venn.sorted.set3.length}`);
    console.log(`✓ intersection12 (RPG ∩ Action): ${venn.sorted.intersection12.length}`);
    console.log(`✓ intersection13 (RPG ∩ Open World): ${venn.sorted.intersection13.length}`);
    console.log(`✓ intersection23 (Action ∩ Open World): ${venn.sorted.intersection23.length}`);
    console.log(`✓ intersection123 (все три): ${venn.sorted.intersection123.length}`);
    
    // Ожидаемые значения
    const expectedTotal = 4;  // Skyrim, Witcher 3, Dark Souls, GTA V
    const expectedIntersection123 = 1;  // Witcher 3 (во всех трёх)
    
    // Проверки
    const passed = uniqueItems === expectedTotal &&
                   venn.sorted.intersection123.length === expectedIntersection123 &&
                   gridCapacity >= totalItems;
    
    if (passed) {
        console.log('✅ ТЕСТ 4 ПРОЙДЕН');
    } else {
        console.error('❌ ТЕСТ 4 ПРОВАЛЕН');
        if (uniqueItems !== expectedTotal) {
            console.error(`   Ожидалось ${expectedTotal} уникальных, получено ${uniqueItems}`);
        }
        if (gridCapacity < totalItems) {
            console.error(`   Проблема: сетка ${gridCapacity} меньше чем элементов ${totalItems}`);
        }
    }
    
    return passed;
}

// Запуск всех тестов
function runAllTests() {
    console.log('🧪 === ЗАПУСК ТЕСТОВ РАЗМЕРОВ СЕТКИ ===');
    
    const results = {
        test1: test1Set(),
        test2: test2Sets(),
        test3: test2SetsLarge(),
        test4: test3Sets()
    };
    
    console.log('\n📊 === ИТОГИ ===');
    const passed = Object.values(results).filter(r => r).length;
    const total = Object.keys(results).length;
    
    console.log(`Пройдено: ${passed}/${total}`);
    
    if (passed === total) {
        console.log('✅ ВСЕ ТЕСТЫ ПРОЙДЕНЫ!');
    } else {
        console.error('❌ НЕКОТОРЫЕ ТЕСТЫ ПРОВАЛЕНЫ');
        Object.entries(results).forEach(([name, result]) => {
            if (!result) {
                console.error(`   - ${name} провален`);
            }
        });
    }
    
    return passed === total;
}

