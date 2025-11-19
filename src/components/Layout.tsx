
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { Home, BookOpen, MessageSquare, Trophy, User, Gamepad2, Users, Library, BellRing, ShoppingBag } from 'lucide-react';
import { useTranslation } from '../lib/i18n';
import { SlothMascot } from './SlothMascot';
import type { UserProfile } from '../types';

interface NavItemProps {
    icon: React.ElementType;
    label: string;
    pageName: string;
    currentPage: string;
    setPage: (page: string) => void;
    setCurrentLesson: (lesson: any) => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, pageName, currentPage, setPage, setCurrentLesson }) => {
    const { t } = useTranslation();
    return (
        <li onClick={() => { setPage(pageName); setCurrentLesson(null); }} className={`flex items-center p-3 my-1 rounded-xl cursor-pointer transition-all duration-200 ${currentPage === pageName ? 'bg-white/80 dark:bg-gray-700/80 text-blue-600 shadow-md scale-105' : 'text-gray-900 dark:text-gray-100 hover:bg-white/40 dark:hover:bg-gray-700/40 font-bold'}`}>
            <Icon className="w-6 h-6" />
            <span className="ms-4">{t(label)}</span>
        </li>
    );
};

const MobileNavItem: React.FC<NavItemProps> = ({ icon: Icon, label, pageName, currentPage, setPage, setCurrentLesson }) => {
    const { t } = useTranslation();
    return (
        <button
            onClick={() => { setPage(pageName); setCurrentLesson(null); }}
            className={`flex flex-col items-center justify-center flex-shrink-0 w-20 p-2 transition-all duration-200 rounded-xl ${
                currentPage === pageName ? 'text-blue-600 bg-blue-50/90 dark:bg-gray-800/80 shadow-sm transform -translate-y-1' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100/50'
            }`}
        >
            <Icon className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-bold">{t(label)}</span>
        </button>
    );
};

interface LayoutProps {
    children: React.ReactNode;
    page: string;
    setPage: (page: string) => void;
    setCurrentLesson: (lesson: any) => void;
    userProfile: UserProfile;
}

export const Layout: React.FC<LayoutProps> = ({ children, page, setPage, setCurrentLesson, userProfile }) => {
    const { t } = useTranslation();

    const navItems = [
        { icon: Home, label: "home", page: "home" },
        { icon: BookOpen, label: "lessons", page: "lessons" },
        { icon: MessageSquare, label: "aiPractice", page: "chat" },
        { icon: Gamepad2, label: "minigames", page: "minigames" },
        { icon: ShoppingBag, label: "shop", page: "shop" },
        { icon: Users, label: "friends", page: "friends" },
        { icon: Library, label: "community", page: "community" },
        { icon: Trophy, label: "leaderboard", page: "leaderboard" },
        { icon: User, label: "profile", page: "profile" },
    ];

    if (userProfile?.role === 'teacher') {
        const teachingRequestsItem = { icon: BellRing, label: "teachingRequests", page: "teaching-requests" };
        const lessonsIndex = navItems.findIndex(item => item.page === 'lessons');
        navItems.splice(lessonsIndex + 1, 0, teachingRequestsItem);
    }

    return (
        <div className="flex h-screen font-sans overflow-hidden relative bg-transparent">
            
            {/* Desktop Sidebar */}
            <aside className="w-72 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl m-4 rounded-3xl flex-shrink-0 hidden md:flex flex-col shadow-xl border border-white/20 dark:border-gray-700/30 z-10">
                <div className="flex items-center justify-center p-6 border-b border-gray-200/30 dark:border-gray-700/30">
                    <SlothMascot className="w-12 h-12 drop-shadow-lg" />
                    <span className="ms-3 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white drop-shadow-sm">{t('appName')}</span>
                </div>
                <nav className="flex-grow p-4 overflow-y-auto no-scrollbar">
                    <ul>
                        {navItems.map(item => (
                            <NavItem
                                key={item.page}
                                icon={item.icon}
                                label={item.label}
                                pageName={item.page}
                                currentPage={page}
                                setPage={setPage}
                                setCurrentLesson={setCurrentLesson}
                            />
                        ))}
                    </ul>
                </nav>
                <div className="p-4 border-t border-gray-200/30 dark:border-gray-700/30">
                    <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-3 flex items-center gap-3 shadow-inner backdrop-blur-md">
                        <div className="w-10 h-10 rounded-full bg-blue-100 overflow-hidden border border-white flex-shrink-0">
                            {userProfile.equippedOutfit ? (
                                <SlothMascot className="w-full h-full scale-125 translate-y-1" outfit={userProfile.equippedOutfit} />
                            ) : userProfile.pfp ? (
                                <img src={userProfile.pfp} alt="User" className="w-full h-full object-cover"/>
                            ) : (
                                <SlothMascot className="w-full h-full scale-125 translate-y-1" />
                            )}
                        </div>
                        <div className="overflow-hidden">
                            <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{userProfile.name}</p>
                            <p className="text-xs text-gray-700 dark:text-gray-300">{userProfile.coins || 0} {t('coins')}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content - Transparent background to see global animations */}
            <main className="flex-1 flex flex-col overflow-y-auto pb-24 md:pb-0 relative z-0 scroll-smooth no-scrollbar">
                <div className="md:p-4 min-h-full">
                    {children}
                </div>
            </main>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 pb-safe pt-2 px-2">
                <div className="flex overflow-x-auto no-scrollbar justify-between items-center">
                     {navItems.map(item => (
                        <MobileNavItem
                            key={item.page}
                            icon={item.icon}
                            label={item.label}
                            pageName={item.page}
                            currentPage={page}
                            setPage={setPage}
                            setCurrentLesson={setCurrentLesson}
                        />
                    ))}
                </div>
            </nav>
        </div>
    );
};
