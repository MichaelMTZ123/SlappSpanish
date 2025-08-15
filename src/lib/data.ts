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
    if (currentRankIndex < -1) { // case where user has 0 points
         return ranks.find(r => r.points > 0);
    }
    if (currentRankIndex + 1 >= ranks.length) {
        return null; // User is at the highest rank
    }
    return ranks[currentRankIndex + 1];
}


export const spanishLessons = {
    beginner: [
        { id: 'b1', title: 'Greetings & Basics', content: 'Learn essential greetings like Hola, Adiós, Gracias.', vocab: ['Hola', 'Adiós', 'Gracias', 'Por favor', 'Sí', 'No'], quiz: [{ q: "How do you say 'Hello'?", q_he: "איך אומרים 'שלום'?", o: ["Adiós", "Hola", "Gracias"], a: "Hola" }] },
        { id: 'b2', title: 'Numbers 1-10', content: 'Master the numbers from one to ten.', vocab: ['Uno', 'Dos', 'Tres', 'Cuatro', 'Cinco', 'Seis', 'Siete', 'Ocho', 'Nueve', 'Diez'], quiz: [{ q: "What is 'Three' in Spanish?", q_he: "מה זה 'שלוש' בספרדית?", o: ["Tres", "Dos", "Uno"], a: "Tres" }] },
        { id: 'b3', title: 'Common Nouns', content: 'Learn words for common objects.', vocab: ['El libro', 'La mesa', 'La casa', 'El perro', 'El gato'], quiz: [{ q: "What does 'La casa' mean?", q_he: "מה הפירוש של 'La casa'?", o: ["The book", "The cat", "The house"], a: "The house" }] },
        { id: 'b4', title: 'Family Members', content: 'Learn to talk about your family.', vocab: ['Madre', 'Padre', 'Hijo', 'Hija', 'Hermano', 'Hermana'], quiz: [{ q: "What is 'Padre'?", q_he: "מה זה 'Padre'?", o: ["Mother", "Father", "Brother"], a: "Father" }] },
    ],
    intermediate: [
        { id: 'i1', title: 'Ser vs. Estar', content: 'Understand the two verbs for "to be".', vocab: ['Yo soy', 'Tú eres', 'Él/Ella es', 'Yo estoy', 'Tú estás', 'Él/Ella está'], quiz: [{ q: "Which verb is used for permanent characteristics?", q_he: "באיזה פועל משתמשים למאפיינים קבועים?", o: ["Estar", "Ser"], a: "Ser" }] },
        { id: 'i2', title: 'Present Tense Verbs', content: 'Learn to conjugate regular -ar, -er, and -ir verbs.', vocab: ['Hablar (to speak)', 'Comer (to eat)', 'Vivir (to live)'], quiz: [{ q: "How do you say 'I speak'?", q_he: "איך אומרים 'אני מדבר'?", o: ["Yo hablo", "Yo hablas", "Yo habla"], a: "Yo hablo" }] },
        { id: 'i3', title: 'Past Tense (Preterite)', content: 'Learn the basic past tense for completed actions.', vocab: ['Hablé', 'Comí', 'Viví'], quiz: [{ q: "How do you say 'I ate'?", q_he: "איך אומרים 'אני אכלתי'?", o: ["Yo como", "Yo comí", "Yo comeré"], a: "Yo comí" }] },
        { id: 'i4', title: 'Por vs. Para', content: 'Understand the difference between por and para.', vocab: ['Gracias por la ayuda', 'El regalo es para ti'], quiz: [{ q: "Which is used for a destination?", q_he: "באיזו מילה משתמשים לציון יעד?", o: ["Por", "Para"], a: "Para" }] },
    ],
    advanced: [
        { id: 'a1', title: 'Subjunctive Mood', content: 'Master the subjunctive for expressing desires, doubts, and more.', vocab: ['Quiero que vengas', 'Espero que estés bien'], quiz: [{ q: "Which mood expresses doubt?", q_he: "איזה 'מוד' מבטא ספק?", o: ["Indicative", "Subjunctive", "Imperative"], a: "Subjunctive" }] },
        { id: 'a2', title: 'Conditional Tense', content: 'Learn to talk about what would happen.', vocab: ['Me gustaría', 'Iría', 'Comería'], quiz: [{ q: "How to say 'I would like'?", q_he: "איך אומרים 'הייתי רוצה'?", o: ["Me gusta", "Me gustaría", "Me gustará"], a: "Me gustaría" }] },
        { id: 'a3', title: 'Future Tense', content: 'Talk about what will happen.', vocab: ['Hablaré', 'Comeré', 'Viviré'], quiz: [{ q: "How do you say 'I will live'?", q_he: "איך אומרים 'אני אחיה'?", o: ["Yo vivo", "Yo viví", "Yo viviré"], a: "Yo viviré" }] },
    ]
};
export const allLessons = [...spanishLessons.beginner, ...spanishLessons.intermediate, ...spanishLessons.advanced];