
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef } from 'react';
import { SlothMascot } from './SlothMascot';
import { ArrowLeft, X, Send, Loader2 } from 'lucide-react';
import { generateContent } from '../lib/gemini';

interface AppPresentationProps {
    onClose: () => void;
    setPage: (page: string) => void;
}

const steps = [
    {
        id: 'intro',
        page: 'home',
        targetId: null,
        text: 'שלום! אני Slothy. ברוכים הבאים לאפליקציה שתלמד אתכם שפות בדרך הכי רגועה ויעילה שיש. בואו אעשה לכם סיבוב!',
        position: 'center'
    },
    {
        id: 'stats',
        page: 'home',
        targetId: 'home-stats',
        text: 'כאן למעלה תוכלו לראות את ההתקדמות שלכם. הרצף היומי (Streak) והמטבעות שצברתם. התמידו כדי לא לאבד את הרצף!',
        position: 'bottom'
    },
    {
        id: 'learn',
        page: 'lessons',
        targetId: 'lesson-unit-1',
        text: 'זה הלב של האפליקציה. מסלול הלמידה שלכם בנוי מיחידות. כל יחידה מכילה שיעורים קצרים וממוקדים. לחצו על הכוכב כדי להתחיל!',
        position: 'bottom'
    },
    {
        id: 'chat',
        page: 'chat',
        targetId: 'chat-input-area',
        text: 'בואו נדבר! כאן תוכלו לנהל איתי שיחות בכתב או בדיבור. אני כאן כדי לתקן טעויות ולעזור לכם לצבור ביטחון.',
        position: 'top'
    },
    {
        id: 'minigames',
        page: 'minigames',
        targetId: 'minigame-card-0',
        text: 'רוצים הפסקה מהלימודים? המיני-משחקים שלנו יעזרו לכם לשפר את הזיכרון וללמוד מילים חדשות בכיף.',
        position: 'top'
    },
    {
        id: 'shop',
        page: 'shop',
        targetId: 'shop-item-0',
        text: 'שופינג! השתמשו במטבעות שהרווחתם כדי לקנות לי תלבושות מגניבות או כוחות מיוחדים שיעזרו לכם בלימודים.',
        position: 'top'
    },
    {
        id: 'community',
        page: 'community',
        targetId: 'create-quiz-btn',
        text: 'הקהילה שלנו תוססת! כאן תוכלו ליצור בחנים משלכם עבור אחרים, או לנסות את הבחנים שחברים יצרו.',
        position: 'bottom'
    },
    {
        id: 'qa',
        page: 'home', // Return home for Q&A
        targetId: null,
        text: 'זהו, סיימנו את הסיבוב! יש לכם שאלות נוספות על האפליקציה? אני כאן לענות על הכל.',
        position: 'center'
    }
];

