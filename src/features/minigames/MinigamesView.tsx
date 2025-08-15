/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '../../lib/i18n';
import { spanishLessons } from '../../lib/data';

const FlashcardFrenzy = ({ onGameEnd }) => {
    const { t } = useTranslation();
    const [cards, setCards] = useState([]);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [isFinished, setIsFinished] = useState(false);

    useEffect(() => {
        const allVocab = spanishLessons.beginner.flatMap(l => l.vocab.map(v => {
            // Simple parsing for vocab like 'Word (meaning)'
            const match = v.match(/(.+)\s\((.+)\)/);
            if (match) return { spanish: match[1], english: match[2] };
            return { spanish: v, english: `Translation for ${v}` }; // Fallback
        }));
        
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
    
    if (isFinished) {
        return <div className="text-center"><h2 className="text-2xl font-bold mb-4 dark:text-gray-100">{t('finalScore')}: {score}</h2></div>;
    }
    
    const currentCard = cards[currentCardIndex];
    if(!currentCard) return <p className="dark:text-gray-300">{t('loading')}...</p>;

    return (
        <div className="dark:text-gray-200">
            <div className="flex justify-between font-bold mb-4">
                <span>{t('score')}: {score}</span>
                <span>{t('time')}: {timeLeft}</span>
            </div>
            <div className="bg-white dark:bg-gray-700 p-8 rounded-2xl shadow-inner text-center">
                <p className="text-4xl font-bold text-teal-600 dark:text-teal-400">{currentCard.spanish}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-6">
                {currentCard.options.map(opt => (
                    <button key={opt} onClick={() => handleAnswer(opt)} className="bg-blue-500 text-white p-4 rounded-lg font-semibold hover:bg-blue-600 transition">
                        {opt}
                    </button>
                ))}
            </div>
        </div>
    );
};

const SentenceScramble = ({ onGameEnd }) => {
    const { t } = useTranslation();
    const sentences = useMemo(() => [
        "Me gusta aprender español",
        "El perro corre en el parque",
        "La casa es muy grande",
        "Yo como una manzana roja"
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
    
    if(isFinished) {
        return <div className="text-center"><h2 className="text-2xl font-bold mb-4 dark:text-gray-100">{t('finalScore')}: {score}</h2></div>;
    }

    return (
        <div className="dark:text-gray-200">
            <p className="font-bold text-right mb-4">{t('score')}: {score}</p>
            <p className="text-center mb-4 text-gray-600 dark:text-gray-400">{t('dragAndDrop')}</p>
            <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-inner min-h-[6rem] flex items-center justify-center gap-2 flex-wrap">
                {builtSentence.map((word, i) => (
                    <button key={i} onClick={() => handleWordClick(word, false)} className="bg-blue-200 dark:bg-blue-800 p-2 rounded-lg text-blue-800 dark:text-blue-100">{word}</button>
                ))}
            </div>
            <div className="p-6 my-4 min-h-[6rem] flex items-center justify-center gap-2 flex-wrap">
                {scrambled.map((word, i) => (
                    <button key={i} onClick={() => handleWordClick(word, true)} className="bg-gray-200 dark:bg-gray-600 p-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-100">{word}</button>
                ))}
            </div>
            <button onClick={checkSentence} className="w-full bg-green-500 text-white font-bold py-3 rounded-lg hover:bg-green-600 transition">
                Check
            </button>
        </div>
    );
};


export default function MinigamesView({ onGameComplete }) {
    const { t } = useTranslation();
    const [activeGame, setActiveGame] = useState(null);

    const games = [
        { id: 'flashcard', name: t('flashcardFrenzy'), description: t('flashcardDesc'), component: FlashcardFrenzy },
        { id: 'scramble', name: t('sentenceScramble'), description: t('sentenceDesc'), component: SentenceScramble },
    ];
    
    const handleGameEnd = (score) => {
        if(score > 0) onGameComplete(score);
        // We don't reset immediately, to show the final score. The user can choose to play again.
    };
    
    const startGame = (gameId) => {
        setActiveGame(games.find(g => g.id === gameId));
    };
    
    const renderGame = () => {
        const GameComponent = activeGame.component;
        return (
            <div className="p-4 sm:p-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">{activeGame.name}</h1>
                 <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
                    <GameComponent onGameEnd={handleGameEnd} />
                    <button onClick={() => setActiveGame(null)} className="w-full mt-6 bg-teal-500 text-white font-bold py-3 rounded-lg hover:bg-teal-600 transition">
                        {t('playAgain')}
                    </button>
                </div>
            </div>
        )
    }

    if (activeGame) {
        return renderGame();
    }

    return (
        <div className="p-4 sm:p-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">{t('minigames')}</h1>
            <h2 className="text-xl text-gray-700 dark:text-gray-300 mb-6">{t('selectAGame')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {games.map(game => (
                    <div key={game.id} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
                        <h3 className="text-2xl font-bold text-teal-600 dark:text-teal-400">{game.name}</h3>
                        <p className="text-gray-600 dark:text-gray-300 mt-2 flex-grow">{game.description}</p>
                        <button onClick={() => startGame(game.id)} className="mt-6 w-full bg-blue-500 text-white font-bold py-3 rounded-lg hover:bg-blue-600 transition">
                            {t('start')}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}