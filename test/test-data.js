// Тестовые данные для VennGrid.js
const testData = {
    sets: [
        {
            id: 'set1',
            label: 'RPG Games',
            items: [
                {id: 1, title: 'The Witcher 3', slug: 'witcher3', rating: 9.5, year: 2015, price: 29.99, developer: 'CD Projekt Red'},
                {id: 2, title: 'Skyrim', slug: 'skyrim', rating: 9.2, year: 2011, price: 19.99, developer: 'Bethesda'},
                {id: 3, title: 'Dark Souls', slug: 'dark-souls', rating: 9.0, year: 2011, price: 39.99, developer: 'FromSoftware'},
                {id: 5, title: 'Fallout 4', slug: 'fallout4', rating: 8.5, year: 2015, price: 29.99, developer: 'Bethesda'},
                {id: 7, title: 'Dragon Age', slug: 'dragon-age', rating: 8.8, year: 2009, price: 19.99, developer: 'BioWare'},
                {id: 9, title: 'Mass Effect 2', slug: 'mass-effect-2', rating: 9.4, year: 2010, price: 19.99, developer: 'BioWare'},
                {id: 11, title: 'Divinity OS2', slug: 'divinity-os2', rating: 9.3, year: 2017, price: 44.99, developer: 'Larian'},
                {id: 13, title: 'Baldur\'s Gate 3', slug: 'baldurs-gate-3', rating: 9.6, year: 2023, price: 59.99, developer: 'Larian'},
                {id: 15, title: 'Persona 5', slug: 'persona-5', rating: 9.5, year: 2016, price: 39.99, developer: 'Atlus'},
                {id: 17, title: 'Final Fantasy XV', slug: 'ff15', rating: 8.2, year: 2016, price: 34.99, developer: 'Square Enix'},
            ]
        },
        {
            id: 'set2',
            label: 'Singleplayer Games',
            items: [
                {id: 1, title: 'The Witcher 3', slug: 'witcher3', rating: 9.5, year: 2015, price: 29.99, developer: 'CD Projekt Red'},
                {id: 2, title: 'Skyrim', slug: 'skyrim', rating: 9.2, year: 2011, price: 19.99, developer: 'Bethesda'},
                {id: 4, title: 'Portal 2', slug: 'portal2', rating: 9.7, year: 2011, price: 9.99, developer: 'Valve'},
                {id: 6, title: 'Half-Life 2', slug: 'half-life-2', rating: 9.6, year: 2004, price: 9.99, developer: 'Valve'},
                {id: 8, title: 'BioShock', slug: 'bioshock', rating: 9.1, year: 2007, price: 19.99, developer: '2K Games'},
                {id: 9, title: 'Mass Effect 2', slug: 'mass-effect-2', rating: 9.4, year: 2010, price: 19.99, developer: 'BioWare'},
                {id: 10, title: 'Dishonored', slug: 'dishonored', rating: 8.9, year: 2012, price: 9.99, developer: 'Arkane'},
                {id: 13, title: 'Baldur\'s Gate 3', slug: 'baldurs-gate-3', rating: 9.6, year: 2023, price: 59.99, developer: 'Larian'},
                {id: 14, title: 'Metro Exodus', slug: 'metro-exodus', rating: 8.6, year: 2019, price: 39.99, developer: '4A Games'},
                {id: 15, title: 'Persona 5', slug: 'persona-5', rating: 9.5, year: 2016, price: 39.99, developer: 'Atlus'},
            ]
        },
        {
            id: 'set3',
            label: 'PC Games',
            items: [
                {id: 1, title: 'The Witcher 3', slug: 'witcher3', rating: 9.5, year: 2015, price: 29.99, developer: 'CD Projekt Red'},
                {id: 2, title: 'Skyrim', slug: 'skyrim', rating: 9.2, year: 2011, price: 19.99, developer: 'Bethesda'},
                {id: 3, title: 'Dark Souls', slug: 'dark-souls', rating: 9.0, year: 2011, price: 39.99, developer: 'FromSoftware'},
                {id: 4, title: 'Portal 2', slug: 'portal2', rating: 9.7, year: 2011, price: 9.99, developer: 'Valve'},
                {id: 6, title: 'Half-Life 2', slug: 'half-life-2', rating: 9.6, year: 2004, price: 9.99, developer: 'Valve'},
                {id: 11, title: 'Divinity OS2', slug: 'divinity-os2', rating: 9.3, year: 2017, price: 44.99, developer: 'Larian'},
                {id: 12, title: 'StarCraft II', slug: 'starcraft-2', rating: 9.0, year: 2010, price: 0, developer: 'Blizzard'},
                {id: 13, title: 'Baldur\'s Gate 3', slug: 'baldurs-gate-3', rating: 9.6, year: 2023, price: 59.99, developer: 'Larian'},
                {id: 14, title: 'Metro Exodus', slug: 'metro-exodus', rating: 8.6, year: 2019, price: 39.99, developer: '4A Games'},
                {id: 16, title: 'Dota 2', slug: 'dota-2', rating: 8.5, year: 2013, price: 0, developer: 'Valve'},
            ]
        }
    ],
    subareaFilters: {
        set1: [
            {field: 'rating', operator: '>=', value: 9.0, label: 'Высокий рейтинг (≥9.0)'},
            {field: 'rating', operator: '<', value: 9.0, label: 'Средний рейтинг (<9.0)'}
        ],
        set2: [
            {field: 'price', operator: '<', value: 20, label: 'Бюджетные (<$20)'},
            {field: 'price', operator: '>=', value: 20, label: 'Дорогие (≥$20)'}
        ],
        set3: [
            {field: 'year', operator: '>=', value: 2015, label: 'Современные (≥2015)'},
            {field: 'year', operator: '<', value: 2015, label: 'Классика (<2015)'}
        ]
    }
};

