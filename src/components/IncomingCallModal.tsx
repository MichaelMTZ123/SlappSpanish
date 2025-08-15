/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { useTranslation } from '../lib/i18n';
import type { Call } from '../types';
import { Phone, PhoneOff } from 'lucide-react';

export const IncomingCallModal = ({ call, onAccept, onDecline }: { call: Call, onAccept: (call: Call) => void, onDecline: (call: Call) => void }) => {
    const { t } = useTranslation();

    if (!call) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm text-center p-8 animate-fade-in-up">
                <img src={call.callerPfp} alt={call.callerName} className="w-24 h-24 rounded-full mx-auto border-4 border-teal-400" />
                <h2 className="text-2xl font-bold mt-4 dark:text-gray-100">{t('incomingCallFrom')}</h2>
                <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">{call.callerName}</p>

                <div className="flex justify-center space-x-6">
                    <button
                        onClick={() => onDecline(call)}
                        className="flex flex-col items-center justify-center w-20 h-20 bg-red-500 text-white rounded-full hover:bg-red-600 transition-transform hover:scale-110"
                        aria-label={t('decline')}
                    >
                        <PhoneOff size={32} />
                    </button>
                    <button
                        onClick={() => onAccept(call)}
                        className="flex flex-col items-center justify-center w-20 h-20 bg-green-500 text-white rounded-full hover:bg-green-600 transition-transform hover:scale-110"
                        aria-label={t('accept')}
                    >
                        <Phone size={32} />
                    </button>
                </div>
            </div>
        </div>
    );
};