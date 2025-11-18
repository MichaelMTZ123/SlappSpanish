
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
        <li onClick={() => { setPage(pageName); setCurrentLesson(null); }} className={`flex items-center p-3 my-1 rounded-xl cursor-pointer transition-all duration-200 ${currentPage === pageName ? 'bg-white/90 dark:bg-gray-700/90 text-blue-600 shadow-md scale-105' : 'text-gray-900 dark:text-gray-200 hover:bg-white/40 dark:hover:bg-gray-700/40 font-bold'}`}>
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
                currentPage === pageName ? 'text-blue-600 bg-white/80 dark:bg-gray-800/80 shadow-sm transform -translate-y-2' : 'text-gray-800 dark:text-gray-300 hover:bg-white/30'
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
        <div className="flex h-screen font-sans overflow-hidden relative">
            
            {/* Desktop Sidebar */}
            <aside className="w-72 glass-panel m-4 rounded-3xl flex-shrink-0 hidden md:flex flex-col shadow-2xl z-10">
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
                    <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-3 flex items-center gap-3 shadow-inner">
                        <img src={userProfile.pfp || `https://placehold.co/40x40`} alt="User" className="w-10 h-10 rounded-full border-2 border-white shadow-sm"/>
                        <div>
                            <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{userProfile.name}</p>
                            <p className="text-xs text-gray-700 dark:text-gray-300">{userProfile.coins || 0} Coins</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-y-auto pb-24 md:pb-0 relative z-0 scroll-smooth no-scrollbar">
                <div className="md:p-4 min-h-full">
                    {children}
                </div>
            </main>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-4 left-4 right-4 glass-panel rounded-2xl shadow-2xl z-20">
                <div className="flex overflow-x-auto p-2 no-scrollbar justify-between items-center">
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
