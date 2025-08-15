/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, appId } from '../../lib/firebase';
import { useTranslation } from '../../lib/i18n';
import type { UserProfile, Call } from '../../types';
import { Phone, RefreshCw } from 'lucide-react';

export default function TeachingRequestsView({ currentUser, onAcceptCall }: { currentUser: UserProfile, onAcceptCall: (call: Call) => void }) {
    const { t } = useTranslation();
    const [requests, setRequests] = useState<Call[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const unsubscribeRef = useRef(null);

    const fetchRequests = useCallback(() => {
        if (unsubscribeRef.current) {
            unsubscribeRef.current();
        }

        if (!currentUser || currentUser.role !== 'teacher') {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        const callsRef = collection(db, `artifacts/${appId}/users/${currentUser.uid}/calls`);
        const q = query(callsRef, where('status', '==', 'ringing'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const callRequests = snapshot.docs.map(doc => doc.data() as Call);
            setRequests(callRequests);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching teaching requests:", error);
            setIsLoading(false);
        });

        unsubscribeRef.current = unsubscribe;
    }, [currentUser]);

    useEffect(() => {
        fetchRequests();
        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
            }
        };
    }, [fetchRequests]);

    const handleRefresh = () => {
        fetchRequests();
    };


    if (isLoading && requests.length === 0) {
        return <div className="p-8 text-center dark:text-gray-300"><p>{t('loading')}</p></div>;
    }

    return (
        <div className="p-4 sm:p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">{t('teachingRequests')}</h1>
                    <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">{t('teachingRequestsDescription')}</p>
                </div>
                <button onClick={handleRefresh} className="p-3 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition" aria-label={t('refresh')}>
                    <RefreshCw className={`w-6 h-6 text-gray-700 dark:text-gray-300 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
            </div>


            {requests.length === 0 ? (
                <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
                    <p className="text-gray-500 dark:text-gray-400">{t('noTeachingRequests')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {requests.map(call => (
                        <div key={call.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg flex flex-col items-center text-center animate-pulse-slow">
                            <img src={call.callerPfp || `https://placehold.co/96x96`} alt={call.callerName} className="w-24 h-24 rounded-full mb-4 border-4 border-teal-300" />
                            <h3 className="text-xl font-bold dark:text-gray-100">{call.callerName}</h3>
                            <p className="text-teal-600 font-semibold text-sm mb-4">Calling...</p>
                            <button onClick={() => onAcceptCall(call)} className="mt-auto w-full bg-green-500 text-white font-bold py-3 rounded-lg hover:bg-green-600 transition flex items-center justify-center gap-2">
                                <Phone size={18} /> {t('acceptCall')}
                            </button>
                        </div>
                    ))}
                </div>
            )}
             <style>{`
              @keyframes pulse-slow {
                50% {
                  box-shadow: 0 0 0 10px rgba(20, 184, 166, 0.2), 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
                }
              }
              .dark .animate-pulse-slow {
                50% {
                  box-shadow: 0 0 0 10px rgba(45, 212, 191, 0.2), 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
                }
              }
              .animate-pulse-slow {
                animation: pulse-slow 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
              }
            `}</style>
        </div>
    );
}