
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { useTranslation } from '../lib/i18n';
import type { Lesson } from '../types';
import { generateContent } from '../lib/gemini';
import { Heart, XCircle, CheckCircle, HelpCircle, ArrowRight } from 'lucide-react';
import { SlothMascot } from '../components/SlothMascot';

const FailedLessonView = ({ onBack }) => {
    const { t } = useTranslation();
    return (
        <div className="glass-panel p-8 rounded-3xl shadow-xl text-center max-w-md mx-auto mt-20">
            <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4 drop-shadow-md" />
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Out of Lives!</h2>
            <p className="text-gray-600 dark:text-gray-300 mt-2 mb-6">Don't worry, practice makes perfect. Try again.</p>
            <button onClick={onBack} className="w-full bg-red-500 text-white font-bold py-4 rounded-xl hover:bg-red-600 transition shadow-lg">
                {t('tryAgain')}
            </button>
        </div>
    )
}

export default function LessonPage({ lesson, onComplete, onBack, targetLanguage }: { lesson: Lesson, onComplete: (points: number, lessonId: string) => void, onBack: () => void, targetLanguage: string }) {
    const { t } = useTranslation();
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [lives, setLives] = useState(3);
    const [score, setScore] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [explanation, setExplanation] = useState('');
    const [isExplaining, setIsExplaining] = useState(false);

    useEffect(() => {
        const generateQuiz = async () => {
            setIsLoading(true);
            try {
                const lang = targetLanguage || 'Spanish';
                const prompt = `Create a 5-question multiple-choice quiz for ${lang}. Topic: "${lesson.title}". Content: "${lesson.content}". 
                Return JSON: { quiz: [{ question: string, options: string[], correctAnswer: string }] }`;
                
                const response = await generateContent({
                    model: "gemini-2.5-flash",
                    contents: [{ role: 'user', parts: [{ text: prompt }] }],
                    config: { responseMimeType: "application/json" }
                });
                const result = JSON.parse(response.text);
                setQuestions(result.quiz);
            } catch (e) {
                console.error(e);
                // Fallback
                setQuestions([{ question: `What relates to ${lesson.title}?`, options: ["Wrong", "Incorrect", "Right Answer"], correctAnswer: "Right Answer" }]);
            } finally {
                setIsLoading(false);
            }
        };
        generateQuiz();
    }, [lesson, targetLanguage]);

    const handleAnswerSelect = (option) => {
        if (isAnswered) return;
        setIsAnswered(true);
        setSelectedAnswer(option);

        if (option === questions[currentQuestionIndex].correctAnswer) {
            setScore(score + 10);
        } else {
            setLives(lives - 1);
        }
    };
    
    const handleNextQuestion = () => {
        setExplanation('');
        if (lives === 0) return; 
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setIsAnswered(false);
            setSelectedAnswer(null);
        } else {
            onComplete(score, lesson.id);
        }
    };
    
    const askAiWhy = async () => {
        setIsExplaining(true);
        const q = questions[currentQuestionIndex];
        const prompt = `I answered "${selectedAnswer}" to the question "${q.question}". The correct answer is "${q.correctAnswer}". Explain briefly why I am wrong and the other is right in simple terms.`;
         const response = await generateContent({
            model: "gemini-2.5-flash",
            contents: [{ role: 'user', parts: [{ text: prompt }] }]
        });
        setExplanation(response.text);
        setIsExplaining(false);
    }
    
    if (isLoading) return <div className="flex justify-center items-center h-full"><SlothMascot className="w-24 h-24 animate-pulse" /></div>;
    if (lives <= 0) return <FailedLessonView onBack={onBack} />;
    
    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex) / questions.length) * 100;

    return (
        <div className="p-4 sm:p-8 max-w-2xl mx-auto h-full flex flex-col">
            {/* Top Bar */}
            <div className="flex justify-between items-center mb-6">
                 <button onClick={onBack} className="text-gray-200 hover:text-white font-bold text-xl">✕</button>
                 <div className="flex-grow mx-6 h-4 bg-gray-200/30 rounded-full overflow-hidden backdrop-blur-sm">
                    <div className="bg-green-400 h-full rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                 </div>
                <div className="flex items-center gap-1">
                    <Heart className="text-red-500 fill-red-500" /> <span className="text-white font-bold text-xl">{lives}</span>
                </div>
            </div>
            
            {/* Quiz Card */}
            <div className="glass-panel flex-grow p-6 sm:p-10 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col justify-center">
                <h1 className="text-2xl sm:text-3xl font-bold mb-8 text-center text-gray-800 dark:text-white leading-tight">{currentQuestion.question}</h1>
                
                <div className="grid grid-cols-1 gap-4">
                    {currentQuestion.options.map(option => {
                        let style = 'bg-white dark:bg-gray-700 border-2 border-transparent hover:border-blue-400';
                        if (isAnswered) {
                            if (option === currentQuestion.correctAnswer) style = 'bg-green-100 border-green-500 text-green-800 dark:bg-green-900/50 dark:text-green-100';
                            else if (option === selectedAnswer) style = 'bg-red-100 border-red-500 text-red-800 dark:bg-red-900/50 dark:text-red-100';
                            else style = 'opacity-50';
                        }
                        return (
                            <button key={option} onClick={() => handleAnswerSelect(option)} disabled={isAnswered} className={`p-5 rounded-2xl text-left text-lg font-bold shadow-sm transition-all transform hover:scale-[1.01] ${style} dark:text-white`}>
                                {option}
                            </button>
                        );
                    })}
                </div>

                {/* Feedback Area */}
                {isAnswered && (
                     <div className="mt-6 animate-fade-in-up">
                        <div className={`p-4 rounded-xl mb-4 flex items-start gap-3 ${selectedAnswer === currentQuestion.correctAnswer ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                           {selectedAnswer === currentQuestion.correctAnswer ? <CheckCircle className="flex-shrink-0"/> : <XCircle className="flex-shrink-0"/>}
                           <div>
                               <h3 className="font-bold text-lg">{selectedAnswer === currentQuestion.correctAnswer ? "Correct!" : "Incorrect"}</h3>
                               {selectedAnswer !== currentQuestion.correctAnswer && (
                                   <>
                                       <p className="mt-1">Answer: <strong>{currentQuestion.correctAnswer}</strong></p>
                                       {!explanation && (
                                            <button onClick={askAiWhy} className="mt-2 text-sm font-bold underline flex items-center gap-1 hover:text-red-600">
                                                <HelpCircle size={14}/> Ask Slappy Why?
                                            </button>
                                       )}
                                       {isExplaining && <p className="text-sm mt-2 animate-pulse">Slappy is thinking...</p>}
                                       {explanation && <p className="text-sm mt-2 bg-white/50 p-2 rounded-lg">{explanation}</p>}
                                   </>
                               )}
                           </div>
                        </div>
                        <button onClick={handleNextQuestion} className={`w-full font-bold py-4 rounded-xl shadow-lg text-white text-lg transition-transform hover:scale-105 flex justify-center items-center gap-2 ${selectedAnswer === currentQuestion.correctAnswer ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-800 hover:bg-gray-900'}`}>
                            Continue <ArrowRight/>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
