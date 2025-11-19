
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
    { id: 'magician', name: 'Magic Hat', price: 500, type: 'outfit', icon: '🎩' },
    { id: 'mask', name: 'Smiley Mask', price: 800, type: 'outfit', icon: '🎭' },
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
                    { id: 's_u1_1', title: 'Greetings', content: 'Hola (Hello), Adiós (Goodbye), Gracias (Thank you), Buenos días (Good morning).', vocab: [{ term: 'Hola', en: 'Hello', he: 'שלום' }, { term: 'Adiós', en: 'Goodbye', he: 'להתראות' }, { term: 'Gracias', en: 'Thank you', he: 'תודה' }] },
                    { id: 's_u1_2', title: 'Introductions', content: 'Me llamo (My name is), Soy de (I am from), Mucho gusto (Nice to meet you).', vocab: [{ term: 'Me llamo', en: 'My name is', he: 'שמי' }, { term: 'Soy de', en: 'I am from', he: 'אני מ' }] },
                    { id: 's_u1_3', title: 'Common Phrases', content: 'Por favor (Please), De nada (You are welcome), Lo siento (I am sorry).', vocab: [{ term: 'Por favor', en: 'Please', he: 'בבקשה' }, { term: 'De nada', en: 'You are welcome', he: 'על לא דבר' }] },
                    { id: 's_u1_4', title: 'Review: Basics', content: 'Review greetings and phrases from the unit.', vocab: [] },
                ]
            },
            {
                id: 'unit2',
                title: 'Food & Drink',
                color: 'green',
                lessons: [
                    { id: 's_u2_1', title: 'Ordering', content: 'Quiero (I want), La cuenta (The check), El menú (The menu).', vocab: [{ term: 'Quiero', en: 'I want', he: 'אני רוצה' }, { term: 'La cuenta', en: 'The check', he: 'החשבון' }] },
                    { id: 's_u2_2', title: 'Fruits', content: 'Manzana (Apple), Banana (Banana), Naranja (Orange).', vocab: [{ term: 'Manzana', en: 'Apple', he: 'תפוח' }, { term: 'Naranja', en: 'Orange', he: 'תפוז' }] },
                    { id: 's_u2_3', title: 'Drinks', content: 'Agua (Water), Cerveza (Beer), Vino (Wine), Café (Coffee).', vocab: [{ term: 'Agua', en: 'Water', he: 'מים' }, { term: 'Café', en: 'Coffee', he: 'קפה' }] },
                ]
            },
            {
                id: 'unit3',
                title: 'Travel',
                color: 'blue',
                lessons: [
                    { id: 's_u3_1', title: 'Directions', content: '¿Dónde está? (Where is?), Izquierda (Left), Derecha (Right).', vocab: [{ term: '¿Dónde está?', en: 'Where is?', he: 'איפה זה?' }, { term: 'Izquierda', en: 'Left', he: 'שמאל' }] },
                    { id: 's_u3_2', title: 'Places', content: 'El hotel (The hotel), El aeropuerto (The airport), La estación (The station).', vocab: [{ term: 'Hotel', en: 'Hotel', he: 'מלון' }, { term: 'Aeropuerto', en: 'Airport', he: 'שדה תעופה' }] },
                ]
            },
            {
                id: 'unit4',
                title: 'Family',
                color: 'purple',
                lessons: [
                    { id: 's_u4_1', title: 'Close Family', content: 'Madre (Mother), Padre (Father), Hermano (Brother).', vocab: [{ term: 'Madre', en: 'Mother', he: 'אמא' }, { term: 'Padre', en: 'Father', he: 'אבא' }] },
                    { id: 's_u4_2', title: 'Extended', content: 'Abuelo (Grandfather), Tío (Uncle), Primo (Cousin).', vocab: [{ term: 'Abuelo', en: 'Grandpa', he: 'סבא' }, { term: 'Primo', en: 'Cousin', he: 'בן דוד' }] },
                ]
            },
            {
                id: 'unit5',
                title: 'Activities',
                color: 'orange',
                lessons: [
                    { id: 's_u5_1', title: 'Verbs', content: 'Comer (To eat), Dormir (To sleep), Correr (To run).', vocab: [{ term: 'Comer', en: 'To eat', he: 'לאכול' }, { term: 'Dormir', en: 'To sleep', he: 'לישון' }] },
                    { id: 's_u5_2', title: 'Hobbies', content: 'Leer (To read), Nadar (To swim), Bailar (To dance).', vocab: [{ term: 'Leer', en: 'To read', he: 'לקרוא' }, { term: 'Bailar', en: 'To dance', he: 'לרקוד' }] },
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
                    { id: 'e_u1_1', title: 'Greetings', content: 'Hello, Goodbye, Thank you.', vocab: [{ term: 'Hello', en: 'Hello', he: 'שלום' }, { term: 'Goodbye', en: 'Goodbye', he: 'להתראות' }] },
                    { id: 'e_u1_2', title: 'Verb To Be', content: 'I am, You are, He is.', vocab: [{ term: 'I am', en: 'I am', he: 'אני' }, { term: 'You are', en: 'You are', he: 'אתה' }] },
                ]
            },
            {
                id: 'unit2',
                title: 'Daily Life',
                color: 'pink',
                lessons: [
                    { id: 'e_u2_1', title: 'Morning Routine', content: 'Wake up, Brush teeth, Eat breakfast.', vocab: [{ term: 'Wake up', en: 'Wake up', he: 'להתעורר' }, { term: 'Breakfast', en: 'Breakfast', he: 'ארוחת בוקר' }] },
                    { id: 'e_u2_2', title: 'Work', content: 'Office, Computer, Meeting.', vocab: [{ term: 'Office', en: 'Office', he: 'משרד' }, { term: 'Meeting', en: 'Meeting', he: 'פגישה' }] },
                ]
            },
             {
                id: 'unit3',
                title: 'Shopping',
                color: 'yellow',
                lessons: [
                    { id: 'e_u3_1', title: 'Clothing', content: 'Shirt, Pants, Shoes.', vocab: [{ term: 'Shirt', en: 'Shirt', he: 'חולצה' }, { term: 'Shoes', en: 'Shoes', he: 'נעליים' }] },
                    { id: 'e_u3_2', title: 'Transactions', content: 'How much?, Cash, Credit Card.', vocab: [{ term: 'Cash', en: 'Cash', he: 'מזומן' }, { term: 'How much?', en: 'How much?', he: 'כמה זה?' }] },
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
                    { id: 'a_u1_1', title: 'Greetings', content: 'Marhaban (Hello), Assalamu Alaykum (Peace be upon you), Shukran (Thank you).', vocab: [{ term: 'Marhaban', en: 'Hello', he: 'שלום' }, { term: 'Shukran', en: 'Thank you', he: 'תודה' }] },
                    { id: 'a_u1_2', title: 'Basics', content: 'Naam (Yes), Laa (No), Min Fadlak (Please).', vocab: [{ term: 'Naam', en: 'Yes', he: 'כן' }, { term: 'Laa', en: 'No', he: 'לא' }] },
                ]
            },
            {
                id: 'ar_unit2',
                title: 'Family & Home',
                color: 'amber',
                lessons: [
                    { id: 'a_u2_1', title: 'Family', content: 'Ab (Father), Om (Mother), Akhi (My Brother).', vocab: [{ term: 'Ab', en: 'Father', he: 'אבא' }, { term: 'Om', en: 'Mother', he: 'אמא' }] },
                    { id: 'a_u2_2', title: 'In the House', content: 'Bayt (House), Bab (Door), Kursi (Chair).', vocab: [{ term: 'Bayt', en: 'House', he: 'בית' }, { term: 'Bab', en: 'Door', he: 'דלת' }] },
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
