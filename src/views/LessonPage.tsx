
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { useTranslation } from '../lib/i18n';
import type { Lesson } from '../types';
import { generateContent } from '../lib/gemini';
import { Heart, XCircle, CheckCircle } from 'lucide-react';

const FailedLessonView = ({ onBack }) => {
    const { t } = useTranslation();
    return (
        <div className="text-center bg-red-50 dark:bg-red-900/20 p-8 rounded-2xl shadow-lg">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-700 dark:text-red-300">Out of Lives!</h2>
            <p className="text-red-600 dark:text-red-400 mt-2 mb-6">Don't worry, practice makes perfect. Try the lesson again to master the concepts.</p>
            <button onClick={onBack} className="w-full bg-red-500 text-white font-bold py-3 rounded-lg hover:bg-red-600 transition">
                {t('tryAgain')}
            </button>
        </div>
    )
}

export default function LessonPage({ lesson, onComplete, onBack, targetLanguage }: { lesson: Lesson, onComplete: (points: number, lessonId: string) => void, onBack: () => void, targetLanguage: string }) {
    const { t, language } = useTranslation();
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [lives, setLives] = useState(3);
    const [score, setScore] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const generateQuiz = async () => {
            setIsLoading(true);
            setError('');
            try {
                const lang = targetLanguage || 'Spanish';
                const prompt = `Create a 7-question multiple-choice quiz to teach ${lang}. The specific topic is "${lesson.title}" and content: "${lesson.content}". 
                For each question, provide a scenario or translation task.
                Ensure the 'correctAnswer' is correct.
                Provide 3 incorrect options.
                Return JSON.`;
                
                const response = await generateContent({
                    model: "gemini-2.5-flash",
                    contents: [{ role: 'user', parts: [{ text: prompt }] }],
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: 'OBJECT',
                            properties: {
                                quiz: {
                                    type: 'ARRAY',
                                    items: {
                                        type: 'OBJECT',
                                        properties: {
                                            question: { type: 'STRING' },
                                            options: { type: 'ARRAY', items: { type: 'STRING' } },
                                            correctAnswer: { type: 'STRING' }
                                        },
                                        required: ["question", "options", "correctAnswer"]
                                    }
                                }
                            }
                        }
                    }
                });
                const result = JSON.parse(response.text);
                setQuestions(result.quiz);
            } catch (e) {
                console.error("Failed to generate quiz", e);
                setError("Failed to create the lesson quiz. Please try again later.");
                // Minimal Fallback
                const fallback = [
                    { question: "Select the correct matching word for the lesson topic.", options: ["Wrong", "Incorrect", "Right Answer"], correctAnswer: "Right Answer" }
                ];
                setQuestions(fallback);
            } finally {
                setIsLoading(false);
            }
        };

        generateQuiz();
    }, [lesson, language, targetLanguage]);

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
        if (lives === 0) return; 

        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setIsAnswered(false);
            setSelectedAnswer(null);
        } else {
            onComplete(score, lesson.id);
        }
    };
    
    if (isLoading) {
        return <div className="p-8 text-center h-full flex flex-col justify-center items-center"><p className="text-xl font-semibold animate-pulse dark:text-gray-300">Preparing your lesson...</p></div>;
    }
    
    if (error) {
         return <div className="p-8 text-center text-red-500"><p>{error}</p><button onClick={onBack} className="mt-4 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition">Go Back</button></div>;
    }

    if (lives <= 0) {
        return (
            <div className="p-4 sm:p-8 flex items-center justify-center h-full">
                 <FailedLessonView onBack={onBack} />
            </div>
        )
    }
    
    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex) / questions.length) * 100;

    return (
        <div className="p-4 sm:p-8 max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-4">
                 <button onClick={onBack} className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 py-1 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm">
                    &larr; Quit
                </button>
                <div className="flex items-center gap-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Heart key={i} className={`w-6 h-6 ${i < lives ? 'text-red-500 fill-current' : 'text-gray-300 dark:text-gray-600'}`} />
                    ))}
                </div>
            </div>
            
             <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-6">
                <div className="bg-green-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border-b-4 border-gray-200 dark:border-gray-900">
                <h1 className="text-2xl font-bold mb-6 text-center dark:text-gray-100">{currentQuestion.question}</h1>
                <div className="grid grid-cols-1 gap-3 mt-4">
                    {currentQuestion.options.map(option => {
                        let bgColor = 'bg-white border-2 border-gray-200 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600';
                        if (isAnswered) {
                            if (option === currentQuestion.correctAnswer) bgColor = 'bg-green-100 border-green-500 text-green-700 dark:bg-green-900/30 dark:text-green-300';
                            else if (option === selectedAnswer) bgColor = 'bg-red-100 border-red-500 text-red-700 dark:bg-red-900/30 dark:text-red-300';
                            else bgColor = 'opacity-50 cursor-not-allowed border-gray-200 dark:border-gray-700';
                        }
                        return (
                            <button key={option} onClick={() => handleAnswerSelect(option)}
                                disabled={isAnswered}
                                className={`p-4 rounded-xl text-left text-lg font-semibold transition-all ${bgColor} dark:text-gray-100 shadow-sm`}>
                                {option}
                            </button>
                        );
                    })}
                </div>
                
                {isAnswered && (
                     <div className="mt-6 animate-fade-in-up">
                        <div className={`p-4 rounded-xl mb-4 ${selectedAnswer === currentQuestion.correctAnswer ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}`}>
                           <h3 className="text-xl font-bold flex items-center gap-2">
                               {selectedAnswer === currentQuestion.correctAnswer ? <><CheckCircle/> Correct!</> : <><XCircle/> Incorrect</>}
                           </h3>
                           {selectedAnswer !== currentQuestion.correctAnswer && <p className="mt-1">The correct answer is: <strong>{currentQuestion.correctAnswer}</strong></p>}
                        </div>
                        <button onClick={handleNextQuestion} className={`w-full font-bold py-4 rounded-xl shadow-lg transition transform hover:scale-105 ${selectedAnswer === currentQuestion.correctAnswer ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-red-500 text-white hover:bg-red-600'}`}>
                            Continue
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
