
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../lib/i18n';
import type { Lesson } from '../types';
import { generateContent } from '../lib/gemini';
import { Heart, ArrowRight, Info, Mic } from 'lucide-react';
import { SlothMascot } from '../components/SlothMascot';
import { WordClickWrapper } from '../components/WordClickWrapper';

const FailedLessonView = ({ onBack }) => {
    const { t } = useTranslation();
    return (
        <div className="glass-panel p-8 rounded-3xl shadow-xl text-center max-w-md mx-auto mt-20">
            <div className="relative inline-block">
                <div className="absolute inset-0 bg-red-200 rounded-full blur-xl opacity-50 animate-pulse"></div>
                <SlothMascot className="w-32 h-32 drop-shadow-md grayscale opacity-80" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mt-4">{t('outOfLives')}</h2>
            <p className="text-gray-600 dark:text-gray-300 mt-2 mb-6">{t('dontWorry')}</p>
            <button onClick={onBack} className="w-full bg-red-500 text-white font-bold py-4 rounded-xl hover:bg-red-600 transition shadow-lg">
                {t('tryAgain')}
            </button>
        </div>
    )
}

interface GeneratedQuizResponse {
    quiz: {
        question: string;
        options: string[];
        correctAnswer: string;
        explanation: string;
    }[];
    speakingPhrase?: string;
}

