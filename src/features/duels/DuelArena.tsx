
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { doc, onSnapshot, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db, appId } from '../../lib/firebase';
import { useTranslation } from '../../lib/i18n';
import type { UserProfile } from '../../types';
import { SlothMascot } from '../../components/SlothMascot';
import { generateContent } from '../../lib/gemini';

interface DuelArenaProps {
    duelId: string;
    currentUser: UserProfile;
    onExit: () => void;
}

export default function DuelArena({ duelId, currentUser, onExit }: DuelArenaProps) {
    const { t, language } = useTranslation();
    const [duelData, setDuelData] = useState<any>(null);
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [waitingForOpponent, setWaitingForOpponent] = useState(true);
    const [gameStatus, setGameStatus] = useState<'waiting' | 'playing' | 'finished'>('waiting');
    const [resultMessage, setResultMessage] = useState('');

    const isPlayer1 = duelData?.player1Id === currentUser.uid;
    const myScoreKey = isPlayer1 ? 'player1Score' : 'player2Score';
    const opponentScoreKey = isPlayer1 ? 'player2Score' : 'player1Score';
    const myProgressKey = isPlayer1 ? 'player1Progress' : 'player2Progress';
    const opponentProgressKey = isPlayer1 ? 'player2Progress' : 'player1Progress';

    useEffect(() => {
        const duelRef = doc(db, `artifacts/${appId}/duels`, duelId);
        const unsub = onSnapshot(duelRef, async (snap) => {
            if (snap.exists()) {
                const data = snap.data();
                setDuelData(data);
                
                // Check if both players are ready/joined
                if (data.status === 'active' && gameStatus === 'waiting') {
                    // Generate questions if not present (Player 1 does this usually, or server function)
                    if (!data.questions && isPlayer1) {
                         // Generate questions
                         const prompt = `Create 5 simple Spanish multiple choice questions for a duel. 
                         JSON format: [{ question: string, options: string[], correctAnswer: string }]
                         Target Language of user: ${language === 'he' ? 'Hebrew' : 'English'}. Use this language for the question text.`;
                         try {
                             const res = await generateContent({
                                 model: 'gemini-2.5-flash',
                                 contents: [{ role: 'user', parts: [{ text: prompt }] }],
                                 config: { responseMimeType: 'application/json' }
                             });
                             const qs = JSON.parse(res.text);
                             await updateDoc(duelRef, { questions: qs });
                         } catch(e) { console.error(e); }
                    }
                }
                
                if (data.questions && data.questions.length > 0) {
                    setQuestions(data.questions);
                    setWaitingForOpponent(false);
                    if(gameStatus === 'waiting') setGameStatus('playing');
                }

                // Check for finish
                if (data[myProgressKey] >= 5 && data[opponentProgressKey] >= 5) {
                     setGameStatus('finished');
                     const myScore = data[myScoreKey];
                     const oppScore = data[opponentScoreKey];
                     if (myScore > oppScore) setResultMessage(t('youWon'));
                     else if (myScore < oppScore) setResultMessage(t('youLost'));
                     else setResultMessage(t('draw'));
                }
            }
        });
        return unsub;
    }, [duelId, gameStatus, isPlayer1, language, myProgressKey, opponentProgressKey, myScoreKey, opponentScoreKey, t]);

    const handleAnswer = async (option: string) => {
        const currentQ = questions[currentQIndex];
        const isCorrect = option === currentQ.correctAnswer;
        const points = isCorrect ? 10 : 0;

        const duelRef = doc(db, `artifacts/${appId}/duels`, duelId);
        
        await updateDoc(duelRef, {
            [myScoreKey]: increment(points),
            [myProgressKey]: increment(1)
        });

        if (currentQIndex < questions.length - 1) {
            setCurrentQIndex(prev => prev + 1);
        } else {
            // Finished my part
        }
    };
    
    if (gameStatus === 'finished') {
        return (
             <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-fade-in-up">
                <SlothMascot className="w-40 h-40 mb-6" outfit="crown" />
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">{resultMessage}</h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">{t('finalScore')}: {duelData?.[myScoreKey]} - {duelData?.[opponentScoreKey]}</p>
                <button onClick={onExit} className="bg-teal-500 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg hover:bg-teal-600 transition">{t('back')}</button>
             </div>
        )
    }

    if (waitingForOpponent || questions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8">
                <SlothMascot className="w-32 h-32 animate-pulse mb-6" />
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{t('waitingForOpponent')}</h2>
            </div>
        );
    }

    const currentQ = questions[currentQIndex];
    // Wait if I finished but opponent hasn't
    if (!currentQ) {
         return (
            <div className="flex flex-col items-center justify-center h-full p-8">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Finished! Waiting for opponent...</h2>
                 <div className="w-full max-w-md bg-gray-200 rounded-full h-4 dark:bg-gray-700">
                    <div className="bg-blue-600 h-4 rounded-full transition-all duration-500" style={{ width: `${(duelData?.[opponentProgressKey] / 5) * 100}%` }}></div>
                </div>
                <p className="mt-2 dark:text-gray-300">{t('opponentProgress')}</p>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-8 max-w-3xl mx-auto h-full flex flex-col">
            {/* Header VS */}
            <div className="flex justify-between items-center mb-8 glass-panel p-4 rounded-xl">
                <div className="text-center">
                    <p className="font-bold text-teal-600">{currentUser.name}</p>
                    <p className="text-2xl font-black">{duelData?.[myScoreKey] || 0}</p>
                </div>
                <div className="text-xl font-black text-gray-400 italic">{t('vs')}</div>
                <div className="text-center">
                     <p className="font-bold text-red-500">{isPlayer1 ? duelData?.player2Name : duelData?.player1Name}</p>
                     <p className="text-2xl font-black">{duelData?.[opponentScoreKey] || 0}</p>
                </div>
            </div>
            
            {/* Opponent Progress Bar (Small) */}
            <div className="mb-6">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{t('you')}</span>
                    <span>{t('opponentProgress')}</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden flex">
                     <div className="h-full bg-teal-500 transition-all" style={{ width: `${((currentQIndex) / 5) * 100}%` }}></div>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mt-1">
                     <div className="h-full bg-red-500 transition-all duration-500" style={{ width: `${(duelData?.[opponentProgressKey] / 5) * 100}%` }}></div>
                </div>
            </div>

            {/* Question */}
            <div className="glass-panel p-8 rounded-3xl shadow-xl flex-grow flex flex-col justify-center animate-fade-in-up">
                 <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white" dir="auto">{currentQ.question}</h2>
                 <div className="grid grid-cols-1 gap-4">
                     {currentQ.options.map(opt => (
                         <button key={opt} onClick={() => handleAnswer(opt)} className="bg-white/80 dark:bg-gray-700/80 p-4 rounded-xl text-lg font-bold shadow-sm hover:bg-teal-100 dark:hover:bg-teal-900 transition text-left text-gray-900 dark:text-white">
                             {opt}
                         </button>
                     ))}
                 </div>
            </div>
        </div>
    );
}
