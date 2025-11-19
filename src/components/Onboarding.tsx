
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { SlothMascot } from './SlothMascot';
import { Check, ArrowRight, Target, Globe, Moon, Sun, Languages } from 'lucide-react';
import { useTranslation } from '../lib/i18n';

export const Onboarding = ({ onComplete, setTargetCourse, setTheme }) => {
    const { t, setLanguage, language } = useTranslation();
    const [step, setStep] = useState(0); // 0: Setup, 1: Welcome, 2: Course, 3: Commit
    const [selectedCourse, setSelectedCourse] = useState('spanish');
    const [selectedTheme, setSelectedTheme] = useState('light');

    const nextStep = () => setStep(step + 1);

    const handleLanguageChange = (lang) => {
        setLanguage(lang);
    }

    const handleThemeChange = (theme) => {
        setSelectedTheme(theme);
        setTheme(theme);
    }
    
    const handleFinish = () => {
        // Pass the selected language back to AppContent to save to DB
        onComplete(language); 
    }

    return (
        <div className="fixed inset-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg z-50 flex flex-col items-center justify-center p-6 animate-fade-in-down overflow-y-auto">
            <div className="max-w-md w-full text-center">
                
                {/* Step 0: Setup (Language & Theme) */}
                {step === 0 && (
                     <div className="space-y-6 animate-fade-in-up">
                         <div className="relative w-32 h-32 mx-auto mb-4">
                            <SlothMascot className="w-32 h-32 drop-shadow-xl" />
                         </div>
                        <h1 className="text-3xl font-extrabold text-gray-800 dark:text-white">{t('setupProfile')}</h1>
                        
                        {/* Interface Language */}
                        <div className="text-left">
                            <label className="block font-bold text-gray-600 dark:text-gray-300 mb-2">{t('selectLanguage')}</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={() => handleLanguageChange('en')} className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition ${language === 'en' ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300' : 'border-gray-200 dark:border-gray-600 dark:text-gray-300'}`}>
                                    <span className="text-2xl">🇺🇸</span>
                                    <span className="font-bold">English</span>
                                </button>
                                <button onClick={() => handleLanguageChange('he')} className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition ${language === 'he' ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300' : 'border-gray-200 dark:border-gray-600 dark:text-gray-300'}`}>
                                    <span className="text-2xl">🇮🇱</span>
                                    <span className="font-bold">עברית</span>
                                </button>
                            </div>
                        </div>

                        {/* Theme */}
                        <div className="text-left">
                             <label className="block font-bold text-gray-600 dark:text-gray-300 mb-2">{t('selectTheme')}</label>
                             <div className="grid grid-cols-2 gap-4">
                                <button onClick={() => handleThemeChange('light')} className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition ${selectedTheme === 'light' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 dark:border-gray-600 dark:text-gray-300'}`}>
                                    <Sun size={24} />
                                    <span className="font-bold">{t('lightMode')}</span>
                                </button>
                                <button onClick={() => handleThemeChange('dark')} className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition ${selectedTheme === 'dark' ? 'border-indigo-500 bg-indigo-900/50 text-indigo-300' : 'border-gray-200 dark:border-gray-600 dark:text-gray-300'}`}>
                                    <Moon size={24} />
                                    <span className="font-bold">{t('darkMode')}</span>
                                </button>
                             </div>
                        </div>

                        <button onClick={nextStep} className="w-full py-4 bg-teal-500 text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-teal-600 transition mt-4">
                            {t('next')}
                        </button>
                    </div>
                )}

                {/* Step 1: Welcome */}
                {step === 1 && (
                    <div className="space-y-6 animate-fade-in-up">
                        <div className="relative w-40 h-40 mx-auto">
                            <div className="absolute inset-0 bg-teal-200 rounded-full opacity-20 animate-pulse"></div>
                            <SlothMascot className="w-40 h-40 animate-float" />
                        </div>
                        <h1 className="text-4xl font-extrabold text-gray-800 dark:text-white">{t('appName')}</h1>
                        <p className="text-xl text-gray-600 dark:text-gray-300">{t('tagline')}</p>
                        <button onClick={nextStep} className="w-full py-4 bg-teal-500 text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-teal-600 hover:scale-105 transition transform">
                            {t('start')}
                        </button>
                    </div>
                )}

                {/* Step 2: Choose Course */}
                {step === 2 && (
                    <div className="space-y-6 animate-fade-in-up">
                        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">{t('whatToLearn')}</h2>
                        <div className="grid grid-cols-1 gap-4">
                            <button 
                                onClick={() => { setSelectedCourse('spanish'); setTargetCourse('spanish'); }}
                                className={`p-6 rounded-2xl border-4 flex items-center justify-between transition ${selectedCourse === 'spanish' ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20' : 'border-gray-200 dark:border-gray-700'}`}
                            >
                                <span className="text-4xl">🇪🇸</span>
                                <span className="text-xl font-bold dark:text-white">Spanish</span>
                                {selectedCourse === 'spanish' && <Check className="text-teal-500" />}
                            </button>
                            <button 
                                onClick={() => { setSelectedCourse('english'); setTargetCourse('english'); }}
                                className={`p-6 rounded-2xl border-4 flex items-center justify-between transition ${selectedCourse === 'english' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-gray-700'}`}
                            >
                                <span className="text-4xl">🇺🇸</span>
                                <span className="text-xl font-bold dark:text-white">English</span>
                                {selectedCourse === 'english' && <Check className="text-indigo-500" />}
                            </button>
                             <button 
                                onClick={() => { setSelectedCourse('arabic'); setTargetCourse('arabic'); }}
                                className={`p-6 rounded-2xl border-4 flex items-center justify-between transition ${selectedCourse === 'arabic' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-gray-200 dark:border-gray-700'}`}
                            >
                                <span className="text-4xl">🇸🇦</span>
                                <span className="text-xl font-bold dark:text-white">Arabic</span>
                                {selectedCourse === 'arabic' && <Check className="text-emerald-500" />}
                            </button>
                        </div>
                        <button onClick={nextStep} className="w-full py-4 bg-teal-500 text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-teal-600 transition">
                            {t('continue')}
                        </button>
                    </div>
                )}

                {/* Step 3: Commitment */}
                {step === 3 && (
                    <div className="space-y-6 animate-fade-in-up">
                         <div className="w-24 h-24 mx-auto bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                            <Target className="w-12 h-12 text-yellow-500" />
                         </div>
                        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">{t('dailyGoal')}</h2>
                        <p className="text-gray-600 dark:text-gray-300">{t('commitMessage')}</p>
                        
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                             <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">1</div>
                                <p className="text-left text-sm text-gray-600 dark:text-gray-300">{t('slowIsSmooth')}</p>
                             </div>
                             <div className="w-0.5 h-4 bg-gray-300 mx-5 my-1"></div>
                             <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">2</div>
                                <p className="text-left text-sm text-gray-600 dark:text-gray-300">{t('smoothIsFast')}</p>
                             </div>
                        </div>

                        <button onClick={handleFinish} className="w-full py-4 bg-gradient-to-r from-teal-500 to-green-500 text-white rounded-2xl font-bold text-lg shadow-lg hover:scale-105 transition transform flex items-center justify-center gap-2">
                            {t('startLesson')} <ArrowRight />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
