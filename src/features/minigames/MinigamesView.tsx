
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '../../lib/i18n';
import { courses } from '../../lib/data';
import { Clock, RefreshCw, Volume2 } from 'lucide-react';

// --- Flashcard Frenzy ---
const FlashcardFrenzy = ({ onGameEnd }) => {
    const { t } = useTranslation();
    const [cards, setCards] = useState([]);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [isFinished, setIsFinished] = useState(false);

    useEffect(() => {
        const allVocab = courses.spanish.units.flatMap(unit => 
            unit.lessons.flatMap(l => l.vocab.map(v => {
                const match = v.match(/(.+)\s\((.+)\)/);
                if (match) return { spanish: match[1], english: match[2] };
                return { spanish: v, english: `Translation for ${v}` };
            }))
        );
        
        const shuffled = [...allVocab].sort(() => 0.5 - Math.random());
        const gameCards = shuffled.slice(0, 10).map(card => {
            const options = [card.english];
            while (options.length < 4) {
                const randomCard = shuffled[Math.floor(Math.random() * shuffled.length)];
                if (!options.includes(randomCard.english)) {
                    options.push(randomCard.english);
                }
            }
            return { ...card, options: options.sort(() => 0.5 - Math.random()) };
        });
        setCards(gameCards);
    }, []);

    useEffect(() => {
        if (timeLeft > 0 && !isFinished) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0 && !isFinished) {
            setIsFinished(true);
            onGameEnd(score);
        }
    }, [timeLeft, isFinished, score, onGameEnd]);

    const handleAnswer = (option) => {
        if (isFinished) return;
        if (option === cards[currentCardIndex].english) {
            setScore(score + 10);
        }
        if (currentCardIndex < cards.length - 1) {
            setCurrentCardIndex(currentCardIndex + 1);
        } else {
            setIsFinished(true);
            onGameEnd(score);
        }
    };
    
    if (isFinished) return <div className="text-center"><h2 className="text-2xl font-bold mb-4 dark:text-gray-100">{t('finalScore')}: {score}</h2></div>;
    
    const currentCard = cards[currentCardIndex];
    if(!currentCard) return <p className="dark:text-gray-300">{t('loading')}...</p>;

    return (
        <div className="dark:text-gray-200">
            <div className="flex justify-between font-bold mb-4">
                <span className="text-teal-500">{t('score')}: {score}</span>
                <span className="text-red-500 flex items-center gap-1"><Clock size={16}/> {timeLeft}s</span>
            </div>
            <div className="glass-panel bg-white/50 dark:bg-gray-700/50 p-8 rounded-3xl shadow-inner text-center mb-6">
                <p className="text-4xl font-extrabold text-teal-600 dark:text-teal-400 drop-shadow-sm">{currentCard.spanish}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
                {currentCard.options.map(opt => (
                    <button key={opt} onClick={() => handleAnswer(opt)} className="bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-600 p-4 rounded-xl font-semibold hover:bg-teal-500 hover:text-white hover:border-teal-500 transition-all shadow-sm">
                        {opt}
                    </button>
                ))}
            </div>
        </div>
    );
};

// --- Sentence Scramble ---
const SentenceScramble = ({ onGameEnd }) => {
    const { t } = useTranslation();
    const sentences = useMemo(() => [
        "Me gusta aprender español", "El perro corre en el parque", "La casa es muy grande", "Yo como una manzana roja"
    ], []);
    
    const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
    const [scrambled, setScrambled] = useState([]);
    const [builtSentence, setBuiltSentence] = useState([]);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    useEffect(() => {
        if (currentSentenceIndex < sentences.length) {
            const words = sentences[currentSentenceIndex].split(' ');
            setScrambled(words.sort(() => Math.random() - 0.5));
            setBuiltSentence([]);
        } else {
            setIsFinished(true);
            onGameEnd(score);
        }
    }, [currentSentenceIndex, sentences, score, onGameEnd]);

    const handleWordClick = (word, fromScrambled) => {
        if (fromScrambled) {
            setBuiltSentence([...builtSentence, word]);
            setScrambled(scrambled.filter(w => w !== word));
        } else {
            setScrambled([...scrambled, word]);
            setBuiltSentence(builtSentence.filter(w => w !== word));
        }
    };

    const checkSentence = () => {
        if (builtSentence.join(' ') === sentences[currentSentenceIndex]) {
            setScore(score + 25);
        }
        setCurrentSentenceIndex(currentSentenceIndex + 1);
    };
    
    if(isFinished) return <div className="text-center"><h2 className="text-2xl font-bold mb-4 dark:text-gray-100">{t('finalScore')}: {score}</h2></div>;

    return (
        <div className="dark:text-gray-200">
            <p className="font-bold text-right mb-4">{t('score')}: {score}</p>
            <div className="glass-panel bg-white/50 dark:bg-gray-700/50 p-6 rounded-2xl shadow-inner min-h-[8rem] flex items-center justify-center gap-2 flex-wrap border-2 border-dashed border-gray-300 dark:border-gray-600">
                {builtSentence.length === 0 && <p className="text-gray-400">{t('dragAndDrop')}</p>}
                {builtSentence.map((word, i) => (
                    <button key={i} onClick={() => handleWordClick(word, false)} className="bg-teal-100 text-teal-800 border border-teal-300 px-4 py-2 rounded-lg font-bold shadow-sm">{word}</button>
                ))}
            </div>
            <div className="p-6 my-4 flex items-center justify-center gap-3 flex-wrap">
                {scrambled.map((word, i) => (
                    <button key={i} onClick={() => handleWordClick(word, true)} className="bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg font-medium shadow-md hover:scale-105 transition">{word}</button>
                ))}
            </div>
            <button onClick={checkSentence} className="w-full bg-teal-500 text-white font-bold py-3 rounded-xl hover:bg-teal-600 transition shadow-lg">Check</button>
        </div>
    );
};

