
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { useTranslation } from '../lib/i18n';
import { allLessons } from '../lib/data';
import { SlothMascot } from '../components/SlothMascot';
import { Zap, Trophy, Users, Library, ShoppingBag, PlayCircle } from 'lucide-react';
import { DailyQuests } from '../components/DailyQuests';

export default function HomeView({ userProfile, onSelectLesson, setPage, onStartTour }) {
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
        <div className="p-4 sm:p-8 max-w-5xl mx-auto">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 dark:text-white drop-shadow-sm">{getGreeting()}, {userProfile.name}!</h1>
                    <p className="mt-2 text-lg text-gray-700 dark:text-gray-200 font-bold">{t('readyToLearn')}</p>
                </div>
                <SlothMascot className="w-24 h-24 sm:w-32 sm:h-32 drop-shadow-2xl animate-float" />
            </div>
            
            {/* Presentation Button */}
            <div className="mb-8">
                <button 
                    onClick={onStartTour}
                    className="w-full bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-white p-4 rounded-2xl shadow-xl hover:scale-[1.01] transition-transform flex items-center justify-center gap-3 relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                    <PlayCircle size={32} className="animate-pulse" />
                    <span className="text-xl sm:text-2xl font-extrabold tracking-wide drop-shadow-md">
                        {t('welcomePresentation')}
                    </span>
                    <SlothMascot className="w-10 h-10 absolute right-4 top-1/2 -translate-y-1/2" outfit="crown"/>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Main Actions */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Next Lesson Card */}
                    {nextLesson ? (
                        <div className="glass-panel p-8 rounded-3xl shadow-xl border-l-8 border-teal-500 relative overflow-hidden group cursor-pointer transition-transform hover:scale-[1.02]" onClick={() => onSelectLesson(nextLesson)}>
                            <div className="absolute top-0 right-0 w-40 h-40 bg-teal-500/10 rounded-bl-full z-0 transition-transform group-hover:scale-110"></div>
                            <div className="relative z-10">
                                <h2 className="text-xl font-bold text-teal-700 dark:text-teal-300 uppercase tracking-wider mb-1">{t('continueLearning')}</h2>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{nextLesson.title}</p>
                                <button className="bg-teal-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:bg-teal-600 transition-all flex items-center gap-2">
                                    {t('startLesson')} →
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="glass-panel p-8 rounded-3xl shadow-xl text-center">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('allLessonsComplete')}</h2>
                            <p className="text-gray-700 dark:text-gray-300 mt-2">{t('legendMessage')}</p>
                        </div>
                    )}

                    {/* Stats Grid */}
                    <div id="home-stats" className="grid grid-cols-2 gap-6">
                        <div className="glass-panel p-6 rounded-3xl shadow-lg flex flex-col items-center justify-center text-center">
                            <Zap className="w-10 h-10 text-yellow-500 mb-2" />
                            <span className="text-4xl font-bold text-gray-900 dark:text-white">{userProfile.streak || 0}</span>
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">{t('dailyStreak')}</span>
                        </div>
                         <div className="glass-panel p-6 rounded-3xl shadow-lg flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white/40 transition" onClick={() => setPage('shop')}>
                            <ShoppingBag className="w-10 h-10 text-indigo-500 mb-2" />
                            <span className="text-4xl font-bold text-gray-900 dark:text-white">{userProfile.coins || 0}</span>
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">{t('coins')}</span>
                        </div>
                    </div>
                </div>

                {/* Right Column: Quests & Social */}
                <div className="space-y-8">
                    <DailyQuests quests={userProfile.dailyQuests || []} />

                    {/* Quick Links */}
                    <div className="glass-panel p-6 rounded-3xl shadow-lg">
                        <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">{t('quickAccess')}</h3>
                        <div className="space-y-3">
                            <button onClick={() => setPage('chat')} className="w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md hover:scale-105 transition">
                                <div className="bg-white/20 p-2 rounded-lg"><SlothMascot className="w-6 h-6"/></div>
                                <span className="font-bold">{t('chatWithSlappy')}</span>
                            </button>
                            <button onClick={() => setPage('friends')} className="w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md hover:scale-105 transition">
                                <div className="bg-white/20 p-2 rounded-lg"><Users size={20}/></div>
                                <span className="font-bold">{t('myFriends')}</span>
                            </button>
                             <button onClick={() => setPage('community')} className="w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md hover:scale-105 transition">
                                <div className="bg-white/20 p-2 rounded-lg"><Library size={20}/></div>
                                <span className="font-bold">{t('communityHub')}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
