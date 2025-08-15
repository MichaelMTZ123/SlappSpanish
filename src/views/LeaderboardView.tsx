

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
        <div className="p-4 sm:p-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">{t('leaderboard')}</h1>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {leaderboard.map((user, index) => {
                        const rank = getUserRank(user.points || 0);
                        return (
                            <li key={user.id} className="p-4 flex items-center justify-between">
                                <div className="flex items-center">
                                    <span className={`text-lg font-bold w-8 text-center ${index < 3 ? 'text-yellow-500' : 'text-gray-500 dark:text-gray-400'}`}>{index + 1}</span>
                                    <img src={user.pfp || `https://placehold.co/40x40/A0846D/F5EFE6?text=${user.name?.[0] || 'U'}`} alt={user.name} className="w-10 h-10 rounded-full ms-4 object-cover" />
                                    <div className="ms-4">
                                       <span className="font-semibold text-gray-900 dark:text-gray-50">{user.name || t('anonymousUser')}</span>
                                       <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                            <RankLogo rank={rank.name} className="w-4 h-4 me-1" />
                                            <span>{t(rank.name)}</span>
                                       </div>
                                    </div>
                                </div>
                                <span className="font-bold text-blue-500">{user.points || 0} pts</span>
                            </li>
                        )
                    })}
                </ul>
            </div>
        </div>
    );
}