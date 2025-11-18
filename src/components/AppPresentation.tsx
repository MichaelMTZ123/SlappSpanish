
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { SlothMascot } from './SlothMascot';
import { ArrowRight, ArrowLeft, X, CheckCircle, Users, MessageSquare, Gamepad2, GraduationCap } from 'lucide-react';
import { useTranslation } from '../lib/i18n';

interface AppPresentationProps {
    onClose: () => void;
}

export const AppPresentation: React.FC<AppPresentationProps> = ({ onClose }) => {
    const { t } = useTranslation();
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        {
            id: 'intro',
            title: 'Welcome to Sloth!',
            subtitle: 'Meet Slothy, your new best friend.',
            description: 'Sloth is not just an app; it\'s a philosophy. "Slow is smooth, smooth is fast." Slothy is here to guide you through your language learning journey with patience and fun.',
            icon: <SlothMascot className="w-40 h-40 animate-float drop-shadow-2xl" />,
            bg: 'from-teal-400 to-green-300'
        },
        {
            id: 'learn',
            title: 'Your Learning Path',
            subtitle: 'Step by step, word by word.',
            description: 'Navigate through our structured units in Spanish, English, or Arabic. Complete lessons, take quizzes, and earn points to climb the ranks.',
            icon: <GraduationCap className="w-32 h-32 text-white drop-shadow-lg" />,
            bg: 'from-blue-400 to-indigo-400'
        },
        {
            id: 'ai',
            title: 'Chat with Slothy',
            subtitle: 'Practice with Real AI',
            description: 'Use our state-of-the-art AI chat to practice conversations. You can even speak to Slothy and hear him speak back with realistic AI voice!',
            icon: <MessageSquare className="w-32 h-32 text-white drop-shadow-lg" />,
            bg: 'from-purple-400 to-pink-400'
        },
        {
            id: 'community',
            title: 'Community & Games',
            subtitle: 'Learn together, play together.',
            description: 'Challenge your friends, create your own quizzes for the community, and play minigames to test your reflexes and vocabulary.',
            icon: <Gamepad2 className="w-32 h-32 text-white drop-shadow-lg" />,
            bg: 'from-orange-400 to-red-400'
        },
        {
            id: 'teacher',
            title: 'Live Teachers',
            subtitle: 'Connect with real people.',
            description: 'Need extra help? Find a peer tutor or become one yourself! Video calls are built right into the app.',
            icon: <Users className="w-32 h-32 text-white drop-shadow-lg" />,
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in-down">
            <div className={`relative w-full max-w-2xl aspect-[4/5] md:aspect-[16/9] rounded-3xl shadow-2xl overflow-hidden bg-gradient-to-br ${slides[currentSlide].bg} transition-all duration-500`}>
                
                {/* Close Button */}
                <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 rounded-full text-white z-20 transition">
                    <X size={24} />
                </button>

                {/* Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center z-10">
                    <div className="mb-6 transform transition-transform duration-500 hover:scale-110">
                        {slides[currentSlide].icon}
                    </div>
                    
                    <h2 className="text-4xl font-extrabold text-white mb-2 drop-shadow-md">{slides[currentSlide].title}</h2>
                    <h3 className="text-xl font-bold text-white/90 mb-6 uppercase tracking-widest">{slides[currentSlide].subtitle}</h3>
                    
                    <div className="bg-white/20 backdrop-blur-md p-6 rounded-2xl border border-white/30 max-w-lg shadow-lg">
                        <p className="text-white font-medium text-lg leading-relaxed">
                            {slides[currentSlide].description}
                        </p>
                    </div>
                </div>

                {/* Decorative Circles */}
                <div className="absolute top-[-50px] left-[-50px] w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute bottom-[-50px] right-[-50px] w-60 h-60 bg-white/10 rounded-full blur-3xl"></div>

                {/* Navigation */}
                <div className="absolute bottom-6 left-0 right-0 flex justify-between items-center px-8 z-20">
                    <button 
                        onClick={prevSlide} 
                        disabled={currentSlide === 0}
                        className={`p-3 rounded-full bg-white/20 hover:bg-white/40 text-white transition ${currentSlide === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                    >
                        <ArrowLeft size={28} />
                    </button>

                    <div className="flex gap-2">
                        {slides.map((_, index) => (
                            <div key={index} className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-white w-8' : 'bg-white/40'}`}></div>
                        ))}
                    </div>

                    <button 
                        onClick={nextSlide} 
                        className="p-3 rounded-full bg-white text-teal-600 hover:bg-gray-100 hover:scale-110 transition shadow-lg flex items-center gap-2 px-6 font-bold"
                    >
                        {currentSlide === slides.length - 1 ? "Start" : "Next"} <ArrowRight size={24} />
                    </button>
                </div>
            </div>
        </div>
    );
};
