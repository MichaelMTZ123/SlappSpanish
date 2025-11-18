
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, appId } from '../../lib/firebase';
import { useTranslation } from '../../lib/i18n';
import type { UserProfile } from '../../types';
import { Phone, ArrowLeft } from 'lucide-react';

export default function OnlineLearningView({ currentUser, onBack, onInitiateCall }: { currentUser: UserProfile, onBack: () => void, onInitiateCall: (teacher: any) => void }) {
    const { t } = useTranslation();
    const [teachers, setTeachers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, `artifacts/${appId}/public/data/leaderboard`), where('role', '==', 'teacher'), where('isAvailableForCalls', '==', true));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const availableTeachers = snapshot.docs
                .map(doc => ({ uid: doc.id, ...doc.data() }))
                .filter(teacher => teacher.uid !== currentUser.uid); // Can't call yourself
            setTeachers(availableTeachers);
            setIsLoading(false);
        }, (error) => {
            // This error is likely due to incorrect Firestore rules.
            console.error("Error fetching teachers list:", error);
            setIsLoading(false);
        });
        
        return unsubscribe;
    }, [currentUser.uid]);
    
    const handleCallTeacher = (teacher) => {
        onInitiateCall(teacher);
    }

    return (
        <div className="p-4 sm:p-8 max-w-5xl mx-auto">
            <button onClick={onBack} className="flex items-center gap-2 text-gray-800 dark:text-white hover:text-gray-600 mb-6 font-bold bg-white/40 dark:bg-black/20 p-2 rounded-lg inline-block transition backdrop-blur-sm">
                <ArrowLeft size={20} /> Back to Learning Hub
            </button>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white drop-shadow-md">{t('findATeacher')}</h1>
            <p className="mt-2 text-lg text-gray-700 dark:text-gray-200 mb-8 font-medium">{t('availableTeachers')}</p>
            
            {isLoading ? (
                <p className="text-gray-800 dark:text-white font-bold">{t('loading')}...</p>
            ) : teachers.length === 0 ? (
                <div className="text-center py-10 glass-panel rounded-3xl shadow-lg">
                    <p className="text-gray-600 dark:text-gray-300 font-medium">{t('noTeachersAvailable')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teachers.map(teacher => (
                        <div key={teacher.uid} className="glass-panel p-6 rounded-3xl shadow-lg flex flex-col items-center text-center border-2 border-white/50 transition hover:scale-[1.02]">
                            <img src={teacher.pfp || `https://placehold.co/96x96`} alt={teacher.name} className="w-24 h-24 rounded-full mb-4 border-4 border-green-400 object-cover shadow-md" />
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{teacher.name}</h3>
                            <p className="text-green-600 font-extrabold text-sm mb-4 bg-green-100 px-3 py-1 rounded-full mt-2">Online</p>
                            <button onClick={() => handleCallTeacher(teacher)} className="mt-auto w-full bg-teal-500 text-white font-bold py-3 rounded-xl hover:bg-teal-600 transition flex items-center justify-center gap-2 shadow-md">
                                <Phone size={18} /> {t('startCall')}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
