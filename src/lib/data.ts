
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

export const shopItems = [
    { id: 'glasses', name: 'Cool Shades', price: 100, type: 'outfit', icon: '🕶️' },
    { id: 'hat_cowboy', name: 'Cowboy Hat', price: 200, type: 'outfit', icon: '🤠' },
    { id: 'crown', name: 'Royal Crown', price: 1000, type: 'outfit', icon: '👑' },
    { id: 'freeze', name: 'Streak Freeze', price: 50, type: 'powerup', icon: '🧊' },
];

export const generateDailyQuests = () => [
    { id: 'q1', description: 'Complete 1 Lesson', target: 1, current: 0, completed: false, reward: 20, type: 'lesson' as const },
    { id: 'q2', description: 'Send 5 AI Messages', target: 5, current: 0, completed: false, reward: 15, type: 'chat' as const },
    { id: 'q3', description: 'Play a Minigame', target: 1, current: 0, completed: false, reward: 10, type: 'minigame' as const },
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
                    { id: 's_u1_1', title: 'Greetings', content: 'Hola (Hello), Adiós (Goodbye), Gracias (Thank you), Buenos días (Good morning).', vocab: ['Hola (Hello)', 'Adiós (Goodbye)', 'Gracias (Thank you)'] },
                    { id: 's_u1_2', title: 'Introductions', content: 'Me llamo (My name is), Soy de (I am from), Mucho gusto (Nice to meet you).', vocab: ['Me llamo (My name is)', 'Soy de (I am from)'] },
                    { id: 's_u1_3', title: 'Common Phrases', content: 'Por favor (Please), De nada (You are welcome), Lo siento (I am sorry).', vocab: ['Por favor (Please)', 'De nada (Youre welcome)'] },
                    { id: 's_u1_4', title: 'Review: Basics', content: 'Review greetings and phrases from the unit.', vocab: [] },
                ]
            },
            {
                id: 'unit2',
                title: 'Food & Drink',
                color: 'green',
                lessons: [
                    { id: 's_u2_1', title: 'Ordering', content: 'Quiero (I want), La cuenta (The check), El menú (The menu).', vocab: ['Quiero (I want)', 'La cuenta (The check)'] },
                    { id: 's_u2_2', title: 'Fruits', content: 'Manzana (Apple), Banana (Banana), Naranja (Orange).', vocab: ['Manzana (Apple)', 'Naranja (Orange)'] },
                    { id: 's_u2_3', title: 'Drinks', content: 'Agua (Water), Cerveza (Beer), Vino (Wine), Café (Coffee).', vocab: ['Agua (Water)', 'Café (Coffee)'] },
                ]
            },
            {
                id: 'unit3',
                title: 'Travel',
                color: 'blue',
                lessons: [
                    { id: 's_u3_1', title: 'Directions', content: '¿Dónde está? (Where is?), Izquierda (Left), Derecha (Right).', vocab: ['¿Dónde está? (Where is?)', 'Izquierda (Left)'] },
                    { id: 's_u3_2', title: 'Places', content: 'El hotel (The hotel), El aeropuerto (The airport), La estación (The station).', vocab: ['Hotel (Hotel)', 'Aeropuerto (Airport)'] },
                ]
            },
            {
                id: 'unit4',
                title: 'Family',
                color: 'purple',
                lessons: [
                    { id: 's_u4_1', title: 'Close Family', content: 'Madre (Mother), Padre (Father), Hermano (Brother).', vocab: ['Madre (Mother)', 'Padre (Father)'] },
                    { id: 's_u4_2', title: 'Extended', content: 'Abuelo (Grandfather), Tío (Uncle), Primo (Cousin).', vocab: ['Abuelo (Grandpa)', 'Primo (Cousin)'] },
                ]
            },
            {
                id: 'unit5',
                title: 'Activities',
                color: 'orange',
                lessons: [
                    { id: 's_u5_1', title: 'Verbs', content: 'Comer (To eat), Dormir (To sleep), Correr (To run).', vocab: ['Comer (To eat)', 'Dormir (To sleep)'] },
                    { id: 's_u5_2', title: 'Hobbies', content: 'Leer (To read), Nadar (To swim), Bailar (To dance).', vocab: ['Leer (To read)', 'Bailar (To dance)'] },
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
                color: 'pink',
                lessons: [
                    { id: 'e_u2_1', title: 'Morning Routine', content: 'Wake up, Brush teeth, Eat breakfast.', vocab: ['Wake up', 'Breakfast'] },
                    { id: 'e_u2_2', title: 'Work', content: 'Office, Computer, Meeting.', vocab: ['Office', 'Meeting'] },
                ]
            },
             {
                id: 'unit3',
                title: 'Shopping',
                color: 'yellow',
                lessons: [
                    { id: 'e_u3_1', title: 'Clothing', content: 'Shirt, Pants, Shoes.', vocab: ['Shirt', 'Shoes'] },
                    { id: 'e_u3_2', title: 'Transactions', content: 'How much?, Cash, Credit Card.', vocab: ['Cash', 'How much?'] },
                ]
            }
        ]
    },
    arabic: {
        id: 'arabic',
        title: 'Arabic',
        flag: '🇸🇦',
        units: [
             {
                id: 'ar_unit1',
                title: 'Letters & Greetings',
                color: 'emerald',
                lessons: [
                    { id: 'a_u1_1', title: 'Greetings', content: 'Marhaban (Hello), Assalamu Alaykum (Peace be upon you), Shukran (Thank you).', vocab: ['Marhaban (Hello)', 'Shukran (Thank you)'] },
                    { id: 'a_u1_2', title: 'Basics', content: 'Naam (Yes), Laa (No), Min Fadlak (Please).', vocab: ['Naam (Yes)', 'Laa (No)'] },
                ]
            },
            {
                id: 'ar_unit2',
                title: 'Family & Home',
                color: 'amber',
                lessons: [
                    { id: 'a_u2_1', title: 'Family', content: 'Ab (Father), Om (Mother), Akhi (My Brother).', vocab: ['Ab (Father)', 'Om (Mother)'] },
                    { id: 'a_u2_2', title: 'In the House', content: 'Bayt (House), Bab (Door), Kursi (Chair).', vocab: ['Bayt (House)', 'Bab (Door)'] },
                ]
            }
        ]
    }
};

export const allLessons = [
    ...courses.spanish.units.flatMap(u => u.lessons),
    ...courses.english.units.flatMap(u => u.lessons),
    ...courses.arabic.units.flatMap(u => u.lessons)
];

export const aiRoleplayScenarios = [
    { id: 'cafe', title: 'Order at a Cafe', prompt: 'You are a barista at a coffee shop in Madrid. I am a customer. Help me order coffee and a pastry.', icon: '☕' },
    { id: 'directions', title: 'Ask Directions', prompt: 'You are a local in Mexico City. I am a lost tourist asking for directions to the museum.', icon: '🗺️' },
    { id: 'market', title: 'The Market', prompt: 'You are a fruit seller at a market. I want to buy fruit and negotiate the price.', icon: '🍎' },
    { id: 'doctor', title: 'At the Doctor', prompt: 'You are a doctor. I am a patient explaining that my head hurts and I have a fever.', icon: '🩺' },
];
