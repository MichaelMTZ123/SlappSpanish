
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { SlothMascot } from './SlothMascot';
import { ArrowRight, ArrowLeft, X, Users, MessageSquare, Gamepad2, GraduationCap, ShoppingBag, Globe } from 'lucide-react';

interface AppPresentationProps {
    onClose: () => void;
}

export const AppPresentation: React.FC<AppPresentationProps> = ({ onClose }) => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        {
            id: 'intro',
            title: 'ברוכים הבאים ל-Sloth!',
            subtitle: 'הכירו את Slothy, החבר החדש שלכם.',
            description: 'Sloth היא לא סתם אפליקציה, אלא דרך חיים. "לאט זה חלק, חלק זה מהיר". Slothy כאן כדי ללוות אתכם במסע למידת השפה בכיף, בסבלנות ובחיוך.',
            icon: <SlothMascot className="w-40 h-40 animate-float drop-shadow-2xl" />,
            bg: 'from-teal-400 to-green-300'
        },
        {
            id: 'learn',
            title: 'מסלול הלמידה שלכם',
            subtitle: 'צעד אחר צעד, מילה אחר מילה.',
            description: 'נווטו בין יחידות לימוד מובנות בספרדית, אנגלית או ערבית. השלימו שיעורים קצרים, עברו בחנים מאתגרים וצברו נקודות כדי להתקדם בדרגות.',
            icon: <GraduationCap className="w-32 h-32 text-white drop-shadow-lg" />,
            bg: 'from-blue-400 to-indigo-400'
        },
        {
            id: 'ai',
            title: 'צ\'אט עם Slothy',
            subtitle: 'תרגול עם בינה מלאכותית אמיתית',
            description: 'כנסו לאזור ה-AI כדי לנהל שיחות קוליות או בכתב עם Slothy! תרגלו סיטואציות כמו הזמנת קפה או בקשת הכוונה, וקבלו פידבק בזמן אמת.',
            icon: <MessageSquare className="w-32 h-32 text-white drop-shadow-lg" />,
            bg: 'from-purple-400 to-pink-400'
        },
        {
            id: 'community',
            title: 'קהילה וחברים',
            subtitle: 'ללמוד ביחד זה כיף יותר.',
            description: 'הוסיפו חברים, צ\'וטטו איתם, התחרו בטבלת המובילים (Leaderboard) וצרו בחנים משלכם כדי לאתגר את שאר הקהילה!',
            icon: <Users className="w-32 h-32 text-white drop-shadow-lg" />,
            bg: 'from-orange-400 to-red-400'
        },
        {
            id: 'shop',
            title: 'משחקים, חנות וסטייל',
            subtitle: 'הרוויחו מטבעות ותהנו.',
            description: 'שחקו במיני-משחקים כדי לשפר את הזיכרון ולהרוויח מטבעות. בחנות תוכלו לקנות ל-Slothy כובעים, משקפיים וכתרים מגניבים!',
            icon: <div className="relative">
                    <Gamepad2 className="w-32 h-32 text-white drop-shadow-lg absolute -left-8 top-0" />
                    <ShoppingBag className="w-24 h-24 text-yellow-200 drop-shadow-lg absolute left-12 top-8" />
                  </div>,
            bg: 'from-yellow-400 to-orange-500'
        },
        {
            id: 'teacher',
            title: 'מורים בוידאו',
            subtitle: 'תקשורת אנושית אמיתית.',
            description: 'צריכים עזרה נוספת? התחברו לשיחת וידאו חיה עם משתמשים אחרים או מורים כדי לתרגל שיחה פנים מול פנים. הכל בתוך האפליקציה.',
            icon: <Globe className="w-32 h-32 text-white drop-shadow-lg" />,
            bg: 'from-teal-500 to-cyan-500'
        }
    ];

    const nextSlide = () => {
        if (currentSlide < slides.length - 1) setCurrentSlide(currentSlide + 1);
        else onClose();
    };

    const prevSlide = () => {
        if (currentSlide > 0) setCurrentSlide(currentSlide - 1);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in-down" dir="rtl">
            <div className={`relative w-full max-w-2xl min-h-[600px] flex flex-col rounded-3xl shadow-2xl overflow-hidden bg-gradient-to-br ${slides[currentSlide].bg} transition-all duration-500`}>
                
                {/* Close Button - Positioned Top Left for RTL */}
                <button onClick={onClose} className="absolute top-4 left-4 p-2 bg-white/20 hover:bg-white/40 rounded-full text-white z-20 transition backdrop-blur-sm">
                    <X size={24} />
                </button>

                {/* Decorative Circles */}
                <div className="absolute top-[-50px] right-[-50px] w-60 h-60 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-[-50px] left-[-50px] w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>

                {/* Content */}
                <div className="flex-grow flex flex-col items-center justify-center p-8 text-center z-10">
                    <div className="mb-8 transform transition-transform duration-500 hover:scale-110 h-40 flex items-center justify-center">
                        {slides[currentSlide].icon}
                    </div>
                    
                    <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-3 drop-shadow-md tracking-tight">
                        {slides[currentSlide].title}
                    </h2>
                    <h3 className="text-xl md:text-2xl font-bold text-white/90 mb-8 uppercase tracking-widest border-b-2 border-white/30 pb-2 inline-block">
                        {slides[currentSlide].subtitle}
                    </h3>
                    
                    <div className="bg-white/20 backdrop-blur-md p-6 rounded-2xl border border-white/30 max-w-lg shadow-lg">
                        <p className="text-white font-medium text-lg md:text-xl leading-relaxed">
                            {slides[currentSlide].description}
                        </p>
                    </div>
                </div>

                {/* Navigation Bar */}
                <div className="bg-black/10 backdrop-blur-sm p-6 flex justify-between items-center z-20">
                    {/* Previous Button (Right side in RTL) */}
                    <button 
                        onClick={prevSlide} 
                        disabled={currentSlide === 0}
                        className={`p-3 rounded-full bg-white/20 hover:bg-white/40 text-white transition flex items-center justify-center ${currentSlide === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                    >
                        <ArrowRight size={28} />
                    </button>

                    {/* Dots Indicator */}
                    <div className="flex gap-3">
                        {slides.map((_, index) => (
                            <div key={index} className={`transition-all duration-300 rounded-full ${index === currentSlide ? 'bg-white w-8 h-3' : 'bg-white/40 w-3 h-3'}`}></div>
                        ))}
                    </div>

                    {/* Next/Finish Button (Left side in RTL) */}
                    <button 
                        onClick={nextSlide} 
                        className="bg-white text-teal-700 hover:bg-gray-100 hover:scale-105 transition shadow-lg flex items-center gap-2 px-6 py-3 rounded-xl font-extrabold text-lg"
                    >
                        {currentSlide === slides.length - 1 ? "סיום" : "הבא"} 
                        {currentSlide !== slides.length - 1 && <ArrowLeft size={24} />}
                    </button>
                </div>
            </div>
        </div>
    );
};
