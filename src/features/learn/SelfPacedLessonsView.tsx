
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { useTranslation } from '../../lib/i18n';
import { courses } from '../../lib/data';
import { Check, Star, Lock, ArrowLeft } from 'lucide-react';

export default function SelfPacedLessonsView({ onSelectLesson, completedLessons, onBack, currentCourseId, onCourseChange }) {
    const { t } = useTranslation();
    
    // Get current course or default to Spanish
    const course = courses[currentCourseId] || courses['spanish'];

    const isLessonCompleted = (id) => completedLessons.includes(id);
    const isLessonLocked = (unitIndex, lessonIndex) => {
        // The first lesson of the first unit is always unlocked
        if (unitIndex === 0 && lessonIndex === 0) return false;
        
        // Previous lesson in same unit
        if (lessonIndex > 0) {
            const prevLessonId = course.units[unitIndex].lessons[lessonIndex - 1].id;
            return !completedLessons.includes(prevLessonId);
        }
        
        // First lesson of a new unit: check if last lesson of previous unit is done
        if (unitIndex > 0) {
            const prevUnit = course.units[unitIndex - 1];
            const lastLessonPrevUnit = prevUnit.lessons[prevUnit.lessons.length - 1];
            return !completedLessons.includes(lastLessonPrevUnit.id);
        }
        return true;
    };

    return (
        <div className="p-4 sm:p-8 max-w-2xl mx-auto">
            {/* Header with Course Switcher */}
            <div className="flex justify-between items-center mb-8 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-md">
                <button onClick={onBack} className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-teal-600 transition">
                    <ArrowLeft size={20} />
                </button>
                
                <div className="flex items-center gap-4">
                    <span className="text-gray-500 dark:text-gray-400 font-medium">Learning:</span>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => onCourseChange('spanish')} 
                            className={`px-3 py-1 rounded-full border-2 transition flex items-center gap-1 ${currentCourseId === 'spanish' ? 'border-teal-500 bg-teal-50 text-teal-700 font-bold' : 'border-gray-200 text-gray-500'}`}
                        >
                            <span>🇪🇸</span> Spanish
                        </button>
                        <button 
                            onClick={() => onCourseChange('english')} 
                            className={`px-3 py-1 rounded-full border-2 transition flex items-center gap-1 ${currentCourseId === 'english' ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-bold' : 'border-gray-200 text-gray-500'}`}
                        >
                            <span>🇺🇸</span> English
                        </button>
                    </div>
                </div>
            </div>

            <div className="space-y-12 pb-20">
                {course.units.map((unit, unitIndex) => (
                    <div key={unit.id} className="relative">
                        {/* Unit Header */}
                        <div className={`bg-${unit.color}-500 text-white p-4 rounded-xl mb-8 shadow-lg flex justify-between items-center`}>
                            <div>
                                <h2 className="text-xl font-bold">{unit.title}</h2>
                                <p className="text-sm opacity-80">Unit {unitIndex + 1}</p>
                            </div>
                            <Star className="text-yellow-300 fill-current" />
                        </div>

                        {/* The Path */}
                        <div className="flex flex-col items-center space-y-6">
                            {unit.lessons.map((lesson, index) => {
                                const locked = isLessonLocked(unitIndex, index);
                                const completed = isLessonCompleted(lesson.id);
                                
                                // Calculate Offset for "Winding Path" feel
                                const offset = Math.sin(index) * 40; 
                                
                                return (
                                    <div key={lesson.id} className="relative flex flex-col items-center z-10" style={{ transform: `translateX(${offset}px)` }}>
                                        {/* Connector Line (Visual Only) */}
                                        {index < unit.lessons.length - 1 && (
                                            <div className="absolute top-16 w-1 h-8 bg-gray-300 dark:bg-gray-600 -z-10" />
                                        )}
                                        
                                        <button
                                            onClick={() => !locked && onSelectLesson(lesson)}
                                            disabled={locked}
                                            className={`
                                                w-20 h-20 rounded-full flex items-center justify-center border-b-4 transition-all transform duration-200
                                                ${locked 
                                                    ? 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-400 cursor-not-allowed' 
                                                    : completed 
                                                        ? 'bg-yellow-400 border-yellow-600 text-white hover:scale-110 cursor-pointer shadow-xl'
                                                        : `bg-${unit.color}-500 border-${unit.color}-700 text-white hover:scale-110 cursor-pointer shadow-xl`
                                                }
                                            `}
                                        >
                                            {locked ? <Lock size={24} /> : completed ? <Check size={32} /> : <Star size={28} fill="white" />}
                                        </button>
                                        
                                        {/* Lesson Title Bubble */}
                                        <div className={`mt-2 px-3 py-1 rounded-lg text-xs font-bold text-center max-w-[120px] ${locked ? 'text-gray-400' : 'bg-white dark:bg-gray-700 shadow-sm text-gray-700 dark:text-gray-200'}`}>
                                            {lesson.title}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Bottom Spacer for Mobile Nav */}
            <div className="h-10"></div>
        </div>
    );
}
