
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, DocumentData } from 'firebase/firestore';
import { db, appId } from '../lib/firebase';
import { useTranslation } from '../lib/i18n';
import { getUserRank } from '../lib/data';
import { RankLogo } from '../components/RankLogo';
import { SlothMascot } from '../components/SlothMascot';

export default function LeaderboardView() {
    const { t } = useTranslation();
    const [leaderboard, setLeaderboard] = useState<(DocumentData & {id: string})[]>([]);

    useEffect(() => {
        const q = query(collection(db, `artifacts/${appId}/public/data/leaderboard`));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const leaders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            leaders.sort((a, b) => (b['points'] || 0) - (a['points'] || 0));
            setLeaderboard(leaders.slice(0, 10));
        }, (error) => console.error("Error fetching leaderboard:", error));
        return () => unsubscribe();
    }, []);

    return (
        <div className="p-4 sm:p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white drop-shadow-sm mb-8 text-center">{t('leaderboard')}</h1>
            <div id="leaderboard-table" className="glass-panel rounded-3xl shadow-2xl overflow-hidden border-2 border-white/40">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="p-4 text-sm font-bold text-gray-800 dark:text-gray-300 uppercase tracking-wider text-center">#</th>
                                <th className="p-4 text-sm font-bold text-gray-800 dark:text-gray-300 uppercase tracking-wider">User</th>
                                <th className="p-4 text-sm font-bold text-gray-800 dark:text-gray-300 uppercase tracking-wider text-right">Score</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
                            {leaderboard.map((user, index) => {
                                const rank = getUserRank(user.points || 0);
                                let rankColor = "text-gray-600 dark:text-gray-400";
                                if (index === 0) rankColor = "text-yellow-500 text-2xl";
                                if (index === 1) rankColor = "text-gray-400 text-xl";
                                if (index === 2) rankColor = "text-orange-400 text-xl";

                                return (
                                    <tr key={user.id} className={`hover:bg-white/40 dark:hover:bg-gray-700/40 transition ${index < 3 ? 'bg-white/20 dark:bg-gray-700/20' : ''}`}>
                                        <td className={`p-4 font-bold text-center ${rankColor}`}>
                                            {index + 1}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-gray-700 flex-shrink-0 overflow-hidden border border-blue-200 dark:border-gray-600">
                                                     {/* Show Sloth Mascot Head if outfit exists, else fallback to first char or PFP */}
                                                     {user.equippedOutfit ? (
                                                         <SlothMascot className="w-full h-full transform scale-125 translate-y-1" outfit={user.equippedOutfit} />
                                                     ) : (
                                                         <img src={user.pfp || `https://placehold.co/40x40/A0846D/F5EFE6?text=${user.name?.[0] || 'U'}`} alt={user.name} className="w-full h-full object-cover" />
                                                     )}
                                                </div>
                                                <div className="ms-3">
                                                    <p className="font-bold text-gray-900 dark:text-gray-100">{user.name || t('anonymousUser')}</p>
                                                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                                        <RankLogo rank={rank.name} className="w-3 h-3" />
                                                        <span>{t(rank.name)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right font-bold text-teal-600 dark:text-teal-400 text-lg">
                                            {user.points || 0} pts
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
