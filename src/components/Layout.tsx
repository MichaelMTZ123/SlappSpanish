/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { Home, BookOpen, MessageSquare, Trophy, User, Gamepad2, Users, Library, BellRing } from 'lucide-react';
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
        <li onClick={() => { setPage(pageName); setCurrentLesson(null); }} className={`flex items-center p-3 my-1 rounded-lg cursor-pointer transition-colors ${currentPage === pageName ? 'bg-blue-500 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
            <Icon className="w-6 h-6" />
            <span className="ms-4 font-semibold">{t(label)}</span>
        </li>
    );
};

const MobileNavItem: React.FC<NavItemProps> = ({ icon: Icon, label, pageName, currentPage, setPage, setCurrentLesson }) => {
    const { t } = useTranslation();
    return (
        <button
            onClick={() => { setPage(pageName); setCurrentLesson(null); }}
            className={`flex flex-col items-center justify-start flex-shrink-0 w-20 text-center p-2 transition-colors duration-200 h-16 ${
                currentPage === pageName ? 'text-blue-600' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg'
            }`}
        >
            <Icon className="w-6 h-6 mb-1" />
            <span className="text-xs">{t(label)}</span>
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
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 font-sans">
            {/* Desktop Sidebar */}
            <aside className="w-64 bg-white dark:bg-gray-800 shadow-md dark:shadow-none dark:border-r dark:border-gray-700 flex-shrink-0 hidden md:flex flex-col">
                <div className="flex items-center justify-center p-4 border-b dark:border-gray-700">
                    <SlothMascot className="w-10 h-10" />
                    <span className="ms-2 text-2xl font-bold text-gray-800 dark:text-gray-100">{t('appName')}</span>
                </div>
                <nav className="flex-grow p-4">
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
                <div className="p-4 border-t dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
                    <p>{t('welcomeUser')} {userProfile.name || 'Learner'}!</p>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-y-auto pb-20 md:pb-0">
                {children}
            </main>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-[0_-2px_5px_rgba(0,0,0,0.05)] border-t dark:border-gray-700 z-10">
                <div className="flex overflow-x-auto p-1 no-scrollbar">
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