
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { SlothMascot } from './SlothMascot';
import { ArrowLeft, ArrowRight, X, Send, Loader2, HelpCircle } from 'lucide-react';
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
        text: 'שלום! אני Slothy. ברוכים הבאים לאפליקציה שתלמד אתכם ספרדית בדרך הכי רגועה ויעילה שיש. בואו אעשה לכם סיבוב מלא!',
    },
    {
        id: 'stats',
        page: 'home',
        targetId: 'home-stats',
        text: 'כאן למעלה רואים את ההתקדמות. הרצף היומי (Streak) והמטבעות. חשוב להתמיד כל יום כדי לא לאבד את הרצף!',
    },
    {
        id: 'quests',
        page: 'home',
        targetId: 'daily-quests-panel',
        text: 'אלו המשימות היומיות שלכם. השלימו אותן כדי לזכות בבונוסים של מטבעות ולהתקדם מהר יותר.',
    },
    {
        id: 'learn',
        page: 'lessons',
        targetId: 'learn-path-card',
        text: 'זה הלב של האפליקציה. מסלול הלמידה שלכם בנוי מיחידות. כאן מתחילים בשיעורים עצמיים בקצב שלכם.',
    },
    {
        id: 'online',
        page: 'lessons',
        targetId: 'learn-online-card',
        text: 'רוצים לתרגל דיבור? כאן תוכלו למצוא מורים זמינים ולבצע שיחות וידאו בלייב כדי לשפר את השפה.',
    },
    {
        id: 'chat',
        page: 'chat',
        targetId: 'chat-input-area',
        text: 'בואו נדבר! כאן תוכלו לנהל איתי (ה-AI) שיחות בכתב או בדיבור. אני אתקן טעויות ואעזור לכם לצבור ביטחון.',
    },
    {
        id: 'minigames',
        page: 'minigames',
        targetId: 'minigame-card-0',
        text: 'רוצים הפסקה? המיני-משחקים יעזרו לכם לשפר את הזיכרון וללמוד מילים חדשות בדרך כיפית.',
    },
    {
        id: 'shop',
        page: 'shop',
        targetId: 'shop-item-0',
        text: 'שופינג! השתמשו במטבעות שהרווחתם כדי לקנות לי תלבושות מגניבות או "הקפאת רצף" לימים עמוסים.',
    },
    {
        id: 'friends',
        page: 'friends',
        targetId: 'friends-search-panel',
        text: 'יותר כיף ללמוד ביחד! חפשו חברים, עקבו אחרי ההתקדמות שלהם ושלחו להם הודעות.',
    },
    {
        id: 'community',
        page: 'community',
        targetId: 'create-quiz-btn',
        text: 'הקהילה שלנו תוססת! צרו בחנים משלכם עבור אחרים, או נסו את הבחנים שמשתמשים אחרים יצרו.',
    },
    {
        id: 'leaderboard',
        page: 'leaderboard',
        targetId: 'leaderboard-table',
        text: 'רוצים להיות אגדה? כאן הטבלה המובילה. צברו נקודות בשיעורים ובמשחקים כדי לטפס לפסגה.',
    },
    {
        id: 'profile',
        page: 'profile',
        targetId: 'profile-avatar',
        text: 'זה האזור האישי שלכם. כאן משנים שפה, מחליפים תמונת פרופיל, ורואים את הדרגה הנוכחית שלכם.',
    },
    {
        id: 'qa',
        page: 'home',
        targetId: null,
        text: 'זהו, סיימנו את הסיבוב! יש לכם שאלות נוספות על האפליקציה? אני כאן לענות על הכל (ממש עכשיו!).',
    }
];