// Простые данные (2 множества)
const simpleData = {
    sets: [
        {
            id: 'set1',
            label: 'Action Games',
            items: [
                {id: 1, title: 'Game A', slug: 'game-a', rating: 8.5},
                {id: 2, title: 'Game B', slug: 'game-b', rating: 9.0},
                {id: 3, title: 'Game C', slug: 'game-c', rating: 7.5}
            ]
        },
        {
            id: 'set2',
            label: 'Indie Games',
            items: [
                {id: 2, title: 'Game B', slug: 'game-b', rating: 9.0},
                {id: 4, title: 'Game D', slug: 'game-d', rating: 8.0}
            ]
        }
    ]
};

// Данные для демонстрации подобластей
const subareaDemo = {
    sets: [
        {
            id: 'set1',
            label: 'Strategy Games',
            items: [
                {id: 1, title: 'Civilization VI', slug: 'civ6', rating: 9.1, year: 2016, price: 59.99},
                {id: 2, title: 'XCOM 2', slug: 'xcom2', rating: 8.8, year: 2016, price: 39.99},
                {id: 3, title: 'Age of Empires II', slug: 'aoe2', rating: 9.5, year: 1999, price: 19.99},
                {id: 4, title: 'Total War Warhammer', slug: 'tw-warhammer', rating: 8.9, year: 2016, price: 49.99},
                {id: 5, title: 'StarCraft II', slug: 'sc2', rating: 9.2, year: 2010, price: 0}
            ]
        },
        {
            id: 'set2',
            label: 'Multiplayer Games',
            items: [
                {id: 5, title: 'StarCraft II', slug: 'sc2', rating: 9.2, year: 2010, price: 0},
                {id: 6, title: 'Age of Empires IV', slug: 'aoe4', rating: 8.5, year: 2021, price: 59.99},
                {id: 4, title: 'Total War Warhammer', slug: 'tw-warhammer', rating: 8.9, year: 2016, price: 49.99}
            ]
        }
    ],
    subareaFilters: {
        set1: [
            {field: 'rating', operator: '>=', value: 9.0, label: 'Топ рейтинг'},
            {field: 'rating', operator: '<', value: 9.0, label: 'Хороший рейтинг'}
        ],
        set2: [
            {field: 'price', operator: '==', value: 0, label: 'Бесплатные'},
            {field: 'price', operator: '>', value: 0, label: 'Платные'}
        ]
    }
};