// --- Memory Match ---
const MemoryMatch = ({ onGameEnd }) => {
    const { t } = useTranslation();
    const [cards, setCards] = useState([]);
    const [flipped, setFlipped] = useState([]);
    const [matched, setMatched] = useState([]);
    const [score, setScore] = useState(0);

    useEffect(() => {
        const pairs = [
            { id: 1, text: 'Gato', pair: 'Cat' },
            { id: 2, text: 'Perro', pair: 'Dog' },
            { id: 3, text: 'Casa', pair: 'House' },
            { id: 4, text: 'Agua', pair: 'Water' },
            { id: 5, text: 'Hola', pair: 'Hello' },
            { id: 6, text: 'Adiós', pair: 'Bye' },
        ];
        const deck = [...pairs.map(p => ({ id: p.id, content: p.text, type: 'es' })), ...pairs.map(p => ({ id: p.id, content: p.pair, type: 'en' }))]
            .sort(() => Math.random() - 0.5)
            .map((c, i) => ({ ...c, uniqueId: i }));
        setCards(deck);
    }, []);

    useEffect(() => {
        if (flipped.length === 2) {
            const [first, second] = flipped;
            if (cards[first].id === cards[second].id) {
                setMatched([...matched, cards[first].id]);
                setScore(s => s + 10);
                setFlipped([]);
            } else {
                setTimeout(() => setFlipped([]), 1000);
            }
        }
    }, [flipped, cards, matched]);

    useEffect(() => {
        if (matched.length === 6) {
            setTimeout(() => onGameEnd(score + 20), 1000); // Bonus for finishing
        }
    }, [matched, score, onGameEnd]);

    const handleCardClick = (index) => {
        if (flipped.length < 2 && !flipped.includes(index) && !matched.includes(cards[index].id)) {
            setFlipped([...flipped, index]);
        }
    };

    return (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {cards.map((card, index) => {
                const isFlipped = flipped.includes(index) || matched.includes(card.id);
                return (
                    <div key={card.uniqueId} onClick={() => handleCardClick(index)} className={`aspect-square rounded-xl flex items-center justify-center cursor-pointer transition-all duration-500 transform ${isFlipped ? 'bg-white dark:bg-gray-700 rotate-y-180' : 'bg-teal-500'}`}>
                        {isFlipped ? (
                            <span className="font-bold text-gray-800 dark:text-white text-sm sm:text-lg">{card.content}</span>
                        ) : (
                            <span className="text-white text-2xl">?</span>
                        )}
                    </div>
                )
            })}
        </div>
    )
}