export const AppPresentation: React.FC<AppPresentationProps> = ({ onClose, setPage }) => {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [spotlightStyle, setSpotlightStyle] = useState<React.CSSProperties>({});
    const [question, setQuestion] = useState('');
    const [aiAnswer, setAiAnswer] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [highlightVisible, setHighlightVisible] = useState(false);

    const currentStep = steps[currentStepIndex];

    useEffect(() => {
        setHighlightVisible(false);
        setPage(currentStep.page);

        let retryCount = 0;
        const maxRetries = 25; 
        
        const findTarget = () => {
            if (!currentStep.targetId) {
                setSpotlightStyle({ opacity: 0, display: 'none' });
                setHighlightVisible(true);
                return;
            }

            const element = document.getElementById(currentStep.targetId);
            
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                setTimeout(() => {
                    const rect = element.getBoundingClientRect();
                    const padding = 8;
                    
                    setSpotlightStyle({
                        top: rect.top - padding,
                        left: rect.left - padding,
                        width: rect.width + (padding * 2),
                        height: rect.height + (padding * 2),
                        opacity: 1,
                        display: 'block',
                        position: 'fixed' 
                    });
                    setHighlightVisible(true);
                }, 600); // Wait for scroll
            } else {
                if (retryCount < maxRetries) {
                    retryCount++;
                    setTimeout(findTarget, 100);
                } else {
                    // If target not found, just show text without highlight
                    setSpotlightStyle({ opacity: 0, display: 'none' });
                    setHighlightVisible(true);
                }
            }
        };

        findTarget();

    }, [currentStepIndex, setPage, currentStep]);

    const handleNext = () => {
        if (currentStepIndex < steps.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
            setAiAnswer(''); // Reset Q&A
        } else {
            onClose();
        }
    };
    
    const handlePrev = () => {
         if (currentStepIndex > 0) {
            setCurrentStepIndex(prev => prev - 1);
            setAiAnswer('');
        }
    }

    const handleAskAI = async () => {
        if (!question.trim()) return;
        setIsThinking(true);
        setAiAnswer('');
        
        try {
            const prompt = `
            You are Slothy, the mascot of the language learning app "Sloth".
            The user is asking a question about the app during the onboarding tour.
            Answer clearly, friendly, and strictly in Hebrew. Keep it short (max 2 sentences).
            If asked about capabilities, mention: Learning Spanish/English/Arabic, AI Chat, Video Calls with real tutors, Minigames, and Leaderboards.
            User Question: "${question}"
            `;

            const response = await generateContent({
                model: 'gemini-2.5-flash',
                contents: [{ role: 'user', parts: [{ text: prompt }] }]
            });

            setAiAnswer(response.text);
        } catch (error) {
            console.error(error);
            setAiAnswer('מצטער, הייתה בעיה בתקשורת. נסה שוב?');
        } finally {
            setIsThinking(false);
        }
    };

    // Prevent rendering flash before position is calculated
    if (!highlightVisible && currentStepIndex !== 0 && currentStepIndex !== steps.length - 1) return null;

    return (
        <div className="fixed inset-0 z-[9999] font-sans" dir="rtl">
            {/* 1. Dark Overlay with Cutout logic (Simulated by 4 divs or just transparency) */}
            {/* Simplified approach: Full dark background, Spotlight sits on top with box-shadow hack for cutout effect */}
            <div className="absolute inset-0 bg-black/60 transition-opacity duration-500" />

            {/* 2. Spotlight Highlighting the Element */}
            {currentStep.targetId && (
                 <div 
                    className="fixed border-4 border-yellow-400 rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] transition-all duration-500 pointer-events-none z-[10000] animate-pulse"
                    style={spotlightStyle}
                />
            )}

            {/* 3. Fixed Bottom Controller (Tour Guide) */}
            <div className="fixed bottom-0 left-0 right-0 z-[10001] p-4 flex flex-col items-center justify-end pointer-events-none">
                <div className="w-full max-w-2xl pointer-events-auto animate-fade-in-up">
                    
                    {/* Mascot positioning - sitting on top of the card */}
                    <div className="flex justify-end -mb-6 mr-4 relative z-10">
                        <SlothMascot className="w-28 h-28 drop-shadow-2xl animate-bounce-subtle" outfit={currentStep.id === 'shop' ? 'glasses' : undefined} />
                    </div>

                    {/* Main Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border-2 border-gray-100 dark:border-gray-700 overflow-hidden">
                        
                        {/* Progress Bar */}
                        <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700">
                            <div 
                                className="h-full bg-teal-500 transition-all duration-500 ease-out" 
                                style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
                            />
                        </div>

                        <div className="p-6">
                            {/* Step Title */}
                            <div className="flex items-center gap-2 mb-2 text-gray-400 text-xs font-bold uppercase tracking-widest">
                                <span>שלב {currentStepIndex + 1} מתוך {steps.length}</span>
                            </div>

                            {/* Content */}
                            <h3 className="font-bold text-xl text-teal-600 mb-3">
                                {currentStep.id === 'qa' ? 'יש שאלות?' : 'Slothy אומר:'}
                            </h3>
                            
                            {currentStep.id === 'qa' ? (
                                <div className="space-y-4">
                                    <p className="text-gray-800 dark:text-gray-100 text-lg leading-relaxed min-h-[40px]">
                                        {aiAnswer || currentStep.text}
                                    </p>
                                    <div className="flex gap-2 mt-2">
                                        <div className="relative flex-grow">
                                            <input 
                                                type="text" 
                                                value={question} 
                                                onChange={e => setQuestion(e.target.value)}
                                                onKeyPress={e => e.key === 'Enter' && handleAskAI()}
                                                placeholder="למשל: איך משיגים עוד נקודות?" 
                                                className="w-full pl-4 pr-10 py-3 border rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                                            />
                                            <HelpCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        </div>
                                        <button 
                                            onClick={handleAskAI} 
                                            disabled={isThinking || !question} 
                                            className="bg-teal-500 text-white p-3 rounded-xl shadow-md hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isThinking ? <Loader2 className="animate-spin" /> : <Send size={20}/>}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-800 dark:text-gray-100 text-lg leading-relaxed">
                                    {currentStep.text}
                                </p>
                            )}

                            {/* Controls */}
                            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                                <button 
                                    onClick={currentStepIndex === 0 ? onClose : handlePrev} 
                                    className="text-gray-500 dark:text-gray-400 px-4 py-2 rounded-lg font-bold hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center gap-2"
                                >
                                    {currentStepIndex === 0 ? <X size={18}/> : <ArrowRight size={18}/>}
                                    {currentStepIndex === 0 ? 'דלג' : 'הקודם'}
                                </button>

                                <button 
                                    onClick={handleNext} 
                                    className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition flex items-center gap-2 hover:scale-105 transform"
                                >
                                    {currentStepIndex < steps.length - 1 ? 'הבא' : 'סיום'}
                                    {currentStepIndex < steps.length - 1 && <ArrowLeft size={18}/>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