export default function LessonPage({ lesson, onComplete, onBack, targetLanguage }: { lesson: Lesson, onComplete: (points: number, lessonId: string) => void, onBack: () => void, targetLanguage: string }) {
    const { t, language } = useTranslation();
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [lives, setLives] = useState(3);
    const [score, setScore] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [speakingPhrase, setSpeakingPhrase] = useState<string>('');
    const [isSpeakingMode, setIsSpeakingMode] = useState(false);
    const [speakFeedback, setSpeakFeedback] = useState<'idle' | 'listening' | 'success' | 'fail'>('idle');

    // Check for Wrong Answer Shake Effect
    const [shake, setShake] = useState(false);

    useEffect(() => {
        const generateQuiz = async () => {
            setIsLoading(true);
            try {
                const targetLangName = targetLanguage || 'Spanish';
                const nativeLangName = language === 'he' ? 'Hebrew' : 'English';
                
                const prompt = `Create a 5-question multiple-choice quiz for learning ${targetLangName}. 
                Topic: "${lesson.title}". 
                Lesson Content to test: "${lesson.content}". 

                CRITICAL INSTRUCTIONS FOR LANGUAGE:
                1. The user speaks ${nativeLangName}.
                2. The *Question Text* must be in ${nativeLangName} asking to translate to ${targetLangName}, OR in ${targetLangName} asking for the ${nativeLangName} meaning.
                3. The *Explanation* field MUST be written in ${nativeLangName}.
                4. Provide a simple ${targetLangName} phrase for pronunciation practice.
                
                Return valid JSON: { 
                    quiz: [{ question: string, options: string[], correctAnswer: string, explanation: string }],
                    speakingPhrase: string
                }`;
                
                const response = await generateContent({
                    model: "gemini-2.5-flash",
                    contents: [{ role: 'user', parts: [{ text: prompt }] }],
                    config: { responseMimeType: "application/json" }
                });
                const result = JSON.parse(response.text) as GeneratedQuizResponse;
                setQuestions(result.quiz);
                setSpeakingPhrase(result.speakingPhrase || lesson.vocab[0]);
            } catch (e) {
                console.error(e);
                setQuestions([{ question: `What relates to ${lesson.title}?`, options: ["Wrong", "Incorrect", "Right Answer"], correctAnswer: "Right Answer", explanation: "Review the lesson content." }]);
                setSpeakingPhrase("Hola");
            } finally {
                setIsLoading(false);
            }
        };
        generateQuiz();
    }, [lesson, targetLanguage, language]);

    const handleAnswerSelect = (option: string) => {
        if (isAnswered) return;
        setIsAnswered(true);
        setSelectedAnswer(option);

        if (option === questions[currentQuestionIndex].correctAnswer) {
            setScore(score + 10);
        } else {
            setLives(lives - 1);
            setShake(true);
            setTimeout(() => setShake(false), 500);
        }
    };
    
    const handleNextQuestion = () => {
        if (lives === 0) return; 
        
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setIsAnswered(false);
            setSelectedAnswer(null);
        } else if (!isSpeakingMode && speakingPhrase) {
             // Go to Speaking Mode before finishing
             setIsSpeakingMode(true);
        } else {
            onComplete(score, lesson.id);
        }
    };
    
    const startListening = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
             alert("Speech recognition not supported in this browser.");
             setSpeakFeedback('success'); // Auto-pass if not supported
             return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = targetLanguage === 'spanish' ? 'es-ES' : targetLanguage === 'arabic' ? 'ar-SA' : 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        setSpeakFeedback('listening');
        recognition.start();

        recognition.onresult = (event) => {
             const transcript = event.results[0][0].transcript.toLowerCase();
             // Simple similarity check
             const target = speakingPhrase.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
             const spoken = transcript.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
             
             // Very basic check: if transcript contains significant part of phrase
             if (spoken === target || spoken.includes(target) || target.includes(spoken)) {
                 setSpeakFeedback('success');
                 setScore(score + 20); // Bonus for speaking
             } else {
                 setSpeakFeedback('fail');
             }
        };
        
        recognition.onerror = () => {
            setSpeakFeedback('fail');
        };
    }
    
    if (isLoading) return <div className="flex justify-center items-center h-full"><SlothMascot className="w-24 h-24 animate-pulse" /></div>;
    if (lives <= 0) return <FailedLessonView onBack={onBack} />;
    
    // Speaking Mode Render
    if (isSpeakingMode) {
         return (
            <div className="p-8 max-w-2xl mx-auto h-full flex flex-col items-center justify-center">
                 <SlothMascot className="w-32 h-32 mb-6" />
                 <h2 className="text-2xl font-bold mb-2 dark:text-white">{t('pronunciationCoach')}</h2>
                 <p className="mb-6 text-gray-600 dark:text-gray-300">{t('speakThis')}</p>
                 
                 <div className="p-8 bg-white dark:bg-gray-700 rounded-3xl shadow-lg mb-8 text-center w-full">
                     <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">{speakingPhrase}</p>
                 </div>
                 
                 {speakFeedback === 'idle' && (
                      <button onClick={startListening} className="bg-teal-500 hover:bg-teal-600 text-white p-6 rounded-full shadow-xl transition transform hover:scale-110">
                          <Mic size={48} />
                      </button>
                 )}
                 
                 {speakFeedback === 'listening' && (
                     <div className="text-teal-500 font-bold animate-pulse flex flex-col items-center">
                         <Mic size={48} />
                         <p className="mt-2">{t('listening')}</p>
                     </div>
                 )}
                 
                 {speakFeedback === 'success' && (
                     <div className="text-center animate-fade-in-up">
                         <div className="bg-green-100 text-green-700 p-4 rounded-xl mb-6 font-bold border border-green-300">
                             {t('perfectPronunciation')}
                         </div>
                         <button onClick={() => onComplete(score, lesson.id)} className="bg-green-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-green-600">
                             {t('continue')}
                         </button>
                     </div>
                 )}

                 {speakFeedback === 'fail' && (
                     <div className="text-center animate-shake">
                          <div className="bg-red-100 text-red-700 p-4 rounded-xl mb-6 font-bold border border-red-300">
                             {t('tryPronunciationAgain')}
                         </div>
                         <button onClick={startListening} className="bg-gray-500 text-white px-6 py-2 rounded-lg font-bold mr-4 hover:bg-gray-600">{t('tryAgain')}</button>
                         <button onClick={() => onComplete(score, lesson.id)} className="text-gray-500 underline mt-2">{t('continue')}</button>
                     </div>
                 )}
            </div>
         )
    }

    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex) / questions.length) * 100;
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

    return (
        <div className="p-4 sm:p-8 max-w-2xl mx-auto h-full flex flex-col">
            {/* Top Bar */}
            <div className="flex justify-between items-center mb-6">
                 <button onClick={onBack} className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-bold text-xl p-2 bg-white/50 dark:bg-gray-700/50 rounded-full transition">✕</button>
                 <div className="flex-grow mx-6 h-4 bg-gray-200/50 rounded-full overflow-hidden backdrop-blur-sm border border-white/30">
                    <div className="bg-teal-500 h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(20,184,166,0.5)]" style={{ width: `${progress}%` }}></div>
                 </div>
                <div className="flex items-center gap-1 bg-white/50 dark:bg-gray-700/50 px-3 py-1 rounded-full">
                    <Heart className={`${lives <= 1 ? 'text-red-600 animate-pulse' : 'text-red-500'} fill-current`} size={20} /> 
                    <span className="text-gray-800 dark:text-white font-bold text-lg">{lives}</span>
                </div>
            </div>
            
            {/* Quiz Card */}
            <div className="glass-panel flex-grow p-6 sm:p-10 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col justify-center animate-fade-in-up">
                <h1 className="text-2xl sm:text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white leading-tight" dir="auto">
                    <WordClickWrapper text={currentQuestion.question} />
                </h1>
                
                <div className="grid grid-cols-1 gap-4">
                    {currentQuestion.options.map((option: string) => {
                        let style = 'bg-white/80 dark:bg-gray-700/80 border-2 border-transparent hover:border-blue-400 hover:bg-white dark:hover:bg-gray-600 text-gray-800 dark:text-white';
                        if (isAnswered) {
                            if (option === currentQuestion.correctAnswer) style = 'bg-green-100 border-green-500 text-green-800 dark:bg-green-900/60 dark:text-green-100';
                            else if (option === selectedAnswer) style = 'bg-red-100 border-red-500 text-red-800 dark:bg-red-900/60 dark:text-red-100';
                            else style = 'opacity-50 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400';
                        }
                        return (
                            <button key={option} onClick={() => handleAnswerSelect(option)} disabled={isAnswered} className={`p-5 rounded-2xl text-left text-lg font-bold shadow-sm transition-all transform hover:scale-[1.01] ${style}`}>
                                {option}
                            </button>
                        );
                    })}
                </div>

                {/* Feedback Area */}
                {isAnswered && (
                     <div className={`mt-6 animate-fade-in-up ${!isCorrect && shake ? 'animate-shake' : ''}`}>
                        <div className={`relative p-6 rounded-2xl mb-4 flex flex-col sm:flex-row items-center gap-4 shadow-lg border-2 ${isCorrect ? 'bg-green-50 border-green-200 dark:bg-green-900/40 dark:border-green-700' : 'bg-red-50 border-red-200 dark:bg-red-900/40 dark:border-red-700'}`}>
                           
                           {/* Mascot Expression */}
                           <div className="flex-shrink-0 transform -rotate-6">
                               {isCorrect ? (
                                   <SlothMascot className="w-20 h-20" outfit="crown" /> 
                               ) : (
                                   <SlothMascot className="w-20 h-20 grayscale contrast-125" />
                               )}
                           </div>

                           <div className="flex-grow text-center sm:text-left">
                               <h3 className={`font-extrabold text-xl mb-1 ${isCorrect ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                                   {isCorrect ? t('allCorrect') : t('notQuite')}
                               </h3>
                               
                               {!isCorrect && (
                                   <div className="text-sm text-red-600 dark:text-red-200 font-semibold mb-2">
                                       {t('correctAnswerIs')} {currentQuestion.correctAnswer}
                                   </div>
                               )}

                               <div className="relative bg-white/70 dark:bg-black/20 p-3 rounded-xl text-sm leading-relaxed text-gray-800 dark:text-gray-100 flex items-start gap-2" dir="auto">
                                   <Info className="w-5 h-5 flex-shrink-0 text-blue-500 mt-0.5" />
                                   <p><WordClickWrapper text={currentQuestion.explanation} /></p>
                               </div>
                           </div>
                        </div>

                        <button onClick={handleNextQuestion} className={`w-full font-bold py-4 rounded-xl shadow-lg text-white text-lg transition-transform hover:scale-105 flex justify-center items-center gap-2 ${isCorrect ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-800 hover:bg-gray-900 dark:bg-gray-600 dark:hover:bg-gray-500'}`}>
                            {t('continueLearning')} <ArrowRight/>
                        </button>
                    </div>
                )}
            </div>
            <div className="text-center mt-4 text-gray-500 text-xs">
                {t('tapWord')}
            </div>
        </div>
    );
}