// --- Speed Listen ---
const SpeedListen = ({ onGameEnd }) => {
    const { t } = useTranslation();
    const [round, setRound] = useState(0);
    const [score, setScore] = useState(0);
    const [options, setOptions] = useState([]);
    const [targetWord, setTargetWord] = useState(null);
    const [status, setStatus] = useState('playing'); // playing, correct, wrong

    const vocab = useMemo(() => [
        { es: 'Manzana', en: 'Apple' }, { es: 'Coche', en: 'Car' }, { es: 'Libro', en: 'Book' },
        { es: 'Sol', en: 'Sun' }, { es: 'Luna', en: 'Moon' }, { es: 'Árbol', en: 'Tree' },
        { es: 'Flor', en: 'Flower' }, { es: 'Playa', en: 'Beach' }
    ], []);

    const startRound = () => {
        if (round >= 5) {
            onGameEnd(score);
            return;
        }
        const target = vocab[Math.floor(Math.random() * vocab.length)];
        setTargetWord(target);
        
        // Generate distractors
        let opts = [target];
        while(opts.length < 4) {
            const r = vocab[Math.floor(Math.random() * vocab.length)];
            if(!opts.find(o => o.es === r.es)) opts.push(r);
        }
        setOptions(opts.sort(() => Math.random() - 0.5));
        setStatus('playing');
        
        // Play audio
        setTimeout(() => playAudio(target.es), 500);
    };

    useEffect(() => { startRound(); }, [round]);

    const playAudio = (text) => {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'es-ES';
        window.speechSynthesis.speak(u);
    };

    const handleOptionClick = (word) => {
        if(status !== 'playing') return;
        if (word.es === targetWord.es) {
            setScore(s => s + 15);
            setStatus('correct');
            setTimeout(() => setRound(r => r + 1), 1000);
        } else {
            setStatus('wrong');
            setTimeout(() => setRound(r => r + 1), 1000);
        }
    };

    if (round >= 5) return <div>Finished</div>;

    return (
        <div className="text-center">
             <h2 className="text-xl font-bold mb-4 text-white">{t('score')}: {score}</h2>
             <button onClick={() => playAudio(targetWord.es)} className="bg-indigo-500 hover:bg-indigo-600 text-white p-8 rounded-full shadow-lg mb-8 animate-pulse">
                <Volume2 size={48} />
             </button>
             <p className="mb-4 text-white font-medium">Listen and select the correct meaning:</p>
             <div className="grid grid-cols-2 gap-4">
                 {options.map((opt, i) => (
                     <button key={i} onClick={() => handleOptionClick(opt)} className={`p-4 rounded-xl font-bold text-lg transition-all ${status === 'playing' ? 'bg-white text-gray-800 hover:bg-gray-100' : status === 'correct' && opt.es === targetWord.es ? 'bg-green-500 text-white' : 'bg-red-400 text-white opacity-50'}`}>
                         {opt.en}
                     </button>
                 ))}
             </div>
        </div>
    )
}


export default function MinigamesView({ onGameComplete }) {
    const { t } = useTranslation();
    const [activeGame, setActiveGame] = useState(null);

    const games = [
        { id: 'flashcard', name: t('flashcardFrenzy'), description: t('flashcardDesc'), component: FlashcardFrenzy, color: 'bg-teal-500' },
        { id: 'scramble', name: t('sentenceScramble'), description: t('sentenceDesc'), component: SentenceScramble, color: 'bg-indigo-500' },
        { id: 'memory', name: t('memoryMatch'), description: t('memoryDesc'), component: MemoryMatch, color: 'bg-pink-500' },
        { id: 'speed', name: t('speedListen'), description: t('speedListenDesc'), component: SpeedListen, color: 'bg-orange-500' },
    ];
    
    const handleGameEnd = (score) => {
        if(score > 0) onGameComplete(score);
    };
    
    const renderGame = () => {
        const GameComponent = activeGame.component;
        return (
            <div className="p-4 sm:p-8 max-w-3xl mx-auto">
                <h1 className="text-3xl sm:text-4xl font-bold text-white drop-shadow-md mb-6">{activeGame.name}</h1>
                 <div className="glass-panel p-8 rounded-3xl shadow-2xl">
                    <GameComponent onGameEnd={handleGameEnd} />
                    <button onClick={() => setActiveGame(null)} className="w-full mt-8 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-bold py-3 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition">
                        Quit Game
                    </button>
                </div>
            </div>
        )
    }

    if (activeGame) {
        return renderGame();
    }

    return (
        <div className="p-4 sm:p-8 max-w-5xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white drop-shadow-md mb-2">{t('minigames')}</h1>
            <p className="text-white/80 text-lg mb-8">{t('selectAGame')}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {games.map(game => (
                    <div key={game.id} className="glass-panel p-8 rounded-3xl shadow-xl flex flex-col relative overflow-hidden group cursor-pointer transition-transform hover:scale-[1.02]" onClick={() => setActiveGame(game)}>
                        <div className={`absolute top-0 right-0 w-32 h-32 ${game.color} opacity-20 rounded-bl-full z-0 transition-transform group-hover:scale-110`}></div>
                         <h3 className="text-2xl font-bold text-gray-800 dark:text-white z-10">{game.name}</h3>
                        <p className="text-gray-600 dark:text-gray-300 mt-2 flex-grow z-10 font-medium">{game.description}</p>
                        <button className={`mt-6 w-full ${game.color} text-white font-bold py-3 rounded-xl shadow-lg hover:opacity-90 transition z-10`}>
                            {t('start')}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
