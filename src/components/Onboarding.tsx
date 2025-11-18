
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { SlothMascot } from './SlothMascot';
import { Check, ArrowRight, Target, Globe } from 'lucide-react';

export const Onboarding = ({ onComplete, setTargetCourse }) => {
    const [step, setStep] = useState(1);
    const [selectedCourse, setSelectedCourse] = useState('spanish');

    const nextStep = () => setStep(step + 1);

    return (
        <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col items-center justify-center p-6 animate-fade-in-down">
            <div className="max-w-md w-full text-center">
                
                {/* Step 1: Welcome */}
                {step === 1 && (
                    <div className="space-y-6">
                        <div className="relative w-40 h-40 mx-auto">
                            <div className="absolute inset-0 bg-teal-200 rounded-full opacity-20 animate-pulse"></div>
                            <SlothMascot className="w-40 h-40 animate-float" />
                        </div>
                        <h1 className="text-4xl font-extrabold text-gray-800 dark:text-white">Hi, I'm Slappy!</h1>
                        <p className="text-xl text-gray-600 dark:text-gray-300">I'm here to help you learn a new language, slow and steady.</p>
                        <button onClick={nextStep} className="w-full py-4 bg-teal-500 text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-teal-600 hover:scale-105 transition transform">
                            Let's Start!
                        </button>
                    </div>
                )}

                {/* Step 2: Choose Language */}
                {step === 2 && (
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">What do you want to learn?</h2>
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
                        </div>
                        <button onClick={nextStep} className="w-full py-4 bg-teal-500 text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-teal-600 transition">
                            Continue
                        </button>
                    </div>
                )}

                {/* Step 3: Commitment */}
                {step === 3 && (
                    <div className="space-y-6">
                         <div className="w-24 h-24 mx-auto bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                            <Target className="w-12 h-12 text-yellow-500" />
                         </div>
                        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Daily Goal</h2>
                        <p className="text-gray-600 dark:text-gray-300">Learning a language takes time. Can you commit to 5 minutes a day?</p>
                        
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                             <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">1</div>
                                <p className="text-left text-sm text-gray-600 dark:text-gray-300">Slow is smooth.</p>
                             </div>
                             <div className="w-0.5 h-4 bg-gray-300 mx-5 my-1"></div>
                             <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">2</div>
                                <p className="text-left text-sm text-gray-600 dark:text-gray-300">Smooth is fast.</p>
                             </div>
                        </div>

                        <button onClick={onComplete} className="w-full py-4 bg-green-500 text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-green-600 hover:scale-105 transition transform flex items-center justify-center gap-2">
                            I'm Ready <ArrowRight />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
