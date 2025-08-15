/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { useTranslation } from '../../lib/i18n';
import { spanishLessons } from '../../lib/data';
import { Check, ArrowLeft } from 'lucide-react';

export default function SelfPacedLessonsView({ onSelectLesson, completedLessons, onBack }) {
    const { t } = useTranslation();
    return (
    <div className="p-4 sm:p-8">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-50 mb-6 font-semibold">
            <ArrowLeft size={20} /> Back to Learning Hub
        </button>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">{t('selfPacedLessons')}</h1>
        {Object.entries(spanishLessons).map(([level, lessons]) => (
            <div key={level} className="mb-8">
                <h2 className="text-2xl font-bold capitalize text-teal-600 dark:text-teal-400 border-b-2 border-teal-200 dark:border-teal-800 pb-2 mb-4">{level}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {lessons.map(lesson => {
                        const isCompleted = completedLessons.includes(lesson.id);
                        return (
                            <div key={lesson.id} onClick={() => onSelectLesson(lesson)} className={`bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer ${isCompleted ? 'border-green-400 opacity-70' : 'border-gray-200 dark:border-gray-700'}`}>
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{lesson.title}</h3>
                                    {isCompleted && <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white"><Check size={16}/></div>}
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">{lesson.content}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        ))}
    </div>
)}