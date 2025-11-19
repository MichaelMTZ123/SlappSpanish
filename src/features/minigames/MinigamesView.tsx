
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '../../lib/i18n';
import { courses } from '../../lib/data';
import { Clock, RefreshCw, Volume2 } from 'lucide-react';

// Helper to extract clean vocab words from "Word (Translation)" format
const extractVocab = (courseId) => {
    const course = courses[courseId];
    if (!course) return [];
    
    return course.units.flatMap(unit => 
        unit.lessons.flatMap(l => l.vocab.map(v => {
            // Assumes format "Foreign (Native)"
            const match = v.match(/(.+)\s\((.+)\)/);
            if (match) return { target: match[1], native: match[2] };
            return { target: v, native: v }; // Fallback
        }))
    );
};

// --- Flashcard Frenzy ---
const FlashcardFrenzy = ({ onGameEnd, targetLanguage }) => {
    const { t } = useTranslation();
    const [cards, setCards] = useState([]);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [isFinished, setIsFinished] = useState(false);

    useEffect(() => {
        const allVocab = extractVocab(targetLanguage);
        if (allVocab.length < 4) {
             // Fallback mock data if course is empty
             setCards([{target: 'Error', native: 'Not enough vocab', options: ['Not enough vocab']}]);
             return;
        }

        const shuffled = [...allVocab].sort(() => 0.5 - Math.random());
        const gameCards = shuffled.slice(0, 10).map(card => {
            const options = [card.native];
            while (options.length < 4) {
                const randomCard = shuffled[Math.floor(Math.random() * shuffled.length)];
                if (!options.includes(randomCard.native)) {
                    options.push(randomCard.native);
                }
            }
            return { ...card, options: options.sort(() => 0.5 - Math.random()) };
        });
        setCards(gameCards);
    }, [targetLanguage]);

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
        if (option === cards[currentCardIndex].native) {
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
    if(!currentCard) return <p className="dark:text-gray-300">{t('loading')}</p>;

    return (
        <div className="dark:text-gray-200">
            <div className="flex justify-between font-bold mb-4">
                <span className="text-teal-500">{t('score')}: {score}</span>
                <span className="text-red-500 flex items-center gap-1"><Clock size={16}/> {timeLeft}s</span>
            </div>
            <div className="glass-panel bg-white/50 dark:bg-gray-700/50 p-8 rounded-3xl shadow-inner text-center mb-6">
                <p className="text-4xl font-extrabold text-teal-600 dark:text-teal-400 drop-shadow-sm">{currentCard.target}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
                {currentCard.options.map(opt => (
                    <button key={opt} onClick={() => handleAnswer(opt)} className="bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-600 p-4 rounded-xl font-semibold hover:bg-teal-500 hover:text-white hover:border-teal-500 transition-all shadow-sm text-gray-900 dark:text-white">
                        {opt}
                    </button>
                ))}
            </div>
        </div>
    );
};

// --- Sentence Scramble ---
const SentenceScramble = ({ onGameEnd, targetLanguage }) => {
    const { t } = useTranslation();
    
    // Basic sentences for different languages
    const sentencesMap = {
        spanish: ["Me gusta aprender español", "El perro corre en el parque", "La casa es muy grande", "Yo como una manzana roja"],
        english: ["I like learning English", "The dog runs in the park", "The house is very big", "I eat a red apple"],
        arabic: ["أنا أحب تعلم اللغة العربية", "الكلب يركض في الحديقة", "البيت كبير جدا", "أنا آكل تفاحة حمراء"]
    };

    const sentences = useMemo(() => sentencesMap[targetLanguage] || sentencesMap.spanish, [targetLanguage]);
    
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
            <button onClick={checkSentence} className="w-full bg-teal-500 text-white font-bold py-3 rounded-xl hover:bg-teal-600 transition shadow-lg">{t('check')}</button>
        </div>
    );
};

