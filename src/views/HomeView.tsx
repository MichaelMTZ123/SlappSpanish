/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { useTranslation } from '../lib/i18n';
import { allLessons } from '../lib/data';
import { SlothMascot } from '../components/SlothMascot';
import { Zap, Trophy, Users, Library } from 'lucide-react';

export default function HomeView({ userProfile, onSelectLesson, setPage }) {
    const { t } = useTranslation();
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return t('goodMorning');
        if (hour < 18) return t('goodAfternoon');
        return t('goodEvening');
    };

    const findNextLesson = () => {
        const completedIds = userProfile.completedLessons || [];
        return allLessons.find(lesson => !completedIds.includes(lesson.id));
    };

    const nextLesson = findNextLesson();

    return (
        <div className="p-4 sm:p-8 text-gray-800 dark:text-gray-100">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-50">{getGreeting()}, {userProfile.name || 'Learner'}!</h1>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">{t('readyToLearn')}</p>

            {nextLesson && (
                 <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-teal-600 dark:text-teal-400">{t('continueLearning')}</h2>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">{t('nextStep')} "{nextLesson.title}".</p>
                    <button onClick={() => onSelectLesson(nextLesson)} className="mt-4 bg-teal-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-teal-600 transition">
                        {t('startLesson')}
                    </button>
                </div>
            )}

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold flex items-center"><Zap className="me-2 text-yellow-500" /> {t('dailyStreak')}</h2>
                    <div className="mt-4 text-center">
                        <p className="text-6xl font-bold text-orange-500">{userProfile.streak || 0}</p>
                        <p className="text-gray-600 dark:text-gray-400">{t('daysInARow')}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold flex items-center"><Trophy className="me-2 text-blue-500" /> {t('points')}</h2>
                    <div className="mt-4 text-center">
                        <p className="text-6xl font-bold text-blue-500">{userProfile.points || 0}</p>
                        <p className="text-gray-600 dark:text-gray-400">{t('pointsEarned')}</p>
                    </div>
                </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 <div className="bg-gradient-to-br from-green-400 to-teal-500 p-6 rounded-2xl shadow-xl text-white flex items-center gap-6 cursor-pointer hover:scale-105 transition-transform" onClick={() => setPage('chat')}>
                    <SlothMascot className="w-24 h-24 flex-shrink-0" />
                    <div>
                        <h3 className="text-2xl font-bold">{t('chatWithSlappy')}</h3>
                        <p className="mt-1">{t('slappyEncouragement')}</p>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-indigo-400 to-purple-500 p-6 rounded-2xl shadow-xl text-white flex items-center gap-6 cursor-pointer hover:scale-105 transition-transform" onClick={() => setPage('friends')}>
                    <Users className="w-24 h-24 flex-shrink-0" />
                    <div>
                        <h3 className="text-2xl font-bold">{t('myFriends')}</h3>
                        <p className="mt-1">{t('connectAndChat')}</p>
                    </div>
                </div>
                 <div className="bg-gradient-to-br from-pink-400 to-red-500 p-6 rounded-2xl shadow-xl text-white flex items-center gap-6 cursor-pointer hover:scale-105 transition-transform" onClick={() => setPage('community')}>
                    <Library className="w-24 h-24 flex-shrink-0" />
                    <div>
                        <h3 className="text-2xl font-bold">{t('communityHub')}</h3>
                        <p className="mt-1">{t('createAndPlayQuizzes')}</p>
                    </div>
                </div>
            </div>

        </div>
    );
}