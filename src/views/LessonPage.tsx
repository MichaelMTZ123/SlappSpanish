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

export default function LessonPage({ lesson, onComplete, onBack }: { lesson: Lesson, onComplete: (points: number, lessonId: string) => void, onBack: () => void }) {
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
                const prompt = `Create a 10-question multiple-choice quiz about the Spanish lesson topic: "${lesson.title}". The lesson covers: "${lesson.content}". For each question, provide one correct answer and three plausible incorrect answers. Respond in JSON format.`;
                
                const response = await generateContent({
                    model: "gemini-2.5-flash",
                    contents: prompt,
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
                // Fallback to hardcoded quiz if AI fails
                const fallbackQuestions = lesson.quiz.map(q => ({
                    question: language === 'he' ? q.q_he : q.q,
                    options: [...q.o].sort(() => Math.random() - 0.5),
                    correctAnswer: q.a
                }));
                setQuestions(fallbackQuestions);
            } finally {
                setIsLoading(false);
            }
        };

        generateQuiz();
    }, [lesson, language]);

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
        if (lives === 0) return; // Game over is handled by useEffect on lives change

        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setIsAnswered(false);
            setSelectedAnswer(null);
        } else {
            // Quiz finished successfully
            onComplete(score, lesson.id);
        }
    };
    
    useEffect(() => {
        if(lives === 0){
            // Delay to show the final incorrect answer before showing the fail screen
            setTimeout(() => {
               // The view will change based on lives being 0
            }, 1500);
        }
    }, [lives, onBack]);

    if (isLoading) {
        return <div className="p-8 text-center"><p className="text-xl font-semibold animate-pulse dark:text-gray-300">Generating your lesson...</p></div>;
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
    
    if (questions.length === 0) {
        return <div className="p-8 text-center dark:text-gray-300"><p>No questions available for this lesson.</p><button onClick={onBack}>Back</button></div>;
    }
    
    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex) / questions.length) * 100;


    return (
        <div className="p-4 sm:p-8">
            <div className="flex justify-between items-center mb-4">
                 <button onClick={onBack} className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 py-1 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm">
                    &larr; {t('backToLessons')}
                </button>
                <div className="flex items-center gap-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Heart key={i} className={`w-6 h-6 ${i < lives ? 'text-red-500 fill-current' : 'text-gray-300 dark:text-gray-600'}`} />
                    ))}
                </div>
            </div>
            
             <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-6">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                <h1 className="text-2xl font-bold mb-4 text-center dark:text-gray-100">{currentQuestion.question}</h1>
                <div className="flex flex-col space-y-3 mt-4">
                    {currentQuestion.options.map(option => {
                        let bgColor = 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600';
                        if (isAnswered) {
                            if (option === currentQuestion.correctAnswer) bgColor = 'bg-green-200 dark:bg-green-500/50';
                            else if (option === selectedAnswer) bgColor = 'bg-red-200 dark:bg-red-500/50';
                        }
                        return (
                            <button key={option} onClick={() => handleAnswerSelect(option)}
                                disabled={isAnswered}
                                className={`p-4 rounded-lg text-left text-lg font-semibold transition ${bgColor} dark:text-gray-100 ${!isAnswered ? 'cursor-pointer' : 'cursor-default'}`}>
                                {option}
                            </button>
                        );
                    })}
                </div>
                
                {isAnswered && (
                     <div className="mt-6 text-center">
                        <div className={`p-4 rounded-lg ${selectedAnswer === currentQuestion.correctAnswer ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}`}>
                           <h3 className="text-xl font-bold">{selectedAnswer === currentQuestion.correctAnswer ? "Correct!" : "Incorrect"}</h3>
                           {selectedAnswer !== currentQuestion.correctAnswer && <p>The correct answer is: <strong>{currentQuestion.correctAnswer}</strong></p>}
                        </div>
                        <button onClick={handleNextQuestion} className="w-full mt-4 bg-blue-500 text-white font-bold py-3 rounded-lg hover:bg-blue-600 transition">
                            Continue
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}