// --- Memory Match ---
const MemoryMatch = ({ onGameEnd, targetLanguage }) => {
    const { t } = useTranslation();
    const [cards, setCards] = useState([]);
    const [flipped, setFlipped] = useState([]);
    const [matched, setMatched] = useState([]);
    const [score, setScore] = useState(0);

    useEffect(() => {
        // Get 6 random words
        const allVocab = extractVocab(targetLanguage);
        const shuffled = allVocab.sort(() => 0.5 - Math.random()).slice(0, 6);
        
        const deck = [];
        shuffled.forEach((wordObj, index) => {
            // Card 1: Target Language
            deck.push({ id: index, content: wordObj.target, type: 'target' });
            // Card 2: Native Language
            deck.push({ id: index, content: wordObj.native, type: 'native' });
        });

        const finalDeck = deck.sort(() => Math.random() - 0.5).map((c, i) => ({ ...c, uniqueId: i }));
        setCards(finalDeck);
    }, [targetLanguage]);

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
        if (matched.length === 6 && matched.length > 0) {
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
                            <span className="font-bold text-gray-800 dark:text-white text-sm sm:text-lg p-1 text-center break-words leading-tight">{card.content}</span>
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
const SpeedListen = ({ onGameEnd, targetLanguage }) => {
    const { t } = useTranslation();
    const [round, setRound] = useState(0);
    const [score, setScore] = useState(0);
    const [options, setOptions] = useState([]);
    const [targetWord, setTargetWord] = useState(null);
    const [status, setStatus] = useState('playing'); // playing, correct, wrong

    const allVocab = useMemo(() => extractVocab(targetLanguage), [targetLanguage]);

    const startRound = () => {
        if (round >= 5) {
            onGameEnd(score);
            return;
        }
        if (allVocab.length < 4) return;

        const target = allVocab[Math.floor(Math.random() * allVocab.length)];
        setTargetWord(target);
        
        // Generate distractors
        let opts = [target];
        while(opts.length < 4) {
            const r = allVocab[Math.floor(Math.random() * allVocab.length)];
            if(!opts.find(o => o.target === r.target)) opts.push(r);
        }
        setOptions(opts.sort(() => Math.random() - 0.5));
        setStatus('playing');
        
        // Play audio
        setTimeout(() => playAudio(target.target), 500);
    };

    useEffect(() => { startRound(); }, [round, allVocab]);

    const playAudio = (text) => {
        const u = new SpeechSynthesisUtterance(text);
        if (targetLanguage === 'spanish') u.lang = 'es-ES';
        if (targetLanguage === 'english') u.lang = 'en-US';
        if (targetLanguage === 'arabic') u.lang = 'ar-SA';
        window.speechSynthesis.speak(u);
    };

    const handleOptionClick = (word) => {
        if(status !== 'playing') return;
        if (word.target === targetWord.target) {
            setScore(s => s + 15);
            setStatus('correct');
            setTimeout(() => setRound(r => r + 1), 1000);
        } else {
            setStatus('wrong');
            setTimeout(() => setRound(r => r + 1), 1000);
        }
    };

    if (round >= 5) return <div>{t('finished')}</div>;
    if (!targetWord) return <div>Loading...</div>;

    return (
        <div className="text-center">
             <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{t('score')}: {score}</h2>
             <button onClick={() => playAudio(targetWord.target)} className="bg-indigo-500 hover:bg-indigo-600 text-white p-8 rounded-full shadow-lg mb-8 animate-pulse">
                <Volume2 size={48} />
             </button>
             <p className="mb-4 text-gray-800 dark:text-white font-medium">{t('listenAndSelect')}</p>
             <div className="grid grid-cols-2 gap-4">
                 {options.map((opt, i) => (
                     <button key={i} onClick={() => handleOptionClick(opt)} className={`p-4 rounded-xl font-bold text-lg transition-all ${status === 'playing' ? 'bg-white text-gray-800 hover:bg-gray-100' : status === 'correct' && opt.target === targetWord.target ? 'bg-green-500 text-white' : 'bg-red-400 text-white opacity-50'}`}>
                         {opt.native}
                     </button>
                 ))}
             </div>
        </div>
    )
}


export default function MinigamesView({ onGameComplete }) {
    const { t } = useTranslation();
    const [activeGame, setActiveGame] = useState(null);
    const [targetLanguage, setTargetLanguage] = useState('spanish');

    // useMemo to ensure translations are reactive
    const games = useMemo(() => [
        { id: 'flashcard', name: t('flashcardFrenzy'), description: t('flashcardDesc'), component: FlashcardFrenzy, color: 'bg-teal-500' },
        { id: 'scramble', name: t('sentenceScramble'), description: t('sentenceDesc'), component: SentenceScramble, color: 'bg-indigo-500' },
        { id: 'memory', name: t('memoryMatch'), description: t('memoryDesc'), component: MemoryMatch, color: 'bg-pink-500' },
        { id: 'speed', name: t('speedListen'), description: t('speedListenDesc'), component: SpeedListen, color: 'bg-orange-500' },
    ], [t]);
    
    const handleGameEnd = (score) => {
        if(score > 0) onGameComplete(score);
    };
    
    const renderGame = () => {
        const GameComponent = activeGame.component;
        return (
            <div className="p-4 sm:p-8 max-w-3xl mx-auto">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white drop-shadow-md mb-6">{activeGame.name}</h1>
                <div className="mb-4 text-center text-gray-500 font-bold uppercase">{targetLanguage}</div>
                 <div className="glass-panel p-8 rounded-3xl shadow-2xl">
                    <GameComponent onGameEnd={handleGameEnd} targetLanguage={targetLanguage} />
                    <button onClick={() => setActiveGame(null)} className="w-full mt-8 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-bold py-3 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition">
                        {t('quitGame')}
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
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white drop-shadow-md mb-2">{t('minigames')}</h1>
            
            {/* Language Selector */}
            <div className="mb-8 flex flex-col items-start">
                <label className="font-bold text-gray-700 dark:text-gray-300 mb-2">{t('selectGameLanguage')}</label>
                <div className="flex gap-2">
                    {['spanish', 'english', 'arabic'].map(lang => (
                        <button 
                            key={lang} 
                            onClick={() => setTargetLanguage(lang)}
                            className={`px-4 py-2 rounded-xl font-bold border-2 transition capitalize ${targetLanguage === lang ? 'bg-teal-500 border-teal-500 text-white' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400'}`}
                        >
                            {lang}
                        </button>
                    ))}
                </div>
            </div>

            <p className="text-gray-700 dark:text-gray-200 text-lg mb-8 font-bold">{t('selectAGame')}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {games.map((game, index) => (
                    <div key={game.id} id={index === 0 ? "minigame-card-0" : undefined} className="glass-panel p-8 rounded-3xl shadow-xl flex flex-col relative overflow-hidden group cursor-pointer transition-transform hover:scale-[1.02]" onClick={() => setActiveGame(game)}>
                        <div className={`absolute top-0 right-0 w-32 h-32 ${game.color} opacity-20 rounded-bl-full z-0 transition-transform group-hover:scale-110`}></div>
                         <h3 className="text-2xl font-bold text-gray-900 dark:text-white z-10">{game.name}</h3>
                        <p className="text-gray-700 dark:text-gray-300 mt-2 flex-grow z-10 font-medium">{game.description}</p>
                        <button className={`mt-6 w-full ${game.color} text-white font-bold py-3 rounded-xl shadow-lg hover:opacity-90 transition z-10`}>
                            {t('start')}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
