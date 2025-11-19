
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useRef } from 'react';
import { useTranslation } from '../lib/i18n';
import { getUserRank, getNextRank, shopItems } from '../lib/data';
import { RankLogo } from '../components/RankLogo';
import { Modal } from '../components/Modal';
import { SlothMascot } from '../components/SlothMascot';
import { Shirt, UserCircle, Download } from 'lucide-react';

export default function ProfileView({ user, userProfile, onUpdateProfile, onSignOut, onDeleteAccount }) {
    const { t, language, setLanguage } = useTranslation();
    const [name, setName] = useState(userProfile.name || '');
    const [role, setRole] = useState(userProfile.role || 'learner');
    const [isAvailable, setIsAvailable] = useState(userProfile.isAvailableForCalls || false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('details'); // 'details' or 'wardrobe'
    
    const currentRank = getUserRank(userProfile.points);
    const nextRank = getNextRank(userProfile.points);
    
    // Get owned outfits including default
    const ownedOutfits = shopItems.filter(item => item.type === 'outfit' && userProfile.inventory?.includes(item.id));
    
    let progressPercentage = 100;
    if (nextRank) {
        const pointsInCurrentRank = userProfile.points - currentRank.points;
        const pointsForNextRank = nextRank.points - currentRank.points;
        progressPercentage = (pointsInCurrentRank / pointsForNextRank) * 100;
    }
    
    const handleSave = () => {
        onUpdateProfile({ ...userProfile, name, language, role, isAvailableForCalls: role === 'teacher' ? isAvailable : false });
    };

    const handleEquip = (outfitId: string | null) => {
        onUpdateProfile({ ...userProfile, equippedOutfit: outfitId });
    }
    
    const handleDeleteConfirm = () => {
        onDeleteAccount();
        setDeleteModalOpen(false);
    };

    const downloadMascot = (selector: string, filename: string) => {
        const svgElement = document.querySelector(selector);
        if (!svgElement) return;

        // Serialize the SVG to a string
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svgElement);
        const svgBlob = new Blob([svgString], {type: 'image/svg+xml;charset=utf-8'});
        const url = URL.createObjectURL(svgBlob);

        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            // High Quality Resolution
            canvas.width = 1024;
            canvas.height = 1024;
            const ctx = canvas.getContext('2d');
            if(ctx) {
                ctx.drawImage(img, 0, 0, 1024, 1024);
                const pngUrl = canvas.toDataURL('image/png');
                
                // Trigger Download
                const downloadLink = document.createElement('a');
                downloadLink.href = pngUrl;
                downloadLink.download = filename;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
            }
            URL.revokeObjectURL(url);
        };
        img.src = url;
    };

    return (
        <div className="p-4 sm:p-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-6">{t('myProfile')}</h1>
            
            <div className="max-w-lg mx-auto">
                {/* Profile Tabs */}
                <div className="flex gap-2 mb-4">
                    <button 
                        onClick={() => setActiveTab('details')} 
                        className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition ${activeTab === 'details' ? 'bg-white dark:bg-gray-700 shadow-md text-teal-600 dark:text-teal-400' : 'bg-white/40 dark:bg-gray-800/40 text-gray-500 hover:bg-white/60'}`}
                    >
                        <UserCircle size={20} /> {t('myProfile')}
                    </button>
                     <button 
                        onClick={() => setActiveTab('wardrobe')} 
                        className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition ${activeTab === 'wardrobe' ? 'bg-white dark:bg-gray-700 shadow-md text-purple-600 dark:text-purple-400' : 'bg-white/40 dark:bg-gray-800/40 text-gray-500 hover:bg-white/60'}`}
                    >
                        <Shirt size={20} /> {t('wardrobe')}
                    </button>
                </div>

                <div className="glass-panel p-8 rounded-3xl shadow-2xl border border-white/60">
                    <div className="flex flex-col items-center">
                        
                        {/* Current Avatar Display */}
                        <div id="profile-avatar" className="relative mb-6 group">
                            <div className="w-40 h-40 rounded-full bg-gradient-to-b from-blue-200 to-blue-50 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center shadow-inner overflow-hidden border-4 border-white dark:border-gray-600">
                                {userProfile.equippedOutfit || !userProfile.pfp ? (
                                    <div className="w-full h-full flex items-center justify-center">
                                         <SlothMascot className="w-32 h-32 mt-4 drop-shadow-md transition-transform hover:scale-110" outfit={userProfile.equippedOutfit} />
                                    </div>
                                ) : (
                                    <img src={userProfile.pfp} alt="User" className="w-full h-full object-cover" />
                                )}
                            </div>
                            
                            {/* Download Button */}
                            <button 
                                onClick={() => downloadMascot('#profile-avatar svg', `sloth_mascot_${userProfile.equippedOutfit || 'default'}.png`)}
                                className="absolute bottom-0 right-0 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 p-2 rounded-full shadow-md border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                                title="Download HQ PNG"
                            >
                                <Download size={16} />
                            </button>

                            {activeTab === 'wardrobe' && <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md whitespace-nowrap">{t('currentLook')}</div>}
                        </div>

                        {/* Wardrobe Content */}
                        {activeTab === 'wardrobe' && (
                            <div className="w-full animate-fade-in-up">
                                <h3 className="text-center font-bold text-gray-700 dark:text-gray-200 mb-4">Select your Sloth Style</h3>
                                <div className="grid grid-cols-3 gap-3">
                                    {/* Default Option */}
                                    <button 
                                        onClick={() => handleEquip(null)}
                                        className={`p-2 rounded-xl border-2 transition flex flex-col items-center ${!userProfile.equippedOutfit ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/30' : 'border-gray-200 dark:border-gray-700 hover:bg-white/50'}`}
                                    >
                                        <div className="w-16 h-16 overflow-hidden">
                                            <SlothMascot className="w-full h-full" />
                                        </div>
                                        <span className="text-xs font-bold mt-1">{t('default')}</span>
                                    </button>

                                    {/* Owned Outfits */}
                                    {ownedOutfits.map(item => (
                                        <button 
                                            key={item.id}
                                            onClick={() => handleEquip(item.id)}
                                            className={`p-2 rounded-xl border-2 transition flex flex-col items-center ${userProfile.equippedOutfit === item.id ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/30' : 'border-gray-200 dark:border-gray-700 hover:bg-white/50'}`}
                                        >
                                            <div className="w-16 h-16 overflow-hidden">
                                                 <SlothMascot className="w-full h-full" outfit={item.id} />
                                            </div>
                                            <span className="text-xs font-bold mt-1 truncate w-full text-center">{item.name}</span>
                                        </button>
                                    ))}
                                </div>
                                {ownedOutfits.length === 0 && (
                                    <p className="text-center text-sm text-gray-500 mt-4">{t('visitShop')}</p>
                                )}
                            </div>
                        )}
                        
                        {/* Details Content */}
                        {activeTab === 'details' && (
                            <div className="w-full animate-fade-in-up">
                                <h3 className="text-xl font-bold text-center dark:text-gray-100">{t('yourRank')}</h3>
                                <div className="flex items-center justify-center gap-2 mt-2 p-3 bg-white/50 dark:bg-gray-700/50 rounded-xl mb-6">
                                    <RankLogo rank={currentRank.name} className="w-10 h-10" />
                                    <span className="text-2xl font-extrabold text-teal-600 dark:text-teal-400 uppercase tracking-wide">{t(currentRank.name)}</span>
                                </div>

                                <div className="space-y-4">
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
                        )}
                    </div>
                </div>

                {/* Credits Section */}
                <div className="mt-12 mb-8 text-center">
                    <h3 className="text-xl font-bold text-gray-600 dark:text-gray-400 mb-6">{t('specialThanks')} / {t('credits')}</h3>
                    <div className="flex justify-center gap-8">
                        {/* Avraham Menachem */}
                        <div className="flex flex-col items-center group relative">
                             <div id="credit-avraham" className="w-24 h-24 bg-gray-100 dark:bg-gray-800/50 rounded-full flex items-center justify-center mb-2 border-2 border-gray-300 shadow-sm">
                                <SlothMascot className="w-20 h-20 mt-2" outfit="mask" />
                             </div>
                             <button 
                                onClick={() => downloadMascot('#credit-avraham svg', 'avraham_mask.png')}
                                className="absolute top-0 right-0 p-1.5 bg-white dark:bg-gray-700 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                             >
                                 <Download size={14} className="text-gray-600 dark:text-gray-200"/>
                             </button>
                             <span className="font-bold text-gray-800 dark:text-gray-200 text-sm">אברהם מנחם</span>
                        </div>

                        {/* Michael Tzahbari */}
                        <div className="flex flex-col items-center group relative">
                             <div id="credit-michael" className="w-24 h-24 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mb-2 border-2 border-purple-300 shadow-sm">
                                <SlothMascot className="w-20 h-20 mt-2" outfit="magician" />
                             </div>
                              <button 
                                onClick={() => downloadMascot('#credit-michael svg', 'michael_magician.png')}
                                className="absolute top-0 right-0 p-1.5 bg-white dark:bg-gray-700 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                             >
                                 <Download size={14} className="text-gray-600 dark:text-gray-200"/>
                             </button>
                             <span className="font-bold text-gray-800 dark:text-gray-200 text-sm">מיכאל צברי</span>
                        </div>
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
