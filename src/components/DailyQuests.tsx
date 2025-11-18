
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { useTranslation } from '../lib/i18n';
import { CheckCircle, Circle, Target } from 'lucide-react';
import type { DailyQuest } from '../types';

export const DailyQuests = ({ quests }: { quests: DailyQuest[] }) => {
    const { t } = useTranslation();

    if (!quests || quests.length === 0) return null;

    return (
        <div className="glass-panel p-6 rounded-3xl shadow-lg border-2 border-white/30">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-4 text-gray-800 dark:text-white">
                <Target className="text-red-500" /> {t('dailyQuests')}
            </h2>
            <div className="space-y-3">
                {quests.map(quest => (
                    <div key={quest.id} className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl shadow-sm">
                        <div className="flex items-center gap-3">
                             {quest.completed ? <CheckCircle className="text-green-500" size={20}/> : <Circle className="text-gray-400" size={20}/>}
                             <div>
                                 <p className={`text-sm font-semibold ${quest.completed ? 'text-gray-500 line-through' : 'text-gray-800 dark:text-gray-200'}`}>{quest.description}</p>
                                 <div className="w-32 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-1">
                                     <div className="h-full bg-teal-500 rounded-full transition-all" style={{ width: `${(quest.current / quest.target) * 100}%` }}></div>
                                 </div>
                             </div>
                        </div>
                        <div className="text-xs font-bold text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded-lg">
                            +{quest.reward} 🪙
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
