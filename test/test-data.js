// Функция для генерации placeholder обложки
function getCover(title, color) {
    return `https://via.placeholder.com/300x400/${color}/FFFFFF?text=${encodeURIComponent(title)}`;
}

// Полный набор тестовых данных
const testData = {
    sets: [
        {
            id: 'set1',
            label: 'RPG Games',
            items: [
                {id: 1, title: 'The Witcher 3', slug: 'witcher3', rating: 9.5, year: 2015, price: 29.99, developer: 'CD Projekt Red', genre: 'RPG', cover: getCover('The Witcher 3', '8B4513')},
                {id: 2, title: 'Skyrim', slug: 'skyrim', rating: 9.2, year: 2011, price: 19.99, developer: 'Bethesda', genre: 'RPG', cover: getCover('Skyrim', '4682B4')},
                {id: 3, title: 'Dark Souls', slug: 'dark-souls', rating: 9.0, year: 2011, price: 39.99, developer: 'FromSoftware', genre: 'Action RPG', cover: getCover('Dark Souls', '2F4F4F')},
                {id: 5, title: 'Fallout 4', slug: 'fallout4', rating: 8.5, year: 2015, price: 29.99, developer: 'Bethesda', genre: 'RPG', cover: getCover('Fallout 4', '708090')},
                {id: 7, title: 'Dragon Age', slug: 'dragon-age', rating: 8.8, year: 2009, price: 19.99, developer: 'BioWare', genre: 'RPG', cover: getCover('Dragon Age', '8B0000')},
                {id: 9, title: 'Mass Effect 2', slug: 'mass-effect-2', rating: 9.4, year: 2010, price: 19.99, developer: 'BioWare', genre: 'Action RPG', cover: getCover('Mass Effect 2', '191970')},
                {id: 11, title: 'Divinity OS2', slug: 'divinity-os2', rating: 9.3, year: 2017, price: 44.99, developer: 'Larian', genre: 'RPG', cover: getCover('Divinity OS2', 'DAA520')},
                {id: 13, title: 'Baldur\'s Gate 3', slug: 'baldurs-gate-3', rating: 9.6, year: 2023, price: 59.99, developer: 'Larian', genre: 'RPG', cover: getCover('Baldurs Gate 3', '8B4789')},
                {id: 15, title: 'Persona 5', slug: 'persona-5', rating: 9.5, year: 2016, price: 39.99, developer: 'Atlus', genre: 'JRPG', cover: getCover('Persona 5', 'DC143C')},
                {id: 17, title: 'Final Fantasy XV', slug: 'ff15', rating: 8.2, year: 2016, price: 34.99, developer: 'Square Enix', genre: 'JRPG', cover: getCover('Final Fantasy XV', '4B0082')},
            ]
        },
        {
            id: 'set2',
            label: 'Singleplayer Games',
            items: [
                {id: 1, title: 'The Witcher 3', slug: 'witcher3', rating: 9.5, year: 2015, price: 29.99, developer: 'CD Projekt Red', genre: 'RPG', cover: getCover('The Witcher 3', '8B4513')},
                {id: 2, title: 'Skyrim', slug: 'skyrim', rating: 9.2, year: 2011, price: 19.99, developer: 'Bethesda', genre: 'RPG', cover: getCover('Skyrim', '4682B4')},
                {id: 4, title: 'Portal 2', slug: 'portal2', rating: 9.7, year: 2011, price: 9.99, developer: 'Valve', genre: 'Puzzle', cover: getCover('Portal 2', 'FF8C00')},
                {id: 6, title: 'Half-Life 2', slug: 'half-life-2', rating: 9.6, year: 2004, price: 9.99, developer: 'Valve', genre: 'FPS', cover: getCover('Half-Life 2', 'FF6347')},
                {id: 8, title: 'BioShock', slug: 'bioshock', rating: 9.1, year: 2007, price: 19.99, developer: '2K Games', genre: 'FPS', cover: getCover('BioShock', '1E90FF')},
                {id: 9, title: 'Mass Effect 2', slug: 'mass-effect-2', rating: 9.4, year: 2010, price: 19.99, developer: 'BioWare', genre: 'Action RPG', cover: getCover('Mass Effect 2', '191970')},
                {id: 10, title: 'Dishonored', slug: 'dishonored', rating: 8.9, year: 2012, price: 9.99, developer: 'Arkane', genre: 'Stealth', cover: getCover('Dishonored', '2F4F4F')},
                {id: 13, title: 'Baldur\'s Gate 3', slug: 'baldurs-gate-3', rating: 9.6, year: 2023, price: 59.99, developer: 'Larian', genre: 'RPG', cover: getCover('Baldurs Gate 3', '8B4789')},
                {id: 14, title: 'Metro Exodus', slug: 'metro-exodus', rating: 8.6, year: 2019, price: 39.99, developer: '4A Games', genre: 'FPS', cover: getCover('Metro Exodus', '556B2F')},
                {id: 15, title: 'Persona 5', slug: 'persona-5', rating: 9.5, year: 2016, price: 39.99, developer: 'Atlus', genre: 'JRPG', cover: getCover('Persona 5', 'DC143C')},
            ]
        },
        {
            id: 'set3',
            label: 'PC Games',
            items: [
                {id: 1, title: 'The Witcher 3', slug: 'witcher3', rating: 9.5, year: 2015, price: 29.99, developer: 'CD Projekt Red', genre: 'RPG', cover: getCover('The Witcher 3', '8B4513')},
                {id: 2, title: 'Skyrim', slug: 'skyrim', rating: 9.2, year: 2011, price: 19.99, developer: 'Bethesda', genre: 'RPG', cover: getCover('Skyrim', '4682B4')},
                {id: 3, title: 'Dark Souls', slug: 'dark-souls', rating: 9.0, year: 2011, price: 39.99, developer: 'FromSoftware', genre: 'Action RPG', cover: getCover('Dark Souls', '2F4F4F')},
                {id: 4, title: 'Portal 2', slug: 'portal2', rating: 9.7, year: 2011, price: 9.99, developer: 'Valve', genre: 'Puzzle', cover: getCover('Portal 2', 'FF8C00')},
                {id: 6, title: 'Half-Life 2', slug: 'half-life-2', rating: 9.6, year: 2004, price: 9.99, developer: 'Valve', genre: 'FPS', cover: getCover('Half-Life 2', 'FF6347')},
                {id: 11, title: 'Divinity OS2', slug: 'divinity-os2', rating: 9.3, year: 2017, price: 44.99, developer: 'Larian', genre: 'RPG', cover: getCover('Divinity OS2', 'DAA520')},
                {id: 12, title: 'StarCraft II', slug: 'starcraft-2', rating: 9.0, year: 2010, price: 0, developer: 'Blizzard', genre: 'RTS', cover: getCover('StarCraft II', '4169E1')},
                {id: 13, title: 'Baldur\'s Gate 3', slug: 'baldurs-gate-3', rating: 9.6, year: 2023, price: 59.99, developer: 'Larian', genre: 'RPG', cover: getCover('Baldurs Gate 3', '8B4789')},
                {id: 14, title: 'Metro Exodus', slug: 'metro-exodus', rating: 8.6, year: 2019, price: 39.99, developer: '4A Games', genre: 'FPS', cover: getCover('Metro Exodus', '556B2F')},
                {id: 16, title: 'Dota 2', slug: 'dota-2', rating: 8.5, year: 2013, price: 0, developer: 'Valve', genre: 'MOBA', cover: getCover('Dota 2', '8B0000')},
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
                {id: 1, title: 'Game A', slug: 'game-a', rating: 8.5, genre: 'Action', cover: getCover('Game A', '20B2AA')},
                {id: 2, title: 'Game B', slug: 'game-b', rating: 9.0, genre: 'Action', cover: getCover('Game B', 'FF69B4')},
                {id: 3, title: 'Game C', slug: 'game-c', rating: 7.5, genre: 'Action', cover: getCover('Game C', '9370DB')}
            ]
        },
        {
            id: 'set2',
            label: 'Indie Games',
            items: [
                {id: 2, title: 'Game B', slug: 'game-b', rating: 9.0, genre: 'Indie', cover: getCover('Game B', 'FF69B4')},
                {id: 4, title: 'Game D', slug: 'game-d', rating: 8.0, genre: 'Indie', cover: getCover('Game D', '32CD32')}
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
                {id: 1, title: 'Civilization VI', slug: 'civ6', rating: 9.1, year: 2016, price: 59.99, genre: 'Strategy', cover: getCover('Civilization VI', '4682B4')},
                {id: 2, title: 'XCOM 2', slug: 'xcom2', rating: 8.8, year: 2016, price: 39.99, genre: 'Strategy', cover: getCover('XCOM 2', 'B22222')},
                {id: 3, title: 'Age of Empires II', slug: 'aoe2', rating: 9.5, year: 1999, price: 19.99, genre: 'RTS', cover: getCover('Age of Empires II', 'DAA520')},
                {id: 4, title: 'Total War Warhammer', slug: 'tw-warhammer', rating: 8.9, year: 2016, price: 49.99, genre: 'Strategy', cover: getCover('Total War Warhammer', '8B4513')},
                {id: 5, title: 'StarCraft II', slug: 'sc2', rating: 9.2, year: 2010, price: 0, genre: 'RTS', cover: getCover('StarCraft II', '4169E1')}
            ]
        },
        {
            id: 'set2',
            label: 'Multiplayer Games',
            items: [
                {id: 5, title: 'StarCraft II', slug: 'sc2', rating: 9.2, year: 2010, price: 0, genre: 'RTS', cover: getCover('StarCraft II', '4169E1')},
                {id: 6, title: 'Age of Empires IV', slug: 'aoe4', rating: 8.5, year: 2021, price: 59.99, genre: 'RTS', cover: getCover('Age of Empires IV', 'CD853F')},
                {id: 4, title: 'Total War Warhammer', slug: 'tw-warhammer', rating: 8.9, year: 2016, price: 49.99, genre: 'Strategy', cover: getCover('Total War Warhammer', '8B4513')}
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
