
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { useTranslation } from '../lib/i18n';
import { shopItems } from '../lib/data';
import { ShoppingBag, Check } from 'lucide-react';
import type { UserProfile } from '../types';

export default function ShopView({ userProfile, onBuy, onEquip }: { userProfile: UserProfile, onBuy: (cost: number, id: string) => void, onEquip: (id: string) => void }) {
    const { t } = useTranslation();

    return (
        <div className="p-4 sm:p-8 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 dark:text-white drop-shadow-sm flex items-center gap-3">
                    <ShoppingBag className="text-indigo-500" size={40}/> {t('slothShop')}
                </h1>
                <div className="glass-panel px-6 py-2 rounded-full flex items-center gap-2 shadow-md">
                    <span className="text-2xl">🪙</span>
                    <span className="text-xl font-bold text-yellow-600 dark:text-yellow-400">{userProfile.coins}</span>
                </div>
            </div>

            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 font-medium">{t('spendCoins')}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {shopItems.map(item => {
                    const isOwned = userProfile.inventory?.includes(item.id);
                    const isEquipped = userProfile.equippedOutfit === item.id;
                    const canAfford = userProfile.coins >= item.price;

                    return (
                        <div key={item.id} className="glass-panel p-6 rounded-3xl shadow-lg flex flex-col items-center relative overflow-hidden transition-transform hover:scale-105">
                            <div className="text-6xl mb-4 drop-shadow-lg">{item.icon}</div>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">{item.name}</h3>
                            <span className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-4 bg-white/50 dark:bg-gray-700/50 px-2 py-1 rounded-md">{item.type}</span>
                            
                            <div className="mt-auto w-full">
                                {isOwned ? (
                                    item.type === 'outfit' ? (
                                        <button 
                                            onClick={() => onEquip(item.id)}
                                            disabled={isEquipped}
                                            className={`w-full py-3 rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2 ${isEquipped ? 'bg-green-500 text-white cursor-default' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300'}`}
                                        >
                                            {isEquipped ? <><Check size={18}/> {t('equipped')}</> : t('equip')}
                                        </button>
                                    ) : (
                                        <button disabled className="w-full py-3 bg-gray-200 dark:bg-gray-700 text-gray-500 rounded-xl font-bold cursor-default">
                                            {t('owned')}
                                        </button>
                                    )
                                ) : (
                                    <button 
                                        onClick={() => onBuy(item.price, item.id)}
                                        disabled={!canAfford}
                                        className={`w-full py-3 rounded-xl font-bold shadow-md transition-all ${canAfford ? 'bg-indigo-500 text-white hover:bg-indigo-600' : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'}`}
                                    >
                                        {t('buy')} - {item.price} 🪙
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
