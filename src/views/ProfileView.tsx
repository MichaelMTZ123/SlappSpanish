
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useRef } from 'react';
import { useTranslation } from '../lib/i18n';
import { getUserRank, getNextRank } from '../lib/data';
import { RankLogo } from '../components/RankLogo';
import { Modal } from '../components/Modal';
import { SlothMascot } from '../components/SlothMascot';

export default function ProfileView({ user, userProfile, onUpdateProfile, onSignOut, onDeleteAccount }) {
    const { t, language, setLanguage } = useTranslation();
    const [name, setName] = useState(userProfile.name || '');
    const [pfp, setPfp] = useState(userProfile.pfp || '');
    const [role, setRole] = useState(userProfile.role || 'learner');
    const [isAvailable, setIsAvailable] = useState(userProfile.isAvailableForCalls || false);
    const fileInputRef = useRef(null);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    
    const currentRank = getUserRank(userProfile.points);
    const nextRank = getNextRank(userProfile.points);
    
    let progressPercentage = 100;
    if (nextRank) {
        const pointsInCurrentRank = userProfile.points - currentRank.points;
        const pointsForNextRank = nextRank.points - currentRank.points;
        progressPercentage = (pointsInCurrentRank / pointsForNextRank) * 100;
    }
    
    const handleSave = () => {
        onUpdateProfile({ ...userProfile, name, pfp, language, role, isAvailableForCalls: role === 'teacher' ? isAvailable : false });
    };

    const handlePfpChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onloadend = () => { setPfp(reader.result as string); };
            reader.readAsDataURL(file);
        }
    };
    
    const handleDeleteConfirm = () => {
        onDeleteAccount();
        setDeleteModalOpen(false);
    };

    return (
        <div className="p-4 sm:p-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">{t('myProfile')}</h1>
            <div className="glass-panel p-8 rounded-3xl shadow-2xl max-w-lg mx-auto border border-white/60">
                <div className="flex flex-col items-center">
                    
                    {/* Avatar Area */}
                    <div className="relative mb-6 group cursor-pointer" onClick={() => fileInputRef.current.click()}>
                        <div className="w-40 h-40 rounded-full bg-gradient-to-b from-blue-200 to-blue-50 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center shadow-inner overflow-hidden border-4 border-white dark:border-gray-600">
                            {/* If user has a real PFP uploaded, show it, otherwise show Mascot */}
                             <SlothMascot className="w-32 h-32 mt-4 drop-shadow-md transition-transform group-hover:scale-110" outfit={userProfile.equippedOutfit} />
                        </div>
                        <div className="absolute bottom-0 right-0 bg-teal-500 p-2 rounded-full text-white shadow-md border-2 border-white">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handlePfpChange} accept="image/*" className="hidden"/>
                    </div>
                    
                    <div className="mt-2 w-full">
                        <h3 className="text-xl font-bold text-center dark:text-gray-100">{t('yourRank')}</h3>
                        <div className="flex items-center justify-center gap-2 mt-2 p-3 bg-white/50 dark:bg-gray-700/50 rounded-xl">
                            <RankLogo rank={currentRank.name} className="w-10 h-10" />
                            <span className="text-2xl font-extrabold text-teal-600 dark:text-teal-400 uppercase tracking-wide">{t(currentRank.name)}</span>
                        </div>
                        {nextRank && (
                            <div className="mt-3 text-center">
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 shadow-inner overflow-hidden">
                                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                                </div>
                                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-1">{userProfile.points} / {nextRank.points} {t('points')}</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 w-full space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t('displayName')}</label>
                            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t('changeLanguage')}</label>
                            <div className="flex rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-600">
                                <button onClick={() => setLanguage('en')} className={`flex-1 py-2 font-bold transition-colors ${language === 'en' ? 'bg-teal-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50'}`}>English</button>
                                <button onClick={() => setLanguage('he')} className={`flex-1 py-2 font-bold transition-colors ${language === 'he' ? 'bg-teal-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50'}`}>עברית</button>
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t('setYourRole')}</label>
                            <div className="flex rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-600">
                                <button onClick={() => setRole('learner')} className={`flex-1 py-2 font-bold transition-colors ${role === 'learner' ? 'bg-indigo-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50'}`}>{t('learner')}</button>
                                <button onClick={() => setRole('teacher')} className={`flex-1 py-2 font-bold transition-colors ${role === 'teacher' ? 'bg-indigo-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50'}`}>{t('teacher')}</button>
                            </div>
                        </div>

                        {role === 'teacher' && (
                            <div className="flex justify-between items-center bg-green-50 dark:bg-green-900/30 p-4 rounded-xl border border-green-200 dark:border-green-800">
                                <label htmlFor="availability-toggle" className="font-bold text-green-800 dark:text-green-200 select-none cursor-pointer">{t('availableForCalls')}</label>
                                <div className="relative inline-block w-12 align-middle select-none">
                                    <input type="checkbox" id="availability-toggle" checked={isAvailable} onChange={() => setIsAvailable(!isAvailable)} className="absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer transition-transform duration-200 ease-in-out checked:right-0 checked:bg-green-500"/>
                                    <label htmlFor="availability-toggle" className="block overflow-hidden h-6 rounded-full bg-gray-300 dark:bg-gray-600 cursor-pointer"></label>
                                </div>
                            </div>
                        )}
                    </div>


                    <button onClick={handleSave} className="mt-8 w-full bg-gradient-to-r from-teal-500 to-green-500 text-white font-bold py-4 rounded-xl shadow-lg hover:scale-[1.02] transition transform">{t('saveChanges')}</button>
                    
                    <div className="flex gap-4 w-full mt-4">
                         <button onClick={onSignOut} className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold py-3 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition">{t('signOut')}</button>
                         <button onClick={() => setDeleteModalOpen(true)} className="flex-1 bg-red-100 text-red-600 font-bold py-3 rounded-xl hover:bg-red-200 transition">{t('deleteAccount')}</button>
                    </div>
                </div>
            </div>
            
            <Modal isOpen={isDeleteModalOpen} onClose={() => setDeleteModalOpen(false)} title={t('deleteAccount')}>
                <p className="dark:text-gray-300">{t('confirmDelete')}</p>
                <div className="flex justify-end gap-4 mt-6">
                    <button onClick={() => setDeleteModalOpen(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">{t('cancel')}</button>
                    <button onClick={handleDeleteConfirm} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">{t('confirm')}</button>
                </div>
            </Modal>
        </div>
    );
}