

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
        <div className="p-4 sm:p-8">
            <button onClick={onBack} className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-50 mb-6 font-semibold">
                <ArrowLeft size={20} /> Back to Learning Hub
            </button>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">{t('findATeacher')}</h1>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-300 mb-8">{t('availableTeachers')}</p>
            
            {isLoading ? (
                <p className="dark:text-gray-300">{t('loading')}...</p>
            ) : teachers.length === 0 ? (
                <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
                    <p className="text-gray-500 dark:text-gray-400">{t('noTeachersAvailable')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teachers.map(teacher => (
                        <div key={teacher.uid} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg flex flex-col items-center text-center">
                            <img src={teacher.pfp || `https://placehold.co/96x96`} alt={teacher.name} className="w-24 h-24 rounded-full mb-4 border-4 border-green-300" />
                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{teacher.name}</h3>
                            <p className="text-green-600 font-semibold text-sm mb-4">Online</p>
                            <button onClick={() => handleCallTeacher(teacher)} className="mt-auto w-full bg-teal-500 text-white font-bold py-3 rounded-lg hover:bg-teal-600 transition flex items-center justify-center gap-2">
                                <Phone size={18} /> {t('startCall')}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}