export const AppPresentation: React.FC<AppPresentationProps> = ({ onClose, setPage }) => {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [spotlightStyle, setSpotlightStyle] = useState<React.CSSProperties>({});
    const [mascotStyle, setMascotStyle] = useState<React.CSSProperties>({});
    const [question, setQuestion] = useState('');
    const [aiAnswer, setAiAnswer] = useState('');
    const [isThinking, setIsThinking] = useState(false);

    const currentStep = steps[currentStepIndex];

    // Effect to handle page navigation and spotlight calculation
    useEffect(() => {
        // 1. Navigate to the correct page
        setPage(currentStep.page);

        // 2. Wait for DOM to update/render, then find target
        const timer = setTimeout(() => {
            if (currentStep.targetId) {
                const element = document.getElementById(currentStep.targetId);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    const padding = 10;
                    
                    // Create a "hole" in the overlay using clip-path
                    // Note: We are essentially just highlighting the box, actual clip-path overlay is complex
                    // easier visual trick: position absolute box with box-shadow outline
                    setSpotlightStyle({
                        top: rect.top - padding,
                        left: rect.left - padding,
                        width: rect.width + (padding * 2),
                        height: rect.height + (padding * 2),
                        opacity: 1
                    });

                    // Position Mascot relative to target
                    let mascotTop = rect.bottom + 20;
                    let mascotLeft = rect.left + (rect.width / 2) - 100; // Center approx

                    if (currentStep.position === 'top') {
                        mascotTop = rect.top - 250; // Place above
                    }
                    
                    // Boundary checks
                    if (mascotLeft < 10) mascotLeft = 10;
                    if (window.innerWidth - mascotLeft < 220) mascotLeft = window.innerWidth - 220;

                    setMascotStyle({
                        top: mascotTop,
                        left: mascotLeft,
                    });
                }
            } else {
                // Center position for Intro/Q&A
                setSpotlightStyle({ opacity: 0 }); // Hide spotlight box
                setMascotStyle({
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)'
                });
            }
        }, 600); // Delay to allow page transition/render

        return () => clearTimeout(timer);
    }, [currentStepIndex, setPage, currentStep]);

    const handleNext = () => {
        if (currentStepIndex < steps.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
        } else {
            onClose();
        }
    };

    const handleAskAI = async () => {
        if (!question.trim()) return;
        setIsThinking(true);
        setAiAnswer('');
        
        try {
            const prompt = `
            You are Slothy, the mascot of the language learning app "Sloth".
            The user is asking a question about the app during the onboarding tour.
            Answer briefly, friendly, and in Hebrew.
            
            App Features for context:
            - Learn: Spanish, English, Arabic courses.
            - AI Chat: Practice conversation.
            - Minigames: Memory, Speed Listen, Flashcards.
            - Shop: Buy outfits for Slothy with coins.
            - Community: User generated quizzes.
            - Friends: Leaderboards and chat.
            
            User Question: "${question}"
            `;

            const response = await generateContent({
                model: 'gemini-2.5-flash',
                contents: [{ role: 'user', parts: [{ text: prompt }] }]
            });

            setAiAnswer(response.text);
        } catch (error) {
            setAiAnswer('אופס, התבלבלתי קצת. נסה לשאול שוב?');
        } finally {
            setIsThinking(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] overflow-hidden" dir="rtl">
            {/* Dark Backdrop with transition */}
            <div className="absolute inset-0 bg-black/70 transition-opacity duration-500" />

            {/* Spotlight Box (Highlighter) */}
            <div 
                className="absolute border-4 border-yellow-400 rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.7)] transition-all duration-500 pointer-events-none z-[101] animate-pulse"
                style={{
                    ...spotlightStyle,
                    display: currentStep.targetId ? 'block' : 'none',
                    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.75)' // This creates the cutout effect visually
                }}
            />

            {/* Interactive Container */}
            <div 
                className="absolute transition-all duration-700 ease-in-out z-[102] flex flex-col items-center w-[320px] md:w-[400px]"
                style={mascotStyle}
            >
                {/* Speech Bubble */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-2xl border-2 border-teal-100 relative mb-4 animate-fade-in-up">
                     {/* Triangle pointer */}
                    <div className={`absolute w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[15px] border-t-white dark:border-t-gray-800 left-1/2 -translate-x-1/2 ${currentStep.position === 'top' ? '-bottom-3' : '-top-3 rotate-180'}`}></div>

                    {/* Content */}
                    <h3 className="font-bold text-xl text-teal-600 mb-2">Slothy אומר:</h3>
                    
                    {currentStep.id === 'qa' ? (
                        <div className="space-y-4">
                            <p className="text-gray-700 dark:text-gray-200 text-lg leading-relaxed min-h-[60px]">
                                {aiAnswer || currentStep.text}
                            </p>
                            
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={question} 
                                    onChange={e => setQuestion(e.target.value)}
                                    placeholder="שאל אותי משהו על האפליקציה..." 
                                    className="flex-grow p-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                                />
                                <button onClick={handleAskAI} disabled={isThinking} className="bg-teal-500 text-white p-2 rounded-lg">
                                    {isThinking ? <Loader2 className="animate-spin"/> : <Send size={20}/>}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-700 dark:text-gray-200 text-lg leading-relaxed typing-effect">
                            {currentStep.text}
                        </p>
                    )}

                    {/* Navigation Controls */}
                    <div className="flex justify-between items-center mt-6 border-t pt-4 border-gray-100 dark:border-gray-700">
                         <div className="flex gap-1">
                             {steps.map((_, i) => (
                                 <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === currentStepIndex ? 'bg-teal-500' : 'bg-gray-300'}`}></div>
                             ))}
                         </div>
                         <div className="flex gap-3">
                             {currentStepIndex < steps.length - 1 ? (
                                 <button onClick={handleNext} className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-xl font-bold shadow-md transition flex items-center gap-2">
                                     הבא <ArrowLeft size={18} />
                                 </button>
                             ) : (
                                 <button onClick={onClose} className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-xl font-bold shadow-md transition">
                                     סיום
                                 </button>
                             )}
                         </div>
                    </div>
                </div>

                {/* Mascot */}
                <div className="w-32 h-32 md:w-40 md:h-40 drop-shadow-2xl animate-bounce-subtle">
                    <SlothMascot className="w-full h-full" outfit={currentStep.id === 'shop' ? 'glasses' : undefined} />
                </div>
            </div>

            {/* Quit Button */}
            <button onClick={onClose} className="absolute top-4 left-4 z-[103] bg-white/20 hover:bg-white/40 text-white p-2 rounded-full backdrop-blur-sm">
                <X size={32} />
            </button>
        </div>
    );
};
