
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export const ranks = [
    { name: 'novato', points: 0 },
    { name: 'aprendiz', points: 500 },
    { name: 'maestro', points: 2000 },
    { name: 'leyenda', points: 5000 },
];

export const getUserRank = (points) => {
    let currentRank = ranks[0];
    for (const rank of ranks) {
        if (points >= rank.points) {
            currentRank = rank;
        } else {
            break;
        }
    }
    return currentRank;
};

export const getNextRank = (points) => {
    const currentRankIndex = ranks.findIndex(r => r.points > points) -1;
    if (currentRankIndex < -1) { 
         return ranks.find(r => r.points > 0);
    }
    if (currentRankIndex + 1 >= ranks.length) {
        return null; 
    }
    return ranks[currentRankIndex + 1];
}

export const courses = {
    spanish: {
        id: 'spanish',
        title: 'Spanish',
        flag: '🇪🇸',
        units: [
            {
                id: 'unit1',
                title: 'Intro & Basics',
                color: 'teal',
                lessons: [
                    { id: 's_u1_1', title: 'Greetings', content: 'Hola, Adiós, Gracias, Buenos días.', vocab: ['Hola', 'Adiós'] },
                    { id: 's_u1_2', title: 'Introductions', content: 'Me llamo, Soy de..., Mucho gusto.', vocab: ['Me llamo', 'Soy'] },
                    { id: 's_u1_3', title: 'Common Phrases', content: 'Por favor, De nada, Lo siento.', vocab: ['Por favor', 'De nada'] },
                    { id: 's_u1_4', title: 'Review: Basics', content: 'Review greetings and phrases.', vocab: [] }, // Quiz
                ]
            },
            {
                id: 'unit2',
                title: 'Food & Drink',
                color: 'green',
                lessons: [
                    { id: 's_u2_1', title: 'Ordering', content: 'Quiero, La cuenta, El menú.', vocab: ['Quiero', 'La cuenta'] },
                    { id: 's_u2_2', title: 'Fruits', content: 'Manzana, Banana, Naranja.', vocab: ['Manzana', 'Naranja'] },
                    { id: 's_u2_3', title: 'Drinks', content: 'Agua, Cerveza, Vino, Café.', vocab: ['Agua', 'Café'] },
                ]
            },
            {
                id: 'unit3',
                title: 'Travel',
                color: 'blue',
                lessons: [
                    { id: 's_u3_1', title: 'Directions', content: '¿Dónde está...?, Izquierda, Derecha.', vocab: ['¿Dónde está?', 'Izquierda'] },
                    { id: 's_u3_2', title: 'Places', content: 'El hotel, El aeropuerto, La estación.', vocab: ['Hotel', 'Aeropuerto'] },
                ]
            }
        ]
    },
    english: {
        id: 'english',
        title: 'English',
        flag: '🇺🇸',
        units: [
            {
                id: 'unit1',
                title: 'Basics',
                color: 'indigo',
                lessons: [
                    { id: 'e_u1_1', title: 'Greetings', content: 'Hello, Goodbye, Thank you.', vocab: ['Hello', 'Goodbye'] },
                    { id: 'e_u1_2', title: 'Verb To Be', content: 'I am, You are, He is.', vocab: ['I am', 'You are'] },
                ]
            },
            {
                id: 'unit2',
                title: 'Daily Life',
                color: 'purple',
                lessons: [
                    { id: 'e_u2_1', title: 'Morning Routine', content: 'Wake up, Brush teeth, Eat breakfast.', vocab: ['Wake up', 'Breakfast'] },
                    { id: 'e_u2_2', title: 'Work', content: 'Office, Computer, Meeting.', vocab: ['Office', 'Meeting'] },
                ]
            }
        ]
    }
};

export const allLessons = [
    ...courses.spanish.units.flatMap(u => u.lessons),
    ...courses.english.units.flatMap(u => u.lessons)
];
