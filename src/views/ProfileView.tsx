/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useRef } from 'react';
import { useTranslation } from '../lib/i18n';
import { getUserRank, getNextRank, ranks } from '../lib/data';
import { RankLogo } from '../components/RankLogo';
import { Modal } from '../components/Modal';

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
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg max-w-md mx-auto">
                <div className="flex flex-col items-center">
                    <input type="file" ref={fileInputRef} onChange={handlePfpChange} accept="image/*" className="hidden"/>
                    <img src={pfp || `https://placehold.co/128x128/A0846D/F5EFE6?text=${name?.[0] || 'U'}`} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-teal-400 cursor-pointer" onClick={() => fileInputRef.current.click()} />
                    
                    <div className="mt-6 w-full">
                        <h3 className="text-xl font-bold text-center dark:text-gray-100">{t('yourRank')}</h3>
                        <div className="flex items-center justify-center gap-2 mt-1">
                            <RankLogo rank={currentRank.name} className="w-8 h-8 text-teal-500" />
                            <span className="text-2xl font-bold text-teal-600 dark:text-teal-400">{t(currentRank.name)}</span>
                        </div>
                        {nextRank && (
                            <div className="mt-2 text-center">
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                    <div className="bg-yellow-400 h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{userProfile.points} / {nextRank.points} {t('points')}</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-4 w-full">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('displayName')}</label>
                        <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500" />
                    </div>
                    <div className="mt-4 w-full">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('changeLanguage')}</label>
                         <div className="mt-1 flex rounded-md shadow-sm">
                            <button onClick={() => setLanguage('en')} className={`w-full py-2 px-4 border border-gray-300 dark:border-gray-600 ${language === 'en' ? 'bg-teal-500 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200'} rounded-s-md transition-colors`}>English</button>
                            <button onClick={() => setLanguage('he')} className={`w-full py-2 px-4 border border-gray-300 dark:border-gray-600 ${language === 'he' ? 'bg-teal-500 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200'} rounded-e-md transition-colors`}>עברית</button>
                        </div>
                    </div>
                    
                    <div className="mt-4 w-full">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('setYourRole')}</label>
                         <div className="mt-1 flex rounded-md shadow-sm">
                            <button onClick={() => setRole('learner')} className={`w-full py-2 px-4 border border-gray-300 dark:border-gray-600 ${role === 'learner' ? 'bg-teal-500 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200'} rounded-s-md transition-colors`}>{t('learner')}</button>
                            <button onClick={() => setRole('teacher')} className={`w-full py-2 px-4 border border-gray-300 dark:border-gray-600 ${role === 'teacher' ? 'bg-teal-500 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200'} rounded-e-md transition-colors`}>{t('teacher')}</button>
                        </div>
                    </div>

                    {role === 'teacher' && (
                        <div className="mt-4 w-full flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border dark:border-gray-600">
                            <label htmlFor="availability-toggle" className="font-medium text-gray-700 dark:text-gray-200 select-none">{t('availableForCalls')}</label>
                            <div className="relative inline-block w-10 mr-2 align-middle select-none">
                                <input type="checkbox" id="availability-toggle" checked={isAvailable} onChange={() => setIsAvailable(!isAvailable)} className="absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer transition-transform duration-200 ease-in-out checked:right-0 checked:bg-green-400"/>
                                <label htmlFor="availability-toggle" className="block overflow-hidden h-6 rounded-full bg-gray-300 dark:bg-gray-600 cursor-pointer"></label>
                            </div>
                        </div>
                    )}


                    <button onClick={handleSave} className="mt-6 w-full bg-teal-500 text-white font-bold py-3 rounded-lg hover:bg-teal-600 transition">{t('saveChanges')}</button>
                    <button onClick={onSignOut} className="mt-4 w-full bg-orange-500 text-white font-bold py-3 rounded-lg hover:bg-orange-600 transition">{t('signOut')}</button>
                    <button onClick={() => setDeleteModalOpen(true)} className="mt-4 w-full bg-red-500 text-white font-bold py-3 rounded-lg hover:bg-red-600 transition">{t('deleteAccount')}</button>
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