
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import SelfPacedLessonsView from './SelfPacedLessonsView';
import OnlineLearningView from './OnlineLearningView';
import { useTranslation } from '../../lib/i18n';
import type { UserProfile, Lesson } from '../../types';
import { Users, BookCopy } from 'lucide-react';

export default function LearnHub({ 
    onSelectLesson, 
    completedLessons, 
    currentUser, 
    onInitiateCall,
    currentCourseId,
    onCourseChange 
}: { 
    onSelectLesson: (lesson: Lesson) => void, 
    completedLessons: string[], 
    currentUser: UserProfile, 
    onInitiateCall: (teacher: any) => void,
    currentCourseId: string,
    onCourseChange: (courseId: string) => void
}) {
    const { t } = useTranslation();
    const [view, setView] = useState('hub'); // 'hub', 'lessons', 'online'

    if (view === 'lessons') {
        return <SelfPacedLessonsView 
            onSelectLesson={onSelectLesson} 
            completedLessons={completedLessons} 
            onBack={() => setView('hub')} 
            currentCourseId={currentCourseId}
            onCourseChange={onCourseChange}
        />;
    }
    if (view === 'online') {
        return <OnlineLearningView currentUser={currentUser} onBack={() => setView('hub')} onInitiateCall={onInitiateCall} />;
    }

    return (
        <div className="p-4 sm:p-8 h-full flex flex-col items-center justify-center">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white drop-shadow-sm mb-4 text-center">{t('learning')} Hub</h1>
            <p className="text-lg text-gray-700 dark:text-gray-200 mb-12 text-center font-bold">Choose your path to fluency.</p>
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
                <div onClick={() => setView('online')} className="glass-panel p-8 rounded-3xl shadow-xl cursor-pointer hover:scale-105 transition-transform flex flex-col items-center text-center border-2 border-white/40">
                    <div className="p-6 bg-teal-100 dark:bg-teal-900/50 rounded-full mb-6 shadow-inner">
                        <Users className="w-16 h-16 text-teal-600 dark:text-teal-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('onlineLearning')}</h2>
                    <p className="text-gray-700 dark:text-gray-300 mt-2">{t('learnFromPeers')}</p>
                </div>
                <div onClick={() => setView('lessons')} className="glass-panel p-8 rounded-3xl shadow-xl cursor-pointer hover:scale-105 transition-transform flex flex-col items-center text-center border-2 border-white/40">
                     <div className="p-6 bg-blue-100 dark:bg-blue-900/50 rounded-full mb-6 shadow-inner">
                        <BookCopy className="w-16 h-16 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('selfPacedLessons')}</h2>
                    <p className="text-gray-700 dark:text-gray-300 mt-2">{t('browseLessons')}</p>
                </div>
            </div>
        </div>
    );
}
